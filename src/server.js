import express from "express";
import "dotenv/config";
import cors from "cors";
import { router as playerRouter } from "./routes/player.routes.js";
import { router as roundRouter } from "./routes/round.routes.js";
import { errorHandler } from "./middleware.js";
const PORT = process.env.PORT || 3000;

const server = express();
server.use(express.json());
server.use(cors());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(process.cwd() + "/public"));
server.use(express.static(process.cwd() + "/utils"));

server.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/game.html");
});
server.use("/", playerRouter);
server.use("/", roundRouter);

server.use((req, res) => {
  res.status(404).json(`${req.url} doesn't have ${req.method} method!`);
});

server.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}...`);
});
