import { addKeyword, EVENTS } from "@builderbot/bot";
import { TEMPLATE_bienvenida_pawwi, TEMPLATE_registro_agendar_paseo, TEMPLATE_registro_consideraciones_perrito, TEMPLATE_registro_edad_perrito, TEMPLATE_registro_raza_perrito, TEMPLATE_registro_nombre_perrito, TEMPLATE_registro_vacunas_perrito, TEMPLATE_agendar_tipo_paseo, TEMPLATE_agendar_fecha_paseo, TEMPLATE_ragendar_hora_paseo, TEMPLATE_agendar_metodo_pago, TEMPLATE_agendar_resumen_paseo, TEMPLATE_confirmacion_paseo_cliente, TEMPLATE_llegada_pawwer, TEMPLATE_pawwer_llego_cliente, TEMPLATE_strava_recordatorio_pawwer, TEMPLATE_link_strava_cliente, TEMPLATE_recordatorio_paseo_cliente, TEMPLATE_recordatorio_paseo_pawwer, TEMPLATE_finalizar_paseo_pawwer, TEMPLATE_paseo_finalizado_cliente, TEMPLATE_recordatorio_pago_cliente, TEMPLATE_recibir_perro_pawwer } from "../services/send-template";
import { sendText, sendButtons } from "../services/send-text";

import { getMongoClient } from '../services/mongo';
import { createLead, deleteLead, getLeads, updateLead } from "../services/airtable-leads";
import { createPaseo, getPaseoByPawwerTelefono, getPaseoByPawwerTelefonoActive, getPaseoByClienteTelefonoActive, getPaseos, updatePaseo } from "../services/airtable-paseos";
import { log } from "node:console";
import { createCompletado, getCompletados } from "../services/airtable-completados";
import { DateTime } from "luxon";
import { crearPawwerActivo } from "~/services/airtable-pawwersActivos";
import { send } from "node:process";
import { getContrato, updateContrato } from "~/services/registroPawwers";
import { confirmarLeads, createLead_Mongo, Lead } from "~/services/mongoDB/mongo-leads";
import { createPawwer, getPawwerById } from "~/services/mongoDB/mongo-pawwersActivos";
import { actualizarEstadoEsperandoPawwer, actualizarEstadoEsperandoPerro, actualizarEstadoPaseosProximos, actualizarStravaPaseo, cancelarPaseosPorCelular, completarPaseoYActualizarPawwer, getPaseosPorPawwer, revisarFinalizacionPaseos, revisarPaseosPawwer, updatePaseoMongo } from "~/services/mongoDB/mongo-paseos";

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

const init = addKeyword(EVENTS.WELCOME)

  .addAction(async (ctx, { endFlow, gotoFlow }) => {
    if (!ctx.body || typeof ctx.body !== "string") {
      console.log(`[IGNORADO] Mensaje inválido o sin texto. Tipo: ${ctx.messageType}`);
      return endFlow();
    }

    console.log(`[MENSAJE] Contenido recibido: "${ctx.body}"`);
    
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
        console.log(`Tipo de usuario: ${usuario.tipoUsuario}`);
        

        if (usuario.tipoUsuario == "pawwer") {

          (async () => {
            const celularPawwer = ctx.from;
            const payload: string = ctx.payload ;

            // Revisar paseos en Mongo
            const paseosMongo = await getPaseosPorPawwer(parseInt(celularPawwer));
            console.log("Paseos en Mongo:", paseosMongo.length);
            console.log(paseosMongo[0]);
            

            if (paseosMongo.length === 0) {
              const campo = "Ganancia Pawwer";
              const gananciasPawwer = await sumarCampoPorCelular(celularPawwer, campo);

              await sendText(
                celularPawwer,
                `No tienes paseos activos en este momento. Has acumulado un total de $${gananciasPawwer} en ganancias.\nSi crees que es un error, por favor contacta al soporte. +57 3332885462`
              );

              console.log("❌ No se encontró ningún paseo para este Pawwer en Mongo ni en Airtable");
              return;
            }

            const paseo = paseosMongo[0];

            const pawwer = await getPawwerById(paseo.IdPawwer.toString());
            console.log(pawwer);
            

            if (paseo.Estado == "Esperando Pawwer") {
              if (payload !== "confirmar_llegada") {
                await TEMPLATE_llegada_pawwer(celularPawwer, { nombrePawwer:pawwer.Nombre, nombrePerrito:paseo.Perro });
                return endFlow();
              }

              const cambios = { Estado: "Esperando perro" };
              const result = await updatePaseoMongo(paseo._id.toString(), cambios);

              if (result.modifiedCount > 0) { console.log(`✅ Paseo ${paseo._id.toString()} actualizado correctamente`);} 
              else {console.log(`⚠️ No se encontró el paseo con id ${paseo._id.toString()} o no hubo cambios`);}

              await TEMPLATE_pawwer_llego_cliente(paseo.Celular, {
                nombreCliente: paseo.Nombre,
                nombrePawwer: pawwer.Nombre,
                nombrePerrito: paseo.Perro,
                calle: paseo.Direccion,
                colonia: "Bogota",
                fecha: paseo.Fecha,
                hora: paseo.Hora,
                duracion: paseo.TiempoServicio,
              });

              //Mensaje de dale click al boton cuando recibas al perro
              await TEMPLATE_recibir_perro_pawwer(pawwer.NumeroTelefono, { nombrePerrito: paseo.Perro });
              return endFlow();
            }
            else if (paseo.Estado === "Esperando perro") {
              if (payload !== "INICIAR_PASEO") {
                await TEMPLATE_recibir_perro_pawwer(celularPawwer, { nombrePerrito: paseo.Perro });
                return endFlow();
              }
              //actualuizar horaInicio y estado a esperando strava
              const horaInicio = DateTime.now().setZone("America/Bogota").toFormat("yyyy-MM-dd HH:mm:ss");

              const cambios = { Estado: "Esperando Strava", HoraInicio: horaInicio };
              const result = await updatePaseoMongo(paseo._id.toString(), cambios);

              if (result.modifiedCount > 0) { console.log(`✅ Paseo ${paseo._id.toString()} actualizado correctamente`);} 
              else {console.log(`⚠️ No se encontró el paseo con id ${paseo._id.toString()} o no hubo cambios`);}

              await TEMPLATE_strava_recordatorio_pawwer(celularPawwer, {
                nombrePawwer: pawwer.Nombre,
                nombrePerrito: paseo.Perro,
              });
            }
            else if (paseo.Estado === "Esperando Strava") {
              const linkRecibido = ctx.body.trim();

              if (actualizarStravaPaseo(parseInt(celularPawwer), linkRecibido)) {
                await TEMPLATE_link_strava_cliente(paseo.Celular, {
                  nombreCliente : paseo.Nombre,
                  nombrePerrito: paseo.Perro || "tu perrito",
                  linkStrava: linkRecibido.replace("https://www.strava.com/beacon/", "").trim(),
                });
              } else {
                console.log("No coincide");
                await sendText(celularPawwer, "El link de Strava que has enviado no es valido, tu link debe ser por ejemplo como el siguiente: https://www.strava.com/beacon/oH0qqnaCRNM");
              }
            }
            else if("Esperando finalizacion" === paseo.Estado) {
              await sendText(celularPawwer, "Tienes actualmente un paseo en curso. Por favor, si deseas comentar alguna novedad o crees que es un error, contacta al numero de soporte +57 3332885462");
            }
            else if (paseo.Estado === "Esperando finalizacion Pawwer") {
              console.log(`Payload recibido: ${payload}`);
              
              if (payload !== "Finalizar paseo") {
                await TEMPLATE_finalizar_paseo_pawwer(celularPawwer, {
                  nombrePawwer: pawwer.Nombre,
                  nombrePerrito: paseo.Perro
                });
                return endFlow();
                }
                else {
                await sendText(celularPawwer, "Gracias por finalizar el paseo. En breve el dueño recogera a su mascota");
                await TEMPLATE_paseo_finalizado_cliente(paseo.Celular, {
                  nombreCliente: paseo.Nombre,
                  nombrePerrito: paseo.Perro,
                });

                const cambios = { Estado: "Completado (15 minutos recordatorio de pago)", horaFin: DateTime.now().setZone("America/Bogota").toFormat("yyyy-MM-dd HH:mm:ss") };
                const result = await updatePaseoMongo(paseo._id.toString(), cambios);

                if (result.modifiedCount > 0) { console.log(`✅ Paseo ${paseo._id.toString()} actualizado correctamente`);} 
                else {console.log(`⚠️ No se encontró el paseo con id ${paseo._id.toString()} o no hubo cambios`);}
              }
            }
            
          })();
          return endFlow();
        }
        else if (usuario.tipoUsuario == "support") {
          await sendText(ctx.from, `Hola ${nombre}, si lees esto es porque eres de soporte`);
          return endFlow();
        }
        else if(usuario.tipoUsuario == "cliente") {
          const paseo = await getPaseoByClienteTelefonoActive(ctx.from);

          if (paseo) {
            await sendText(ctx.from, `Tienes un paseo agendado para el ${paseo.fields.Fecha} a las ${paseo.fields.Hora}. Si deseas modificar o cancelar tu paseo, contactate al numero de soporte +57 3332885462 ¡Gracias por confiar en nosotros! 🐶`);
            console.log('❌ No se encontró ningún paseo para este Pawwer con estado "Esperando Pawwer"');
            return;
          }
        }
      }

      const horaActual = DateTime.now().setZone("America/Bogota").hour;

      // Si es entre 6pm (18) y 6am (6) => fuera de horario
      
      if (horaActual >= 18 || horaActual < 6) {
        await sendText(ctx.from, "⏰ En este momento no estamos trabajando. Nuestro horario de atención es de 6:00am a 6:00pm.");
        return;
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
      console.log("Cancelando paseo para el usuario:", ctx.from);

      //APD: Cuando se active mongoDB, descomentar la siguiente linea
      cancelarPaseosPorCelular(parseInt(ctx.from));

      for (const paseo of paseoAgendado.records) {
        console.log(paseo.fields.Celular == ctx.from);
        
        if (paseo.fields.Celular == ctx.from && paseo.fields.Estado != "Cancelado") {
          await updatePaseo(paseo.id, { Estado: "Cancelado" });
          await sendText('573332885462', `El usuario ${ctx.from} ha cancelado su paseo agendado.`);
          await sendText(paseo.fields["Numero de teléfono (from Pawwer)"]?.[0] || "", `El dueño de ${paseo.fields.Perro} ha cancelado su paseo agendado.`);
          await sendText(ctx.from, "Has cancelado el agendamiento. Si deseas agendar otro paseo, por favor inicia de nuevo.");
          console.log(`✅ Paseo cancelado para el usuario ${ctx.from}`);
        }
      }
      
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
      dogName: selectedDog?.nombre || 'No definido',     // {{1}}
      calle: data.Direccion?.split(' – ')[0] || 'No definida', // {{2}}
      fecha: data.diaSeleccionado || 'No definida',    // {{3}}
      hora: data.horaSeleccionada || 'No definida',   // {{4}}
      tipoPaseo: data.agendamientoSeleccionado || 'No definido', // {{5}}
      precio: `$${data.valor || 0}`,                    // {{6}}
      metodoPago: data.metodoPago || 'No definido'          // {{7}}
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


        await createLead_Mongo({
          celular: parseInt(ctx.from),
          nombre: ctx.pushName || 'Usuario',
          perro: selectedDog?.nombre || 'No definido',
          anotaciones: `Raza: ${selectedDog?.raza || 'No definida'}, Edad: ${selectedDog?.edad || 'No definida'}, Consideraciones: ${selectedDog?.consideraciones || 'No definidas'}, Vacunas: ${selectedDog?.vacunas !== undefined ? (selectedDog.vacunas ? 'Sí' : 'No') : 'No definida'}`,
          direccion: data.Direccion || 'No definida',
          tipoServicio: 'paseo',
          tiempoServicio: data.agendamientoSeleccionado || 'No definido',
          fecha: data.diaSeleccionado || 'No definida',
          hora: data.horaSeleccionada || 'No definida',
          precio: data.valor || 0,
          estado: 'Pendiente',
          pawwer: 'No asignado',
          metodoPago: data.metodoPago || 'No especificado' 
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

const checkLeadsMongo = async () => {
  try {
    console.log("mongo checkLeadsMongo ejecutado");
    confirmarLeads()
    
  } catch (error) {
    console.error("❌ Error al consultar los leads en Airtable:", error);
  }
};

setTimeout(() => {
  setInterval(checkLeadsMongo, 20 * 1000);
}, 5000);

setTimeout(() => {
  setInterval(actualizarEstadoPaseosProximos, 25 * 1000);
}, 5000);

setTimeout(() => {
  setInterval(revisarFinalizacionPaseos, 30 * 1000);
}, 5000);

export { init, RegistrarNombrePerrito, RegistrarRazaPerrito, RegistrarEdadPerrito, RegistrarConsideracionesPerrito, RegistrarVacunasPerrito, RegistrarDireccion, RegistrarPerro, AgendarlistarPerritos, agendarTiempoPaseo, agendarDiaPaseo, agendarHoraPaseo, agendarMetodoPaseo, agendarResumenPaseo};