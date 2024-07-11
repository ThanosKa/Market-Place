import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import likeRoutes from "./routes/likeRoutes";
import productRoutes from "./routes/productRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import { connectDatabase } from "./config/database";
import path from "path";
import swaggerUi from "swagger-ui-express";
import specs from "./docs/swaggerConfig";
import morgan from "morgan";
import recentSearchRoutes from "./routes/recentSearchRoutes";
import activityRoutes from "./routes/activityRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Connect to MongoDB
connectDatabase();

// Use Morgan to log requests in 'dev' format for colored output
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/recent", recentSearchRoutes);
app.use("/api/activities", activityRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
