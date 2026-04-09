const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const outletRoutes = require('./routes/outlets');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const { seedDatabase } = require('./utils/seedData');

let dbConnectPromise;
let didSeedInProcess = false;

async function ensureDbConnection() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!dbConnectPromise) {
    dbConnectPromise = mongoose
      .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusbite')
      .then(async (conn) => {
        if (process.env.NODE_ENV === 'development' && !didSeedInProcess) {
          didSeedInProcess = true;
          await seedDatabase();
        }
        return conn;
      })
      .catch((err) => {
        dbConnectPromise = null;
        throw err;
      });
  }

  return dbConnectPromise;
}

function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/outlets', outletRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/admin', adminRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
  });

  return app;
}

const app = createApp();

module.exports = {
  app,
  createApp,
  ensureDbConnection,
};

