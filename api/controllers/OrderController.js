const { UserClient } = require("onesignal-node");

module.exports = {
  setOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { orderId, factoryId, numberCylinders, orderDate, createdBy } =
      req.body.createOrder;

    try {
      const checkOrder = await Order.findOne({
        isDeleted: { "!=": true },
        orderId: orderId,
      });

      if (checkOrder) {
        return res.json({ success: false, message: "Trùng mã đơn hàng" });
      }

      const order = await Order.create({
        orderId: orderId,
        factoryId: factoryId,
        numberCylinders: numberCylinders,
        orderDate: orderDate,
        createdBy: createdBy,
        status: "INIT",
      }).fetch();

      if (order) {
        return res.json({
          success: true,
          data: order,
          message: "Ghi đơn hàng thành công",
        });
      } else {
        return res.json({
          success: false,
          data: {},
          message: "Ghi đơn hàng thất bại",
        });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },

  getOrders: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { orderCreatedBy } = req.body;
    console.log("👌 ~ orderCreatedBy", orderCreatedBy);
    try {
      const order = await Order.find({
        isDeleted: { "!=": true },
        createdBy: orderCreatedBy,
      }).populate("factoryId");

      if (order.length > 0) {
        return res.json({
          success: true,
          order: order,
          message: "Lấy thông tin đơn hàng thành công",
        });
      } else {
        return res.json({ success: false, message: "Không có đơn hàng nào" });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },

  getOrdersOfFactory: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { factoryId } = req.body;

    try {
      const orderFactory = await Order.find({
        isDeleted: { "!=": true },
        factoryId: factoryId,
      });

      if (orderFactory.length > 0) {
        return res.json({
          success: true,
          orderFactory: orderFactory,
          message: "Lấy thông tin đơn hàng thành công",
        });
      } else {
        return res.json({ success: false, message: "Không có đơn hàng nào" });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },

  getOrdersRelateToUser: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { userId } = req.body;

    try {
      const order = await Order.find({
        isDeleted: { "!=": true },
        or: [{ createdBy: userId }, { factoryId: userId }],
      }).populate("factoryId");

      if (order.length > 0) {
        return res.json({
          success: true,
          order: order,
          message: "Lấy thông tin đơn hàng thành công",
        });
      } else {
        return res.json({ success: false, message: "Không có đơn hàng nào" });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },

  changeOrderStatus: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { updatedBy, orderStatus, orderId } = req.body.updateOrderStatus;

    try {
      const changeOrderStatus = await Order.updateOne({
        isDeleted: { "!=": true },
        id: orderId,
      }).set({
        updatedBy: updatedBy,
        status: orderStatus,
      });

      if (changeOrderStatus) {
        return res.json({
          success: true,
          changedOrder: changeOrderStatus,
          message: "Thay đổi thông tin trạng thái thành công\n" + orderStatus,
        });
      } else {
        return res.json({ success: false, message: "Lỗi thay đổi trạng thái" });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },
};
