/**
 * WareHousePlanController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  createWareHousePlan: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const warehouseplan = {
        warehouseId: req.body.warehouseId,
        month: req.body.month,
        year: req.body.year,
        quantity: req.body.quantity,
        note: req.body.note,
        createdBy: req.body.createdBy ? req.body.createdBy : null,
        updatedBy: req.body.createdBy ? req.body.createdBy : null,
      };

      if (!warehouseplan.warehouseId) {
        return res.json({
          status: false,
          message: "WareHouse Id is required",
        });
      }

      if (!warehouseplan.month) {
        return res.json({
          status: false,
          message: "Month is required",
        });
      }

      if (!warehouseplan.year) {
        return res.json({
          status: false,
          message: "Year is required",
        });
      }

      if (!warehouseplan.quantity) {
        return res.json({
          status: false,
          message: "Quantity is required",
        });
      }

      let chkMonth = await WareHousePlan.findOne({
        isDeleted: { "!=": true },
        warehouseId: warehouseplan.warehouseId,
        month: warehouseplan.month,
        year: warehouseplan.year,
        isDeleted: false,
      });

      if (chkMonth) {
        return res.json({
          status: false,
          message: "Tháng và năm đã bị trùng!",
        });
      }

      const checkWareHouse = await WareHouse.findOne({
        isDeleted: { "!=": true },
        _id: warehouseplan.warehouseId,
      });

      if (!checkWareHouse) {
        return res.json({
          status: false,
          message: "Không tìm thấy id của WareHouse.",
        });
      }

      // if (warehouseplan.createdBy) {
      //     const checkWareHousePlanUserCreate = await User.findOne({isDeleted: {"!=": true},
      //         _id: warehouseplan.createdBy
      //     });

      //     if (!checkWareHousePlanUserCreate) {
      //         return res.json({
      //             status: false,
      //             message: 'Ware House Plan User Create không tồn tại.'
      //         });
      //     }
      // }

      const newWareHousePlan = await WareHousePlan.create(
        warehouseplan
      ).fetch();

      if (
        !newWareHousePlan ||
        newWareHousePlan == "" ||
        newWareHousePlan == null
      ) {
        return res.json({
          status: false,
          message: "Lỗi...Tạo Ware House Plan không thành công.",
        });
      } else {
        return res.json({
          status: true,
          WareHousePlan: newWareHousePlan,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  getAllWareHousePlanByWareHouseId: async function (req, res) {
    try {
      const warehouseId = req.query.warehouseId;

      if (!warehouseId) {
        return res.json({
          status: false,
          message: "WareHouse Id is not defined. Please check out again.",
        });
      }

      const checkWareHousePlan = await WareHousePlan.find({
        isDeleted: { "!=": true },
        warehouseId: warehouseId,
        isDeleted: false,
      });

      if (
        !checkWareHousePlan ||
        checkWareHousePlan == "" ||
        checkWareHousePlan == null
      ) {
        return res.json({
          status: false,
          message: "Lỗi...Không tìm thấy WareHousePlan.",
        });
      } else {
        return res.json({
          status: true,
          WareHousePlan: checkWareHousePlan,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  updateWareHousePlan: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const update = {
        warehouseplanId: req.body.warehouseplanId,
        warehouseId: req.body.warehouseId,
        month: req.body.month,
        year: req.body.year,
        quantity: req.body.quantity,
        note: req.body.note,
        updatedBy: req.body.updatedBy ? req.body.updatedBy : null,
      };

      if (update.warehouseplanId) {
        let chkWareHousePlan = await WareHousePlan.findOne({
          isDeleted: { "!=": true },
          id: update.warehouseplanId,
          isDeleted: false,
        });
        if (!chkWareHousePlan) {
          return res.json({
            status: false,
            message: "WareHousePlan không tồn tại!",
          });
        }
      }

      if (update.warehouseId) {
        let warehouse = await WareHouse.findOne({
          isDeleted: { "!=": true },
          id: update.warehouseId,
        });
        if (!warehouse) {
          return res.json({
            status: false,
            message: "id WareHouse không tồn tại!",
          });
        }
      }

      let chkMonth = await WareHousePlan.findOne({
        isDeleted: { "!=": true },
        warehouseId: update.warehouseId,
        month: update.month,
        year: update.year,
      });

      if (chkMonth) {
        let updateWareHousePlan = await WareHousePlan.updateOne({
          isDeleted: { "!=": true },
          id: update.warehouseplanId,
          month: update.month,
          year: update.year,
        }).set({
          quantity: update.quantity,
          note: update.note,
          updatedBy: update.updatedBy,
        });

        if (updateWareHousePlan) {
          return res.json({ status: true, WareHousePlan: updateWareHousePlan });
        } else {
          return res.json({ status: false, message: "Lỗi update!" });
        }
      } else {
        let updateWareHousePlan = await WareHousePlan.updateOne({
          isDeleted: { "!=": true },
          id: update.warehouseplanId,
        }).set({
          month: update.month,
          year: update.year,
          quantity: update.quantity,
          note: update.note,
          updatedBy: update.updatedBy,
        });

        if (updateWareHousePlan) {
          return res.json({ status: true, WareHousePlan: updateWareHousePlan });
        } else {
          return res.json({ status: false, message: "Lỗi update!" });
        }
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  deleteWareHousePlan: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const warehouseplanId = req.body.warehouseplanId;
      const deletedBy = req.body.deletedBy ? req.body.deletedBy : null;

      if (!warehouseplanId) {
        return res.json({
          status: false,
          message: "warehouseplanId is not defined. Please check out again.",
        });
      }

      if (deletedBy) {
        const checkUserDelete = await User.findOne({
          isDeleted: { "!=": true },
          _id: deletedBy,
        });

        if (!checkUserDelete) {
          return res.json({
            status: false,
            message: "User Delete không tồn tại.",
          });
        }
      }

      const checkWareHousePlanId = await WareHousePlan.findOne({
        isDeleted: { "!=": true },
        _id: warehouseplanId,
        isDeleted: false,
      });

      if (!checkWareHousePlanId) {
        return res.json({
          status: false,
          message: "WareHousePlan không tồn tại.",
        });
      }

      const deleteWareHousePlan = await WareHousePlan.updateOne({
        isDeleted: { "!=": true },
        _id: warehouseplanId,
        isDeleted: false,
      }).set({
        isDeleted: true,
        deletedBy: deletedBy,
        deletedAt: Date.now(),
      });

      if (
        !deleteWareHousePlan ||
        deleteWareHousePlan == "" ||
        deleteWareHousePlan == null
      ) {
        return res.json({
          status: false,
          message: "Lỗi...Hủy WareHousePlan không thành công.",
        });
      } else {
        return res.json({
          status: true,
          message: "WareHousePlan đã được hủy thành công.",
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },
};
