import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_URI || "";

let client: MongoClient | null = null;

/**
 * Returns a connected MongoClient instance.
 * If the client is disconnected or unusable, reconnects it.
 */
export async function getMongoClient(): Promise<MongoClient> {
  try {
    if (!client) {
      console.log("🔁 No hay cliente, conectando a MongoDB...");
      client = await createNewClient();
    } else {
      try {
        // Verifica la conexión con un ping
        await client.db("admin").command({ ping: 1 });
      } catch (pingError) {
        console.warn("⚠️ Cliente Mongo no respondió al ping, reconectando...");
        client = await createNewClient();
      }
    }

    return client!;
  } catch (err) {
    console.error("❌ Error al obtener cliente Mongo:", err);
    throw err;
  }
}

async function createNewClient(): Promise<MongoClient> {
  const newClient = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await newClient.connect();
  console.log("✅ MongoDB conectado");

  return newClient;
}