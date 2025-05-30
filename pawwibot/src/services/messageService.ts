import { provider } from '../provider';

export async function sendAdminNotification(phone: string, message: string) {
  try {
    const formattedPhone = `57${phone}`;

    await provider.sendText(formattedPhone, message); // ✅ ESTA ES LA CORRECTA

    console.log(`📨 Mensaje enviado al admin: ${formattedPhone}`);
  } catch (error) {
    console.error("❌ Error al enviar mensaje al admin:", error);
  }
}
