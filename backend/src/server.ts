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
import fs from "fs";
import { connectDatabase } from "./config/database";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const BASE_URL = `${process.env.PROTOCOL}://${process.env.SERVER}:${PORT}`;
const API_BASE_URL = `${BASE_URL}/${process.env.API_BASEPATH}`;

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Connect to MongoDB
connectDatabase();

// Use Morgan to log requests in 'dev' format for colored output
app.use(morgan("dev"));

// Routes
app.use(`/${process.env.API_BASEPATH}/auth`, authRoutes);
app.use(`/${process.env.API_BASEPATH}/users`, userRoutes);
app.use(`/${process.env.API_BASEPATH}/products`, productRoutes);
app.use(`/${process.env.API_BASEPATH}/chats`, chatRoutes);
app.use(`/${process.env.API_BASEPATH}/likes`, likeRoutes);
app.use(`/${process.env.API_BASEPATH}/reviews`, reviewRoutes);
app.use(`/${process.env.API_BASEPATH}/recent`, recentSearchRoutes);
app.use(`/${process.env.API_BASEPATH}/activities`, activityRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Route to get a list of uploaded image URLs
app.get(`/${process.env.API_BASEPATH}/uploaded-images`, (req, res) => {
  const uploadsDir = path.join(__dirname, "../uploads");
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Unable to scan directory: " + err });
    }
    const imageFiles = files.filter((file) =>
      [".jpg", ".jpeg", ".png", ".gif"].includes(
        path.extname(file).toLowerCase()
      )
    );
    const imageUrls = imageFiles.map((file) => `${BASE_URL}/uploads/${file}`);
    res.json(imageUrls);
  });
});

// Route to serve a simple image browser
app.get("/image-browser", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Uploaded Images</title>
    </head>
    <body>
      <h1>Uploaded Images</h1>
      <div id="imageContainer"></div>
      <script>
        fetch('${API_BASE_URL}/uploaded-images')
          .then(response => response.json())
          .then(images => {
            const container = document.getElementById('imageContainer');
            images.forEach(image => {
              const img = document.createElement('img');
              img.src = image;
              img.style.width = '200px';
              img.style.margin = '10px';
              container.appendChild(img);
            });
          });
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`BASE_URL is set to: ${BASE_URL}`);
  console.log(`API_BASE_URL is set to: ${API_BASE_URL}`);
});
