import { addKeyword, EVENTS } from "@builderbot/bot";
import { TEMPLATE_bienvenida_pawwi, TEMPLATE_registro_agendar_paseo, TEMPLATE_registro_consideraciones_perrito, TEMPLATE_registro_edad_perrito, TEMPLATE_registro_raza_perrito, TEMPLATE_registro_nombre_perrito, TEMPLATE_registro_vacunas_perrito, TEMPLATE_agendar_tipo_paseo, TEMPLATE_agendar_fecha_paseo, TEMPLATE_ragendar_hora_paseo, TEMPLATE_agendar_metodo_pago } from "../services/send-template";
import { sendText, sendButtons } from "../services/send-text";
import { createDog } from "../services/airtable-dogs";
import { createUser, getUsers } from "../services/airtable-users";
import { createLead } from '../services/airtable-leads';

//TODO: Reiniciar conversacion con el cliente si este no ha interactuado en 1 hora

const regex = (text) => {
  if (!text || text.trim() === "") return false;
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(text.trim());
};

const perritoData = {};
const usuarioData = {};

const init = addKeyword(EVENTS.WELCOME)
  .addAction(async (ctx) => {
    const nombre = ctx.pushName || "Usuario";
    console.log(`[INIT] Usuario ${nombre} ha iniciado el flujo. Número: ${ctx.from}`);
    
    // Recuperar usuario y perros asociados
    try {
      const filter = `Celular='${ctx.from}'`;
      const res = await getUsers(filter) as { records: any[] };
      if (res.records && res.records.length > 0) {
        const user = res.records[0];
        usuarioData[ctx.from] = { ...user.fields, _recordId: user.id };
        // Si tiene perros, traerlos y guardarlos en perritoData
        if (user.fields.Perros && user.fields.Perros.length > 0) {
          const perrosRes = await import("../services/airtable-dogs");
          const { getDogs } = perrosRes;
          for (const perroId of user.fields.Perros) {
            const dogRes = await getDogs(`RECORD_ID()='${perroId}'`) as { records: any[] };
            if (dogRes.records && dogRes.records.length > 0) {
              perritoData[perroId] = { ...dogRes.records[0].fields, _recordId: perroId };
            }
          }
        }
        console.log("Usuario y perros recuperados de Airtable");
      } else {
        // Crear usuario si no existe
        const createRes = await createUser({
          Celular: ctx.from,
          Perros: [],
          Agendamientos: 0
        });
        // @ts-ignore
        const user = createRes.records[0];
        usuarioData[ctx.from] = { ...user.fields, _recordId: user.id };
        console.log("Usuario creado en Airtable");
      }
    } catch (e) {
      console.log("Error creando/recuperando usuario en Airtable", e?.message || e);
    }

    await TEMPLATE_bienvenida_pawwi(ctx.from, nombre);
  })
  .addAnswer(
    null,
    { capture: true },
    async (ctx, { endFlow, gotoFlow }) => {
      const textoBoton = ctx.body;
      const payloadBoton = ctx.payload || "Sin payload";
      //const nombre = ctx.pushName || "Usuario";
      console.log(`[INTERACTION] Botón oprimido: ${textoBoton}, Payload: ${payloadBoton}`);
      if (payloadBoton === "Registrar a mi perrito") {
        // Iniciar registro secuencial
        perritoData[ctx.from] = {};
        return gotoFlow(RegistrarNombrePerrito);
      } 
      else if (payloadBoton === "Agendar un paseo") {
        //Agendar un paseo
        //Si no tiene perros registrados, redirigir al registro
        if (!usuarioData[ctx.from] || !usuarioData[ctx.from].Perros || usuarioData[ctx.from].Perros.length === 0) {
          return gotoFlow(RegistrarNombrePerrito);
        }
        else {
          return gotoFlow(AgendarlistarPerritos);
        }
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

const RegistrarPerro = addKeyword('RegistrarPerro')
  .addAction(async (ctx) => {
      const data = perritoData[ctx.from];
      try {
        await createDog({
          Celular: ctx.from,
          Nombre: data.nombre,
          Raza: data.raza,
          Edad: data.edad,
          Consideraciones: data.consideraciones,
          Vacunas: data.vacunas === undefined ? null : data.vacunas,
          "Usuario": [usuarioData[ctx.from]._recordId]
        });
      } catch (e) {
        // ignore
      }
      await TEMPLATE_registro_agendar_paseo(ctx.from, perritoData[ctx.from]?.nombre || "");
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
      // Aseguramos que el objeto perroSeleccionado existe antes de asignar propiedades
      if (!usuarioData[ctx.from]) usuarioData[ctx.from] = {};
      if (!usuarioData[ctx.from].perroSeleccionado) usuarioData[ctx.from].perroSeleccionado = {};

      usuarioData[ctx.from].perroSeleccionado.Nombre = perritoData[ctx.from].nombre;
      usuarioData[ctx.from].perroSeleccionado.Raza = perritoData[ctx.from].raza;
      usuarioData[ctx.from].perroSeleccionado.Edad = perritoData[ctx.from].edad;
      usuarioData[ctx.from].perroSeleccionado.Consideraciones = perritoData[ctx.from].consideraciones;
      usuarioData[ctx.from].perroSeleccionado.Vacunas = perritoData[ctx.from].vacunas;

      return gotoFlow(agendarTiempoPaseo);
  });


const AgendarlistarPerritos = addKeyword('AgendarlistarPerritos')
  .addAction(async (ctx) => {
      const perros = Object.keys(perritoData)
        .map(id => ({ ...perritoData[id], _id: id }))
        .filter(perro => perro && perro.Nombre);
      if (perros.length === 0) {
        await sendText(ctx.from, "No tienes perritos registrados.\n\nSi deseas registrar un nuevo perrito, por favor selecciona la opción correspondiente en el menú principal.");
        return;
      }
      const buttons = perros.map(perro => ({
        body: perro.Nombre,
        payload: `${perro._id}`
      }));
      await sendButtons(ctx.from, "¿A quien vamos a pasear hoy?", buttons);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
    const textoBoton = ctx.body;
    const payloadBoton = ctx.payload || '';
    // Buscar el perro seleccionado por payload (id)
    let perroSeleccionado = null;
    for (const id in perritoData) {
      if (id === payloadBoton || perritoData[id].Nombre === textoBoton) {
        perroSeleccionado = perritoData[id];
        // Guardar el nombre del perro seleccionado en usuarioData
        if (!usuarioData[ctx.from]) usuarioData[ctx.from] = {};
        usuarioData[ctx.from].perroSeleccionado = perroSeleccionado;
        break;
      }
    }
    if (perroSeleccionado) {
      return gotoFlow(agendarTiempoPaseo);
    }
    await sendText(ctx.from, `Por favor, selecciona un perrito de la lista usando los botones.`);
    return gotoFlow(init);
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
      case 'ADVENTURE_60_MIN':
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

    usuarioData[ctx.from].diaSeleccionado = diaSeleccionado;

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
    usuarioData[ctx.from].horaSeleccionado = horaSeleccionado;

    return gotoFlow(agendarDireccionPaseo);
  });

const agendarDireccionPaseo = addKeyword('agendarDireccionPaseo')
  .addAction(async (ctx) => {
      await sendText(ctx.from, `¿Cuál es la dirección exacta donde recogeremos a tu peludito? `);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
      const direccion = ctx.body.trim();
      if (!usuarioData[ctx.from]) usuarioData[ctx.from] = {};
      usuarioData[ctx.from].direccion = direccion;
      return gotoFlow(agendarMetodoPaseo);
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
    // Opciones de paseo
    const buttons = [
      { body: 'Si', payload: 'SI' },
      { body: 'No', payload: 'NO' },
    ];
    await sendButtons(
      ctx.from,
      `
Ya casi
Te confirmo estos datos:

Peludito ${usuarioData[ctx.from].perroSeleccionado.Nombre}
Duración:${usuarioData[ctx.from].agendamientoSeleccionado}
Fecha: ${usuarioData[ctx.from].diaSeleccionado}
Donde: ${usuarioData[ctx.from].direccion}

Total: $${usuarioData[ctx.from].valor}

¿Es correcto?`,
      buttons
    );
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { endFlow, gotoFlow }) => {
    const textoBoton = ctx.body;
    const payloadBoton = ctx.payload || '';
    console.log(`[INTERACTION] Botón oprimido: ${textoBoton}, Payload: ${payloadBoton}`);
    
    if (textoBoton === 'Si') {
      // Crear el lead en Airtable
      try {
        await createLead({
          FechaCreacion: new Date().toISOString(),
          Celular: ctx.from,
          Perro: usuarioData[ctx.from].perroSeleccionado.Nombre,
          Anotaciones: `\nRaza: ${usuarioData[ctx.from].perroSeleccionado.Raza}\n Edad: ${usuarioData[ctx.from].perroSeleccionado.Edad}\n Consideraciones: ${usuarioData[ctx.from].perroSeleccionado.Consideraciones}\n Vacunas: ${usuarioData[ctx.from].perroSeleccionado.Vacunas ? 'Si' : 'No'}`,
          Direccion: usuarioData[ctx.from].direccion,
          TipoServicio: 'paseo',
          TiempoServicio: usuarioData[ctx.from].agendamientoSeleccionado,
          Fecha: usuarioData[ctx.from].diaSeleccionado,
          Hora: usuarioData[ctx.from].horaSeleccionada || '',
          Precio: usuarioData[ctx.from].valor,
          Estado: 'Pendiente',
          Pawwer: 'No asignado'
        });

        await sendText(ctx.from, `✅ ¡Solicitud enviada exitosamente!

En unos instantes nuestro Equipo de Pawwi se estará comunicando contigo para confirmar el paseo de Nina

Si tienes dudas con tu servicio, o quieres comentar una novedad, contáctate con  Pawwer de soporte +57 3023835152`);
        await sendText('573332885462', `🔔 Lead nuevo registrado desde el bot.`);
        await sendText('573332885462', `Nuevo paseo

Peludito: ${usuarioData[ctx.from].perroSeleccionado.Nombre}
Descripcion:
  Raza: ${usuarioData[ctx.from].perroSeleccionado.Raza}
  Edad: ${usuarioData[ctx.from].perroSeleccionado.Edad}
  Consideraciones: ${usuarioData[ctx.from].perroSeleccionado.Consideraciones}
  Vacunas: ${usuarioData[ctx.from].perroSeleccionado.Vacunas ? 'Si' : 'No'}
Duración: ${usuarioData[ctx.from].agendamientoSeleccionado}
Donde: ${usuarioData[ctx.from].direccion}
Hora: ${usuarioData[ctx.from].diaSeleccionada || 'No especificada'},${usuarioData[ctx.from].horaSeleccionada || 'No especificada'}
Precio del servicio: $${usuarioData[ctx.from].valor}`);
      } catch (e) {
        await sendText(ctx.from, `Ocurrió un error al guardar el agendamiento. Intenta de nuevo más tarde.`);
        console.error("Error al crear el lead:", e?.message || e);
      }
      return endFlow();
    } 
    else if (textoBoton === 'No') {
      await sendText(ctx.from, `Por favor, vuelve a intentar agendar el paseo.`);
      return gotoFlow(init);
    } 
    else {
      await sendText(ctx.from, `Por favor, selecciona una opción válida.`);
      return gotoFlow(agendarResumenPaseo);
    }
  });

//TODO: Revisar BDD para enviar confirmacion a cliente y a paseador

//TODO: Revisar BDD para enviar recordatorio 1 hora antes del paseo

//TODO: Flujo de pawwer dividido con el del cliente

export { init, RegistrarNombrePerrito, RegistrarRazaPerrito, RegistrarEdadPerrito, RegistrarConsideracionesPerrito, RegistrarVacunasPerrito, RegistrarPerro, AgendarlistarPerritos, agendarTiempoPaseo, agendarDiaPaseo, agendarHoraPaseo, agendarDireccionPaseo, agendarResumenPaseo };