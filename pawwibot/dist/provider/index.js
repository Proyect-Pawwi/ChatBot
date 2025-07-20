"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.provider = void 0;
const provider_meta_1 = require("@builderbot/provider-meta");
const bot_1 = require("@builderbot/bot");
const config_1 = require("../config");
exports.provider = (0, bot_1.createProvider)(provider_meta_1.MetaProvider, {
    jwtToken: config_1.config.jwtToken,
    numberId: config_1.config.numberId,
    verifyToken: config_1.config.verifyToken,
    version: config_1.config.version,
});
//# sourceMappingURL=index.js.map