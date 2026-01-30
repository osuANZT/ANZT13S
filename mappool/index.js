import { loadBeatmaps, findBeatmap } from "../_shared/core/beatmaps.js"
import { loadMatches, findMatch } from "../_shared/core/matches.js"
import { toggleStars, setDefaultStarCount, updateStarCount, isStarOn } from "../_shared/core/stars.js"
import { loadTeams, findTeam } from "../_shared/core/teams.js"
import { createTosuWsSocket } from "../_shared/core/websocket.js"

// Star Containers
const redTeamStarContainerEl = document.getElementById("red-team-star-container")
const blueTeamStarContainerEl = document.getElementById("blue-team-star-container")

// Pick Container
const pickContainerEl = document.getElementById("pick-container")

// Mappool Management Maps
const mappoolManagementMapsEl = document.getElementById("mappool-management-maps")

// Match Select
const matchSelectEl = document.getElementById("match-select")

// Load mappool
let bestOf = 0
let banCount = 0
const roundNameEl = document.getElementById("round-name")
let allBeatmaps = []
let allTeams = []
let allMatches = []

Promise.all([loadBeatmaps(), loadTeams(), loadMatches()]).then(([beatmaps, teams, matches]) => {
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

    // Load teams and matches
    allTeams = teams
    allMatches = matches

    // Load matches into match selection
    for (let i = 0; i < matches.length; i++) {
        const option = document.createElement("option")
        option.setAttribute("value", matches[i].id)
        option.textContent = `${shortenString(matches[i].team_a)} vs ${shortenString(matches[i].team_b)}`
        matchSelectEl.append(option)
    }
})

// Shorten string
const shortenString = str => str.length > 10 ? str.slice(0, 10) + "..." : str

// Ban Containers
const teamRedBanContainerEl = document.getElementById("team-red-ban-container")
const teamBlueBanContainerEl = document.getElementById("team-blue-ban-container")

// Current pick tile
let currentPickTile

// Current map
const currentMapBackgroundImageEl = document.getElementById("current-map-background-image")
const currentMapCategoryImageEl = document.getElementById("current-map-category-image")
const currentMapArtistTitleEl= document.getElementById("current-map-artist-title")
const currentMapArtistEl = document.getElementById("current-map-artist")
const currentMapTitleEl = document.getElementById("current-map-title")
const currentMapMappedByEl= document.getElementById("current-map-mapped-by")
const currentMapMapperNameEl = document.getElementById("current-map-mapper-name")
const currentMapPickerEl = document.getElementById("current-map-picker")
const currentMapWinResultEl = document.getElementById("current-map-win-result")
const currentMapWinScoresEl = document.getElementById("current-map-win-scores")

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
        teamBlueBanContainerEl.querySelector(`[data-id="${currentMapId}"]`) ||
        pickContainerEl.querySelector(`[data-id="${currentMapId}"]`)
    )
    if (mapCheck) return

    // If ban
    if (action === "ban") {
        const currentElement = team === "red" ? teamRedBanContainerEl : teamBlueBanContainerEl
        currentElement.style.display = "flex"

        if (currentElement.childElementCount < 1 + banCount) {
            const categoryImage = document.createElement("img")
            categoryImage.setAttribute("src", `../_shared/assets/category-images/${currentMap.mod.toUpperCase()}${currentMap.order}.png`)
            categoryImage.dataset.id = currentMap.beatmap_id
            currentElement.append(categoryImage)
        }
    }

    // If pick
    if (action === "pick") {
        let mapsFound = 0
        // Set Tile
        for (let i = 0; i < bestOf; i++) {
            let currentTile = pickContainerEl.children[i]
            if (pickContainerEl.children[i].hasAttribute("data-id")) continue
            currentTile.style.display = "block"
            currentTile.dataset.id = currentMap.beatmap_id
            currentTile.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`
            currentTile.children[0].setAttribute("src", `../_shared/assets/category-images/${currentMap.mod.toUpperCase()}${currentMap.order}.png`)
            currentTile.children[3].setAttribute("src", `static/pick-bgs/${team}-pick-bg.png`)
            currentTile.children[4].textContent = `${team.toUpperCase()} PICK`
            currentPickTile = currentTile
            mapsFound = 1
            break
        }

        // Set top information
        if (mapsFound !== 0) {
            // Set content
            currentMapBackgroundImageEl.setAttribute("src", `https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg`)
            currentMapCategoryImageEl.setAttribute("src", `../_shared/assets/category-images/${currentMap.mod.toUpperCase()}${currentMap.order}.png`)
            currentMapArtistEl.textContent = currentMap.artist
            currentMapTitleEl.textContent = currentMap.title
            currentMapMapperNameEl.textContent = currentMap.creator
            currentMapPickerEl.setAttribute("src", `static/picks/${team}-pick.png`)
            currentMapPickerEl.style.top = "535px"
            currentMapPickerEl.style.height = "65px"

            // Set display
            currentMapArtistTitleEl.style.display = "block"
            currentMapMappedByEl.style.display = "block"
            currentMapWinResultEl.style.display = "none"
            currentMapWinScoresEl.style.display = "none"
        }
    }
}

// Team Names
const teamRedNameEl = document.getElementById("team-red-name")
const teamBlueNameEl = document.getElementById("team-blue-name")
let currentTeamRedName, currentTeamBlueName

// Variables
let noOfClients, currentRedScore, currentBlueScore, checkedWinner = false

// Socket
const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    if (noOfClients !== data.tourney.clients.length) {
        noOfClients = data.tourney.clients.length
    }

    if (noOfClients > 0) {
        // If in gameplay or results
        if (data.beatmap.time.live < data.beatmap.time.lastObject) {
            currentRedScore = 0
            currentBlueScore = 0
            for (let i = 0; i < noOfClients; i++) {
                const score = data.tourney.clients[i].play.score
                if (data.tourney.clients[i].team === "left") currentRedScore += score
                else currentBlueScore += score
            }
            checkedWinner = false
        } else {
            if (!checkedWinner && currentPickTile && isStarOn()) {
                checkedWinner = true

                const winner = currentRedScore > currentBlueScore ? "red" : currentBlueScore > currentRedScore ? "blue" : undefined
                console.log(winner)
                if (winner) {
                    console.log(currentPickTile.children[2])
                    currentPickTile.children[2].setAttribute("src", `static/winner-crowns/winner-${winner}-map.png`)
                    currentPickTile.children[2].style.display = "block"
                }
            }
        }
    } else {
        // If in main lobby scene
        currentRedScore = 0
        currentBlueScore = 0
        checkedWinner = false
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

// Apply Match button
const applyMatchButtonEl = document.getElementById("apply-match")

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

    // Apply match button
    applyMatchButtonEl.addEventListener("click", () => applyMatch())
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

// Apply Match
async function applyMatch() {
    const match = await findMatch(matchSelectEl.value)
    if (!match) return

    // Team A
    currentTeamRedName = match.team_a
    teamRedNameEl.textContent = currentTeamRedName

    // Team B
    currentTeamBlueName = match.team_b
    teamBlueNameEl.textContent = currentTeamBlueName
}