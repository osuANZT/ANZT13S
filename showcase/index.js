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

// Socket
const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Stats
    nowPlayingStatCsEl.textContent = data.beatmap.stats.cs.converted.toFixed(1)
    nowPlayingStatArEl.textContent = data.beatmap.stats.ar.converted.toFixed(1)
    nowPlayingStatOdEl.textContent = data.beatmap.stats.od.converted.toFixed(1)
    nowPlayingStatSrEl.textContent = data.beatmap.stats.stars.total.toFixed(2)
    nowPlayingStatLenEl.textContent = setLengthDisplay(Math.round((data.beatmap.time.lastObject - data.beatmap.time.firstObject) / 1000))
    nowPlayingStatBpmEl.textContent = data.beatmap.stats.bpm.common
    nowPlayingStatCirclesEl.textContent = data.beatmap.stats.objects.circles
    nowPlayingStatSlidersEl.textContent = data.beatmap.stats.objects.sliders

    // TODO: For Length, get original BPM of the map, then current BPM. then do conversion for length
}