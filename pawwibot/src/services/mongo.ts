import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI || "";

let client: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  try {
    if (!client) {
      console.log("🔁 No hay cliente, conectando a MongoDB...");
      client = await createNewClient();
    } else {
      try {
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
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,
    tlsAllowInvalidCertificates: false,
    serverSelectionTimeoutMS: 10000,
  } as any); // 👈 forzamos tipo porque TypeScript a veces se queja con v4

  await newClient.connect();
  console.log("✅ MongoDB conectado");

  return newClient;
}
