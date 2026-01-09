import { getCookie, setLengthDisplay } from "../_shared/core/utils.js"
import { createTosuWsSocket } from "../_shared/core/websocket.js"

// Now Playing Information
const vinylMapEl = document.getElementById("vinyl-map")
const nowPlayingMetadataArtistEl = document.getElementById("now-playing-metadata-artist")
const nowPlayingMetadataTitleEl = document.getElementById("now-playing-metadata-title")
const nowPlayingMetadataTimeCurrentEl = document.getElementById("now-playing-metadata-time-current")
const nowPlayingMetadataTimeMp3El = document.getElementById("now-playing-metadata-time-mp3")
let currentMapId, currentMapChecksum

const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    if (currentMapId !== data.beatmap.id || currentMapChecksum !== data.beatmap.checksum) {
        currentMapId = data.beatmap.id
        currentMapChecksum = data.beatmap.checksum

        vinylMapEl.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${data.beatmap.set}/covers/cover.jpg")`
        nowPlayingMetadataArtistEl.textContent = data.beatmap.artist
        nowPlayingMetadataTitleEl.textContent = data.beatmap.title
        nowPlayingMetadataTimeMp3El.textContent = setLengthDisplay(Math.round(data.beatmap.time.mp3Length / 1000))
    }
    nowPlayingMetadataTimeCurrentEl.textContent = setLengthDisplay(Math.round(data.beatmap.time.live / 1000))
}
// OBS Scene Stuff
const obs = new OBSWebSocket()
obs.connect('ws://localhost:4455')
    .then(() => {
        console.log('Connected to OBS')

        return obs.call('GetCurrentProgramScene')
    })
    .then(({ currentProgramSceneName }) => {
        updateStatusVideo(currentProgramSceneName)
    })

obs.on('CurrentProgramSceneChanged', data => {
    updateStatusVideo(data.sceneName)
})

// Update status video
const currentStatusEl = document.getElementById("current-status")
const currentStatusSourceEl = document.getElementById("current-status-source")
const streamTypeEl = document.getElementById("stream-type")
function updateStatusVideo(sceneName) {
    switch (sceneName) {
        case "Starting Soon":
            currentStatusSourceEl.setAttribute("src", "static/status/streamStartingSoon.webm")
            streamTypeEl.style.right = `937px`
            break
        case "Ending Soon":
            currentStatusSourceEl.setAttribute("src", "static/status/streamEndingSoon.webm")
            streamTypeEl.style.right = `940px`
            break
        case "Intermission":
            currentStatusSourceEl.setAttribute("src", "static/status/intermission.webm")
            streamTypeEl.style.right = `1075px`
            break
        case "Technical Difficulties":
            currentStatusSourceEl.setAttribute("src", "static/status/technicaldifficulties.webm")
            streamTypeEl.style.right = `900px`
            break
    }

    currentStatusEl.load()
    currentStatusEl.play()
}

// Set round
const roundNameEl = document.getElementById("round-name")
const matchTypeEl = document.getElementById("match-type")
matchTypeEl.value = getCookie("matchType")
roundNameEl.value = getCookie("roundName")
const setIdleTitle = () => {
    streamTypeEl.textContent = `// ${roundNameEl.value.toUpperCase()} ${matchTypeEl.value}`
    document.cookie = `matchType=${matchTypeEl.value}; path=/`
    document.cookie = `roundName=${roundNameEl.value}; path=/`
}

// Set title
if (matchTypeEl.value && roundNameEl.value) setIdleTitle()

// Bind Button to function
const applySettingsEl = document.getElementById("apply-settings")
window.onload = () => {
    applySettingsEl.addEventListener("click", setIdleTitle)
}