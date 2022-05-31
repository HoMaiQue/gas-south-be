/**
 * ShippingOrderDetailController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

//
module.exports = {
  // thêm đơn hàng
  updateShippingOrderDetail: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      let newOrder = [];

      const shippingorderId = req.body.shippingorderId.trim();

      const orderDetail = await Promise.all(
        req.body.ShippingOrderDetail.map(async (element) => {
          return {
            orderId: element.orderId,
            createdBy: element.createdBy,
            provinceId: element.provinceId,
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
        for (let i = 0; i < orderDetail.length; i++) {
          for (let j = i + 1; j < orderDetail.length; j++) {
            if (orderDetail[i].orderId === orderDetail[j].orderId) {
              return res.json({
                success: false,
                message: "Mã đơn hàng bị trùng.",
              });
            }
          }

          const checkOrder = await OrderShipping.findOne({
            isDeleted: { "!=": true },
            _id: orderDetail[i].orderId,
          });

          if (!checkOrder) {
            return res.json({
              success: false,
              message: "Đơn hàng không tồn tại.",
            });
          }

          const checkNewOrder = await ShippingOrderDetail.findOne({
            isDeleted: { "!=": true },
            orderId: orderDetail[i].orderId,
            isDeleted: false,
            shippingOrderId: shippingorderId,
          });

          if (!checkNewOrder) {
            // const checkExits = await ShippingOrderDetail.findOne({isDeleted: {"!=": true},
            //     orderId: orderDetail[i].orderId,
            //     isDeleted: false,
            // });

            // if (checkExits){
            //     return res.json({
            //         success: false,
            //         message: 'Đơn hàng thêm mới bị trùng với đơn hàng thuộc ShippingOrder khác.'
            //     });
            // } else {
            //     newOrder.push(orderDetail[i])
            // }
            newOrder.push(orderDetail[i]);
          }

          if (orderDetail[i].createdBy) {
            const checkUserCreate = await User.findOne({
              isDeleted: { "!=": true },
              _id: orderDetail[i].createdBy,
            });

            if (!checkUserCreate) {
              return res.json({
                success: false,
                message: "User Create không tồn tại.",
              });
            }
          }

          if (orderDetail[i].provinceId) {
            const checkProvince = await Region.findOne({
              isDeleted: { "!=": true },
              _id: orderDetail[i].provinceId,
            });

            if (!checkProvince) {
              return res.json({
                success: false,
                message: "Mã vùng không tồn tại.",
              });
            }
          }
        }

        const _orderDetail = await ShippingOrderDetail.find({
          isDeleted: { "!=": true },
          isDeleted: false,
          shippingOrderId: shippingorderId,
        });

        const checkOrderExist = await Promise.all(
          _orderDetail.map(async (element) => {
            return {
              orderId: element.orderId,
            };
          })
        );

        for (let k = 0; k < checkOrderExist.length; k++) {
          let c = 0;
          for (let i = 0; i < orderDetail.length; i++) {
            if (orderDetail[i].orderId === checkOrderExist[k].orderId) {
              c++;
            }
          }
          if (c == 0) {
            const cancelOrder = await ShippingOrderDetail.updateOne({
              isDeleted: { "!=": true },
              orderId: checkOrderExist[k].orderId,
              shippingOrderId: shippingorderId,
              isDeleted: false,
            }).set({
              isDeleted: true,
            });
          }
        }

        for (let i = 0; i < newOrder.length; i++) {
          await ShippingOrderDetail.create({
            orderId: newOrder[i].orderId,
            createdBy: newOrder[i].createdBy,
            provinceId: newOrder[i].provinceId,
            shippingOrderId: shippingorderId,
          }).fetch();
        }

        const listOrderDetail = await ShippingOrderDetail.find({
          isDeleted: { "!=": true },
          shippingOrderId: shippingorderId,
          isDeleted: false,
        });

        if (
          !listOrderDetail ||
          listOrderDetail == "" ||
          listOrderDetail == null
        ) {
          return res.json({
            success: false,
            message: "Lỗi...Không tìm thấy đơn hàng.",
          });
        } else {
          return res.json({
            success: true,
            ShippingOrderDetail: listOrderDetail,
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

  getShippingOrderDetailOfShippingOrder: async function (req, res) {
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

      const OrderDetail = await ShippingOrderDetail.find({
        isDeleted: { "!=": true },
        shippingOrderId: shippingorderId,
        isDeleted: false,
      });

      if (!OrderDetail || OrderDetail == "" || OrderDetail == null) {
        return res.json({
          success: false,
          message: "Không tìm thấy ShippingOrderDetail.",
        });
      } else {
        return res.json({
          success: true,
          ShippingOrderDetail: OrderDetail,
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
  cancelShippingOrderDetail: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const shippingOrderDetailId = req.body.shippingOrderDetailId.trim();

      if (!shippingOrderDetailId) {
        return res.json({
          success: false,
          message:
            "shippingOrderDetailId is not defined. Please check out again.",
        });
      }

      const shippingOrderDetail = await ShippingOrderDetail.findOne({
        isDeleted: { "!=": true },
        _id: shippingOrderDetailId,
        isDeleted: false,
      });

      if (
        !shippingOrderDetail ||
        shippingOrderDetail == "" ||
        shippingOrderDetail == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...ShippingCustomerDetail không tồn tại.",
        });
      } else {
        const newShippingOrderDetail = await ShippingOrderDetail.updateOne({
          isDeleted: { "!=": true },
          _id: shippingOrderDetailId,
          isDeleted: false,
        }).set({
          isDeleted: true,
        });

        return res.json({
          success: true,
          message: "ShippingOrderDetail đã được hủy.",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Update Province
  updateProvince: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const shippingOrderDetailId = req.body.shippingOrderDetailId.trim();
      const provinceId = req.body.provinceId.trim();

      if (!provinceId) {
        return res.json({
          success: false,
          message: "provinceId is not defined. Please check out again.",
        });
      } else {
        const checkProvince = await Region.findOne({
          isDeleted: { "!=": true },
          _id: provinceId,
        });

        if (!checkProvince) {
          return res.json({
            success: false,
            message: "Mã vùng không tồn tại.",
          });
        }
      }

      if (!shippingOrderDetailId) {
        return res.json({
          success: false,
          message:
            "shippingOrderDetailId is not defined. Please check out again.",
        });
      }

      const shippingOrderDetail = await ShippingOrderDetail.findOne({
        isDeleted: { "!=": true },
        _id: shippingOrderDetailId,
        isDeleted: false,
      });

      if (
        !shippingOrderDetail ||
        shippingOrderDetail == "" ||
        shippingOrderDetail == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...ShippingOrderDetail không tồn tại.",
        });
      } else {
        const newShippingOrderDetail = await ShippingOrderDetail.updateOne({
          isDeleted: { "!=": true },
          _id: shippingOrderDetailId,
          isDeleted: false,
        }).set({
          provinceId: provinceId,
        });

        return res.json({
          success: true,
          ShippingOrderDetail: newShippingOrderDetail,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Api lấy đơn hàng của tài xế
  getOrderByShippingOrderID: async function (req, res) {
    try {
      const shippingorderId = req.query.shippingorderId;

      const checkShippingOrder = await ShippingOrder.findOne({
        isDeleted: { "!=": true },
        _id: shippingorderId,
        isDeleted: false,
        status: 2,
      });

      if (!checkShippingOrder) {
        return res.json({
          success: false,
          message: "ShippingOrder không tồn tại hoặc không ở trạng thái 2.",
        });
      }

      const OrderDetail = await ShippingOrderDetail.find({
        isDeleted: { "!=": true },
        shippingOrderId: shippingorderId,
        isDeleted: false,
      }).populate("orderId");

      if (!OrderDetail || OrderDetail == "" || OrderDetail == null) {
        return res.json({
          success: false,
          message: "Không tìm thấy đơn hàng nào.",
        });
      } else {
        return res.json({
          success: true,
          ShippingOrder: checkShippingOrder,
          ShippingOrderDetail: OrderDetail,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getDetailOfShippingOrder: async function (req, res) {
    try {
      const shippingOrderID = req.query.shippingOrderID;

      const checkShippingOrder = await ShippingOrder.findOne({
        isDeleted: { "!=": true },
        _id: shippingOrderID,
        isDeleted: false,
      });

      if (!checkShippingOrder) {
        return res.json({
          success: false,
          message: "ShippingOrder không tồn tại.",
        });
      }

      const shippingOrderDetail = await ShippingOrderDetail.find({
        isDeleted: { "!=": true },
        shippingOrderId: shippingOrderID,
        isDeleted: false,
      });
      // .populate('orderGasId')

      if (
        !shippingOrderDetail ||
        shippingOrderDetail == "" ||
        shippingOrderDetail == null
      ) {
        return res.json({
          success: false,
          message: "Không tìm thấy ShippingOrderDetail.",
        });
      } else {
        let orderDetail = await Promise.all(
          shippingOrderDetail.map(async (element) => {
            return await OrderShipping.find({
              isDeleted: { "!=": true },
              id: element.orderId,
              isDeleted: false,
            })
              .populate("warehouseId")
              .populate("shippingOrderDetail", {
                sort: "createdAt DESC",
                limit: 1,
              })
              .populate("createdBy");
          })
        );

        return res.json({
          success: true,
          ShippingOrderDetail: orderDetail,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getDetail: async function (req, res) {
    try {
      const shippingOrderDetailID = req.query.shippingOrderDetailID;

      const checkShippingOrderDetail = await ShippingOrderDetail.findOne({
        isDeleted: { "!=": true },
        _id: shippingOrderDetailID,
        isDeleted: false,
      });

      if (!checkShippingOrderDetail) {
        return res.json({
          success: false,
          message: "ShippingOrderDetail không tồn tại.",
        });
      }

      const shippingOrderDetail = await ShippingOrderDetail.findOne({
        isDeleted: { "!=": true },
        _id: shippingOrderDetailID,
        isDeleted: false,
      }).populate("shippingOrderId");

      if (
        !shippingOrderDetail ||
        shippingOrderDetail == "" ||
        shippingOrderDetail == null
      ) {
        return res.json({
          success: false,
          message: "Không tìm thấy ShippingOrderDetail.",
        });
      } else {
        const orderShipping = await OrderShipping.findOne({
          isDeleted: { "!=": true },
          _id: shippingOrderDetail.orderId,
          isDeleted: false,
        }).populate("warehouseId");

        return res.json({
          success: true,
          ShippingOrderDetail: shippingOrderDetail,
          OrderShipping: orderShipping,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // getOrderDeliveringOfCustomer: async function (req, res) {
  //     try {
  //         const customerId = req.query.customerId;
  //         const status = req.query.status;

  //         if (!customerId) {
  //             return res.json({
  //                 success: false,
  //                 message: 'customerId is not defined. Please check out again.'
  //             });
  //         }

  //         if (!status) {
  //             return res.json({
  //                 success: false,
  //                 message: 'Status is not defined. Please check out again.'
  //             });
  //         }

  //         const checkOrder = await OrderShipping.find({isDeleted: {"!=": true},
  //             customerId: customerId,
  //             isDeleted: false
  //         })

  //         if (!checkOrder) {
  //             return res.json({
  //                 success: false,
  //                 message: 'Không tìm thấy đơn hàng.'
  //             });
  //         } else {
  //             const order = [];
  //             const orderresult = [];
  //             let orderDetail = await Promise.all(checkOrder.map( async element => {
  //                 return await ShippingOrderDetail.find({isDeleted: {"!=": true},
  //                     orderId: element.id,
  //                     isDeleted: false
  //                 })
  //                 // .populate('orderId');
  //             }))

  //             for (let i = 0; i < orderDetail.length; i++) {
  //                     !orderDetail[i] || orderDetail[i] == '' || orderDetail[i] == null ? order : order.push(orderDetail[i])
  //             }

  //             if (!order || order == '' || order == null) {
  //                 return res.json({
  //                     success: false,
  //                     message: 'Lỗi...Không tìm thấy đơn hàng.'
  //                 });
  //              }

  //             const orderDetailShipping = await Promise.all(order.map( async element => {
  //                 return await ShippingOrder.find({isDeleted: {"!=": true},
  //                     _id: element.shippingOrderId,
  //                     status: status,
  //                     isDeleted: false
  //                 })
  //             }))

  //             const orderDetailCarrier = await Promise.all(orderDetailShipping.map( async element => {
  //                 return await User.find({isDeleted: {"!=": true},
  //                     _id: element[0].driverId
  //                 })
  //             }))

  //             for (let i = 0; i < orderDetailCarrier.length; i++) {
  //                 !orderDetailCarrier[i][0] || orderDetailCarrier[i][0] == '' || orderDetailCarrier[i][0] == null ? orderresult : orderresult.push(orderDetailCarrier[i][0])
  //             }

  //             const _order = await Promise.all(orderDetailShipping.map( async element => {
  //                 return await ShippingOrderDetail.find({isDeleted: {"!=": true},
  //                     shippingOrderId: element.id,
  //                     isDeleted: false
  //                 })
  //                 .populate('orderId');
  //             }))

  //             return res.json({
  //                 success: true,
  //                 ShippingOrderDetail: _order,
  //                 Carrier: orderresult
  //             })
  //         }

  //     } catch (error) {
  //         return res.json({
  //             success: false,
  //             message: error.message
  //         })
  //     }
  // },
};
