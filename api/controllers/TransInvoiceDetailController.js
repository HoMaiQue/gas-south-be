/**
 * TransInvoiceDetailController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  // thêm đơn hàng
  updateTransInvoiceDetail: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      let newOrder = [];

      const transInvoiceId = req.body.transInvoiceId.trim();

      const transInvoiceDetail = await Promise.all(
        req.body.TransInvoiceDetail.map(async (element) => {
          return {
            orderGasId: element.orderGasId,
            // customerId: element.customerId,
            lat: element.lat,

            long: element.long,
            note: element.note,
            createdBy: element.createdBy,
          };
        })
      );

      if (!transInvoiceId) {
        return res.json({
          success: false,
          message: "transInvoiceId is not defined. Please check out again.",
        });
      }

      const checkTransInvoice = await TransInvoice.findOne({
        isDeleted: { "!=": true },
        _id: transInvoiceId,
        isDeleted: false,
      });

      if (!checkTransInvoice) {
        return res.json({
          success: false,
          message: "TransInvoice không tồn tại.",
        });
      } else {
        for (let i = 0; i < transInvoiceDetail.length; i++) {
          for (let j = i + 1; j < transInvoiceDetail.length; j++) {
            if (
              transInvoiceDetail[i].orderGasId ===
              transInvoiceDetail[j].orderGasId
            ) {
              return res.json({
                success: false,
                message: `ID OrderGas thứ ${i + 1} và thứ ${
                  j + 1
                } trong danh sách truyền lên bị trùng.`,
              });
            }
          }

          const checkOrderGas = await OrderGas.findOne({
            isDeleted: { "!=": true },
            _id: transInvoiceDetail[i].orderGasId,
            isDeleted: false,
          });

          if (!checkOrderGas) {
            return res.json({
              success: false,
              message: `OrderGas thứ ${i + 1} không tồn tại.`,
            });
          }

          // const checkCustomer = await Customer.findOne({isDeleted: {"!=": true},
          //     _id: transInvoiceDetailId[i].customerId,
          //     isDeleted: false
          // });

          // if(!checkCustomer){
          //     return res.json({
          //         success: false,
          //         message: `Customer thứ ${i + 1} không tồn tại.`
          //     });
          // }

          const checkNewOrder = await TransInvoiceDetail.findOne({
            isDeleted: { "!=": true },
            orderGasId: transInvoiceDetail[i].orderGasId,
            isDeleted: false,
            transInvoiceId: transInvoiceId,
          });

          if (!checkNewOrder) {
            newOrder.push(transInvoiceDetail[i]);
          }

          if (!transInvoiceDetail[i].lat) {
            return res.json({
              success: false,
              message: `lat thứ ${i + 1} không xác định!!!`,
            });
          }

          if (!transInvoiceDetail[i].long) {
            return res.json({
              success: false,
              message: `long thứ ${i + 1} không xác định!!!`,
            });
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

        const _transInvoiceDetail = await TransInvoiceDetail.find({
          isDeleted: { "!=": true },
          isDeleted: false,
          transInvoiceId: transInvoiceId,
        });

        const checkOrderExist = await Promise.all(
          _transInvoiceDetail.map(async (element) => {
            return {
              orderGasId: element.orderGasId,
              // customerId: element.customerId
            };
          })
        );

        for (let k = 0; k < checkOrderExist.length; k++) {
          let c = 0;
          for (let i = 0; i < transInvoiceDetail.length; i++) {
            if (
              transInvoiceDetail[i].orderGasId === checkOrderExist[k].orderGasId
            ) {
              c++;
            }
          }
          if (c == 0) {
            const cancelOrder = await TransInvoiceDetail.updateOne({
              isDeleted: { "!=": true },
              orderGasId: checkOrderExist[k].orderGasId,
              // customerId: customerId,
              transInvoiceId: transInvoiceId,
              isDeleted: false,
            }).set({
              isDeleted: true,
            });
          }
        }

        for (let i = 0; i < newOrder.length; i++) {
          await TransInvoiceDetail.create({
            orderGasId: newOrder[i].orderGasId,
            // customerId: newOrder[i].customerId,
            lat: newOrder[i].lat,
            long: newOrder[i].long,
            note: newOrder[i].note,
            createdBy: newOrder[i].createdBy,
            status: "1",
            transInvoiceId: transInvoiceId,
          }).fetch();
        }

        const listTransInvoiceDetail = await TransInvoiceDetail.find({
          isDeleted: { "!=": true },
          transInvoiceId: transInvoiceId,
          isDeleted: false,
        });

        if (
          !listTransInvoiceDetail ||
          listTransInvoiceDetail == "" ||
          listTransInvoiceDetail == null
        ) {
          return res.json({
            success: false,
            message: "Lỗi...Không tìm thấy thông tin vận chuyển.",
          });
        } else {
          return res.json({
            success: true,
            TransInvoiceDetail: listTransInvoiceDetail,
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

  getDetailOfTransInvoice: async function (req, res) {
    try {
      const transInvoiceId = req.query.transInvoiceId;

      const checkTransInvoice = await TransInvoice.findOne({
        isDeleted: { "!=": true },
        _id: transInvoiceId,
        isDeleted: false,
      });

      if (!checkTransInvoice) {
        return res.json({
          success: false,
          message: "TransInvoice không tồn tại.",
        });
      }

      const transInvoiceDetail = await TransInvoiceDetail.find({
        isDeleted: { "!=": true },
        transInvoiceId: transInvoiceId,
        isDeleted: false,
      });
      // .populate('orderGasId')

      if (
        !transInvoiceDetail ||
        transInvoiceDetail == "" ||
        transInvoiceDetail == null
      ) {
        return res.json({
          success: false,
          message: "Không tìm thấy TransInvoiceDetail.",
        });
      } else {
        let orderDetail = await Promise.all(
          transInvoiceDetail.map(async (element) => {
            return await OrderGas.find({
              isDeleted: { "!=": true },
              id: element.orderGasId,
              isDeleted: false,
            }).populate("customerId");
          })
        );

        return res.json({
          success: true,
          TransInvoiceDetail: orderDetail,
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
  cancelTransInvoiceDetail: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const transInvoiceDetailId = req.body.transInvoiceDetailId.trim();

      if (!transInvoiceDetailId) {
        return res.json({
          success: false,
          message:
            "transInvoiceDetailId is not defined. Please check out again.",
        });
      }

      const transInvoiceDetail = await TransInvoiceDetail.findOne({
        isDeleted: { "!=": true },
        _id: transInvoiceDetailId,
        isDeleted: false,
      });

      if (
        !transInvoiceDetail ||
        transInvoiceDetail == "" ||
        transInvoiceDetail == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy TransInvoiceDetail.",
        });
      } else {
        const newTransInvoiceDetail = await TransInvoiceDetail.updateOne({
          isDeleted: { "!=": true },
          _id: transInvoiceDetailId,
          isDeleted: false,
        }).set({
          isDeleted: true,
        });

        return res.json({
          success: true,
          message: "TransInvoiceDetail đã được hủy.",
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
      const transInvoiceDetailId = req.query.transInvoiceDetailId;

      const checkTransInvoiceDetail = await TransInvoiceDetail.findOne({
        isDeleted: { "!=": true },
        _id: transInvoiceDetailId,
        isDeleted: false,
      });

      if (!checkTransInvoiceDetail) {
        return res.json({
          success: false,
          message: "TransInvoiceDetail không tồn tại.",
        });
      }

      const transInvoiceDetail = await TransInvoiceDetail.findOne({
        isDeleted: { "!=": true },
        _id: transInvoiceDetailId,
        isDeleted: false,
      }).populate("transInvoiceId");

      if (
        !transInvoiceDetail ||
        transInvoiceDetail == "" ||
        transInvoiceDetail == null
      ) {
        return res.json({
          success: false,
          message: "Không tìm thấy TransInvoiceDetail.",
        });
      } else {
        const orderGas = await OrderGas.findOne({
          isDeleted: { "!=": true },
          //id: element.shippingOrderDetail.orderId,
          _id: transInvoiceDetail.orderGasId,
          isDeleted: false,
        }).populate("customerId");

        const product = await OrderGasDetail.find({
          isDeleted: { "!=": true },
          //id: element.shippingOrderDetail.orderId,
          orderGasId: transInvoiceDetail.orderGasId,
          //isDeleted: false
        }).populate("cylinder");

        const _productScaned = [];
        let productScaned = await Promise.all(
          product.map(async (element) => {
            return await OrderGasDetailSerial.find({
              isDeleted: { "!=": true },
              orderGasDetailId: element.id,
              isDeleted: false,
            }).populate("cylinder");
          })
        );

        for (let i = 0; i < productScaned.length; i++) {
          !productScaned[i] ||
          productScaned[i] == "" ||
          productScaned[i] == null
            ? _productScaned
            : _productScaned.push(productScaned[i]);
        }

        return res.json({
          success: true,
          TransInvoiceDetail: transInvoiceDetail,
          OrderGas: orderGas,
          Products: product,
          ProductScaned: _productScaned,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getTransInvoiceDetailOfCarrier: async function (req, res) {
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
      });
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
        let order = [];

        let orderDetail = await Promise.all(
          checkTransInvoice.map(async (element) => {
            return await TransInvoiceDetail.find({
              isDeleted: { "!=": true },
              transInvoiceId: element.id,
              status: [1, 2, 3],
              isDeleted: false,
            })
              .populate("transInvoiceId")
              .populate("orderGasId");
          })
        );

        await Promise.all(
          orderDetail.map(async (element) => {
            !element || element == "" || element == null
              ? order
              : order.push(element);
          })
        );

        if (!order || order == "" || order == null) {
          return res.json({
            success: false,
            message: "Lỗi...Không tìm thấy đơn hàng.",
          });
        }
        return res.json({
          success: true,
          TransInvoicesDetail: order,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getOrderDeliveringOfCustomer: async function (req, res) {
    try {
      const customerId = req.query.customerId;
      const status = req.query.status;

      if (!customerId) {
        return res.json({
          success: false,
          message: "customerId is not defined. Please check out again.",
        });
      }

      if (!status) {
        return res.json({
          success: false,
          message: "Status is not defined. Please check out again.",
        });
      }

      const checkOrder = await OrderGas.find({
        isDeleted: { "!=": true },
        customerId: customerId,
        isDeleted: false,
      });

      if (!checkOrder) {
        return res.json({
          success: false,
          message: "Không tìm thấy đơn hàng.",
        });
      } else {
        const order = [];
        const orderresult = [];
        let orderDetail = await Promise.all(
          checkOrder.map(async (element) => {
            return await TransInvoiceDetail.find({
              isDeleted: { "!=": true },
              orderGasId: element.id,
              status: status,
              // isDeleted: false
            }).populate("orderGasId");
          })
        );

        for (let i = 0; i < orderDetail.length; i++) {
          !orderDetail[i] || orderDetail[i] == "" || orderDetail[i] == null
            ? order
            : order.push(orderDetail[i]);
        }

        if (!order || order == "" || order == null) {
          return res.json({
            success: false,
            message: "Lỗi...Không tìm thấy đơn hàng.",
          });
        }

        const orderDetailInvoice = await Promise.all(
          order[0].map(async (element) => {
            return await TransInvoice.find({
              isDeleted: { "!=": true },
              _id: element.transInvoiceId,
            });
          })
        );

        const orderDetailCarrier = await Promise.all(
          orderDetailInvoice.map(async (element) => {
            return await Carrier.find({
              isDeleted: { "!=": true },
              _id: element[0].carrierId,
            });
          })
        );

        for (let i = 0; i < orderDetailCarrier.length; i++) {
          !orderDetailCarrier[i][0] ||
          orderDetailCarrier[i][0] == "" ||
          orderDetailCarrier[i][0] == null
            ? orderresult
            : orderresult.push(orderDetailCarrier[i][0]);
        }

        return res.json({
          success: true,
          TransInvoicesDetail: order,
          Carrier: orderresult,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  changeOrderStatus: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const orderStatus = {
        transInvoiceDetailId: req.body.transInvoiceDetailId,
        status: req.body.status,
      };

      if (!orderStatus.transInvoiceDetailId) {
        return res.json({
          success: false,
          message:
            "transInvoiceDetailId is not defined. Please check out again.",
        });
      }

      if (!orderStatus.status) {
        return res.json({
          success: false,
          message: "Status is not defined. Please check out again.",
        });
      }

      const changeOrderStatus = await TransInvoiceDetail.updateOne({
        isDeleted: { "!=": true },
        _id: orderStatus.transInvoiceDetailId,
        isDeleted: false,
      }).set({
        status: orderStatus.status,
      });

      if (
        !changeOrderStatus ||
        changeOrderStatus == "" ||
        changeOrderStatus == null
      ) {
        return res.json({
          success: false,
          message: "Đơn hàng không tồn tại.",
        });
      } else {
        if (changeOrderStatus.status === 2) {
          await OrderGas.updateOne({
            isDeleted: { "!=": true },
            _id: changeOrderStatus.orderGasId,
            isDeleted: false,
          }).set({
            status: "DELIVERING",
          });

          await TransInvoice.updateOne({
            isDeleted: { "!=": true },
            id: changeOrderStatus.transInvoiceId,
            isDeleted: false,
          }).set({
            status: 2,
          });
        }

        if (changeOrderStatus.status === 4) {
          await OrderGas.updateOne({
            isDeleted: { "!=": true },
            _id: changeOrderStatus.orderGasId,
            isDeleted: false,
          }).set({
            status: "DELIVERED",
          });

          const checkDelivered = await TransInvoiceDetail.find({
            isDeleted: { "!=": true },
            transInvoiceId: changeOrderStatus.transInvoiceId,
            isDeleted: false,
            status: [1, 2, 3],
          });

          if (checkDelivered.length === 0) {
            await TransInvoice.updateOne({
              isDeleted: { "!=": true },
              id: changeOrderStatus.transInvoiceId,
              isDeleted: false,
            }).set({
              status: 3,
            });
          }
        }

        if (changeOrderStatus.status === 6) {
          await OrderGas.updateOne({
            isDeleted: { "!=": true },
            _id: changeOrderStatus.orderGasId,
            isDeleted: false,
          }).set({
            status: "PROCESSING",
          });

          const checkDelivered = await TransInvoiceDetail.find({
            isDeleted: { "!=": true },
            transInvoiceId: changeOrderStatus.transInvoiceId,
            isDeleted: false,
            status: [1, 2, 3],
          });

          if (checkDelivered.length === 0) {
            await TransInvoice.updateOne({
              isDeleted: { "!=": true },
              id: changeOrderStatus.transInvoiceId,
              isDeleted: false,
            }).set({
              status: 3,
            });
          }
        }

        return res.json({
          success: true,
          OrderStatus: changeOrderStatus,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  //Lấy đơn đã giao thành công và đơn bị hủy của tài xế
  getTransInvoiceDetailStatus456OfCarrier: async function (req, res) {
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
      });
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
        let order = [];

        let orderDetail = await Promise.all(
          checkTransInvoice.map(async (element) => {
            return await TransInvoiceDetail.find({
              isDeleted: { "!=": true },
              transInvoiceId: element.id,
              status: [4, 5, 6],
              isDeleted: false,
            })
              .populate("transInvoiceId")
              .populate("orderGasId");
          })
        );

        await Promise.all(
          orderDetail.map(async (element) => {
            !element || element == "" || element == null
              ? order
              : order.push(element);
          })
        );

        if (!order || order == "" || order == null) {
          return res.json({
            success: false,
            message: "Lỗi...Không tìm thấy đơn hàng.",
          });
        }
        return res.json({
          success: true,
          TransInvoicesDetail: order,
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
