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
const PORT = process.env.PORT || 5001;
const SERVER = process.env.SERVER || "localhost";
const PROTOCOL = process.env.PROTOCOL || "http";
const API_BASEPATH = process.env.API_BASEPATH || "api";

const BASE_URL = `${PROTOCOL}://${SERVER}:${PORT}`;
export const API_BASE_URL = `${BASE_URL}/${API_BASEPATH}`;

app.use(cors());
app.use(express.json());
app.use(
  `/${API_BASEPATH}/uploads`,
  express.static(path.join(__dirname, "../uploads"))
);

connectDatabase();

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`BASE_URL is set to: ${BASE_URL}`);
  console.log(`API_BASE_URL is set to: ${API_BASE_URL}`);
});

export default app;
