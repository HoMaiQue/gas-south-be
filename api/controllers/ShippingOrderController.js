/**
 * ShippingOrderController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

//
module.exports = {
  createShippingOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const order = {
        status: 1,
        driverId: req.body.ShippingOrder.driverId
          ? req.body.ShippingOrder.driverId
          : null,
        nameDriver: req.body.ShippingOrder.nameDriver.trim(),
        licensePlate: req.body.ShippingOrder.licensePlate.trim(),
        deliveryDate: req.body.ShippingOrder.deliveryDate.trim(),
        deliveryHours: req.body.ShippingOrder.deliveryHours.trim(),
        createdBy: req.body.ShippingOrder.createdBy,
        updatedBy: req.body.ShippingOrder.createdBy,
        note: req.body.ShippingOrder.note,
        //provinceId: req.body.ShippingOrder.provinceId ? req.body.ShippingOrder.provinceId : null,
        numbercylinder: req.body.ShippingTextDetail
          ? req.body.ShippingTextDetail.length
          : 0,
      };

      const orderDetail = await Promise.all(
        req.body.ShippingOrderDetail.map(async (element) => {
          return {
            orderId: element.orderId,
            createdBy: element.createdBy,
            provinceId: element.provinceId,
          };
        })
      );

      const customerDetail = await Promise.all(
        req.body.ShippingCustomerDetail.map(async (element) => {
          return {
            customerId: element.customerId,
            numberCylinder: element.numberCylinder,
            createdBy: element.createdBy,
          };
        })
      );

      const textDetail = await Promise.all(
        req.body.ShippingTextDetail.map(async (element) => {
          return {
            serial: element.serial,
            fileName: element.fileName,
            createdBy: element.createdBy,
          };
        })
      );

      if (order.driverId) {
        const checkDriver = await User.findOne({
          isDeleted: { "!=": true },
          _id: order.driverId,
          userRole: "Deliver",
        });

        if (!checkDriver) {
          return res.json({
            success: false,
            message: "Mã tài xế không tồn tại.",
          });
        }
      }

      if (!order.nameDriver) {
        return res.json({
          success: false,
          message: "nameDriver is not defined. Please check out again.",
        });
      }

      if (!order.licensePlate) {
        return res.json({
          success: false,
          message: "licensePlate is not defined. Please check out again.",
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

      if (!order.createdBy) {
        return res.json({
          success: false,
          message: "createdBy is not defined. Please check out again.",
        });
      } else {
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

        // const _checkOrder = await ShippingOrderDetail.findOne({isDeleted: {"!=": true},
        //     orderId: orderDetail[i].orderId,
        //     isDeleted: false
        // });

        // if (_checkOrder) {
        //     return res.json({
        //         success: false,
        //         message: 'Đơn hàng này đã thuộc ShippingOrder khác.'
        //     });
        // }

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

        // const _checkCustomer = await ShippingCustomerDetail.findOne({isDeleted: {"!=": true},
        //     customerId: customerDetail[i].customerId,
        //     isDeleted: false
        // });

        // if (_checkCustomer) {
        //     return res.json({
        //         success: false,
        //         message: 'Khách hàng này đã thuộc ShippingOrder khác.'
        //     });
        // }

        if (
          !customerDetail[i].numberCylinder ||
          customerDetail[i].numberCylinder === 0
        ) {
          return res.json({
            success: false,
            message: "numberCylinder is not defined. Please check out again.",
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

      for (let i = 0; i < textDetail.length; i++) {
        for (let j = i + 1; j < textDetail.length; j++) {
          if (textDetail[i].serial === textDetail[j].serial) {
            return res.json({
              success: false,
              message: "Mã bình bị trùng.",
            });
          }
        }

        const checkCylinders = await Cylinder.findOne({
          isDeleted: { "!=": true },
          serial: textDetail[i].serial,
        });

        if (!checkCylinders) {
          return res.json({
            success: false,
            message: "Sản phẩm không tồn tại.",
          });
        }

        // const _checkCylinders = await ShippingTextDetail.findOne({isDeleted: {"!=": true},
        //     serial: textDetail[i].serial,
        //     isDeleted: false
        // });

        // if (_checkCylinders) {
        //     return res.json({
        //         success: false,
        //         message: 'Sản phẩm này đã thuộc ShippingOrder khác.'
        //     });
        // }

        if (!textDetail[i].fileName) {
          return res.json({
            success: false,
            message: "fileName is not defined. Please check out again.",
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

      const newOrder = await ShippingOrder.create(order).fetch();

      if (!newOrder || newOrder == "" || newOrder == null) {
        return res.json({
          success: false,
          message: "Lỗi...Tạo đơn đặt tài xế không thành công.",
        });
      } else {
        for (let i = 0; i < orderDetail.length; i++) {
          await ShippingOrderDetail.create({
            orderId: orderDetail[i].orderId,
            createdBy: orderDetail[i].createdBy,
            provinceId: orderDetail[i].provinceId,
            shippingOrderId: newOrder.id,
          }).fetch();
        }

        const listOrderDetail = await ShippingOrderDetail.find({
          isDeleted: { "!=": true },
          shippingOrderId: newOrder.id,
          isDeleted: false,
        });

        for (let i = 0; i < customerDetail.length; i++) {
          await ShippingCustomerDetail.create({
            customerId: customerDetail[i].customerId,
            numberCylinder: customerDetail[i].numberCylinder,
            createdBy: customerDetail[i].createdBy,
            shippingOrderId: newOrder.id,
          }).fetch();
        }

        const listCustomerDetail = await ShippingCustomerDetail.find({
          isDeleted: { "!=": true },
          shippingOrderId: newOrder.id,
          isDeleted: false,
        });

        for (let i = 0; i < textDetail.length; i++) {
          const getCylinder = await Cylinder.findOne({
            isDeleted: { "!=": true },
            serial: textDetail[i].serial,
          });

          await ShippingTextDetail.create({
            serial: textDetail[i].serial,
            fileName: textDetail[i].fileName,
            createdBy: textDetail[i].createdBy,
            shippingOrderId: newOrder.id,
            cylinders: getCylinder.id,
          }).fetch();
        }

        const listTextDetail = await ShippingTextDetail.find({
          isDeleted: { "!=": true },
          shippingOrderId: newOrder.id,
          isDeleted: false,
        });

        return res.json({
          success: true,
          ShippingOrder: newOrder,
          ShippingOrderDetail: listOrderDetail,
          ShippingCustomerDetail: listCustomerDetail,
          ShippingTextDetail: listTextDetail,
          NumberCylinder: textDetail.length,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getShippingOrderById: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const shippingorderId = req.body.shippingorderId;

      if (!shippingorderId) {
        return res.json({
          success: false,
          message: "shippingorderId is not defined. Please check out again.",
        });
      }

      const checkShippingOrder = await ShippingOrder.find({
        isDeleted: { "!=": true },
        _id: shippingorderId,
        isDeleted: false,
      });
      //   .populate('shippingOrderDetail')
      //   .populate('shippingCustomerDetail')
      //   .populate('shippingTextDetail');

      if (
        !checkShippingOrder ||
        checkShippingOrder == "" ||
        checkShippingOrder == null
      ) {
        return res.json({
          success: false,
          message: "Mã đơn tài xế không tồn tại.",
        });
      } else {
        let orderDetail = await Promise.all(
          checkShippingOrder.map(async (element) => {
            return await ShippingOrderDetail.find({
              isDeleted: { "!=": true },
              //id: element.shippingOrderDetail.orderId,
              shippingOrderId: shippingorderId,
              isDeleted: false,
            }).populate("orderId");
          })
        );
        await Promise.all(
          orderDetail.map(async (element, index) => {
            await Promise.all(
              element.map(async (_element, _index) => {
                if (_element.orderId) {
                  let userkh = await User.findOne({
                    isDeleted: { "!=": true },
                    id: _element.orderId.customerId,
                  });

                  orderDetail[index][_index].namekh = userkh ? userkh.name : "";
                }
              })
            );
          })
        );

        let customerDetail = await Promise.all(
          checkShippingOrder.map(async (element) => {
            return await ShippingCustomerDetail.find({
              isDeleted: { "!=": true },
              //id: element.shippingCustomerDetail.customerId,
              shippingOrderId: shippingorderId,
              isDeleted: false,
            }).populate("customerId");
          })
        );

        await Promise.all(
          customerDetail.map(async (element, index) => {
            await Promise.all(
              element.map(async (_element, _index) => {
                if (_element.customerId.isChildOf) {
                  let userkh = await User.findOne({
                    isDeleted: { "!=": true },
                    id: _element.customerId.isChildOf,
                  });

                  customerDetail[index][_index].namekh = userkh
                    ? userkh.name
                    : "";
                  if (
                    _element.customerId.customerType == "Distribution_Agency"
                  ) {
                    customerDetail[index][_index].customerTypekh =
                      _element.customerId.customerType;
                  } else {
                    customerDetail[index][_index].customerTypekh = userkh
                      ? userkh.customerType
                      : "";
                  }
                } else {
                  customerDetail[index][_index].customerTypekh =
                    _element.customerId.customerType;
                }
              })
            );
          })
        );

        const textDetail = await Promise.all(
          checkShippingOrder.map(async (element) => {
            return await ShippingTextDetail.find({
              isDeleted: { "!=": true },
              //id: element.shippingTextDetail.cylinders,
              shippingOrderId: shippingorderId,
              isDeleted: false,
            });
          })
        );

        //   const shippingOrder = await ShippingOrder.findOne({isDeleted: {"!=": true},
        //       _id: shippingorderId,
        //       isDeleted: false
        //   })

        return res.json({
          success: true,
          ShippingOrder: checkShippingOrder,
          shippingOrderDetail: orderDetail,
          ShippingCustomerDetail: customerDetail,
          shippingTextDetail: textDetail,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  ///hhhhoa

  getAllShippingOrder: async function (req, res) {
    try {
      const userId = req.query.userId;

      if (!userId) {
        return res.json({
          success: false,
          message: "userId is not defined. Please check out again.",
        });
      } else {
        const checkShippingOrder = await ShippingOrder.find({
          isDeleted: { "!=": true },
          createdBy: userId,
          isDeleted: false,
        }).sort("createdAt DESC");

        if (
          !checkShippingOrder ||
          checkShippingOrder == "" ||
          checkShippingOrder == null
        ) {
          return res.json({
            success: false,
            message: "Không tìm thấy đơn vận chuyển nào.",
          });
        } else {
          return res.json({
            success: true,
            ShippingOrder: checkShippingOrder,
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

  getShippingOrderByDriver: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const shippingorder = {
        nameDriver: req.body.nameDriver.trim(),
        licensePlate: req.body.licensePlate.trim(),
      };

      if (!shippingorder.nameDriver) {
        return res.json({
          success: false,
          message: "nameDriver is not defined. Please check out again.",
        });
      }

      if (!shippingorder.licensePlate) {
        return res.json({
          success: false,
          message: "licensePlate is not defined. Please check out again.",
        });
      }

      const checkShippingOrder = await ShippingOrder.find({
        isDeleted: { "!=": true },
        nameDriver: shippingorder.nameDriver,
        licensePlate: shippingorder.licensePlate,
        isDeleted: false,
      });

      if (
        !checkShippingOrder ||
        checkShippingOrder == "" ||
        checkShippingOrder == null
      ) {
        return res.json({
          success: false,
          message: "Mã đơn tài xế không tồn tại.",
        });
      } else {
        return res.json({
          success: true,
          ShippingOrder: checkShippingOrder,
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
  updateShippingOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const update = {
        shippingorderId: req.body.shippingorderId,
        driverId: req.body.driverId,
        nameDriver: req.body.nameDriver,
        licensePlate: req.body.licensePlate,
        status: req.body.status,
        updatedBy: req.body.updatedBy ? req.body.updatedBy : null,
      };

      if (update.driverId && update.driverId != null) {
        const checkDriver = await User.findOne({
          isDeleted: { "!=": true },
          _id: update.driverId,
          userRole: "Deliver",
        });

        if (!checkDriver) {
          return res.json({
            success: false,
            message: "Mã tài xế không tồn tại.",
          });
        }
      }

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

      const newShippingOrder = await ShippingOrder.updateOne({
        isDeleted: { "!=": true },
        _id: update.shippingorderId,
        isDeleted: false,
      }).set({
        driverId: update.driverId,
        nameDriver: update.nameDriver,
        licensePlate: update.licensePlate,
        status: update.status,
        updatedBy: update.updatedBy,
        updatedAt: Date.now(),
      });

      if (
        !newShippingOrder ||
        newShippingOrder == "" ||
        newShippingOrder == null
      ) {
        return res.json({
          success: false,
          message: "Lỗi...ShippingOrder không tồn tại.",
        });
      } else {
        if (newShippingOrder.status === 2) {
          const orderShippingStatus = await ShippingOrderDetail.find({
            isDeleted: { "!=": true },
            shippingOrderId: update.shippingorderId,
            isDeleted: false,
          });

          await Promise.all(
            orderShippingStatus.map(async (element) => {
              await OrderShipping.updateOne({
                isDeleted: { "!=": true },
                _id: element.orderId,
                isDeleted: false,
              }).set({
                status: "PROCESSING",
              });
            })
          );
        }

        return res.json({
          success: true,
          message: "Cập nhật đơn hàng thành công.",
          ShippingOrder: newShippingOrder,
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
  cancelShippingOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const update = {
        shippingorderId: req.body.shippingorderId.trim(),
        deletedBy: req.userInfor.id,
      };

      if (!update.shippingorderId) {
        return res.json({
          success: false,
          message: "shippingorderId không xác định.",
        });
      }

      const shippingOrder = await ShippingOrder.findOne({
        isDeleted: { "!=": true },
        _id: shippingorderId,
        isDeleted: false,
      });

      if (!shippingOrder || shippingOrder == "" || shippingOrder == null) {
        return res.json({
          success: false,
          message: "ShippingOrder không tồn tại.",
        });
      } else {
        // if (shippingOrder.status != 1) {
        //     return res.json({
        //         success: false,
        //         message: 'Không thể hủy đơn hàng nếu đơn hàng không ở trạng thái là 1.'
        //     });
        // }

        const newShippingOrder = await ShippingOrder.updateOne({
          isDeleted: { "!=": true },
          _id: update.shippingorderId,
          isDeleted: false,
        }).set({
          status: 4,
        });

        return res.json({
          success: true,
          message: "shipping Order đã được hủy.",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // cập nhật note
  updateNote: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const update = {
        shippingOrderId: req.body.shippingOrderId.trim(),
        note: req.body.note.trim(),
      };

      if (!update.shippingOrderId) {
        return res.json({
          success: false,
          message: "shippingOrderId is not defined. Please check out again.",
        });
      }

      if (!update.note) {
        return res.json({
          success: false,
          message: "note is not defined. Please check out again.",
        });
      }

      const updateNote = await ShippingOrder.updateOne({
        isDeleted: { "!=": true },
        _id: update.shippingOrderId,
        isDeleted: false,
      }).set({
        note: update.note,
      });

      if (!updateNote || updateNote == "" || updateNote == null) {
        return res.json({
          success: false,
          message: "Lỗi...ShippingOrder không tồn tại.",
        });
      } else {
        return res.json({
          success: true,
          ShippingOrder: updateNote,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Lấy tất cả đơn hàng trạng thái 1 của tài xế
  getAllShippingOrderINIT: async function (req, res) {
    try {
      const userId = req.query.userId;

      if (!userId) {
        return res.json({
          success: false,
          message: "userId không xác định.",
        });
      } else {
        const checkShippingOrder = await ShippingOrder.find({
          isDeleted: { "!=": true },
          driverId: userId,
          isDeleted: false,
          // status: 1
        }).sort("deliveryDate DESC");

        if (
          !checkShippingOrder ||
          checkShippingOrder == "" ||
          checkShippingOrder == null
        ) {
          return res.json({
            success: false,
            message: "Không tìm thấy đơn vận chuyển nào.",
          });
        } else {
          return res.json({
            success: true,
            ShippingOrder: checkShippingOrder,
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
};
