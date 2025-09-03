import { MongoClient, ObjectId, Collection } from "mongodb";
import dotenv from "dotenv";
import { Lead } from "./mongo-leads"; // importa la interfaz Lead
import { getPawwerById } from "./mongo-pawwersActivos";
import { TEMPLATE_finalizar_paseo_pawwer, TEMPLATE_llegada_pawwer, TEMPLATE_recordatorio_paseo_cliente, TEMPLATE_recordatorio_paseo_pawwer } from "../send-template";
import { sendText } from "../send-text";
import { log } from "node:console";
import { DateTime } from "luxon";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = "pawwi_bot";
const paseosCollection = "paseos";
const completadosCollection = "completados";

const client = new MongoClient(uri);

async function connect(collectionName: string): Promise<Collection> {
  await client.connect();
  return client.db(dbName).collection(collectionName);
}

// ---------- Interfaces ----------
export interface Paseo {
  _id?: ObjectId;
  fechaCreacion: Date;
  celular: number;
  nombre: string;
  perro: string;
  anotaciones: string;
  direccion: string;
  tipoServicio: string;
  tiempoServicio: string;
  fecha: string;
  hora: string;
  horaInicio: string;
  horaFin: string;
  precio: number;
  Estado: string;
  metodoPago: string;
  strava: string;
  idPawwer: ObjectId | null;
}

// ---------- CRUD ----------
export async function createPaseo(paseoData: Paseo) {
  const col = await connect(paseosCollection);
  const result = await col.insertOne(paseoData);
  return result.insertedId;
}

export async function getPaseos() {
  const col = await connect(paseosCollection);
  return await col.find({}).toArray();
}

export async function getPaseoById(id: string) {
  const col = await connect(paseosCollection);
  return await col.findOne({ _id: new ObjectId(id) });
}

export async function updatePaseoMongo(id: string, data: Partial<Paseo>) {
  const col = await connect(paseosCollection);
  return await col.updateOne({ _id: new ObjectId(id) }, { $set: data });
}

export async function deletePaseo(id: string) {
  const col = await connect(paseosCollection);
  return await col.deleteOne({ _id: new ObjectId(id) });
}

// ---------- FUNCIÓN: Crear Paseo desde Lead ----------


export async function crearPaseoDesdeLead(lead: Lead) {
  const col = await connect(paseosCollection);

  const now = new Date();
  const bogotaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));

  // Obtener celular del pawwer si existe
  let celularPawwer: number | null = null;
  if (lead.pawwer) {
    const pawwer = await getPawwerById(lead.pawwer);
    if (pawwer) {
      celularPawwer = pawwer.NumeroTelefono || null;
    }
  }

  const tiempoServicioNum = Number(String(lead.tiempoServicio).replace(/\D/g, "")) || 0;

  const paseo = {
    FechaCreacion: bogotaTime,
    Celular: Number(lead.celular),
    CelularPawwer: celularPawwer,  // <-- nuevo campo
    Nombre: lead.nombre || "",
    Perro: lead.perro || "",
    Anotaciones: lead.anotaciones || "",
    Direccion: lead.direccion || "",
    TipoServicio: lead.tipoServicio || "",
    TiempoServicio: tiempoServicioNum,
    Fecha: lead.fecha || "",
    Hora: lead.hora || "",
    HoraInicio: "",       // inicializamos vacío
    Precio: Number(lead.precio) || 0,
    Estado: "Por realizarse",
    Strava: "",           // inicializamos vacío
    MetodoPago: lead.metodoPago || "",
    IdPawwer: lead.pawwer ? new ObjectId(lead.pawwer) : null,
  };

  const result = await col.insertOne(paseo);
  return result.insertedId;
}
// ---------- FUNCIÓN: Actualizar estado de paseos próximos ----------
export async function actualizarEstadoPaseosProximos() {
  log("Actualizando estados de paseos próximos...");
  const col = await connect(paseosCollection);

  const paseos = await col.find({}).toArray();

  const now = new Date();
  const bogotaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));

  for (const paseo of paseos) {
    // Paseo.fecha: "DD/MM", paseo.hora: "HH:mm"
    
    if (!paseo.Fecha || !paseo.Hora) continue;

    const [dia, mes] = paseo.Fecha.split("/").map(Number);
    const [hora, minuto] = paseo.Hora.split(":").map(Number);

    const paseoDate = new Date(bogotaTime.getFullYear(), mes - 1, dia, hora, minuto);

    const diffMs = paseoDate.getTime() - bogotaTime.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    let nuevoEstado = null;

    const pawwerActivoCol = await connect("pawwers_activos");
    const pawwerActivo = await pawwerActivoCol.findOne({ _id: new ObjectId(paseo.pawwer) });

    //Paseo ultimo mensaje si han pasado mas de 15 minutos de la hora de finalizacion
    if (paseo.Estado === "Completado (15 minutos recordatorio de pago)" && paseo.horaFin) {

      const horaFin = DateTime.fromFormat(paseo.horaFin,"yyyy-MM-dd HH:mm:ss",{ zone: "America/Bogota" });
      const diffMinutos = DateTime.now().setZone("America/Bogota").diff(horaFin, "minutes").minutes;

      if (diffMinutos > 15) {
        console.log("⚠️ Ya pasaron más de 15 minutos desde la hora de finalización.");

        // Map paseo fields from DB (camelCase) to Paseo interface (PascalCase)
        const paseoMapped: Paseo = {
          _id: paseo._id,
          fechaCreacion: paseo.FechaCreacion ?? paseo.fechaCreacion ?? new Date(),
          celular: paseo.Celular ?? paseo.celular ?? 0,
          nombre: paseo.Nombre ?? paseo.nombre ?? "",
          perro: paseo.Perro ?? paseo.perro ?? "",
          anotaciones: paseo.Anotaciones ?? paseo.anotaciones ?? "",
          direccion: paseo.Direccion ?? paseo.direccion ?? "",
          tipoServicio: paseo.TipoServicio ?? paseo.tipoServicio ?? "",
          tiempoServicio: paseo.TiempoServicio ?? paseo.tiempoServicio ?? "",
          fecha: paseo.Fecha ?? paseo.fecha ?? "",
          hora: paseo.Hora ?? paseo.hora ?? "",
          horaInicio: paseo.HoraInicio ?? paseo.horaInicio ?? "",
          horaFin: paseo.horaFin ?? "",
          precio: paseo.Precio ?? paseo.precio ?? 0,
          Estado: paseo.Estado ?? paseo.estado ?? "",
          metodoPago: paseo.MetodoPago ?? paseo.metodoPago ?? "",
          strava: paseo.Strava ?? paseo.strava ?? "",
          idPawwer: paseo.IdPawwer ?? paseo.idPawwer ?? null,
        };
        await moverPaseoACompletados(paseoMapped);

      }
    }

    if(paseo.Estado === "Cancelado" || paseo.Estado === "Completado") {
      continue; // saltar paseos cancelados o completados
    }
    if (diffMinutes <= 10 && diffMinutes > 0 && paseo.Estado == "Falta 1 hora") {
      nuevoEstado = "Esperando Pawwer";
      await TEMPLATE_llegada_pawwer(paseo.CelularPawwer, { nombrePawwer: pawwerActivo?.Nombre || "Pawwer", nombrePerrito: paseo.Perro });
    } 
    else if (diffMinutes <= 60 && paseo.Estado == "Por realizarse") {
        nuevoEstado = "Falta 1 hora";
        await TEMPLATE_recordatorio_paseo_cliente(paseo.Celular, {
            nombreCliente: paseo.Nombre,
            nombrePerrito: paseo.Perro || "tu perrito",
            fecha: paseo.Fecha || "No definida",
            hora: paseo.Hora || "No definida",
            calle: paseo.Direccion,
            duracion: paseo.TiempoServicio + " minutos",
        });

        await TEMPLATE_recordatorio_paseo_pawwer(paseo.CelularPawwer, {
            nombrePawwer: pawwerActivo?.Nombre || "Pawwer",
            nombrePerrito: paseo.Perro || "tu perrito",
            calle: paseo.Direccion,
            fecha: paseo.Fecha || "No definida",
            hora: paseo.Hora || "No definida",
            duracion: paseo.TiempoServicio || "No definido",
        });
    }

    if (nuevoEstado && paseo.Estado !== nuevoEstado) {
        await col.updateOne({ _id: paseo._id }, { $set: { Estado: nuevoEstado } });
        console.log(`Paseo ${paseo._id} actualizado a "${nuevoEstado}"`);
    }
  }
}

// ---------- FUNCIÓN: Mover paseo a completados ----------
export async function moverPaseoACompletados(paseo: Paseo) {
  const completadosCol = await connect(completadosCollection);
  const paseosCol = await connect(paseosCollection);

  // Calcular ganancia del pawwer
  const gananciaPawwer = paseo.precio * 0.6;

  const completadoData = {
    celular: paseo.celular,
    nombre: paseo.nombre,
    perro: paseo.perro,
    direccion: paseo.direccion,
    tipoServicio: paseo.tipoServicio,
    tiempoServicio: paseo.tiempoServicio,
    fecha: paseo.fecha,
    hora: paseo.hora,
    horaInicio: paseo.horaInicio || "",
    horaFin: paseo.horaFin || "",
    precio: paseo.precio,
    metodoPago: paseo.metodoPago,
    pawwer: paseo.idPawwer ? paseo.idPawwer.toString() : "",
    estado: "Completado",
    gananciaPawwer,
    fechaCompletado: new Date(),
  };

  // Insertar en completados
  await completadosCol.insertOne(completadoData);

  // Eliminar de la colección de paseos
  await paseosCol.deleteOne({ _id: paseo._id });

  console.log(`✅ Paseo ${paseo._id} movido a completados`);
}


export async function getRegistrosPorCelular(
  celular: number,
  collectionName: string
) {
  const col: Collection = await connect(collectionName);
  const registros = await col.find({ celular: celular }).toArray();
  return registros;
}

export async function actualizarEstadoEsperandoPawwer(celularPawwer: number) {
  const col = await connect(paseosCollection);

  // Buscar el primer paseo que coincida con el pawwer y estado "Esperando Pawwer"
  const paseo = await col.findOne({
    CelularPawwer: celularPawwer,
    Estado: "Esperando Pawwer"
  });

  if (paseo) {
    await col.updateOne(
      { _id: paseo._id },
      { $set: { Estado: "Esperando perro" } }
    );
    console.log(`✅ Paseo ${paseo._id} actualizado a "Esperando perro"`);
    return true;
  } else {
    console.log(`⚠️ No se encontró paseo para el pawwer ${celularPawwer} con estado "Esperando Pawwer"`);
    return false;
  }
}

export async function actualizarEstadoEsperandoPerro(celularPawwer: number) {
  const col = await connect(paseosCollection);

  // Buscar el primer paseo que coincida con el pawwer y estado "Esperando perro"
  const paseo = await col.findOne({
    CelularPawwer: celularPawwer,
    Estado: "Esperando perro"
  });

  if (!paseo) {
    console.log(`⚠️ No se encontró paseo para el pawwer ${celularPawwer} con estado "Esperando perro"`);
    return false;
  }

  // Hora actual en Bogotá como objeto Date
  const now = new Date();
  const horaBogota = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));

  // Actualizar estado y horaInicio
  await col.updateOne(
    { _id: paseo._id },
    { $set: { Estado: "Esperando Strava", HoraInicio: horaBogota } }
  );

  console.log(`✅ Paseo ${paseo._id} actualizado a "Esperando Strava" con HoraInicio ${horaBogota.toLocaleString("es-CO")}`);
  return true;
}


export async function actualizarStravaPaseo(
  celularPawwer: number,
  stravaUrl: string
) {
  const prefix = "https://www.strava.com/beacon/";
  // Validar que la URL comience con el prefijo requerido
  if (!stravaUrl.startsWith(prefix)) {
    console.log(`❌ La URL no es válida: debe iniciar con prefixo ${prefix}`);
    return false;
  }

  const col = await connect(paseosCollection);

  // Buscar el primer paseo que coincida con el pawwer y estado "Esperando Strava"
  const paseo = await col.findOne({
    CelularPawwer: celularPawwer,
    Estado: "Esperando Strava"
  });

  if (paseo) {
    await col.updateOne(
      { _id: paseo._id },
      { $set: { Strava: stravaUrl.replace(prefix, "").trim(), Estado: "Esperando finalizacion" } }
    );

    console.log(`✅ Paseo ${paseo._id} actualizado con Strava y estado "Esperando finalizacion"`);
    return true;
  } else {
    console.log(`⚠️ No se encontró paseo para el pawwer ${celularPawwer} con estado "Esperando Strava"`);
    return false;
  }
}

export async function revisarFinalizacionPaseos() {
  const col = await connect(paseosCollection);
  const paseos = await col.find({ Estado: { $in: ["Esperando Strava", "Esperando finalizacion"] } }).toArray();

  const now = new Date();
  const bogotaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));

  for (const paseo of paseos) {
    if (!paseo.HoraInicio || !paseo.TiempoServicio) {
      console.log(`⚠️ Paseo ${paseo._id} no tiene HoraInicio o TiempoServicio`);
      continue;
    }

    const horaInicio = new Date(paseo.HoraInicio);
    const diffMs = horaInicio.getTime() + paseo.TiempoServicio * 60000 - bogotaTime.getTime();
    const minutosRestantes = Math.ceil(diffMs / (1000 * 60));

    if (minutosRestantes <= 0) {
      await col.updateOne({ _id: paseo._id }, { $set: { Estado: "Esperando finalizacion Pawwer" } });
      console.log(`✅ Paseo ${paseo._id} marcado como "Esperando finalizacion Pawwer"`);
      await TEMPLATE_finalizar_paseo_pawwer(paseo.CelularPawwer, {
        nombrePawwer: "Pawwer",
        nombrePerrito: paseo.Perro
      });
    } else {
      console.log(`⏳ Paseo ${paseo._id} le faltan ${minutosRestantes} minutos para terminar`);
    }
  }
}
export async function completarPaseoYActualizarPawwer(celularPawwer: number) {
  const colPaseos = await connect(paseosCollection);
  const colCompletados = await connect("completados");

  // Buscar el primer paseo que coincida con el pawwer y estado "Esperando finalización Pawwer"
  const paseo = await colPaseos.findOne({
    CelularPawwer: celularPawwer,
    Estado: "Esperando finalización Pawwer"
  });

  if (!paseo) {
    console.log(`⚠️ No se encontró paseo para el pawwer ${celularPawwer} con estado "Esperando finalización Pawwer"`);
    return false;
  }

  // Cambiar estado a "Completado" en la colección de paseos
  await colPaseos.updateOne(
    { _id: paseo._id },
    { $set: { Estado: "Completado" } }
  );

  // Crear copia del registro para la colección "completados" sin el _id original
  const precio = Number(paseo.Precio || 0);
  const { _id, ...rest } = paseo; // ❌ eliminamos _id para evitar duplicados
  const registroCompletado = {
    ...rest,
    Estado: "Completado",
    gananciaPawwer: precio * 0.6,
    gananciaPawwi: precio * 0.4,
    fechaCompletado: new Date()
  };

  const result = await colCompletados.insertOne(registroCompletado);
  const idCompletado = result.insertedId; // Mongo genera un _id nuevo automáticamente

  // Actualizar el pawwer agregando el id del paseo completado
  const pawwer = await getPawwerById(paseo.IdPawwer?.toString() || "");
  if (pawwer) {
    const pawwerCol = await connect("pawwers_activos"); // colección donde está el pawwer
    await pawwerCol.updateOne(
      { _id: pawwer._id },
      { $push: { PaseosCompletados: idCompletado } }
    );
  }

  console.log(`✅ Paseo ${paseo._id} completado, registrado en "completados" y actualizado en pawwer`);
  return true;
}

// ---------- FUNCIÓN: Cancelar paseos por celular ----------
export async function cancelarPaseosPorCelular(celular: number) {
  console.log("Cancelando paseos para el celular:", celular);
  
  const col = await connect(paseosCollection);

  // Buscar los paseos que coinciden con el celular
  const paseos = await col.find({ Celular: celular }).toArray();

  if (paseos.length === 0) {
    console.log(`⚠️ No se encontraron paseos para el celular ${celular}`);
    return 0;
  }

  // Actualizar todos los paseos a "Cancelado"
  const result = await col.updateMany(
    { Celular: celular },
    { $set: { Estado: "Cancelado" } }
  );

  // Notificar a soporte
  await sendText('573332885462', `El usuario ${celular} ha cancelado su paseo agendado.`);

  // Notificar a cada pawwer involucrado
  for (const paseo of paseos) {
    if (paseo.CelularPawwer) {
      await sendText(
        paseo.CelularPawwer,
        `Mongo: El dueño de ${paseo.Perro} ha cancelado su paseo agendado.`
      );
    }
  }
  await sendText(celular.toString(), "Has cancelado el agendamiento. Si deseas agendar otro paseo, por favor inicia de nuevo.");

  console.log(`✅ ${result.modifiedCount} paseo(s) cancelado(s) para el celular ${celular}`);
  return result.modifiedCount;
}

// ---------- FUNCIÓN: Obtener todos los paseos de un pawwer ----------
export async function getPaseosPorPawwer(celularPawwer: number) {
  console.log("Obteniendo paseos para el pawwer con celular:", celularPawwer);
  
  const col = await connect(paseosCollection);

  // Buscar todos los paseos donde CelularPawwer coincida
  const paseos = await col.find({ CelularPawwer: celularPawwer }).toArray();

  if (paseos.length === 0) {
    console.log(`⚠️ No se encontraron paseos para el pawwer con celular ${celularPawwer}`);
  } else {
    console.log(`✅ Se encontraron ${paseos.length} paseo(s) para el pawwer ${celularPawwer}`);
  }

  return paseos;
}

// Supongamos que esto está dentro de un handler de mensajes
export async function revisarPaseosPawwer(ctx: any) {
  try {
    const celularPawwer = parseInt(ctx.from);

    // Obtener los paseos activos
    const paseosMongo = await getPaseosPorPawwer(celularPawwer);

    if (paseosMongo.length === 0) {
      console.log(`⚠️ El pawwer ${celularPawwer} no tiene paseos activos.`);
      await sendText(celularPawwer.toString(), "No tienes paseos activos por el momento.");
      return;
    }

    console.log("Paseos en Mongo:", paseosMongo);

    // Aquí puedes iterar sobre los paseos y enviar mensajes o hacer otras acciones
    for (const paseo of paseosMongo) {
      await sendText(
        celularPawwer.toString(),
        `Tienes un paseo pendiente con ${paseo.Nombre} y su perrito ${paseo.Perro} el ${paseo.Fecha} a las ${paseo.Hora}. Estado actual: ${paseo.Estado}`
      );
    }
  } catch (error) {
    console.error("Error al revisar paseos del pawwer:", error);
  }
}
