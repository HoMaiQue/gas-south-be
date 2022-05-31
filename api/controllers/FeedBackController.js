/**
 * FeedBackController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const nodemailer = require("nodemailer");
const validator = require("validator");

module.exports = {
  SendFeedback: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const feedback = {
        title: req.body.title.trim(),
        content: req.body.content.trim(),
        email: req.body.email ? req.body.email : "",
        sender: req.body.sender,
        createdBy: req.body.createdBy ? req.body.createdBy : null,
        updatedBy: req.body.createdBy ? req.body.createdBy : null,
      };

      if (!feedback.title) {
        return res.json({
          status: false,
          message: "Title is required",
        });
      }

      if (!feedback.content) {
        return res.json({
          status: false,
          message: "Content is required",
        });
      }

      if (!feedback.sender) {
        return res.json({
          status: false,
          message: "Sender is not defined.",
        });
      }

      if (feedback.email) {
        if (!validator.isEmail(feedback.email)) {
          return res.json({
            status: false,
            message: "Email khong dung",
          });
        }
      }

      if (feedback.createdBy) {
        const checkFeedBackCreate = await Customer.findOne({
          isDeleted: { "!=": true },
          _id: feedback.createdBy,
        });

        if (!checkFeedBackCreate) {
          return res.json({
            status: false,
            message: "Customer Create không tồn tại.",
          });
        }
      }

      const checkSender = await Customer.findOne({
        isDeleted: { "!=": true },
        _id: feedback.sender,
      });

      if (!checkSender) {
        return res.json({
          status: false,
          message: "Không tìm thấy id của Sender.",
        });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "nduongbaphu99@gmail.com",
          pass: "baphu123",
        },
      });

      const options = {
        from: "nduongbaphu99@gmail.com",
        to: "nduongbaphu99@gmail.com",
        subject: feedback.title,
        text:
          feedback.email == ""
            ? feedback.content
            : feedback.email +
              " đã gửi phản hồi với nội dung: " +
              feedback.content,
      };

      const newFeedback = await FeedBack.create(feedback).fetch();

      if (!newFeedback || newFeedback == "" || newFeedback == null) {
        return res.json({
          status: false,
          message: "Lỗi...Tạo Feedback không thành công.",
        });
      } else {
        await transporter.sendMail(options, function (error, info) {
          if (error) {
            return res.json({
              status: false,
              message: error,
            });
          }
        });
        return res.json({
          status: true,
          sendemail: true,
          FeedBack: feedback,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  getAllFeedBack: async function (req, res) {
    try {
      const _feedBack = await FeedBack.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      });

      if (_feedBack.length > 0) {
        return res.json({
          status: true,
          message: "Lấy phản hồi thành công.",
          FeedBack: _feedBack,
        });
      } else {
        return res.json({
          status: true,
          message: "Không có phản hồi nào.",
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
