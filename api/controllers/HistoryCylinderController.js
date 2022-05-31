/**
 * OrderGSController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { retry } = require("async");
const moment = require("moment");
const { nanoid } = require("nanoid");
const { obj } = require("pumpify");

module.exports = {
  getHistory: async function (req, res) {
    const cylinder = await CloneCylinder.findOne({
      isDeleted: { "!=": true },
      serial: req.query.serial,
      color: req.query.color,
      manufacture: req.query.manufacture,
      category: req.query.cate,
      valve: req.query.valve,
    });
    console.log(cylinder.id);
    if (!cylinder || cylinder.length <= 0) {
      return res.json({ success: false, message: "Không tìm thấy bình" });
    }
    try {
      let history = await HistoryCylinder.find({
        isDeleted: { "!=": true },
        cylinder: cylinder.id,
        status: req.query.status,
        isDeleted: { "!=": true },
      });
      if (!history || history.length <= 0) {
        return res.json({
          success: false,
          message: "Không tìm thấy lịch sử",
        });
      }
      return res.json({
        success: true,
        data: history,
        message: "Lấy lịch sử thành công",
      });
    } catch (error) {
      return res.json({
        success: false,

        message: "Gặp lỗi khi lấy lịch sử",
      });
    }
  },
  // getFilter
  delete: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty query"));
    }
    if (!req.query.userid) {
      console.log("Empty req.query.userid");
      return res.badRequest(Utils.jsonErr("Empty userid"));
    }
    const { id } = req.query;

    try {
      const deleteOrder = await OrderGS.updateOne({
        isDeleted: { "!=": true },
        id,
      }).set({
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: req.query.userid,
      });

      if (!deleteOrder) {
        return res.json({
          success: false,

          message: "Không tìm thấy đơn để xóa",
        });
      }

      return res.json({ success: true, message: "Xóa thành công." });
    } catch (error) {
      return res.json({
        success: false,

        message: "Gặp lỗi khi xóa đơn",
      });
    }
  },
  update: async function (req, res) {
    if (!req.query) {
      return res.badRequest(Utils.jsonErr("Empty query"));
    }

    const { id } = req.query;

    if (!id) {
      return res.badRequest(Utils.jsonErr("Id is required"));
    }
    // if (!name) {
    //     return res.badRequest(Utils.jsonErr('name is required'));
    // }

    const history = await HistoryCylinder.findOne({
      isDeleted: { "!=": true },
      _id: id,
    });
    if (!history) {
      return res.json({
        status: false,
        resCode: "ERROR-00107",
        data: {},
        message: "Không tìm thấy lịch sử cần cập nhật",
      });
    }
    try {
      dataUpdate = req.body;
      const result = await HistoryCylinder.updateOne({
        isDeleted: { "!=": true },
        _id: id,
      }).set(dataUpdate);

      if (result) {
        return res.json({
          success: true,
          data: result,
          message: "Cập nhật thành công.",
        });
      } else {
        return res.json({ success: false, message: "Cập nhật thất bại." });
      }
    } catch (error) {
      return res.json(error.message);
    }
  },
  create: async function (req, res) {
    //status default is INIT
    try {
      if (
        !req.query.serial ||
        req.query.serial == null ||
        req.query.serial == ""
      ) {
        return res.json({
          success: false,
          message: "Mời nhập serial của bình",
        });
      }
      const cylinder = await CloneCylinder.findOne({
        isDeleted: { "!=": true },
        serial: req.query.serial,
      });
      if (!cylinder || cylinder.length <= 0) {
        return res.json({ success: false, message: "Không tìm thấy bình" });
      }
      if (
        !req.query.orderid ||
        req.query.orderid == null ||
        req.query.orderid == ""
      ) {
        return res.json({
          success: false,
          message: "Mời nhập mã của đơn hàng",
        });
      }
      const order = await OrderGS.findOne({
        isDeleted: { "!=": true },
        id: req.query.orderid,
      });
      if (!order || order.length <= 0) {
        return res.json({ success: false, message: "Không tìm thấy đơn hàng" });
      }
      //================//
      const category = await CategoryCylinder.findOne({
        isDeleted: { "!=": true },
        id: cylinder.category,
      });
      if (!category || category.length <= 0) {
        return res.json({ success: false, message: "Không tìm thấy tên bình" });
      }
      let history = null;
      history = await HistoryCylinder.create({
        cylinder: cylinder.id,
        orderID: order.id,
        status: req.query.status,
        isShipOf: req.query.of,
        name: category.name,
        mass: category.mass,
      }).fetch();
      return res.json({
        success: true,
        data: history,
        message: "Tạo lịch sử thành công",
      });
    } catch (error) {
      // end try
      return res.json({ success: false, message: error.message });
    }
  },
};
