import { getDb } from "../db.js";
import { Collection, ObjectId } from "mongodb";

async function getCollection() {
  const db = await getDb();
  /** @type {Collection} */
  const collection = db.collection("rounds");
  return collection;
}

async function saveRound(data) {
  const collection = await getCollection();
  const result = await collection.insertOne(data);
  return result.insertedId;
}

async function getActiveRoundByPlayerId(playerId) {
  const collection = await getCollection();
  const result = await collection.findOne({
    playerId: new ObjectId(playerId),
    status: "in_progress",
  });
  return result;
}

async function updateRoundStatus(roundId, status) {
  const collection = await getCollection();
  await collection.updateOne(
    { _id: new ObjectId(roundId) },
    { $set: { status } },
  );
}

async function addCard(roundId, hand, newCard) {
  const collection = await getCollection();
  await collection.updateOne(
    { _id: new ObjectId(roundId) },
    { $push: { [hand]: newCard } },
  );
}

export const roundsRepo = {
  getCollection,
  saveRound,
  getActiveRoundByPlayerId,
  updateRoundStatus,
  addCard,
};
