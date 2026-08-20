import express from "express";
import { playerRepo } from "../repositories/player.repo.js";

export const router = express.Router();

router.post("/start-game", async (req, res) => {
  const playerId = await playerRepo.savePlayer();
  res.status(201).json({ playerId });
});
