import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// Enviar mensaje de texto simple
export async function sendText(to: string, text: string) {
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

    console.log("✅ Mensaje de texto enviado:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar texto:", err.response?.data || err);
  }
}

export async function sendMedia(to, mediaUrl, caption = "", type = "image") {
  const token = process.env.jwtToken;
  const phone_number_id = process.env.numberId;

  // Validar tipo permitido por la API
  const validTypes = ["image", "video", "audio", "document", "sticker"];
  if (!validTypes.includes(type)) {
    console.warn(`⚠️ Tipo no válido (${type}), se usará 'image' por defecto`);
    type = "image";
  }

  // Cuerpo de la petición
  const body = {
    messaging_product: "whatsapp",
    to,
    type,
    [type]: {
      link: mediaUrl,
      caption: caption || undefined, // solo aplica a image/video/document
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

    console.log(`✅ Media (${type}) enviada correctamente:`, res.data);
  } catch (err) {
    console.error(`❌ Error al enviar media (${type}):`, err.response?.data || err);
  }
}

// Enviar mensaje con botones interactivos
export async function sendButtons(to: string, text: string, buttons: { body: string, payload: string }[]) {
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
    console.log("✅ Mensaje con botones enviado:", res.data);
  } catch (err) {
    console.error("❌ Error al enviar mensaje con botones:", err.response?.data || err);
  }
}