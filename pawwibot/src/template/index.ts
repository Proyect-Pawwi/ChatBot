import { createFlow } from "@builderbot/bot";
import dotenv from 'dotenv';
dotenv.config();

import {
    init, RegistrarNombrePerrito, RegistrarRazaPerrito, RegistrarEdadPerrito, RegistrarConsideracionesPerrito, RegistrarVacunasPerrito, RegistrarDireccion, RegistrarPerro, AgendarlistarPerritos, agendarTiempoPaseo, agendarDiaPaseo, agendarHoraPaseo, agendarMetodoPaseo, agendarResumenPaseo
} from "./mainFlow";

export default createFlow([
    init, RegistrarNombrePerrito, RegistrarRazaPerrito, RegistrarEdadPerrito, RegistrarConsideracionesPerrito, RegistrarVacunasPerrito, RegistrarDireccion, RegistrarPerro, AgendarlistarPerritos, agendarTiempoPaseo, agendarDiaPaseo, agendarHoraPaseo, agendarMetodoPaseo, agendarResumenPaseo
]);