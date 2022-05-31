/**
 * ShippingCustomerDetailController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  // thêm đơn hàng
  updateShippingCustomerDetail: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      let newOrder = [];

      const shippingorderId = req.body.shippingorderId.trim();

      const customerDetail = await Promise.all(
        req.body.ShippingCustomerDetail.map(async (element) => {
          return {
            customerId: element.customerId,
            numberCylinder: element.numberCylinder,
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
        for (let i = 0; i < customerDetail.length; i++) {
          for (let j = i + 1; j < customerDetail.length; j++) {
            if (customerDetail[i].customerId === customerDetail[j].customerId) {
              return res.json({
                success: false,
                message: "Mã khách hàng bị trùng.",
              });
            }
          }

          const checkCustomer = await User.findOne({
            isDeleted: { "!=": true },
            _id: customerDetail[i].customerId,
          });

          if (!checkCustomer) {
            return res.json({
              success: false,
              message: "Khách hàng không tồn tại.",
            });
          }

          const checkNewOrder = await ShippingCustomerDetail.findOne({
            isDeleted: { "!=": true },
            customerId: customerDetail[i].customerId,
            isDeleted: false,
            shippingOrderId: shippingorderId,
          });

          if (!checkNewOrder) {
            // const checkExits = await ShippingCustomerDetail.findOne({isDeleted: {"!=": true},
            //     customerId: customerDetail[i].customerId,
            //     isDeleted: false,
            // });

            // if (checkExits){
            //     return res.json({
            //         success: false,
            //         message: 'Khách hàng thêm mới bị trùng với khách hàng thuộc ShippingOrder khác.'
            //     });
            // } else {
            //     newOrder.push(customerDetail[i])
            // }
            newOrder.push(customerDetail[i]);
          }

          if (
            !customerDetail[i].numberCylinder ||
            !customerDetail[i].numberCylinder === 0
          ) {
            return res.json({
              success: false,
              message: "numberCylinder không xác định!!!",
            });
          }

          if (customerDetail[i].createdBy) {
            const checkUserCreate = await User.findOne({
              isDeleted: { "!=": true },
              _id: customerDetail[i].createdBy,
            });

            if (!checkUserCreate) {
              return res.json({
                success: false,
                message: "User Create không tồn tại.",
              });
            }
          }
        }

        const _customerDetail = await ShippingCustomerDetail.find({
          isDeleted: { "!=": true },
          isDeleted: false,
          shippingOrderId: shippingorderId,
        });

        const checkOrderExist = await Promise.all(
          _customerDetail.map(async (element) => {
            return {
              customerId: element.customerId,
            };
          })
        );

        for (let k = 0; k < checkOrderExist.length; k++) {
          let c = 0;
          for (let i = 0; i < customerDetail.length; i++) {
            if (
              customerDetail[i].customerId === checkOrderExist[k].customerId
            ) {
              c++;
            }
          }
          if (c == 0) {
            const cancelOrder = await ShippingCustomerDetail.updateOne({
              isDeleted: { "!=": true },
              customerId: checkOrderExist[k].customerId,
              shippingOrderId: shippingorderId,
              isDeleted: false,
            }).set({
              isDeleted: true,
            });
          }
        }

        for (let i = 0; i < newOrder.length; i++) {
          await ShippingCustomerDetail.create({
            customerId: newOrder[i].customerId,
            numberCylinder: newOrder[i].numberCylinder,
            createdBy: newOrder[i].createdBy,
            shippingOrderId: shippingorderId,
          }).fetch();
        }

        const listCustomerDetail = await ShippingCustomerDetail.find({
          isDeleted: { "!=": true },
          shippingOrderId: shippingorderId,
          isDeleted: false,
        });

        if (
          !listCustomerDetail ||
          listCustomerDetail == "" ||
          listCustomerDetail == null
        ) {
          return res.json({
            success: false,
            message: "Lỗi...Không tìm thấy thông tin khách hàng.",
          });
        } else {
          return res.json({
            success: true,
            ShippingCustomerDetail: listCustomerDetail,
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

  getShippingCustomerDetailOfShippingOrder: async function (req, res) {
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

      const CustomerDetail = await ShippingCustomerDetail.find({
        isDeleted: { "!=": true },
        shippingOrderId: shippingorderId,
        isDeleted: false,
      });

      if (!CustomerDetail || CustomerDetail == "" || CustomerDetail == null) {
        return res.json({
          success: false,
          message: "Không tìm thấy ShippingCustomerDetail.",
        });
      } else {
        return res.json({
          success: true,
          ShippingCustomerDetail: CustomerDetail,
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
  cancelShippingCustomerDetail: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const shippingCustomerDetailId = req.body.shippingCustomerDetailId.trim();

      if (!shippingCustomerDetailId) {
        return res.json({
          success: false,
          message:
            "shippingCustomerDetailId is not defined. Please check out again.",
        });
      }

      const shippingCustomerDetail = await ShippingCustomerDetail.findOne({
        isDeleted: { "!=": true },
        _id: shippingCustomerDetailId,
        isDeleted: false,
      });

      if (
        !shippingCustomerDetail ||
        shippingCustomerDetail == "" ||
        shippingCustomerDetail == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...ShippingCustomerDetail không tồn tại.",
        });
      } else {
        const newShippingCustomerDetail =
          await ShippingCustomerDetail.updateOne({
            isDeleted: { "!=": true },
            _id: shippingCustomerDetailId,
            isDeleted: false,
          }).set({
            isDeleted: true,
          });

        return res.json({
          success: true,
          message: "ShippingCustomerDetail đã được hủy.",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // cập nhật
  updateNumberCylinders: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const update = {
        shippingCustomerId: req.body.shippingCustomerId.trim(),
        numberCylinder: req.body.numberCylinder,
      };

      if (!update.shippingCustomerId) {
        return res.json({
          success: false,
          message: "shippingCustomerId is not defined. Please check out again.",
        });
      }

      if (!update.numberCylinder) {
        return res.json({
          success: false,
          message: "numberCylinder is not defined. Please check out again.",
        });
      }

      const newShippingCustomer = await ShippingCustomerDetail.updateOne({
        isDeleted: { "!=": true },
        _id: update.shippingCustomerId,
        isDeleted: false,
      }).set({
        numberCylinder: update.numberCylinder,
      });

      if (
        !newShippingCustomer ||
        newShippingCustomer == "" ||
        newShippingCustomer == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...ShippingCustomerDetail không tồn tại.",
        });
      } else {
        return res.json({
          success: true,
          ShippingCustomerDetail: newShippingCustomer,
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
