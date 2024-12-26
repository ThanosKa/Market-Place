// src/index.ts
import app, { PORT, BASE_URL, API_BASE_URL } from "./server";
import { connectDatabase } from "./config/database";

// Ensure database is connected before starting server
connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`BASE_URL is set to: ${BASE_URL}`);
      console.log(`API_BASE_URL is set to: ${API_BASE_URL}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });
