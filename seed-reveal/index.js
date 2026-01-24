import { loadTeamsSeedReveal } from "../_shared/core/teams.js"

let currentTeamNumber = 0

let allTeamsSeedReveal  = []
Promise.all([loadTeamsSeedReveal()]).then(([teams]) => {
    // Load teams
    allTeamsSeedReveal = teams
    renderTeam()
})

// Team Data
const teamSeedEl = document.getElementById("team-seed")
const teamNameEl = document.getElementById("team-name")
const playerInfoElementIds = ["player1-name", "player2-name", "player1-rank", "player2-rank"]
const mapScoreElementIds = [
    "aim1-score", "aim2-score", "aim3-score", "aim1-rank", "aim2-rank", "aim3-rank",
    "tap1-score", "tap2-score", "tap3-score", "tap1-rank", "tap2-rank", "tap3-rank",
    "ctl1-score", "ctl2-score", "ctl3-score", "ctl1-rank", "ctl2-rank", "ctl3-rank",
    "gim1-score", "gim2-score", "gim1-rank", "gim2-rank"
]

// Load current team
function renderTeam() {
    const data = allTeamsSeedReveal[currentTeamNumber]

    // Team Info
    teamSeedEl.textContent = `#${data.team_seed}`
    teamNameEl.textContent = data.team_name

    // Player Info
    for (let i = 0; i < playerInfoElementIds.length; i++) {
        document.getElementById(playerInfoElementIds[i]).textContent = playerInfoElementIds[i].endsWith("rank") ? `#${data[playerInfoElementIds[i]]}` : data[playerInfoElementIds[i]]
    }

    // Score Info
    for (let i = 0; i < mapScoreElementIds.length; i++) {
        const text = mapScoreElementIds[i].endsWith("rank") ? `#${data[mapScoreElementIds[i]]}` : data[mapScoreElementIds[i]].toLocaleString()
        document.getElementById(mapScoreElementIds[i]).textContent = text
    }
}

// Buttons
const nextButtonEl = document.getElementById("next-button")
const previousButtonEl = document.getElementById("previous-button")
window.onload = () => {
    nextButtonEl.addEventListener("click", () => setCurrentTeamNumber("plus"))
    previousButtonEl.addEventListener("click", () => setCurrentTeamNumber("minus"))
}

function setCurrentTeamNumber(action) {
    if (action === "plus") currentTeamNumber++
    else if (action === "minus") currentTeamNumber--

    if (currentTeamNumber < 0) currentTeamNumber = allTeamsSeedReveal.length - 1
    if (currentTeamNumber > allTeamsSeedReveal.length - 1) currentTeamNumber = 0

    renderTeam()
}