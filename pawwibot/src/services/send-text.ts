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
