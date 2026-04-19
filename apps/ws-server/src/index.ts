import { prisma } from "@repo/prisma";
import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 3002 });

server.on("connection", async (socket) => {
  try {
    const email = `ws-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    const password = Math.random().toString(36).slice(2);

    await prisma.user.create({
      data: {
        email,
        name: "ws-user",
        password,
      },
    });

    socket.send("Hi there, you are connected to the ws server");
  } catch {
    socket.send("connected, but failed to create user");
  }
});

console.log("ws-server listening on 3002");
