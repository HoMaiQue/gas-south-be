/**
 * SendNotificationController
 *
 * @description :: Server-side actions for handling incoming requests....
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const OneSignal = require("onesignal-node");
var request = require("request");

module.exports = {
  SendNotification: async function (req, res) {
    try {
      const noti = {
        data: req.body.data,
        title: req.body.title,
        appname: req.body.appname.trim(),
        type: req.body.type,
        iddata: req.body.iddata ? req.body.iddata : "",
        device: "All",
      };

      if (!noti.title) {
        return res.json({
          status: false,
          message: "Title is required",
        });
      }

      if (!noti.data) {
        return res.json({
          status: false,
          message: "Data is required",
        });
      }

      if (!noti.type) {
        return res.json({
          status: false,
          message: "Type is required",
        });
      }

      if (!noti.appname) {
        return res.json({
          status: false,
          message: "Appname is required",
        });
      }

      const checkSystemApp = await SystemApp.findOne({
        isDeleted: { "!=": true },
        appname: noti.appname,
      });

      if (!checkSystemApp || checkSystemApp == "" || checkSystemApp == null) {
        return res.json({
          status: false,
          message: "Lỗi...Không tìm thấy System App.",
        });
      }

      request(
        {
          method: "POST",
          uri: "https://onesignal.com/api/v1/notifications",
          headers: {
            authorization: "Basic " + checkSystemApp.restkey,
            "content-type": "application/json",
          },
          json: true,
          body: {
            app_id: checkSystemApp.appid,
            headings: { en: noti.title },
            contents: { en: noti.data },
            data: { iddata: noti.iddata },
            isIos: true,
            isAndroid: true,
            included_segments: ["All"],
          },
        },
        async function (error, response, body) {
          if (!error) {
            const newnotificationgas = await NotificationGas.create(
              noti
            ).fetch();
            if (
              !newnotificationgas ||
              newnotificationgas == "" ||
              newnotificationgas == null
            ) {
              return res.json({
                status: false,
                message: "Lỗi...Tạo Notification Gas không thành công.",
              });
            } else {
              return res.json({
                status: true,
                message: response.statusCode,
                body: body,
              });
            }
          } else {
            return res.json({
              status: false,
              message: error,
            });
          }
        }
      );
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  SendNotificationForEachDevice: async function (req, res) {
    try {
      const noti = {
        data: req.body.data,
        title: req.body.title,
        device: req.body.device,
        type: "",
        appname: req.body.appname,
        iddata: req.body.iddata ? req.body.iddata : "",
      };

      if (!noti.title) {
        return res.json({
          status: false,
          message: "Title is required",
        });
      }

      if (!noti.data) {
        return res.json({
          status: false,
          message: "Data is required",
        });
      }

      if (!noti.device) {
        return res.json({
          status: false,
          message: "Device is required",
        });
      }

      if (!noti.appname) {
        return res.json({
          status: false,
          message: "Appname is required",
        });
      }

      const checkSystemApp = await SystemApp.findOne({
        isDeleted: { "!=": true },
        appname: noti.appname,
      });

      if (!checkSystemApp || checkSystemApp == "" || checkSystemApp == null) {
        return res.json({
          status: false,
          message: "Lỗi...Không tìm thấy System App.",
        });
      }

      request(
        {
          method: "POST",
          uri: "https://onesignal.com/api/v1/notifications",
          headers: {
            authorization: "Basic " + checkSystemApp.restkey,
            "content-type": "application/json",
          },
          json: true,
          body: {
            app_id: checkSystemApp.appid,
            headings: { en: noti.title },
            contents: { en: noti.data },
            data: { iddata: noti.iddata },
            isIos: true,
            isAndroid: true,
            include_player_ids: [noti.device],
          },
        },
        async function (error, response, body) {
          if (!error) {
            const newnotificationgas = await NotificationGas.create(
              noti
            ).fetch();
            if (
              !newnotificationgas ||
              newnotificationgas == "" ||
              newnotificationgas == null
            ) {
              return res.json({
                status: false,
                message: "Lỗi...Tạo Notification Gas không thành công.",
              });
            } else {
              return res.json({
                status: true,
                message: response.statusCode,
                body: body,
              });
            }
          } else {
            return res.json({
              status: false,
              message: error,
            });
          }
        }
      );
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  // Lấy danh sách thông báo theo loại app
  getNotificationsByAppName: async function (req, res) {
    try {
      const { appname } = req.query;

      if (!appname) {
        return res.json({
          status: false,
          message: "Thiếu thông tin appname.",
        });
      }

      const _notifications = await NotificationGas.find({
        isDeleted: { "!=": true },
        appname: appname,
      });

      if (_notifications.length > 0) {
        return res.json({
          status: true,
          message: "Lấy thông báo thành công.",
          Notifications: _notifications,
        });
      } else {
        return res.json({
          status: true,
          message: "Không có thông báo.",
        });
      }
    } catch (error) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },
};
