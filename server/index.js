// server/index.js
import express from "express";
import cors from "cors";
import DatabaseService from "./src/databaseService.js";
import AuthService from "./src/authService.js";
import cookieParser from "cookie-parser";

const app = express();

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

app.use(cookieParser());

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const decoded = AuthService.verifyToken(token);
  if (!decoded) return res.status(401).json({ error: "Invalid token" });

  req.userId = decoded.userId;
  next();
};

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hash = await AuthService.hashPassword(password);
    const user = await DatabaseService.createUser(username, email, hash);
    const token = AuthService.generateToken(user.id);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ user: { id: user.id, username: user.username, email } });
  } catch (error) {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await DatabaseService.getUserByEmail(email);

    if (
      !user ||
      !(await AuthService.comparePassword(password, user.passwordHash))
    ) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = AuthService.generateToken(user.id);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ user: { id: user.id, username: user.username, email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/username", authMiddleware, async (req, res) => {});

app.post("/api/auth/logout", (_, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

// Settings Routes
app.get("/api/settings/:userId", authMiddleware, async (req, res) => {
  try {
    const settings = await DatabaseService.getOrCreateSettings(
      req.params.userId
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/settings/:userId", authMiddleware, async (req, res) => {
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
app.get("/api/gamedata/:userId", authMiddleware, async (req, res) => {
  try {
    const data = await DatabaseService.getAllGameData(req.params.userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/gamedata", authMiddleware, async (req, res) => {
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
