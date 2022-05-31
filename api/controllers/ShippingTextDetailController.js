/**
 * ShippingTextDetailController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  // thêm đơn hàng
  updateShippingTextDetail: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      let newOrder = [];

      const shippingorderId = req.body.shippingorderId.trim();

      const textDetail = await Promise.all(
        req.body.ShippingTextDetail.map(async (element) => {
          return {
            serial: element.serial,
            fileName: element.fileName,
            createdBy: element.createdBy,
          };
        })
      );

      if (!shippingorderId) {
        return res.json({
          success: false,
          message: "shippingorderId is not defined. Please check out again.",
        });
      }

      const checkShippingOrder = await ShippingOrder.findOne({
        isDeleted: { "!=": true },
        _id: shippingorderId,
      });

      if (!checkShippingOrder) {
        return res.json({
          success: false,
          message: "ShippingOrder không tồn tại.",
        });
      } else {
        for (let i = 0; i < textDetail.length; i++) {
          // Nếu isTurnback thì không kiểm tra trùng bình
          for (let j = i + 1; j < textDetail.length; j++) {
            if (textDetail[i].serial === textDetail[j].serial) {
              return res.json({
                success: false,
                message: "Mã bình bị trùng.",
              });
            }
          }

          const checkCylinder = await Cylinder.findOne({
            isDeleted: { "!=": true },
            serial: textDetail[i].serial,
          });

          if (!checkCylinder) {
            return res.json({
              success: false,
              message: "Mã bình không tồn tại.",
            });
          }

          const checkNewOrder = await ShippingTextDetail.find({
            isDeleted: { "!=": true },
            serial: textDetail[i].serial,
            isDeleted: false,
            shippingOrderId: shippingorderId,
          });

          if (checkNewOrder.length == 0 || req.body.isTurnback) {
            // const checkExits = await ShippingTextDetail.findOne({isDeleted: {"!=": true},
            //     serial: textDetail[i].serial,
            //     isDeleted: false,
            // });

            // if (checkExits){
            //     return res.json({
            //         success: false,
            //         message: 'Sản phẩm thêm mới bị trùng với sản phẩm thuộc ShippingOrder khác.'
            //     });
            // } else {
            //     newOrder.push(textDetail[i])
            // }
            newOrder.push(textDetail[i]);
          } else {
            return res.json({
              success: false,
              message: "Mã bình đã tồn tại.",
            });
          }

          if (!textDetail[i].fileName) {
            return res.json({
              success: false,
              message: "fileName không xác định!!!",
            });
          }

          if (textDetail[i].createdBy) {
            const checkUserCreate = await User.findOne({
              isDeleted: { "!=": true },
              _id: textDetail[i].createdBy,
            });

            if (!checkUserCreate) {
              return res.json({
                success: false,
                message: "User Create không tồn tại.",
              });
            }
          }
        }

        const _textDetail = await ShippingTextDetail.find({
          isDeleted: { "!=": true },
          isDeleted: false,
          shippingOrderId: shippingorderId,
        });

        const checkOrderExist = await Promise.all(
          _textDetail.map(async (element) => {
            return {
              serial: element.serial,
            };
          })
        );

        // for (let k = 0; k < checkOrderExist.length; k++) {
        //     let c = 0;
        //     for (let i = 0; i < textDetail.length; i++ ) {
        //         if (textDetail[i].serial === checkOrderExist[k].serial) {
        //             c++;
        //         }
        //     }
        //     if (c == 0) {
        //         const cancelOrder = await ShippingTextDetail
        //         .updateOne({isDeleted: {"!=": true},
        //             serial: checkOrderExist[k].serial,
        //             shippingOrderId: shippingorderId,
        //             isDeleted: false,
        //             isTurnback: req.body.isTurnback ? req.body.isTurnback : false,
        //         })
        //         .set({
        //             isDeleted : true,
        //         });
        //     }
        // }

        const idImex = Date.now();

        for (let i = 0; i < newOrder.length; i++) {
          // Thay dổi trạng thái bình thành đang vận chuyển
          const getCylinder = await Cylinder.updateOne({
            isDeleted: { "!=": true },
            serial: newOrder[i].serial,
          }).set({
            placeStatus: "DELIVERING",
          });

          await ShippingTextDetail.create({
            serial: newOrder[i].serial,
            fileName: newOrder[i].fileName,
            createdBy: newOrder[i].createdBy,
            shippingOrderId: shippingorderId,
            cylinders: getCylinder.id,
            isTurnback: req.body.isTurnback ? req.body.isTurnback : false,
          });

          // Thêm bản ghi trong collection CylinderImex
          await CylinderImex.create({
            cylinder: getCylinder.id,
            idImex,
            status: getCylinder.status ? getCylinder.status : "FULL",
            condition: "OLD",
            typeImex: "OUT",
            flow: "EXPORT",
            flowDescription: "SELL",
            // Cần thêm bản ghi trong collection History ???
            // history,
            objectId: newOrder[i].createdBy,
            createdBy: newOrder[i].createdBy,
            isDeleted: false,
          });
        }

        const listTextDetail = await ShippingTextDetail.find({
          isDeleted: { "!=": true },
          shippingOrderId: shippingorderId,
          isDeleted: false,
        });

        if (!listTextDetail || listTextDetail == "" || listTextDetail == null) {
          return res.json({
            success: false,
            message: "Lỗi...Không tìm thấy Mã bình.",
          });
        } else {
          return res.json({
            success: true,
            ShippingTextDetail: listTextDetail,
          });
        }
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getShippingTextDetailOfShippingOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const shippingorderId = req.body.shippingorderId;

      const checkShippingOrder = await ShippingOrder.findOne({
        isDeleted: { "!=": true },
        _id: shippingorderId,
        isDeleted: false,
      });

      if (!checkShippingOrder) {
        return res.json({
          success: false,
          message: "ShippingOrder không tồn tại.",
        });
      }

      const TextDetail = await ShippingTextDetail.find({
        isDeleted: { "!=": true },
        shippingOrderId: shippingorderId,
        isDeleted: false,
      });

      if (!TextDetail || TextDetail == "" || TextDetail == null) {
        return res.json({
          success: false,
          message: "Không tìm thấy ShippingTextDetail.",
        });
      } else {
        return res.json({
          success: true,
          ShippingTextDetail: TextDetail,
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
  cancelShippingTextDetail: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const shippingTextDetailId = req.body.shippingTextDetailId.trim();

      if (!shippingTextDetailId) {
        return res.json({
          success: false,
          message:
            "shippingTextDetailId is not defined. Please check out again.",
        });
      }

      const shippingTextDetail = await ShippingTextDetail.findOne({
        isDeleted: { "!=": true },
        _id: shippingTextDetailId,
        isDeleted: false,
      });

      if (
        !shippingTextDetail ||
        shippingTextDetail == "" ||
        shippingTextDetail == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...ShippingTextDetail không tồn tại.",
        });
      } else {
        const newShippingCustomerDetail = await ShippingTextDetail.updateOne({
          isDeleted: { "!=": true },
          _id: shippingTextDetailId,
          isDeleted: false,
        }).set({
          isDeleted: true,
        });

        return res.json({
          success: true,
          message: "ShippingTextDetail đã được hủy.",
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
