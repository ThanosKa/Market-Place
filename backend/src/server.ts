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

import fs from "fs";

// Route to get a list of uploaded image URLs
app.get("/api/uploaded-images", (req, res) => {
  const uploadsDir = path.join(__dirname, "../uploads/chat");
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
    const imageUrls = imageFiles.map((file) => `/uploads/chat/${file}`);
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
        fetch('/api/uploaded-images')
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
