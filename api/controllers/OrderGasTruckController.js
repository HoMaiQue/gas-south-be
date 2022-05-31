/**
 * OrderGasTruckController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  createOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const order = {
        orderCode: req.body.orderCode.trim(),
        userId: req.body.userId.trim(),
        deliveryDate: req.body.deliveryDate.trim(),
        note: req.body.note.trim(),
        total: req.body.total,
        status: "INIT",
        createdBy: req.body.createdBy.trim(),
        updatedBy: req.body.createdBy.trim(),
      };

      if (!order.orderCode) {
        return res.json({
          success: false,
          message: "orderCode is not defined. Please check out again.",
        });
      }

      if (!order.userId) {
        return res.json({
          success: false,
          message: "customerId is not defined. Please check out again.",
        });
      }

      if (!order.deliveryDate) {
        return res.json({
          success: false,
          message: "deliveryDate is not defined. Please check out again.",
        });
      }

      if (!order.total || order.total === 0) {
        return res.json({
          success: false,
          message: "total is not defined. Please check out again.",
        });
      }

      if (!order.createdBy) {
        return res.json({
          success: false,
          message: "createdBy is not defined. Please check out again.",
        });
      }

      const checkUser = await User.findOne({
        isDeleted: { "!=": true },
        _id: order.userId,
      });

      if (!checkUser) {
        return res.json({
          success: false,
          message: "User không tồn tại.",
        });
      }

      const checkUserCreate = await User.findOne({
        isDeleted: { "!=": true },
        _id: order.createdBy,
      });

      if (!checkUserCreate) {
        return res.json({
          success: false,
          message: "User Create không tồn tại.",
        });
      }

      const checkOrder = await OrderGasTruck.findOne({
        isDeleted: { "!=": true },
        orderCode: order.orderCode,
      });

      if (checkOrder) {
        return res.json({
          success: false,
          message: "Mã đơn hàng đã tồn tại.",
        });
      }

      const newOrder = await OrderGasTruck.create(order).fetch();

      if (!newOrder || newOrder == "" || newOrder == null) {
        return res.json({
          success: false,
          message: "Lỗi...Tạo đơn hàng không thành công.",
        });
      } else {
        return res.json({
          success: true,
          Order: newOrder,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  changeOrderStatus: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const orderStatus = {
        orderGasId: req.body.orderGasId.trim(),
        status: req.body.status.trim(),
        updatedBy: req.body.updatedBy.trim(),
      };

      if (!orderStatus.orderGasId) {
        return res.json({
          success: false,
          message: "orderId is not defined. Please check out again.",
        });
      }

      if (!orderStatus.status) {
        return res.json({
          success: false,
          message: "orderStatus is not defined. Please check out again.",
        });
      }

      if (!orderStatus.updatedBy) {
        return res.json({
          success: false,
          message: "updatedBy is not defined. Please check out again.",
        });
      }

      const checkOrder = await OrderGasTruck.findOne({
        isDeleted: { "!=": true },
        _id: orderStatus.orderGasId,
      });

      if (!checkOrder) {
        return res.json({
          success: false,
          message: "Đơn hàng không tồn tại.",
        });
      }

      const checkUserUpdate = await User.findOne({
        isDeleted: { "!=": true },
        _id: orderStatus.updatedBy,
      });

      if (!checkUserUpdate) {
        return res.json({
          success: false,
          message: "User Update không tồn tại.",
        });
      }

      const changeOrderStatus = await OrderGasTruck.updateOne({
        isDeleted: { "!=": true },
        _id: orderStatus.orderGasId,
      }).set({
        status: orderStatus.status,
        updatedBy: orderStatus.updatedBy,
      });

      if (
        !changeOrderStatus ||
        changeOrderStatus == "" ||
        changeOrderStatus == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...Không thể thay đổi trạng thái đơn hàng.",
        });
      } else {
        return res.json({
          success: true,
          OrderStatus: changeOrderStatus,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getOrderOfUser: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const user = {
        userId: req.body.userId.trim(),
      };

      if (!user.userId) {
        return res.json({
          success: false,
          message: "userId is not defined. Please check out again.",
        });
      }

      const checkUser = await User.findOne({
        isDeleted: { "!=": true },
        _id: user.userId,
      });

      if (!checkUser) {
        return res.json({
          success: false,
          message: "User không tồn tại.",
        });
      }

      const orders = await OrderGasTruck.find({
        isDeleted: { "!=": true },
        userId: user.userId,
      });

      if (!orders || orders == "" || orders == null) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy đơn hàng.",
        });
      } else {
        return res.json({
          success: true,
          Orders: orders,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getOrderOfUserCreate: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const user = {
        createdBy: req.body.createdBy.trim(),
      };

      if (!user.createdBy) {
        return res.json({
          success: false,
          message: "createdBy is not defined. Please check out again.",
        });
      }

      const checkUser = await User.findOne({
        isDeleted: { "!=": true },
        _id: user.createdBy,
      });

      if (!checkUser) {
        return res.json({
          success: false,
          message: "User Create không tồn tại.",
        });
      }

      const orders = await OrderGasTruck.find({
        isDeleted: { "!=": true },
        createdBy: user.createdBy,
      });

      if (!orders || orders == "" || orders == null) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy đơn hàng.",
        });
      } else {
        return res.json({
          success: true,
          Orders: orders,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  destroyOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const order = {
        orderGasId: req.body.orderGasId,
      };

      if (!order.orderGasId) {
        return res.json({
          success: false,
          message: "orderGasId is not defined. Please check out again.",
        });
      }

      const checkOrder = await OrderGasTruck.findOne({
        isDeleted: { "!=": true },
        _id: order.orderGasId,
      });

      if (!checkOrder) {
        return res.json({
          success: false,
          message: "Đơn hàng không tồn tại.",
        });
      } else {
        if (checkOrder.status != "INIT") {
          return res.json({
            success: false,
            message:
              "Không thể hủy đơn hàng khi trạng thái không phải là INIT.",
          });
        }
      }

      const cancelOrder = await OrderGas.updateOne({
        isDeleted: { "!=": true },
        id: order.orderGasId,
        isDeleted: false,
        status: "INIT",
      }).set({
        status: "CANCELLED",
        isDeleted: true,
        deletedAt: Date.now(),
      });

      if (!cancelOrder) {
        return res.json({
          success: false,
          message: "Lỗi...Hủy đơn hàng không thành công.",
        });
      } else {
        return res.json({
          success: true,
          message: "Đơn hàng đã được hủy thành công.",
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
