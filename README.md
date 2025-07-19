# Pawwi bot

Chatbot de Pawwi para atender clientes

## Requerimientos
* Nodejs v.20 o superior

## Installacion
```bash
npm install
```

## Como correr (local)
1. En Visual Studio, abre el puerto 3000 y hazlo publico, copia el link
2. Corre el bot con el siguiente comando:
```bash
npm run dev
```
3. Ve a meta -> WhatsApp -> Configuration
4. En Callback URL, pega la url del puerto y añadele /webhook
5. En verificacion de token, pega el mismo token que esta en .env
6. Envia un mensaje al bot
