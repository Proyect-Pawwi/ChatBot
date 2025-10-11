import { createFlow } from "@builderbot/bot";
import dotenv from 'dotenv';
dotenv.config();

import {
    init
} from "./mainFlow";

export default createFlow([
    init
]);