"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAdminNotification = sendAdminNotification;
const provider_1 = require("../provider");
async function sendAdminNotification(phone, message) {
    try {
        const formattedPhone = `57${phone}`;
        await provider_1.provider.sendText(formattedPhone, message);
        console.log(`📨 Mensaje enviado al admin: ${formattedPhone}`);
    }
    catch (error) {
        console.error("❌ Error al enviar mensaje al admin:", error);
    }
}
//# sourceMappingURL=messageService.js.map