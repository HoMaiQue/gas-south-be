/**
 * OrderGasDetailSerialController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  createOrderScan: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const order = {
        orderGasDetailId: req.body.orderGasDetailId,
        serial: req.body.serial,
        cylinder: null,
      };

      if (!order.orderGasDetailId) {
        return res.json({
          success: false,
          message: "orderGasDetailId is not defined. Please check out again.",
        });
      }

      if (!order.serial) {
        return res.json({
          success: false,
          message: "serial is not defined. Please check out again.",
        });
      } else {
        const checkSerial = await OrderGasDetailSerial.findOne({
          isDeleted: { "!=": true },
          serial: order.serial,
          isDeleted: false,
        });

        if (checkSerial) {
          return res.json({
            success: false,
            message: "Mã seri bị trùng.",
          });
        }
      }

      const checkOrder = await OrderGasDetail.findOne({
        isDeleted: { "!=": true },
        _id: order.orderGasDetailId,
        // isDeleted: false
      }).populate("cylinder");

      if (!checkOrder || checkOrder == "" || checkOrder == null) {
        return res.json({
          success: false,
          message: "Không tìm thấy đơn hàng.",
        });
      } else {
        const checkCylinder = await Cylinder.findOne({
          isDeleted: { "!=": true },
          serial: order.serial,
          // isDeleted: false
        });

        if (!checkCylinder || checkCylinder == "" || checkCylinder == null) {
          return res.json({
            success: false,
            message: "Không tìm thấy mã bình.",
          });
        } else {
          if (checkCylinder.category !== checkOrder.cylinder.category) {
            return res.json({
              success: false,
              message: "Loại bình không đúng với đơn hàng.",
            });
          } else {
            order.cylinder = checkCylinder.id;

            const productScaned = await OrderGasDetailSerial.create(
              order
            ).fetch();

            const listProductScaned = await OrderGasDetailSerial.find({
              isDeleted: { "!=": true },
              orderGasDetailId: order.orderGasDetailId,
              isDeleted: false,
            });

            return res.json({
              success: true,
              message: "Mã bình đã được quét thành công.",
              ProductScaned: listProductScaned,
            });
          }
        }
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getOrderScanedOfOrderGasDetail: async function (req, res) {
    try {
      const orderGasDetailId = req.query.orderGasDetailId;

      if (!orderGasDetailId) {
        return res.json({
          success: false,
          message: "orderGasDetailId is not defined. Please check out again.",
        });
      }

      const productScaned = await OrderGasDetailSerial.find({
        isDeleted: { "!=": true },
        orderGasDetailId: orderGasDetailId,
        isDeleted: false,
      }).populate("cylinder");

      if (!productScaned || productScaned == "" || productScaned == null) {
        return res.json({
          success: false,
          message: "Không tìm thấy đơn hàng.",
        });
      } else {
        return res.json({
          success: true,
          ProductScaned: productScaned,
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
