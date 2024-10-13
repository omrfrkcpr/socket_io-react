"use strict";

const Conversation = require("../models/conversation");
const Message = require("../models/message");
const socketAuth = require("./socketAuth");

const socketMessage = (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.user._id}`);

    socket.on("join_channel", (channel) => {
      socket.join(channel);
    });

    socket.on("send_message", async (data) => {
      const { message, channel } = data;

      try {
        const conversation = await Conversation.findOne({ name: channel });
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

        io.to(channel).emit("receive_message", {
          channel,
        });

        io.emit("receive_conversations");
      } catch (err) {
        console.error(err);
        socket.emit("error", "An error occurred");
      }
    });
  });
};

module.exports = socketMessage;
