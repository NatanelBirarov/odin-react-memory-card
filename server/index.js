// server/index.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import DatabaseService from "./databaseService.js"; // Import here

const app = express();
const prisma = new PrismaClient();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174", // Backup local port
  process.env.CLIENT_URL, // Production frontend URL
].filter(Boolean); // Filter out any undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Settings Routes
app.get("/api/settings/:userId", async (req, res) => {
  try {
    const settings = await DatabaseService.getSettings(req.params.userId);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/settings/:userId", async (req, res) => {
  try {
    const { musicVolume, sfxVolume } = req.body;
    const settings = await DatabaseService.updateSettings(
      req.params.userId,
      musicVolume,
      sfxVolume
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Game Data Routes
app.get("/api/gamedata/:userId", async (req, res) => {
  try {
    const data = await DatabaseService.getAllGameData(req.params.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gamedata", async (req, res) => {
  try {
    const { userId, setId, completedLevels, levels, highScore, completed } =
      req.body;
    await DatabaseService.upsertGameData(
      {
        id: setId,
        completedLevels,
        levels,
        highScore,
        completed,
      },
      userId
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT, () => console.log("Server running on port 3001"));
