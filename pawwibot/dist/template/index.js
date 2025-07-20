"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("@builderbot/bot");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mainFlow_1 = require("./mainFlow");
exports.default = (0, bot_1.createFlow)([
    mainFlow_1.init, mainFlow_1.RegistrarNombrePerrito, mainFlow_1.RegistrarRazaPerrito, mainFlow_1.RegistrarEdadPerrito, mainFlow_1.RegistrarConsideracionesPerrito, mainFlow_1.RegistrarVacunasPerrito, mainFlow_1.RegistrarDireccion, mainFlow_1.RegistrarPerro, mainFlow_1.AgendarlistarPerritos, mainFlow_1.agendarTiempoPaseo, mainFlow_1.agendarDiaPaseo, mainFlow_1.agendarHoraPaseo, mainFlow_1.agendarMetodoPaseo, mainFlow_1.agendarResumenPaseo
]);
//# sourceMappingURL=index.js.map