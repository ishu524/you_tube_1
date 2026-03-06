import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // In production, replace with your frontend URL
        methods: ["GET", "POST"]
    }
});

const users = new Map(); // Store user identification and socket IDs

io.on('connection', (socket) => {
    console.log(`[SIGNALING]: User connected: ${socket.id}`);

    // Map user identifier (e.g., database ID) to socket ID
    socket.on('register', (userId) => {
        users.set(userId, socket.id);
        socket.userId = userId;
        console.log(`[SIGNALING]: Registered ${userId} to ${socket.id}`);
    });

    // Initiate Call
    socket.on('call-user', ({ userToCall, signalData, from, fromName }) => {
        const targetSocketId = users.get(userToCall);
        if (targetSocketId) {
            console.log(`[SIGNALING]: Routing call from ${from} to ${userToCall}`);
            io.to(targetSocketId).emit('incoming-call', {
                signal: signalData,
                from,
                fromName
            });
        }
    });

    // Accept Call
    socket.on('accept-call', ({ signal, to }) => {
        const targetSocketId = users.get(to);
        if (targetSocketId) {
            console.log(`[SIGNALING]: Call accepted by ${socket.userId}, sending signal to ${to}`);
            io.to(targetSocketId).emit('call-accepted', signal);
        }
    });

    // Reject Call
    socket.on('reject-call', ({ to }) => {
        const targetSocketId = users.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call-rejected');
        }
    });

    // End Call
    socket.on('end-call', ({ to }) => {
        const targetSocketId = users.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call-ended');
        }
    });

    // ICE Candidate Exchange
    socket.on('ice-candidate', ({ to, candidate }) => {
        const targetSocketId = users.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('ice-candidate', candidate);
        }
    });

    socket.on('disconnect', () => {
        console.log(`[SIGNALING]: User disconnected: ${socket.id}`);
        if (socket.userId) {
            users.delete(socket.userId);
        }
    });
});

const PORT = process.env.SIGNALING_PORT || 5001;
server.listen(PORT, () => {
    console.log(`[SIGNALING]: VoIP Signaling server running on port ${PORT} 🚀`);
});
