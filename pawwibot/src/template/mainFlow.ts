import { addKeyword, EVENTS } from "@builderbot/bot";
import { TEMPLATE_llegada_pawwer, TEMPLATE_pawwer_llego_cliente, TEMPLATE_strava_recordatorio_pawwer, TEMPLATE_finalizar_paseo_pawwer, TEMPLATE_paseo_finalizado_cliente, TEMPLATE_recibir_perro_pawwer, TEMPLATE_bienvenida_msg } from "../services/send-template";
import { sendMedia, sendText } from "../services/send-text";
import { getMongoClient } from '../services/mongo';
import { DateTime } from "luxon";
import { confirmarLeads } from "~/services/mongoDB/mongo-leads";
import { actualizarEstadoPaseosProximos, actualizarStravaPaseo, cancelarPaseosPorCelular, getPaseosByCelularPawwer,  getPaseosPorCliente,  updatePaseoMongo } from "~/services/mongoDB/mongo-paseos";
import { sendMsgs } from "~/services/mongoDB/mongo-mensajes";

const perritoData = {};
const usuarioData = {};

const init = addKeyword(EVENTS.WELCOME)

  .addAction(async (ctx, { endFlow }) => {
    if (ctx.messageType && ctx.messageType !== "text") {
      const mediaUrl = ctx.mediaUrl || ctx.fileUrl || null;
      const caption = ctx.body || "";

      if (mediaUrl) {
        await sendText('573332885462', `📩 Usuario ${ctx.from} envió un ${ctx.messageType}`);
        await sendMedia('573332885462', mediaUrl, caption, ctx.messageType);
      } else {
        await sendText('573332885462', `📩 Usuario ${ctx.from} envió un ${ctx.messageType} sin URL`);
      }

      return endFlow();
    }


    console.log(`[MENSAJE] Contenido recibido: "${ctx.body}". Tipo de mensaje: ${ctx.messageType || "texto"}`);
    
    const nombre = ctx.pushName || "Usuario";
    console.log(`[INIT] Usuario ${nombre} ha iniciado el flujo. Número: ${ctx.from}`);
    const textoBoton = ctx.body;
    const payloadBoton = ctx.payload || "Sin payload";
    console.log(`[INTERACTION] Botón oprimido: ${textoBoton}, Payload: ${payloadBoton}`);
    if (ctx.from != '573023835142' && ctx.from != '573332885460') {
      await sendText('573332885462',`Usuario con numero ${ctx.from} ha interactuado con el bot.\nText: ${textoBoton}\nPayload: ${payloadBoton}`)
    }

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
        console.log("✅ Usuario recuperado de Mongo:", usuario.celular);
        console.log(`Tipo de usuario: ${usuario.tipoUsuario}`);
        

        if (usuario.tipoUsuario == "pawwer") {
          console.log("Pawwer ha interactuado con el bot");
          console.log("Celular Pawwer:", ctx.from);

          (async () => {
            const celularPawwer = ctx.from;
            const payload: string = ctx.payload ;

            // Revisar paseos en Mongo
            const paseosMongo = await getPaseosByCelularPawwer(celularPawwer);
            console.log("Paseos en Mongo:", paseosMongo.length);
            console.log(paseosMongo[0]);
            
            if (paseosMongo.length === 0) {
              await sendText(
                celularPawwer,
                `No tienes paseos activos en este momento. Si crees que es un error, por favor contacta al soporte. +57 3332885462`
              );

              console.log("❌ No se encontró ningún paseo para este Pawwer en Mongo ni en Airtable");
              return;
            }

            const paseo = paseosMongo[0];
            
            if (paseo.Estado == "Falta 1 hora" || paseo.Estado == "Por realizarse") {
              await sendText(celularPawwer, `⚠️ El paseo de ${paseo.Perro} comenzará en un rato. Por favor, prepárate. Si tienes alguna duda, contacta al soporte +57 3332885462`); 
              return endFlow();
            }

            if (paseo.Estado == "Esperando Pawwer") {
              if (payload !== "confirmar_llegada") {
                await TEMPLATE_llegada_pawwer(paseo.CelularPawwer, { nombrePawwer:paseo.NombrePawwer, nombrePerrito:paseo.Perro });
                return endFlow();
              }

              const cambios = { Estado: "Esperando perro" };
              const result = await updatePaseoMongo(paseo._id.toString(), cambios);

              if (result.modifiedCount > 0) { console.log(`✅ Paseo ${paseo._id.toString()} actualizado correctamente`);} 
              else {console.log(`⚠️ No se encontró el paseo con id ${paseo._id.toString()} o no hubo cambios`);}

              let nombre = paseo.Nombre
              if (paseo.Nombre == "Cliente") {
                nombre = "😊"
              }
              await TEMPLATE_pawwer_llego_cliente(paseo.Celular, {
                nombreCliente: nombre,
                nombrePawwer: paseo.NombrePawwer,
                nombrePerrito: paseo.Perro,
                calle: paseo.Direccion,
                colonia: "Bogota",
                fecha: paseo.Fecha,
                hora: paseo.Hora,
                duracion: paseo.TiempoServicio + " minutos",
              });

              //Mensaje de dale click al boton cuando recibas al perro
              await TEMPLATE_recibir_perro_pawwer(paseo.CelularPawwer, { nombrePerrito: paseo.Perro });
              return endFlow();
            }
            else if (paseo.Estado === "Esperando perro") {
              if (payload !== "INICIAR_PASEO") {
                await TEMPLATE_recibir_perro_pawwer(paseo.CelularPawwer, { nombrePerrito: paseo.Perro });
                return endFlow();
              }
              //actualuizar horaInicio y estado a esperando strava
              const horaInicio = DateTime.now().setZone("America/Bogota").toFormat("yyyy-MM-dd HH:mm:ss");

              const cambios = { Estado: "Esperando Strava", HoraInicio: horaInicio };
              const result = await updatePaseoMongo(paseo._id.toString(), cambios);

              if (result.modifiedCount > 0) { console.log(`✅ Paseo ${paseo._id.toString()} actualizado correctamente`);} 
              else {console.log(`⚠️ No se encontró el paseo con id ${paseo._id.toString()} o no hubo cambios`);}

              await TEMPLATE_strava_recordatorio_pawwer(paseo.CelularPawwer, {
                nombrePawwer: paseo.NombrePawwer,
                nombrePerrito: paseo.Perro,
              });
            }
            else if (paseo.Estado === "Esperando Strava") {
              const linkRecibido = ctx.body.trim();
              actualizarStravaPaseo(parseInt(celularPawwer), linkRecibido)
            }
            else if("Esperando finalizacion" === paseo.Estado) {
              await sendText(celularPawwer, "Tienes actualmente un paseo en curso. Por favor, si deseas comentar alguna novedad o crees que es un error, contacta al numero de soporte +57 3332885462");
            }
            else if (paseo.Estado === "Esperando finalizacion Pawwer") {
              console.log(`Payload recibido: ${payload}`);
              
              if (payload !== "Finalizar paseo") {
                await TEMPLATE_finalizar_paseo_pawwer(celularPawwer, {
                  nombrePawwer: paseo.NombrePawwer,
                  nombrePerrito: paseo.Perro
                });
                return endFlow();
                }
                else {
                await sendText(celularPawwer, "Gracias por finalizar el paseo. En breve el dueño recogera a su mascota");
                let nombre = paseo.Nombre
                if (paseo.Nombre == "Cliente") {
                  nombre = "😊"
                }
                await TEMPLATE_paseo_finalizado_cliente(paseo.Celular, {
                  nombreCliente: nombre,
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
          const paseo = await getPaseosPorCliente(parseInt(ctx.from));
          console.log(paseo);

          if (ctx.body == "Ver detalles del paseo") {
            await sendText(ctx.from, `🐾 Así funciona Pawwi paso a paso 💜

1️⃣ Recogida:
Tu paseador llegará a la dirección para recoger a tu peludo.

2️⃣ Inicio del paseo:
Una vez empieza el recorrido, en Pawwer iniciará su GPS para que puedas seguir el paseo en tiempo real. Así sabrás por dónde va y cuánto tiempo lleva caminando 🚶‍♀️🐶

3️⃣ Durante el paseo:
El paseador mantiene un ritmo, haciendose cargo en todo momento de tu perrito, podrás ver en todo momento donde se encuentra el paseador.

4️⃣ Finalización del paseo:
Cuando termina, el paseador lleva a tu perro de regreso a casa.

5️⃣ Tu opinión cuenta:
Finalmente, podrás dejar tu feedback sobre cómo te pareció el servicio. Nos ayuda muchísimo a seguir mejorando 🐾`);
          }

          
          

          if (paseo) {
            if (ctx.body == "Confirmar") {
              await sendText(ctx.from, `Muchas gracias por confirmar tu paseo. Si tienes alguna duda, no dudes en contactarnos al +57 3332885462 ¡Gracias por confiar en nosotros! 🐶`);
              return;
            }
            else {
              await sendText(ctx.from, `Tienes un paseo agendado para el ${paseo.Fecha} a las ${paseo.Hora}. Si deseas modificar o cancelar tu paseo, contactate al numero de soporte +57 3332885462 ¡Gracias por confiar en nosotros! 🐶`);
              console.log('❌ No se encontró ningún paseo para este Pawwer con estado "Esperando Pawwer"');
              return;
            }
          }
        }
      }

      const horaActual = DateTime.now().setZone("America/Bogota").hour;
      
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
      cancelarPaseosPorCelular(parseInt(ctx.from));
      return endFlow();
    }

    await TEMPLATE_bienvenida_msg(ctx.from, nombre);
  })

  .addAnswer(
    null,
    { capture: true },
    async (ctx, { endFlow, gotoFlow }) => {
      const textoBoton = ctx.body;
      const payloadBoton = ctx.payload || "Sin payload";

      console.log(`[INTERACTION] Botón oprimido: ${textoBoton}, Payload: ${payloadBoton}`);

      if (payloadBoton === "Registrar a mi perrito") {
        await sendText(ctx.from, `Para agendar un paseo dirigete a la página web y rellena el formulario para agendar tu paseo www.pawwi.co`);
        return endFlow();
      }

      else if (payloadBoton === "Agendar un paseo") {
        await sendText(ctx.from, `Para agendar un paseo dirigete a la página web y rellena el formulario para agendar tu paseo www.pawwi.co`);
       return endFlow();
      }

      else if (payloadBoton === "Hablar con el equipo") {
        await sendText(ctx.from, `En unos momentos nuestro equipo de soporte te contactará. También puedes escribirnos ya mismo aquí 👉 https://wa.me/573332885462`);
        await sendText('573332885462', `El usuario ${ctx.from} ha pulsado el boton de soporte, comunicate con la persona para resolver sus dudas.`);
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

const checkLeadsMongo = async () => {
  try {
    confirmarLeads()
    sendMsgs()
  } catch (error) {
    console.error("❌ Error al consultar los leads en Mongo:", error);
  }
};

setTimeout(() => {
  setInterval(checkLeadsMongo, 10 * 1000);
}, 5000);

setTimeout(() => {
  setInterval(actualizarEstadoPaseosProximos, 15 * 1000);
}, 5000);

export { init};