import fetch from 'node-fetch';
import { MongoClient, ObjectId } from 'mongodb';

const AIRTABLE_BASE = 'https://api.airtable.com/v0/appSUDxkkNiojRXta/Leads';
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || process.env.airtableApiKey;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const MONGO_DB = process.env.MONGO_DB || "pawwi";
const MONGO_COLLECTION = "leads";

// 🔗 Conexión MongoDB
let client: MongoClient;
async function getMongoCollection() {
  if (!client) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
  }
  return client.db(MONGO_DB).collection(MONGO_COLLECTION);
}

interface LeadFields {
  FechaCreacion: string;
  Celular: string;
  Perro: string;
  Anotaciones?: string;
  Direccion: string;
  TipoServicio: string;
  TiempoServicio: string;
  Fecha: string;
  Hora: string;
  Precio: number;
  Estado?: string;
  Pawwer?: string;
  "metodo Pago"?: string;
  "Nombre cliente": string;
  "Nombre completo (from Pawwer)"?: string;
  "Numero de teléfono (from Pawwer)"?: string[];
}

interface AirtableRecord {
  id: string;
  createdTime: string;
  fields: LeadFields;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

interface AirtableDeleteResponse {
  id: string;
  deleted: boolean;
}

// ✅ Crear Lead
export async function createLead(fields: LeadFields): Promise<AirtableResponse> {
  // 1) Crear en Airtable
  const res = await fetch(AIRTABLE_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{ fields }],
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }
  const airtableResponse = await res.json() as AirtableResponse;

  // 2) Guardar en MongoDB
  const collection = await getMongoCollection();
  for (const record of airtableResponse.records) {
    await collection.updateOne(
      { airtableId: record.id },
      { $set: { airtableId: record.id, ...record.fields, createdTime: record.createdTime } },
      { upsert: true }
    );
  }

  return airtableResponse;
}

// ✅ Obtener Leads
export async function getLeads(
  filterByFormula?: string,
  maxRecords = 100,
  view = 'Grid view',
  offset?: string
): Promise<AirtableResponse> {
  const params = new URLSearchParams({
    maxRecords: maxRecords.toString(),
    view,
  });
  if (filterByFormula) params.append('filterByFormula', filterByFormula);
  if (offset) params.append('offset', offset);

  const url = `${AIRTABLE_BASE}?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }

  const airtableResponse = await res.json() as AirtableResponse;

  // 🔄 Sincronizar en Mongo
  const collection = await getMongoCollection();
  for (const record of airtableResponse.records) {
    await collection.updateOne(
      { airtableId: record.id },
      { $set: { airtableId: record.id, ...record.fields, createdTime: record.createdTime } },
      { upsert: true }
    );
  }

  return airtableResponse;
}

// ✅ Obtener Lead por ID
export async function getLeadById(recordId: string): Promise<AirtableRecord> {
  const url = `${AIRTABLE_BASE}/${recordId}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }

  const record = await res.json() as AirtableRecord;

  // 🔄 Guardar en Mongo
  const collection = await getMongoCollection();
  await collection.updateOne(
    { airtableId: record.id },
    { $set: { airtableId: record.id, ...record.fields, createdTime: record.createdTime } },
    { upsert: true }
  );

  return record;
}

// ✅ Actualizar Lead
export async function updateLead(recordId: string, fields: Partial<LeadFields>): Promise<AirtableResponse> {
  const res = await fetch(AIRTABLE_BASE, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{ id: recordId, fields }],
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }

  const airtableResponse = await res.json() as AirtableResponse;

  // 🔄 Actualizar en Mongo
  const collection = await getMongoCollection();
  for (const record of airtableResponse.records) {
    await collection.updateOne(
      { airtableId: record.id },
      { $set: { ...record.fields } }
    );
  }

  return airtableResponse;
}

// ✅ Eliminar Lead
export async function deleteLead(recordId: string): Promise<AirtableDeleteResponse> {
  const url = `${AIRTABLE_BASE}/${recordId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Airtable error: ${error}`);
  }

  const airtableResponse = await res.json() as AirtableDeleteResponse;

  // 🔄 Eliminar en Mongo
  const collection = await getMongoCollection();
  await collection.deleteOne({ airtableId: recordId });

  return airtableResponse;
}
