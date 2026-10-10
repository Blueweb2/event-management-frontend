import { io, Socket } from "socket.io-client";
import { getAuthToken, onAuthCleared } from "./auth-storage";

// Extract base URL for Socket.IO from frontend API environment variable
const getSocketUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return apiUrl.replace(/\/api\/?$/, "");
};

// Singleton instance to prevent multiple connections across React renders
let socket: Socket | null = null;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Automatically disconnect active socket when credentials are wiped
if (typeof window !== "undefined") {
  onAuthCleared(() => {
    disconnectSocket();
  });
}

export const getSocket = (): Socket | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const token = getAuthToken();

  if (!socket) {
    socket = io(getSocketUrl(), {
      auth: {
        token: token || "",
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ["websocket", "polling"],
    });

    socket.on("connect_error", (err) => {
      // Disconnect if the backend rejected due to expired/invalid JWT token
      if (err.message && err.message.toLowerCase().includes("authentication failed")) {
        disconnectSocket();
      }
    });
  }

  return socket;
};

export default getSocket;
