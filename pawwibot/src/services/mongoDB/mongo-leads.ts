// leads.ts
import { MongoClient, ObjectId, Collection } from "mongodb";
import dotenv from "dotenv";
import { crearPaseoDesdeLead } from "./mongo-paseos"; // importamos la función para crear paseo
import { sendText } from "../send-text";
import { TEMPLATE_confirmacion_paseo_cliente, TEMPLATE_recordatorio_paseo_pawwer, TEMPLATE_utils_confirmacion_paseo_cliente, TEMPLATE_utils_confirmacion_paseo_pawwer } from "../send-template";
import { DateTime } from "luxon";
import { getUsuarioByCelular, getUsuarioById } from "./mongo-usuarios";

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
    pawwer: "Numero del pawwer", // inicializamos pawwer en 0
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

  for (const lead of leads) {
    // ----------------- VALIDACIÓN PAWWER -----------------
    const pawwerActivo = await getUsuarioByCelular(lead.pawwer.toString());
    if (!pawwerActivo) {
      console.log("573332885462",`⚠️ No se puede completar el lead ${lead._id}. No hay pawwer activo con telefono: ${lead.pawwer}`);
      await colLeads.updateOne({ _id: lead._id }, { $set: { estado: "Cambiar" } });
      continue; // saltar al siguiente lead
    }
    else if (pawwerActivo.tipoUsuario != "pawwer") {
      await sendText(
        "573332885462",
        `⚠️ No se puede completar el lead ${lead._id}. El pawwer con numero ${lead.pawwer} no está activo o no es un pawwer.`
      );
      console.log("573332885462",`⚠️ No se puede completar el lead ${lead._id}. El pawwer con ID ${lead.pawwer} no está activo o no es un pawwer.`);
      await colLeads.updateOne({ _id: lead._id }, { $set: { estado: "Cambiar" } });
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
        "573332885462",
        `⚠️ No se puede completar el lead ${lead._id}. La fecha u hora (${lead.fecha} ${lead.hora}) tienen un formato inválido.`
      );
      console.log(
        "573332885462",
        `⚠️ No se puede completar el lead ${lead._id}. La fecha u hora (${lead.fecha} ${lead.hora}) tienen un formato inválido.`
      );
      await colLeads.updateOne({ _id: lead._id }, { $set: { estado: "Cambiar" } });
      continue;
    }

    if (leadDateTime < now) {
      await sendText(
        "573332885462",
        `⚠️ No se puede completar el lead ${lead._id}. La fecha y hora (${lead.fecha} ${lead.hora}) ya pasaron.`
      );
      console.log(
        "573332885462",
        `⚠️ No se puede completar el lead ${lead._id}. La fecha y hora (${lead.fecha} ${lead.hora}) ya pasaron.`
      );
      await colLeads.updateOne({ _id: lead._id }, { $set: { estado: "Cambiar" } });
      continue; // saltar al siguiente lead
    }

    // ----------------- PROCESAR LEAD -----------------
    await crearPaseoDesdeLead(lead, pawwerActivo._id!.toString(), pawwerActivo.nombre, pawwerActivo.celular);
    await colLeads.deleteOne({ _id: lead._id });

    // Notificar al pawwer
    await sendText(
      pawwerActivo.celular,
      `Tienes una nueva solicitud de paseo asignada para el ${lead.fecha} a las ${lead.hora}. Por favor, revisa los detalles y prepárate para brindar un excelente servicio. ¡Gracias por ser parte de nuestro equipo! 🐾`
    );

    await TEMPLATE_utils_confirmacion_paseo_pawwer(pawwerActivo.celular, {
      locationName: "Direccion del cliente",
      address: lead.direccion + ", Bogotá",
      direccion: lead.direccion,
      fecha: lead.fecha,
      hora: lead.hora,
      duracion: lead.tiempoServicio,
      precio: "$"+ lead.precio
    });

    await TEMPLATE_utils_confirmacion_paseo_cliente(lead.celular, {
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

  //console.log(`✅ ${createdCount} paseos creados a partir de leads confirmados.`);
  return createdCount;
}
