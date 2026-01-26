import { loadBeatmaps, findBeatmap } from "../_shared/core/beatmaps.js"
import { toggleStars, setDefaultStarCount, updateStarCount, isStarOn } from "../_shared/core/stars.js"
import { createTosuWsSocket } from "../_shared/core/websocket.js"

// Star Containers
const redTeamStarContainerEl = document.getElementById("red-team-star-container")
const blueTeamStarContainerEl = document.getElementById("blue-team-star-container")

// Load mappool
let bestOf = 0
const roundNameEl = document.getElementById("round-name")
let allBeatmaps = []
Promise.all([loadBeatmaps()]).then(([beatmaps]) => {
    // Load beatmaps
    allBeatmaps = beatmaps.beatmaps
    roundNameEl.textContent = `// ${beatmaps.roundName} mappool`

    switch (beatmaps.roundName) {
        case "RO24": case "RO16":
            bestOf = 9
            break
        case "QF": case "SF":
            bestOf = 11
            break
        case "F": case "GF":
            bestOf = 13
            break
    }

    // Set default star count
    setDefaultStarCount(bestOf, redTeamStarContainerEl, blueTeamStarContainerEl)
})

// Team Names
const teamRedNameEl = document.getElementById("team-red-name")
const teamBlueNameEl = document.getElementById("team-blue-name")
let currentTeamRedName, currentTeamBlueName

// Socket
const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Setting team names
    // if (currentTeamRedName !== data.tourney.team.left) {
    //     currentTeamRedName = data.tourney.team.left
    //     teamRedNameEl.textContent = currentTeamRedName
    // }
    // if (currentTeamBlueName !== data.tourney.team.right) {
    //     currentTeamBlueName = data.tourney.team.right
    //     teamBlueNameEl.textContent = currentTeamBlueName
    // }
}

// Update Star Count Buttons
const setStarRedPlusEl = document.getElementById("set-star-red-plus")
const setStarRedMinusEl = document.getElementById("set-star-red-minus")
const setStarBluePlusEl = document.getElementById("set-star-blue-plus")
const setStarBlueMinusEl = document.getElementById("set-star-blue-minus")

// Next autopick
const nextAutopickNextEl = document.getElementById("next-autopick-text")
const nextAutopickRedEl = document.getElementById("next-autopick-red")
const nextAutopickBlueEl = document.getElementById("next-autopick-blue")
const toggleAutopickButtonEl = document.getElementById("toggle-autopick-button")
const toggleAutopickOnOffEl = document.getElementById("toggle-autopick-on-off")
let isAutopickOn = false, currentPicker = "red"

// Toggle stars button
const toggleStarButtonEl = document.getElementById("toggle-stars-button")
const toggleStarsOnOffEl = document.getElementById("toggle-stars-on-off")
document.addEventListener("DOMContentLoaded", () => {
    toggleStarButtonEl.addEventListener("click", () => toggleStars(toggleStarsOnOffEl, toggleStarButtonEl, redTeamStarContainerEl, blueTeamStarContainerEl))
    document.cookie = `toggleStarContainers=${true}; path=/`

    // Update star count buttons
    setStarRedPlusEl.addEventListener("click", () => updateStarCount("red", "plus", redTeamStarContainerEl, blueTeamStarContainerEl, currentTeamRedName, currentTeamBlueName))
    setStarRedMinusEl.addEventListener("click", () => updateStarCount("red", "minus", redTeamStarContainerEl, blueTeamStarContainerEl, currentTeamRedName, currentTeamBlueName))
    setStarBluePlusEl.addEventListener("click", () => updateStarCount("blue", "plus", redTeamStarContainerEl, blueTeamStarContainerEl, currentTeamRedName, currentTeamBlueName))
    setStarBlueMinusEl.addEventListener("click", () => updateStarCount("blue", "minus", redTeamStarContainerEl, blueTeamStarContainerEl, currentTeamRedName, currentTeamBlueName))

    // Toggle Autopick button
    toggleAutopickButtonEl.addEventListener("click", function() {
        isAutopickOn = !isAutopickOn
        toggleAutopickOnOffEl.textContent = isAutopickOn ? "ON" : "OFF"
        toggleAutopickButtonEl.classList.toggle("toggle-on", isAutopickOn)
        toggleAutopickButtonEl.classList.toggle("toggle-off", !isAutopickOn)
    })

    // Set Autopicker Buttons
    nextAutopickRedEl.addEventListener("click", () => setAutopicker("red"))
    nextAutopickBlueEl.addEventListener("click",() => setAutopicker("blue"))

    // Current Picker
    currentPickerRedEl.addEventListener("click", () => updateCurrentPicker("red"))
    currentPickerBlueEl.addEventListener("click", () => updateCurrentPicker("blue"))
    currentPickerNoneEl.addEventListener("click", () => updateCurrentPicker("none"))
    currentPickerNoneEl.click()
})

// Setting current picker
const currentPickerTextEl = document.getElementById("current-picker-text")
const currentPickerRedEl = document.getElementById("current-picker-red")
const currentPickerBlueEl = document.getElementById("current-picker-blue")
const currentPickerNoneEl = document.getElementById("current-picker-none")
function updateCurrentPicker(side) {
    currentPickerTextEl.textContent = side
    document.cookie = `currentPicker=${side}; path=/`
}

// Set Autopicker
function setAutopicker(picker) {
    currentPicker = picker
    nextAutopickNextEl.textContent = `${currentPicker.substring(0, 1).toUpperCase()}${currentPicker.substring(1)}`
}