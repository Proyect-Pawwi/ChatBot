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

// ---------- VALIDACIONES ----------
function validatePawwer(data: any) {
  if (!data.Nombre || typeof data.Nombre !== "string" || /\d/.test(data.Nombre)) {
    throw new Error("❌ Nombre inválido. Debe ser texto y no contener números.");
  }

  if (!data.Cedula || isNaN(Number(data.Cedula))) {
    throw new Error("❌ Cédula inválida. Debe ser un número.");
  }

  if (!data.NumeroTelefono || isNaN(Number(data.NumeroTelefono))) {
    throw new Error("❌ Número de teléfono inválido. Debe ser un número.");
  }

  if (!["activo", "inactivo"].includes(data.Estado)) {
    throw new Error("❌ Estado inválido. Debe ser 'activo' o 'inactivo'.");
  }

  // Validar lista de paseos completados
  if (data.PaseosCompletados && !Array.isArray(data.PaseosCompletados)) {
    throw new Error("❌ PaseosCompletados debe ser un array de IDs.");
  }

  const paseosValidos = (data.PaseosCompletados || []).map((id: any) => {
    if (!ObjectId.isValid(id)) {
      throw new Error(`❌ Paseo ID inválido: ${id}`);
    }
    return new ObjectId(id);
  });

  return {
    Nombre: data.Nombre.trim(),
    Cedula: Number(data.Cedula),
    NumeroTelefono: Number(data.NumeroTelefono),
    Estado: data.Estado.toLowerCase(),
    PaseosCompletados: paseosValidos,
  };
}

// ---------- CRUD ----------

// Crear Pawwer Activo
export async function createPawwer(data: any) {
  const col = await connect();
  const pawwer = validatePawwer(data);

  // 🔍 Validar que no exista un Pawwer con la misma cédula
  const existing = await col.findOne({ Cedula: pawwer.Cedula });
  if (existing) {
    throw new Error(`❌ Ya existe un Pawwer con la cédula ${pawwer.Cedula}.`);
  }

  const result = await col.insertOne(pawwer);
  return result.insertedId;
}

// Obtener todos los Pawwers Activos
export async function getPawwers() {
  const col = await connect();
  return await col.find({}).toArray();
}

// Obtener Pawwer por ID
export async function getPawwerById(id: string) {
  const col = await connect();
  return await col.findOne({ _id: new ObjectId(id) });
}

// Actualizar Pawwer
export async function updatePawwer(id: string, data: any) {
  const col = await connect();
  const pawwer = validatePawwer(data);

  // 🔍 Validar que no exista otro Pawwer con la misma cédula
  const existing = await col.findOne({ Cedula: pawwer.Cedula, _id: { $ne: new ObjectId(id) } });
  if (existing) {
    throw new Error(`❌ Ya existe otro Pawwer con la cédula ${pawwer.Cedula}.`);
  }

  return await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: pawwer }
  );
}

// Eliminar Pawwer
export async function deletePawwer(id: string) {
  const col = await connect();
  return await col.deleteOne({ _id: new ObjectId(id) });
}
