import { getDb } from "../db.js";
import { Collection, ObjectId } from "mongodb";

async function getCollection() {
  const db = await getDb();
  /** @type {Collection} */
  const collection = db.collection("players");
  return collection;
}

async function savePlayr() {
  const collection = await getCollection();
  const result = await collection.insertOne({
    chips: 1000,
    createdAt: new Date().toISOString(),
  });
  return { playerId: result.insertedId.toString(), chips: 1000 };
}

async function findPlayerById(id) {
  const collection = await getCollection();
  const result = await collection.findOne({ _id: new ObjectId(id) });
  return result;
}

async function updatePlayerChips(id, amount) {
  const collection = await getCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $inc: { chips: amount } },
    { returnDocument: "after" },
  );
  return result.chips;
}

export const playerRepo = {
  getCollection,
  savePlayr,
  findPlayerById,
  updatePlayerChips,
};
