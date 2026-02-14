import { sendLog } from "../core/apis.js"

// Update all chat information
export function updateChat(
    tourneyData,
    chatLength,
    chatDisplayContainerEl,
    logData,
    api,
    currentTeamRed,
    currentTeamBlue,
    currentTeamRedName,
    currentTeamBlueName
) {
    const chatData = tourneyData.chat
    if (chatLength === 0 || chatLength > chatData.length) {
        chatDisplayContainerEl.innerHTML = ""
        chatLength = 0
    }
    const fragment = document.createDocumentFragment()

    for (let i = chatLength; i < chatData.length; i++) {
        // Message container
        const messageWrapper = document.createElement("div")
        messageWrapper.classList.add("chat-message-wrapper")

        // Time
        const messageTime = document.createElement("div")
        const date = new Date(chatData[i].timestamp)
        const timeUTC = date.toISOString().substring(11, 19)
        messageTime.classList.add("chat-message-time")
        messageTime.textContent = timeUTC

        // Wrapper
        const messageWhole = document.createElement("div")
        messageWhole.classList.add("chat-message-whole")

        // Name
        const messageName = document.createElement("span")
        const chatName = chatData[i].name
        messageName.textContent = `${chatName}: `
        // Set class of chat
        let chatClass
        if (!currentTeamRed || !currentTeamBlue) chatClass = "unknown"
        else if (currentTeamRed["player1-name"] === chatName || currentTeamRed["player2-name"]) chatClass = "left"
        else if (currentTeamBlue["player1-name"] === chatName || currentTeamBlue["player2-name"]) chatClass = "right"
        else if (chatName === "[FakeBanchoBot]") messageName.classList.add("bot")
        else chatClass = "unknown"
        messageName.classList.add(chatClass)

        // Message
        const messageContent = document.createElement("span")
        messageContent.textContent = chatData[i].message

        // Append everything
        messageWhole.append(messageName, messageContent)
        messageWrapper.append(messageTime, messageWhole)
        fragment.append(messageWrapper)

        // Chat log data
        if (logData) {
            const chatLogData = {
                tournament: "ANZT13S",
                team: {
                    left: currentTeamRedName,
                    right: currentTeamBlueName
                },
                chatContent: {
                    team: chatClass,
                    name: chatData[i].name,
                    message: chatData[i].message,
                    timestamp: chatData[i].timestamp
                }
            }

            sendLog(chatLogData, "chat", api)
        }
    }

    chatDisplayContainerEl.append(fragment)
    chatLength = chatData.length
    return chatLength
}