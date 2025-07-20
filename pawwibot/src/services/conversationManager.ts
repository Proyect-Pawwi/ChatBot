import { conversations } from "../services/memoryStore";
import { conversation } from "~/model/models";

export function handleConversationTimeout(userId: string) {
  const now = Date.now();
  const userConversation = conversations[userId];

  if (userConversation && (now - userConversation.lastInteraction) > 15 * 60 * 1000) {
    // More than 5 minutes of inactivity -> reset conversation
    console.log(`🛑 Session closed for userId: ${userId} due to 5 minutes of inactivity.`);
    delete conversations[userId];
    return true; // <- Cerró sesión
  }

  if (!conversations[userId]) {
    conversations[userId] = new conversation();
  }

  conversations[userId].lastInteraction = now;
  return false; // <- No cerró sesión
}

export function handleConversationEnd(userId: string) {
  conversations[userId].lastInteraction + (99 * 60 * 1000)
  return true; // <- Cerró sesión
}