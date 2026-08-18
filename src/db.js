import { MongoClient } from "mongodb";
import "dotenv/config";

let client, db;

async function getDb() {
  try {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect(process.env.MONGODB_NAME);
    db = client.db();
  } catch (error) {
    console.error(error.message);
  }
  return db;
}
