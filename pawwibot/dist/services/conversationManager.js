"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConversationTimeout = handleConversationTimeout;
exports.handleConversationEnd = handleConversationEnd;
const memoryStore_1 = require("~/services/memoryStore");
const models_1 = require("~/model/models");
function handleConversationTimeout(userId) {
    const now = Date.now();
    const userConversation = memoryStore_1.conversations[userId];
    if (userConversation && (now - userConversation.lastInteraction) > 15 * 60 * 1000) {
        console.log(`🛑 Session closed for userId: ${userId} due to 5 minutes of inactivity.`);
        delete memoryStore_1.conversations[userId];
        return true;
    }
    if (!memoryStore_1.conversations[userId]) {
        memoryStore_1.conversations[userId] = new models_1.conversation();
    }
    memoryStore_1.conversations[userId].lastInteraction = now;
    return false;
}
function handleConversationEnd(userId) {
    memoryStore_1.conversations[userId].lastInteraction + (99 * 60 * 1000);
    return true;
}
//# sourceMappingURL=conversationManager.js.map