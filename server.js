const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const users = new Map();

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("join_room", (roomId, username) => {
    socket.join(roomId);
    users.set(socket.id, { username, roomId });
    // console.log(`user with id-${socket.id} joined room - ${roomId}`);
    console.log(users);
    io.to(roomId).emit(
      "update users",
      Array.from(users.values())
        .filter((user) => user.roomId === roomId)
        .map((user) => user.username)
    ); //Array.from(users.values())
    // updateRoomUsers(roomId);
  });

  socket.on("send_msg", (data) => {
    console.log(data, "DATA");
    //This will send a message to a specific room ID
    socket.to(data.roomId).emit("receive_msg", data);
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user) {
      const { room } = user;
      users.delete(socket.id);
      updateRoomUsers(room);
    }
    // users.delete(socket.id);
    // io.to(roomId).emit("update users", Array.from(users.values()));
    console.log("A user disconnected:", socket.id);
  });

  function updateRoomUsers(room) {
    const roomUsers = Array.from(users.values())
      .filter((user) => user.room === room)
      .map((user) => user.username);
    io.to(room).emit("update users", roomUsers);
  }
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`);
});
