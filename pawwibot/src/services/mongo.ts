import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_URI || "";

let client: MongoClient | null = null;

/**
 * Returns a connected MongoClient instance.
 * Automatically reconnects if the client is disconnected or closed.
 */
export async function getMongoClient(): Promise<MongoClient> {
  try {
    const isClientValid =
      client &&
      client.topology &&
      !client.topology.isDestroyed();

    if (!isClientValid) {
      console.log("🔁 Conectando a MongoDB...");

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

    return client!;
  } catch (err) {
    console.error("❌ Error al conectar a MongoDB:", err);
    throw err; // vuelve a lanzar para que la lógica de arriba decida qué hacer
  }
}