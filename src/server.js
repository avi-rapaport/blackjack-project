import express from "express";
import "dotenv/config";
import cors from "cors";
import { router as playerRouter } from "./routes/player.routes.js";
const PORT = process.env.PORT;

const server = express();
server.use(express.json());
server.use(cors());

server.use("/", playerRouter);

server.use((req, res) => {
  res.status(404).json(`${req.url} doesn't have ${req.method} method!`);
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}...`);
});
