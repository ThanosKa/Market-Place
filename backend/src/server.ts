import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import likeRoutes from "./routes/likeRoutes";
import productRoutes from "./routes/productRoutes";
import { connectDatabase } from "./config/database";
import path from "path";
import reviewRoutes from "./routes/reviewRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Connect to MongoDB
connectDatabase();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/reviews", reviewRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
