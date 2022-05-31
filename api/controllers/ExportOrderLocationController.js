/**
 * ExportOrderLocationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  createExportOrderLocation: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const location = {
        lat: req.body.lat,
        long: req.body.long,
        retimener: req.body.retimener,
        exportOrderDetailID: req.body.exportOrderDetailID,
        orderTankID: req.body.orderTankID,
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

      if (!location.orderTankID) {
        return res.json({
          success: false,
          message: "orderTankID không xác định.",
        });
      }

      if (!location.exportOrderDetailID) {
        return res.json({
          success: false,
          message: "exportOrderDetailID không xác định.",
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

      const checkExportOrderDetail = await ExportOrderDetail.findOne({
        isDeleted: { "!=": true },
        _id: location.exportOrderDetailID,
        isDeleted: false,
      });

      if (!checkExportOrderDetail) {
        return res.json({
          success: false,
          message: "ExportOrderDetail không tồn tại.",
        });
      }

      const checkOrderTank = await OrderTank.findOne({
        isDeleted: { "!=": true },
        _id: location.orderTankID,
        isDeleted: false,
      });

      if (!checkOrderTank) {
        return res.json({
          success: false,
          message: "OrderTank không tồn tại.",
        });
      }

      const newLocation = await ExportOrderLocation.create(location).fetch();

      if (!newLocation || newLocation == "" || newLocation == null) {
        return res.json({
          success: false,
          message: "Lỗi...Không thể tạo mới vị trí.",
        });
      } else {
        return res.json({
          success: true,
          ExportOrderLocation: newLocation,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getLocationByExportOrderDetailID: async function (req, res) {
    try {
      const exportOrderDetailID = req.query.exportOrderDetailID;

      if (!exportOrderDetailID) {
        return res.json({
          success: false,
          message: "exportOrderDetailID không xác định.",
        });
      }

      const checkExportOrderLocation = await ExportOrderLocation.find({
        isDeleted: { "!=": true },
        exportOrderDetailID: exportOrderDetailID,
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
        !checkExportOrderLocation ||
        checkExportOrderLocation == "" ||
        checkExportOrderLocation == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy vị trí.",
        });
      } else {
        return res.json({
          success: true,
          ExportOrderLocation: checkExportOrderLocation,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getLocationByOrderTankID: async function (req, res) {
    try {
      const orderTankID = req.query.orderTankID;

      if (!orderTankID) {
        return res.json({
          success: false,
          message: "orderTankID không xác định.",
        });
      }

      const checkExportOrderLocation = await ExportOrderLocation.find({
        isDeleted: { "!=": true },
        orderTankID: orderTankID,
        isDeleted: false,
      })
        .sort("createdAt DESC")
        .limit(1)
        .populate("orderTankID");

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
        !checkExportOrderLocation ||
        checkExportOrderLocation == "" ||
        checkExportOrderLocation == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy vị trí.",
        });
      } else {
        const _exportOrderDetail = await ExportOrderDetail.findOne({
          isDeleted: { "!=": true },
          _id: checkExportOrderLocation[0].exportOrderDetailID,
          isDeleted: false,
        });
        // .populate('orderGasId');

        if (
          !_exportOrderDetail ||
          _exportOrderDetail == "" ||
          _exportOrderDetail == null
        ) {
          return res.json({
            success: false,
            message: "Không tìm thấy ExportOrderDetail.",
          });
        }

        const _exportOrder = await ExportOrder.findOne({
          isDeleted: { "!=": true },
          _id: _exportOrderDetail.exportOrderId,
          isDeleted: false,
        });
        // .populate('carrierId');

        if (!_exportOrder || _exportOrder == "" || _exportOrder == null) {
          return res.json({
            success: false,
            message: "Không tìm thấy ExportOrder.",
          });
        }

        const driver = await User.findOne({
          isDeleted: { "!=": true },
          _id: _exportOrder.driverId,
          isDeleted: false,
        });

        // const locationOrder = await ExportOrderLocation.find({isDeleted: {"!=": true},
        //     _id: checkExportOrderLocation[0].id,
        //     isDeleted: false
        // })
        // .populate('orderTankID')

        return res.json({
          success: true,
          ExportOrderLocation: checkExportOrderLocation,
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
