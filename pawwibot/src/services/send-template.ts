import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function TEMPLATE_bienvenida_pawwi(to, name = "amigo") {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "bienvenida_pawwi",
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: name } // Reemplaza {{1}} de la plantilla
          ]
        }
      ]
    }
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Plantilla enviada:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar plantilla:", err.response?.data || err);
  }
}

export async function TEMPLATE_registro_nombre_perrito(to) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "registro_nombre_perrito", // This is the name of your template on Meta/WhatsApp Business
      language: { code: "es" }
      // No 'components' array needed for parameters if the template has no placeholders or buttons
      // No 'buttons' property needed as per your request
    }
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Plantilla 'registro_nombre_perrito' enviada:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar plantilla 'registro_nombre_perrito':", err.response?.data || err);
  }
}

export async function TEMPLATE_registro_raza_perrito(to, dogName) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "registro_raza_perrito", // Make sure this matches your approved template name
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: dogName } // Replaces {{1}} in the template with the dog's name
          ]
        }
      ]
    }
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Plantilla 'registro_raza_perrito' enviada:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar plantilla 'registro_raza_perrito':", err.response?.data || err);
  }
}

export async function TEMPLATE_registro_edad_perrito(to, dogName) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "registro_edad_perrito", // Asegúrate de que este nombre coincida con tu plantilla aprobada
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: dogName } // Reemplaza {{1}} de la plantilla con el nombre del perrito
          ]
        }
      ]
    }
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Plantilla 'registro_edad_perrito' enviada:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar plantilla 'registro_edad_perrito':", err.response?.data || err);
  }
}

export async function TEMPLATE_registro_consideraciones_perrito(to, dogName) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "registro_consideraciones_perrito", // Asegúrate de que este nombre coincida con tu plantilla aprobada
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: dogName } // Reemplaza {{1}} de la plantilla con el nombre del perrito
          ]
        }
      ]
    }
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Plantilla 'registro_consideraciones_perrito' enviada:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar plantilla 'registro_consideraciones_perrito':", err.response?.data || err);
  }
}

export async function TEMPLATE_registro_vacunas_perrito(to, dogName) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "registro_vacunas_perrito", // Asegúrate de que este nombre coincida con tu plantilla aprobada
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: dogName } // Reemplaza {{1}} de la plantilla con el nombre del perrito
          ]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 0,
          parameters: [{ type: "payload", payload: "VACUNAS_SI" }] // Payload para "Sí, todas al día"
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 1,
          parameters: [{ type: "payload", payload: "VACUNAS_NO" }] // Payload para "Aún no"
        }
      ]
    }
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Plantilla 'registro_vacunas_perrito' enviada:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar plantilla 'registro_vacunas_perrito':", err.response?.data || err);
  }
}

export async function TEMPLATE_registro_agendar_paseo(to, dogName) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "registro_agendar_paseo", // Asegúrate de que este nombre coincida con tu plantilla aprobada
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: dogName } // Reemplaza {{1}} de la plantilla con el nombre del perrito
          ]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 0,
          parameters: [{ type: "payload", payload: "AGENDAR_PASEO_SI" }] // Payload para "Sí, agendar paseo"
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 1,
          parameters: [{ type: "payload", payload: "AGENDAR_PASEO_MAS_TARDE" }] // Payload para "Más tarde"
        }
      ]
    }
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Plantilla 'registro_agendar_paseo' enviada:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar plantilla 'registro_agendar_paseo':", err.response?.data || err);
  }
}

export async function TEMPLATE_agendar_tipo_paseo(to, dogName = "tu perrito") {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "agendar_tipo_paseo", // Debe coincidir exactamente con el nombre en Meta
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: dogName } // Reemplaza {{1}} en la plantilla
          ]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 0,
          parameters: [
            { type: "payload", payload: "FLASH_15_MIN" } // Payload del botón 1: Flash
          ]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 1,
          parameters: [
            { type: "payload", payload: "CHILL_30_MIN" } // Payload del botón 2: Chill
          ]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 2,
          parameters: [
            { type: "payload", payload: "ADVENTURE_1_HORA" } // Payload del botón 3: Adventure
          ]
        }
      ]
    }
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Plantilla 'agendar_tipo_paseo' enviada:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar plantilla 'agendar_tipo_paseo':", err.response?.data || err);
  }
}


export async function TEMPLATE_agendar_fecha_paseo(to, dogName = "tu perrito") {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "agendar_fecha_paseo", // Nombre exacto en Meta
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: dogName } // Reemplaza {{1}} con nombre del perrito
          ]
        }
      ]
    }
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Plantilla 'agendar_fecha_paseo' enviada:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar plantilla 'agendar_fecha_paseo':", err.response?.data || err);
  }
}

export async function TEMPLATE_ragendar_hora_paseo(to, dogName = "tu perrito") {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "agendar_hora_paseo", // Asegúrate que el nombre coincida con la plantilla aprobada
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: dogName } // Reemplaza {{1}} con el nombre del perrito
          ]
        }
      ]
    }
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Plantilla 'ragendar_hora_paseo' enviada:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar plantilla 'ragendar_hora_paseo':", err.response?.data || err);
  }
}

export async function TEMPLATE_agendar_metodo_pago(to, dogName = "tu perrito") {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "agendar_metodo_pago", // Debe coincidir con el nombre aprobado en Meta
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: dogName } // Reemplaza {{1}} con el nombre del perrito
          ]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 0,
          parameters: [{ type: "payload", payload: "METODO_PAGO_NEQUI" }]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 1,
          parameters: [{ type: "payload", payload: "METODO_PAGO_LINK_BOLD" }]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 2,
          parameters: [{ type: "payload", payload: "METODO_PAGO_EFECTIVO" }]
        }
      ]
    }
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Plantilla 'agendar_metodo_pago' enviada:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar plantilla 'agendar_metodo_pago':", err.response?.data || err);
  }
}

export async function TEMPLATE_agendar_resumen_paseo(
  to,
  {
    dogName = 'tu perrito',
    calle = 'Calle no especificada',
    colonia = 'Colonia no especificada',
    fecha = 'Fecha no definida',
    hora = 'Hora no definida',
    tipoPaseo = 'Tipo no definido',
    precio = '$0',
    metodoPago = 'No definido'
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "agendar_resumen_paseo",
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: dogName },
            { type: "text", text: calle },
            { type: "text", text: colonia },
            { type: "text", text: fecha },
            { type: "text", text: hora },
            { type: "text", text: tipoPaseo },
            { type: "text", text: precio },
            { type: "text", text: metodoPago }
          ]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 0,
          parameters: [{ type: "payload", payload: "SI" }]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: 1,
          parameters: [{ type: "payload", payload: "NO" }]
        }
      ]
    }
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Plantilla 'agendar_resumen_paseo' enviada:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar plantilla 'agendar_resumen_paseo':", err.response?.data || err);
  }
}
