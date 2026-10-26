import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;

let cachedClient: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export async function getDatabase(): Promise<Db | null> {
  if (!uri) return null;

  try {
    if (!clientPromise) {
      cachedClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 3000,
      });
      clientPromise = cachedClient.connect();
    }
    const client = await clientPromise;
    return client.db("luckhub");
  } catch (err) {
    console.warn("MongoDB connection fallback to memory store:", (err as any)?.message);
    return null;
  }
}
