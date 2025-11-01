import http from "http";
import { Server, Socket } from "socket.io";
import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      const allowed = new Set(env.clientOrigins);
      const lanViteRegex = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):5173$/;
      if (!origin) return callback(null, true);
      if (allowed.has(origin) || lanViteRegex.test(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
});

type ChatMessagePayload = { room: string; message: unknown };

io.on("connection", (socket: Socket) => {
  socket.on("join", (room: string) => socket.join(room));
  socket.on("message", ({ room, message }: ChatMessagePayload) => {
    io.to(room).emit("message", message);
  });
});

connectDB(env.mongoUri).then(() => {
  server.listen(env.port, () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
});
