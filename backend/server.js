import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// --- Config ---
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// --- File path setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // ✅ safer than path.resolve()

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Connect to MongoDB ---
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// --- Schema & Model ---
const passwordSchema = new mongoose.Schema({
  site: { type: String, required: [true, "Site URL is required."] },
  username: { type: String, required: [true, "Username is required."] },
  password: { type: String, required: [true, "Password is required."] },
  id: { type: String, required: true, unique: true }
});
const Password = mongoose.model("Password", passwordSchema);

// --- API Routes ---
app.get("/api/passwords", async (req, res) => {
  try {
    const passwords = await Password.find({});
    res.json(passwords);
  } catch (error) {
    res.status(500).json({ message: "Error fetching passwords", error: error.message });
  }
});

app.post("/api/passwords", async (req, res) => {
  if (!req.body || !req.body.id) {
    return res.status(400).json({ message: "Request body is missing or malformed." });
  }
  const password = new Password(req.body);
  try {
    const savedPassword = await password.save();
    res.status(201).json(savedPassword);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate ID", duplicateKey: error.keyValue });
    }
    res.status(500).json({ message: "Error saving password", error: error.message });
  }
});

app.put("/api/passwords", async (req, res) => {
  const { id, site, username, password } = req.body;
  try {
    const updatedPassword = await Password.findOneAndUpdate(
      { id },
      { site, username, password },
      { new: true, runValidators: true }
    );
    if (!updatedPassword) return res.status(404).json({ message: "Password not found" });
    res.json(updatedPassword);
  } catch (error) {
    res.status(500).json({ message: "Error updating password", error: error.message });
  }
});

app.delete("/api/passwords", async (req, res) => {
  try {
    const deletedPassword = await Password.findOneAndDelete({ id: req.body.id });
    if (!deletedPassword) return res.status(404).json({ message: "Password not found" });
    res.json({ message: "Password deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting password", error: error.message });
  }
});

// --- Frontend static serving (after APIs) ---
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// --- Start server ---
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
