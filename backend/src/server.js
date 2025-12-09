// server.js - Updated with Socket.IO
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import userRoutes from './routes/users.js';
import taskRoutes from './routes/tasks.js';
import teamRoutes from './routes/teams.js';
import path from "path";

dotenv.config();

const app = express();
const server = createServer(app);

const _dirname = path.resolve();

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "https://project-pilot-l9m1.onrender.com",
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins team rooms
  socket.on('join_team', (teamId) => {
    socket.join(`team_${teamId}`);
    console.log(`User ${socket.id} joined team ${teamId}`);
  });

  // Handle team chat messages
  socket.on('send_message', async (data) => {
    try {
      const { teamId, content, userId } = data;
      
      // Broadcast to all users in the team room
      io.to(`team_${teamId}`).emit('new_message', {
        ...data,
        timestamp: new Date().toISOString()
      });

      // You can also save to database here
      console.log('Message received:', data);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    socket.to(`team_${data.teamId}`).emit('user_typing', {
      userId: data.userId,
      userName: data.userName
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(`team_${data.teamId}`).emit('user_stop_typing', {
      userId: data.userId
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from connected users
    for (let [teamId, users] of connectedUsers.entries()) {
      connectedUsers.set(teamId, users.filter(user => user.socketId !== socket.id));
    }
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);

app.use(express.static(path.join(_dirname, "/frontend/project-management/dist")));
app.get(/.*/, (_,res) => {
  res.sendFile(path.resolve(_dirname, "frontend/project-management", "dist", "index.html"));
})

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Project Management API is running!' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };