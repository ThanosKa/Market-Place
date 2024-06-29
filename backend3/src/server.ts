// src/server.ts
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import { connectDatabase } from "./config/database";

console.log("Server file loaded - Version 2");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());

// Routes
app.use(
  "/api/auth",
  (req, res, next) => {
    console.log("Auth route accessed:", req.method, req.url);
    next();
  },
  authRoutes
);

app.get("/test", (req, res) => {
  console.log("Test route accessed");
  res.json({ message: "Test route working" });
});

// Connect to database and start server
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
