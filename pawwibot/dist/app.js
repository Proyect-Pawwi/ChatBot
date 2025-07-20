import { createBot } from '@builderbot/bot';
import { MemoryDB as Database } from '@builderbot/bot';
import template from './template';
import { provider } from './provider';
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT ?? 3008;
const main = async () => {
    const { httpServer } = await createBot({
        flow: template,
        provider: provider,
        database: new Database(),
    });
    httpServer(+PORT);
};
console.log("Bot Pawwi iniciado");
main();
//# sourceMappingURL=app.js.map