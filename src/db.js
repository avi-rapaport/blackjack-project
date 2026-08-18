import { MongoClient } from "mongodb";
import "dotenv/config";

let client, db;

export async function getDb() {
  try {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    db = client.db(process.env.MONGODB_NAME);
    console.log("Client connect to mongo...");
  } catch (error) {
    console.error(error.message);
  }
  return db;
}
