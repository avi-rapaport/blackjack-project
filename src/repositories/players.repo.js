import { getDb } from "../db.js";
import { Collection, ObjectId } from "mongodb";

async function getCollection() {
  const db = await getDb();
  /** @type {Collection} */
  const collection = db.collection("players");
  return collection;
}

async function savePlayr(data) {
  const collection = await getCollection();
  const result = await collection.insertOne(data);
  return result.insertedId;
}

async function getPlayerById(id) {
  const collection = await getCollection();
  const result = await collection.findOne({ _id: new ObjectId(id) });
  return result;
}

async function updatePlayerChips(id, bet) {
  const collection = await getCollection();
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $inc: { chips: -bet } },
  );
}

export const playersRepo = {
  getCollection,
  savePlayr,
  getPlayerById,
  updatePlayerChips,
};
