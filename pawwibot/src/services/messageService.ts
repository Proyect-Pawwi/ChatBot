import { provider } from '../provider';

export async function sendAdminNotification(phone: string, message: string) {
  try {
    const formattedPhone = `57${phone}`; // Asegúrate de incluir código de país

    await provider.sendMessage(formattedPhone, message); // Solo string aquí

    console.log(`📨 Mensaje enviado al admin: ${formattedPhone}`);
  } catch (error) {
    console.error("❌ Error al enviar mensaje al admin:", error);
  }
}
