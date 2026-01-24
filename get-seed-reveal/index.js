const textareaEl = document.getElementById("textarea")
let teamStats = []
async function submit() {
    const textareaElValue = textareaEl.value
    const textAreaElValueSplit = textareaElValue.split("\n")
    for (let i = 1; i < textAreaElValueSplit.length; i++) {
        const textAreaElValueSplitSplit = textAreaElValueSplit[i].split(",")
        const teamStat = {
            "team_name": textAreaElValueSplitSplit[0],
            "aim": Number(textAreaElValueSplitSplit[1]),
            "speed": Number(textAreaElValueSplitSplit[2]),
            "stamina": Number(textAreaElValueSplitSplit[3]),
            "finger_control": Number(textAreaElValueSplitSplit[4]),
            "precision": Number(textAreaElValueSplitSplit[5]),
            "reading": Number(textAreaElValueSplitSplit[6]),
            "technical": Number(textAreaElValueSplitSplit[7])
        }
        teamStats.push(teamStat)
    }

    const jsonString = JSON.stringify(teamStats, null, 4)
    const blob = new Blob([jsonString], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "team-stats.json"
    link.click()
}