// leads.ts
import { MongoClient, ObjectId, Collection } from "mongodb";
import dotenv from "dotenv";
import { sendText } from "../send-text";
import { log } from "console";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = "pawwi_bot";
const leadsCollection = "msgs";

const client = new MongoClient(uri);

async function connect(collectionName: string): Promise<Collection> {
  await client.connect();
  return client.db(dbName).collection(collectionName);
}

// ---------- Interfaces ----------
export interface Msg {
  _id?: ObjectId;
  to: string;
  text: string;
  checked?: boolean; // 🔥 nuevo campo
}


// ---------- CRUD ----------
async function getMsgs() {
  const col = await connect(leadsCollection);
  return await col.find({
    $or: [{ checked: false }, { checked: { $exists: false } }]
  }).toArray() as Msg[];
}


async function checkMsg(msg: Msg) {
  const col = await connect(leadsCollection);
  return await col.updateOne(
    { _id: new ObjectId(msg._id) },
    { $set: { checked: true } } // 🔥 marca como enviado/actualizado
  );
}


export async function sendMsgs() {
    const msgs = await getMsgs();
    for (const msg of msgs) {
        await sendText(msg.to, msg.text);
        await checkMsg(msg);
        log(`✅ Mensaje manual enviado a ${msg.to}: ${msg.text}`);
    }
}