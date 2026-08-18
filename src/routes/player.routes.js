import express from "express";
import { playerService } from "../services/player.service.js";

export const router = express.Router();

router.post("/start-game", async (req, res) => {
  const result = await playerService.createPlayer();
  res.status(201).json(result);
});
