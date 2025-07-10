import { addKeyword, EVENTS } from "@builderbot/bot";
import { TEMPLATE_bienvenida_pawwi, TEMPLATE_registro_agendar_paseo, TEMPLATE_registro_consideraciones_perrito, TEMPLATE_registro_edad_perrito, TEMPLATE_registro_raza_perrito, TEMPLATE_registro_nombre_perrito, TEMPLATE_registro_vacunas_perrito } from "../services/send-template";
import { sendText } from "../services/send-text";

const regex = (text) => {
  if (!text || text.trim() === "") return false;
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(text.trim());
};

const perritoData = {};

const init = addKeyword(EVENTS.WELCOME)
  .addAction(async (ctx) => {
    const nombre = ctx.pushName || "Usuario";
    console.log(`[INIT] Usuario ${nombre} ha iniciado el flujo.`);
    await TEMPLATE_bienvenida_pawwi(ctx.from, nombre);
  })
  .addAnswer(
    null,
    { capture: true },
    async (ctx, { endFlow, flowDynamic, gotoFlow }) => {
      const textoBoton = ctx.body;
      const payloadBoton = ctx.payload || "Sin payload";
      const nombre = ctx.pushName || "Usuario";
      console.log(`[INTERACTION] Botón oprimido: ${textoBoton}, Payload: ${payloadBoton}`);
      if (payloadBoton === "Registrar a mi perrito") {
        // Iniciar registro secuencial
        perritoData[ctx.from] = {};
        return gotoFlow(RegistrarNombrePerrito);
      } 
      else if (payloadBoton === "Agendar un paseo") {
        //Agendar un paseo
        await TEMPLATE_registro_agendar_paseo(ctx.from, nombre);
        return endFlow();
      } 
      else if (payloadBoton === "Hablar con el equipo") {
        await sendText(ctx.from, `En unos instantes nuestro Pawwier de soporte se comunicara contigo. O puedes comunicarte al número +57 3023835142`);
        return endFlow();
      }
      else if (payloadBoton === "Conviértete en Pawwer") {
        await sendText(ctx.from, `Perfecto, para ser un Pawwer, completa el siguiente formulario: https://tally.so/r/wMyVRE`);
        return endFlow();
      }
      else {
        await sendText(ctx.from, `¡Has oprimido el botón: *${textoBoton}*!\nCon el siguiente payload: *${payloadBoton}*`);
        await sendText(ctx.from, "Por favor, selecciona una opción del menú de nuevo.");
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
      perritoData[ctx.from] = { nombre: nombre };
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
      const vacunas = ctx.body.trim();
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

const RegistrarPerro = addKeyword('RegistrarPerro')
  .addAction(async (ctx) => {
      await sendText(ctx.from, `🐶 Registro completo:\nNombre: ${perritoData[ctx.from].nombre}\nRaza: ${perritoData[ctx.from].raza}\nEdad: ${perritoData[ctx.from].edad}\nConsideraciones: ${perritoData[ctx.from].consideraciones}\n¡Gracias por registrar a tu perrito en Pawwi!`);
      return;
  });

export { init, RegistrarNombrePerrito, RegistrarRazaPerrito, RegistrarEdadPerrito, RegistrarConsideracionesPerrito, RegistrarVacunasPerrito, RegistrarPerro };

/*

*/