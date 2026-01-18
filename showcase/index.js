import { loadShowcaseBeatmaps, findShowcaseBeatmap } from "../_shared/core/beatmaps.js"
import { setLengthDisplay } from "../_shared/core/utils.js"
import { createTosuWsSocket } from "../_shared/core/websocket.js"

// Load beatmaps
const showcaseRoundTextEl = document.getElementById("showcase-round-text")
const mapIndentifiersContainerEl = document.getElementById("map-identifiers-container")
let allShowcaseBeatmaps = []
Promise.all([loadShowcaseBeatmaps()]).then(([showcaseBeatmaps]) => {
	// Load beatmaps
    allShowcaseBeatmaps = showcaseBeatmaps.beatmaps

	// Load Round Name
    showcaseRoundTextEl.textContent = `// ${showcaseBeatmaps.roundName} Showcase`

	for (let i = 0; i < allShowcaseBeatmaps.length; i++) {
		const rowId = `${allShowcaseBeatmaps[i].mod}-map-identifier-row`

		// Create map identifer row
		if (document.getElementById(rowId) === null) {
			const mapIdentifierRow = document.createElement("div")
			mapIdentifierRow.classList.add("map-identifier-row")
			mapIdentifierRow.setAttribute("id", rowId)
			mapIndentifiersContainerEl.append(mapIdentifierRow)
		}

		// Make span element
		const span = document.createElement("span")
		span.setAttribute("id", allShowcaseBeatmaps[i].beatmap_id)
		span.textContent = `${allShowcaseBeatmaps[i].mod}${allShowcaseBeatmaps[i].order}`
		document.getElementById(rowId).append(span)
	}
})

// Maps Shown Container 
const mapsShownContainerEl = document.getElementById("maps-shown-container")
// Video Gradient
const videoContainerEl = document.getElementById("video-container")
const videoGradientEl = document.getElementById("video-gradient")
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
// Now Playing Mods
const nowPlayingModsContainerEl = document.getElementById("now-playing-mods-container")
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
	let speedRate = 1
	if (data.resultsScreen.mods.rate !== 1) speedRate = data.resultsScreen.mods.rate
	else if (data.play.mods.rate !== 1) speedRate = data.play.mods.rate
    nowPlayingStatLenEl.textContent = setLengthDisplay(Math.round((beatmapData.time.lastObject - beatmapData.time.firstObject) / 1000 / speedRate))
    nowPlayingStatBpmEl.textContent = beatmapDataStats.bpm.common

    // Set map details
    if ((currentMapId !== beatmapData.id || currentMapChecksum !== beatmapData.checksum) && allShowcaseBeatmaps) {
        currentMapId = beatmapData.id
        currentMapChecksum = beatmapData.checksum

		// Reset map identifiers container
		for (let i = 0; i < allShowcaseBeatmaps.length; i++) {
			document.getElementById(allShowcaseBeatmaps[i].beatmap_id).style.color = "unset"
		}

		// Reset Now Playing Mods
		nowPlayingModsContainerEl.innerHTML = ""
        
        const showcaseBeatmap = findShowcaseBeatmap(currentMapId)
        if (showcaseBeatmap) {
			const modLowercase = showcaseBeatmap.mod.toLowerCase()
			// Video
			videoContainerEl.style.opacity = 1
			videoGradientEl.src = `static/category-gradients/${modLowercase}Gradient.webm`
			videoContainerEl.load()
			videoContainerEl.play()

			// Load the currently shown map into the "maps shown" tab
			// Reset Maps Shwon tab
			if (!mapsShownContainerEl.dataset.id || mapsShownContainerEl.dataset.id !== showcaseBeatmap.mod) {
				mapsShownContainerEl.innerHTML = ""
				mapsShownContainerEl.setAttribute("data-id", showcaseBeatmap.mod)
			} else {
				// Map Shown Wrapper
				const mapShownWrapper = document.createElement("div")
				mapShownWrapper.classList.add("map-shown-wrapper")
				// Map Shown Identifier
				const mapShownIdentifier = document.createElement("img")
				mapShownIdentifier.classList.add("map-shown-identifier")
				mapShownIdentifier.setAttribute("src", nowPlayingIdentifierEl.getAttribute("src"))
				// Map Shown Artist
				const mapShownArtist = document.createElement("div")
				mapShownArtist.classList.add("map-shown-metadata", "map-shown-artist")
				mapShownArtist.style.color = `var(--${modLowercase}-text-color)`
				mapShownArtist.textContent = nowPlayingMetadataArtistEl.textContent
				// Map Shown Title
				const mapShownTitle = document.createElement("div")
				mapShownTitle.classList.add("map-shown-metadata", "map-shown-title")
				mapShownTitle.textContent = nowPlayingMetadataTitleEl.textContent
				// Map Shown Difficulty
				const mapShownDifficulty = document.createElement("div")
				mapShownDifficulty.classList.add("map-shown-metadata", "map-shown-difficulty")
				mapShownDifficulty.style.color = `var(--${modLowercase}-text-color)`
				mapShownDifficulty.textContent = nowPlayingMetadataDifficultyEl.textContent
				// Map Shown Background
				const mapShownBackground = document.createElement("div")
				mapShownBackground.classList.add("map-shown-background")
				mapShownBackground.style.backgroundImage = getComputedStyle(vinylMapEl).backgroundImage
				// Map Shown Overlay
				const mapShownOverlay = document.createElement("div")
				mapShownOverlay.classList.add("map-shown-overlay")
				mapShownBackground.append(mapShownOverlay)
				// Append everything
				mapShownWrapper.append(mapShownIdentifier, mapShownArtist, mapShownTitle, mapShownDifficulty, mapShownBackground)
				mapsShownContainerEl.append(mapShownWrapper)
			}

			// Update right and bottom according to the new map
            nowPlayingIdentifierEl.style.display = "block"
            nowPlayingIdentifierEl.setAttribute("src", `static/category-images/${showcaseBeatmap.mod}${showcaseBeatmap.order}.png`)
            vinylContainerEl.style.backgroundColor = `var(--vinyl-${showcaseBeatmap.mod.toLowerCase()}-color)`
			document.getElementById(showcaseBeatmap.beatmap_id).style.color = "white"

			// Setting Now Playing Mods
			if (showcaseBeatmap.mods) {
				// Make main mods
				if (showcaseBeatmap.main_mods) {
					const mainMod = document.createElement("div")
					mainMod.classList.add("now-playing-mods-main")
					mainMod.textContent = showcaseBeatmap.main_mods
					nowPlayingModsContainerEl.append(mainMod)
				}
				
				// Sub mods
				const mods = showcaseBeatmap.mods.split("|")
				const modCustoms = showcaseBeatmap.mod_customs.split("|")

				for (let i = 0; i < mods.length; i++) {
					const modContainer = document.createElement("div")
					modContainer.classList.add("now-playing-mod-container")
					const modText = document.createElement("div")
					modText.textContent = mods[i]
					modText.classList.add("now-playing-mod-text")
					const modCustom = document.createElement("div")
					modCustom.classList.add("now-playing-mod-customs")
					modCustom.textContent = modCustoms[i]
					modContainer.append(modText, modCustom)
					nowPlayingModsContainerEl.append(modContainer)
				}
			}
			
        } else {
            nowPlayingIdentifierEl.style.display = "none"
            vinylContainerEl.style.backgroundColor = "transparent"

			// Video
			videoContainerEl.style.opacity = 0

			// Map Shown Container
			mapsShownContainerEl.innerHTML = ""
			mapsShownContainerEl.removeAttribute("data-id")
        }
        
        // Objects
        const beatmapDataStatsObjects = beatmapDataStats.objects
        nowPlayingStatCirclesEl.textContent = beatmapDataStatsObjects.circles
        nowPlayingStatSlidersEl.textContent = beatmapDataStatsObjects.sliders

        // Metadata
        vinylMapEl.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${beatmapData.set}/covers/cover.jpg")`
        nowPlayingMetadataArtistEl.textContent = beatmapData.artist
        nowPlayingMetadataTitleEl.textContent = beatmapData.title
        nowPlayingMetadataDifficultyEl.textContent = `[${beatmapData.version}]`
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