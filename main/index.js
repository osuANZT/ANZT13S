import { loadBeatmaps } from "../_shared/core/beatmaps.js"
import { toggleStarContainers, renderStars } from "../_shared/core/stars.js"
import { getCookie } from "../_shared/core/utils.js"

const roundNameEl = document.getElementById("round-name")
let allBeatmaps = []
Promise.all([loadBeatmaps()]).then(([beatmaps]) => {
    // Load beatmaps
    allBeatmaps = beatmaps.beatmaps
    roundNameEl.textContent = `// ${beatmaps.roundName} gameplay`
})

// Team Name Elements
const teamRedNameEl = document.getElementById("team-red-name")
const teamBlueNameEl = document.getElementById("team-blue-name")

// Team star containers
const redTeamStarContainerEl = document.getElementById("red-team-star-container")
const blueTeamStarContainerEl = document.getElementById("blue-team-star-container")

let currentTeamRedName, currentTeamBlueName, previousTeamRedName, previousTeamBlueName
setInterval(() => {
    // Set team name information
    currentTeamRedName = getCookie("currentTeamRedName")
    currentTeamBlueName = getCookie("currentTeamBlueName")

    if (currentTeamRedName !== previousTeamRedName) {
        previousTeamRedName = currentTeamRedName
        teamRedNameEl.textContent = currentTeamRedName
    }
    if (currentTeamBlueName !== previousTeamBlueName) {
        previousTeamBlueName = currentTeamBlueName
        teamBlueNameEl.textContent = currentTeamBlueName
    }

    // Toggle and render stars
    toggleStarContainers(redTeamStarContainerEl, blueTeamStarContainerEl)
    renderStars(redTeamStarContainerEl, blueTeamStarContainerEl)
}, 200)