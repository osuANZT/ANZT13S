import { loadShowcaseBeatmaps, findShowcaseBeatmap } from "../_shared/core/beatmaps.js"
import { createTosuWsSocket } from "../_shared/core/websocket.js"
import { setLengthDisplay } from "../_shared/core/utils.js"

// Load beatmaps
const showcaseRoundTextEl = document.getElementById("showcase-round-text")
let allShowcaseBeatmaps = []
Promise.all([loadShowcaseBeatmaps()]).then(([showcaseBeatmaps]) => {
    allShowcaseBeatmaps = showcaseBeatmaps.beatmaps
    showcaseRoundTextEl.textContent = `// ${showcaseBeatmaps.roundName} Showcase`
})

// Vinyl Container
const vinylContainerEl = document.getElementById("vinyl-container")
// Now Playing Indeitifer
const nowPlayingIdentifierEl = document.getElementById("now-playing-identifier")
// Now Playing Stats Short
const nowPlayingStatCsEl = document.getElementById("now-playing-stat-cs")
const nowPlayingStatArEl = document.getElementById("now-playing-stat-ar")
const nowPlayingStatOdEl = document.getElementById("now-playing-stat-od")
const nowPlayingStatSrEl = document.getElementById("now-playing-stat-sr")
// Now Playing Stats Long
const nowPlayingStatLenEl = document.getElementById("now-playing-stat-len")
const nowPlayingStatBpmEl = document.getElementById("now-playing-stat-bpm")
const nowPlayingStatCirclesEl = document.getElementById("now-playing-stat-circles")
const nowPlayingStatSlidersEl = document.getElementById("now-playing-stat-sliders")
// Now Playing Replayer Details
const nowPlayingReplayerIconEl = document.getElementById("now-playing-replayer-icon")
const nowPlayingReplayerNameEl = document.getElementById("now-playing-replayer-name")
let currentReplayerName
// Now Playing Metadata
const vinylMapEl = document.getElementById("vinyl-map")
const nowPlayingMetadataArtistEl = document.getElementById("now-playing-metadata-artist")
const nowPlayingMetadataTitleEl = document.getElementById("now-playing-metadata-title")
const nowPlayingMetadataDifficultyEl = document.getElementById("now-playing-metadata-difficulty")
const nowPlayingMetadataMapperEl = document.getElementById("now-playing-metadata-mapper")
let currentMapId, currentMapChecksum

// Strains
const progressChart = document.getElementById("progress")
let tempStrains, seek, fullTime, onepart
let changeStats = false
let statsCheck = false
let last_strain_update = 0

window.onload = function () {
	let ctx = document.getElementById('strain').getContext('2d')
	window.strainGraph = new Chart(ctx, config)

	let ctxProgress = document.getElementById('strain-progress').getContext('2d')
	window.strainGraphProgress = new Chart(ctxProgress, configProgress)
}

// Socket
const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Stats
    const beatmapData = data.beatmap
    const beatmapDataStats = beatmapData.stats
    nowPlayingStatCsEl.textContent = beatmapDataStats.cs.converted.toFixed(1)
    nowPlayingStatArEl.textContent = beatmapDataStats.ar.converted.toFixed(1)
    nowPlayingStatOdEl.textContent = beatmapDataStats.od.converted.toFixed(1)
    nowPlayingStatSrEl.textContent = beatmapDataStats.stars.total.toFixed(2)
    // TODO: For Length, get original BPM of the map, then current BPM. then do conversion for length
    nowPlayingStatLenEl.textContent = setLengthDisplay(Math.round((beatmapData.time.lastObject - beatmapData.time.firstObject) / 1000))
    nowPlayingStatBpmEl.textContent = beatmapDataStats.bpm.common

    // Changing Replayer Names
    if (currentReplayerName !== data.resultsScreen.playerName && data.state.number === 7 && data.resultsScreen.playerName !== "") {
        changeReplayerName(data.resultsScreen.playerName)
    }
    if (currentReplayerName !== data.play.playerName && data.state.number === 2) {
        changeReplayerName(data.play.playerName)
    }
    if (data.state.number !== 2 && data.state.number !== 7) {
        changeReplayerName("")
    }

    // Set map details
    if ((currentMapId !== beatmapData.id || currentMapChecksum !== beatmapData.checksum) && allShowcaseBeatmaps) {
        currentMapId = beatmapData.id
        currentMapChecksum = beatmapData.checksum
        
        const showcaseBeatmap = findShowcaseBeatmap(currentMapId)
        if (showcaseBeatmap) {
            // Update right and bottom according to the new map
            nowPlayingIdentifierEl.style.display = "block"
            nowPlayingIdentifierEl.setAttribute("src", `static/category-images/${showcaseBeatmap.mod}${showcaseBeatmap.order}.png`)
            vinylContainerEl.style.backgroundColor = `var(--vinyl-${showcaseBeatmap.mod.toLowerCase()}-color)`
        } else {
            nowPlayingIdentifierEl.style.display = "none"
            vinylContainerEl.style.backgroundColor = "transparent"
        }
        
        // Objects
        const beatmapDataStatsObjects = beatmapDataStats.objects
        nowPlayingStatCirclesEl.textContent = beatmapDataStatsObjects.circles
        nowPlayingStatSlidersEl.textContent = beatmapDataStatsObjects.sliders

        // Metadata
        vinylMapEl.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${beatmapData.set}/covers/cover.jpg")`
        nowPlayingMetadataArtistEl.textContent = beatmapData.artist
        nowPlayingMetadataTitleEl.textContent = beatmapData.title
        nowPlayingMetadataDifficultyEl.textContent = beatmapData.version
        nowPlayingMetadataMapperEl.textContent = beatmapData.mapper
    }

    const fullStrains = data.performance.graph.series[0].data.map((num, index) => num + data.performance.graph.series[1].data[index] + data.performance.graph.series[2].data[index] + data.performance.graph.series[3].data[index]);
    if (tempStrains != JSON.stringify(fullStrains) && window.strainGraph) {
        tempStrains = JSON.stringify(fullStrains)
        if (fullStrains) {
            let temp_strains = smooth(fullStrains, 2)
			let new_strains = []
			for (let i = 0; i < 60; i++) {
				new_strains.push(temp_strains[Math.floor(i * (temp_strains.length / 60))])
			}
			new_strains = [0, ...new_strains, 0]

			config.data.datasets[0].data = new_strains
			config.data.labels = new_strains
			config.options.scales.y.max = Math.max(...new_strains)
			configProgress.data.datasets[0].data = new_strains
			configProgress.data.labels = new_strains
			configProgress.options.scales.y.max = Math.max(...new_strains)
			window.strainGraph.update()
			window.strainGraphProgress.update()
        } else {
			config.data.datasets[0].data = []
			config.data.labels = []
			configProgress.data.datasets[0].data = []
			configProgress.data.labels = []
			window.strainGraph.update()
			window.strainGraphProgress.update()
		}
    }

    let now = Date.now()
	if (fullTime !== data.beatmap.time.mp3Length) { fullTime = data.beatmap.time.mp3Length; onepart = 1209 / fullTime }
	if (seek !== data.beatmap.time.live && fullTime && now - last_strain_update > 300) {
		last_strain_update = now
		seek = data.beatmap.time.live

		if (data.state.number !== 2) {
			progressChart.style.maskPosition = '-1209px 0px'
			progressChart.style.webkitMaskPosition = '-1209px 0px'
		}
		else {
			let maskPosition = `${-1209 + onepart * seek}px 0px`
			progressChart.style.maskPosition = maskPosition
			progressChart.style.webkitMaskPosition = maskPosition
		}
	}
}

function changeReplayerName(name) {
    currentReplayerName = name
    nowPlayingReplayerIconEl.setAttribute("src", `https://a.ppy.sh/${2}`)
    nowPlayingReplayerNameEl.textContent = currentReplayerName
}

// Configs are for strain graphs
let config = {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			borderColor: 'rgba(245, 245, 245, 0)',
			backgroundColor: 'rgba(4, 30, 124, 0.25)',
			data: [],
			fill: true,
			stepped: false,
		}]
	},
	options: {
		tooltips: { enabled: false },
		legend: { display: false, },
		elements: { point: { radius: 0 } },
		responsive: false,
		scales: {
			x: { display: false, },
			y: {
				display: false,
				min: 0,
				max: 100
			}
		},
		animation: { duration: 0 }
	}
}

let configProgress = {
	type: 'line',
	data: {
		labels: [],
		datasets: [{
			borderColor: 'rgba(245, 245, 245, 0)',
			backgroundColor: 'rgb(4, 30, 124)',
			data: [],
			fill: true,
			stepped: false,
		}]
	},
	options: {
		tooltips: { enabled: false },
		legend: { display: false, },
		elements: { point: { radius: 0 } },
		responsive: false,
		scales: {
			x: { display: false, },
			y: {
				display: false,
				min: 0,
				max: 100
			}
		},
		animation: { duration: 0 }
	}
}