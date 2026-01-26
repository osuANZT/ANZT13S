import { loadBeatmaps, findBeatmap } from "../_shared/core/beatmaps.js"
import { toggleStars, setDefaultStarCount, updateStarCount, isStarOn } from "../_shared/core/stars.js"
import { createTosuWsSocket } from "../_shared/core/websocket.js"

// Star Containers
const redTeamStarContainerEl = document.getElementById("red-team-star-container")
const blueTeamStarContainerEl = document.getElementById("blue-team-star-container")

// Pick Container
const pickContainerEl = document.getElementById("pick-container")

// Mappool Management Maps
const mappoolManagementMapsEl = document.getElementById("mappool-management-maps")

// Load mappool
let bestOf = 0
let banCount = 0
const roundNameEl = document.getElementById("round-name")
let allBeatmaps = []
Promise.all([loadBeatmaps()]).then(([beatmaps]) => {
    // Load beatmaps
    allBeatmaps = beatmaps.beatmaps
    roundNameEl.textContent = `// ${beatmaps.roundName} mappool`

    switch (beatmaps.roundName) {
        case "RO24": case "RO16":
            bestOf = 9
            banCount = 1
            break
        case "QF": case "SF":
            bestOf = 11
            banCount = 2
            break
        case "F": case "GF":
            bestOf = 13
            banCount = 2
            break
    }

    // Set default star count
    setDefaultStarCount(bestOf, redTeamStarContainerEl, blueTeamStarContainerEl)

    // Create pick tiles
    for (let i = 0; i < bestOf; i++) {
        const pickTile = document.createElement("div")
        pickTile.classList.add("pick-tile")

        // Pick tile category
        const pickTileCategory = document.createElement("img")
        pickTileCategory.classList.add("pick-tile-category", "absolute-center-x")

        // Pick Tile Border
        const pickTileBorder = document.createElement("img")
        pickTileBorder.classList.add("pick-tile-border")
        pickTileBorder.setAttribute("src", "static/panel-border.png")

        // Pick Tile Winner Crown
        const pickTileWinnerCrown = document.createElement("img")
        pickTileWinnerCrown.classList.add("pick-tile-winner-crown", "absolute-center-x")

        // Pick Tile Bottom BG
        const pickTileBottomBg = document.createElement("img")
        pickTileBottomBg.classList.add("pick-tile-bottom-bg")

        // Pick Tile Bottom Text
        const pickTileBottomText = document.createElement("div")
        pickTileBottomText.classList.add("pick-tile-bottom-text")

        pickTile.append(pickTileCategory, pickTileBorder, pickTileWinnerCrown, pickTileBottomBg, pickTileBottomText)
        pickContainerEl.append(pickTile)
    }

    // Create map pick buttons
    for (let i = 0; i < allBeatmaps.length; i++) {
        const button = document.createElement("button")
        button.addEventListener("mousedown", mapClickEvent)
        button.addEventListener("contextmenu", function(event) {event.preventDefault()})
        button.classList.add("sidebar-button")
        button.dataset.id = allBeatmaps[i].beatmap_id
        button.textContent = `${allBeatmaps[i].mod}${allBeatmaps[i].order}`
        mappoolManagementMapsEl.append(button)
    }
})

// Ban Containers
const teamRedBanContainerEl = document.getElementById("team-red-ban-container")
const teamBlueBanContainerEl = document.getElementById("team-blue-ban-container")

// Map Click Event
function mapClickEvent(event) {
    // Find map
    const currentMapId = this.dataset.id
    const currentMap = findBeatmap(currentMapId)
    if (!currentMap) return

    // Team
    let team
    if (event.button === 0) team = "red"
    else if (event.button === 2) team = "blue"
    if (!team) return

    // Action
    let action = "pick"
    if (event.ctrlKey) action = "ban"

    // Check if map exists in bans
    const mapCheck = !!(
        teamRedBanContainerEl.querySelector(`[data-id="${currentMapId}"]`) ||
        teamBlueBanContainerEl.querySelector(`[data-id="${currentMapId}"]`)
    )
    if (mapCheck) return

    // If ban
    if (action === "ban") {
        const currentElement = team === "red" ? teamRedBanContainerEl : teamBlueBanContainerEl
        currentElement.style.display = "flex"

        if (currentElement.childElementCount < 1 + banCount) {
            const categoryImage = document.createElement("img")
            categoryImage.setAttribute("src", `../_shared/assets/category-images/${currentMap.mod.toUpperCase()}${currentMap.order}.png`)
            currentElement.append(categoryImage)
        }
    }
}

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
    if (currentTeamRedName !== data.tourney.team.left) {
        currentTeamRedName = data.tourney.team.left
        teamRedNameEl.textContent = currentTeamRedName
    }
    if (currentTeamBlueName !== data.tourney.team.right) {
        currentTeamBlueName = data.tourney.team.right
        teamBlueNameEl.textContent = currentTeamBlueName
    }
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