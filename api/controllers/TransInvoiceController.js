/**
 * TransInvoiceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  createTransInvoice: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const order = {
        code: req.body.TransInvoice.code.trim(),
        status: 1,
        deliveryDate: req.body.TransInvoice.deliveryDate.trim(),
        deliveryHours: req.body.TransInvoice.deliveryHours.trim(),
        carrierId: req.body.TransInvoice.carrierId.trim(),
        userId: req.body.TransInvoice.userId.trim(),
        createdBy: req.body.TransInvoice.createdBy
          ? req.body.TransInvoice.createdBy
          : null,
        updatedBy: req.body.TransInvoice.createdBy
          ? req.body.TransInvoice.createdBy
          : null,
        note: req.body.TransInvoice.note,
      };

      const transInvoiceDetail = await Promise.all(
        req.body.TransInvoiceDetail.map(async (element) => {
          return {
            orderGasId: element.orderGasId,
            lat: element.lat,
            long: element.long,
            note: element.note,
            createdBy: element.createdBy,
          };
        })
      );

      if (!order.code) {
        return res.json({
          success: false,
          message: "code is not defined. Please check out again.",
        });
      }

      if (!order.status) {
        return res.json({
          success: false,
          message: "status is not defined. Please check out again.",
        });
      }

      if (!order.deliveryDate) {
        return res.json({
          success: false,
          message: "deliveryDate is not defined. Please check out again.",
        });
      }

      if (!order.deliveryHours) {
        return res.json({
          success: false,
          message: "deliveryHours is not defined. Please check out again.",
        });
      }

      if (!order.userId) {
        return res.json({
          success: false,
          message: "userId is not defined. Please check out again.",
        });
      }

      if (!order.carrierId) {
        return res.json({
          success: false,
          message: "carrierId is not defined. Please check out again.",
        });
      }

      if (order.createdBy) {
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
      }

      const checkUser = await User.findOne({
        isDeleted: { "!=": true },
        _id: order.userId,
      });

      if (!checkUser) {
        return res.json({
          success: false,
          message: "Không tìm thấy id cửa hàng giao gas.",
        });
      }

      const checkCarrier = await Carrier.findOne({
        isDeleted: { "!=": true },
        _id: order.carrierId,
        isDeleted: false,
      });

      if (!checkCarrier) {
        return res.json({
          success: false,
          message: "Người vận chuyển không tồn tại.",
        });
      }

      const checkCode = await TransInvoice.findOne({
        isDeleted: { "!=": true },
        code: order.code,
        isDeleted: false,
      });

      if (checkCode) {
        return res.json({
          success: false,
          message: "Mã đơn vận chuyển đã tồn tại.",
        });
      }

      for (let i = 0; i < transInvoiceDetail.length; i++) {
        for (let j = i + 1; j < transInvoiceDetail.length; j++) {
          if (
            transInvoiceDetail[i].orderGasId ===
            transInvoiceDetail[j].orderGasId
          ) {
            return res.json({
              success: false,
              message: `Danh sách mã đơn hàng ${i + 1} và  ${
                j + 1
              } truyền lên bị trùng.`,
            });
          }
        }

        if (!transInvoiceDetail[i].orderGasId) {
          return res.json({
            success: false,
            message: `orderGasId ${
              i + 1
            } is not defined. Please check out again.`,
          });
        } else {
          const checkOrder = await OrderGas.findOne({
            isDeleted: { "!=": true },
            _id: transInvoiceDetail[i].orderGasId,
            isDeleted: false,
          });

          if (!checkOrder) {
            return res.json({
              success: false,
              message: `Đơn hàng thứ ${i + 1} không tồn tại.`,
            });
          }
        }

        if (transInvoiceDetail[i].createdBy) {
          const checkUserCreate = await User.findOne({
            isDeleted: { "!=": true },
            _id: transInvoiceDetail[i].createdBy,
          });

          if (!checkUserCreate) {
            return res.json({
              success: false,
              message: `User Create thứ ${i + 1} không tồn tại.`,
            });
          }
        }
      }

      const newTransInvoice = await TransInvoice.create(order).fetch();

      if (
        !newTransInvoice ||
        newTransInvoice == "" ||
        newTransInvoice == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...Tạo đơn vận chuyển không thành công.",
        });
      } else {
        for (let i = 0; i < transInvoiceDetail.length; i++) {
          await TransInvoiceDetail.create({
            transInvoiceId: newTransInvoice.id,
            orderGasId: transInvoiceDetail[i].orderGasId,
            status: 1,
            lat: transInvoiceDetail[i].lat,
            long: transInvoiceDetail[i].long,
            note: transInvoiceDetail[i].note,
            createdBy: transInvoiceDetail[i].createdBy,
          }).fetch();

          await OrderGas.updateOne({
            isDeleted: { "!=": true },
            _id: transInvoiceDetail[i].orderGasId,
            isDeleted: false,
          }).set({
            status: "PROCESSING",
          });
        }

        const listDetail = await TransInvoiceDetail.find({
          isDeleted: { "!=": true },
          transInvoiceId: newTransInvoice.id,
          isDeleted: false,
        });

        return res.json({
          success: true,
          TransInvoice: newTransInvoice,
          TransInvoiceDetail: listDetail,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getTransInvoiceById: async function (req, res) {
    // if (!req.body) {
    //     return res.badRequest(Utils.jsonErr('Empty body'));
    // }

    try {
      const transInvoiceId = req.query.transInvoiceId;

      if (!transInvoiceId) {
        return res.json({
          success: false,
          message: "transInvoiceId is not defined. Please check out again.",
        });
      }

      // const checkTransInvoice = await TransInvoice.findOne({isDeleted: {"!=": true},
      //     _id: transInvoiceId,
      //     isDeleted: false
      // })
      // .populate('transInvoiceDetail');
      const transInvoiceDetail = await TransInvoiceDetail.find({
        isDeleted: { "!=": true },
        transInvoiceId: transInvoiceId,
        isDeleted: false,
      });

      if (
        !transInvoiceDetail ||
        transInvoiceDetail == "" ||
        transInvoiceDetail == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy TransInvoice.",
        });
      } else {
        const detail = await Promise.all(
          transInvoiceDetail.map(async (element) => {
            return await OrderGas.find({
              isDeleted: { "!=": true },
              _id: element.orderGasId,
              //transInvoiceId: transInvoiceId,
              //isDeleted: false
            });
            //.populate('customerId');
          })
        );

        // let customer = await Promise.all(detail.map( async element => {
        //     return await OrderGas.find({isDeleted: {"!=": true},
        //         //id: element.orderGasId._id,
        //         customerId: element.orderGasId.customerId,
        //         isDeleted: false
        //     })
        //     .populate('customerId');
        // }))

        const transInvoice = await TransInvoice.findOne({
          isDeleted: { "!=": true },
          _id: transInvoiceId,
          isDeleted: false,
        }).populate("userId");

        return res.json({
          success: true,
          TransInvoice: transInvoice,
          TransInvoiceDetail: detail,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getAllTransInvoiceOfCarrier: async function (req, res) {
    try {
      const carrierId = req.query.carrierId;

      if (!carrierId) {
        return res.json({
          success: false,
          message: "carrierId is not defined. Please check out again.",
        });
      }
      const checkTransInvoice = await TransInvoice.find({
        isDeleted: { "!=": true },
        carrierId: carrierId,
        isDeleted: false,
      }).sort("createdAt DESC");
      // .populate('transInvoiceDetail');

      if (
        !checkTransInvoice ||
        checkTransInvoice == "" ||
        checkTransInvoice == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy TransInvoice.",
        });
      } else {
        return res.json({
          success: true,
          TransInvoices: checkTransInvoice,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  updateTransInvoice: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const update = {
        transInvoiceId: req.body.transInvoiceId.trim(),
        status: req.body.status,
        deliveryDate: req.body.deliveryDate,
        carrierId: req.body.carrierId,
        userId: req.body.userId,
        note: req.body.note,
        updatedBy: req.body.updatedBy ? req.body.updatedBy : null,
      };

      if (update.carrierId) {
        const checkCarrier = await Carrier.findOne({
          isDeleted: { "!=": true },
          _id: update.carrierId,
          isDeleted: false,
        });

        if (!checkCarrier) {
          return res.json({
            success: false,
            message: "Người vận chuyển không tồn tại.",
          });
        }
      }

      if (update.userId) {
        const checkUser = await User.findOne({
          isDeleted: { "!=": true },
          _id: update.userId,
        });

        if (!checkUser) {
          return res.json({
            success: false,
            message: "Không tìm thấy id cửa hàng giao gas.",
          });
        }
      }

      // if (!update.status) {
      //     return res.json({
      //         success: false,
      //         message: 'status is not defined. Please check out again.'
      //     });
      // }

      // if (!update.deliveryDate) {
      //     return res.json({
      //         success: false,
      //         message: 'deliveryDate is not defined. Please check out again.'
      //     });
      // }

      if (update.updatedBy) {
        const checkUserUpdate = await User.findOne({
          isDeleted: { "!=": true },
          _id: update.updatedBy,
        });

        if (!checkUserUpdate) {
          return res.json({
            success: false,
            message: "User Update không tồn tại.",
          });
        }
      }

      const updateTransInvoice = await TransInvoice.updateOne({
        isDeleted: { "!=": true },
        _id: update.transInvoiceId,
        isDeleted: false,
      }).set({
        status: update.status,
        deliveryDate: update.deliveryDate,
        carrierId: update.carrierId,
        userId: update.userId,
        note: update.note,
        updatedBy: update.updatedBy,
        updatedAt: Date.now(),
      });

      if (
        !updateTransInvoice ||
        updateTransInvoice == "" ||
        updateTransInvoice == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...Không thể cập nhật thông tin TransInvoice.",
        });
      } else {
        return res.json({
          success: true,
          TransInvoice: updateTransInvoice,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Hủy đơn
  cancelTransInvoice: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const transInvoice = await Promise.all(
        req.body.TransInvoice.map(async (element) => {
          return {
            transInvoiceId: element.transInvoiceId,
          };
        })
      );
      const deletedBy = req.body.deletedBy ? req.body.deletedBy : null;

      if (deletedBy) {
        const checkUserDelete = await User.findOne({
          isDeleted: { "!=": true },
          _id: deletedBy,
        });

        if (!checkUserDelete) {
          return res.json({
            success: false,
            message: "User Delete không tồn tại.",
          });
        }
      }

      for (let i = 0; i < transInvoice.length; i++) {
        const checkTransInvoice = await TransInvoice.findOne({
          isDeleted: { "!=": true },
          _id: transInvoice[i].transInvoiceId,
          isDeleted: false,
        });

        if (!checkTransInvoice) {
          return res.json({
            success: false,
            message: `TransInvoice thứ ${i + 1} không tồn tại.`,
          });
        } else {
          if (checkTransInvoice.status != 1) {
            return res.json({
              success: false,
              message: `Không thể hủy đơn hàng thứ ${
                i + 1
              } do trạng thái đơn hàng khác 1.`,
            });
          }
        }
      }

      for (let i = 0; i < transInvoice.length; i++) {
        await Promise.all([
          await TransInvoice.updateOne({
            isDeleted: { "!=": true },
            _id: transInvoice[i].transInvoiceId,
            isDeleted: false,
          }).set({
            isDeleted: true,
            deletedBy: deletedBy,
            deletedAt: Date.now(),
          }),
          await TransInvoiceDetail.update({
            isDeleted: { "!=": true },
            transInvoiceId: transInvoice[i].transInvoiceId,
            isDeleted: false,
          }).set({
            isDeleted: true,
            deletedBy: deletedBy,
            deletedAt: Date.now(),
          }),
        ])
          // .then(function(data){
          //         return res.json({
          //             success: true,
          //             message: 'Đơn hàng đã được hủy thành công.',
          //         });
          // })
          .catch(function (data) {
            return res.json({
              success: false,
              message: `Lỗi...Đơn hàng thứ ${
                i + 1
              } trở đi hủy không thành công.`,
            });
          });
      }

      return res.json({
        success: true,
        message: "Đơn hàng đã được hủy thành công.",
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getAllTransInvoice: async function (req, res) {
    try {
      const checkTransInvoice = await TransInvoice.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      })
        .sort("createdAt DESC")
        .populate("carrierId");

      if (
        !checkTransInvoice ||
        checkTransInvoice == "" ||
        checkTransInvoice == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy TransInvoice.",
        });
      } else {
        return res.json({
          success: true,
          TransInvoices: checkTransInvoice,
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
