import express from "express";
import { roundRepo } from "../repositories/round.repo.js";
import { identifyPlayer } from "../middleware.js";
import { roundService } from "../services/round.service.js";

export const router = express.Router();

router.post("/start-round", identifyPlayer, async (req, res) => {
  const playerId = req.player._id;
  const bet = req.body.bet;

  const result = await roundService.startRound(bet, playerId);
  res.status(201).json({ success: true, data: result });
});
