const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 3000;

let broadcasterId = null;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/broadcast", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "broadcast.html"));
});

app.get("/dashboard", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/analytics-settings", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "analytics-settings.html"));
});

io.on("connection", (socket) => {
  socket.on("broadcaster-ready", () => {
    broadcasterId = socket.id;
    socket.broadcast.emit("broadcaster-online");
  });

  socket.on("viewer-ready", () => {
    if (broadcasterId) {
      io.to(broadcasterId).emit("watcher", socket.id);
    } else {
      socket.emit("broadcaster-offline");
    }
  });

  socket.on("offer", ({ target, sdp }) => {
    io.to(target).emit("offer", { from: socket.id, sdp });
  });

  socket.on("answer", ({ target, sdp }) => {
    io.to(target).emit("answer", { from: socket.id, sdp });
  });

  socket.on("ice-candidate", ({ target, candidate }) => {
    io.to(target).emit("ice-candidate", { from: socket.id, candidate });
  });

  socket.on("disconnect", () => {
    if (socket.id === broadcasterId) {
      broadcasterId = null;
      socket.broadcast.emit("broadcaster-offline");
    } else if (broadcasterId) {
      io.to(broadcasterId).emit("disconnect-peer", socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Live streaming server running on http://localhost:${PORT}`);
});
