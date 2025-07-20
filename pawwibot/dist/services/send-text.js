"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendText = sendText;
exports.sendButtons = sendButtons;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
        const res = await axios_1.default.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Mensaje de texto enviado:", res.data);
    }
    catch (err) {
        console.error("❌ Error al enviar texto:", err);
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
        const res = await axios_1.default.post(`https://graph.facebook.com/v19.0/${phone_number_id}/messages`, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Mensaje con botones enviado:", res.data);
    }
    catch (err) {
        console.error("❌ Error al enviar mensaje con botones:", err);
    }
}
//# sourceMappingURL=send-text.js.map