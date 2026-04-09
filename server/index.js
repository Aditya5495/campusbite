const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { app, ensureDbConnection } = require('./app');

dotenv.config();

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

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

ensureDbConnection()
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = { app, io };
