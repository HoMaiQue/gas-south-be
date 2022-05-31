/**
 * WareHouseController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  createWareHouse: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const warehouse = {
        name: req.body.name,
        code: req.body.code,
        address: req.body.address,
        userId: req.body.userId,
        mininventory: req.body.mininventory,
        namecontact: req.body.namecontact ? req.body.namecontact : "",
        mobilecontact: req.body.mobilecontact ? req.body.mobilecontact : "",
        emailcontact: req.body.emailcontact ? req.body.emailcontact : "",
        note: req.body.note ? req.body.note : "",
        createdBy: req.body.createdBy ? req.body.createdBy : null,
        updatedBy: req.body.createdBy ? req.body.createdBy : null,
        isSupplier: req.body.isSupplier ? req.body.isSupplier : false,
      };

      if (!warehouse.name) {
        return res.json({
          status: false,
          message: "Name is required",
        });
      }

      if (!warehouse.code) {
        return res.json({
          status: false,
          message: "Code is required",
        });
      }

      const checkcode = await WareHouse.findOne({
        isDeleted: { "!=": true },
        code: warehouse.code,
      });

      if (checkcode) {
        return res.json({
          status: false,
          message: "Code đã tồn tại",
        });
      }

      // if (!warehouse.address) {
      //     return res.json({
      //         status: false,
      //         message: "Address is required"
      //     });
      // }

      if (!warehouse.userId) {
        return res.json({
          status: false,
          message: "UserId is required",
        });
      }

      // if (!warehouse.mininventory) {
      //     return res.json({
      //         status: false,
      //         message: "Min Inventory is required"
      //     });
      // }

      const checkUser = await User.findOne({
        isDeleted: { "!=": true },
        _id: warehouse.userId,
      });

      if (!checkUser) {
        return res.json({
          status: false,
          message: "Không tìm thấy id của User.",
        });
      }

      if (warehouse.createdBy) {
        const checkWareHouseUserCreate = await User.findOne({
          isDeleted: { "!=": true },
          _id: warehouse.createdBy,
        });

        if (!checkWareHouseUserCreate) {
          return res.json({
            status: false,
            message: "Ware House User Create không tồn tại.",
          });
        }
      }

      const newWareHouse = await WareHouse.create(warehouse).fetch();

      if (!newWareHouse || newWareHouse == "" || newWareHouse == null) {
        return res.json({
          status: false,
          message: "Lỗi...Tạo Ware House không thành công.",
        });
      } else {
        return res.json({
          status: true,
          WareHouse: newWareHouse,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  getAllWareHouse: async function (req, res) {
    try {
      const allWareHouse = await WareHouse.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      });

      if (!allWareHouse || allWareHouse == "" || allWareHouse == null) {
        return res.json({
          status: false,
          message: "Lỗi...Không tìm thấy WareHouse.",
        });
      } else {
        return res.json({
          status: true,
          WareHouse: allWareHouse,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  getWareHouseById: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const warehouseId = req.body.warehouseId;

      if (!warehouseId) {
        return res.json({
          status: false,
          message: "WareHouse Id is not defined. Please check out again.",
        });
      }

      const checkWareHouse = await WareHouse.findOne({
        isDeleted: { "!=": true },
        _id: warehouseId,
        isDeleted: false,
      });

      if (!checkWareHouse || checkWareHouse == "" || checkWareHouse == null) {
        return res.json({
          status: false,
          message: "Lỗi...Không tìm thấy WareHouse.",
        });
      } else {
        return res.json({
          status: true,
          WareHouse: checkWareHouse,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  getWareHouseByUserId: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const userId = req.body.userId;

      if (!userId) {
        return res.json({
          status: false,
          message: "User Id is not defined. Please check out again.",
        });
      }

      const checkWareHouse = await WareHouse.find({
        isDeleted: { "!=": true },
        userId: userId,
        isDeleted: false,
      });

      if (!checkWareHouse || checkWareHouse == "" || checkWareHouse == null) {
        return res.json({
          status: false,
          message: "Lỗi...Không tìm thấy WareHouse.",
        });
      } else {
        return res.json({
          status: true,
          WareHouse: checkWareHouse,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  updateWareHouse: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const update = {
        warehouseId: req.body.warehouseId,
        name: req.body.name,
        code: req.body.code,
        address: req.body.address,
        userId: req.body.userId,
        mininventory: req.body.mininventory,
        namecontact: req.body.namecontact,
        mobilecontact: req.body.mobilecontact,
        emailcontact: req.body.emailcontact,
        note: req.body.note,
        updatedBy: req.body.updatedBy ? req.body.updatedBy : null,
        isSupplier: req.body.isSupplier,
      };

      // if (!update.name) {
      //     return res.json({
      //         status: false,
      //         message: 'Name is not defined. Please check out again.'
      //     })
      // }

      // if (!update.code) {
      //     return res.json({
      //         status: false,
      //         message: 'Code is not defined. Please check out again.'
      //     })
      // }

      // const checkcode = await WareHouse.findOne({isDeleted: {"!=": true},
      //     code: update.code
      // })

      // if (checkcode) {
      //     return res.json({
      //         status: false,
      //         message: "Code đã tồn tại"
      //     });
      // }

      // if (!update.address) {
      //     return res.json({
      //         status: false,
      //         message: 'Address is not defined. Please check out again.'
      //     })
      // }

      if (update.code) {
        const checkcode = await WareHouse.findOne({
          isDeleted: { "!=": true },
          code: update.code,
          _id: {
            "!=": update.warehouseId,
          },
        });

        if (checkcode) {
          return res.json({
            status: false,
            message: "Code đã tồn tại",
          });
        }
      }

      if (update.userId) {
        const checkUserId = await User.findOne({
          isDeleted: { "!=": true },
          _id: update.userId,
        });

        if (!checkUserId) {
          return res.json({
            status: false,
            message: "User Update không tồn tại.",
          });
        }
      }

      // if (!update.mininventory) {
      //     return res.json({
      //         status: false,
      //         message: 'Min Inventory is not defined. Please check out again.'
      //     })
      // }

      if (update.updatedBy) {
        const checkUserId = await User.findOne({
          isDeleted: { "!=": true },
          _id: update.updatedBy,
        });

        if (!checkUserId) {
          return res.json({
            status: false,
            message: "User Update không tồn tại.",
          });
        }
      }

      const updateWareHouse = await WareHouse.updateOne({
        isDeleted: { "!=": true },
        _id: update.warehouseId,
      }).set({
        name: update.name,
        code: update.code,
        address: update.address,
        userId: update.userId,
        mininventory: update.mininventory,
        namecontact: update.namecontact,
        mobilecontact: update.mobilecontact,
        emailcontact: update.emailcontact,
        note: update.note,
        updatedBy: update.updatedBy,
        isSupplier: update.isSupplier,
        updatedAt: Date.now(),
      });
      if (
        !updateWareHouse ||
        updateWareHouse == "" ||
        updateWareHouse == null
      ) {
        return res.json({
          status: false,
          message: "Lỗi...Không thể cập nhật thông tin WareHouse.",
        });
      } else {
        return res.json({
          status: true,
          WareHouse: updateWareHouse,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  deleteWareHouse: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const warehouseId = req.body.warehouseId;
      const deletedBy = req.body.deletedBy ? req.body.deletedBy : null;

      if (!warehouseId) {
        return res.json({
          status: false,
          message: "warehouseId is not defined. Please check out again.",
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

      const checkWareHouse = await WareHouse.findOne({
        isDeleted: { "!=": true },
        _id: warehouseId,
        isDeleted: false,
      });

      if (!checkWareHouse) {
        return res.json({
          status: false,
          message: "WareHouse không tồn tại.",
        });
      }

      const deleteWareHouse = await WareHouse.updateOne({
        isDeleted: { "!=": true },
        _id: warehouseId,
        isDeleted: false,
      }).set({
        isDeleted: true,
        deletedBy: deletedBy,
        deletedAt: Date.now(),
      });

      if (
        !deleteWareHouse ||
        deleteWareHouse == "" ||
        deleteWareHouse == null
      ) {
        return res.json({
          status: false,
          message: "Lỗi...Hủy WareHouse không thành công.",
        });
      } else {
        return res.json({
          status: true,
          message: "WareHouse đã được hủy thành công.",
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
