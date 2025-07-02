import { addKeyword, EVENTS } from "@builderbot/bot";
import { conversation } from "~/model/models";
import { applyPawwiloverDiscount, findCelInSheet, insertClientBasicInfo, insertLeadRow, updateDogsForClient, getWalksCountForClient , updateWalksCounterForClient  } from "~/services/googleSheetsService";
import { getCiudadDesdeDireccion, getLocalidadDesdeDireccion } from "~/services/openStreetMap";
import { conversations } from "~/services/memoryStore";
import { handleConversationEnd, handleConversationTimeout } from "~/services/conversationManager"; // nueva
import { provider } from "~/provider";
import { sendAdminNotification } from "~/services/messageService";

const flowCounters: Record<string, number> = {};

function countAndLog(flowName: string) {
    flowCounters[flowName] = (flowCounters[flowName] || 0) + 1;

    console.log(`📊 [${flowName}] activado ${flowCounters[flowName]} vez(veces)`);
    console.log('📋 Historial de activaciones:', JSON.stringify(flowCounters, null, 2));
}

const init = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { gotoFlow, flowDynamic }) => {countAndLog('init'); if (handleConversationTimeout(ctx.from)) return gotoFlow(init); //Required for restarting conversation
        const userId = ctx.from;
        const resultado = await findCelInSheet(userId);

        if (resultado.exists && resultado.userData) {
            const [id, name, cc, petsJson] = resultado.userData;

            conversations[userId] = new conversation();
            conversations[userId].id = id;
            conversations[userId].cc = parseInt(cc);
            conversations[userId].name = name;
            conversations[userId].address = "";
            conversations[userId].dogs = [];

            try {
                const parsed = JSON.parse(petsJson || "{}");
                if (Array.isArray(parsed)) {
                    conversations[userId].dogs = parsed;
                } else if (parsed.nombre) {
                    conversations[userId].dogs = [parsed]; // convertir a lista
                }
            } catch (e) {
                console.error("🐾 Error al parsear los perros:", e);
                conversations[userId].dogs = [];
            }

            console.log("✅ Usuario recuperado con datos:", conversations[userId]);
            return gotoFlow(userRegistered);
        }

        return gotoFlow(start);
    });

const userRegistered = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { gotoFlow, flowDynamic }) => {countAndLog('userRegistered'); if (handleConversationTimeout(ctx.from)) return gotoFlow(init); //Required for restarting conversation
        const userId = ctx.from;

        //La idea es dirigir de una a f1 si el numero ya esta registrado con un perro
        const resultado = await findCelInSheet(userId);
        console.log(resultado);
        
        if (resultado.exists && resultado.userData) {
            const [, , , , petsJson] = resultado.userData;
            try {
                const parsed = JSON.parse(petsJson || "[]");
                
                conversations[userId].dogs = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                conversations[userId].dogs = [];
            }
        }

        // Construir botones actualizados
        const buttons = conversations[userId].dogs.map(dog => ({ body: dog.nombre }));

        //Temporal
        //await flowDynamic('Gracias por registrarte en Pawwi, te informaremos cuando podamos pasear a tu peludito 🐶');
        
        if (conversations[userId].dogs.length < 3) {
            buttons.push({ body: 'Agregar perro' });
        }

        await flowDynamic([{
            body: `Guauuu, bienvenido/a de nuevo a Pawwi, soy Bimba 🐶. ¿A quién quieres que cuidemos?`,
            buttons
        }]);
        
    })
    
    .addAnswer('', { capture: true }) // Para capturar la opción seleccionada
    .addAction(async (ctx, { gotoFlow, flowDynamic }) => { if (handleConversationTimeout(ctx.from)) return gotoFlow(init); //Required for restarting conversation
        const userId = ctx.from;
        if (ctx.body === 'Agregar perro') return gotoFlow(i1);

        const dog = conversations[userId].dogs.find(d => d.nombre === ctx.body);
        if (dog) {
            conversations[userId].selectedDog = dog;
            //Temporal: Deberia ir a l1 pero como solo van a ser paseos en un inicio, salta directamente a paseo
            //return gotoFlow(l1);
            return gotoFlow(m1);
        }

        await flowDynamic('⚠️ No encontré ese nombre. Intenta de nuevo.');
        return gotoFlow(userRegistered);
});

const userRegistered_repeat = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { gotoFlow, flowDynamic }) => {countAndLog('userRegistered_repeat'); if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const userId = ctx.from;

        //La idea es dirigir de una a f1 si el numero ya esta registrado con un perro
        const resultado = await findCelInSheet(userId);

        if (resultado.exists && resultado.userData) {
            const [, , , , petsJson] = resultado.userData;
            try {
                const parsed = JSON.parse(petsJson || "[]");
                conversations[userId].dogs = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                conversations[userId].dogs = [];
            }
        }

        const buttons = conversations[userId].dogs.map(dog => ({ body: dog.nombre }));

        if (conversations[userId].dogs.length < 3) {
            buttons.push({ body: 'Agregar perro' });
        }

        await flowDynamic([{
            body: `¿A quién quieres que cuidemos? 🐾`,
            buttons
        }]);

    })
    .addAnswer('', { capture: true }) // Para capturar la opción seleccionada
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const userId = ctx.from;
        if (ctx.body === 'Agregar perro') return gotoFlow(i1);

        const dog = conversations[userId].dogs.find(d => d.nombre === ctx.body);
        if (dog) {
            conversations[userId].selectedDog = dog;
            //Temporal: Deberia ir a l1 pero como solo van a ser paseos en un inicio, salta directamente a paseo
            //return gotoFlow(l1);
            return gotoFlow(m1);
        }

        await flowDynamic('⚠️ No encontré ese nombre. Intenta de nuevo.');
        return gotoFlow(userRegistered);
});

const start = addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { gotoFlow, flowDynamic }) => { countAndLog('start');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const userId = ctx.from;

        const existe = await findCelInSheet(userId);

        console.log("¿Usuario ya registrado?:", existe);

        await flowDynamic([{
            body: `¡Guauuu guauuu…! 🐶✨\n
Soy Bimba, tu amiga de Pawwi…\n
Aquí estamos para que tú y tu peludito estén siempre tranquilos 🏡❤️\n
Nos encargamos de buscar cuidadores súper confiables en tu zona…\n
¿Qué te gustaría hacer hoy? 👇`,
            buttons: [
                { body: 'Buscar cuidador' },
                { body: 'Ser cuidador' }
            ]
        }]);
    })
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const choice = ctx.body;

        if (choice === 'Buscar cuidador') return gotoFlow(i1);
        if (choice === 'Ser cuidador') {
            await flowDynamic('Perfecto, para ser un Pawwer, completa el siguiente formulario: https://tally.so/r/wMyVRE');
            return;
        }

        return gotoFlow(start_repeat);
    });

// 🔁 Repetición en caso de opción inválida
const start_repeat = addKeyword('main_repeat')
    .addAnswer(`⚠️ Opción no válida. Por favor, elige una de las opciones.`, {
        buttons: [
            { body: 'Buscar cuidador' },
            { body: 'Ser cuidador' }
        ]
    })
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {countAndLog('start_repeat'); if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const choice = ctx.body;

        if (choice === 'Buscar cuidador') return gotoFlow(name);
        if (choice === 'Ser cuidador') {
            await flowDynamic('Para ser un Pawwier, por favor rellena el siguiente formulario 🚀: https://tally.so/r/wMyVRE');
            return;
        }

        return gotoFlow(start_repeat);
    });

    const i1 = addKeyword('write_cc_new')
    .addAnswer('Guauuu, que bien 🐶​, ¿Cómo se llama tu peludito?')
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { gotoFlow }) => {countAndLog('i1');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const nombre = ctx.body.trim();
        const userId = ctx.from;

        conversations[userId] = conversations[userId] || new conversation();
        conversations[userId].dogs = conversations[userId].dogs || [];

        conversations[userId].selectedDog = {
            nombre,
            raza: '',
            edad: '',
            peso: '',
            descripcion: ''
        };

        return gotoFlow(k1_consideraciones);
    });

const k1_raza = addKeyword('write_pet_description')
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {countAndLog('k1_raza');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const petName = conversations[ctx.from]?.selectedDog?.nombre || '[vacio]';
        await flowDynamic(`Perfecto, ahora cuéntame ¿Qué raza es *${petName}*? 🐾`);
    })
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const raza = ctx.body.trim();
        const userId = ctx.from;
        if (conversations[userId].selectedDog) {
            conversations[userId].selectedDog.raza = raza;
        }
        return gotoFlow(k1_edad);
    });

const k1_edad = addKeyword('write_pet_description')
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {countAndLog('k1_edad');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const petName = conversations[ctx.from]?.selectedDog?.nombre || '[vacio]';
        await flowDynamic(`¿Cuántos años tiene *${petName}*?`);
    })
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const edad = ctx.body.trim();
        const userId = ctx.from;
        if (conversations[userId].selectedDog) {
            conversations[userId].selectedDog.edad = edad;
        }
        return gotoFlow(k1_peso);
    });

    const k1_peso = addKeyword('write_pet_description')
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {countAndLog('k1_peso');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const petName = conversations[ctx.from]?.selectedDog?.nombre || '[vacio]';
        await flowDynamic(`¿Cuánto pesa aproximadamente *${petName}*? (en kilogramos)`);
    })
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const peso = ctx.body.trim();
        const userId = ctx.from;
        if (conversations[userId].selectedDog) {
            conversations[userId].selectedDog.peso = peso;
        }
        return gotoFlow(k1_consideraciones);
    });


const k1_consideraciones = addKeyword('write_pet_description')
    .addAnswer(`Describenos a tu perro, que raza es, cuantos años tiene, si es sociable, y consideraciones adicionales que tenga tu perro`, { capture: true })
    .addAction(async (ctx, { gotoFlow }) => {countAndLog('k1_consideraciones');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const consideraciones = ctx.body.trim();
        const userId = ctx.from;
        if (conversations[userId].selectedDog) {
            conversations[userId].selectedDog.descripcion = consideraciones;
        }
        return gotoFlow(k1_register);
    });


const k1_register = addKeyword('write_pet_description')
    .addAction(async (ctx, { flowDynamic, gotoFlow  }) => {countAndLog('k1_register');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const userId = ctx.from;
        const selectedDog = conversations[userId].selectedDog;

        if (!selectedDog) {
            await flowDynamic("⚠️ No tengo registrado el nombre del perrito. Intenta de nuevo.");
            return;
        }

        // Agregar perro actual a la lista
        conversations[userId].dogs.push(selectedDog);
        conversations[userId].id = userId;

        const yaExiste = await findCelInSheet(userId);

        if (yaExiste.exists) {
            // Actualizar la columna de perros
            const result = await updateDogsForClient(userId, conversations[userId].dogs);
            if (result.updated) {
                await flowDynamic(`🐶 Agregamos a *${selectedDog.nombre}* a tu lista de peluditos.`);
            } else {
                await flowDynamic(`⚠️ Ocurrió un error al actualizar tu lista. Intenta más tarde.`);
            }
        } else {
            // Insertar nueva fila
            const result = await insertClientBasicInfo(conversations[userId]);
            if (result.added) {
                await flowDynamic(`🐾 ¡Tu peludito *${selectedDog.nombre}* fue registrado exitosamente!`);

                //Saturday
                //await flowDynamic(`🐾 ¡Tu peludito *${selectedDog.nombre}* fue registrado exitosamente!. Utiliza el código ${result.promoCode} para tener tu primer paseo gratis 🥳`);
            } else {
                await flowDynamic(`⚠️ Ocurrió un error al registrar a *${selectedDog.nombre}*. Intenta más tarde.`);
            }
        }
    })
    .addAction(async (ctx, { gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        //Temporal: Deberia ir a l1 pero como solo van a ser paseos en un inicio, salta directamente a paseo
        //return gotoFlow(l1);

        //return gotoFlow(m1);
        //Temporal
        return gotoFlow(init);
    });

const l1 = addKeyword('write_cc')
  .addAction(async (ctx, { flowDynamic, gotoFlow  }) => {countAndLog('l1');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
    const userId = ctx.from;
    const dogName = conversations[userId]?.selectedDog.nombre || 'tu peludito';
    console.log(conversations[ctx.from]);
    
    await flowDynamic([
      {
        body: `¿Qué quieres para *${dogName}*?`,
        buttons: [
          { body: 'Paseo' },
          { body: 'Cuidarlo en casa' }
        ]
      }
    ]);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
    const choice = ctx.body;

    if (choice === 'Paseo') return gotoFlow(m1);
    if (choice === 'Cuidarlo en casa') return gotoFlow(m2);
    return gotoFlow(l1);
  });

const m1 = addKeyword('write_cc')
  .addAction(async (ctx, { flowDynamic, gotoFlow  }) => {countAndLog('m1');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
    const userId = ctx.from;

    await flowDynamic([
      {
        body: `¿Cuánto tiempo necesitas el paseo?`,
        buttons: [
          { body: 'Flash (15 min)' },
          { body: 'Chill (30 min)' },
          { body: 'Adventure (1H)' }
        ]
      }
    ]);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
    const choice = ctx.body;
    conversations[ctx.from].tipoServicio = "Paseo"
    if (choice === 'Flash (15 min)') {
        conversations[ctx.from].tiempoServicio = "15 minutos"
        conversations[ctx.from].precio = 7500
        return gotoFlow(q1);}
    if (choice === 'Chill (30 min)') {
        conversations[ctx.from].tiempoServicio = "30 minutos"
        conversations[ctx.from].precio = 10000
        return gotoFlow(q1);}
    if (choice === 'Adventure (1H)') {
        conversations[ctx.from].tiempoServicio = "60 minutos"
        conversations[ctx.from].precio = 17000
        return gotoFlow(q1);}
    return gotoFlow(m1);
  });

const m2 = addKeyword('write_cc')
  .addAction(async (ctx, { flowDynamic, gotoFlow  }) => {countAndLog('m2');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);

    await flowDynamic([
      {
        body: `¿Cuánto tiempo necesitas que ${conversations[ctx.from].selectedDog.nombre} mascota se quede en la casa del cuidador? `,
        buttons: [
          { body: 'Medio dia' },
          { body: 'Un dia' },
          { body: 'Varios dias' }
        ]
      }
    ]);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
    const choice = ctx.body;
    conversations[ctx.from].tipoServicio = "Cuidado"
    if (choice === 'Medio dia') {
        conversations[ctx.from].tiempoServicio = "Medio dia"
        return gotoFlow(q1);}
    if (choice === 'Un dia') {
        conversations[ctx.from].tiempoServicio = "Un dia"
        return gotoFlow(q1);}
    if (choice === 'Varios dias') {
        return gotoFlow(o2);}
    return gotoFlow(m2);
  });

const o1 = addKeyword('write_pet_description')
  .addAction(async (ctx, { flowDynamic, gotoFlow  }) => {countAndLog('o1');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
      await flowDynamic(`¿Cuántas horas necesitas el servicio? (Escribe solo un número del 1 al 12)`);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { flowDynamic, gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
      const cita = ctx.body.trim();
      const esNumero = /^\d+$/.test(cita);
      const numero = parseInt(cita);

      if (!esNumero || numero < 1 || numero > 12) {
          await flowDynamic("❌ Por favor, escribe un número válido entre 1 y 12.");
          return gotoFlow(o1);
      }

      conversations[ctx.from].tiempoServicio = cita;

      return gotoFlow(q1);
  });

const o2 = addKeyword('write_pet_description')
  .addAction(async (ctx, { flowDynamic, gotoFlow  }) => {countAndLog('o2');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
      const petName = conversations[ctx.from].selectedDog?.nombre || '[vacio]';

      await flowDynamic(`¿Cuántos días necesitas que *${petName}* se quede? (Escribe solo el número del 1 al 30)`);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { flowDynamic, gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
      const cita = ctx.body.trim();
      const esNumero = /^\d+$/.test(cita);
      const numero = parseInt(cita);

      if (!esNumero || numero < 1 || numero > 30) {
          await flowDynamic("❌ Por favor, ingresa un número válido entre 1 y 30.");
          return gotoFlow(o2);
      }

      conversations[ctx.from].tiempoServicio = cita;

      return gotoFlow(q1);
  });

const q1 = addKeyword('write_pet_description')
  .addAction(async (ctx, { flowDynamic, gotoFlow  }) => {countAndLog('q1');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
      const petName = conversations[ctx.from].selectedDog?.nombre || '[vacio]';

      await flowDynamic(`Indica la fecha en la que quieres que paseemos a ${petName}`);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { flowDynamic, gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
      const cita = ctx.body.trim();

      conversations[ctx.from].fechaServicio = cita;

      return gotoFlow(q1_hora);
  });

const q1_hora = addKeyword('write_pet_description')
  .addAction(async (ctx, { flowDynamic, gotoFlow  }) => {countAndLog('q1_hora');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
      const petName = conversations[ctx.from].selectedDog?.nombre || '[vacio]';

      await flowDynamic(`Indica la hora en la que quieres que paseemos a ${petName}`);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { flowDynamic, gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
      const cita = ctx.body.trim();

      conversations[ctx.from].inicioServicio = cita;

      return gotoFlow(s1);
  });

const s1 = addKeyword('write_pet_description')
  .addAction(async (ctx, { flowDynamic, gotoFlow }) => {
    countAndLog('s1');
    if (handleConversationTimeout(ctx.from)) return gotoFlow(init);

    // Buscar dirección previa en la hoja de cálculo
    let previousAddress = null;
    try {
      const resultado = await findCelInSheet(ctx.from);
      if (resultado.exists && resultado.userData) {
        previousAddress = resultado.userData[9] || null;
      }
    } catch (e) {
      console.error('Error buscando dirección previa:', e);
    }

    if (!previousAddress || previousAddress.trim() === "") {
      // No hay dirección previa, preguntar y guardar
      await flowDynamic(`¿Cuál es la dirección exacta donde recogeremos a tu peludito? 🏠`);
      ctx._step = 'first_address';
    } else {
      // Ya hay dirección previa, preguntar si quiere usarla
      await flowDynamic([
        {
          body: `¿Quieres usar la dirección registrada anteriormente?\n\n*${previousAddress}*`,
          buttons: [
            { body: 'Sí, usar esa' },
            { body: 'Ingresar nueva' }
          ]
        }
      ]);
      ctx._step = 'confirm_address';
    }
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { flowDynamic, gotoFlow }) => {
    if (handleConversationTimeout(ctx.from)) return gotoFlow(init);

    // Buscar dirección previa en la hoja de cálculo
    let previousAddress = null;
    try {
      const resultado = await findCelInSheet(ctx.from);
      if (resultado.exists && resultado.userData) {
        previousAddress = resultado.userData[9] || null;
      }
    } catch (e) {
      console.error('Error buscando dirección previa:', e);
    }

    let direccion = ctx.body.trim();

    // Si no hay dirección previa, lo que el usuario responde es la dirección y se debe guardar y seguir al flujo u1
    if ((!previousAddress || previousAddress.trim() === "") && ctx._step === 'first_address') {
      if (!direccion) {
        await flowDynamic('❌ Dirección vacía. Por favor, intenta nuevamente.');
        return gotoFlow(s1);
      }
      conversations[ctx.from].address = direccion;
      try {
        const { updateUserCellById } = await import("~/services/googleSheetsService");
        await updateUserCellById(ctx.from, 9, direccion);
      } catch (e) {
        console.error('Error actualizando dirección en la hoja:', e);
      }
      return gotoFlow(u1);
    }

    // Si hay dirección previa, preguntar si la usa o quiere ingresar nueva
    if (previousAddress && previousAddress.trim() !== "") {
      if (direccion.toLowerCase() === 'sí, usar esa' || direccion.toLowerCase() === 'si, usar esa') {
        conversations[ctx.from].address = previousAddress;
        return gotoFlow(u1);
      } else if (direccion.toLowerCase() === 'ingresar nueva') {
        // Borra la dirección en la hoja y en memoria, luego repite s1
        conversations[ctx.from].address = '';
        try {
          const { updateUserCellById } = await import("~/services/googleSheetsService");
          await updateUserCellById(ctx.from, 9, '');
        } catch (e) {
          console.error('Error borrando dirección en la hoja:', e);
        }
        return gotoFlow(s1);
      }
    }

    // Si el usuario responde con una dirección nueva después de rechazar la anterior
    if (ctx._step === 'new_address') {
      if (!direccion) {
        await flowDynamic('❌ Dirección vacía. Por favor, intenta nuevamente.');
        return gotoFlow(s1);
      }
      conversations[ctx.from].address = direccion;
      try {
        const { updateUserCellById } = await import("~/services/googleSheetsService");
        await updateUserCellById(ctx.from, 9, direccion);
      } catch (e) {
        console.error('Error actualizando dirección en la hoja:', e);
      }
      return gotoFlow(u1);
    }

    // Si el usuario responde con algo inesperado, repetir
    await flowDynamic('Por favor, selecciona una opción válida o ingresa una dirección.');
    return gotoFlow(s1);
  });

const s1_barrio = addKeyword('write_pet_description')
  .addAction(async (ctx, { flowDynamic, gotoFlow  }) => {countAndLog('s1_barrio');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
    await flowDynamic(`¿Y cuál es el barrio donde queda esa dirección? 🏘️`);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { flowDynamic, gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
    const barrioUsuario = ctx.body.trim();

    if (!barrioUsuario) {
      await flowDynamic('❌ Barrio vacío. Por favor, escribe un nombre de barrio válido.');
      return gotoFlow(s1_barrio);
    }

    const userId = ctx.from;
    const fullAddress = `${conversations[userId].address}, ${barrioUsuario}`;

    conversations[userId].address = fullAddress;
    conversations[userId].barrio = barrioUsuario;

    // Consultar APIs
    const { barrio, localidad } = await getLocalidadDesdeDireccion(fullAddress);
    const ciudad = await getCiudadDesdeDireccion(fullAddress);

    if (barrio) {
    conversations[userId].barrio = barrio;
    } else {
        conversations[userId].barrio = barrioUsuario;
    }

    //conversations[userId].barrio = barrio;
    conversations[userId].localidad = localidad;
    conversations[userId].ciudad = ciudad;

    /*
    if (barrio || localidad) {
      //await flowDynamic(`📍 Localidad detectada: *${localidad ?? 'desconocida'}*\n🏘️ Barrio detectado: *${barrio ?? 'desconocido'}*`);
    } else {
      await flowDynamic(`⚠️ No pudimos detectar tu zona exacta, pero seguiremos con la dirección que nos diste.`);
    }
    */

    return gotoFlow(u1);
  });

const u1 = addKeyword('write_cc')
  .addAction(async (ctx, { flowDynamic, gotoFlow }) => {countAndLog('u1');
    if (handleConversationTimeout(ctx.from)) return gotoFlow(init);

    const conv = conversations[ctx.from];
    
    // Verifica si es primer paseo
    const userWalks = await getWalksCountForClient(conv.id);

    console.log(userWalks);

    let valor = "Gratis el primer paseo"
    
    if (userWalks === 0) {
      conv.precio = 0;
    }
    else {
      valor = String(conv.precio)
    }

    await flowDynamic([
      {
        body: `Ya casi\nTe confirmo estos datos:\n\nPeludito: ${conv.selectedDog.nombre}\nDuración: ${conv.tiempoServicio}\nDonde: ${conv.address}\n\nTotal: $${valor}\n\n¿Todo correcto?`,
        buttons: [
          { body: 'Si' },
          { body: 'No' }
        ]
      }
    ]);
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { flowDynamic, gotoFlow }) => {
    if (handleConversationTimeout(ctx.from)) return gotoFlow(init);

    const input = ctx.body.trim().toLowerCase();
    const userId = ctx.from;
    const conv = conversations[userId];

    if (input === 'si') {
      console.log("Creando nuevo log");

      await insertLeadRow(conv);
      await updateWalksCounterForClient(conv.id);
      await sendAdminNotification('3332885462', `Nuevo lead\nNumero Cliente: ${conv.id}\n\nCopia el siguiente mensaje`);
      await sendAdminNotification('3332885462', `Nuevo paseo\n\nPeludito: ${conv.selectedDog.nombre}\nDuración: ${conv.tiempoServicio}\nDonde: ${conv.address}\nHora:${conv.fechaServicio}\nPrecio del servicio: $${conv.precio}`);
      return gotoFlow(end);
    }

    if (input === 'pawwilover') {
      const discountResult = await applyPawwiloverDiscount(conv.id);

      if (discountResult.updated) {
        conv.precio = Math.floor(conv.precio / 2);

        await flowDynamic(`🎉 ¡Felicidades! Se ha aplicado un 50% de descuento por ser un *PAWWILOVER*.\n\nNuevo total: $${conv.precio}`);
      } else {
        await flowDynamic(`⚠️ ${discountResult.message || 'No se pudo aplicar el descuento.'}`);
      }

      return gotoFlow(u1); // Mostrar resumen actualizado
    }

    if (input === 'no') {
      return gotoFlow(userRegistered_repeat);
    }

    return gotoFlow(u1);
  });

const end = addKeyword('write_pet_description')
  .addAction(async (ctx, { flowDynamic, gotoFlow }) => {countAndLog('end');
      handleConversationEnd(ctx.from);
      const input = ctx.body.trim().toLowerCase();
        const userId = ctx.from;
        const conv = conversations[userId];
        const dog = conv.selectedDog;

      await flowDynamic(`✅ ¡Solicitud enviada exitosamente!

En unos instantes nuestro *Equipo de Pawwi* se estará comunicando contigo para confirmar el paseo de ${dog?.nombre}

Si tienes dudas con tu servicio, o quieres comentar una novedad, contáctate con  *Pawwer de soporte* +57 3023835152`);

      // Enviar mensaje de prueba con control de error
      try {

          await provider.sendMessage('573332885462@c.us', 'Hola mundo');

          console.log('Mensaje enviado correctamente a 573332885462');
      } catch (error) {
          console.error('Error al enviar el mensaje a 573332885462:', error);
      }
  })
  .addAnswer('', { capture: true })
  .addAction(async (ctx, { gotoFlow }) => {
      const raza = ctx.body.trim();
      const userId = ctx.from;
      if (conversations[userId].selectedDog) {
          conversations[userId].selectedDog.raza = raza;
      }
      return gotoFlow(init);
  });

// 🆕 Flujo para registro nuevo
const c2 = addKeyword('write_cc_new')
    .addAnswer(`Queremos cuidar de ti y de tu peludito con la mejor seguridad 🐾🔒\n
¿Me ayudas con tu número de cédula (sin puntos ni letras)? 📝…`)
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {countAndLog('c2');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const cedula = ctx.body.trim();
        const isValid = /^\d{6,10}$/.test(cedula);

        if (isValid) {
            const userId = ctx.from;
            conversations[userId] = conversations[userId] || new conversation();
            conversations[userId].cc = parseInt(cedula);

            console.log('🆔 Conversación ID:', userId);
            console.log('🗂 Conversación actual:', conversations[userId]);

            return gotoFlow(i1);
        }

        await flowDynamic("❌ Lo que ingresaste no parece una cédula válida. Intenta de nuevo por favor.");
        return gotoFlow(c2);
    });

    const name = addKeyword('write_cc_new')
    .addAnswer(`Para comenzar con tu registro…\n\n¿Cómo te llamas? 🐾…`)
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const nombre = ctx.body.trim();
        conversations[ctx.from].name = ctx.body.trim()
        return gotoFlow(c2);
    });

const e3 = addKeyword('write_cc_check')
    .addAction(async (ctx, { flowDynamic, gotoFlow  }) => {countAndLog('e3');if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const cedula = conversations[ctx.from].cc || '[cédula no encontrada]';

        await flowDynamic([
            {
                body: `Tu cédula es ${cedula}, ¿es correcto?`,
                buttons: [
                    { body: 'Si' },
                    { body: 'No' }
                ]
            }
        ]);
    })
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { flowDynamic, gotoFlow }) => {if (handleConversationTimeout(ctx.from)) return gotoFlow(init);
        const choice = ctx.body.toLowerCase();

        if (choice === 'si' || choice === 'sí') {
            return gotoFlow(i1);
        }

        if (choice === 'no') {
            await flowDynamic('🔁 Vamos a intentarlo de nuevo.');
            return gotoFlow(c2);
        }

        await flowDynamic("Por favor, selecciona una opción válida.");
        return gotoFlow(e3);
    });

    export {
        init,
        userRegistered,
        userRegistered_repeat,
        start,
        start_repeat,
        e3,
        name,
        i1,
        k1_raza,
        k1_edad,
        k1_peso,
        k1_consideraciones,
        k1_register,
        l1,
        m1,
        m2,
        o1,
        o2,
        q1,
        q1_hora,
        s1,
        s1_barrio,
        u1,
        c2,
        end
    };