"use strict";

require("express-async-errors");
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const Conversation = require("./src/models/conversation");
const Message = require("./src/models/message");

const { dbConnection } = require("./src/configs/dbConnection");
dbConnection();

app.use(cors());
app.use(express.json());
app.use(require("./src/middlewares/authentication"));
app.use(require("./src/routes"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE", "OPTIONS"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
  });

  socket.on("send_message", async (data) => {
    const { message, room } = data;

    try {
      const conversation = await Conversation.findOne({ name: room });
      if (!conversation) {
        socket.emit("error", "Conversation not found");
        return;
      }

      const newMessage = new Message({
        content: message,
        conversation: conversation._id,
      });
      await newMessage.save();

      conversation.messages.push(newMessage);
      await conversation.save();

      io.to(room).emit("receive_message", {
        message: newMessage.content,
        room,
      });
      const updatedConversations = await Conversation.find().populate(
        "messages"
      );
      io.emit("update_conversations", updatedConversations);
    } catch (err) {
      console.error(err);
      socket.emit("error", "An error occurred");
    }
  });

  socket.on("new_conversation", async () => {
    const updatedConversations = await Conversation.find().populate("messages");
    io.emit("update_conversations", updatedConversations);
  });

  // After update conversation
  socket.on("update_conversation", async () => {
    const updatedConversations = await Conversation.find().populate("messages");
    io.emit("update_conversations", updatedConversations);
  });

  // After delete conversation
  socket.on("delete_conversation", async () => {
    const updatedConversations = await Conversation.find().populate("messages");
    io.emit("update_conversations", updatedConversations);
  });
});

// Error Handler Middleware
app.use(require("./src/middlewares/errorHandler"));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
