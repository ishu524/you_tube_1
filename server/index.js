import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import paymentroutes from "./routes/payment.js";
import downloadroutes from "./routes/download.js";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";



const app = express();

app.use(cors());

// STRIPE WEBHOOK: Must handle raw body for signature verification
app.use((req, res, next) => {
    if (req.originalUrl === "/api/payment/webhook") {
        next(); // Handled by express.raw() in routes
    } else {
        // Standard JSON body parsing for all other routes
        express.json({ limit: "30mb" })(req, res, next);
    }
});

// app.use(bodyParser.json()); // REDUNDANT: express.json already handles this. Removed to avoid conflicts.
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.get("/", (req, res) => {
    res.send("You tube backend is working");
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/uploads", express.static(uploadDir));

app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyroutes);
app.use("/comment", commentroutes)
app.use("/api/payment", paymentroutes);
app.use("/download", downloadroutes);


const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const socketUsers = new Map();

io.on('connection', (socket) => {
    socket.on('register', (userId) => {
        socketUsers.set(userId, socket.id);
        socket.userId = userId;
    });

    socket.on('call-user', ({ userToCall, signalData, from, fromName }) => {
        const targetSocketId = socketUsers.get(userToCall);
        if (targetSocketId) {
            io.to(targetSocketId).emit('incoming-call', { signal: signalData, from, fromName });
        }
    });

    socket.on('accept-call', ({ signal, to }) => {
        const targetSocketId = socketUsers.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call-accepted', signal);
        }
    });

    socket.on('reject-call', ({ to }) => {
        const targetSocketId = socketUsers.get(to);
        if (targetSocketId) io.to(targetSocketId).emit('call-rejected');
    });

    socket.on('end-call', ({ to }) => {
        const targetSocketId = socketUsers.get(to);
        if (targetSocketId) io.to(targetSocketId).emit('call-ended');
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
        const targetSocketId = socketUsers.get(to);
        if (targetSocketId) io.to(targetSocketId).emit('ice-candidate', candidate);
    });

    socket.on('disconnect', () => {
        if (socket.userId) socketUsers.delete(socket.userId);
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server and Signaling running on port ${PORT} 🚀`);
});

const DBURL = process.env.DB_URL;

mongoose
    .connect(DBURL)
    .then(() => {
        console.log("✅ Mongodb connected successfully");
        console.log(`📡 Backend URL: http://localhost:${PORT}`);
        console.log(`🌐 Configured Frontend URL: ${process.env.FRONTEND_URL}`);
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("⚠️  WARNING: EMAIL_USER or EMAIL_PASS not set! OTP emails will fail.");
        }
    })
    .catch((error) => {
        console.error("❌ Mongodb connection error:", error);
    });


console.log("Server setup complete, ready for connections. (Restart)");

