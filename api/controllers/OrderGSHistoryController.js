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
const HistoryCylinder = require("../models/HistoryCylinder");
// const OrderGSConfirmationHistory = require("../models/OrderGSConfirmationHistory");
const orderGSHistory = require("../models/orderGSHistory");
const OrderGSController = require("./OrderGSController");

module.exports = {
  /**
   // "GET /history/getOrderGSConfirmationHistory":
   * lấy  lịch sự duyệt của đơn hàng với id đơn hàng (id)
   * "READ_DELETED", // tìm tất cả Doc đã deleted
   * "READ", // tìm tất cả Doc
   * "UPDATE", // update cho Doc
   * "DELETE", // delete doc vĩnh viễn
   * @query id: id của đơn hàng orderGSId
   * @return data theo hành động
  */
  getOrderGSConfirmationHistory: async function (req, res) {
    console.log(req.body, req.query);
    if (!req.query?.id)
      return res.json({
        success: false,
        message: "Không có id order - vui lòng nhập id order",
      });
    try {
      let order = await OrderGSConfirmationHistory.find({
        isDeleted: { "!=": true },
        // action: req.query.action,
        action: ["TU_CHOI_LAN_1", "TU_CHOI_LAN_2", "GUI_DUYET_LAI"],
        orderGSId: req.query.id,
      }).populate("updatedBy");
      if (!order || order.length <= 0) {
        return res.json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }
      return res.json({
        success: true,
        data: order,
        message: "Lấy đơn hàng theo mã code thành công",
      });
    } catch (error) {
      console.error(error);
      return res.json({
        success: false,
        data: {},
        message: "Gặp lỗi khi lấy đơn hàng",
      });
    }
  },

  /**
   // "POST /history/orderGSConfirmationHistoryRUD":
   * RUD(read, update, delete) lịch sự duyệt của đơn hàng với hành động(action)
   * "READ_DELETED", // tìm tất cả Doc đã deleted
   * "READ", // tìm tất cả Doc
   * "UPDATE", // update cho Doc
   * "DELETE", // delete doc vĩnh viễn
   * @query action hành động của dùng
   * @return data theo hành động
   */
  orderGSConfirmationHistoryRUD: async function (req, res) {
    const action = req.query.action;
    const actionString = [
      "READ_DELETED", // tìm tất cả Doc đã deleted
      "READ", // tìm tất cả Doc
      "UPDATE", // update cho Doc
      "DELETE", // delete doc vĩnh viễn
    ];
    let orders = null;
    const id = req.query.id;
    const bodyUpdate = req.body;

    if (!action || action === "" || !actionString.includes(action)) {
      return res.json({
        success: false,
        message: `Không có Action - vui lòng nhập action: ${actionString}`,
      });
    }

    try {
      switch (action) {
        case "READ":
          orders = await OrderGSConfirmationHistory.find().populate(
            "updatedBy"
          );
          break;
        case "READ_DELETED":
          orders = await OrderGSConfirmationHistory.find({
            isDeleted: true,
          }).populate("updatedBy");
          break;
        case "UPDATE":
          // action  phải co ID va body
          if (action == "UPDATE" && !id && !bodyUpdate === false) {
            return res.json({
              success: false,
              message: `action ${action} phải có id hoặc body - nhập id hoặc body`,
            });
          }
          orders = await OrderGSConfirmationHistory.updateOne({ id }).set(
            bodyUpdate
          );
          break;
        case "DELETE":
          // action  phải co ID
          if (action == "DELETE" && !id) {
            return res.json({
              success: false,
              message: `action ${action} phải có id - nhập id`,
            });
          }
          orders = await OrderGSConfirmationHistory.destroyOne({ id });
          break;
        default:
          console.log("action: ", actionString);
          return res.json({
            success: false,
            message: `Không có Action - vui lòng nhập action`,
          });
      }

      if (!orders || orders.length <= 0) {
        console.info(orders);
        return res.json({
          success: false,
          message: "Không tìm thấy Doc",
        });
      }
      return res.json({
        success: true,
        data: orders,
        message: `${action} thành công`,
      });
    } catch (error) {
      console.error(error);
      return res.json({
        success: false,
        data: {},
        message: "Gặp lỗi khi lấy đơn hàng",
      });
    }
  },

  getOrderByCode: async function (req, res) {
    if (!req.query?.orderCode)
      return res.json({
        success: false,
        message: "Không có code order - vui lòng nhập code order",
      });
    try {
      let order = await OrderGS.find({
        isDeleted: { "!=": true },
        orderCode: req.query.orderCode,
        customers: req.query.objectId,
      })
        .populate("orderDetail")
        .populate("delivery");
      if (!order) {
        return res.json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }
      return res.json({
        success: true,
        data: order,
        message: "Lấy đơn hàng theo mã code thành công",
      });
    } catch (error) {
      return res.json({
        success: false,
        data: {},
        message: "Gặp lỗi khi lấy đơn hàng",
      });
    }
  },
  ShowListShippingHistory: async function (req, res) {
    if (!req.query?.id)
      return res.json({
        success: false,
        message: "Không có code order - vui lòng nhập code order",
      });
    try {
      order = await OrderGSHistory.find({
        isDeleted: { "!=": true },
        orderID: req.query.id,
      })
        .populate("manufacture")
        .populate("categoryCylinder")
        .populate("colorGas")
        .populate("valve")
        .populate("driver")
        .sort("deliveryDate");
      if (!order) {
        return res.json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }
      return res.json({
        success: true,
        data: order,
        message: "Lấy chi tiết giao hàng của đơn hàng theo mã code thành công",
      });
    } catch (error) {
      return res.json({
        success: false,
        data: {},
        message: "Gặp lỗi khi lấy đơn hàng",
      });
    }
  },
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
          data: {},
          message: "Không tìm thấy đơn để xóa",
        });
      }

      return res.json({ success: true, message: "Xóa thành công." });
    } catch (error) {
      return res.json({
        success: false,
        data: {},
        message: "Gặp lỗi khi xóa đơn",
      });
    }
  },

  updateById: async function (req, res) {
    if (!req.query?.id)
      return res.json({
        success: false,
        message: "Không có id order",
      });
    try {
      let orderGS = await OrderGS.findOne({
        isDeleted: { "!=": true },
        id: req.query.id,
      });
      if (!orderGS) {
        return res.json({ success: false, message: "Không tìm thấy đơn hàng" });
      }
      let updateData = req.body;
      let updatedOrderGS = await OrderGS.updateOne({
        isDeleted: { "!=": true },
        _id: req.query.id,
      }).set(updateData);
      if (!updatedOrderGS) {
        return res.json({
          success: false,
          message: "Cập nhật đơn hàng thất bại",
        });
      }
      return res.json({
        success: true,
        data: updatedOrderGS,
        message: "Cập nhật đơn hàng thành công",
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  create: async function (req, res) {
    //status default is INIT
    const {
      deliveryDate,
      deliveryAddress,
      driver,
      transport,
      quantity,
      shippingType,
      cancel,
      mass,
      B6,
      B12,
      B20,
      B45,
    } = req.body;
    if (!req.query.orderID) {
      return res.json({
        success: false,
        message: "Buộc phải nhập mã đơn hàng",
      });
    }
    var checkOrder = OrderGS.findOne({
      _id: req.query.orderID,
    });
    if (!checkOrder || checkOrder.length <= 0) {
      return res.json({
        success: false,
        message: "Không có đơn hàng này",
      });
    }
    if (!req.body.deliveryDate || !req.body.deliveryAddress) {
      return res.json({
        success: false,
        message: "Buộc phải nhập ngày giao và địa chỉ",
      });
    }
    if (!req.body.driver || !req.body.transport) {
      return res.json({
        success: false,
        message: "Buộc phải nhập tài xế hoặc biển số xe",
      });
    }
    if (
      !req.body.manufacture ||
      !req.body.categoryCylinder ||
      !req.body.colorGas ||
      !req.body.valve ||
      !req.body.quantity
    ) {
      return res.json({
        success: false,
        message: "Buộc phải nhập chi tiết loại hàng , số lượng",
      });
    }
    const orderCode = nanoid();

    //================//
    var total6 = await HistoryCylinder.count({
      mass: 6,
      orderID: req.query.orderID,
    });
    var total12 = await HistoryCylinder.count({
      mass: 12,
      orderID: req.query.orderID,
    });
    var total20 = await HistoryCylinder.count({
      mass: 20,
      orderID: req.query.orderID,
    });
    var total45 = await HistoryCylinder.count({
      mass: 45,
      orderID: req.query.orderID,
    });
    var total = total6 + total12 + total20 + total45;
    var totalmass = total6 * 6 + total12 * 12 + total20 * 20 + total45 * 45;
    let order = null;
    try {
      order = await OrderGSHistory.create({
        orderID: req.query.orderID,
        deliveryDate,
        deliveryAddress,
        driver,
        transport,
        quantity: total,
        mass: totalmass,
        shippingType,
        B6: total6,
        B12: total12,
        B20: total20,
        B45: total45,
      }).fetch();
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
    if (!order)
      return res.json({ success: false, message: "Tạo đơn đã giao thất bại" });

    return res.json({
      success: true,
      data: order,
      message: "Tạo đơn giao thành công",
    });
  },
};
