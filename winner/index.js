import { loadBeatmaps, findBeatmap } from "../_shared/core/beatmaps.js"
import { loadTeams, findTeam } from "../_shared/core/teams.js"
import { getCookie } from "../_shared/core/utils.js"

// Load everything
const roundNameEl = document.getElementById("round-name")
let allBeatmaps
let allTeams
Promise.all([loadBeatmaps(), loadTeams()]).then(([beatmaps, teams]) => {
    // Load beatmaps
    allBeatmaps = beatmaps.beatmaps
    roundNameEl.textContent = `// ${beatmaps.roundName} result`

    // Teams
    allTeams = teams
})

// Text result
const resultTextLeftEl = document.getElementById("result-text-left")
const resultTextRightEl = document.getElementById("result-text-right")
// Scores
const scoreLeftEl = document.getElementById("score-left")
const scoreRightEl = document.getElementById("score-right")
let currentRedStarCount, currentBlueStarCount, previousRedStarCount, previousBlueStarCount, renderImage = true

// Team info
const teamRedNameEl = document.getElementById("team-red-name")
const teamBlueNameEl = document.getElementById("team-blue-name")
let currentTeamRedName, currentTeamBlueName, previousTeamRedName, previousTeamBlueName
let currentTeamRed, currentTeamBlue

// Pick container
const pickContainerEl = document.getElementById("pick-container")

// Best of
let currentBestOf, previousBestOf
let currentPickString, previousPickString
let currentWinnerString, previousWinnerString

setInterval(async () => {
    // Get star count
    currentRedStarCount = Number(getCookie("redStarCount"))
    currentBlueStarCount = Number(getCookie("blueStarCount"))

    renderImage = false

    // Set star counts
    if (previousRedStarCount !== currentRedStarCount) {
        previousRedStarCount = currentRedStarCount
        scoreLeftEl.textContent = currentRedStarCount
        renderImage = true
    }
    if (previousBlueStarCount !== currentBlueStarCount) {
        previousBlueStarCount = currentBlueStarCount
        scoreRightEl.textContent = currentBlueStarCount
        renderImage = true
    }

    // Set result texts
    if (renderImage) {
        if (currentRedStarCount > currentBlueStarCount) {
            resultTextLeftEl.style.display = "block"
            resultTextRightEl.style.display = "block"
            resultTextLeftEl.setAttribute("src", "static/result-text/winner.png")
            resultTextRightEl.setAttribute("src", "static/result-text/loser.png")
        } else if (currentRedStarCount === currentBlueStarCount) {
            resultTextLeftEl.style.display = "none"
            resultTextRightEl.style.display = "none"
        } else if (currentRedStarCount < currentBlueStarCount) {
            resultTextLeftEl.style.display = "block"
            resultTextRightEl.style.display = "block"
            resultTextLeftEl.setAttribute("src", "static/result-text/loser.png")
            resultTextRightEl.setAttribute("src", "static/result-text/winner.png")
        }
    }

        // Set team name information
    currentTeamRedName = getCookie("currentTeamRedName")
    currentTeamBlueName = getCookie("currentTeamBlueName")

    if (currentTeamRedName !== previousTeamRedName) {
        previousTeamRedName = currentTeamRedName
        teamRedNameEl.textContent = currentTeamRedName
        currentTeamRed = await findTeam(currentTeamRedName)

        // Player details
        for (let i = 1; i < 3; i++) {
            document.getElementById(`player${i}-name`).textContent = currentTeamRed[`player${i}-name`]
            document.getElementById(`player${i}-rank`).textContent = `#${currentTeamRed[`player${i}-rank`]}`
        }
    }
    if (currentTeamBlueName !== previousTeamBlueName) {
        previousTeamBlueName = currentTeamBlueName
        teamBlueNameEl.textContent = currentTeamBlueName
        currentTeamBlue = await findTeam(currentTeamRedName)

        // Player details
        for (let i = 1; i < 3; i++) {
            document.getElementById(`player${i + 2}-name`).textContent = currentTeamRed[`player${i}-name`]
            document.getElementById(`player${i + 2}-rank`).textContent = `#${currentTeamRed[`player${i}-rank`]}`
        }
    }

    // Best Of
    currentBestOf = Number(getCookie("totalBestOf"))
    currentPickString = localStorage.getItem("currentPickString") || ""
    currentWinnerString = localStorage.getItem("currentWinnerString") || ""
    if (previousBestOf !== currentBestOf ||
        previousPickString !== currentPickString
    ) {
        pickContainerEl.innerHTML = ""
        previousBestOf = currentBestOf
        for (let i = 0; i < currentBestOf; i++) {
            const pickTile = document.createElement("div")
            pickTile.classList.add("pick-tile")
            pickTile.style.display = "none"

            const pickTileBorder = document.createElement("img")
            pickTileBorder.setAttribute("src", "../_shared/assets/pick-container/panel-border.png")

            const pickTileWinnerCrown = document.createElement("img")
            pickTileWinnerCrown.classList.add("pick-tile-winner-crown", "absolute-center-x")

            pickTile.append(pickTileBorder, pickTileWinnerCrown)
            pickContainerEl.append(pickTile)
        }

        previousPickString = currentPickString
        const currentPickArray = currentPickString.split("|")
        
        for (let i = 0; i < pickContainerEl.childElementCount; i++) {
            if (currentPickArray[i] === "") continue
            const currentMap = await findBeatmap(Number(currentPickArray[i]))
            const currentTile = pickContainerEl.children[i]
            currentTile.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`
            currentTile.style.display = "block"
        }

        previousWinnerString = currentWinnerString
        const currentWinnerArray = currentWinnerString.split("|")

        for (let i = 0; i < pickContainerEl.childElementCount; i++) {
            if (currentWinnerArray[i] === "") continue
            const currentTile = pickContainerEl.children[i]
            currentTile.children[1].setAttribute("src", `../_shared/assets/winner-crowns/winner-${currentWinnerArray[i]}-map.png`)
        }
    }
}, 200)