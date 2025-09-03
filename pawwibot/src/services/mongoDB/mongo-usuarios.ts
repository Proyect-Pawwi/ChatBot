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

// ---------- CRUD ----------
export async function createUsuario(usuario: Usuario) {
  const col = await connect(usuariosCollection);
  const result = await col.insertOne(usuario);
  return result.insertedId;
}

export async function getUsuarios() {
  const col = await connect(usuariosCollection);
  return await col.find({}).toArray();
}

export async function getUsuarioById(id: string) {
  const col = await connect(usuariosCollection);
  return await col.findOne({ _id: new ObjectId(id) });
}

export async function getUsuarioByCelular(celular: string) {
  const col = await connect(usuariosCollection);
  return await col.findOne({ celular });
}

export async function updateUsuario(id: string, data: Partial<Usuario>) {
  const col = await connect(usuariosCollection);
  return await col.updateOne({ _id: new ObjectId(id) }, { $set: data });
}

export async function deleteUsuario(id: string) {
  const col = await connect(usuariosCollection);
  return await col.deleteOne({ _id: new ObjectId(id) });
}

// ---------- Funciones adicionales ----------

// Agregar perro al usuario
export async function agregarPerro(celular: string, perro: Perro) {
  const col = await connect(usuariosCollection);
  return await col.updateOne(
    { celular },
    { $push: { perros: perro } }
  );
}

// Agregar agendamiento al usuario
export async function agregarAgendamiento(celular: string, agendamiento: Agendamiento) {
  const col = await connect(usuariosCollection);
  return await col.updateOne(
    { celular },
    { $push: { agendamientos: agendamiento } }
  );
}
