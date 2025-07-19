import { provider } from '../provider';
export async function sendAdminNotification(phone, message) {
    try {
        const formattedPhone = `57${phone}`;
        await provider.sendText(formattedPhone, message);
        console.log(`📨 Mensaje enviado al admin: ${formattedPhone}`);
    }
    catch (error) {
        console.error("❌ Error al enviar mensaje al admin:", error);
    }
}
//# sourceMappingURL=messageService.js.map