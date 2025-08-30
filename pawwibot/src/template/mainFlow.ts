import { addKeyword, EVENTS } from "@builderbot/bot";
import { TEMPLATE_bienvenida_pawwi, TEMPLATE_registro_agendar_paseo, TEMPLATE_registro_consideraciones_perrito, TEMPLATE_registro_edad_perrito, TEMPLATE_registro_raza_perrito, TEMPLATE_registro_nombre_perrito, TEMPLATE_registro_vacunas_perrito, TEMPLATE_agendar_tipo_paseo, TEMPLATE_agendar_fecha_paseo, TEMPLATE_ragendar_hora_paseo, TEMPLATE_agendar_metodo_pago, TEMPLATE_agendar_resumen_paseo, TEMPLATE_confirmacion_paseo_cliente, TEMPLATE_llegada_pawwer, TEMPLATE_pawwer_llego_cliente, TEMPLATE_strava_recordatorio_pawwer, TEMPLATE_link_strava_cliente, TEMPLATE_recordatorio_paseo_cliente, TEMPLATE_recordatorio_paseo_pawwer, TEMPLATE_finalizar_paseo_pawwer, TEMPLATE_paseo_finalizado_cliente, TEMPLATE_recordatorio_pago_cliente, TEMPLATE_recibir_perro_pawwer } from "../services/send-template";
import { sendText, sendButtons } from "../services/send-text";

import { getMongoClient } from '../services/mongo';
import { createLead, deleteLead, getLeads, updateLead } from "../services/airtable-leads";
import { createPaseo, getPaseoByPawwerTelefono, getPaseoByPawwerTelefonoActive, getPaseos, updatePaseo } from "../services/airtable-paseos";
import { log } from "node:console";
import { createCompletado, getCompletados } from "../services/airtable-completados";
import { DateTime } from "luxon";
import { crearPawwerActivo } from "~/services/airtable-pawwersActivos";
import { getPaso4, updatePaso4 } from "~/services/registroPawwers";
import { send } from "node:process";

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

function parseNumero(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[,]+/g, '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export async function sumarCampoPorCelular(celular: string, campo: string): Promise<number> {
  let total = 0;
  let offset: string | undefined = undefined;
  const formula = `{Celular} = "${celular}"`;

  do {
    const response = await getCompletados(formula, 100, 'Grid view', offset);
    for (const record of response.records) {
      // Accedemos dinámicamente al campo. TS no sabe su forma exacta, así que lo tratamos como any.
      const raw = (record.fields as any)[campo];
      total += parseNumero(raw);
    }
    offset = response.offset;
  } while (offset);

  return total;
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

  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);

  if (
    isNaN(day) || isNaN(month) || isNaN(hour) || isNaN(minute) ||
    day <= 0 || day > 31 || month <= 0 || month > 12
  ) {
    console.warn(`parseFechaHora: valores inválidos -> fecha=${fecha}, hora=${hora}`);
    return null;
  }

  const year = DateTime.now().setZone("America/Bogota").year;

  const parsed = DateTime.fromObject(
    { year, month, day, hour, minute },
    { zone: "America/Bogota" }
  );

  return parsed.isValid ? parsed.toJSDate() : null;
}


async function activarPawwersPendientesPaso4() {
  try {
    // 🔍 Buscar registros en Paso 4 con condición personalizada
    const response = await getPaso4('{Activar} = "Activar"'); // <-- o el campo que uses de bandera

    if (response.records.length === 0) {
      console.log("✅ No hay pawwers pendientes por activar en Paso 4.");
      return;
    }

    console.log(`🔄 Encontrados ${response.records.length} pawwers en Paso 4 para activar.`);

    for (const record of response.records) {
      const { id, fields } = record;

      const nombre = fields["Nombre"];
      const cedula = fields["Cedula"];
      const telefono = fields["Telefono"];

      // 1. Crear registro en Pawwers Activos (ajusta los nombres a esa tabla)
      await crearPawwerActivo({
        "Nombre completo": nombre,
        "Cedula de ciudadanía": cedula,
        "Numero de teléfono": telefono,
        "Status": "Activo",
      });

      console.log(`📥 Registrado en Pawwers Activos: ${nombre}`);

      // 2. Actualizar el registro en Paso 4 para marcarlo como activado
      await updatePaso4(id, {
        "Activar": "Activado", // <-- asegúrate que exista este campo en Paso 4
      });

      console.log(`✅ Pawwer activado en Paso 4: ${nombre} (${id})`);
    }
  } catch (error) {
    console.error("❌ Error al activar pawwers desde Paso 4:", error);
  }
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

const timeLead = async () => {
  try {
    console.log("Time leads");
    
    checkLEADS();
    
  } catch (error) {
    console.error("❌ Error al consultar los leads en Airtable:", error);
  }
};

const timePaseos = async () => {
  try {
    console.log("Time paseos");
    checkPaseos();
    
  } catch (error) {
    console.error("❌ Error al consultar los leads en Airtable:", error);
  }
};

const timeActivarPendientes = async () => {
  try {
    console.log("Time activar");
    activarPawwersPendientesPaso4()
    
  } catch (error) {
    console.error("❌ Error al consultar los leads en Airtable:", error);
  }
};


async function checkPaseos() {
  const paseos = await getPaseos();
  console.log(`🔄 Verificando ${paseos.records.length} paseos...`);

    //PASEOS
    for (const paseo of paseos.records) {

      if (paseo.fields.Estado === "Por realizarse" || paseo.fields.Estado === "Por realizarse en 1 hora") {
        
        const fechaPaseo = parseFechaHora(paseo.fields.Fecha, paseo.fields.Hora);
      
        if (fechaPaseo) {
          const ahora = new Date();
          const diferenciaMs = fechaPaseo.getTime() - ahora.getTime();

          //imprimir cuanto falta para el paseo
          const minutosRestantes = Math.floor(diferenciaMs / (1000 * 60));
          const horasRestantes = Math.floor(diferenciaMs / (1000 * 60 * 60));
          console.log(`⏳ Faltan ${horasRestantes} horas y ${minutosRestantes} minutos para el paseo ID ${paseo.id}`);

          if (horasRestantes == 0 && paseo.fields.Estado == "Por realizarse") {
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
              duracion: paseo.fields.TiempoServicio || "No definido",
            });

            //Plantilla de recordatorio pawwer
            const [calle = "No definida", colonia = "No definida"] = (paseo.fields.Direccion || "").split(" – ");

            await TEMPLATE_recordatorio_paseo_pawwer(paseo.fields["Numero de teléfono (from Pawwer)"]?.[0] || "", {
              nombrePawwer: paseo.fields["Nombre pawwer"] || "Pawwer",
              nombrePerrito: paseo.fields.Perro || "tu perrito",
              calle,
              fecha: paseo.fields.Fecha || "No definida",
              hora: paseo.fields.Hora || "No definida",
              duracion: paseo.fields.TiempoServicio || "No definido",
            });

            
            console.log(`⏰ Estado actualizado a "En menos de 1 hora" para paseo ID ${paseo.id}`);
          }
          //EN MENOS DE 10 MINUTOS
          else if (horasRestantes == 0 && minutosRestantes <= 10 && paseo.fields.Estado == "Por realizarse en 1 hora") {
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
      }
      if (paseo.fields.Estado === "Esperando Strava" || paseo.fields.Estado === "Esperando finalizacion") {
        const horaInicio = paseo.fields.HoraInicio;
        const horaActual = DateTime.now().setZone("America/Bogota");

        // Calcular el tiempo transcurrido solo si horaInicio existe y es válida
        if (horaInicio) {
          // Adaptar el parseo al formato "yyyy-MM-dd HH:mm:ss"
          const inicio = DateTime.fromFormat(horaInicio, "yyyy-MM-dd HH:mm:ss", { zone: "America/Bogota" });
          if (inicio.isValid) {
            const diff = horaActual.diff(inicio, ["hours", "minutes", "seconds"]).toObject();
            console.log(
              `Tiempo transcurrido desde el inicio: ${diff.hours ?? 0} horas, ${diff.minutes ?? 0} minutos, ${Math.floor(diff.seconds ?? 0)} segundos`
            );

            const minutosTranscurridos = (diff.hours ?? 0) * 60 + (diff.minutes ?? 0);

            // Ejemplo: imprimir si son más de 15 minutos y el servicio es de 15 minutos
            if (minutosTranscurridos > 15 && paseo.fields.TiempoServicio === "15 minutos") {
              console.log("⏰ El paseo de 15 minutos ya superó los 15 minutos.");
            }

            if (
              (minutosTranscurridos > 15 && paseo.fields.TiempoServicio === "15 minutos") ||
              (minutosTranscurridos > 30 && paseo.fields.TiempoServicio === "30 minutos") ||
              (minutosTranscurridos > 60 && paseo.fields.TiempoServicio === "60 minutos")
            ) {
              await updatePaseo(paseo.id, { Estado: "Esperando finalizacion de Pawwer" });
              console.log(`✅ Estado actualizado a "Esperando finalizacion" para paseo ID ${paseo.id}`);

              await TEMPLATE_finalizar_paseo_pawwer(
                Array.isArray(paseo.fields["Numero de teléfono (from Pawwer)"])
                  ? paseo.fields["Numero de teléfono (from Pawwer)"][0]
                  : paseo.fields["Numero de teléfono (from Pawwer)"],
                {
                  nombrePawwer: paseo.fields["Nombre pawwer"] || "Pawwer",
                  nombrePerrito: paseo.fields.Perro || "tu perrito"
                }
              );
            }
          } else {
            console.log("horaInicio no es una fecha válida:", horaInicio);
          }
        } else {
          console.log("No hay horaInicio registrada para este paseo.");
        }
      }
    }


          /*
          if (diferenciaMs < 0) {
            const minutos = Math.floor(diferenciaMs / (1000 * 60)) % 60;
            const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));

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
        }
        
      }
      //Este campo revisara la hora de inicio, y marcara esperando finalizacion de pawwer considerando el tiempo del servicio
      else if (paseo.fields.Estado === "Esperando finalizacion") {
        console.log(`Paseo ${paseo.id} está en estado "Esperando finalizacion de Pawwer", no se requiere acción inmediata.`);
      }
    }
      */
}

async function checkLEADS() {
  const filterFormula = "Estado = 'confirmado'";
    const response = await getLeads(filterFormula, 2, "Grid view");
  //LEADS

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
          const [calle = "No definida", colonia = ""] = direccionCompleta.split(" – ");
          const fecha = record.fields.Fecha || "No definida";
          const hora = record.fields.Hora || "No definida";
          const duracion = record.fields.TiempoServicio || "No definido";
          const precio = `$${record.fields.Precio || 0}`;

          const pawwerNumeros = record.fields['Numero de teléfono (from Pawwer)'];
          const pawwerName = record.fields['Nombre completo (from Pawwer)'] || 'Pawwer';
          const pawwerNumero = Array.isArray(pawwerNumeros) ? pawwerNumeros[0] : null;

          let pawwerNombre = "Pawwer"; // valor por defecto

          const pawwerField = record.fields["Nombre completo (from Pawwer)"];
          if (Array.isArray(pawwerField) && pawwerField.length > 0) {
            pawwerNombre = pawwerField[0]; // o usa otro campo si es un ID y necesitas el nombre real
          } else if (typeof pawwerField === "string") {
            pawwerNombre = pawwerField;
          }

          await sendText(record.fields.Celular, `Tu paseo ha sido confirmado y un Pawwer ha sido asignado. \nFecha:${Fecha}\nHora: ${Hora}\n\nSi quieres modificar o cancelar tu paseo, contactate al numero de soporte +57 3332885462 ¡Gracias por confiar en nosotros! 🐶`);
          await sendText(pawwerNumero, `Tienes una nueva solicitud de paseo asignada para el ${Fecha} a las ${Hora}. Por favor, revisa los detalles y prepárate para brindar un excelente servicio. ¡Gracias por ser parte de nuestro equipo! 🐾`);

          await TEMPLATE_confirmacion_paseo_cliente(record.fields.Celular, {
            nombreCliente: String(nombreCliente),
            nombrePerrito: String(nombrePerrito),
            calle: String(calle),
            colonia: String(colonia),
            fecha: String(fecha),
            hora: String(hora),
            duracion: String(duracion),
            precio: String(precio),
            pawwer: String(pawwerNombre),
          });

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
            HoraInicio: "",
            HoraFin: "",
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

setTimeout(() => {
  timeLead();
  setInterval(timeLead, 12 * 1000);
},0); 

setTimeout(() => {
  timePaseos();
  setInterval(timePaseos, 15 * 1000);
}, 10000); 


setTimeout(() => {
  timeActivarPendientes();
  setInterval(timeActivarPendientes, 120 * 1000);
}, 5000);


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
            const campo = 'Ganancia Pawwer';
            const gananciasPawwer = await sumarCampoPorCelular(ctx.from, campo);
            await sendText(ctx.from, `No tienes paseos activos en este momento. Has acumulado un total de $${gananciasPawwer} en ganancias. Si crees que es un error, por favor contacta al soporte. +57 3332885462`);
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
            await updatePaseo(paseoId, { Estado: 'Esperando perro' });
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

            //Mensaje de dale click al boton cuando recibas al perro
            await sendText(ctx.from, "Por favor, espera a que el cliente te entregue al perrito antes de confirmar tu llegada. Escribe \"Recibido\" cuando tengas al perrito contigo.");
            await TEMPLATE_recibir_perro_pawwer(ctx.from, { nombrePerrito });
            return endFlow();
          }
          else if (paseo.fields.Estado === "Esperando perro") {
            if (ctx.body !== "Recibido") {
              await sendText(ctx.from, "Por favor, espera a que el cliente te entregue al perrito antes de confirmar tu llegada. Escribe \"Recibido\" cuando tengas al perrito contigo.");
              return endFlow();
            }
            //actualuizar horaInicio y estado a esperando strava
            const horaInicio = DateTime.now().setZone("America/Bogota").toFormat("yyyy-MM-dd HH:mm:ss");

            await updatePaseo(paseoId, { HoraInicio: horaInicio, Estado: 'Esperando Strava' });
            console.log(`✅ Hora de inicio y estado del paseo ${paseoId} actualizados`);
            await TEMPLATE_strava_recordatorio_pawwer(ctx.from, {
              nombrePawwer,
              nombrePerrito,
            });
          }
          else if (paseo.fields.Estado === "Esperando Strava") {
            const linkRecibido = ctx.body.trim();

            console.log("Link recibido:", linkRecibido);

            //TODO: beacon/

            const rege = /(https?:\/\/)?(www\.)?strava\.com/;

            const match = linkRecibido.match(rege);

            if (match) {
              console.log("Coincidencia:", match[0]);
              // Enviar al cliente el link recibido
              const celularCliente = paseo.fields.Celular;
              const nombrePerrito = paseo.fields.Perro || "tu perrito";

              await TEMPLATE_link_strava_cliente(celularCliente, {
                            nombreCliente : celularCliente,
                            nombrePerrito: nombrePerrito,
                            linkStrava: linkRecibido,
                          });
              
              try {
                await updatePaseo(paseo.id, {
                  Estado: "Esperando finalizacion",
                  "Link Strava": linkRecibido,
                });

              } catch (error) {
                console.error("Error al actualizar paseo con link de Strava:", error);
                await sendText(ctx.from, "Ocurrió un error al guardar tu link, por favor intenta de nuevo.");
              }

            } else {
              console.log("No coincide");
              await sendText(ctx.from, "El link de Strava que has enviado no es valido, tu link debe ser por ejemplo como el siguiente: https://www.strava.com/beacon/oH0qqnaCRNM");
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
                HoraInicio: paseo.fields.HoraInicio,
                HoraFin: DateTime.now().setZone("America/Bogota").toISO(),
                Precio: paseo.fields.Precio,
                Estado: "Finalizado",
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

    if (payloadBoton == 'Confirmar') {
      return endFlow();
    }
    else if (payloadBoton == 'Cancelar') {
      //Cobtener el primer paseo donde el celular sea igual y el estado sea agendado
      const paseoAgendado = await getPaseos();
      for (const paseo of paseoAgendado.records) {
        console.log(paseo.fields.Celular == ctx.from);
        
        if (paseo.fields.Celular == ctx.from && paseo.fields.Estado != "Cancelado") {
          await updatePaseo(paseo.id, { Estado: "Cancelado" });
          await sendText('573332885462', `El usuario ${ctx.from} ha cancelado su paseo agendado.`);
          await sendText(paseo.fields["Numero de teléfono (from Pawwer)"]?.[0] || "", `El dueño de ${paseo.fields.Perro} ha cancelado su paseo agendado.`);
          console.log(`✅ Paseo cancelado para el usuario ${ctx.from}`);
        }
      }

      await sendText(ctx.from, "Has cancelado el agendamiento. Si deseas agendar otro paseo, por favor inicia de nuevo.");
      return endFlow();
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
        precio = 9000;
        break;
      case 'CHILL_30_MIN':
        agendamiento = '30 minutos';
        precio = 15000;
        break;
      case 'ADVENTURE_1_HORA':
        agendamiento = '60 minutos';
        precio = 23000;
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
      
      const zonaColombia = "America/Bogota";

      // Obtener fecha actual en hora Colombia
      let fecha = DateTime.now().setZone(zonaColombia);

      // Si el usuario eligió "Mañana", sumamos un día
      if (diaSeleccionado === "Mañana") {
        fecha = fecha.plus({ days: 1 });
      }

      // Validar que la fecha sea válida
      if (fecha.isValid) {
        // Formatear como dd/MM con ceros
        const diaFormateado = fecha.toFormat("dd/LL"); // LL es mes con cero
        console.log("✅ Día formateado:", diaFormateado);
        usuarioData[ctx.from].diaSeleccionado = diaFormateado;
      } else {
        console.error("❌ 'fecha' no es válida:", fecha.invalidExplanation);
      }
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
Si tienes dudas con tu servicio, o quieres comentar una novedad, contáctate con nuestro Pawwer de soporte +57 3332885462`);
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
      await sendText(ctx.from, `Por favor, selecciona una opción válida. Si necesitas ayuda, contáctanos al numero de soporte +57 3332885462`);
      return gotoFlow(agendarResumenPaseo);
    }
  });


export { init, RegistrarNombrePerrito, RegistrarRazaPerrito, RegistrarEdadPerrito, RegistrarConsideracionesPerrito, RegistrarVacunasPerrito, RegistrarDireccion, RegistrarPerro, AgendarlistarPerritos, agendarTiempoPaseo, agendarDiaPaseo, agendarHoraPaseo, agendarMetodoPaseo, agendarResumenPaseo};


//TODO: Revisar BDD para enviar confirmacion a cliente y a paseador

//TODO: Revisar BDD para enviar recordatorio 1 hora antes del paseo

//TODO: Flujo de pawwer dividido con el del cliente

//Notas: