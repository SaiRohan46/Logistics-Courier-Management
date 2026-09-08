import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import { seedDatabase } from './data/seed.js';

import authRoutes from './routes/auth.js';
import shipmentRoutes from './routes/shipments.js';
import statsRoutes from './routes/stats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/stats', statsRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), app: 'LogiPulse API Engine' });
});

// Serve frontend static build files in production mode
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Start Server
const startServer = async () => {
  try {
    await initDb();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🚀 LogiPulse Fullstack Server running on port ${PORT}`);
      console.log(`📦 REST API Base: http://localhost:${PORT}/api`);
      console.log(`===================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
