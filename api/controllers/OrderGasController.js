/**
 * OrderGasController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  createOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const order = {
        orderCode: req.body.OrderGas.orderCode,
        customerId: req.body.OrderGas.customerId,
        deliveryDate: req.body.OrderGas.deliveryDate,
        note: req.body.OrderGas.note,
        total: req.body.OrderGas.total,
        status: "INIT",
      };

      const product = await Promise.all(
        req.body.OrderGasDetail.map(async (element) => {
          return {
            cylinder: element.cylinder,
            quantity: element.quantity,
            price: element.price,
          };
        })
      );

      if (!order.orderCode) {
        return res.json({
          success: false,
          message: "orderCode is not defined. Please check out again.",
        });
      }

      if (!order.customerId) {
        return res.json({
          success: false,
          message: "customerId is not defined. Please check out again.",
        });
      }

      if (!order.deliveryDate) {
        return res.json({
          success: false,
          message: "deliveryDate is not defined. Please check out again.",
        });
      }

      if (!order.total || order.total === 0) {
        return res.json({
          success: false,
          message: "total is not defined. Please check out again.",
        });
      }

      const checkCustomer = await Customer.findOne({
        isDeleted: { "!=": true },
        _id: order.customerId,
      });

      if (!checkCustomer) {
        return res.json({
          success: false,
          message: "Khách hàng không tồn tại.",
        });
      }

      for (let i = 0; i < product.length; i++) {
        const checkCylinder = await CylinderGas.findOne({
          isDeleted: { "!=": true },
          _id: product[i].cylinder,
        });

        if (!checkCylinder) {
          return res.json({
            success: false,
            message: `Sản phẩm ${i + 1} không tồn tại.`,
          });
        }

        if (!product[i].quantity || product[i].quantity === 0) {
          return res.json({
            success: false,
            message: "quantity is not defined. Please check out again.",
          });
        }

        if (!product[i].price || product[i].price === 0) {
          return res.json({
            success: false,
            message: "price is not defined. Please check out again.",
          });
        }
      }

      const checkOrder = await OrderGas.findOne({
        isDeleted: { "!=": true },
        orderCode: order.orderCode,
      });

      if (checkOrder) {
        return res.json({
          success: false,
          message: "Mã đơn hàng đã tồn tại.",
        });
      }

      const newOrder = await OrderGas.create(order).fetch();

      if (!newOrder || newOrder == "" || newOrder == null) {
        return res.json({
          success: false,
          message: "Lỗi...Tạo đơn hàng không thành công.",
        });
      } else {
        for (let i = 0; i < product.length; i++) {
          const getCylinder = await CylinderGas.findOne({
            isDeleted: { "!=": true },
            _id: product[i].cylinder,
          });

          await OrderGasDetail.create({
            cylinder: product[i].cylinder,
            quantity: product[i].quantity,
            price: product[i].price,
            orderGasId: newOrder.id,
            serial: getCylinder.serial,
            img_url: getCylinder.img_url,
          }).fetch();
        }

        const listProduct = await OrderGasDetail.find({
          isDeleted: { "!=": true },
          orderGasId: newOrder.id,
        });

        return res.json({
          success: true,
          Order: newOrder,
          Product: listProduct,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getProductOfOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const order = {
        orderGasId: req.body.orderGasId,
      };

      if (!order.orderGasId) {
        return res.json({
          success: false,
          message: "orderGasId is not defined. Please check out again.",
        });
      }

      const checkOrder = await OrderGas.findOne({
        isDeleted: { "!=": true },
        _id: order.orderGasId,
      });

      if (!checkOrder) {
        return res.json({
          success: false,
          message: "Đơn hàng không tồn tại.",
        });
      }

      const product = await OrderGasDetail.find({
        isDeleted: { "!=": true },
        orderGasId: order.orderGasId,
      });

      if (!product || product == "" || product == null) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy sản phẩm thuộc đơn hàng.",
        });
      } else {
        return res.json({
          success: true,
          OrderGas: checkOrder,
          Product: product,
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
        orderGasId: req.body.orderGasId,
        status: req.body.status,
      };

      if (!orderStatus.orderGasId) {
        return res.json({
          success: false,
          message: "orderId is not defined. Please check out again.",
        });
      }

      if (!orderStatus.status) {
        return res.json({
          success: false,
          message: "orderStatus is not defined. Please check out again.",
        });
      }

      const checkOrder = await OrderGas.findOne({
        isDeleted: { "!=": true },
        _id: orderStatus.orderGasId,
      });

      if (!checkOrder) {
        return res.json({
          success: false,
          message: "Đơn hàng không tồn tại.",
        });
      }

      if (orderStatus.status === "CANCELLED") {
        const cancelOrder = await OrderGas.updateOne({
          isDeleted: { "!=": true },
          _id: orderStatus.orderGasId,
          isDeleted: false,
          status: "INIT",
        }).set({
          status: "CANCELLED",
          isDeleted: true,
          deletedAt: Date.now(),
        });

        if (!cancelOrder || cancelOrder == "" || cancelOrder == null) {
          return res.json({
            success: false,
            message: "Lỗi...Không thể hủy đơn hàng.",
          });
        } else {
          return res.json({
            success: true,
            OrderStatus: cancelOrder,
          });
        }
      } else {
        const changeOrderStatus = await OrderGas.updateOne({
          isDeleted: { "!=": true },
          _id: orderStatus.orderGasId,
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
            message: "Lỗi...Không thể thay đổi trạng thái đơn hàng.",
          });
        } else {
          return res.json({
            success: true,
            OrderStatus: changeOrderStatus,
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

  getOrderOfCustomer: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const customer = {
        customerId: req.body.customerId,
      };

      if (!customer.customerId) {
        return res.json({
          success: false,
          message: "customerId is not defined. Please check out again.",
        });
      }

      const checkCustomer = await Customer.findOne({
        isDeleted: { "!=": true },
        _id: customer.customerId,
      });

      if (!checkCustomer) {
        return res.json({
          success: false,
          message: "Khách hàng không tồn tại.",
        });
      }

      const orders = await OrderGas.find({
        isDeleted: { "!=": true },
        customerId: customer.customerId,
      });

      if (!orders || orders == "" || orders == null) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy đơn hàng.",
        });
      } else {
        return res.json({
          success: true,
          Orders: orders,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  destroyOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const orderGasId = req.body.orderGasId;

      if (!orderGasId) {
        return res.json({
          success: false,
          message: "orderGasId is not defined. Please check out again.",
        });
      }

      const checkStatus = await OrderGas.findOne({
        isDeleted: { "!=": true },
        _id: orderGasId,
      });

      if (checkStatus.status != "INIT") {
        return res.json({
          success: false,
          message: "Không thể hủy đơn hàng do trạng thái đơn hàng khác INIT.",
        });
      }

      await Promise.all([
        await OrderGas.destroyOne({
          _id: orderGasId,
        }),
        await OrderGasDetail.destroy({
          orderGasId: orderGasId,
        }),
      ])
        .then(function (data) {
          return res.json({
            success: true,
            message: "Đơn hàng đã được hủy thành công.",
          });
        })
        .catch(function (data) {
          return res.json({
            success: false,
            message: "Lỗi...Hủy đơn hàng không thành công.",
          });
        });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getOrderGasByCode: async function (req, res) {
    // if (!req.body) {
    //     return res.badRequest(Utils.jsonErr('Empty body'));
    // }

    try {
      const orderCode = req.query.orderCode;

      if (!orderCode) {
        return res.json({
          success: false,
          message: "orderCode is not defined. Please check out again.",
        });
      }

      // const checkTransInvoice = await TransInvoice.findOne({isDeleted: {"!=": true},
      //     _id: transInvoiceId,
      //     isDeleted: false
      // })
      // .populate('transInvoiceDetail');
      const orderGas = await OrderGas.find({
        isDeleted: { "!=": true },
        orderCode: orderCode,
        isDeleted: false,
      }).populate("customerId");

      if (!orderGas || orderGas == "" || orderGas == null) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy OrderGas.",
        });
      } else {
        return res.json({
          success: true,
          OrderGas: orderGas,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  searchOrderGas: async function (req, res) {
    try {
      const orderCode = req.query.orderCode ? req.query.orderCode : null;
      const name = req.query.name ? req.query.name : null;
      const dateStart = req.query.dateStart ? req.query.dateStart : null;
      const dateEnd = req.query.dateEnd ? req.query.dateEnd : null;

      //Tìm theo orderCode
      if (orderCode && name == null && dateStart == null && dateEnd == null) {
        const orderGas = await OrderGas.findOne({
          isDeleted: { "!=": true },
          orderCode: orderCode,
          isDeleted: false,
        }).populate("customerId");

        if (!orderGas || orderGas == "" || orderGas == null) {
          return res.json({
            success: false,
            message: "Không tìm thấy đơn hàng.",
          });
        } else {
          return res.json({
            success: true,
            OrderGas: orderGas,
          });
        }
      }

      //Tìm theo name
      if (orderCode == null && name && dateStart == null && dateEnd == null) {
        const customer = await Customer.find({
          isDeleted: { "!=": true },
          name: name,
          // isDeleted: false
        }).populate("orderGas");

        // const nameCustomer = await Promise.all(customer.map(async element =>{
        //     return await OrderGas.find({isDeleted: {"!=": true},
        //         customerId: element.customerId
        //     })
        //     .populate('customerId');
        // }))

        if (!customer || customer == "" || customer == null) {
          return res.json({
            success: false,
            message: "Không tìm thấy tên khách hàng.",
          });
        } else {
          let customerOrder = [];
          let order = [];

          for (let i = 0; i < customer.length; i++) {
            !customer[i].orderGas ||
            customer[i].orderGas == "" ||
            customer[i].orderGas == null
              ? customerOrder
              : customerOrder.push(customer[i]);
          }

          for (let i = 0; i < customerOrder.length; i++) {
            const _order = await OrderGas.find({
              isDeleted: { "!=": true },
              customerId: customerOrder[i].id,
              isDeleted: false,
            })
              .sort("createdAt DESC")
              .populate("customerId");

            await Promise.all(
              _order.map(async (element) => {
                order.push(element);
              })
            );
          }

          if (!order || order == "" || order == null) {
            return res.json({
              success: false,
              message: "Không tìm thấy đơn hàng.",
            });
          } else {
            return res.json({
              success: true,
              OrderGas: order,
            });
          }
        }
      }

      //Tìm theo ngày
      if (orderCode == null && name == null && dateStart && dateEnd) {
        const start = new Date(dateStart).valueOf();
        const end = new Date(dateEnd).valueOf();

        if (start > end) {
          return res.json({
            success: false,
            message: "Lỗi...Ngày bắt đầu không được nhỏ hơn ngày kết thúc.",
          });
        }

        const orderGas = await OrderGas.find({
          isDeleted: { "!=": true },
          isDeleted: false,
        })
          .sort("createdAt DESC")
          .populate("customerId");

        if (!orderGas || orderGas == "" || orderGas == null) {
          return res.json({
            success: false,
            message: "Không tìm thấy đơn hàng.",
          });
        } else {
          const order = [];

          for (let i = 0; i < orderGas.length; i++) {
            let checkDate = new Date(orderGas[i].createdAt).valueOf();

            checkDate >= start && checkDate <= end
              ? order.push(orderGas[i])
              : order;
          }

          if (!order || order == "" || order == null) {
            return res.json({
              success: false,
              message: "Không tìm thấy đơn hàng.",
            });
          } else {
            return res.json({
              success: true,
              OrderGas: order,
            });
          }
        }
      }

      //Tìm theo orderCode và ngày
      if (orderCode && name == null && dateStart && dateEnd) {
        const start = new Date(dateStart).valueOf();
        const end = new Date(dateEnd).valueOf();

        if (start > end) {
          return res.json({
            success: false,
            message: "Lỗi...Ngày bắt đầu không được nhỏ hơn ngày kết thúc.",
          });
        }

        const orderGas = await OrderGas.findOne({
          isDeleted: { "!=": true },
          orderCode: orderCode,
          isDeleted: false,
        })
          .sort("createdAt DESC")
          .populate("customerId");

        if (!orderGas || orderGas == "" || orderGas == null) {
          return res.json({
            success: false,
            message: "Không tìm thấy đơn hàng.",
          });
        } else {
          let checkDate = new Date(orderGas.createdAt).valueOf();

          if (checkDate >= start && checkDate <= end) {
            return res.json({
              success: true,
              OrderGas: orderGas,
            });
          } else {
            return res.json({
              success: false,
              message: "Không tìm thấy đơn hàng.",
            });
          }
        }
      }

      //Tìm theo name và ngày
      if (orderCode == null && name && dateStart && dateEnd) {
        const start = new Date(dateStart).valueOf();
        const end = new Date(dateEnd).valueOf();

        if (start > end) {
          return res.json({
            success: false,
            message: "Lỗi...Ngày bắt đầu không được nhỏ hơn ngày kết thúc.",
          });
        }

        const customer = await Customer.find({
          isDeleted: { "!=": true },
          name: name,
          // isDeleted: false
        }).populate("orderGas");

        if (!customer || customer == "" || customer == null) {
          return res.json({
            success: false,
            message: "Không tìm thấy tên khách hàng.",
          });
        } else {
          let customerOrder = [];
          let order = [];
          let listOrder = [];

          for (let i = 0; i < customer.length; i++) {
            !customer[i].orderGas ||
            customer[i].orderGas == "" ||
            customer[i].orderGas == null
              ? customerOrder
              : customerOrder.push(customer[i]);
          }

          for (let i = 0; i < customerOrder.length; i++) {
            const _order = await OrderGas.find({
              isDeleted: { "!=": true },
              customerId: customerOrder[i].id,
              isDeleted: false,
            })
              .sort("createdAt DESC")
              .populate("customerId");

            await Promise.all(
              _order.map(async (element) => {
                order.push(element);
              })
            );
          }

          for (let i = 0; i < order.length; i++) {
            let checkDate = new Date(order[i].createdAt).valueOf();
            checkDate >= start && checkDate <= end
              ? listOrder.push(order[i])
              : listOrder;
          }

          if (!listOrder || listOrder == "" || listOrder == null) {
            return res.json({
              success: false,
              message: "Không tìm thấy đơn hàng.",
            });
          } else {
            return res.json({
              success: true,
              OrderGas: listOrder,
            });
          }
        }
      }

      //Lấy hết
      if (
        orderCode == null &&
        name == null &&
        dateStart == null &&
        dateEnd == null
      ) {
        const orderGas = await OrderGas.find({
          isDeleted: { "!=": true },
          isDeleted: false,
        })
          .sort("createdAt DESC")
          .populate("customerId");

        if (!orderGas || orderGas == "" || orderGas == null) {
          return res.json({
            success: false,
            message: "Không tìm thấy đơn hàng.",
          });
        } else {
          return res.json({
            success: true,
            OrderGas: orderGas,
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

  // Lấy tất cả đơn hàng
  getAllOrderGas: async function (req, res) {
    try {
      const checkOrderGas = await OrderGas.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      }).populate("customerId");
      // .sort('createdAt DESC');

      if (!checkOrderGas || checkOrderGas == "" || checkOrderGas == null) {
        return res.json({
          success: false,
          message: "Không tìm thấy đơn hàng nào.",
        });
      } else {
        return res.json({
          success: true,
          OrderGas: checkOrderGas,
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
