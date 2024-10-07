"use strict";

require("express-async-errors");
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
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
  const token = socket.handshake.query.token;

  if (!token) {
    console.error("No token provided.");
    return socket.disconnect();
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_KEY);
    socket.user = decoded;
  } catch (error) {
    console.error("Invalid token:", error);
    return socket.disconnect();
  }

  // console.log(`User Connected: ${socket.id}`);

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
        senderId: socket.user._id,
      });
      await newMessage.save();

      conversation.messages.push(newMessage);
      await conversation.save();

      io.to(room).emit("receive_message", {
        message: newMessage.content,
        room,
      });
      const updatedConversations = await Conversation.find({
        $or: [
          { createdBy: socket.user._id },
          { participantIds: { $in: socket.user._id } },
        ],
      }).populate({ path: "messages", populate: "senderId" });
      io.emit("update_conversations", updatedConversations);
    } catch (err) {
      console.error(err);
      socket.emit("error", "An error occurred");
    }
  });

  socket.on("new_conversation", async (data) => {
    const { name, participantIds } = data;

    if (!name || !participantIds || participantIds.length === 0) {
      socket.emit("error", "Name and participant IDs are required.");
      return;
    }

    const newConversation = new Conversation({
      name,
      createdBy: socket.user._id,
      participantIds,
    });

    try {
      const savedConversation = await newConversation.save();
      socket.emit("conversation_created", savedConversation);

      const updatedConversations = await Conversation.find({
        $or: [
          { createdBy: socket.user._id },
          { participantIds: { $in: socket.user._id } },
        ],
      }).populate({ path: "messages", populate: "senderId" });

      io.emit("update_conversations", updatedConversations);
    } catch (error) {
      console.error("Error creating conversation:", error);
      socket.emit("error", "Failed to create conversation.");
    }
  });

  // After update conversation
  socket.on("update_conversation", async () => {
    const updatedConversations = await Conversation.find({
      $or: [
        { createdBy: socket.user._id },
        { participantIds: { $in: socket.user._id } },
      ],
    }).populate({ path: "messages", populate: "senderId" });
    io.emit("update_conversations", updatedConversations);
  });

  // After delete conversation
  socket.on("delete_conversation", async () => {
    const updatedConversations = await Conversation.find({
      $or: [
        { createdBy: socket.user._id },
        { participantIds: { $in: socket.user._id } },
      ],
    }).populate({ path: "messages", populate: "senderId" });
    io.emit("update_conversations", updatedConversations);
  });
});

// Error Handler Middleware
app.use(require("./src/middlewares/errorHandler"));

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
