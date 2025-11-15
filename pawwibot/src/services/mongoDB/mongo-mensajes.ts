// leads.ts
import dotenv from "dotenv";
import { sendText } from "../send-text";
import { log } from "console";

dotenv.config();

const API_BASE = process.env.API_BASE;

// ---------- Interfaces ----------
export interface Msg {
  _id?: string;   // <--- cambia a string, ya no usas ObjectId
  to: string;
  text: string;
  checked?: boolean;
}

// ---------- API CALLS ----------
async function getMsgs(): Promise<Msg[]> {
  const url = `${API_BASE}/api/msgs`;

  const res = await fetch(url);

  log("🚀 Fetching messages from:", url);
  log("🚀 Response status:", res.status);

  if (!res.ok) throw new Error("Error al obtener mensajes del backend");

  return await res.json();
}


async function checkMsg(id: string) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({})
  });

  if (!res.ok) throw new Error("Error al actualizar mensaje en backend");
}

// ---------- PROCESO DE ENVÍO ----------
export async function sendMsgs() {
  const msgs = await getMsgs();

  for (const msg of msgs) {
    await sendText(msg.to, msg.text);
    await checkMsg(msg._id!);

    log(`✅ Mensaje manual enviado a ${msg.to}: ${msg.text}`);
  }
}
