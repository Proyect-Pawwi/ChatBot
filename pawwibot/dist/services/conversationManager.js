import { conversations } from "~/services/memoryStore";
import { conversation } from "~/model/models";
export function handleConversationTimeout(userId) {
    const now = Date.now();
    const userConversation = conversations[userId];
    if (userConversation && (now - userConversation.lastInteraction) > 15 * 60 * 1000) {
        console.log(`🛑 Session closed for userId: ${userId} due to 5 minutes of inactivity.`);
        delete conversations[userId];
        return true;
    }
    if (!conversations[userId]) {
        conversations[userId] = new conversation();
    }
    conversations[userId].lastInteraction = now;
    return false;
}
export function handleConversationEnd(userId) {
    conversations[userId].lastInteraction + (99 * 60 * 1000);
    return true;
}
//# sourceMappingURL=conversationManager.js.map