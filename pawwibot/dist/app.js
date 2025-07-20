"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("@builderbot/bot");
const bot_2 = require("@builderbot/bot");
const template_1 = __importDefault(require("./template"));
const provider_1 = require("./provider");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT ?? 3008;
const main = async () => {
    const { httpServer } = await (0, bot_1.createBot)({
        flow: template_1.default,
        provider: provider_1.provider,
        database: new bot_2.MemoryDB(),
    });
    httpServer(+PORT);
};
console.log("Bot Pawwi iniciado");
main();
//# sourceMappingURL=app.js.map