// src/server.ts
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import chatRoutes from "./routes/chatRoutes";
import likeRoutes from "./routes/likeRoutes";
import productRoutes from "./routes/productRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import path from "path";
import swaggerUi from "swagger-ui-express";
import specs from "./docs/swaggerConfig";
import morgan from "morgan";
import recentSearchRoutes from "./routes/recentSearchRoutes";
import activityRoutes from "./routes/activityRoutes";
import { connectDatabase } from "./config/database";
import cors from "cors";

dotenv.config();

const app = express();
export const PORT = process.env.PORT || 5001;
export const SERVER = process.env.SERVER || "localhost";
export const PROTOCOL = process.env.PROTOCOL || "http";
export const API_BASEPATH = process.env.API_BASEPATH || "api";

export const BASE_URL = `${PROTOCOL}://${SERVER}:${PORT}`;
export const API_BASE_URL = `${BASE_URL}/${API_BASEPATH}`;

app.use(cors());
app.use(express.json());
app.use(
  `/${API_BASEPATH}/uploads`,
  express.static(path.join(__dirname, "../uploads"))
);

// Only connect to database if not in test environment
if (process.env.NODE_ENV !== "test") {
  connectDatabase();
}

app.use(morgan("dev"));

app.use(`/${API_BASEPATH}/auth`, authRoutes);
app.use(`/${API_BASEPATH}/users`, userRoutes);
app.use(`/${API_BASEPATH}/products`, productRoutes);
app.use(`/${API_BASEPATH}/chats`, chatRoutes);
app.use(`/${API_BASEPATH}/likes`, likeRoutes);
app.use(`/${API_BASEPATH}/reviews`, reviewRoutes);
app.use(`/${API_BASEPATH}/recent`, recentSearchRoutes);
app.use(`/${API_BASEPATH}/activities`, activityRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use((req, res, next) => {
  res.locals.BASE_URL = BASE_URL;
  next();
});

export default app;
