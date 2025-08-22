import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// --- Config ---
dotenv.config();
const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port

// --- File path setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
// Apply middleware BEFORE your API routes
app.use(cors());
app.use(express.json());

// --- Connect to MongoDB ---
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// --- Mongoose Schema and Model ---
const passwordSchema = new mongoose.Schema({
  site: { type: String, required: [true, "Site URL is required."] },
  username: { type: String, required: [true, "Username is required."] },
  password: { type: String, required: [true, "Password is required."] },
  id: { type: String, required: true, unique: true }
});

const Password = mongoose.model("Password", passwordSchema);

// --- API Routes ---
// These routes should come before the static file serving and catch-all

// GET all passwords
app.get("/api/passwords", async (req, res) => {
  try {
    const passwords = await Password.find({});
    res.json(passwords);
  } catch (error) {
    res.status(500).json({ message: "Error fetching passwords", error: error.message });
  }
});

// POST a new password
app.post("/api/passwords", async (req, res) => {
  console.log("POST /api/passwords: Received request body:", req.body);

  if (!req.body || !req.body.id) {
    return res.status(400).json({ message: "Request body is missing or malformed." });
  }

  const password = new Password({
    site: req.body.site,
    username: req.body.username,
    password: req.body.password,
    id: req.body.id
  });

  try {
    const savedPassword = await password.save();
    console.log("✅ POST /api/passwords: Saved password successfully:", savedPassword);
    res.status(201).json(savedPassword);
  } catch (error) {
    console.error("❌ POST /api/passwords: Error saving password:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Duplicate key error: A password with this ID already exists.",
        duplicateKey: error.keyValue
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }

    res.status(500).json({ message: "An unexpected internal server error occurred.", error: error.message });
  }
});

// PUT (Update) a password
app.put("/api/passwords", async (req, res) => {
  const { id, site, username, password } = req.body;
  try {
    const updatedPassword = await Password.findOneAndUpdate(
      { id: id },
      { site, username, password },
      { new: true, runValidators: true }
    );
    if (!updatedPassword) {
      return res.status(404).json({ message: "Password not found" });
    }
    res.json(updatedPassword);
  } catch (error) {
    res.status(500).json({ message: "Error updating password", error: error.message });
  }
});

// DELETE a password
app.delete("/api/passwords", async (req, res) => {
  try {
    const deletedPassword = await Password.findOneAndDelete({ id: req.body.id });
    if (!deletedPassword) {
      return res.status(404).json({ message: "Password not found" });
    }
    res.json({ message: "Password deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting password", error: error.message });
  }
});


// --- Frontend Static Serving ---
// This should come AFTER all your API routes

// Serve static files from dist
app.use(express.static(path.join(__dirname, "dist")));

// The "catch-all" handler: for any request that doesn't match one above, send back index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});


// --- Start the server ---
app.listen(port, () => {
  console.log(`🚀 Server listening at http://localhost:${port}`);
});
