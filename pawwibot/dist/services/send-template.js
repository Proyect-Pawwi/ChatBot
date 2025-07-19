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
                        { type: "text", text: name }
                    ]
                }
            ]
        }
    };
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Plantilla enviada:", res.data);
    }
    catch (err) {
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
            name: "registro_nombre_perrito",
            language: { code: "es" }
        }
    };
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Plantilla 'registro_nombre_perrito' enviada:", res.data);
    }
    catch (err) {
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
            name: "registro_raza_perrito",
            language: { code: "es" },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: dogName }
                    ]
                }
            ]
        }
    };
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Plantilla 'registro_raza_perrito' enviada:", res.data);
    }
    catch (err) {
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
            name: "registro_edad_perrito",
            language: { code: "es" },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: dogName }
                    ]
                }
            ]
        }
    };
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Plantilla 'registro_edad_perrito' enviada:", res.data);
    }
    catch (err) {
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
            name: "registro_consideraciones_perrito",
            language: { code: "es" },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: dogName }
                    ]
                }
            ]
        }
    };
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Plantilla 'registro_consideraciones_perrito' enviada:", res.data);
    }
    catch (err) {
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
            name: "registro_vacunas_perrito",
            language: { code: "es" },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: dogName }
                    ]
                },
                {
                    type: "button",
                    sub_type: "quick_reply",
                    index: 0,
                    parameters: [{ type: "payload", payload: "VACUNAS_SI" }]
                },
                {
                    type: "button",
                    sub_type: "quick_reply",
                    index: 1,
                    parameters: [{ type: "payload", payload: "VACUNAS_NO" }]
                }
            ]
        }
    };
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Plantilla 'registro_vacunas_perrito' enviada:", res.data);
    }
    catch (err) {
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
            name: "registro_agendar_paseo",
            language: { code: "es" },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: dogName }
                    ]
                },
                {
                    type: "button",
                    sub_type: "quick_reply",
                    index: 0,
                    parameters: [{ type: "payload", payload: "AGENDAR_PASEO_SI" }]
                },
                {
                    type: "button",
                    sub_type: "quick_reply",
                    index: 1,
                    parameters: [{ type: "payload", payload: "AGENDAR_PASEO_MAS_TARDE" }]
                }
            ]
        }
    };
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Plantilla 'registro_agendar_paseo' enviada:", res.data);
    }
    catch (err) {
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
            name: "agendar_tipo_paseo",
            language: { code: "es" },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: dogName }
                    ]
                },
                {
                    type: "button",
                    sub_type: "quick_reply",
                    index: 0,
                    parameters: [
                        { type: "payload", payload: "FLASH_15_MIN" }
                    ]
                },
                {
                    type: "button",
                    sub_type: "quick_reply",
                    index: 1,
                    parameters: [
                        { type: "payload", payload: "CHILL_30_MIN" }
                    ]
                },
                {
                    type: "button",
                    sub_type: "quick_reply",
                    index: 2,
                    parameters: [
                        { type: "payload", payload: "ADVENTURE_1_HORA" }
                    ]
                }
            ]
        }
    };
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Plantilla 'agendar_tipo_paseo' enviada:", res.data);
    }
    catch (err) {
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
            name: "agendar_fecha_paseo",
            language: { code: "es" },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: dogName }
                    ]
                }
            ]
        }
    };
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Plantilla 'agendar_fecha_paseo' enviada:", res.data);
    }
    catch (err) {
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
            name: "agendar_hora_paseo",
            language: { code: "es" },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: dogName }
                    ]
                }
            ]
        }
    };
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Plantilla 'ragendar_hora_paseo' enviada:", res.data);
    }
    catch (err) {
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
            name: "agendar_metodo_pago",
            language: { code: "es" },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: dogName }
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
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Plantilla 'agendar_metodo_pago' enviada:", res.data);
    }
    catch (err) {
        console.error("❌ Error al enviar plantilla 'agendar_metodo_pago':", err.response?.data || err);
    }
}
export async function TEMPLATE_agendar_resumen_paseo(to, { dogName = 'tu perrito', calle = 'Calle no especificada', colonia = 'Colonia no especificada', fecha = 'Fecha no definida', hora = 'Hora no definida', tipoPaseo = 'Tipo no definido', precio = '$0', metodoPago = 'No definido' }) {
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
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Plantilla 'agendar_resumen_paseo' enviada:", res.data);
    }
    catch (err) {
        console.error("❌ Error al enviar plantilla 'agendar_resumen_paseo':", err.response?.data || err);
    }
}
export async function enviarPlantillaWhatsApp(numeroDestino, plantilla, variables) {
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
    }
    catch (error) {
        console.error("❌ Error al enviar mensaje:", error.response?.data || error.message);
        throw error;
    }
}
export async function TEMPLATE_confirmacion_paseo_cliente(to, { nombreCliente, nombrePerrito, calle, colonia, fecha, hora, duracion, precio, pawwer }) {
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
                        { type: "text", text: colonia },
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
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Plantilla 'confirmacion_paseo_cliente' enviada:", res.data);
    }
    catch (err) {
        console.error("❌ Error al enviar plantilla 'confirmacion_paseo_cliente':", err.response?.data || err);
    }
}
export async function TEMPLATE_recordatorio_paseo_cliente(to, { nombreCliente, nombrePerrito, fecha, hora, calle, colonia, duracion, }) {
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
                        { type: "text", text: colonia },
                        { type: "text", text: duracion },
                    ],
                },
            ],
        },
    };
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("✅ Plantilla 'recordatorio_paseo_cliente' enviada:", res.data);
    }
    catch (err) {
        console.error("❌ Error al enviar plantilla 'recordatorio_paseo_cliente':", err.response?.data || err.message);
    }
}
export async function TEMPLATE_recordatorio_paseo_pawwer(to, { nombrePawwer, nombrePerrito, calle, colonia, fecha, hora, duracion, }) {
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
                        { type: "text", text: colonia },
                        { type: "text", text: fecha },
                        { type: "text", text: hora },
                        { type: "text", text: duracion },
                    ],
                },
            ],
        },
    };
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("✅ Plantilla 'recordatorio_paseo_pawwer' enviada:", res.data);
    }
    catch (err) {
        console.error("❌ Error al enviar plantilla 'recordatorio_paseo_pawwer':", err.response?.data || err.message);
    }
}
export async function TEMPLATE_llegada_pawwer(to, { nombrePawwer, nombrePerrito, }) {
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
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("✅ Plantilla 'llegada_pawwer' enviada:", res.data);
    }
    catch (err) {
        console.error("❌ Error al enviar plantilla 'llegada_pawwer':", err.response?.data || err.message);
    }
}
export async function TEMPLATE_pawwer_llego_cliente(to, { nombreCliente, nombrePawwer, nombrePerrito, calle, colonia, fecha, hora, duracion, }) {
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
    const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    console.log("📩 pawwer_llego_cliente enviada:", res.data);
}
export async function TEMPLATE_strava_recordatorio_pawwer(to, { nombrePawwer, nombrePerrito, }) {
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
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("✅ Plantilla 'strava_recordatorio_pawwer' enviada:", res.data);
    }
    catch (err) {
        console.error("❌ Error al enviar plantilla 'strava_recordatorio_pawwer':", err.response?.data || err.message);
    }
}
export async function TEMPLATE_link_strava_cliente(to, { nombreCliente, nombrePerrito, linkStrava, }) {
    const token = process.env.jwtToken;
    const phone_number_id = process.env.numberId;
    const body = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
            name: "link_strava_cliente",
            language: { code: "es" },
            components: [
                {
                    type: "body",
                    parameters: [
                        { type: "text", text: nombreCliente },
                        { type: "text", text: nombrePerrito },
                        { type: "text", text: linkStrava },
                    ],
                },
            ],
        },
    };
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("✅ Plantilla 'link_strava_cliente' enviada:", res.data);
    }
    catch (err) {
        console.error("❌ Error al enviar plantilla 'link_strava_cliente':", err.response?.data || err.message);
    }
}
export async function TEMPLATE_finalizar_paseo_pawwer(to, { nombrePawwer, nombrePerrito, }) {
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
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("✅ Plantilla 'finalizar_paseo_pawwer' enviada:", res.data);
    }
    catch (err) {
        console.error("❌ Error al enviar plantilla 'finalizar_paseo_pawwer':", err.response?.data || err.message);
    }
}
export async function TEMPLATE_paseo_finalizado_cliente(to, { nombreCliente, nombrePerrito, }) {
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
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("✅ Plantilla 'paseo_finalizado_cliente' enviada:", res.data);
    }
    catch (err) {
        console.error("❌ Error al enviar plantilla 'paseo_finalizado_cliente':", err.response?.data || err.message);
    }
}
export async function TEMPLATE_recordatorio_pago_cliente(to, { nombreCliente, nombrePerrito, valorPaseo, }) {
    const token = process.env.jwtToken;
    const phone_number_id = process.env.numberId;
    const body = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
            name: "recordatorio_pago_cliente",
            language: { code: "es" },
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
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log("✅ Plantilla 'recordatorio_pago_cliente' enviada:", res.data);
    }
    catch (err) {
        console.error("❌ Error al enviar plantilla 'recordatorio_pago_cliente':", err.response?.data || err.message);
    }
}
//# sourceMappingURL=send-template.js.map