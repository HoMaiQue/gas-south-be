/**
 * ShippingOrderLocationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

//
module.exports = {
  createShippingOrderLocation: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const location = {
        lat: req.body.lat,
        long: req.body.long,
        retimener: req.body.retimener,
        shippingOrderDetailID: req.body.shippingOrderDetailID,
        orderShippingID: req.body.orderShippingID,
        createdBy: req.body.createdBy ? req.body.createdBy : null,
        updatedBy: req.body.createdBy ? req.body.createdBy : null,
      };

      if (location.createdBy) {
        const checkUserCreate = await User.findOne({
          isDeleted: { "!=": true },
          _id: location.createdBy,
        });

        if (!checkUserCreate) {
          return res.json({
            success: false,
            message: "User Create không tồn tại.",
          });
        }
      }

      if (!location.orderShippingID) {
        return res.json({
          success: false,
          message: "orderShippingID không xác định.",
        });
      }

      if (!location.shippingOrderDetailID) {
        return res.json({
          success: false,
          message: "shippingOrderDetailID không xác định.",
        });
      }

      if (!location.retimener) {
        return res.json({
          success: false,
          message: "retimener không xác định.",
        });
      }

      if (!location.lat) {
        return res.json({
          success: false,
          message: "lat không xác định.",
        });
      }

      if (!location.long) {
        return res.json({
          success: false,
          message: "long không xác định.",
        });
      }

      const checkShippingOrderDetail = await ShippingOrderDetail.findOne({
        isDeleted: { "!=": true },
        _id: location.shippingOrderDetailID,
        isDeleted: false,
      });

      if (!checkShippingOrderDetail) {
        return res.json({
          success: false,
          message: "ShippingOrderDetail không tồn tại.",
        });
      }

      const checkOrderShipping = await OrderShipping.findOne({
        isDeleted: { "!=": true },
        _id: location.orderShippingID,
      });

      if (!checkOrderShipping) {
        return res.json({
          success: false,
          message: "OrderShipping không tồn tại.",
        });
      }

      const newLocation = await ShippingOrderLocation.create(location).fetch();

      if (!newLocation || newLocation == "" || newLocation == null) {
        return res.json({
          success: false,
          message: "Lỗi...Không thể tạo mới vị trí.",
        });
      } else {
        return res.json({
          success: true,
          ShippingOrderLocation: newLocation,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getLocationByShippingOrderDetailID: async function (req, res) {
    try {
      const shippingOrderDetailID = req.query.shippingOrderDetailID;

      if (!shippingOrderDetailID) {
        return res.json({
          success: false,
          message: "shippingOrderDetailID không xác định.",
        });
      }

      const checkShippingOrderLocation = await ShippingOrderLocation.find({
        isDeleted: { "!=": true },
        shippingOrderDetailID: shippingOrderDetailID,
        isDeleted: false,
      })
        .sort("createdAt DESC")
        .limit(1);

      // TransLocationInvoice.TransLocationInvoice.aggregate([
      //     {
      //         $lookup:{
      //             from: "customer",
      //             localField: "customerId",
      //             foreignField: "_id",
      //             as: "customer"
      //         }
      //     }
      // ])

      if (
        !checkShippingOrderLocation ||
        checkShippingOrderLocation == "" ||
        checkShippingOrderLocation == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy vị trí.",
        });
      } else {
        return res.json({
          success: true,
          ShippingOrderLocation: checkShippingOrderLocation,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getLocationByOrderShippingID: async function (req, res) {
    try {
      const orderShippingID = req.query.orderShippingID;

      if (!orderShippingID) {
        return res.json({
          success: false,
          message: "orderShippingID không xác định.",
        });
      }

      const checkShippingOrderLocation = await ShippingOrderLocation.find({
        isDeleted: { "!=": true },
        orderShippingID: orderShippingID,
        isDeleted: false,
      })
        .sort("createdAt DESC")
        .limit(1)
        .populate("orderShippingID");

      // TransLocationInvoice.TransLocationInvoice.aggregate([
      //     {
      //         $lookup:{
      //             from: "customer",
      //             localField: "customerId",
      //             foreignField: "_id",
      //             as: "customer"
      //         }
      //     }
      // ])

      if (
        !checkShippingOrderLocation ||
        checkShippingOrderLocation == "" ||
        checkShippingOrderLocation == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy vị trí.",
        });
      } else {
        const orderShipping = await ShippingOrderDetail.findOne({
          isDeleted: { "!=": true },
          _id: checkShippingOrderLocation[0].shippingOrderDetailID,
          isDeleted: false,
        });
        // .populate('orderGasId');

        const shippingOrder = await ShippingOrder.findOne({
          isDeleted: { "!=": true },
          _id: orderShipping.shippingOrderId,
          isDeleted: false,
        });
        // .populate('carrierId');

        const driver = await User.findOne({
          isDeleted: { "!=": true },
          _id: shippingOrder.driverId,
          isDeleted: false,
        });

        // const locationOrder = await ShippingOrderLocation.find({isDeleted: {"!=": true},
        //     _id: checkShippingOrderLocation[0].id,
        //     isDeleted: false
        // })
        // .populate('orderShippingID')

        return res.json({
          success: true,
          ShippingOrderLocation: checkShippingOrderLocation,
          Carrier: driver,
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
