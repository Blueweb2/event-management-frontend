import { io, Socket } from "socket.io-client";

// Extract base URL for Socket.IO from frontend API environment variable
const getSocketUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return apiUrl.replace(/\/api\/?$/, "");
};

// Singleton instance to prevent multiple connections across React renders
let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
  if (typeof window === "undefined") {
    return null;
  }

  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ["websocket", "polling"],
    });
  }

  return socket;
};
  
export default getSocket;
