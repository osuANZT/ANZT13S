import { loadBeatmaps } from "../_shared/core/beatmaps.js"
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
}, 200)