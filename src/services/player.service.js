import { playerRepo } from "../repositories/player.repo.js";

async function createPlayer() {
  const playerId = await playerRepo.savePlayr();
  return { playerId, chips: 1000 };
}

export const playerService = { createPlayer };
