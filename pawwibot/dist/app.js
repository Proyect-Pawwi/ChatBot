'use strict';

import { addKeyword, EVENTS } from '@builderbot/bot';
import dotenv from 'dotenv';
import axios from 'axios';
import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';
import console from 'node:console';
import providerMeta from '@builderbot/provider-meta';

dotenv.config();
async function TEMPLATE_bienvenida_pawwi(to, name = "amigo") {
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
async function TEMPLATE_registro_nombre_perrito(to) {
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
async function TEMPLATE_registro_raza_perrito(to, dogName) {
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
async function TEMPLATE_registro_edad_perrito(to, dogName) {
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
async function TEMPLATE_registro_consideraciones_perrito(to, dogName) {
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
async function TEMPLATE_registro_vacunas_perrito(to, dogName) {
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
async function TEMPLATE_registro_agendar_paseo(to, dogName) {
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
async function TEMPLATE_agendar_tipo_paseo(to, dogName = "tu perrito") {
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
async function TEMPLATE_agendar_fecha_paseo(to, dogName = "tu perrito") {
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
async function TEMPLATE_ragendar_hora_paseo(to, dogName = "tu perrito") {
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
async function TEMPLATE_agendar_metodo_pago(to, dogName = "tu perrito") {
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
async function TEMPLATE_agendar_resumen_paseo(to, { dogName = 'tu perrito', calle = 'Calle no especificada', colonia = 'Colonia no especificada', fecha = 'Fecha no definida', hora = 'Hora no definida', tipoPaseo = 'Tipo no definido', precio = '$0', metodoPago = 'No definido' }) {
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
async function TEMPLATE_confirmacion_paseo_cliente(to, { nombreCliente, nombrePerrito, calle, colonia, fecha, hora, duracion, precio, pawwer }) {
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
async function TEMPLATE_recordatorio_paseo_cliente(to, { nombreCliente, nombrePerrito, fecha, hora, calle, colonia, duracion, }) {
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
async function TEMPLATE_recordatorio_paseo_pawwer(to, { nombrePawwer, nombrePerrito, calle, colonia, fecha, hora, duracion, }) {
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
async function TEMPLATE_llegada_pawwer(to, { nombrePawwer, nombrePerrito, }) {
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
async function TEMPLATE_pawwer_llego_cliente(to, { nombreCliente, nombrePawwer, nombrePerrito, calle, colonia, fecha, hora, duracion, }) {
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
async function TEMPLATE_strava_recordatorio_pawwer(to, { nombrePawwer, nombrePerrito, }) {
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
async function TEMPLATE_link_strava_cliente(to, { nombreCliente, nombrePerrito, linkStrava, }) {
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
async function TEMPLATE_finalizar_paseo_pawwer(to, { nombrePawwer, nombrePerrito, }) {
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
async function TEMPLATE_paseo_finalizado_cliente(to, { nombreCliente, nombrePerrito, }) {
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
async function TEMPLATE_recordatorio_pago_cliente(to, { nombreCliente, nombrePerrito, valorPaseo, }) {
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

dotenv.config();
async function sendText(to, text) {
    const token = process.env.jwtToken;
    const phone_number_id = process.env.numberId;
    const body = {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
            body: text
        }
    };
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Mensaje de texto enviado:", res.data);
    }
    catch (err) {
        console.error("❌ Error al enviar texto:", err.response?.data || err);
    }
}
async function sendButtons(to, text, buttons) {
    const token = process.env.jwtToken;
    const phone_number_id = process.env.numberId;
    const body = {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "button",
            body: { text },
            action: {
                buttons: buttons.map((btn, idx) => ({
                    type: "reply",
                    reply: {
                        id: btn.payload || `btn_${idx}`,
                        title: btn.body
                    }
                }))
            }
        }
    };
    try {
        const res = await axios.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Mensaje con botones enviado:", res.data);
    }
    catch (err) {
        console.error("❌ Error al enviar mensaje con botones:", err.response?.data || err);
    }
}

const uri = process.env.MONGO_URI || "";
let client = null;
async function getMongoClient() {
    if (!client) {
        client = new mongodb.MongoClient(uri, {
            serverApi: {
                version: mongodb.ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
        });
        await client.connect();
        console.log("✅ MongoDB conectado");
    }
    return client;
}

const AIRTABLE_BASE$1 = 'https://api.airtable.com/v0/appOceFmbxh8PfLKT/Leads';
const AIRTABLE_TOKEN$2 = process.env.AIRTABLE_TOKEN || process.env.airtableApiKey;
async function createLead(fields) {
    const res = await fetch(AIRTABLE_BASE$1, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN$2}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            records: [{ fields }],
        }),
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Airtable error: ${error}`);
    }
    return res.json();
}
async function getLeads(filterByFormula, maxRecords = 100, view = 'Grid view', offset) {
    const params = new URLSearchParams({
        maxRecords: maxRecords.toString(),
        view,
    });
    params.append('filterByFormula', filterByFormula);
    const url = `${AIRTABLE_BASE$1}?${params.toString()}`;
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN$2}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Airtable error: ${error}`);
    }
    return res.json();
}
async function updateLead(recordId, fields) {
    const res = await fetch(AIRTABLE_BASE$1, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN$2}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            records: [{ id: recordId, fields }],
        }),
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Airtable error: ${error}`);
    }
    return res.json();
}
async function deleteLead(recordId) {
    const url = `${AIRTABLE_BASE$1}/${recordId}`;
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN$2}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Airtable error: ${error}`);
    }
    return res.json();
}

const AIRTABLE_BASE_PASEOS = 'https://api.airtable.com/v0/appOceFmbxh8PfLKT/Control%20de%20paseos';
const AIRTABLE_TOKEN$1 = process.env.AIRTABLE_TOKEN || process.env.airtableApiKey;
async function createPaseo(fields) {
    const res = await fetch(AIRTABLE_BASE_PASEOS, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN$1}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            records: [{ fields }],
        }),
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Airtable error: ${error}`);
    }
    return res.json();
}
async function getPaseos(filterByFormula, maxRecords = 100, view = 'Grid view', offset) {
    const params = new URLSearchParams({
        maxRecords: maxRecords.toString(),
        view,
    });
    if (filterByFormula)
        params.append('filterByFormula', filterByFormula);
    const url = `${AIRTABLE_BASE_PASEOS}?${params.toString()}`;
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN$1}`,
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Airtable error: ${error}`);
    }
    return res.json();
}
async function getPaseoByPawwerTelefonoActive(pawwerTelefono) {
    const formula = `AND(
    SEARCH('${pawwerTelefono}', ARRAYJOIN({Numero de teléfono (from Pawwer)})),
    NOT({Estado} = 'Finalizado'),
    NOT({Estado} = 'Cancelado')
  )`;
    const res = await getPaseos(formula, 1);
    if (res.records.length === 0) {
        console.log("❌ No se encontró un paseo activo para ese Pawwer");
        return null;
    }
    const paseo = res.records[0];
    console.log("✅ Paseo activo encontrado:", paseo.id);
    return paseo;
}
async function updatePaseo(recordId, fields) {
    const res = await fetch(AIRTABLE_BASE_PASEOS, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN$1}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            records: [{ id: recordId, fields }],
        }),
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Airtable error: ${error}`);
    }
    return res.json();
}

const AIRTABLE_BASE = 'https://api.airtable.com/v0/appOceFmbxh8PfLKT/Completados';
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || process.env.airtableApiKey;
async function createCompletado(fields) {
    const res = await fetch(AIRTABLE_BASE, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: [{ fields }] }),
    });
    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Airtable error: ${error}`);
    }
    return res.json();
}

const regex = (text) => {
    if (!text || text.trim() === "")
        return false;
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(text.trim());
};
const perritoData = {};
const usuarioData = {};
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
const insertarPerro = async (celular, perroData) => {
    const client = await getMongoClient();
    const db = client.db("pawwi_bot");
    const usuarios = db.collection("usuarios");
    await usuarios.updateOne({ celular }, { $push: { perros: perroData } });
};
function parseFechaHora(fecha, hora) {
    if (!fecha || typeof fecha !== 'string') {
        console.warn('parseFechaHora: fecha inválida:', fecha);
        return null;
    }
    if (!hora || typeof hora !== 'string') {
        console.warn('parseFechaHora: hora inválida:', hora);
        return null;
    }
    const [dayStr, monthStr] = fecha.split('/');
    if (!dayStr || !monthStr)
        return null;
    const now = new Date();
    const year = now.getFullYear();
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const [hourStr, minStr] = hora.split(':');
    if (!hourStr || !minStr)
        return null;
    const hour = parseInt(hourStr, 10);
    const min = parseInt(minStr, 10);
    return new Date(year, month, day, hour, min, 0);
}
async function checkAndUpdatePaseoEstado(recordFields) {
    const fechaHoraPaseo = parseFechaHora(recordFields.Fecha, recordFields.Hora);
    if (!fechaHoraPaseo)
        return;
    const ahora = new Date();
    const diffMs = fechaHoraPaseo.getTime() - ahora.getTime();
    const diffMinutos = diffMs / 60000;
    if (diffMinutos > 59 && diffMinutos < 61) {
        const filter = `AND({Celular}='${recordFields.Celular}', {Fecha}='${recordFields.Fecha}', {Hora}='${recordFields.Hora}')`;
        const paseosResp = await getPaseos(filter, 1, "Grid view");
        if (paseosResp.records.length === 0) {
            console.warn("No se encontró paseo para actualizar estado 1 hora");
            return;
        }
        const paseoRecord = paseosResp.records[0];
        if (paseoRecord.fields.Estado !== "Por realizarse en 1 hora") {
            await updatePaseo(paseoRecord.id, { Estado: "Por realizarse en 1 hora" });
            console.log(`🕐 Estado actualizado a 'Por realizarse en 1 hora' para paseo ID: ${paseoRecord.id}`);
        }
    }
}
const checkLeadCount = async () => {
    try {
        checkPaseos();
        checkLEADS();
    }
    catch (error) {
        console.error("❌ Error al consultar los leads en Airtable:", error);
    }
};
async function checkPaseos() {
    const paseos = await getPaseos();
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
                }
                else if (paseo.fields.TiempoServicio === "60 minutos") {
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
                }
                else {
                    console.log(`🕒 El paseo está en curso. Faltan ${Math.ceil(tiempoRestanteMs / 60000)} minutos para que termine.`);
                }
                console.log("🗓️ Tiempo del paseo " + paseo.id + ": " + tiempoServicioMinutos + " minutos");
            }
            else {
                const minutos = Math.floor(diferenciaMs / (1000 * 60)) % 60;
                const horas = Math.floor(diferenciaMs / (1000 * 60 * 60));
                console.log(`⏳ Faltan ${horas}h ${minutos}m para el paseo.`);
                const totalMinutos = Math.floor(diferenciaMs / (1000 * 60));
                if (totalMinutos <= 60 && paseo.fields.Estado == "Por realizarse") {
                    try {
                        await updatePaseo(paseo.id, { Estado: "Por realizarse en 1 hora" });
                        console.log(`Cliente ${paseo.fields.Celular}`);
                        console.log(`Pawwer ${paseo.fields['Numero de teléfono (from Pawwer)'][0]}`);
                        await TEMPLATE_recordatorio_paseo_cliente(paseo.fields.Celular, {
                            nombreCliente: paseo.fields["Nombre cliente"] || "Cliente",
                            nombrePerrito: paseo.fields.Perro || "tu perrito",
                            fecha: paseo.fields.Fecha || "No definida",
                            hora: paseo.fields.Hora || "No definida",
                            calle: (paseo.fields.Direccion || "").split(" – ")[0] || "No definida",
                            colonia: (paseo.fields.Direccion || "").split(" – ")[1] || "No definida",
                            duracion: paseo.fields.TiempoServicio || "No definido",
                        });
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
                        }
                        else {
                            console.warn(`⚠️ No se encontró teléfono del Pawwer para paseo ID ${paseo.id}`);
                        }
                    }
                    catch (error) {
                        console.error(`❌ Error al actualizar estado o enviar plantilla llegada_pawwer:`, error);
                    }
                }
            }
        }
        else {
            console.warn(`⚠️ No se pudo interpretar la fecha/hora del paseo.`);
        }
    }
}
async function checkLEADS() {
    const filterFormula = "Estado = 'confirmado'";
    const response = await getLeads(filterFormula, 2, "Grid view");
    console.log(`[LEAD COUNT] Total de leads confirmados (máx 2): ${response.records.length}`);
    for (const record of response.records) {
        const { Fecha, Hora, Pawwer, Celular } = record.fields;
        const errores = [];
        if (!/^\d{1,2}\/\d{1,2}$/.test(Fecha)) {
            errores.push("Formato de fecha inválido (esperado DD/MM)");
        }
        if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(Hora)) {
            errores.push("Formato de hora inválido (esperado HH:mm)");
        }
        if (!Array.isArray(Pawwer) || Pawwer.length === 0) {
            errores.push("No hay Pawwer asignado");
        }
        if (errores.length > 0) {
            console.warn(`⚠️ Registro inválido (ID: ${record.id}) para celular ${Celular}`);
            errores.forEach((e) => console.warn(` - ${e}`));
            try {
                await updateLead(record.id, { Estado: "onChange" });
                console.log(`🔁 Estado actualizado a 'onChange' para ID: ${record.id}`);
                const mensaje = `Hola 👋, tu solicitud presenta errores:\n\n${errores
                    .map((e) => `• ${e}`)
                    .join("\n")}\n\nPor favor revisa la información ingresada.`;
                await sendText("573332885462", mensaje);
                console.log(`📤 Mensaje de error enviado a ${Celular}`);
            }
            catch (updateError) {
                console.error(`❌ Error al actualizar estado o enviar mensaje:`, updateError);
            }
        }
        else {
            console.log(`✅ Registro válido (ID: ${record.id}):`, record.fields);
            try {
                await updateLead(record.id, { Estado: "validando" });
                console.log(`🔄 Estado actualizado a 'validando' para ID: ${record.id}`);
                const nombreCliente = record.fields["Nombre cliente"];
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
                const pawwerNumeros = record.fields['Numero de teléfono (from Pawwer)'];
                const pawwerName = record.fields['Nombre completo (from Pawwer)'] || 'Pawwer';
                const pawwerNumero = Array.isArray(pawwerNumeros) ? pawwerNumeros[0] : null;
                if (pawwerNumero) {
                    const mensajePawwer = `¡Hola ${pawwerName}! 🐾\nTienes una nueva solicitud asignada para el ${Fecha} a las ${Hora}.`;
                    await sendText(pawwerNumero, mensajePawwer);
                    console.log(`📤 Mensaje enviado al Pawwer ${pawwerNumero}`);
                }
                else {
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
            }
            catch (validError) {
                console.error(`❌ Error al validar y notificar registro válido:`, validError);
            }
        }
    }
}
setInterval(checkLeadCount, 5 * 1000);
const init = bot.addKeyword(bot.EVENTS.WELCOME)
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
        }
        else {
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
                const nombreCliente = Array.isArray(fields["Nombre cliente"]) ? fields["Nombre cliente"][0] || "Cliente" : typeof fields["Nombre cliente"] === "string" ? fields["Nombre cliente"] : "Cliente";
                const nombrePawwer = Array.isArray(fields["Nombre completo (from Pawwer)"]) ? fields["Nombre completo (from Pawwer)"][0] || "Pawwer" : typeof fields["Nombre completo (from Pawwer)"] === "string" ? fields["Nombre completo (from Pawwer)"] : "Pawwer";
                const nombrePerrito = fields.Perro || 'tu perrito';
                const calle = fields.Direccion || 'Dirección';
                const colonia = 'Colonia';
                const fecha = fields.Fecha || '';
                const hora = fields.Hora || '';
                const duracion = fields.TiempoServicio || '';
                if (paseo.fields.Estado == "Esperando Pawwer") {
                    if (ctx.payload !== "confirmar_llegada") {
                        await TEMPLATE_llegada_pawwer(paseo.fields["Numero de teléfono (from Pawwer)"][0], { nombrePawwer, nombrePerrito });
                        return endFlow();
                    }
                    node_console.log(`Pawwer ${usuario.nombre} ha confirmado su llegada.`);
                    await updatePaseo(paseoId, { Estado: 'Esperando Strava' });
                    console.log(`✅ Estado del paseo ${paseoId} actualizado a "Esperando Strava"`);
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
                    const regexStrava = /^https:\/\/(www\.)?strava\.com\/activities\/\d+$/;
                    if (!regexStrava.test(linkRecibido)) {
                        await sendText(ctx.from, "Por favor, envía un link válido de Strava que tenga este formato:\nhttps://www.strava.com/activities/123456789");
                        return;
                    }
                    try {
                        await updatePaseo(paseo.id, {
                            Estado: "Esperando finalizacion",
                            "Link Strava": linkRecibido,
                        });
                        await sendText(ctx.from, "¡Gracias! Hemos recibido tu link de Strava y se lo enviaremos al cliente.");
                        const celularCliente = paseo.fields.Celular;
                        const nombrePerrito = paseo.fields.Perro || "tu perrito";
                        await TEMPLATE_link_strava_cliente(celularCliente, {
                            nombreCliente,
                            nombrePerrito,
                            linkStrava: linkRecibido,
                        });
                    }
                    catch (error) {
                        console.error("Error al actualizar paseo con link de Strava:", error);
                        await sendText(ctx.from, "Ocurrió un error al guardar tu link, por favor intenta de nuevo.");
                    }
                }
                else if ("Esperando finalizacion" === paseo.fields.Estado) {
                    await sendText(ctx.from, "Tienes actualmente un paseo en curso. Por favor, si deseas comentar alguna novedad o crees que es un error, contacta al numero de soporte +57 3332885462");
                }
                else if (paseo.fields.Estado === "Esperando finalizacion de Pawwer") {
                    if (ctx.payload !== "Finalizar paseo") {
                        await TEMPLATE_finalizar_paseo_pawwer(ctx.from, {
                            nombrePawwer, nombrePerrito
                        });
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
                            "Nombre pawwer": Array.isArray(paseo.fields["Nombre completo (from Pawwer)"]) ? paseo.fields["Nombre completo (from Pawwer)"][0] : paseo.fields["Nombre completo (from Pawwer)"] || "No definido",
                            "Link Strava": paseo.fields["Link Strava"],
                        });
                        await deleteLead(paseo.id);
                    }
                }
                else {
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
        for (const perro of usuario.perros || []) {
            const perroId = `${ctx.from}_${perro.nombre}`;
            perritoData[perroId] = { ...perro };
        }
    }
    catch (e) {
        console.error("❌ Error al manejar usuario desde Mongo:", e.message);
    }
    await TEMPLATE_bienvenida_pawwi(ctx.from, nombre);
})
    .addAnswer(null, { capture: true }, async (ctx, { endFlow, gotoFlow }) => {
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
        }
        else {
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
});
const RegistrarNombrePerrito = bot.addKeyword('RegistrarNombrePerrito')
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
const RegistrarRazaPerrito = bot.addKeyword('RegistrarRazaPerrito')
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
const RegistrarEdadPerrito = bot.addKeyword('RegistrarEdadPerrito')
    .addAction(async (ctx) => {
    await TEMPLATE_registro_edad_perrito(ctx.from, perritoData[ctx.from]?.nombre || "");
})
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { gotoFlow }) => {
    const edad = ctx.body.trim();
    perritoData[ctx.from].edad = edad;
    return gotoFlow(RegistrarConsideracionesPerrito);
});
const RegistrarConsideracionesPerrito = bot.addKeyword('RegistrarConsideracionesPerrito')
    .addAction(async (ctx) => {
    await TEMPLATE_registro_consideraciones_perrito(ctx.from, perritoData[ctx.from]?.nombre || "");
})
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { gotoFlow }) => {
    const consideraciones = ctx.body.trim();
    perritoData[ctx.from].consideraciones = consideraciones;
    return gotoFlow(RegistrarVacunasPerrito);
});
const RegistrarVacunasPerrito = bot.addKeyword('RegistrarVacunasPerrito')
    .addAction(async (ctx) => {
    await TEMPLATE_registro_vacunas_perrito(ctx.from, perritoData[ctx.from]?.nombre || "");
})
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { gotoFlow }) => {
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
const RegistrarDireccion = bot.addKeyword('RegistrarDireccion')
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
    }
    catch (e) {
        console.error("Error actualizando dirección en Mongo", e?.message || e);
    }
    return gotoFlow(agendarMetodoPaseo);
});
const RegistrarPerro = bot.addKeyword('RegistrarPerro')
    .addAction(async (ctx) => {
    const data = perritoData[ctx.from];
    try {
        await insertarPerro(ctx.from, data);
    }
    catch (e) {
        console.error("❌ Error guardando perro en Mongo:", e.message);
    }
    await TEMPLATE_registro_agendar_paseo(ctx.from, perritoData[ctx.from]?.nombre || "");
})
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { gotoFlow }) => {
    usuarioData[ctx.from].perroSeleccionado = perritoData[ctx.from];
    return gotoFlow(agendarTiempoPaseo);
});
const AgendarlistarPerritos = bot.addKeyword('AgendarlistarPerritos')
    .addAction(async (ctx) => {
    const currentUser = usuarioData[ctx.from];
    if (!currentUser || !currentUser.perros || currentUser.perros.length === 0) {
        await sendText(ctx.from, "No tienes perritos registrados.\n\nSi deseas registrar un nuevo perrito, por favor selecciona la opción correspondiente en el menú principal.");
        return;
    }
    const perrosRegistrados = currentUser.perros;
    const buttons = perrosRegistrados.map(perro => ({
        body: perro.nombre,
        payload: perro.nombre
    }));
    await sendButtons(ctx.from, "¿A quien vamos a pasear hoy?", buttons);
})
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { gotoFlow }) => {
    const selectedDogName = ctx.body;
    const currentUser = usuarioData[ctx.from];
    const perroSeleccionado = currentUser.perros.find((perro) => perro.nombre === selectedDogName);
    if (perroSeleccionado) {
        console.log("------------------------------------");
        console.log("Perro seleccionado por el usuario:");
        console.log("Nombre:", perroSeleccionado.nombre);
        console.log("Raza:", perroSeleccionado.raza);
        console.log("Edad:", perroSeleccionado.edad);
        console.log("Consideraciones:", perroSeleccionado.consideraciones);
        console.log("Vacunas:", perroSeleccionado.vacunas);
        console.log("------------------------------------");
        currentUser.perroSeleccionado = perroSeleccionado;
        usuarioData[ctx.from] = currentUser;
        return gotoFlow(agendarTiempoPaseo);
    }
    else {
        await sendText(ctx.from, `Por favor, selecciona un perrito válido de la lista.`);
        return gotoFlow(AgendarlistarPerritos);
    }
});
const agendarTiempoPaseo = bot.addKeyword('agendarTiempoPaseo')
    .addAction(async (ctx) => {
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
    if (!usuarioData[ctx.from])
        usuarioData[ctx.from] = {};
    usuarioData[ctx.from].agendamientoSeleccionado = agendamiento;
    usuarioData[ctx.from].valor = precio;
    return gotoFlow(agendarDiaPaseo);
});
const agendarDiaPaseo = bot.addKeyword('agendarDiaPaseo')
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
const agendarHoraPaseo = bot.addKeyword('agendarHoraPaseo')
    .addAction(async (ctx) => {
    const nombrePerro = usuarioData[ctx.from]?.perroSeleccionado?.Nombre || "tu peludito";
    await TEMPLATE_ragendar_hora_paseo(ctx.from, nombrePerro);
})
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { gotoFlow }) => {
    var _a;
    const horaSeleccionado = ctx.body.trim();
    usuarioData[_a = ctx.from] ?? (usuarioData[_a] = {});
    usuarioData[ctx.from].horaSeleccionada = horaSeleccionado;
    if (usuarioData[ctx.from].Direccion === undefined || usuarioData[ctx.from].Direccion === "") {
        return gotoFlow(RegistrarDireccion);
    }
    else {
        return gotoFlow(agendarMetodoPaseo);
    }
});
const agendarMetodoPaseo = bot.addKeyword('agendarMetodoPaseo')
    .addAction(async (ctx) => {
    const nombrePerro = usuarioData[ctx.from]?.perroSeleccionado?.Nombre || "tu peludito";
    await TEMPLATE_agendar_metodo_pago(ctx.from, nombrePerro);
})
    .addAnswer('', { capture: true })
    .addAction(async (ctx, { gotoFlow }) => {
    var _a;
    const metodo = ctx.body.trim().toLowerCase();
    usuarioData[_a = ctx.from] ?? (usuarioData[_a] = {});
    usuarioData[ctx.from].metodoPago = metodo;
    return gotoFlow(agendarResumenPaseo);
});
const agendarResumenPaseo = bot.addKeyword('agendarResumenPaseo')
    .addAction(async (ctx) => {
    const data = usuarioData[ctx.from];
    const selectedDog = data.perroSeleccionado;
    await TEMPLATE_agendar_resumen_paseo(ctx.from, {
        dogName: selectedDog?.nombre || 'No definido',
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
            const data = usuarioData[ctx.from];
            const selectedDog = data.perroSeleccionado;
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
Precio: $${data.valor * 0.6 || 0}`);
        }
        catch (e) {
            await sendText(ctx.from, `Ocurrió un error al guardar el agendamiento.`);
            console.error("Error al crear el lead:", e?.message || e);
        }
        return endFlow();
    }
    else if (textoBoton === 'No' || payloadBoton === 'NO') {
        await sendText(ctx.from, `Por favor, vuelve a intentar agendar el paseo.`);
        return gotoFlow(init);
    }
    else {
        await sendText(ctx.from, `Por favor, selecciona una opción válida.`);
        return gotoFlow(agendarResumenPaseo);
    }
});

dotenv.config();
var template = bot.createFlow([
    init, RegistrarNombrePerrito, RegistrarRazaPerrito, RegistrarEdadPerrito, RegistrarConsideracionesPerrito, RegistrarVacunasPerrito, RegistrarDireccion, RegistrarPerro, AgendarlistarPerritos, agendarTiempoPaseo, agendarDiaPaseo, agendarHoraPaseo, agendarMetodoPaseo, agendarResumenPaseo
]);

const config = {
    PORT: process.env.PORT ?? 3008,
    jwtToken: process.env.jwtToken,
    numberId: process.env.numberId,
    verifyToken: process.env.verifyToken,
    version: "v20.0"
};

const provider = bot.createProvider(providerMeta.MetaProvider, {
    jwtToken: config.jwtToken,
    numberId: config.numberId,
    verifyToken: config.verifyToken,
    version: config.version,
});

dotenv.config();
const PORT = process.env.PORT ?? 3008;
const main = async () => {
    const { httpServer } = await bot.createBot({
        flow: template,
        provider: provider,
        database: new bot.MemoryDB(),
    });
    httpServer(+PORT);
};
main();
//# sourceMappingURL=app.js.map
