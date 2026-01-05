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

    if (currentReplayerName !== data.resultsScreen.playerName) {
        // Replayer Details
        currentReplayerName = data.resultsScreen.playerName
        nowPlayingReplayerIconEl.setAttribute("src", `https://a.ppy.sh/${2}`)
        nowPlayingReplayerNameEl.textContent = currentReplayerName
    }

    if (currentMapId !== beatmapData.id || currentMapChecksum !== beatmapData.checksum) {
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
}