import { addKeyword, EVENTS } from "@builderbot/bot";
import { TEMPLATE_bienvenida_pawwi, TEMPLATE_registro_agendar_paseo, TEMPLATE_registro_consideraciones_perrito, TEMPLATE_registro_edad_perrito, TEMPLATE_registro_raza_perrito, TEMPLATE_registro_nombre_perrito, TEMPLATE_registro_vacunas_perrito, TEMPLATE_agendar_tipo_paseo, TEMPLATE_agendar_fecha_paseo, TEMPLATE_ragendar_hora_paseo, TEMPLATE_agendar_metodo_pago, TEMPLATE_agendar_resumen_paseo, TEMPLATE_confirmacion_paseo_cliente, TEMPLATE_llegada_pawwer, TEMPLATE_pawwer_llego_cliente, TEMPLATE_strava_recordatorio_pawwer, TEMPLATE_link_strava_cliente, TEMPLATE_recordatorio_paseo_cliente, TEMPLATE_recordatorio_paseo_pawwer, TEMPLATE_finalizar_paseo_pawwer, TEMPLATE_paseo_finalizado_cliente, TEMPLATE_recordatorio_pago_cliente } from "../services/send-template";
import { sendText, sendButtons } from "../services/send-text";

import { getMongoClient } from '../services/mongo';
import { createLead, deleteLead, getLeads, updateLead } from "../services/airtable-leads";
import { createPaseo, getPaseoByPawwerTelefono, getPaseoByPawwerTelefonoActive, getPaseos, updatePaseo } from "../services/airtable-paseos";
import { log } from "node:console";
import { BotContext } from "@builderbot/bot/dist/types";
import { send } from "node:process";
import { createCompletado } from "../services/airtable-completados";
import { text } from "node:stream/consumers";
import { DateTime } from "luxon";

//TODO: Reiniciar conversacion con el cliente si este no ha interactuado en 1 hora

const regex = (text) => {
  if (!text || text.trim() === "") return false;
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(text.trim());
};

const perritoData = {};
const usuarioData = {};

// Define the interface for a single dog (Perro)
interface Perro {
  nombre: string;
  raza: string;
  edad: string;
  consideraciones: string;
  vacunas: boolean;
}

// Define the interface for a user (Usuario)
interface Usuario {
  celular: string;
  tipoUsuario?: string; // Optional, can be 'cliente' or 'pawwer'
  nombre: string;
  direccion: string;
  perros: Perro[];
  agendamientos: number;
  creadoEn: Date;
  perroSeleccionado?: Perro;
  diaSeleccionado?: string;
  horaSeleccionada?: string;
  metodoPago?: string;
  valor?: number;
  Direccion?: string;
  agendamientoSeleccionado?: string;
}

const createLeadMongo = async (leadData) => {
  const client = await getMongoClient();
  const db = client.db("pawwi_bot");
  const leads = db.collection("leads");
  await leads.insertOne({ ...leadData, creadoEn: new Date() });
};

const updateUsuarioDireccion = async (celular, direccion) => {
  const client = await getMongoClient();
  const db = client.db("pawwi_bot");
  const usuarios = db.collection("usuarios");
  await usuarios.updateOne({ celular }, { $set: { Direccion: direccion } });
};

const insertarPerro = async (celular: string, perroData: Perro) => { // Add type annotations to parameters
  const client = await getMongoClient();
  const db = client.db("pawwi_bot");
  const usuarios = db.collection<Usuario>("usuarios"); // <--- Optional: Use a generic for collection to get better type inference
  await usuarios.updateOne(
    { celular },
    { $push: { perros: perroData } }
  );
};

function parseFechaHora(fecha: string, hora: string): Date | null {
  if (!fecha || typeof fecha !== 'string') {
    console.warn('parseFechaHora: fecha inválida:', fecha);
    return null;
  }
  if (!hora || typeof hora !== 'string') {
    console.warn('parseFechaHora: hora inválida:', hora);
    return null;
  }

  const [dayStr, monthStr] = fecha.split('/');
  const [hourStr, minStr] = hora.split(':');

  const now = DateTime.now().setZone("America/Bogota"); // UTC-5 zona horaria

  const year = now.year;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);

  const parsed = DateTime.fromObject(
    {
      year,
      month,
      day,
      hour: parseInt(hourStr, 10),
      minute: parseInt(minStr, 10),
    },
    { zone: "America/Bogota" } // <- fuerza a usar zona horaria GMT-5
  );

  return parsed.isValid ? parsed.toJSDate() : null;
}

async function checkAndUpdatePaseoEstado(recordFields: any) {
  const fechaHoraPaseo = parseFechaHora(recordFields.Fecha, recordFields.Hora);
  if (!fechaHoraPaseo) return;

  const ahora = new Date();
  const diffMs = fechaHoraPaseo.getTime() - ahora.getTime();
  const diffMinutos = diffMs / 60000;

  // Consideramos entre 59 y 61 minutos para actualizar (ajustable)
  if (diffMinutos > 59 && diffMinutos < 61) {
    const filter = `AND({Celular}='${recordFields.Celular}', {Fecha}='${recordFields.Fecha}', {Hora}='${recordFields.Hora}')`;
    const paseosResp = await getPaseos(filter, 1, "Grid view");

    if (paseosResp.records.length === 0) {
      console.warn("No se encontró paseo para actualizar estado 1 hora");
      return;
    }

    const paseoRecord = paseosResp.records[0];

    // Solo actualizamos si el estado es distinto para evitar llamadas repetidas.
    if (paseoRecord.fields.Estado !== "Por realizarse en 1 hora") {
      await updatePaseo(paseoRecord.id, { Estado: "Por realizarse en 1 hora" });
      console.log(`🕐 Estado actualizado a 'Por realizarse en 1 hora' para paseo ID: ${paseoRecord.id}`);
    }
  }
}

const checkLeadCount = async () => {
  try {
    const ahoraColombia = DateTime.now().setZone("America/Bogota");
    const horaFormateada = ahoraColombia.toFormat("HH:mm:ss");

    console.log("🕒 Hora actual en Colombia:", horaFormateada);

    checkPaseos();
    checkLEADS();
    
  } catch (error) {
    console.error("❌ Error al consultar los leads en Airtable:", error);
  }
};


async function checkPaseos() {
  const paseos = await getPaseos();

    //PASEOS
    for (const paseo of paseos.records) {

      const fechaPaseo = parseFechaHora(paseo.fields.Fecha, paseo.fields.Hora);
      
      if (fechaPaseo) {
        const ahora = new Date();
        const diferenciaMs = fechaPaseo.getTime() - ahora.getTime();

        if (diferenciaMs <= 0) {
          console.log(`⏱️ El paseo ya ocurrió o está ocurriendo ahora.`);

          let tiempoServicioMinutos = 15;

          if (paseo.fields.TiempoServicio === "30 minutos") {
            tiempoServicioMinutos = 30;
          } else if (paseo.fields.TiempoServicio === "60 minutos") {
            tiempoServicioMinutos = 60;
          }

          const ahora = new Date();
          const finPaseo = new Date(fechaPaseo.getTime() + tiempoServicioMinutos * 60000);
          const tiempoRestanteMs = finPaseo.getTime() - ahora.getTime();

          if (tiempoRestanteMs <= 0 && paseo.fields.Estado == "Esperando finalizacion") {
            console.log(`✅ El paseo ya terminó hace ${Math.abs(Math.floor(tiempoRestanteMs / 60000))} minutos.`);
            await updatePaseo(paseo.id, { Estado: "Esperando finalizacion de Pawwer" });
            await TEMPLATE_finalizar_paseo_pawwer(paseo.fields["Numero de teléfono (from Pawwer)"][0], {
              nombrePawwer: paseo.fields["Nombre pawwer"] || "Pawwer",
              nombrePerrito: paseo.fields.Perro || "tu perrito",
            });
          } else {
            console.log(`🕒 El paseo está en curso. Faltan ${Math.ceil(tiempoRestanteMs / 60000)} minutos para que termine.`);
          }

          console.log("🗓️ Tiempo del paseo " + paseo.id + ": " + tiempoServicioMinutos + " minutos");
        }

        else {
          const minutos = Math.floor(diferenciaMs / (1000 * 60)) % 60;
          const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));

          console.log(`⏳ Faltan ${horas}h ${minutos}m para el paseo.`);

          const totalMinutos = Math.floor(diferenciaMs / (1000 * 60));

          //EN MENOS DE UN HORA
          if (totalMinutos <= 60 && paseo.fields.Estado == "Por realizarse") {
            try {
              await updatePaseo(paseo.id, { Estado: "Por realizarse en 1 hora" });
              console.log(`Cliente ${paseo.fields.Celular}`);
              console.log(`Pawwer ${paseo.fields['Numero de teléfono (from Pawwer)'][0]}`);

              //Plantilla de recordatorio cliente
              await TEMPLATE_recordatorio_paseo_cliente(paseo.fields.Celular, {
                nombreCliente: paseo.fields["Nombre cliente"] || "Cliente",
                nombrePerrito: paseo.fields.Perro || "tu perrito",
                fecha: paseo.fields.Fecha || "No definida",
                hora: paseo.fields.Hora || "No definida",
                calle: (paseo.fields.Direccion || "").split(" – ")[0] || "No definida",
                colonia: (paseo.fields.Direccion || "").split(" – ")[1] || "No definida",
                duracion: paseo.fields.TiempoServicio || "No definido",
              });

              //Plantilla de recordatorio pawwer
              const [calle = "No definida", colonia = "No definida"] = (paseo.fields.Direccion || "").split(" – ");

              await TEMPLATE_recordatorio_paseo_pawwer(paseo.fields["Numero de teléfono (from Pawwer)"]?.[0] || "", {
                nombrePawwer: paseo.fields["Nombre pawwer"] || "Pawwer",
                nombrePerrito: paseo.fields.Perro || "tu perrito",
                calle,
                colonia,
                fecha: paseo.fields.Fecha || "No definida",
                hora: paseo.fields.Hora || "No definida",
                duracion: paseo.fields.TiempoServicio || "No definido",
              });

              
              console.log(`⏰ Estado actualizado a "En menos de 1 hora" para paseo ID ${paseo.id}`);
            } 
            catch (error) {
              console.error(`❌ Error al actualizar estado del paseo ${paseo.id}:`, error);
            }
          }

          //YA VA A LLEGAR
          else if (totalMinutos <= 10 && paseo.fields.Estado == "Por realizarse en 1 hora") {
            try {
              await updatePaseo(paseo.id, { Estado: "Esperando Pawwer" });
              console.log(`⏳ Estado actualizado a "Esperando Pawwer" para paseo ID ${paseo.id}`);

              const pawwerTelefono = Array.isArray(paseo.fields.Pawwer) && paseo.fields.Pawwer.length > 0
              ? paseo.fields.Pawwer[0]
              : null;

              const nombrePawwer = "Pawwer";
              const nombrePerrito = paseo.fields.Perro || "tu perrito";

              if (pawwerTelefono) {
                await TEMPLATE_llegada_pawwer(paseo.fields["Numero de teléfono (from Pawwer)"][0], { nombrePawwer, nombrePerrito });
                console.log(`✅ Plantilla llegada_pawwer enviada a Pawwer ${pawwerTelefono}`);
              } else {
                console.warn(`⚠️ No se encontró teléfono del Pawwer para paseo ID ${paseo.id}`);
              }
            } catch (error) {
              console.error(`❌ Error al actualizar estado o enviar plantilla llegada_pawwer:`, error);
            }
          }


        }
      } else {
        console.warn(`⚠️ No se pudo interpretar la fecha/hora del paseo.`);
      }
    }
}

async function checkLEADS() {
  const filterFormula = "Estado = 'confirmado'";
    const response = await getLeads(filterFormula, 2, "Grid view");
  //LEADS
    console.log(`[LEAD COUNT] Total de leads confirmados (máx 2): ${response.records.length}`);

    for (const record of response.records) {

      const { Fecha, Hora, Pawwer, Celular } = record.fields;

      const errores: string[] = [];

      // Validar Fecha: formato DD/MM
      if (!/^\d{1,2}\/\d{1,2}$/.test(Fecha)) {
        errores.push("Formato de fecha inválido (esperado DD/MM)");
      }

      // Validar Hora: formato HH:mm
      if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(Hora)) {
        errores.push("Formato de hora inválido (esperado HH:mm)");
      }

      // Validar Pawwer
      if (!Array.isArray(Pawwer) || Pawwer.length === 0) {
        errores.push("No hay Pawwer asignado");
      }

      if (errores.length > 0) {
        console.warn(`⚠️ Registro inválido (ID: ${record.id}) para celular ${Celular}`); //TODO
        errores.forEach((e) => console.warn(` - ${e}`));

        try {
          await updateLead(record.id, { Estado: "onChange" });
          console.log(`🔁 Estado actualizado a 'onChange' para ID: ${record.id}`);

          const mensaje = `Hola 👋, tu solicitud presenta errores:\n\n${errores
            .map((e) => `• ${e}`)
            .join("\n")}\n\nPor favor revisa la información ingresada.`;
          await sendText("573332885462", mensaje);
          console.log(`📤 Mensaje de error enviado a ${Celular}`);
        } catch (updateError) {
          console.error(`❌ Error al actualizar estado o enviar mensaje:`, updateError);
        }
      } else {
        console.log(`✅ Registro válido (ID: ${record.id}):`, record.fields);

        try {
          // Cambiar estado a "validando"
          await updateLead(record.id, { Estado: "validando" });
          console.log(`🔄 Estado actualizado a 'validando' para ID: ${record.id}`);

          const nombreCliente = record.fields["Nombre cliente"]; // Si tienes el nombre real, úsalo aquí
          const nombrePerrito = record.fields.Perro || "tu peludito";
          const direccionCompleta = record.fields.Direccion || "";
          const [calle = "No definida", colonia = "No definida"] = direccionCompleta.split(" – ");
          const fecha = record.fields.Fecha || "No definida";
          const hora = record.fields.Hora || "No definida";
          const duracion = record.fields.TiempoServicio || "No definido";
          const precio = `$${record.fields.Precio || 0}`;
          const pawwer = record.fields["Nombre completo (from Pawwer)"] || "Pawwer";
          console.log(pawwer);
          

          await TEMPLATE_confirmacion_paseo_cliente(record.fields.Celular, {
            nombreCliente,
            nombrePerrito,
            calle,
            colonia,
            fecha,
            hora,
            duracion,
            precio,
            pawwer,
          });

          // Obtener número del Pawwer desde el campo correcto
          const pawwerNumeros = record.fields['Numero de teléfono (from Pawwer)'];
          const pawwerName = record.fields['Nombre completo (from Pawwer)'] || 'Pawwer';
          const pawwerNumero = Array.isArray(pawwerNumeros) ? pawwerNumeros[0] : null;

          if (pawwerNumero) {
            const mensajePawwer = `¡Hola ${pawwerName}! 🐾\nTienes una nueva solicitud asignada para el ${Fecha} a las ${Hora}.`;
            await sendText(pawwerNumero, mensajePawwer);
            console.log(`📤 Mensaje enviado al Pawwer ${pawwerNumero}`);
          } else {
            console.warn(`⚠️ No se pudo enviar mensaje al Pawwer: número no disponible`);
          }

          const nuevoPaseoData = {
            FechaCreacion: new Date().toISOString(),
            Celular: record.fields.Celular,
            Perro: record.fields.Perro,
            Anotaciones: record.fields.Anotaciones || '',
            Direccion: record.fields.Direccion,
            TipoServicio: record.fields.TipoServicio,
            TiempoServicio: record.fields.TiempoServicio,
            Fecha: record.fields.Fecha,
            Hora: record.fields.Hora,
            Precio: record.fields.Precio,
            Estado: "Por realizarse",
            Pawwer: Array.isArray(record.fields.Pawwer)
              ? record.fields.Pawwer
              : record.fields.Pawwer
                ? [record.fields.Pawwer]
                : [],
            "metodo Pago": record.fields["metodo Pago"] || "",
            "Link Strava": undefined,
            "Nombre cliente": record.fields["Nombre cliente"] || "Cliente",
          };

          await createPaseo(nuevoPaseoData);
          console.log(`✅ Registro creado en Control de paseos para lead ID ${record.id}`);

          await checkAndUpdatePaseoEstado(record.fields);

          await deleteLead(record.id);
          console.log(`🗑️ Lead eliminado con ID: ${record.id}`);

        } catch (validError) {
          console.error(`❌ Error al validar y notificar registro válido:`, validError);
        }
      }
    }
}

setInterval(checkLeadCount, 30 * 1000);

const init = addKeyword(EVENTS.WELCOME)
  .addAction(async (ctx, { endFlow, gotoFlow }) => {
    if (!ctx.body || typeof ctx.body !== "string") {
      console.log(`[IGNORADO] Mensaje inválido o sin texto. Tipo: ${ctx.messageType}`);
      return endFlow();
    }

    const nombre = ctx.pushName || "Usuario";
    console.log(`[INIT] Usuario ${nombre} ha iniciado el flujo. Número: ${ctx.from}`);
    const textoBoton = ctx.body;
    const payloadBoton = ctx.payload || "Sin payload";
    console.log(`[INTERACTION] Botón oprimido: ${textoBoton}, Payload: ${payloadBoton}`);

    if (payloadBoton == "" && textoBoton == "") {
      return endFlow();
    }
    
    try {
      const client = await getMongoClient();
      const db = client.db("pawwi_bot");
      const usuarios = db.collection("usuarios");

      let usuario = await usuarios.findOne({ celular: ctx.from });

      if (!usuario) {
        const nuevoUsuario = {
          celular: ctx.from,
          nombre,
          tipoUsuario: "cliente",
          direccion: "",
          perros: [],
          agendamientos: 0,
          creadoEn: new Date()
        };

        const res = await usuarios.insertOne(nuevoUsuario);
        usuario = { ...nuevoUsuario, _id: res.insertedId };
        console.log("✅ Usuario nuevo creado en Mongo");
      } else {
        console.log("✅ Usuario recuperado de Mongo:", usuario);

        if (usuario.tipoUsuario == "pawwer") {
          const paseo = await getPaseoByPawwerTelefonoActive(ctx.from);

          if (!paseo) {
            await sendText(ctx.from, "No tienes paseos activos en este momento. Por favor, contacta al soporte si crees que es un error.");
            console.log('❌ No se encontró ningún paseo para este Pawwer con estado "Esperando Pawwer"');
            return;
          }

          const paseoId = paseo.id;
          const fields = paseo.fields;

          const nombreCliente = Array.isArray(fields["Nombre cliente"])? fields["Nombre cliente"][0] || "Cliente": typeof fields["Nombre cliente"] === "string"? fields["Nombre cliente"]: "Cliente";
          const nombrePawwer = Array.isArray(fields["Nombre completo (from Pawwer)"])? fields["Nombre completo (from Pawwer)"][0] || "Pawwer": typeof fields["Nombre completo (from Pawwer)"] === "string"? fields["Nombre completo (from Pawwer)"]: "Pawwer";
          const nombrePerrito = fields.Perro || 'tu perrito';
          const calle = fields.Direccion || 'Dirección';
          const colonia = 'Colonia';        // Obtén de datos reales si tienes
          const fecha = fields.Fecha || '';
          const hora = fields.Hora || '';
          const duracion = fields.TiempoServicio || '';
          
          if (paseo.fields.Estado == "Esperando Pawwer") {
            if (ctx.payload !== "confirmar_llegada") {
              await TEMPLATE_llegada_pawwer(paseo.fields["Numero de teléfono (from Pawwer)"][0], { nombrePawwer, nombrePerrito });
              return endFlow();
            }
            log(`Pawwer ${usuario.nombre} ha confirmado su llegada.`);

            // 1. Actualizar estado a "Esperando Strava"
            await updatePaseo(paseoId, { Estado: 'Esperando Strava' });
            console.log(`✅ Estado del paseo ${paseoId} actualizado a "Esperando Strava"`);

            // 2. Enviar plantilla al cliente (dueño del perrito)
            await TEMPLATE_pawwer_llego_cliente(fields.Celular, {
              nombreCliente,
              nombrePawwer,
              nombrePerrito,
              calle,
              colonia,
              fecha,
              hora,
              duracion,
            });

            await TEMPLATE_strava_recordatorio_pawwer(ctx.from, {
              nombrePawwer,
              nombrePerrito,
            });
          }
          else if (paseo.fields.Estado === "Esperando Strava") {
            const linkRecibido = ctx.body.trim();

            console.log("Link recibido:", linkRecibido);

            // Validar link Strava simple (https://www.strava.com/activities/ seguido de números)
            const regexStrava = /^https:\/\/(www\.)?strava\.com\/activities\/\d+$/;

            if (!regexStrava.test(linkRecibido)) {
              await sendText(ctx.from, "Por favor, envía un link válido de Strava que tenga este formato:\nhttps://www.strava.com/activities/123456789");
              return; // Esperar que el usuario envíe el link correcto
            }

            try {
              await updatePaseo(paseo.id, {
                Estado: "Esperando finalizacion",
                "Link Strava": linkRecibido,
              });

              await sendText(ctx.from, "¡Gracias! Hemos recibido tu link de Strava y se lo enviaremos al cliente.");

              // Enviar al cliente el link recibido
              const celularCliente = paseo.fields.Celular;
              const nombrePerrito = paseo.fields.Perro || "tu perrito";

              await TEMPLATE_link_strava_cliente(celularCliente, {
                nombreCliente,
                nombrePerrito,
                linkStrava: linkRecibido,
              });

            } catch (error) {
              console.error("Error al actualizar paseo con link de Strava:", error);
              await sendText(ctx.from, "Ocurrió un error al guardar tu link, por favor intenta de nuevo.");
            }
          }
          else if("Esperando finalizacion" === paseo.fields.Estado) {
            await sendText(ctx.from, "Tienes actualmente un paseo en curso. Por favor, si deseas comentar alguna novedad o crees que es un error, contacta al numero de soporte +57 3332885462");
            
          }
          else if (paseo.fields.Estado === "Esperando finalizacion de Pawwer") {
            if (ctx.payload !== "Finalizar paseo") {
              await TEMPLATE_finalizar_paseo_pawwer(ctx.from, {
                nombrePawwer, nombrePerrito});
              return endFlow();
            }
            else {
              await sendText(ctx.from, "Gracias por finalizar el paseo. En breve el dueño recogera a su mascota");
              await TEMPLATE_paseo_finalizado_cliente(paseo.fields.Celular, {
                nombreCliente,
                nombrePerrito,
              });
              await TEMPLATE_recordatorio_pago_cliente(paseo.fields.Celular, {
                nombreCliente,
                nombrePerrito,
                valorPaseo: paseo.fields.Precio?.toString() || "No definido"
              });

              await createCompletado({
                FechaCreacion: paseo.fields.FechaCreacion,
                Celular: paseo.fields.Celular,
                Perro: paseo.fields.Perro,
                Anotaciones: paseo.fields.Anotaciones,
                Direccion: paseo.fields.Direccion,
                TipoServicio: paseo.fields.TipoServicio,
                TiempoServicio: paseo.fields.TiempoServicio,
                Fecha: paseo.fields.Fecha,
                Hora: paseo.fields.Hora,
                Precio: paseo.fields.Precio,
                Estado: paseo.fields.Estado,
                Pawwer: paseo.fields.Pawwer,
                "metodo Pago": paseo.fields["metodo Pago"],
                "Nombre cliente": paseo.fields["Nombre cliente"],
                "Nombre pawwer": Array.isArray(paseo.fields["Nombre completo (from Pawwer)"])? paseo.fields["Nombre completo (from Pawwer)"][0]: paseo.fields["Nombre completo (from Pawwer)"] || "No definido",
                "Link Strava": paseo.fields["Link Strava"],
              });


              await deleteLead(paseo.id);
            }
          }
          else{
            console.log('Ocurrio un error');
          }
          return endFlow();
        }
        else if (usuario.tipoUsuario == "support") {
          await sendText(ctx.from, `Hola ${nombre}, si lees esto es porque eres de soporte`);
          return endFlow();
        }
      }

      usuarioData[ctx.from] = usuario;

      // Cargar los perros (si existen) en perritoData
      for (const perro of usuario.perros || []) {
        const perroId = `${ctx.from}_${perro.nombre}`;
        perritoData[perroId] = { ...perro };
      }

    } catch (e) {
      console.error("❌ Error al manejar usuario desde Mongo:", e.message);
    }

    await TEMPLATE_bienvenida_pawwi(ctx.from, nombre);
  })

  .addAnswer(
    null,
    { capture: true },
    async (ctx, { endFlow, gotoFlow }) => {
      const textoBoton = ctx.body;
      const payloadBoton = ctx.payload || "Sin payload";

      console.log(`[INTERACTION] Botón oprimido: ${textoBoton}, Payload: ${payloadBoton}`);

      if (payloadBoton === "Registrar a mi perrito") {
        perritoData[ctx.from] = {};
        return gotoFlow(RegistrarNombrePerrito);
      }

      else if (payloadBoton === "Agendar un paseo") {
        if (!usuarioData[ctx.from] || !usuarioData[ctx.from].perros || usuarioData[ctx.from].perros.length === 0) {
          return gotoFlow(RegistrarNombrePerrito);
        } else {
          return gotoFlow(AgendarlistarPerritos);
        }
      }

      else if (payloadBoton === "Hablar con el equipo") {
        await sendText(ctx.from, `En unos instantes nuestro Pawwier de soporte se comunicara contigo. O puedes comunicarte al número +57 3332885462`);
        await sendText('573332885462', `El usuario ${ctx.from} ha solicitado hablar con el equipo de soporte.`);
        return endFlow();
      }

      else if (payloadBoton === "Conviértete en Pawwer") {
        await sendText(ctx.from, `Perfecto, para ser un Pawwer, completa el siguiente formulario: https://tally.so/r/wMyVRE`);
        return endFlow();
      }

      else {
        return gotoFlow(init);
      }
    }
  );

const RegistrarNombrePerrito = addKeyword('RegistrarNombrePerrito')
  .addAction(async (ctx) => {
      await TEMPLATE_registro_nombre_perrito(ctx.from);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
      const nombre = ctx.body.trim();
      if (!regex(nombre)) {
        await sendText(ctx.from, `Por favor, responde solo con el nombre
de tu perrito, sin números, símbolos
ni emojis.
Ejemplo: Max, Luna, Toby.`);
        return gotoFlow(init);
      }
      perritoData[ctx.from] = perritoData[ctx.from] || {};
      perritoData[ctx.from].nombre = nombre;
      return gotoFlow(RegistrarRazaPerrito);
  });

const RegistrarRazaPerrito = addKeyword('RegistrarRazaPerrito')
  .addAction(async (ctx) => {
      await TEMPLATE_registro_raza_perrito(ctx.from, perritoData[ctx.from]?.nombre || "");
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
      const raza = ctx.body.trim();
      if (!regex(raza)) {
        await sendText(ctx.from, `Por favor, responde solo con la raza de tu perrito, sin números, símbolos ni emojis.
Ejemplo: Husky, Pitbull, criollo.`);
        return gotoFlow(init);
      }
      perritoData[ctx.from].raza = raza;
      return gotoFlow(RegistrarEdadPerrito);
  });

const RegistrarEdadPerrito = addKeyword('RegistrarEdadPerrito')
  .addAction(async (ctx) => {
      await TEMPLATE_registro_edad_perrito(ctx.from, perritoData[ctx.from]?.nombre || "");
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
      const edad = ctx.body.trim();
      perritoData[ctx.from].edad = edad;
      return gotoFlow(RegistrarConsideracionesPerrito);
  });

const RegistrarConsideracionesPerrito = addKeyword('RegistrarConsideracionesPerrito')
  .addAction(async (ctx) => {
      await TEMPLATE_registro_consideraciones_perrito(ctx.from, perritoData[ctx.from]?.nombre || "");
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
      const consideraciones = ctx.body.trim();
      perritoData[ctx.from].consideraciones = consideraciones;
      return gotoFlow(RegistrarVacunasPerrito);
  });

const RegistrarVacunasPerrito = addKeyword('RegistrarVacunasPerrito')
  .addAction(async (ctx) => {
      await TEMPLATE_registro_vacunas_perrito(ctx.from, perritoData[ctx.from]?.nombre || "");
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
      //const vacunas = ctx.body.trim();
      const textoBoton = ctx.body;
      const payloadBoton = ctx.payload || "Sin payload";
      console.log(`[INTERACTION] Botón oprimido: ${textoBoton}, Payload: ${payloadBoton}`);
      if (payloadBoton === "VACUNAS_SI") {
        perritoData[ctx.from].vacunas = true;
        return gotoFlow(RegistrarPerro);
      } 
      else if (payloadBoton === "VACUNAS_NO") {
        perritoData[ctx.from].vacunas = false;
        return gotoFlow(init);
      }
      else {
        await sendText(ctx.from, `Por favor, selecciona una opción válida.`);
        return gotoFlow(RegistrarVacunasPerrito);
      }
      
  });

const RegistrarDireccion = addKeyword('RegistrarDireccion')
  .addAction(async (ctx) => {
    await sendText(ctx.from, `📍 ¿Cuál es la dirección exacta donde recogeremos a tus peluditos?.`);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
    const direccion = ctx.body.trim();

    if (!direccion || direccion.length < 10) {
      await sendText(ctx.from, `🚫 La dirección parece muy corta o incompleta.`);
      return gotoFlow(RegistrarDireccion);
    }

    usuarioData[ctx.from].Direccion = direccion;

    try {
      await updateUsuarioDireccion(ctx.from, direccion);
    } catch (e) {
      console.error("Error actualizando dirección en Mongo", e?.message || e);
    }

    return gotoFlow(agendarMetodoPaseo);
  });


const RegistrarPerro = addKeyword('RegistrarPerro')
  .addAction(async (ctx) => {
    const data = perritoData[ctx.from];
    try {
      await insertarPerro(ctx.from, data);
    } catch (e) {
      console.error("❌ Error guardando perro en Mongo:", e.message);
    }
    await TEMPLATE_registro_agendar_paseo(ctx.from, perritoData[ctx.from]?.nombre || "");
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
    usuarioData[ctx.from].perroSeleccionado = perritoData[ctx.from];
    return gotoFlow(agendarTiempoPaseo);
  });


const AgendarlistarPerritos = addKeyword('AgendarlistarPerritos')
  .addAction(async (ctx) => {
    const currentUser = usuarioData[ctx.from];

    if (!currentUser || !currentUser.perros || currentUser.perros.length === 0) {
      await sendText(ctx.from, "No tienes perritos registrados.\n\nSi deseas registrar un nuevo perrito, por favor selecciona la opción correspondiente en el menú principal.");
      return;
    }

    const perrosRegistrados = currentUser.perros; // Use the dogs from the user object

    // 2. Create buttons from the registered dogs
    const buttons = perrosRegistrados.map(perro => ({
      // Assuming 'nombre' is the property for the dog's name in your Perro interface
      body: perro.nombre,
      payload: perro.nombre // Use the dog's name as payload for selection
    }));

    await sendButtons(ctx.from, "¿A quien vamos a pasear hoy?", buttons);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
    const selectedDogName = ctx.body; // The user's response will be the dog's name from the button
    const currentUser = usuarioData[ctx.from];

    // 3. Find the selected dog in the user's registered dogs
    const perroSeleccionado = currentUser.perros.find(
      (perro) => perro.nombre === selectedDogName
    );

    if (perroSeleccionado) {
      // --- ADD THIS CONSOLE.LOG HERE ---
      console.log("------------------------------------");
      console.log("Perro seleccionado por el usuario:");
      console.log("Nombre:", perroSeleccionado.nombre);
      console.log("Raza:", perroSeleccionado.raza);
      console.log("Edad:", perroSeleccionado.edad);
      console.log("Consideraciones:", perroSeleccionado.consideraciones);
      console.log("Vacunas:", perroSeleccionado.vacunas);
      console.log("------------------------------------");
      // --- END CONSOLE.LOG ADDITION ---

      // 4. Store the selected dog in usuarioData for later use
      currentUser.perroSeleccionado = perroSeleccionado;
      usuarioData[ctx.from] = currentUser; // Update the global usuarioData

      return gotoFlow(agendarTiempoPaseo);
    } else {
      await sendText(ctx.from, `Por favor, selecciona un perrito válido de la lista.`);
      return gotoFlow(AgendarlistarPerritos); // Go back to list dogs if invalid selection
    }
  });

const agendarTiempoPaseo = addKeyword('agendarTiempoPaseo')
  .addAction(async (ctx) => {
    // Usa la plantilla con el nombre del perrito seleccionado
    const nombrePerro = usuarioData[ctx.from]?.perroSeleccionado?.Nombre || "tu peludito";
    await TEMPLATE_agendar_tipo_paseo(ctx.from, nombrePerro);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
    const payloadBoton = ctx.payload || "";
    let agendamiento = '';
    let precio = 0;
    console.log(`[INTERACTION] Payload recibido: ${payloadBoton}`);

    switch (payloadBoton) {
      case 'FLASH_15_MIN':
        agendamiento = '15 minutos';
        precio = 7500;
        break;
      case 'CHILL_30_MIN':
        agendamiento = '30 minutos';
        precio = 10000;
        break;
      case 'ADVENTURE_1_HORA':
        agendamiento = '60 minutos';
        precio = 17000;
        break;
      default:
        await sendText(ctx.from, 'Por favor, selecciona una opción válida usando los botones.');
        return gotoFlow(agendarTiempoPaseo);
    }

    if (!usuarioData[ctx.from]) usuarioData[ctx.from] = {};
    usuarioData[ctx.from].agendamientoSeleccionado = agendamiento;
    usuarioData[ctx.from].valor = precio;

    return gotoFlow(agendarDiaPaseo);
  });

const agendarDiaPaseo = addKeyword('agendarDiaPaseo')
  .addAction(async (ctx) => {
    const nombrePerro = usuarioData[ctx.from]?.perroSeleccionado?.Nombre || "tu peludito";
    await TEMPLATE_agendar_fecha_paseo(ctx.from, nombrePerro);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
    const diaSeleccionado = ctx.body.trim();

    if (diaSeleccionado == "Hoy" || diaSeleccionado == "Mañana") {
      const fecha = new Date();
      if (diaSeleccionado == "Mañana") {
        fecha.setDate(fecha.getDate() + 1);
      }
      //Guardar en texto como formato mm/dd
      const diaFormateado = `${fecha.getDate()}/${fecha.getMonth() + 1}`;
      usuarioData[ctx.from].diaSeleccionado = diaFormateado;
    }
    else {
      usuarioData[ctx.from].diaSeleccionado = diaSeleccionado;
    }
    return gotoFlow(agendarHoraPaseo);
  });

const agendarHoraPaseo = addKeyword('agendarHoraPaseo')
  .addAction(async (ctx) => {
    const nombrePerro = usuarioData[ctx.from]?.perroSeleccionado?.Nombre || "tu peludito";
    await TEMPLATE_ragendar_hora_paseo(ctx.from, nombrePerro);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
    const horaSeleccionado = ctx.body.trim();

    usuarioData[ctx.from] ??= {};
    usuarioData[ctx.from].horaSeleccionada = horaSeleccionado;

    if (usuarioData[ctx.from].Direccion === undefined || usuarioData[ctx.from].Direccion === "") {
        //await sendText(ctx.from, "Por favor, primero registra la dirección donde recogeremos a tu peludito.");
        return gotoFlow(RegistrarDireccion);
    }
    else {
      return gotoFlow(agendarMetodoPaseo);
    }
  });

//Metodo de pago
const agendarMetodoPaseo = addKeyword('agendarMetodoPaseo')
  .addAction(async (ctx) => {
    const nombrePerro = usuarioData[ctx.from]?.perroSeleccionado?.Nombre || "tu peludito";
    await TEMPLATE_agendar_metodo_pago(ctx.from, nombrePerro);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
    const metodo = ctx.body.trim().toLowerCase();

    usuarioData[ctx.from] ??= {};
    usuarioData[ctx.from].metodoPago = metodo;

    return gotoFlow(agendarResumenPaseo); // o el flujo siguiente que uses
  });  

const agendarResumenPaseo = addKeyword('agendarResumenPaseo')
  .addAction(async (ctx) => {
    const data: Usuario = usuarioData[ctx.from];
    const selectedDog = data.perroSeleccionado; // Get the selected dog object for easier access

    await TEMPLATE_agendar_resumen_paseo(ctx.from, {
      dogName: selectedDog?.nombre || 'No definido', // Use .nombre
      calle: data.Direccion?.split(' – ')[0] || 'No definida',
      colonia: data.Direccion?.split(' – ')[1] || 'No definida',
      fecha: data.diaSeleccionado || 'No definida',
      hora: data.horaSeleccionada || 'No definida',
      tipoPaseo: data.agendamientoSeleccionado || 'No definido',
      precio: `$${data.valor || 0}`,
      metodoPago: data.metodoPago || 'No definido'
    });
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { endFlow, gotoFlow }) => {
    const textoBoton = ctx.body;
    const payloadBoton = ctx.payload || '';
    if (textoBoton === 'Si' || payloadBoton === 'SI') {
      try {
        const data: Usuario = usuarioData[ctx.from];
        const selectedDog = data.perroSeleccionado; // Get the selected dog object

        await createLead({
          FechaCreacion: new Date().toISOString(),
          Celular: ctx.from,
          "Nombre cliente": ctx.pushName || 'Usuario',
          Perro: selectedDog?.nombre ?? 'No definido',
          Anotaciones: `Raza: ${selectedDog?.raza ?? 'No definida'}, Edad: ${selectedDog?.edad ?? 'No definida'}, Consideraciones: ${selectedDog?.consideraciones ?? 'No definidas'}, Vacunas: ${selectedDog?.vacunas !== undefined ? (selectedDog.vacunas ? 'Sí' : 'No') : 'No definida'}`,
          Direccion: data.Direccion ?? 'No definida',
          TipoServicio: 'paseo',
          TiempoServicio: data.agendamientoSeleccionado ?? 'No definido',
          Fecha: data.diaSeleccionado ?? 'No definida',
          Hora: data.horaSeleccionada ?? 'No definida',
          Precio: data.valor ?? 0,
          Estado: 'Pendiente',
          Pawwer: '',
          "metodo Pago": data.metodoPago ?? 'No especificado'
        });


        await createLeadMongo({
          celular: ctx.from,
          perro: selectedDog?.nombre || 'No definido', // Ensure .nombre is used
          // --- MODIFICATION HERE: Use lowercase properties and add nullish coalescing ---
          anotaciones: `Raza: ${selectedDog?.raza || 'No definida'}, Edad: ${selectedDog?.edad || 'No definida'}, Consideraciones: ${selectedDog?.consideraciones || 'No definidas'}, Vacunas: ${selectedDog?.vacunas !== undefined ? (selectedDog.vacunas ? 'Sí' : 'No') : 'No definida'}`,
          // --- END MODIFICATION ---
          direccion: data.Direccion || 'No definida', // Add fallback
          tipoServicio: 'paseo',
          tiempoServicio: data.agendamientoSeleccionado || 'No definido', // Add fallback
          fecha: data.diaSeleccionado || 'No definida', // Add fallback
          hora: data.horaSeleccionada || 'No definida', // Add fallback
          precio: data.valor || 0, // Add fallback
          estado: 'Pendiente',
          pawwer: 'No asignado',
          metodoPago: data.metodoPago || 'No especificado' // Add fallback
        });

        await sendText(ctx.from, `En unos instantes nuestro Equipo de Pawwi se estará comunicando contigo para confirmar el paseo 🐶
Si tienes dudas con tu servicio, o quieres comentar una novedad, contáctate con nuestro Pawwer de soporte +57 3023835152`);
        await sendText('573332885462', `🔔 Lead nuevo registrado desde el bot.
          
Nombre: ${ctx.pushName || 'Usuario'} 
Perro: ${selectedDog?.nombre || 'No definido'}
Anotaciones: 
  Raza: ${selectedDog?.raza || 'No definida'}, 
  Edad: ${selectedDog?.edad || 'No definida'}, 
  Consideraciones: ${selectedDog?.consideraciones || 'No definidas'}, 
  Vacunas: ${selectedDog?.vacunas !== undefined ? (selectedDog.vacunas ? 'Sí' : 'No') : 'No definida'}
  Dirección: ${data.Direccion || 'No definida'}
  Tiempo de servicio: ${data.agendamientoSeleccionado || 'No definido'}
Fecha: ${data.diaSeleccionado || 'No definida'}
Hora: ${data.horaSeleccionada || 'No definida'}
Precio: $${data.valor || 0}`);
      } catch (e) {
        await sendText(ctx.from, `Ocurrió un error al guardar el agendamiento.`);
        console.error("Error al crear el lead:", e?.message || e);
      }
      return endFlow();
    } else if (textoBoton === 'No' || payloadBoton === 'NO') {
      await sendText(ctx.from, `Por favor, vuelve a intentar agendar el paseo.`);
      return gotoFlow(init);
    } else {
      await sendText(ctx.from, `Por favor, selecciona una opción válida.`);
      return gotoFlow(agendarResumenPaseo);
    }
  });

export { init, RegistrarNombrePerrito, RegistrarRazaPerrito, RegistrarEdadPerrito, RegistrarConsideracionesPerrito, RegistrarVacunasPerrito, RegistrarDireccion, RegistrarPerro, AgendarlistarPerritos, agendarTiempoPaseo, agendarDiaPaseo, agendarHoraPaseo, agendarMetodoPaseo, agendarResumenPaseo};


//TODO: Revisar BDD para enviar confirmacion a cliente y a paseador

//TODO: Revisar BDD para enviar recordatorio 1 hora antes del paseo

//TODO: Flujo de pawwer dividido con el del cliente

//Notas: