import express from "express";
import { roundRepo } from "../repositories/round.repo.js";
import { identifyPlayer } from "../middleware.js";
import { roundService } from "../services/round.service.js";
import { playerRepo } from "../repositories/player.repo.js";

export const router = express.Router();

router.post("/start-round", identifyPlayer, async (req, res) => {
  const playerId = req.player._id;
  const bet = req.body.bet;

  const result = await roundService.startRound(bet, playerId);
  res.status(201).json(result);
});

router.post("/hit", identifyPlayer, async (req, res) => {
  const playerId = req.player._id;

  const result = await roundService.playPlayerTurn(playerId);
  res.json(result);
});

router.post("/stand", identifyPlayer, async (req, res) => {
  const playerId = req.player._id;

  const result = await roundService.playDealerTurn(playerId);
  res.json(result);
});

router.get("/my-round", identifyPlayer, async (req, res) => {
  const playerId = req.player._id;

  const round = await roundRepo.getActiveRoundByPlayerId(playerId);
  const jsonResponse = round
    ? {
        roundId: round._id,
        playerCards: round.playerCards,
        dealerUpCard: round.dealerCards[0],
        bet: round.bet,
        status: round.status,
        remainingChips: req.player.chips,
      }
    : { round: null };
  res.json(jsonResponse);
});
