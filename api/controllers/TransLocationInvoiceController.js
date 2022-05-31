/**
 * TransLocationInvoiceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const excelToJson = require("convert-excel-to-json");

module.exports = {
  createTransLocationInvoice: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const location = {
        lat: req.body.lat,
        long: req.body.long,
        retimener: req.body.retimener,
        transInvoiceDetailId: req.body.transInvoiceDetailId,
        ordergasId: req.body.ordergasId,
        createdBy: req.body.createdBy ? req.body.createdBy : null,
        updatedBy: req.body.createdBy ? req.body.createdBy : null,
      };

      if (location.createdBy) {
        const checkUserCreate = await Carrier.findOne({
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

      if (!location.ordergasId) {
        return res.json({
          success: false,
          message: "ordergasId is not defined. Please check out again.",
        });
      }

      if (!location.transInvoiceDetailId) {
        return res.json({
          success: false,
          message:
            "transInvoiceDetailId is not defined. Please check out again.",
        });
      }

      if (!location.retimener) {
        return res.json({
          success: false,
          message: "retimener is not defined. Please check out again.",
        });
      }

      if (!location.lat) {
        return res.json({
          success: false,
          message: "lat is not defined. Please check out again.",
        });
      }

      if (!location.long) {
        return res.json({
          success: false,
          message: "long is not defined. Please check out again.",
        });
      }

      const checkTransInvoiceDetail = await TransInvoiceDetail.findOne({
        isDeleted: { "!=": true },
        _id: location.transInvoiceDetailId,
      });

      if (!checkTransInvoiceDetail) {
        return res.json({
          success: false,
          message: "TransInvoiceDetail không tồn tại.",
        });
      }

      const checkOrderGas = await OrderGas.findOne({
        isDeleted: { "!=": true },
        _id: location.ordergasId,
      });

      if (!checkOrderGas) {
        return res.json({
          success: false,
          message: "OrderGas không tồn tại.",
        });
      }

      const newLocation = await TransLocationInvoice.create(location).fetch();

      if (!newLocation || newLocation == "" || newLocation == null) {
        return res.json({
          success: false,
          message: "Lỗi...Không thể tạo mới vị trí.",
        });
      } else {
        return res.json({
          success: true,
          TransLocationInvoice: newLocation,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getLocationBytransInvoiceDetailId: async function (req, res) {
    try {
      const transInvoiceDetailId = req.query.transInvoiceDetailId;

      if (!transInvoiceDetailId) {
        return res.json({
          success: false,
          message:
            "transInvoiceDetailId is not defined. Please check out again.",
        });
      }

      const checkTransLocationInvoice = await TransLocationInvoice.find({
        isDeleted: { "!=": true },
        transInvoiceDetailId: transInvoiceDetailId,
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
        !checkTransLocationInvoice ||
        checkTransLocationInvoice == "" ||
        checkTransLocationInvoice == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy vị trí.",
        });
      } else {
        return res.json({
          success: true,
          TransLocationInvoice: checkTransLocationInvoice,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getLocationByOrderGasId: async function (req, res) {
    try {
      const ordergasId = req.query.ordergasId;

      if (!ordergasId) {
        return res.json({
          success: false,
          message: "ordergasId is not defined. Please check out again.",
        });
      }

      const checkTransLocationInvoice = await TransLocationInvoice.find({
        isDeleted: { "!=": true },
        ordergasId: ordergasId,
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
        !checkTransLocationInvoice ||
        checkTransLocationInvoice == "" ||
        checkTransLocationInvoice == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy vị trí.",
        });
      } else {
        const orderGas = await TransInvoiceDetail.findOne({
          isDeleted: { "!=": true },
          _id: checkTransLocationInvoice[0].transInvoiceDetailId,
          isDeleted: false,
        });
        // .populate('orderGasId');

        const transInvoice = await TransInvoice.findOne({
          isDeleted: { "!=": true },
          _id: orderGas.transInvoiceId,
          isDeleted: false,
        });
        // .populate('carrierId');

        const carrier = await Carrier.findOne({
          isDeleted: { "!=": true },
          _id: transInvoice.carrierId,
          isDeleted: false,
        });

        const locationOrder = await TransLocationInvoice.find({
          isDeleted: { "!=": true },
          _id: checkTransLocationInvoice[0].id,
          isDeleted: false,
        }).populate("ordergasId");

        return res.json({
          success: true,
          TransLocationInvoice: locationOrder,
          Carrier: carrier,
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
