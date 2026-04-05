const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const outletRoutes = require('./routes/outlets');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const { seedDatabase } = require('./utils/seedData');

dotenv.config();

const app = express();
const server = createServer(app);
const clientOrigin =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.CLIENT_ORIGIN ||
  'http://localhost:3000';
const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusbite')
  .then(async () => {
    console.log('Connected to MongoDB');
    // Seed database if in development
    if (process.env.NODE_ENV === 'development') {
      await seedDatabase();
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/outlets', outletRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
