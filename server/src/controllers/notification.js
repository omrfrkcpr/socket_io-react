"use strict";

const { getIoInstance } = require("../configs/socketInstance");
const Notification = require("../models/notification");

module.exports = {
  list: async (req, res) => {
    if (!req.user) {
      throw new Error("Unauthorized", 403);
    }

    const notifications = await Notification.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    // console.log(notifications);
    res.status(200).send({
      error: false,
      data: notifications,
    });
  },

  readAll: async (req, res) => {
    if (!req.user) {
      throw new Error("Unauthorized", 403);
    }

    await Notification.updateMany(
      { userId: req.user._id },
      { $set: { isRead: true } }
    );

    res.status(200).send({
      error: false,
      message: "All notifications have been read!",
      data: await Notification.find({
        userId: req.user._id,
      }).sort({ createdAt: -1 }),
    });
  },

  create: async (req, res) => {
    const { content, userId, notificationType } = req.body;
    const notification = new Notification({
      userId,
      notificationType,
      content,
    });
    await notification.save();

    const newNotifications = await Notification.find({
      userId,
    }).sort({ createdAt: -1 });

    const io = getIoInstance();
    io.emit("receive_notifications", newNotifications);

    res.status(201).send({
      error: false,
      message: "Notification created successfully!",
      data: notification,
    });
  },

  update: async (req, res) => {
    if (!req.user) {
      throw new Error("Unauthorized", 403);
    }
    const { content, notificationType } = req.body;
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { content, notificationType },
      { new: true }
    );
    if (!updatedNotification) {
      throw new Error("Notification not found", 404);
    }
    res.status(200).send({
      error: false,
      message: "Notification updated successfully!",
      new: updatedNotification,
    });
  },

  delete: async (req, res) => {
    if (!req.user) {
      throw new Error("Unauthorized", 403);
    }
    const deletedNotification = await Notification.findByIdAndDelete(
      req.params.id
    );
    if (!deletedNotification) {
      throw new Error("Notification not found", 404);
    }
    res.status(200).send({
      error: false,
      message: "Notification deleted successfully!",
      data: deletedNotification,
    });
  },
};
