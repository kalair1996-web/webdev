import "dotenv/config";
import { connectDB } from "./config/db.js";
import { createApp } from "./src/app.js";

const app = createApp();

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MongoDB URI is missing. Configure MONGODB_URI.");
}

connectDB(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log('Backend listening on http://localhost:${PORT}');
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
