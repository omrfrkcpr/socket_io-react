"use strict";

const Conversation = require("../models/conversation");
const Message = require("../models/message");
const socketAuth = require("./socketAuth");

const socketHandler = (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.user._id}`);

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
          readerIds: [socket.user._id],
        });
        await newMessage.save();

        conversation.messages.push(newMessage);
        await conversation.save();

        io.to(room).emit("receive_message", {
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
  });
};

module.exports = socketHandler;
