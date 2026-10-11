import { connectDB } from '../config/db.js';

// Vercel serverless entry. An Express app is a request handler, so it can be
// exported directly as the function — no listen call on the platform.
import { createApp } from '../src/app.js';

const app = createApp();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resume-parser';

// Connect once per warm lambda; mongoose caches the connection, so repeat
// invocations reuse it rather than opening a new one.
let connected = false;
export default async function handler(req, res) {
  if (!connected) {
    try {
      await connectDB(MONGO_URI);
      connected = true;
    } catch (err) {
      console.error('MongoDB connection failed:', err.message);
      return res.status(503).json({ error: 'Database unavailable' });
    }
  }
  return app(req, res);
}
