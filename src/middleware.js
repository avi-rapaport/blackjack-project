import { playerRepo } from "./repositories/player.repo.js";

export async function identifyPlayer(req, res, next) {
  const playerId = req.headers["x-player-id"];

  const player = await playerRepo.findPlayerById(playerId);
  if (!player) {
    return res.status(401).json({ message: "Player not found!" });
  }
  req.player = player;
  next();
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.status ? err.message : "Internal server error";
  const jsonResponse = { success: false, message: message };
  return res.status(status).json(jsonResponse);
}
