// pawwersActivos.ts
import { MongoClient, ObjectId, Collection } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = "pawwi_bot";
const collectionName = "pawwers_activos";

const client = new MongoClient(uri);

async function connect(): Promise<Collection> {
  await client.connect();
  return client.db(dbName).collection(collectionName);
}

export async function getPawwerById(id: string) {
  const col = await connect();
  return await col.findOne({ _id: new ObjectId(id) });
}
