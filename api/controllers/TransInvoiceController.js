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
            message: "User Create kh??ng t???n t???i.",
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
          message: "Kh??ng t??m th???y id c???a h??ng giao gas.",
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
          message: "Ng?????i v???n chuy???n kh??ng t???n t???i.",
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
          message: "M?? ????n v???n chuy???n ???? t???n t???i.",
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
              message: `Danh s??ch m?? ????n h??ng ${i + 1} v??  ${
                j + 1
              } truy???n l??n b??? tr??ng.`,
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
              message: `????n h??ng th??? ${i + 1} kh??ng t???n t???i.`,
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
              message: `User Create th??? ${i + 1} kh??ng t???n t???i.`,
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
          message: "L???i...T???o ????n v???n chuy???n kh??ng th??nh c??ng.",
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
          message: "L???i...Kh??ng t??m th???y TransInvoice.",
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
          message: "L???i...Kh??ng t??m th???y TransInvoice.",
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
            message: "Ng?????i v???n chuy???n kh??ng t???n t???i.",
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
            message: "Kh??ng t??m th???y id c???a h??ng giao gas.",
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
            message: "User Update kh??ng t???n t???i.",
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
          message: "L???i...Kh??ng th??? c???p nh???t th??ng tin TransInvoice.",
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

  // H???y ????n
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
            message: "User Delete kh??ng t???n t???i.",
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
            message: `TransInvoice th??? ${i + 1} kh??ng t???n t???i.`,
          });
        } else {
          if (checkTransInvoice.status != 1) {
            return res.json({
              success: false,
              message: `Kh??ng th??? h???y ????n h??ng th??? ${
                i + 1
              } do tr???ng th??i ????n h??ng kh??c 1.`,
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
          //             message: '????n h??ng ???? ???????c h???y th??nh c??ng.',
          //         });
          // })
          .catch(function (data) {
            return res.json({
              success: false,
              message: `L???i...????n h??ng th??? ${
                i + 1
              } tr??? ??i h???y kh??ng th??nh c??ng.`,
            });
          });
      }

      return res.json({
        success: true,
        message: "????n h??ng ???? ???????c h???y th??nh c??ng.",
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
          message: "L???i...Kh??ng t??m th???y TransInvoice.",
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
