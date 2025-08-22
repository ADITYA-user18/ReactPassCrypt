import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// --- Config ---
dotenv.config();
const app = express();
const port = 3000;

// --- File path setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from dist
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all to serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// --- Middleware ---
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

// --- Routes ---
// GET all passwords
app.get("/", async (req, res) => {
  try {
    const passwords = await Password.find({});
    res.json(passwords);
  } catch (error) {
    res.status(500).json({ message: "Error fetching passwords", error: error.message });
  }
});

// POST a new password
app.post("/", async (req, res) => {
  console.log("POST /: Received request body:", req.body);

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
    console.log("✅ POST /: Saved password successfully:", savedPassword);
    res.status(201).json(savedPassword);
  } catch (error) {
    console.error("❌ POST /: Error saving password:", error);

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
app.put("/", async (req, res) => {
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
app.delete("/", async (req, res) => {
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

// --- Start the server ---
app.listen(port, () => {
  console.log(`🚀 Server listening at http://localhost:${port}`);
});
