import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/* Notificaciones */
/**
 * Envía una plantilla de WhatsApp a través de la API de Meta.
 * @param numeroDestino Número del usuario en formato internacional (ej: '573123456789').
 * @param plantilla Nombre EXACTO de la plantilla aprobada en Meta.
 * @param variables Array de textos para las variables de la plantilla.
 */
export async function enviarPlantillaWhatsApp(numeroDestino: string, plantilla: string, variables: string[]) {
  const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    "Content-Type": "application/json",
  };

  const body = {
    messaging_product: "whatsapp",
    to: numeroDestino,
    type: "template",
    template: {
      name: plantilla,
      language: { code: "es_CO" },
      components: [
        {
          type: "body",
          parameters: variables.map((texto) => ({ type: "text", text: texto })),
        },
      ],
    },
  };

  try {
    const response = await axios.post(url, body, { headers });
    console.log(`✅ Mensaje enviado a ${numeroDestino} con plantilla "${plantilla}"`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error al enviar mensaje:", error.response?.data || error.message);
    throw error;
  }
}


export async function TEMPLATE_confirmacion_paseo_cliente(
  to,
  {
    nombreCliente,
    nombrePerrito,
    calle,
    fecha,
    hora,
    duracion,
    precio,
    pawwer
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "confirmacion_paseo_cliente",
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nombreCliente },
            { type: "text", text: nombrePerrito },
            { type: "text", text: calle },
            { type: "text", text: fecha },
            { type: "text", text: hora },
            { type: "text", text: duracion },
            { type: "text", text: precio },
            { type: "text", text: pawwer }
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

    console.log("✅ Plantilla 'confirmacion_paseo_cliente' enviada:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar plantilla 'confirmacion_paseo_cliente':", err.response?.data || err);
  }
}

export async function TEMPLATE_recordatorio_paseo_cliente(
  to: string,
  {
    nombreCliente,
    nombrePerrito,
    fecha,
    hora,
    calle,
    duracion,
  }: {
    nombreCliente: string;
    nombrePerrito: string;
    fecha: string;
    hora: string;
    calle: string;
    duracion: string;
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "recordatorio_paseo_cliente",
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nombreCliente },
            { type: "text", text: nombrePerrito },
            { type: "text", text: fecha },
            { type: "text", text: hora },
            { type: "text", text: calle },
            { type: "text", text: duracion },
          ],
        },
      ],
    },
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Plantilla 'recordatorio_paseo_cliente' enviada:", res.data);
  } catch (err: any) {
    const errorData = err.response?.data;

    console.error("❌ Error al enviar plantilla 'recordatorio_paseo_cliente':");
    if (errorData) {
      console.error("📌 Código de error:", errorData.error?.code);
      console.error("📌 Mensaje:", errorData.error?.message);
      console.error("📌 Tipo:", errorData.error?.type);
      console.error("📌 Detalles:", JSON.stringify(errorData, null, 2));
    } else {
      console.error("📌 Error desconocido:", err.message);
    }
  }
}

export async function TEMPLATE_recordatorio_paseo_pawwer(
  to: string,
  {
    nombrePawwer,
    nombrePerrito,
    calle,
    fecha,
    hora,
    duracion,
  }: {
    nombrePawwer: string;
    nombrePerrito: string;
    calle: string;
    fecha: string;
    hora: string;
    duracion: string;
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "recordatorio_paseo_pawwer",
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nombrePawwer },
            { type: "text", text: nombrePerrito },
            { type: "text", text: calle },
            { type: "text", text: fecha },
            { type: "text", text: hora },
            { type: "text", text: duracion },
          ],
        },
      ],
    },
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Plantilla 'recordatorio_paseo_pawwer' enviada:", res.data);
  } catch (err: any) {
    console.error(
      "❌ Error al enviar plantilla 'recordatorio_paseo_pawwer':",
      err.response?.data || err.message
    );
  }
}

export async function TEMPLATE_llegada_pawwer(
  to: string,
  {
    nombrePawwer,
    nombrePerrito,
  }: {
    nombrePawwer: string;
    nombrePerrito: string;
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "llegada_pawwer",
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nombrePawwer },
            { type: "text", text: nombrePerrito },
          ],
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: "0",
          parameters: [{ type: "payload", payload: "confirmar_llegada" }],
        },
      ],
    },
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Plantilla 'llegada_pawwer' enviada:", res.data);
  } catch (err: any) {
    console.error(
      "❌ Error al enviar plantilla 'llegada_pawwer':",
      err.response?.data || err.message
    );
  }
}

export async function TEMPLATE_pawwer_llego_cliente(
  to: string,
  {
    nombreCliente,
    nombrePawwer,
    nombrePerrito,
    calle,
    colonia,
    fecha,
    hora,
    duracion,
  }: {
    nombreCliente: string;
    nombrePawwer: string;
    nombrePerrito: string;
    calle: string;
    colonia: string;
    fecha: string;
    hora: string;
    duracion: string;
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "pawwer_llego_cliente",
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nombreCliente },
            { type: "text", text: nombrePawwer },
            { type: "text", text: nombrePerrito },
            { type: "text", text: calle },
            { type: "text", text: colonia },
            { type: "text", text: fecha },
            { type: "text", text: hora },
            { type: "text", text: duracion },
          ],
        },
      ],
    },
  };

  const res = await axios.post(
    `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("📩 pawwer_llego_cliente enviada:", res.data);
}


export async function TEMPLATE_strava_recordatorio_pawwer(
  to: string,
  {
    nombrePawwer,
    nombrePerrito,
  }: {
    nombrePawwer: string;
    nombrePerrito: string;
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "strava_recordatorio_pawwer",
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nombrePawwer },
            { type: "text", text: nombrePerrito },
          ],
        },
      ],
    },
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Plantilla 'strava_recordatorio_pawwer' enviada:", res.data);
  } catch (err: any) {
    console.error(
      "❌ Error al enviar plantilla 'strava_recordatorio_pawwer':",
      err.response?.data || err.message
    );
  }
}

export async function TEMPLATE_link_strava_cliente(
  to: string,
  {
    nombreCliente,
    nombrePerrito,
    linkStrava,
  }: {
    nombreCliente: string;
    nombrePerrito: string;
    linkStrava: string;
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "link_strava_cliente",
      language: { code: "es_CO" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nombreCliente },
            { type: "text", text: nombrePerrito },
          ],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [
            { type: "text", text: linkStrava },
          ],
        },
      ],
    },
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Plantilla 'link_strava_cliente' enviada:", res.data);
  } catch (err: any) {
    console.error(
      "❌ Error al enviar plantilla 'link_strava_cliente':",
      err.response?.data || err.message
    );
  }
}


export async function TEMPLATE_finalizar_paseo_pawwer(
  to: string,
  {
    nombrePawwer,
    nombrePerrito,
  }: {
    nombrePawwer: string;
    nombrePerrito: string;
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "finalizar_paseo_pawwer",
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nombrePawwer },
            { type: "text", text: nombrePerrito },
          ],
        },
      ],
    },
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Plantilla 'finalizar_paseo_pawwer' enviada:", res.data);
  } catch (err: any) {
    console.error(
      "❌ Error al enviar plantilla 'finalizar_paseo_pawwer':",
      err.response?.data || err.message
    );
  }
}

export async function TEMPLATE_paseo_finalizado_cliente(
  to: string,
  {
    nombreCliente,
    nombrePerrito,
  }: {
    nombreCliente: string;
    nombrePerrito: string;
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "paseo_finalizado_cliente",
      language: { code: "es" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nombreCliente },
            { type: "text", text: nombrePerrito },
          ],
        },
      ],
    },
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Plantilla 'paseo_finalizado_cliente' enviada:", res.data);
  } catch (err: any) {
    console.error(
      "❌ Error al enviar plantilla 'paseo_finalizado_cliente':",
      err.response?.data || err.message
    );
  }
}

export async function TEMPLATE_recordatorio_pago_cliente(
  to: string,
  {
    nombreCliente,
    nombrePerrito,
    valorPaseo,
  }: {
    nombreCliente: string;
    nombrePerrito: string;
    valorPaseo: string;
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "recordatorio_pago_cliente",
      language: { code: "es_CO" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nombreCliente },
            { type: "text", text: nombrePerrito },
            { type: "text", text: valorPaseo },
          ],
        },
      ],
    },
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Plantilla 'recordatorio_pago_cliente' enviada:", res.data);
  } catch (err: any) {
    console.error(
      "❌ Error al enviar plantilla 'recordatorio_pago_cliente':",
      err.response?.data || err.message
    );
  }
}

export async function TEMPLATE_recibir_perro_pawwer(
  to: string,
  {
    nombrePerrito,
  }: {
    nombrePerrito: string;
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "recibir_perro_pawwer", // nombre EXACTO de la plantilla en Meta
      language: { code: "es_CO" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nombrePerrito }, // reemplaza {{perro}}
          ],
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: "0",
          parameters: [{ type: "payload", payload: "INICIAR_PASEO" }], // acción asociada al botón
        },
      ],
    },
  };

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Plantilla 'recibir_perro_pawwer' enviada:", res.data);
  } catch (err: any) {
    console.error(
      "❌ Error al enviar plantilla 'recibir_perro_pawwer':",
      err.response?.data || err.message
    );
  }
}

export async function TEMPLATE_utils_confirmacion_paseo_cliente(
  to,
  {
    nombreCliente,
    //nombrePerrito,
    calle,
    fecha,
    hora,
    duracion,
    precio,
    pawwer
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
  messaging_product: "whatsapp",
  to,
  type: "template",
  template: {
    name: "utils_confirmacion_paseo_client", // 👈 Exacto como en Meta
    language: { code: "es_CO" },              // 👈 Usa "es_CO" si la plantilla es Spanish (COL)
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: nombreCliente },
          //{ type: "text", text: nombrePerrito },
          { type: "text", text: calle },
          { type: "text", text: fecha },
          { type: "text", text: hora },
          { type: "text", text: duracion },
          { type: "text", text: precio },
          { type: "text", text: pawwer }
        ]
      },
      {
        type: "button",
        sub_type: "quick_reply",
        index: "0", // Botón 1
        parameters: [
          { type: "text", text: "VER_DETALLES" }
        ]
      },
      {
        type: "button",
        sub_type: "quick_reply", // o "quick_reply"
        index: "1", // Botón 2
        parameters: [
          { type: "text", text: "CAMBIAR_PASEO" }
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

    console.log("✅ Plantilla 'confirmacion_paseo_cliente' enviada:", res.data);
  } catch (err) {
    console.error(
      "❌ Error al enviar plantilla 'utils_confirmacion_paseo_client':",
      err.response?.data || err
    );
  }
}

export async function TEMPLATE_utils_recordatorio_paseo_cliente(
  to,
  {
    nombreCliente,
    nombrePerrito,
    fecha,
    hora,
    direccion,
    duracion
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "utils_recordatorio_paseo_cliente", // nombre EXACTO de tu plantilla
      language: { code: "es_CO" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: nombreCliente },
            { type: "text", text: nombrePerrito },
            { type: "text", text: fecha },
            { type: "text", text: hora },
            { type: "text", text: direccion },
            { type: "text", text: duracion }
          ]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: "0" // Confirmar
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: "1"
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

    console.log("✅ Plantilla 'utils_recordatorio_paseo_cliente' enviada:", res.data);
  } catch (err) {
    console.error(
      "❌ Error al enviar plantilla 'utils_recordatorio_paseo_cliente':",
      err.response?.data || err
    );
  }
}

export async function TEMPLATE_utils_confirmacion_paseo_pawwer(
  to,
  {
    direccion,
    fecha,
    hora,
    duracion,
    precio
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "utils_confirmacion_paseo_pawwer",
      language: { code: "es_CO" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: direccion },
            { type: "text", text: fecha },
            { type: "text", text: hora },
            { type: "text", text: duracion },
            { type: "text", text: precio }
          ]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: "0" 
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

    console.log("✅ Plantilla 'utils_confirmacion_paseo_pawwer' enviada:", res.data);
  } catch (err) {
    console.error(
      "❌ Error al enviar plantilla 'utils_confirmacion_paseo_pawwer':",
      err.response?.data || err
    );
  }
}

export async function TEMPLATE_utils_recordatorio_paseo_pawwer(
  to,
  {
    perro,
    direccion,
    fecha,
    hora,
    duracion
  }
) {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "utils_recordatorio_paseo_pawwer",
      language: { code: "es_CO" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: perro },
            { type: "text", text: direccion },
            { type: "text", text: fecha },
            { type: "text", text: hora },
            { type: "text", text: duracion }
          ]
        },
        {
          type: "button",
          sub_type: "quick_reply",
          index: "0",
          parameters: [
            { type: "text", text: "REPORTAR_NOVEDAD" } // 👈 texto fijo definido en la plantilla
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

    console.log("✅ Plantilla 'utils_recordatorio_paseo_pawwer' enviada:", res.data);
  } catch (err) {
    console.error(
      "❌ Error al enviar plantilla 'utils_recordatorio_paseo_pawwer':",
      err.response?.data || err
    );
  }
}

export async function TEMPLATE_bienvenida_msg(to, name = "amigo") {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: "bienvenida_msg", // Nombre exacto de la plantilla en Meta
      language: { code: "es_CO" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: name } // Reemplaza {{1}} en tu plantilla
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

    console.log("✅ Plantilla 'bienvenida_msg' enviada:", res.data);
  } catch (err) {
    console.error(
      "❌ Error al enviar plantilla 'bienvenida_msg':",
      err.response?.data || err
    );
  }
}