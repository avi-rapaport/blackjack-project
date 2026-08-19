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
  return result.insertedId.toString();
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

async function addCardToPlayer(roundId, newCard) {
  const collection = await getCollection();
  await collection.updateOne(
    { _id: new ObjectId(roundId) },
    { $push: { playerCards: newCard } },
  );
}

export const roundRepo = {
  getCollection,
  saveRound,
  getActiveRoundByPlayerId,
  updateRoundStatus,
  addCardToPlayer,
};
