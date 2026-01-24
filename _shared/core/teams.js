let allTeamsSeedReveal = []

// Load teams
export async function loadTeamsSeedReveal() {
    const response = await axios.get("../_data/teams-seed-reveal.json")
    allTeamsSeedReveal = response.data
    return allTeamsSeedReveal
}

// Find team
export async function findTeamSeedReveal(team_name) {
    return allTeamsSeedReveal.find(t => t.team_name === team_name)
}