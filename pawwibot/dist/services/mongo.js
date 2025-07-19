import { MongoClient, ServerApiVersion } from "mongodb";
const uri = process.env.MONGO_URI || "";
let client = null;
export async function getMongoClient() {
    if (!client) {
        client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
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