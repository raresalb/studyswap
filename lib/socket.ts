/**
 * Socket.io setup for real-time features
 * Usage: attach to a custom Next.js server (server.ts)
 */

import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HTTPServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join user's personal room for notifications
    socket.on("join", (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Handle message sent
    socket.on("send_message", (data: {
      receiverId: string;
      senderId: string;
      content: string;
    }) => {
      // Emit to receiver's room
      io?.to(`user:${data.receiverId}`).emit("new_message", {
        senderId: data.senderId,
        content: data.content,
        createdAt: new Date(),
      });
    });

    // Handle notification
    socket.on("notify", (data: { userId: string; notification: object }) => {
      io?.to(`user:${data.userId}`).emit("notification", data.notification);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

/** Emit a notification to a specific user */
export function emitNotification(userId: string, notification: object) {
  if (io) {
    io.to(`user:${userId}`).emit("notification", notification);
  }
}
