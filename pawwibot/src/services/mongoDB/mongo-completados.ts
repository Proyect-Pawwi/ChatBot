// completados.ts
import { MongoClient, ObjectId, Collection } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = "pawwi_bot";
const completadosCollection = "completados";

const client = new MongoClient(uri);

async function connect(collectionName: string): Promise<Collection> {
  await client.connect();
  return client.db(dbName).collection(collectionName);
}

// ---------- Interfaces ----------
export interface Completado {
  _id?: ObjectId;
  Celular: number;
  Nombre: string;
  Perro: string;
  Direccion: string;
  TipoServicio: string;
  TiempoServicio: string;
  Fecha: string;       // formato DD/MM
  Hora: string;        // formato HH:mm (hora agendada)
  HoraInicio: string;  // formato HH:mm:ss
  HoraFin: string;     // formato HH:mm:ss
  Precio: number;
  MetodoPago: string;
  Pawwer: string;      // Id del pawwer
  Estado: string;      // debería ser "Completado"
  GananciaPawwer: number;
  FechaCompletado: Date;
}

// ---------- CRUD ----------
export async function createCompletado_Mongo(data: Completado) {
  const col = await connect(completadosCollection);

  const completadoDataToInsert = {
    ...data,
    estado: "Completado",
    fechaCompletado: new Date()
  };

  const result = await col.insertOne(completadoDataToInsert);
  return result.insertedId;
}

export async function getCompletados() {
  const col = await connect(completadosCollection);
  return await col.find({}).toArray();
}

export async function getCompletadoById(id: string) {
  const col = await connect(completadosCollection);
  return await col.findOne({ _id: new ObjectId(id) });
}

export async function updateCompletado(id: string, data: Partial<Completado>) {
  const col = await connect(completadosCollection);
  return await col.updateOne({ _id: new ObjectId(id) }, { $set: data });
}

export async function deleteCompletado(id: string) {
  const col = await connect(completadosCollection);
  return await col.deleteOne({ _id: new ObjectId(id) });
}
