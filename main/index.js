import { getLogsApi } from "../_shared/core/apis.js"
import { findBeatmap, loadBeatmaps } from "../_shared/core/beatmaps.js"
import { updateChat } from "../_shared/core/chat.js"
import { toggleStarContainers, renderStars } from "../_shared/core/stars.js"
import { loadTeams, findTeam } from "../_shared/core/teams.js"
import { getCookie } from "../_shared/core/utils.js"
import { createTosuWsSocket } from "../_shared/core/websocket.js"

const roundNameEl = document.getElementById("round-name")
let allBeatmaps = []
Promise.all([loadBeatmaps(), loadTeams]).then(([beatmaps, teams]) => {
    // Load beatmaps
    allBeatmaps = beatmaps.beatmaps
    roundNameEl.textContent = `// ${beatmaps.roundName} gameplay`
})

// Image
const nowPlayingCategoryEl = document.getElementById("now-playing-category")
// Now Playing Metadata
const nowPlayingBackgroundEl = document.getElementById("now-playing-background")
const nowPlayingArtistEl = document.getElementById("now-playing-artist")
const nowPlayingTitleEl = document.getElementById("now-playing-title")
const nowPlayingVersionEl = document.getElementById("now-playing-version")
const nowPlayingMapperEl = document.getElementById("now-playing-mapper")
// Now Playing Stats
const nowPlayingCsNumberEl = document.getElementById("now-playing-cs-number")
const nowPlayingOdNumberEl = document.getElementById("now-playing-od-number")
const nowPlayingArNumberEl = document.getElementById("now-playing-ar-number")
const nowPlayingSrNumberEl = document.getElementById("now-playing-sr-number")
// Now Playing Categories
const nowPlayingStatsEl = document.getElementById("now-playing-stats")
const nowPlayingMetadataEl = document.getElementById("now-playing-metadata")
const nowPlayingMappedByEl = document.getElementById("now-playing-mapped-by")
let mapId, mapChecksum, foundMapInMappool = false, currentMap

// Bottom Containers
const chatContainerEl = document.getElementById("chat-container")
const playingScoreContainerEl = document.getElementById("playing-score-container")
let noOfClients, previousNoOfClients

// Scores
const scoreLeftEl = document.getElementById("score-left")
const scoreRightEl = document.getElementById("score-right")
// Score Difference
const scoreDifferenceLeftEl = document.getElementById("score-difference-left")
const scoreDifferenceRightEl = document.getElementById("score-difference-right")
// Score bar
const scoreBarLeftEl = document.getElementById("score-bar-left")
const scoreBarRightEl = document.getElementById("score-bar-right")
const scoreBarMaxWidth = 1280
// Winner Red Crown
const winnerRedCrownEl = document.getElementById("winner-red-crown")
const winnerBlueCrownEl = document.getElementById("winner-blue-crown")

// Animation
const animation = {
    // Score
    "scoreLeft": new CountUp(scoreLeftEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: ".", suffix: ""}),
    "scoreRight": new CountUp(scoreRightEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: ".", suffix: ""}),
    "scoreDifferenceLeft": new CountUp(scoreDifferenceLeftEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: ".", suffix: ""}),
    "scoreDifferenceRight": new CountUp(scoreDifferenceRightEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: ".", suffix: ""}),
}

// Chat variables
const chatDisplayWrapperEl = document.getElementById("chat-display-wrapper")
let chatLen

// Socket
const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    const beatmapData = data.beatmap
    if (mapId !== beatmapData.id || mapChecksum !== beatmapData.checksum) {
        mapId = beatmapData.id
        mapChecksum = beatmapData.checksum
        foundMapInMappool = false

        // Metadata
        nowPlayingBackgroundEl.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${beatmapData.set}/covers/cover.jpg")`
        nowPlayingArtistEl.textContent = beatmapData.artist
        nowPlayingTitleEl.textContent = beatmapData.title
        nowPlayingVersionEl.textContent = `[${beatmapData.version}]`
        nowPlayingMapperEl.textContent = beatmapData.mapper

        const currentMap = findBeatmap(mapId)
        if (currentMap) {
            foundMapInMappool = true

            // Stats
            nowPlayingCsNumberEl.textContent = currentMap.diff_size
            nowPlayingOdNumberEl.textContent = currentMap.diff_overall
            nowPlayingArNumberEl.textContent = currentMap.diff_approach
            nowPlayingSrNumberEl.textContent = currentMap.difficultyrating

            // Image
            nowPlayingCategoryEl.style.opacity = 1
            nowPlayingCategoryEl.setAttribute("src", `../_shared/assets/category-images/${currentMap.mod}${currentMap.order}.png`)

            // Adjust positions of other elements
            nowPlayingStatsEl.style.top = "76px"
            nowPlayingMetadataEl.style.top = "54px"
            nowPlayingMappedByEl.style.top = "79px"
        } else {
            // Image
            nowPlayingCategoryEl.style.opacity = 0

            // Adjust position of other elements
            nowPlayingStatsEl.style.top = `${(144 - nowPlayingStatsEl.clientHeight) / 2}px`
            nowPlayingMetadataEl.style.top = `${(144 - nowPlayingMetadataEl.clientHeight) / 2}px`
            nowPlayingMappedByEl.style.top = `${(144 - nowPlayingMappedByEl.clientHeight) / 2}px`
        }
    }

    // Stats if map not in mappool
    const beatmapStats = beatmapData.stats
    if (foundMapInMappool) {
        nowPlayingCsNumberEl.textContent = beatmapStats.cs.converted.toFixed(1)
        nowPlayingOdNumberEl.textContent = beatmapStats.od.converted.toFixed(1)
        nowPlayingArNumberEl.textContent = beatmapStats.ar.converted.toFixed(1)
        nowPlayingSrNumberEl.textContent = beatmapStats.stars.total.toFixed(2)
    }

    // Determine if chat or scores should be shown 
    noOfClients = data.tourney.clients.length
    if (noOfClients !== previousNoOfClients) {
        previousNoOfClients = noOfClients
        if (noOfClients !== 0) {
            chatContainerEl.style.opacity = 0
            playingScoreContainerEl.style.opacity = 1
        } else {
            chatContainerEl.style.opacity = 1
            playingScoreContainerEl.style.opacity = 0      
        }
    }

    if (noOfClients !== 0) {
        // Set scores
        let currentRedScore = 0
        let currentBlueScore = 0
        for (let i = 0; i < noOfClients; i++) {
            const score = data.tourney.clients[i].play.score
            if (data.tourney.clients[i].team === "left") currentRedScore += score
            else currentBlueScore += score
        }

        // Show scores
        animation.scoreLeft.update(currentRedScore)
        animation.scoreRight.update(currentBlueScore)

        // Show score difference
        const scoreDifference = Math.abs(currentRedScore - currentBlueScore)
        animation.scoreDifferenceLeft.update(-scoreDifference)
        animation.scoreDifferenceRight.update(-scoreDifference)

        // Score bar width
        let multiplier = 0.5
        if (currentMap) multiplier = currentMap.multiplier
        let scoreBarDifferencePercent = Math.min(scoreDifference / (450000 * multiplier), 1)
        let scoreBarRectangleWidth = Math.min(Math.pow(scoreBarDifferencePercent, 0.5) * scoreBarMaxWidth, scoreBarMaxWidth)

        // Crown opacity
        let crownDifferencePercent = Math.min(scoreDifference / (100000 * multiplier), 1)
        let crownOpacity = Math.min(Math.pow(crownDifferencePercent, 0.5), 1)

        // Score bar
        scoreBarLeftEl
        scoreBarRightEl

        // Do all graphical updates
        if (currentRedScore > currentBlueScore) {
            // Score lead class
            scoreLeftEl.classList.add("score-lead")
            scoreRightEl.classList.remove("score-lead")
            // Score difference
            scoreDifferenceLeftEl.style.opacity = 0
            scoreDifferenceRightEl.style.opacity = 1
            // Score bar
            scoreBarLeftEl.style.width = `${scoreBarRectangleWidth}px`
            scoreBarRightEl.style.width = "0px"
            // Crown
            winnerRedCrownEl.style.opacity = crownOpacity
            winnerBlueCrownEl.style.opacity = 0
        } else if (currentRedScore === currentBlueScore) {
            // Score lead class
            scoreLeftEl.classList.remove("score-lead")
            scoreRightEl.classList.remove("score-lead")
            // Score difference
            scoreDifferenceLeftEl.style.opacity = 0
            scoreDifferenceRightEl.style.opacity = 0
            // Score bar
            scoreBarLeftEl.style.width = "0px"
            scoreBarRightEl.style.width = "0px"
            // Crown
            winnerRedCrownEl.style.opacity = 0
            winnerBlueCrownEl.style.opacity = 0
        } else if (currentRedScore < currentBlueScore) {
            // Score lead class
            scoreLeftEl.classList.remove("score-lead")
            scoreRightEl.classList.add("score-lead")
            // Score difference
            scoreDifferenceLeftEl.style.opacity = 1
            scoreDifferenceRightEl.style.opacity = 0
            // Score bar
            scoreBarLeftEl.style.width = "0px"
            scoreBarRightEl.style.width = `${scoreBarRectangleWidth}px`
            // Crown
            winnerRedCrownEl.style.opacity = 0
            winnerBlueCrownEl.style.opacity =crownOpacity
        }
    }

    // This is also mostly taken from Victim Crasher: https://github.com/VictimCrasher/static/tree/master/WaveTournament
    if (chatLen !== data.tourney.chat.length) {
        chatLen = updateChat(data.tourney, chatLen, chatDisplayWrapperEl, false, getLogsApi(), currentTeamRed, currentTeamBlue, currentTeamRedName, currentTeamBlueName)
    }
}

// Team Name Elements
const teamRedNameEl = document.getElementById("team-red-name")
const teamBlueNameEl = document.getElementById("team-blue-name")

// Team star containers
const redTeamStarContainerEl = document.getElementById("red-team-star-container")
const blueTeamStarContainerEl = document.getElementById("blue-team-star-container")

let currentTeamRedName, currentTeamBlueName, previousTeamRedName, previousTeamBlueName
let currentTeamRed, currentTeamBlue
setInterval(() => {
    // Set team name information
    currentTeamRedName = getCookie("currentTeamRedName")
    currentTeamBlueName = getCookie("currentTeamBlueName")

    if (currentTeamRedName !== previousTeamRedName) {
        previousTeamRedName = currentTeamRedName
        teamRedNameEl.textContent = currentTeamRedName
        currentTeamRed = findTeam(currentTeamRedName)
    }
    if (currentTeamBlueName !== previousTeamBlueName) {
        previousTeamBlueName = currentTeamBlueName
        teamBlueNameEl.textContent = currentTeamBlueName
        currentTeamBlue = findTeam(currentTeamRedName)
    }

    // Toggle and render stars
    toggleStarContainers(redTeamStarContainerEl, blueTeamStarContainerEl)
    renderStars(redTeamStarContainerEl, blueTeamStarContainerEl)
}, 200)