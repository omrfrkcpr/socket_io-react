"use strict";

const { getIoInstance } = require("../configs/socketInstance");
const { CustomError } = require("../errors/customError");
const Conversation = require("../models/conversation");
const Message = require("../models/message");

module.exports = {
  list: async (req, res) => {
    if (!req.user) {
      throw new CustomError("Unauthorized", 401);
    }

    // Populate the conversation to get the messages and sender information
    const conversations = await Conversation.find({
      $or: [{ createdBy: req.user._id }, { participantIds: req.user._id }],
    }).populate({ path: "messages", populate: "senderId" });

    res.send({ error: false, data: conversations });
  },

  create: async (req, res) => {
    const { name, participantIds } = req.body;

    if (!name || !participantIds || !participantIds.length) {
      throw new CustomError("Name and participant IDs are required.", 400);
    }

    // Create the conversation
    const newConversation = await Conversation.create({
      name,
      createdBy: req.user._id,
      participantIds,
    });

    const io = getIoInstance();
    // console.log(io);

    io.emit("receive_conversations");

    res.status(201).send({ error: false, data: newConversation });
  },

  read: async (req, res) => {
    const conversation = await Conversation.findOne({
      name: req.params.name,
      $or: [{ createdBy: req.user._id }, { participantIds: req.user._id }],
    });

    if (!conversation) throw new CustomError("Conversation not found", 404);

    await Message.updateMany(
      {
        conversation: conversation._id,
        senderId: { $ne: req.user._id },
      },
      { $addToSet: { readerIds: req.user._id } }
    );

    const updatedConversation = await Conversation.findOne({
      _id: conversation._id,
    }).populate({ path: "messages", populate: "senderId" });

    res.send({ error: false, data: updatedConversation });
  },

  update: async (req, res) => {
    const { name } = req.body;

    const conversation = await Conversation.findOneAndUpdate(
      {
        name: req.params.name,
        $or: [{ createdBy: req.user._id }, { participantIds: req.user._id }],
      },
      { name }
    ).populate({ path: "messages", populate: "senderId" });

    if (!conversation) throw new CustomError("Conversation not found", 404);

    const io = getIoInstance();
    io.emit("receive_conversations");

    res.send({ error: false, new: conversation });
  },
  delete: async (req, res) => {
    const conversation = await Conversation.findOne({
      name: req.params.name,
    });
    if (!conversation) {
      throw new CustomError("Conversation not found", 404);
    }

    await Message.deleteMany({ conversation: conversation._id });
    await Conversation.deleteOne({ name: req.params.name });

    const io = getIoInstance();
    io.emit("receive_conversations");

    res.status(204).send();
  },
};
