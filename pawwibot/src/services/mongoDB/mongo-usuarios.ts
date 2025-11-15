// mongo-usuarios.ts
import { MongoClient, ObjectId, Collection } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = "pawwi_bot";
const usuariosCollection = "usuarios";

const client = new MongoClient(uri);

async function connect(collectionName: string): Promise<Collection> {
  await client.connect();
  return client.db(dbName).collection(collectionName);
}

// ---------- Interfaces ----------
export interface Perro {
  nombre: string;
  raza?: string;
  edad?: number;
  notas?: string;
}

export interface Agendamiento {
  creadoEn: Date;
  Direccion: string;
}

export interface Usuario {
  _id?: ObjectId;
  celular: string;
  nombre: string;
  tipoUsuario: "cliente" | "pawwer" | "admin";
  direccion: string;
  perros: Perro[];
  agendamientos: Agendamiento[];
}

export async function getUsuarioByCelular(celular: string) {
  const col = await connect(usuariosCollection);
  return await col.findOne({ celular });
}