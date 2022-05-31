/**
 * NotificationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  createNotification: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const notification = {
        customerId: req.body.customerId,
        title: req.body.title,
        content: req.body.content,
        code: req.body.code,
      };

      if (!notification.customerId) {
        return res.json({
          success: false,
          message: "customerId không xác định.",
        });
      }

      if (!notification.title) {
        return res.json({
          success: false,
          message: "title không xác định.",
        });
      }

      if (!notification.content) {
        return res.json({
          success: false,
          message: "content không xác định.",
        });
      }

      // if (notification.code) {
      //     const chkCode = await Notification.findOne({isDeleted: {"!=": true},
      //         code: notification.code
      //     });
      //     if (chkCode) {
      //         return res.json({
      //             success: false,
      //             message: 'Mã thông báo bị trùng!'
      //         });
      //     }
      // }

      const checkCustomer = await Customer.findOne({
        isDeleted: { "!=": true },
        _id: notification.customerId,
      });

      if (!checkCustomer) {
        return res.json({
          success: false,
          message: "Khách hàng không tồn tại.",
        });
      }

      const newNotification = await Notification.create(notification).fetch();

      if (
        !newNotification ||
        newNotification == "" ||
        newNotification == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...Không thể tạo thông báo.",
        });
      } else {
        return res.json({
          success: true,
          Notification: newNotification,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getNotificationById: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const notificationId = req.body.notificationId.trim();

      if (!notificationId) {
        return res.json({
          success: false,
          message: "notificationId is not defined. Please check out again.",
        });
      }

      const notification = await Notification.findOne({
        isDeleted: { "!=": true },
        _id: notificationId,
      });

      if (!notification || notification == "" || notification == null) {
        return res.json({
          success: false,
          message: "Thông báo không tồn tại.",
        });
      } else {
        return res.json({
          success: true,
          Notification: notification,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getNotificationOfCustomer: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      // const customerId = req.body.customerId.trim();

      // if (!customerId) {
      //     return res.json({
      //         success: false,
      //         message: 'customerId is not defined. Please check out again.'
      //     });
      // }

      // const checkCustomer = await Customer.findOne({isDeleted: {"!=": true},
      //     _id: customerId
      // });

      // if (!checkCustomer) {
      //     return res.json({
      //         success: false,
      //         message: 'Khách hàng không tồn tại.'
      //     });
      // }

      const notifications = await NotificationGas.find({
        isDeleted: { "!=": true },
        // customerId: customerId
      });

      if (!notifications || notifications == "" || notifications == null) {
        return res.json({
          success: false,
          message: "Thông báo không tồn tại.",
        });
      } else {
        return res.json({
          success: true,
          Notifications: notifications,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
};
