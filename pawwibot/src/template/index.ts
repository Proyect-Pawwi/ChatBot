import { createFlow } from "@builderbot/bot";
import dotenv from 'dotenv';
dotenv.config();

import {
    init, RegistrarNombrePerrito, RegistrarRazaPerrito, RegistrarEdadPerrito, RegistrarConsideracionesPerrito, RegistrarVacunasPerrito, RegistrarPerro
} from "./mainFlow";

export default createFlow([
    init, RegistrarNombrePerrito, RegistrarRazaPerrito, RegistrarEdadPerrito, RegistrarConsideracionesPerrito, RegistrarVacunasPerrito, RegistrarPerro
]);
