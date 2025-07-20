"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMongoClient = getMongoClient;
const mongodb_1 = require("mongodb");
const uri = process.env.MONGO_URI || "";
let client = null;
async function getMongoClient() {
    if (!client) {
        client = new mongodb_1.MongoClient(uri, {
            serverApi: {
                version: mongodb_1.ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
        });
        await client.connect();
        console.log("✅ MongoDB conectado");
    }
    return client;
}
//# sourceMappingURL=mongo.js.map