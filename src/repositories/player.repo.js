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
  return result.insertedId.toString();
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

export const playerRepo = {
  getCollection,
  savePlayr,
  getPlayerById,
  updatePlayerChips,
};
