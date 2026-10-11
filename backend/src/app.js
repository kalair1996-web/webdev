import express from 'express';
import cors from 'cors';
import analyzeRoutes from '../routes/analyze.routes.js';

// The Express app, without any listen call — shared by the dev server and the
// Vercel serverless entry so both serve identical routes.
export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', analyzeRoutes);
  return app;
}
