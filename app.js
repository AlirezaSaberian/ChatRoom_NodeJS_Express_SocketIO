const http = require("http");

const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Static folder
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Setup websocket
const users = {};

io.on("connection", (socket) => {
  // console.log(`User with ID:${socket.id} connected.`);

  // Listening
  socket.on("login", (data) => {
    console.log(`${data.nickname} Connected.`);
    socket.join(data.roomNumber);
    users[socket.id] = { nickname: data.nickname, roomNumber: data.roomNumber };
    io.sockets.emit("onlineUsers", users);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected.`);
    delete users[socket.id];
    io.sockets.emit("onlineUsers", users);
  });

  socket.on("chatMessage", (data) => {
    io.to(data.roomNumber).emit("chatMessage", data);
  });

  socket.on("typing", (data) => {
    socket.to(data.roomNumber).emit("typing", data);
  });

  socket.on("pvChat", (data) => {
    io.to(data.to).emit("pvChat", data);
  });
});
