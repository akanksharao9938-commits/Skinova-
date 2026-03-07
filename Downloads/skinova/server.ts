import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeSkinImage, generateMealPlan } from "./src/services/geminiService.ts";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("skinova.db");

// Check if we need to migrate from the old email-based schema
try {
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasEmail = tableInfo.some((col: any) => col.name === 'email');
  if (hasEmail) {
    console.log("Migrating database: dropping old users table");
    db.exec("DROP TABLE IF EXISTS scans"); // Drop dependent tables too to be safe
    db.exec("DROP TABLE IF EXISTS meal_plans");
    db.exec("DROP TABLE IF EXISTS users");
  }
} catch (e) {
  // Table might not exist yet, which is fine
}

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    gender TEXT,
    age INTEGER,
    diet TEXT,
    lifestyle TEXT,
    skin_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    image_data TEXT,
    diagnosis TEXT,
    risk_score INTEGER,
    recommendations TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS meal_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    day TEXT,
    meals TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // User Routes
  app.post("/api/users", (req, res) => {
    const { name, gender, age, diet, lifestyle, skin_type } = req.body;
    console.log("Creating user:", { name, gender, age });
    try {
      const info = db.prepare("INSERT INTO users (name, gender, age, diet, lifestyle, skin_type) VALUES (?, ?, ?, ?, ?, ?)")
        .run(name, gender, age, diet, lifestyle, skin_type);
      const userId = typeof info.lastInsertRowid === 'bigint' ? Number(info.lastInsertRowid) : info.lastInsertRowid;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      console.log("User created successfully:", user);
      res.json(user);
    } catch (err) {
      console.error("User creation failed:", err);
      res.status(500).json({ error: "Failed to create profile" });
    }
  });

app.post("/api/analyze", async (req, res) => {
  try {
    const { image_data, user_id } = req.body;

    if (!image_data) {
      return res.status(400).json({ error: "No image provided" });
    }

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(user_id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Analyzing image for user:", user_id);

    const result = await analyzeSkinImage(image_data, user);

    res.json(result);

  } catch (error) {
    console.error("Analysis failed:", error);
    res.status(500).json({ 
      error: "Analysis failed", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
  app.get("/api/users/:id", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.get("/api/reports/:scanId", (req, res) => {
    const scan = db.prepare("SELECT * FROM scans WHERE id = ?").get(req.params.scanId);
    if (!scan) return res.status(404).json({ error: "Scan not found" });
    
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(scan.user_id);
    
    res.json({
      report_id: `SKN-${scan.id}`,
      date: scan.created_at,
      patient: {
        age: user.age,
        gender: user.gender,
        skin_type: user.skin_type
      },
      diagnosis: JSON.parse(scan.diagnosis),
      recommendations: JSON.parse(scan.recommendations)
    });
  });



  app.post("/api/scans", (req, res) => {
    const { user_id, image_data, diagnosis, risk_score, recommendations } = req.body;
    const info = db.prepare("INSERT INTO scans (user_id, image_data, diagnosis, risk_score, recommendations) VALUES (?, ?, ?, ?, ?)").run(user_id, image_data, JSON.stringify(diagnosis), risk_score, JSON.stringify(recommendations));
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/scans/:userId", (req, res) => {
    const scans = db.prepare("SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC").all(req.params.userId);
    res.json(scans.map(s => ({ ...s, diagnosis: JSON.parse(s.diagnosis), recommendations: JSON.parse(s.recommendations) })));
  });

  app.post("/api/meal-plan", async (req, res) => {
    const { condition, profile, force } = req.body;
    const userId = Number(profile.id);
    try {
      // Check if we already have a plan for this user
      if (!force) {
        const existing = db.prepare("SELECT * FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1").get(userId);
        if (existing) {
          return res.json(JSON.parse(existing.meals));
        }
      }

      console.log("Generating meal plan for:", condition);
      const plan = await generateMealPlan(condition, profile);
      
      // Save to DB
      db.prepare("INSERT INTO meal_plans (user_id, day, meals) VALUES (?, ?, ?)").run(userId, "7-Day Plan", JSON.stringify(plan));
      
      res.json(plan);
    } catch (err) {
      console.error("Meal plan generation failed:", err);
      res.status(500).json({ error: "Failed to generate meal plan", details: err instanceof Error ? err.message : String(err) });
    }
  });

  app.get("/api/environmental", async (req, res) => {
    // Mock environmental data for the dashboard
    res.json({
      uv_index: 6,
      humidity: 45,
      pollution_level: "Moderate",
      temperature: 22,
      risk_factors: ["High UV exposure", "Low humidity"]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
