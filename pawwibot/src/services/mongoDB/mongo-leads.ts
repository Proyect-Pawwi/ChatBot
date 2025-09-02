// leads.ts
import { MongoClient, ObjectId, Collection } from "mongodb";
import dotenv from "dotenv";
import { crearPaseoDesdeLead } from "./mongo-paseos"; // importamos la función para crear paseo
import { sendText } from "../send-text";
import { TEMPLATE_confirmacion_paseo_cliente, TEMPLATE_recordatorio_paseo_pawwer } from "../send-template";
import { DateTime } from "luxon";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = "pawwi_bot";
const leadsCollection = "leads";

const client = new MongoClient(uri);

async function connect(collectionName: string): Promise<Collection> {
  await client.connect();
  return client.db(dbName).collection(collectionName);
}

// ---------- Interfaces ----------
export interface Lead {
  _id?: ObjectId;
  celular: number;
  nombre: string;
  perro: string;
  anotaciones?: string;
  direccion: string;
  tipoServicio: string;
  tiempoServicio: string;
  fecha: string; // formato DD/MM
  hora: string; // formato HH:mm
  precio: number;
  metodoPago: string;
  pawwer: string; // Id del pawwer
  estado: string;
}

// ---------- CRUD ----------
export async function createLead_Mongo(data: Lead) {
  const col = await connect(leadsCollection);

  const leadDataToInsert = {
    ...data,
    estado: "Pendiente",
    pawwer: 0, // inicializamos pawwer en 0
    fechaCreacion: new Date() // opcional: fecha de creación
  };

  const result = await col.insertOne(leadDataToInsert);
  return result.insertedId;
}

export async function getLeads() {
  const col = await connect(leadsCollection);
  return await col.find({}).toArray();
}

export async function getLeadById(id: string) {
  const col = await connect(leadsCollection);
  return await col.findOne({ _id: new ObjectId(id) });
}

export async function updateLead(id: string, data: Partial<Lead>) {
  const col = await connect(leadsCollection);
  return await col.updateOne({ _id: new ObjectId(id) }, { $set: data });
}

export async function deleteLead(id: string) {
  const col = await connect(leadsCollection);
  return await col.deleteOne({ _id: new ObjectId(id) });
}

// ---------- FUNCIÓN ESPECIAL ----------
// Confirmar leads y crear paseos
export async function confirmarLeads() {
  const colLeads = await connect("leads");
  const leads = await colLeads.find({ estado: { $regex: /^confirmar$/i } }).toArray() as Lead[];
  let createdCount = 0;

  const pawwerActivoCol = await connect("pawwers_activos");

  for (const lead of leads) {
    // ----------------- VALIDACIÓN PAWWER -----------------
    if (!ObjectId.isValid(lead.pawwer)) {
      await sendText(
        "NUMERO_SOporte",
        `⚠️ No se puede completar el lead ${lead._id}. Pawwer inválido: ${lead.pawwer}`
      );
      continue; // saltar al siguiente lead
    }

    const pawwerActivo = await pawwerActivoCol.findOne({ _id: new ObjectId(lead.pawwer) });
    if (!pawwerActivo) {
      await sendText(
        "NUMERO_SOporte",
        `⚠️ No se puede completar el lead ${lead._id}. No hay pawwer activo con ID: ${lead.pawwer}`
      );
      continue; // saltar al siguiente lead
    }

    // ----------------- VALIDACIÓN FECHA/HORA -----------------
    const leadDateTime = DateTime.fromFormat(
      `${lead.fecha} ${lead.hora}`,
      "dd/MM HH:mm",
      { zone: "America/Bogota" }
    );

    const now = DateTime.now().setZone("America/Bogota");

    if (!leadDateTime.isValid) {
      await sendText(
        "NUMERO_SOporte",
        `⚠️ No se puede completar el lead ${lead._id}. La fecha u hora (${lead.fecha} ${lead.hora}) tienen un formato inválido.`
      );
      continue;
    }

    if (leadDateTime < now) {
      await sendText(
        "NUMERO_SOporte",
        `⚠️ No se puede completar el lead ${lead._id}. La fecha y hora (${lead.fecha} ${lead.hora}) ya pasaron.`
      );
      continue;
    }

    // ----------------- PROCESAR LEAD -----------------
    await colLeads.updateOne({ _id: lead._id }, { $set: { estado: "confirmado" } });
    await crearPaseoDesdeLead(lead);
    await colLeads.deleteOne({ _id: lead._id });

    // Notificar al pawwer
    await sendText(
      pawwerActivo.NumeroTelefono,
      `Tienes una nueva solicitud de paseo asignada para el ${lead.fecha} a las ${lead.hora}. Por favor, revisa los detalles y prepárate para brindar un excelente servicio. ¡Gracias por ser parte de nuestro equipo! 🐾`
    );

    // Notificar al cliente
    await TEMPLATE_confirmacion_paseo_cliente(lead.celular, {
      nombreCliente: String(lead.nombre),
      nombrePerrito: String(lead.perro),
      calle: String(lead.direccion),
      fecha: String(lead.fecha),
      hora: String(lead.hora),
      duracion: String(lead.tiempoServicio),
      precio: String(lead.precio),
      pawwer: String(pawwerActivo.Nombre),
    });

    createdCount++;
  }

  console.log(`✅ ${createdCount} paseos creados a partir de leads confirmados.`);
  return createdCount;
}