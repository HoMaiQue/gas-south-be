// const { json } = require('body-parser');
/**
 * OrderShippingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const moment = require("moment");
const { forEach } = require("async");

module.exports = {
  // Lấy chi tiết đơn hàng bằng ID
  getOrderDetailById: async function (req, res) {
    if (!req.query) {
      return res.badRequest(Utils.jsonErr("Empty query"));
    }
    const { id } = req.query;
    if (!id) {
      return res.json({
        success: false,
        message: "ID order không có",
      });
    }
    let order = null;
    try {
      order = await OrderShipping.findOne({ isDeleted: { "!=": true }, id });
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
    return res.json({
      success: true,
      order,
      message: "Lấy thông tin chi tiết đơn hàng thành công",
    });
  },
  // Lấy đơn của Bình Khí
  getOrdersOfGasTank: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { warehouseId, type } = req.body;

    if (!warehouseId) {
      return res.json({
        success: false,
        message: "Truyền thiếu thông tin để tìm kiếm",
      });
    }

    try {
      const checkUser = await User.findOne({
        isDeleted: { "!=": true },
        _id: warehouseId,
      });

      if (type === "V") {
        if (
          checkUser.userType === "Fixer" &&
          checkUser.userRole === "SuperAdmin"
        ) {
          const order = await OrderShipping.find({
            isDeleted: { "!=": true },
            warehouseId: warehouseId,
            status: "CONFIRMED",
            type: type,
          })
            .populate("customerId")
            .populate("agencyId")
            .populate("createdBy")
            .sort("createdAt DESC");

          if (order.length > 0) {
            return res.json({
              success: true,
              order: order,
              message: "Lấy thông tin đơn hàng thành công",
            });
          } else {
            return res.json({
              success: false,
              message: "Không có đơn hàng nào",
            });
          }
        }

        if (
          checkUser.userType === "Factory" &&
          checkUser.userRole === "Owner"
        ) {
          const order = await OrderShipping.find({
            isDeleted: { "!=": true },
            createdBy: warehouseId,
            type: type,
          })
            .populate("customerId")
            .populate("agencyId")
            .populate("warehouseId")
            .sort("createdAt DESC");

          if (order.length > 0) {
            return res.json({
              success: true,
              order: order,
              message: "Lấy thông tin đơn hàng thành công",
            });
          } else {
            return res.json({
              success: false,
              message: "Không có đơn hàng nào",
            });
          }
        }

        if (
          checkUser.userType === "Region" &&
          checkUser.userRole === "SuperAdmin"
        ) {
          const order = await OrderShipping.find({
            isDeleted: { "!=": true },
            warehouseId: warehouseId,
            type: type,
          })
            .populate("customerId")
            .populate("agencyId")
            .populate("createdBy")
            .sort("createdAt DESC");

          if (order.length > 0) {
            return res.json({
              success: true,
              order: order,
              message: "Lấy thông tin đơn hàng thành công",
            });
          } else {
            return res.json({
              success: false,
              message: "Không có đơn hàng nào",
            });
          }
        }
      }
      if (type === "B") {
        if (
          checkUser.userType === "Factory" &&
          checkUser.userRole === "Owner"
        ) {
          const order = await OrderShipping.find({
            isDeleted: { "!=": true },
            createdBy: warehouseId,
            type: type,
          })
            .populate("customerId")
            .populate("agencyId")
            .populate("warehouseId")
            .sort("createdAt DESC");

          const _order = await OrderShipping.find({
            isDeleted: { "!=": true },
            warehouseId: warehouseId,
            type: type,
          })
            .populate("customerId")
            .populate("agencyId")
            .populate("createdBy")
            .sort("createdAt DESC");

          // forEach(order, element => {
          //     !element || element === null || element === ''
          //     ? _result : _result.push(element)
          // })

          if (order.length > 0) {
            return res.json({
              success: true,
              order_createdBy: order,
              order_warehouse: _order,
              message: "Lấy thông tin đơn hàng thành công",
            });
          } else {
            return res.json({
              success: false,
              message: "Không có đơn hàng nào",
            });
          }
        }

        if (
          checkUser.userType === "Region" &&
          checkUser.userRole === "SuperAdmin"
        ) {
          const order = await OrderShipping.find({
            isDeleted: { "!=": true },
            createdBy: warehouseId,
            type: type,
          })
            .populate("customerId")
            .populate("warehouseId")
            .populate("agencyId")
            .populate("cancelledBy")
            .sort("createdAt DESC");

          // const _order = await OrderShipping.find({isDeleted: {"!=": true},
          //     warehouseId: warehouseId,
          //     type: type
          // }).populate('customerId').populate('agencyId').populate('createdBy')
          //     .sort('createdAt DESC');
          const _orderResult = [];

          forEach(order, (element) => {
            if (element.cancelledBy) {
              element.status === "CANCELLED" &&
              element.cancelledBy.userType === "Factory" &&
              element.cancelledBy.userRole === "Owner"
                ? _orderResult
                : _orderResult.push(element);
            } else {
              _orderResult.push(element);
            }
          });

          if (_orderResult.length > 0) {
            return res.json({
              success: true,
              order_createdBy: _orderResult,
              order_warehouse: [],
              message: "Lấy thông tin đơn hàng thành công",
            });
          } else {
            return res.json({
              success: false,
              message: "Không có đơn hàng nào",
            });
          }
        }
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },

  // Lấy lý do hủy đơn
  getHistoryNote: async function (req, res) {
    try {
      const orderShippingId = req.query.orderShippingId;

      const checkOrder = await OrderShipping.findOne({
        isDeleted: { "!=": true },
        id: orderShippingId,
        isDeleted: false,
      });

      if (!checkOrder) {
        return res.json({
          status: false,
          message: "ID đơn hàng không đúng.",
        });
      } else {
        const _historyNote = await HistoryNoteOrderShipping.findOne({
          isDeleted: { "!=": true },
          historyNoteOrder: orderShippingId,
          status: "CANCELLED",
        });

        if (!_historyNote || _historyNote === "" || _historyNote === null) {
          return res.json({
            status: false,
            message: "Không tìm thấy thông tin hủy đơn.",
          });
        } else {
          return res.json({
            status: true,
            message: "Lấy bản ghi thành công.",
            HistoryNote: _historyNote,
          });
        }
      }
    } catch (error) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  // Đổi trạng thái đơn tạo kèm bản ghi thông báo
  changeStatus: async function (req, res) {
    try {
      const order = {
        status: req.body.status,
        note: req.body.note,
        user: req.body.user,
      };

      if (order.status === "CANCELLED") {
        order.cancelledBy = req.body.user;
      }
      let listOrder = await Promise.all(
        req.body.orderShipping.map(async (element) => {
          return {
            orderShippingId: element.orderShippingId,
          };
        })
      );

      for (let i = 0; i < listOrder.length; i++) {
        let data = await OrderShipping.updateOne({
          isDeleted: { "!=": true },
          id: listOrder[i].orderShippingId,
        }).set({
          status: order.status,
          note: order.note,
          cancelledBy: order.cancelledBy,
        });
        if (!data || !data === "") {
          return res.json({
            status: false,
            message: "lỗi ko cập nhật được trạng thái",
          });
        } else if (order.note) {
          await HistoryNoteOrderShipping.create({
            historyNoteOrder: listOrder[i].orderShippingId,
            note: order.note,
            user: order.user,
            status: order.status,
          }).fetch();
        }
      }
      return res.json({
        status: true,
        message: "cập nhật thành công",
      });
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  // Lấy đơn hàng phân quyền theo tài khoản [mẹ, chi nhánh, trạm]
  getOrderShippingOfFactory: async function (req, res) {
    const { factoryId, type } = req.query;

    try {
      const checkUser = await User.findOne({
        isDeleted: { "!=": true },
        _id: factoryId,
        // isDeleted: false,
      });
      const _result = [];

      if (type === "V") {
        // Trường hợp tài khoản mẹ
        if (
          checkUser.userType === "Factory" &&
          checkUser.userRole === "SuperAdmin"
        ) {
          // Tìm parentRoot
          // const parent = await getRootParent(objectId)

          const parent = checkUser.id;

          const _regions = await User.find({
            isDeleted: { "!=": true },
            isChildOf: parent,
            // owner: id,
            // stationType,
            userType: "Region",
            userRole: "SuperAdmin",
            // isDeleted: false,
          });

          await Promise.all(
            _regions.map(async (region) => {
              const _factory = await User.find({
                isDeleted: { "!=": true },
                isChildOf: region.id,
                // owner: id,
                // stationType,
                userType: "Factory",
                userRole: "Owner",
                // isDeleted: false,
              }).populate("isChildOf");

              forEach(_factory, (element) => {
                !element || element === null || element === ""
                  ? _result
                  : _result.push(element);
              });
            })
          );
        }

        // Trường hợp tài khoản chi nhánh
        if (
          checkUser.userType === "Region" &&
          checkUser.userRole === "SuperAdmin"
        ) {
          // _result.push(checkUser)

          const _factory = await User.find({
            isDeleted: { "!=": true },
            isChildOf: checkUser.id,
            // owner: id,
            // stationType,
            userType: "Factory",
            userRole: "Owner",
            // isDeleted: false,
          }).populate("isChildOf");

          forEach(_factory, (element) => {
            !element || element === null || element === ""
              ? _result
              : _result.push(element);
          });
        }

        // Trường hợp tài khoản trạm
        if (
          checkUser.userType === "Factory" &&
          checkUser.userRole === "Owner"
        ) {
          const _factory = await User.find({
            isDeleted: { "!=": true },
            _id: checkUser.id,
            // owner: id,
            // stationType,
            userType: "Factory",
            userRole: "Owner",
            isDeleted: false,
          }).populate("isChildOf");

          forEach(_factory, (element) => {
            !element || element === null || element === ""
              ? _result
              : _result.push(element);
          });
        }
      }

      if (type === "B") {
        // Trường hợp tài khoản mẹ
        if (
          checkUser.userType === "Factory" &&
          checkUser.userRole === "SuperAdmin"
        ) {
          // Tìm parentRoot
          // const parent = await getRootParent(objectId)

          const parent = checkUser.id;

          const _regions = await User.find({
            isDeleted: { "!=": true },
            isChildOf: parent,
            // owner: id,
            // stationType,
            userType: "Region",
            userRole: "SuperAdmin",
            // isDeleted: false,
          });

          await Promise.all(
            _regions.map(async (region) => {
              const _factory = await User.find({
                isDeleted: { "!=": true },
                isChildOf: region.id,
                // owner: id,
                // stationType,
                userType: "Factory",
                userRole: "Owner",
                // isDeleted: false,
              }).populate("isChildOf");

              forEach(_factory, (element) => {
                !element || element === null || element === ""
                  ? _result
                  : _result.push(element);
              });
            })
          );
        }

        // Trường hợp tài khoản chi nhánh
        if (
          checkUser.userType === "Region" &&
          checkUser.userRole === "SuperAdmin"
        ) {
          _result.push(checkUser);

          const _factory = await User.find({
            isDeleted: { "!=": true },
            isChildOf: checkUser.id,
            // owner: id,
            // stationType,
            userType: "Factory",
            userRole: "Owner",
            // isDeleted: false,
          }).populate("isChildOf");

          forEach(_factory, (element) => {
            !element || element === null || element === ""
              ? _result
              : _result.push(element);
          });
        }

        // Trường hợp tài khoản trạm
        if (
          checkUser.userType === "Factory" &&
          checkUser.userRole === "Owner"
        ) {
          const _factory = await User.find({
            isDeleted: { "!=": true },
            _id: checkUser.id,
            // owner: id,
            // stationType,
            userType: "Factory",
            userRole: "Owner",
            isDeleted: false,
          }).populate("isChildOf");

          forEach(_factory, (element) => {
            !element || element === null || element === ""
              ? _result
              : _result.push(element);
          });
        }
      }

      const _orderFactory = [];
      if (_result.length > 0) {
        await Promise.all(
          _result.map(async (factory) => {
            const orderFactory = await OrderShipping.find({
              isDeleted: { "!=": true },
              createdBy: factory.id,
              type: type,
            })
              .populate("customerId")
              .populate("warehouseId")
              .populate("createdBy")
              .populate("agencyId")
              .populate("cancelledBy")
              .sort("createdAt DESC");

            const _orderResult = [];
            if (type === "V") {
              if (
                checkUser.userType === "Region" &&
                checkUser.userRole === "SuperAdmin"
              ) {
                forEach(orderFactory, (element) => {
                  if (element.cancelledBy) {
                    element.status === "CANCELLED" &&
                    element.cancelledBy.userType === "Factory" &&
                    element.cancelledBy.userRole === "Owner"
                      ? _orderResult
                      : _orderResult.push(element);
                  } else {
                    _orderResult.push(element);
                  }
                });

                // sortOrder(_orderResult);

                const set = {
                  Factory_Name: factory.name,
                  Region_Name: factory.isChildOf.name,
                  Factoty_Orders: _orderResult,
                };

                _orderFactory.push(set);
              }

              if (
                checkUser.userType === "Factory" &&
                checkUser.userRole === "SuperAdmin"
              ) {
                forEach(orderFactory, (element) => {
                  if (element.cancelledBy) {
                    (element.status === "CANCELLED" &&
                      element.cancelledBy.userType === "Factory" &&
                      element.cancelledBy.userRole === "Owner") ||
                    (element.status === "CANCELLED" &&
                      element.cancelledBy.userType === "Region" &&
                      element.cancelledBy.userRole === "SuperAdmin")
                      ? _orderResult
                      : _orderResult.push(element);
                  } else {
                    _orderResult.push(element);
                  }
                });

                // sortOrder(_orderResult);

                const set = {
                  Factory_Name: factory.name,
                  Region_Name: factory.isChildOf.name,
                  Factoty_Orders: _orderResult,
                };

                _orderFactory.push(set);
              }

              if (
                checkUser.userType === "Factory" &&
                checkUser.userRole === "Owner"
              ) {
                const set = {
                  Factory_Name: factory.name,
                  Region_Name: factory.isChildOf.name,
                  Factoty_Orders: orderFactory,
                };

                _orderFactory.push(set);
              }
            }

            if (type === "B") {
              if (
                checkUser.userType === "Region" &&
                checkUser.userRole === "SuperAdmin"
              ) {
                forEach(orderFactory, (element) => {
                  if (element.cancelledBy) {
                    element.status === "CANCELLED" &&
                    element.cancelledBy.userType === "Factory" &&
                    element.cancelledBy.userRole === "Owner"
                      ? _orderResult
                      : _orderResult.push(element);
                  } else {
                    _orderResult.push(element);
                  }
                });

                // sortOrder(_orderResult);

                if (factory.id === factoryId) {
                  const set = {
                    Factory_Name: "",
                    Region_Name: factory.name,
                    Factoty_Orders: _orderResult,
                  };

                  _orderFactory.push(set);
                } else {
                  const set = {
                    Factory_Name: factory.name,
                    Region_Name: factory.isChildOf.name,
                    Factoty_Orders: _orderResult,
                  };

                  _orderFactory.push(set);
                }
              }

              if (
                checkUser.userType === "Factory" &&
                checkUser.userRole === "Owner"
              ) {
                if (factory.id === factoryId) {
                  const set = {
                    Factory_Name: "",
                    Region_Name: factory.name,
                    Factoty_Orders: orderFactory,
                  };

                  _orderFactory.push(set);
                } else {
                  const set = {
                    Factory_Name: factory.name,
                    Region_Name: factory.isChildOf.name,
                    Factoty_Orders: orderFactory,
                  };

                  _orderFactory.push(set);
                }
              }
            }

            // if(orderFactory.length > 0) {
            //     await Promise.all(orderFactory.map(async order => {
            //         _orderFactory.push(order);
            //     }))
            // }
          })
        );

        // sortOrder(_orderFactory);

        if (_orderFactory.length > 0) {
          return res.json({
            success: true,
            orderFactory: _orderFactory,
            message: "Lấy thông tin đơn hàng thành công",
          });
        } else {
          return res.json({ success: false, message: "Không có đơn hàng nào" });
        }
      } else {
        return res.json({
          success: false,
          message: "Không tìm thấy trạm nào.",
        });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },

  setOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      customerId,
      agencyId,
      warehouseId,
      orderCode,
      expected_DeliveryDate,
      expected_DeliveryTime,
      listCylinder,
      // {
      // cylinderType,
      // valve,
      // color,
      // numberCylinders
      // }
      note,
      type,
      reasonForCancellatic,
    } = req.body.createOrder;

    const { userId } = req.body;

    try {
      // let deliveryDate = expected_DeliveryDate.slice(0, 10) + 'T' + expected_DeliveryTime.slice(11)
      // expected_DeliveryDate : YYYY-MM-DD
      // expected_DeliveryTime : hh:mm
      let time = expected_DeliveryTime;

      if (
        !expected_DeliveryTime ||
        expected_DeliveryTime === "undefined" ||
        expected_DeliveryTime === "null"
      ) {
        time = "00:00";
      }

      const _time = expected_DeliveryDate + "" + time;
      const deliveryDate = moment(_time, "YYYY-MM-DD hh:mm").toISOString();

      const checkOrder = await OrderShipping.findOne({
        isDeleted: { "!=": true },
        orderCode: orderCode,
      });

      if (checkOrder) {
        return res.json({ success: false, message: "Trùng mã đơn hàng" });
      }

      const order = await OrderShipping.create({
        orderCode,
        customerId: customerId ? customerId : null,
        agencyId: agencyId ? agencyId : null,
        warehouseId,
        deliveryDate,
        listCylinder,
        note,
        createdBy: userId,
        status: "INIT",
        type,
        reasonForCancellatic,
      }).fetch();

      if (order) {
        const orderHistory = await OrderShippingHistory.create({
          order: order.id,
          status: order.status,
          content: "Tạo đơn hàng - Trên WEB",
          // detail: result.id,
          createdBy: order.createdBy,
        }).fetch();

        // const createdOrderHistory = await OrderHistory.create({
        //     order: orderId,
        //     status: 'DELIVERING',
        //     content: 'Xuất đơn hàng - Trên WEB, đang vận chuyển',
        //     detail: result.id,
        //     createdBy: userId,
        //   }).fetch()

        if (orderHistory) {
          const test1 = await OrderShipping.findOne({
            isDeleted: { "!=": true },
            id: order.id,
          });
          return res.json({
            success: true,
            data: orderHistory,
            message: "Ghi đơn hàng thành công",
          });
        } else {
          await OrderShipping.updateOne({
            isDeleted: { "!=": true },
            id: order.id,
          }).set({
            status: "ERROR",
          });
          return res.json({
            success: false,
            data: {},
            message: "Ghi đơn hàng thất bại",
          });
        }
      } else {
        return res.json({ success: false, message: "Ghi đơn hàng thất bại" });
      }
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  },

  getOrders: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { orderCreatedBy } = req.body;

    if (!orderCreatedBy) {
      return res.json({
        success: false,
        message: "Truyền thiếu thông tin để tìm kiếm",
      });
    }

    try {
      const order = await OrderShipping.find({
        isDeleted: { "!=": true },
        createdBy: orderCreatedBy,
      })
        .populate("customerId")
        .populate("agencyId")
        .populate("warehouseId")
        .sort("createdAt DESC");

      if (order.length > 0) {
        return res.json({
          success: true,
          order: order,
          message: "Lấy thông tin đơn hàng thành công",
        });
      } else {
        return res.json({ success: false, message: "Không có đơn hàng nào" });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },

  getOrdersOfFactory: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { factoryId } = req.body;

    try {
      const orderFactory = await OrderShipping.find({
        isDeleted: { "!=": true },
        warehouseId: factoryId,
      })
        .populate("createdBy")
        .populate("agencyId")
        .sort("createdAt DESC");

      if (orderFactory.length > 0) {
        return res.json({
          success: true,
          orderFactory: orderFactory,
          message: "Lấy thông tin đơn hàng thành công",
        });
      } else {
        return res.json({ success: false, message: "Không có đơn hàng nào" });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },

  getOrdersRelateToUser: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { userId } = req.body;

    try {
      const order = await OrderShipping.find({
        isDeleted: { "!=": true },
        or: [{ createdBy: userId }, { warehouseId: userId }],
      })
        .populate("createdBy")
        .populate("customerId")
        .populate("agencyId")
        .populate("warehouseId")
        .sort("createdAt DESC");

      if (order.length > 0) {
        return res.json({
          success: true,
          order: order,
          message: "Lấy thông tin đơn hàng thành công",
        });
      } else {
        return res.json({ success: false, message: "Không có đơn hàng nào" });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },

  changeOrderStatus: async function (req, res) {
    if (!req.body) {
      return res.json({
        status: false,
        resCode: "ERROR-00027",
        message: "Empty body",
      });
    }

    const {
      updatedBy,
      orderStatus,
      orderId,
      shippingOrderId,
      shippingOrderDetailId,
    } = req.body.updateOrderStatus;

    if (!updatedBy) {
      return res.json({
        status: false,
        resCode: "ERROR-00036",
        message: "Missing updatedBy",
      });
    } else {
      const userInfor = await User.findOne({
        isDeleted: { "!=": true },
        id: updatedBy,
      });
      if (!userInfor) {
        return res.json({
          status: false,
          resCode: "ERROR-00041",
          message: "User not found",
        });
      }
    }

    if (!orderStatus) {
      return res.json({
        status: false,
        resCode: "ERROR-00037",
        message: "Missing orderStatus",
      });
    }

    if (!orderId) {
      return res.json({
        status: false,
        resCode: "ERROR-00038",
        message: "Missing orderId",
      });
    }

    try {
      // Tìm thông tin đơn hàng
      const orderInfor = await OrderShipping.findOne({
        isDeleted: { "!=": true },
        id: orderId,
      });

      if (!orderInfor) {
        return res.json({
          status: false,
          resCode: "ERROR-00039",
          message: "Không tìm thấy thông tin đơn hàng",
        });
      }

      // Trường hợp ấn xác nhận đơn hàng - CONFIRMED
      if (orderStatus === "CONFIRMED") {
        if (orderInfor.status !== "INIT") {
          return res.json({
            status: false,
            resCode: "ERROR-00040",
            message:
              "Chỉ cho phép xác nhận những đơn hàng trong trạng thái khởi tạo",
          });
        } else {
          // Ghi vào chi tiết lịch sử đơn hàng
          const createdOrderHistory = await OrderShippingHistory.create({
            order: orderInfor.id,
            status: orderStatus,
            content: "Xác nhận đơn hàng",
            // detail: result.id,
            createdBy: updatedBy,
          }).fetch();

          if (!createdOrderHistory) {
            return res.json({
              status: false,
              resCode: "ERROR-00042",
              message: "Lỗi khi tạo bản ghi chi tiết lịch sử đơn hàng",
            });
          }

          // Cập nhật trạng thái đơn hàng
          const changeOrderStatus = await OrderShipping.updateOne({
            isDeleted: { "!=": true },
            id: orderId,
          }).set({
            updatedBy: updatedBy,
            status: orderStatus,
          });

          if (!changeOrderStatus) {
            return res.json({
              status: false,
              resCode: "ERROR-00043",
              message: "Lỗi khi cập nhật lại trạng thái đơn hàng",
            });
          } else {
            return res.json({
              status: true,
              resCode: "SUCCESS-00005",
              message: "Cập nhật trạng thái đơn hàng thành công",
            });
          }
        }
      }

      // Trường hủy đơn hàng - CANCELLED
      if (orderStatus === "CANCELLED") {
        const errStatus = ["COMPLETED", "CANCELLED", "ERROR", "REMOVE"];
        if (errStatus.includes(orderInfor.status)) {
          return res.json({
            status: false,
            resCode: "ERROR-00044",
            message: "Không thể hủy bỏ đơn với trạng thái hiện tại",
          });
        } else {
          // Ghi vào chi tiết lịch sử đơn hàng
          const createdOrderHistory = await OrderShippingHistory.create({
            order: orderInfor.id,
            status: orderStatus,
            content: "Hủy bỏ đơn hàng",
            // detail: result.id,
            createdBy: updatedBy,
          }).fetch();

          if (!createdOrderHistory) {
            return res.json({
              status: false,
              resCode: "ERROR-00045",
              message: "Lỗi khi tạo bản ghi chi tiết lịch sử đơn hàng",
            });
          }

          // Cập nhật trạng thái đơn hàng
          const changeOrderStatus = await OrderShipping.updateOne({
            isDeleted: { "!=": true },
            id: orderId,
          }).set({
            updatedBy: updatedBy,
            status: orderStatus,
          });

          if (!changeOrderStatus) {
            return res.json({
              status: false,
              resCode: "ERROR-00046",
              message: "Lỗi khi cập nhật lại trạng thái đơn hàng",
            });
          } else {
            return res.json({
              status: true,
              resCode: "SUCCESS-00005",
              message: "Cập nhật trạng thái đơn hàng thành công",
            });
          }
        }
      }

      // Trường hợp tài xế ấn xác nhận đã giao hàng  - DELIVERED
      if (orderStatus === "DELIVERED") {
        if (orderInfor.status !== "DELIVERING") {
          return res.json({
            status: false,
            resCode: "ERROR-00040",
            message:
              "Chỉ cho phép tài xế xác nhận những đơn hàng trong trạng thái đang vận chuyển",
          });
        } else {
          // Ghi vào chi tiết lịch sử đơn hàng
          const createdOrderHistory = await OrderShippingHistory.create({
            order: orderInfor.id,
            status: orderStatus,
            content: "Tài xế xác nhận đã giao đơn hàng",
            // detail: result.id,
            createdBy: updatedBy,
          }).fetch();

          if (!createdOrderHistory) {
            return res.json({
              status: false,
              resCode: "ERROR-00042",
              message: "Lỗi khi tạo bản ghi chi tiết lịch sử đơn hàng",
            });
          }

          // Cập nhật trạng thái đơn hàng
          const changeOrderStatus = await OrderShipping.updateOne({
            isDeleted: { "!=": true },
            id: orderId,
          }).set({
            updatedBy: updatedBy,
            status: orderStatus,
          });

          if (!changeOrderStatus) {
            return res.json({
              status: false,
              resCode: "ERROR-00043",
              message: "Lỗi khi cập nhật lại trạng thái đơn hàng",
            });
          } else {
            await ShippingOrderDetail.updateOne({
              isDeleted: { "!=": true },
              id: shippingOrderDetailId,
              isDeleted: false,
            }).set({
              status: "DELIVERED",
            });

            const checkDelivered = await ShippingOrderDetail.find({
              isDeleted: { "!=": true },
              shippingOrderId: shippingOrderId,
              isDeleted: false,
              status: ["PROCESSING", "DELIVERING"],
            });

            if (checkDelivered.length === 0) {
              await ShippingOrder.updateOne({
                isDeleted: { "!=": true },
                id: shippingOrderId,
                isDeleted: false,
              }).set({
                status: 3,
              });
            }

            return res.json({
              status: true,
              resCode: "SUCCESS-00005",
              message: "Cập nhật trạng thái đơn hàng thành công",
            });
          }
        }
      }

      // Trường hợp tài xế ấn hủy đơn hàng - (ShippingOrderDetai = CANCELLED) - (Order - chuyển về trạng thái PROCESSING)
      if (orderStatus === "PROCESSING") {
        const errStatus = ["COMPLETED", "CANCELLED"];
        if (errStatus.includes(orderInfor.status)) {
          return res.json({
            status: false,
            resCode: "ERROR-00044",
            message: "Không thể hủy bỏ đơn với trạng thái hiện tại",
          });
        } else {
          // Ghi vào chi tiết lịch sử đơn hàng
          const createdOrderHistory = await OrderShippingHistory.create({
            order: orderInfor.id,
            status: orderStatus,
            content: "Tài xế xác nhận hủy đơn hàng",
            // detail: result.id,
            createdBy: updatedBy,
          }).fetch();

          if (!createdOrderHistory) {
            return res.json({
              status: false,
              resCode: "ERROR-00042",
              message: "Lỗi khi tạo bản ghi chi tiết lịch sử đơn hàng",
            });
          }

          // Cập nhật trạng thái đơn hàng
          const changeOrderStatus = await OrderShipping.updateOne({
            isDeleted: { "!=": true },
            id: orderId,
          }).set({
            updatedBy: updatedBy,
            status: orderStatus,
          });

          if (!changeOrderStatus) {
            return res.json({
              status: false,
              resCode: "ERROR-00043",
              message: "Lỗi khi cập nhật lại trạng thái đơn hàng",
            });
          } else {
            await ShippingOrderDetail.updateOne({
              isDeleted: { "!=": true },
              id: shippingOrderDetailId,
              isDeleted: false,
            }).set({
              status: "CANCELLED",
            });

            const checkDelivered = await ShippingOrderDetail.find({
              isDeleted: { "!=": true },
              shippingOrderId: shippingOrderId,
              isDeleted: false,
              status: ["PROCESSING", "DELIVERING"],
            });

            if (checkDelivered.length === 0) {
              await ShippingOrder.updateOne({
                isDeleted: { "!=": true },
                id: shippingOrderId,
                isDeleted: false,
              }).set({
                status: 3,
              });
            }

            return res.json({
              status: true,
              resCode: "SUCCESS-00005",
              message: "Cập nhật trạng thái đơn hàng thành công",
            });
          }
        }
      }

      // Trường hợp tài xế ấn bắt đầu giao hàng  - DELIVERING
      if (orderStatus === "DELIVERING") {
        if (orderInfor.status !== "PROCESSING") {
          return res.json({
            status: false,
            resCode: "ERROR-00040",
            message:
              "Chỉ cho phép tài xế giao những đơn hàng đã được điều phối",
          });
        } else {
          // Ghi vào chi tiết lịch sử đơn hàng
          const createdOrderHistory = await OrderShippingHistory.create({
            order: orderInfor.id,
            status: orderStatus,
            content: "Tài xế xác nhận bắt đầu giao đơn hàng",
            // detail: result.id,
            createdBy: updatedBy,
          }).fetch();

          if (!createdOrderHistory) {
            return res.json({
              status: false,
              resCode: "ERROR-00042",
              message: "Lỗi khi tạo bản ghi chi tiết lịch sử đơn hàng",
            });
          }

          // Cập nhật trạng thái đơn hàng
          const changeOrderStatus = await OrderShipping.updateOne({
            isDeleted: { "!=": true },
            id: orderId,
          }).set({
            updatedBy: updatedBy,
            status: orderStatus,
          });

          if (!changeOrderStatus) {
            return res.json({
              status: false,
              resCode: "ERROR-00043",
              message: "Lỗi khi cập nhật lại trạng thái đơn hàng",
            });
          } else {
            await ShippingOrderDetail.updateOne({
              isDeleted: { "!=": true },
              id: shippingOrderDetailId,
              isDeleted: false,
            }).set({
              status: "DELIVERING",
            });

            return res.json({
              status: true,
              resCode: "SUCCESS-00005",
              message: "Cập nhật trạng thái đơn hàng thành công",
            });
          }
        }
      }
    } catch (error) {
      return res.json({
        status: false,
        resCode: "ERROR-90005",
        message: "Gặp lỗi khi cập nhật trạng thái đơn hàng",
        error: error.message,
      });
    }
  },

  getCylinderInformationForOrder: async function (req, res) {
    if (!req.body || req.body === {}) {
      return res.json({
        status: false,
        resCode: "ERROR-00027",
        message: "Empty body",
      });
    }

    const {
      userId,
      // orderId,
      // actionType,
      cylinderSerial,
    } = req.body;

    // const user = req.userInfo;
    // const actionType = req.body.action_type;
    // const parentRoot = req.body.parent_root;
    // const cylinderSerial = req.body.cylinder_serials;
    // let credential = {};

    if (!userId) {
      return res.json({
        status: false,
        resCode: "ERROR-00001",
        message: "Missing userId",
      });
    }

    // if (!orderId) {
    //     res.json({ status: false, resCode: 'ERROR-00002', message: 'Missing orderId' });
    // }

    // if (!actionType) {
    //     res.json({ status: false, resCode: 'ERROR-00003', message: 'Missing actionType' });
    // }

    if (!cylinderSerial || !Array.isArray(cylinderSerial)) {
      return res.json({
        status: false,
        resCode: "ERROR-00004",
        message: "Missing cylinderSerial",
      });
    }

    if (cylinderSerial.length === 0) {
      return res.json({
        status: false,
        resCode: "ERROR-00005",
        message: "Empty cylinderSerial",
      });
    }

    // if (!cylinderSerial || cylinderSerial.length === 0) { return res.ok(Utils.jsonErr('Empty request cylinder_serials, cylinder_serials must be id array')); }

    // credential.serial = cylinderSerial;
    // //credential.factory = parentRoot;

    try {
      // Kiểm tra những mã bình request không nằm trong hệ thống
      let credential = {};
      credential.serial = cylinderSerial;

      cylinders = await Cylinder.find(credential);

      if (!cylinders || cylinders.length === 0) {
        return res.json({
          status: false,
          resCode: "ERROR-00010",
          message: `Không tìm thấy mã nào trong hệ thống`,
          listErrCylinder: cylinderSerial,
        });
      }

      const listSerials = getArrayOfSerials(cylinders);

      const serialNotInSystemTree = _.difference(cylinderSerial, listSerials);
      if (serialNotInSystemTree.length > 0) {
        return res.json({
          status: false,
          resCode: "ERROR-00006",
          message: `Những mã này không nằm trong hệ thống của bạn: ${serialNotInSystemTree.join(
            ", "
          )}`,
          listErrCylinder: serialNotInSystemTree,
        });
      }

      // --- Kiểm tra trạng thái, vị trí bình ---
      // + Kiểm tra bình đang vận chuyển
      const deliveringCylinders = _.filter(cylinders, (o) => {
        return (
          o.placeStatus ===
          "DELIVERING" /* || o.placeStatus === 'IN_CUSTOMER' || o.current !== user.id */
        );
      });
      if (deliveringCylinders.length > 0) {
        return res.json({
          status: false,
          resCode: "ERROR-00007",
          message: `Những mã này đang vận chuyển nên không thể xuất: ${getArrayOfSerials(
            deliveringCylinders
          ).join(", ")}`,
          listErrCylinder: deliveringCylinders,
        });
      }
      // + Kiểm tra bình đã bán cho người dân
      const soldCylinders = _.filter(cylinders, (o) => {
        return o.placeStatus === "IN_CUSTOMER";
      });
      if (soldCylinders.length > 0) {
        return res.json({
          status: false,
          resCode: "ERROR-00008",
          message: `Những mã này đã bán cho người dân nên không thể xuất: ${getArrayOfSerials(
            soldCylinders
          ).join(", ")}`,
          listErrCylinder: soldCylinders,
        });
      }
      // + Kiểm tra bình không ở doanh nghiệp sở tại
      const cylindersNotInUser = _.filter(cylinders, (o) => {
        return o.current !== userId;
      });
      if (cylindersNotInUser.length > 0) {
        return res.json({
          status: false,
          resCode: "ERROR-00009",
          message: `Những mã này không ở doanh nghiệp sở tại nên không thể xuất: ${getArrayOfSerials(
            cylindersNotInUser
          ).join(", ")}`,
          listErrCylinder: cylindersNotInUser,
        });
      }

      // SUCCESS - Tất cả bình đều có thể xuất
      return res.json({
        status: true,
        resCode: "SUCCESS-00001",
        message: "Tất cả mã đều có thể xuất hàng",
        listSuccessCylinder: cylinders,
      });
    } catch (err) {
      return res.json({
        status: false,
        resCode: "ERROR-90001",
        message: "Gặp lỗi khi kiểm tra mã bình",
        error: err.message,
      });
    }
  },

  exportOrder: async function (req, res) {
    if (!req.body) {
      return res.ok(Utils.jsonErr("Empty body"));
    }

    const {
      // idDriver,
      // driver,
      // license_plate,
      // userId,
      // orderId,
      // type,
      // cylinders,

      // from,
      // toArray,
      //to,
      // cylindersWithoutSerial,
      //   type,
      //   cylinders,
      //   typeForPartner,
      //numberArray,
      //signature,
      cylinder_serials,
      action_type,
      parent_root,
    } = req.body;
    //let cylindersWithoutSerial = !!req.body.cylindersWithoutSerial ? req.body.cylindersWithoutSerial :  0;

    if (!type) {
      return Utils.jsonErr("Type is required");
    }
    if (type !== "EXPORT_ORDER") {
      return Utils.jsonErr("Wrong aciton type");
    }
    // if (type !== 'TURN_BACK' && !from) {
    //   return Utils.jsonErr('From is required');
    // }
    // if (!cylinders || cylinders === []) {
    //     return Utils.jsonErr('Cylinders is required');
    // }
    if (!driver && type !== "SALE") {
      return Utils.jsonErr("Driver is required");
    }
    if (!license_plate && type !== "SALE") {
      return Utils.jsonErr("License_plate is required");
    }

    let dataExport = {};
    // let dataImport = {}

    try {
      // Tìm thông tin đơn hàng
      let orderInfo = await OrderShipping.findOne({
        isDeleted: { "!=": true },
        id: orderId,
      })
        .populate("customerId")
        .populate("agencyId")
        .populate("warehouseId");

      if (!orderInfo) {
        return res.json({
          status: false,
          message: "Không tìm thấy thông tin đơn hàng",
        });
      }

      dataExport.driver = driver;
      dataExport.license_plate = license_plate;
      dataExport.from = userId;
      dataExport.toArray = [orderInfo.agencyId.id];
      dataExport.type = "EXPORT";

      // let cylinders = []
      // orderInfo.listCylinder.map(cylinder => {

      // })
      dataExport.cylinders = cylinders;
      // dataExport.typeForPartner = typeForPartner
      dataExport.numberArray = [cylinders.length.toString()];
      dataExport.idDriver = idDriver;
      dataExport.signature = "Web signature - IMPORT_SKIP_EXPORT";

      let resultExport = await History.create(dataExport).fetch();
    } catch (error) {
      return res.json({
        status: false,
        data: error.message,
        message: "Gặp lỗi khi xuất đơn hàng",
      });
    }
  },

  // Lấy lịch sử đơn hàng
  getOrderHistories: async function (req, res) {
    if (!req.body) {
      return res.json({
        status: false,
        resCode: "ERROR-00027",
        message: "Empty body",
      });
    }

    const { orderId } = req.body;

    try {
      const orderHistories = await OrderShippingHistory.find({
        isDeleted: { "!=": true },
        order: orderId,
      })
        .populate("createdBy")
        .sort("createdAt ASC");

      if (orderHistories.length > 0) {
        // return res.json({ success: true, orderHistories: orderHistories, message: 'Lấy thông tin lịch sử đơn hàng thành công' });
        return res.json({
          status: true,
          resCode: "SUCCESS-00003",
          message: "Lấy thông tin lịch sử chi tiết của đơn hàng thành công",
          orderHistories: orderHistories,
        });
      } else {
        return res.json({
          status: false,
          resCode: "ERROR-00028",
          message: "Không tìm thấy lịch sử chi tiết của đơn hàng",
        });
      }
    } catch (error) {
      return res.json({
        status: false,
        resCode: "ERROR-90003",
        message: "Gặp lỗi khi tìm lịch sử chi tiết của đơn hàng",
        error: error.message,
      });
    }
  },

  // Lấy thông tin xuất đơn hàng để in
  getExportDataPrint: async function (req, res) {
    if (!req.body) {
      return res.json({
        status: false,
        resCode: "ERROR-00027",
        message: "Empty body",
      });
    }

    const { orderId } = req.body;

    if (!orderId) {
      return res.json({
        status: false,
        resCode: "ERROR-00066",
        message: "Missing orderId",
      });
    }

    try {
      const orderInfor = await OrderShipping.findOne({
        isDeleted: { "!=": true },
        id: orderId,
      }).populate("orderHistories");
      if (!orderInfor) {
        return res.json({
          status: false,
          resCode: "ERROR-00067",
          message: "Không tìm thấy thông tin đơn hàng",
        });
      }

      const arrExport = await orderInfor.orderHistories.filter(
        (el) => el.status === "DELIVERED"
      );
      if (arrExport.length === 0) {
        return res.json({
          status: false,
          resCode: "ERROR-00068",
          message: "Không có thông tin xuất hàng",
        });
      }

      // let dataExport = []
      const dataExport = await Promise.all(
        arrExport.map(async (_export) => {
          const history = await History.findOne({
            isDeleted: { "!=": true },
            id: _export.detail,
          })
            .populate("cylinders")
            .populate("to")
            .populate("weightCylindersImport");
          const customerInfor = await User.findOne({
            isDeleted: { "!=": true },
            // Trường hợp xuất đơn hàng cho chi nhánh
            id:
              history.to.userType === "Agency"
                ? history.to.isChildOf
                : // Trường hợp xuất đơn hàng cho Đại lý phân phối
                  history.to.id,
          });

          // Tìm thông tin Shipping
          const orderShippingDetail = await ShippingOrderDetail.find({
            isDeleted: { "!=": true },
            orderId: _export.order,
          })
            // .populate('shippingorder')
            .populate("provinceId")
            .sort("createdAt DESC");

          let _agencyCode = "";
          let _agencyName = "";
          if (orderShippingDetail.length > 0) {
            if (orderShippingDetail[0].provinceId) {
              _agencyCode = orderShippingDetail[0].provinceId.code;
              _agencyName = orderShippingDetail[0].provinceId.nameProvince;
            } else {
              _agencyCode = "ZZZ";
              _agencyName = "NHƠN TRẠCH";
            }
          }

          let data = {
            orderCode: orderInfor.orderCode,
            customerCode: customerInfor.customerCode,
            customerName: customerInfor.name,
            agencyCode: history.to.agencyCode
              ? history.to.agencyCode
              : _agencyCode,
            agencyName: history.to.agencyCode ? history.to.name : _agencyName,
            address: history.to.address
              ? history.to.address
              : history.to.invoiceAddress,
            date: _export.createdAt,
            driverName: history.driver,
            licensePlate: history.license_plate,
            cylinders: [],
            signature: history.signature,
          };

          for (let i = 0; i < history.cylinders.length; i++) {
            const dataCylinder = history.weightCylindersImport.find(
              (el) => el.idCylinder === history.cylinders[i].id
            );
            if (dataCylinder) {
              data.cylinders.push({
                serialCylinder: history.cylinders[i].serial,
                typeCylinder: history.cylinders[i].cylinderType,
                weightCylinder: history.cylinders[i].weight,
                weightImport: dataCylinder.weightImport,
              });
            }
          }

          // dataExport.push(data)
          return data;
        })
      );

      if (dataExport.length > 0) {
        return res.json({
          status: true,
          resCode: "SUCCESS-00008",
          message: "Lấy thông tin in đơn hàng thành công",
          data: dataExport,
        });
      } else {
        return res.json({
          status: false,
          resCode: "ERROR-00069",
          message: "Không tìm thấy thông tin để in",
        });
      }
    } catch (error) {
      return res.json({
        status: false,
        resCode: "ERROR-90008",
        message: "Gặp lỗi khi lấy dữ liệu xuất đơn hàng để in",
        error: error.message,
      });
    }
  },

  // Lấy thông tin xuất hàng có chứa đơn hàng cần tìm
  getDetailExportOrder: async function (req, res) {
    if (!req.body) {
      return res.json({
        status: false,
        resCode: "ERROR-00027",
        message: "Empty body",
      });
    }

    const { orderId } = req.body;

    if (!orderId) {
      return res.json({
        status: false,
        resCode: "ERROR-00077",
        message: "Missing orderId",
      });
    }

    try {
      const orderInfor = await OrderShipping.findOne({
        isDeleted: { "!=": true },
        id: orderId,
      }).populate("orderHistories");
      if (!orderInfor) {
        return res.json({
          status: false,
          resCode: "ERROR-00078",
          message: "Không tìm thấy thông tin đơn hàng",
        });
      }

      const arrExport = await orderInfor.orderHistories.filter(
        (el) => el.status === "DELIVERING"
      );
      if (arrExport.length === 0) {
        return res.json({
          status: false,
          resCode: "ERROR-00079",
          message: "Chưa xuất hàng",
        });
      }

      const exportHistory = await History.findOne({
        isDeleted: { "!=": true },
        id: arrExport[0].detail,
      })
        .populate("orderHistory")
        .populate("cylinders");
      if (!exportHistory) {
        return res.json({
          status: false,
          resCode: "ERROR-00080",
          message: "Không tìm thấy bản ghi xuất hàng",
        });
      }

      // Tìm danh sách các đơn hàng
      const orders = await Promise.all(
        exportHistory.orderHistory.map(async (elm_orderHistory) => {
          const history = await OrderShipping.findOne({
            isDeleted: { "!=": true },
            id: elm_orderHistory.order,
          });
          return history;
        })
      );

      //
      return res.json({
        status: true,
        resCode: "SUCCESS-00010",
        message: "Lấy thông tin in xuất đơn hàng thành công",
        data: {
          orders: orders,
          exportHistory: exportHistory,
        },
      });
    } catch (error) {
      return res.json({
        status: false,
        resCode: "ERROR-90011",
        message: "Gặp lỗi khi lấy thông tin xuất hàng",
        error: error.message,
      });
    }
  },

  // Lấy thông tin chi tiết đơn hàng có trạng thái "Đã xuất hàng"
  // Kèm theo dánh sách các bình
  getCompletedOrderAndCylinders: async function (req, res) {
    if (!req.query) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { orderId } = req.query;

    if (!orderId) {
      return res.json({
        status: false,
        resCode: "ERROR-00087",
        message: "Missing orderId",
      });
    }

    try {
      const orderInfor = await OrderShipping.findOne({
        isDeleted: { "!=": true },
        id: orderId,
      }).populate("orderHistories");
      if (!orderInfor) {
        return res.json({
          status: false,
          resCode: "ERROR-00088",
          message: "Không tìm thấy thông tin đơn hàng",
        });
      }

      const arrExport = await orderInfor.orderHistories.filter(
        (el) => el.status === "DELIVERED"
      );
      if (arrExport.length === 0) {
        return res.json({
          status: false,
          resCode: "ERROR-00089",
          message: "Chưa giao hàng",
        });
      }

      const exportHistory = await Promise.all(
        arrExport.map(async (_orderHistory) => {
          const detailExportHistory = await History.findOne({
            isDeleted: { "!=": true },
            id: _orderHistory.detail,
          }).populate("cylinders");
          if (detailExportHistory) {
            return {
              status: _orderHistory.status,
              createdAt: _orderHistory.createdAt,
              cylinders: detailExportHistory.cylinders,
              success: true,
            };
          } else {
            return {
              status: _orderHistory.status,
              createdAt: _orderHistory.createdAt,
              cylinders: [],
              success: false,
            };
          }
        })
      );

      //
      return res.json({
        status: true,
        resCode: "SUCCESS-00017",
        message: "Lấy thông tin thành công",
        data: exportHistory,
      });
    } catch (error) {
      return res.json({
        status: false,
        resCode: "ERROR-90011",
        message: "Gặp lỗi khi lấy thông tin xuất hàng",
        data: [],
        error: error.message,
      });
    }
  },

  // Tìm đơn hàng
  findOrder: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { orderCode, page, limit } = req.query;

    if (!orderCode) {
      return res.badRequest(Utils.jsonErr("orderCode is required"));
    }

    let _page = parseInt(page);
    if (!Number.isInteger(_page) || _page < 1) {
      _page = 1;
    }

    let _limit = parseInt(limit);
    if (!Number.isInteger(_limit) || _limit < 1) {
      _limit = 10;
    }

    const _skip = _limit * (_page - 1);

    try {
      const credential = {
        orderCode: { contains: orderCode },
      };

      const foundOrder = await OrderShipping.find({
        isDeleted: { "!=": true },
        where: credential,
        limit: _limit,
        skip: _skip,
        sort: "createdAt DESC",
      });

      //
      return res.json({
        status: true,
        resCode: "SUCCESS-00018",
        message: "Tìm đơn hàng thành công",
        data: foundOrder,
      });
    } catch (error) {
      return res.json({
        status: false,
        resCode: "CATCH-00006",
        message: "Gặp lỗi khi tìm đơn hàng",
        data: [],
        error: error.message,
      });
    }
  },
  // xác nhận đơn hàng
  approvalOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }
    try {
      const update = {
        orderShippingId: req.body.orderShippingId,

        userId: req.body.userId,
      };

      if (!update.userId) {
        return res.json({
          success: false,
          message: "Không tìm thấy userId!",
        });
      }

      const userId = await User.findOne({
        isDeleted: { "!=": true },
        _id: update.userId,
      });
      if (!userId) {
        return res.json({
          success: false,
          message: "Không tìm thấy id UserId!",
        });
      }

      const CheckID = await OrderShipping.findOne({
        isDeleted: { "!=": true },
        _id: update.orderShippingId,
      });

      if (!CheckID) {
        return res.json({
          success: false,
          message: "Không tìm thấy id orderShipping!",
        });
      }

      const updateOrderSP = await OrderShipping.updateOne({
        isDeleted: { "!=": true },
        _id: update.orderShippingId,
      }).set({
        status: "CONFIRMED",
      });

      if (!updateOrderSP || updateOrderSP == "" || updateOrderSP == null) {
        return res.json({
          success: false,
          message: "khong tim thay orderSP!",
        });
      } else {
        return res.json({
          success: true,
          OrderShipping: updateOrderSP,
          playerId: userId.playerID,
          data: "Xác nhận đơn hàng thành công",
          title: "Thông Báo",
        });
      }
    } catch (error) {
      return res.json({
        status: false,
        resCode: "ERROR-90005",
        message: "Gặp lỗi khi cập nhât trạng thái đơn hàng",
        error: error.message,
      });
    }
  },
  CancelOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body !"));
    }

    try {
      const update = {
        orderShippingId: req.body.orderShippingId,
        reasonForCancellatic: req.body.reasonForCancellatic,
        userId: req.body.userId,
      };
      if (!update.reasonForCancellatic) {
        return res.json({
          success: false,
          message: "Không tìm thấy ghi chú!",
        });
      }
      if (!update.userId) {
        return res.json({
          success: false,
          message: "Không tìm thấy userId!",
        });
      }
      const userId = await User.findOne({
        isDeleted: { "!=": true },
        _id: update.userId,
      });

      const CheckID = await OrderShipping.findOne({
        isDeleted: { "!=": true },
        _id: update.orderShippingId,
      });
      if (!CheckID) {
        return res.json({
          success: true,
          message: "không tìm thấy ID đơn hàng",
        });
      }
      const UpdateOrderSp = await OrderShipping.updateOne({
        isDeleted: { "!=": true },
        _id: update.orderShippingId,
        // isDeleted: false
      }).set({
        status: "CANCELLED",
        reasonForCancellatic: update.reasonForCancellatic,
        //isDeleted: true
      });
      if (!UpdateOrderSp || UpdateOrderSp == "" || UpdateOrderSp == null) {
        return res.json({
          success: false,
          message: "không tim thấy Order sản phẩm",
        });
      } else {
        return res.json({
          success: true,
          OrderShipping: UpdateOrderSp,
          playerId: userId.playerID,
          data: "Hủy thành công đơn hàng",
          title: "Thông Báo",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        resCode: "ERROR-90005",
        message: " gặp lỗi khi cập nhật trạng thái đơn hàng",
        error: error.message,
      });
    }
  },
  OrderApprovalRequest: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body !"));
    }
    try {
      const update = {
        orderShippingId: req.body.orderShippingId,
        userId: req.body.userId,
      };
      const userId = await User.findOne({
        isDeleted: { "!=": true },
        _id: update.userId,
      });

      const IdOrder = await OrderShipping.findOne({
        isDeleted: { "!=": true },
        _id: update.orderShippingId,
      });

      if (!IdOrder)
        return res.json({
          success: false,
          message: "không tìm thấy ID đơn hàng",
        });
      const UpdateOrder = await OrderShipping.updateOne({
        isDeleted: { "!=": true },
        _id: update.orderShippingId,
      }).set({
        status: "REQUEST",
      });
      if (!UpdateOrder || UpdateOrder == null || UpdateOrder == "") {
        return res.json({
          success: false,
          message: " không tìm thấy Order",
        });
      } else {
        return res.json({
          success: true,
          UpdateOrderShipping: UpdateOrder,
          playerID: userId.playerID,
          //IdOrderShipping : IdOrder,
          data: " có đơn hàng cần xác nhận ",
          title: "Thông Báo",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        resCode: "ERROR-90005",
        message: " gặp lỗi khi cập nhật trạng thái đơn hàng",
        error: error.message,
      });
    }
  },

  // Lấy thông tin theo action
  getActionData: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      targets, // type: String, 'id1[,id2,..]'
      actionType, // isIn: [TURN_BACK]
      page,
      limit,
    } = req.query;

    let {
      startDate, // type: ISOString
      endDate, // type: ISOString
    } = req.query;

    if (!targets) {
      return res.badRequest(Utils.jsonErr("targets is required"));
    }

    // Phân trang
    let _page = parseInt(page);
    if (!Number.isInteger(_page) || _page < 1) {
      _page = 1;
    }

    let _limit = parseInt(limit);
    if (!Number.isInteger(_limit) || _limit < 1) {
      _limit = 10;
    }

    const _skip = _limit * (_page - 1);

    // Thời gian tìm kiếm
    if (!startDate && !endDate) {
      // Khoảng thời gian tìm kiếm: Trong ngày
      let today = new Date();
      let dd = String(today.getDate()).padStart(2, "0");
      let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
      let yyyy = today.getFullYear();

      today = mm + "/" + dd + "/" + yyyy;

      startDate = new Date(today).toISOString();
      endDate = new Date().toISOString();
    } else if (startDate && !endDate) {
      // Khoảng thời gian tìm kiếm: Từ startDate đến thời điểm hiện tại
      // startDate = startDate
      endDate = new Date().toISOString();
    } else if (!startDate && endDate) {
      // Khoảng thời gian tìm kiếm: Từ 1970-01-01 đến endDate
      startDate = new Date(0).toISOString();
      // endDate = endDate
    }

    try {
      let _data = [];
      let criteria = {
        createdAt: { ">=": startDate, "<=": endDate },
      };

      const _targets = targets.split(",");

      switch (actionType) {
        case "EXPORT":
          criteria = Object.assign(
            {
              type: "EXPORT",
              typeForPartner: { nin: ["BUY", "RENT", "TO_FIX"] },
              from: { in: _targets },
            },
            criteria
          );
          break;
        case "IMPORT":
          criteria = Object.assign(
            {
              type: "IMPORT",
              typeForPartner: { nin: ["BUY", "RENT", "TO_FIX"] },
              to: { in: _targets },
            },
            criteria
          );
          break;
        case "EXPORT_CELL":
          criteria = Object.assign(
            {
              type: "EXPORT",
              typeForPartner: { in: ["BUY", "RENT", "TO_FIX"] },
              from: { in: _targets },
            },
            criteria
          );
          break;
        case "IMPORT_CELL":
          criteria = Object.assign(
            {
              type: "IMPORT",
              typeForPartner: { in: ["BUY", "RENT", "TO_FIX"] },
              to: { in: _targets },
            },
            criteria
          );
          break;
        case "TURN_BACK":
          criteria = Object.assign(
            {
              type: "TURN_BACK",
              to: { in: _targets },
            },
            criteria
          );
          break;
      }

      if (actionType === "TURN_BACK") {
        const recoredHistory = await History.find({
          isDeleted: { "!=": true },
          where: criteria,
          skip: _skip,
          limit: _limit,
          sort: "createdAt DESC",
        })
          .populate("cylinders")
          .populate("to");

        await Promise.all(
          recoredHistory.map(async (historyTurnback) => {
            let _returnData = {
              idTurnback: historyTurnback.id,
              nameWarehouse: historyTurnback.to.name,
              date: historyTurnback.createdAt,
              nameCustomer: "",
              nameAgency: "",
              numberCylinder: historyTurnback.numberOfCylinder,
            };

            const cylinderRecord = await Cylinder.findOne({
              isDeleted: { "!=": true },
              id: historyTurnback.cylinders[0].id,
            }).populate("histories", {
              where: {
                type: "IMPORT",
                createdAt: { "<": historyTurnback.createdAt },
              },
              sort: "createdAt DESC",
            });

            if (!Array.isArray(cylinderRecord.histories)) {
              return;
            }

            if (cylinderRecord.histories.length > 0) {
              const lastImportRecord = cylinderRecord.histories[0];

              if (lastImportRecord.type === "SALE") {
                _returnData.nameCustomer = "Người dân";
                _returnData.nameAgency = "Người dân";
              } else {
                const currentPlace = await User.findOne({
                  isDeleted: { "!=": true },
                  id: lastImportRecord.to,
                }).populate("isChildOf");

                // --- Kiểm tra bản ghi xuất hàng ngay trước bản ghi hồi lưu là đến Khách hàng (TNSH) hay Chi nhánh (CHBL)
                // Xuất hàng đến Chi nhánh (CHBL)
                if (currentPlace.userType === "Agency") {
                  _returnData.nameCustomer = currentPlace.isChildOf
                    ? currentPlace.isChildOf.name
                    : "";
                  _returnData.nameAgency = currentPlace.name;
                }
                // Xuất hàng đến Khách hàng (TNSH)
                else {
                  _returnData.nameCustomer = currentPlace.name;
                  _returnData.nameAgency = "";
                }

                _data.push(_returnData);
              }
            }
          })
        );
      }

      if (_data.length > 0) {
        // Sắp xếp lại theo thời gian
        _data.sort(function (a, b) {
          if (a.date < b.date) {
            return -1;
          }
          if (a.date > b.date) {
            return 1;
          }
          // a must be equal to b
          return 0;
        });

        return res.json({
          status: true,
          resCode: "SUCCESS-00019",
          message: "Lấy thông tin thành công",
          data: _data,
        });
      } else {
        return res.json({
          status: false,
          resCode: "ERROR-00071",
          message: "Không tìm thấy kết quả nào",
          data: _data,
        });
      }
    } catch (error) {
      return res.json({
        status: false,
        resCode: "ERROR-90008",
        message: "Gặp lỗi khi lấy thông tin",
        error: error.message,
      });
    }
  },

  // Lấy thông tin hồi lưu để in
  getTurnbacktDataPrint: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      idTurnback, // type: String, 'idTurnback1[,idTurnback2,...]'
    } = req.query;

    if (!idTurnback) {
      return res.badRequest(Utils.jsonErr("idTurnback is required"));
    }

    try {
      let _dataTurnback = [];
      const _idTurnback = idTurnback.split(",");

      const arrTurnback = await History.find({
        isDeleted: { "!=": true },
        id: { in: _idTurnback },
      }).populate("cylinders");
      if (arrTurnback.length === 0) {
        return res.json({
          status: false,
          resCode: "ERROR-00090",
          data: [],
          message: "Không tìm thấy hồi lưu nào",
        });
      }

      await Promise.all(
        arrTurnback.map(async (turnback) => {
          const cylinderRecord = await Cylinder.findOne({
            isDeleted: { "!=": true },
            id: turnback.cylinders[0].id,
          }).populate("histories", {
            where: {
              type: "IMPORT",
              createdAt: { "<": turnback.createdAt },
            },
            sort: "createdAt DESC",
          });

          if (cylinderRecord.histories.length > 0) {
            let data = {
              idTurnback: turnback.id,
              customerCode: "",
              customerName: "",
              agencyCode: "",
              agencyName: "",
              address: "",
              date: turnback.createdAt,
              driverName: turnback.driver,
              licensePlate: turnback.license_plate,
              cylinders: [],
              signature: turnback.signature,
            };

            const lastImportRecord = cylinderRecord.histories[0];

            if (lastImportRecord.type === "SALE") {
              data.nameCustomer = "Người dân";
            } else {
              const currentPlace = await User.findOne({
                isDeleted: { "!=": true },
                id: lastImportRecord.to,
              }).populate("isChildOf");

              // --- Kiểm tra bản ghi nhập hàng ngay trước bản ghi hồi lưu là đến Khách hàng (TNSH) hay Chi nhánh (CHBL)
              // Nhập hàng đến Chi nhánh (CHBL)
              if (currentPlace.userType === "Agency") {
                data.customerCode = currentPlace.isChildOf.customerCode;
                data.customerName = currentPlace.isChildOf.name;
                data.agencyCode = currentPlace.agencyCode;
                data.agencyName = currentPlace.name;
                data.address = currentPlace.address;
              }
              // Nhập hàng đến Khách hàng (TNSH)
              else {
                data.customerCode = currentPlace.customerCode;
                data.customerName = currentPlace.name;
                data.agencyCode = "";
                data.agencyName = "";
                data.address = currentPlace.address;
              }
            }

            data.cylinders = await Promise.all(
              turnback.cylinders.map(async (cylinder) => {
                const weightReturn = await returnGas
                  .find({
                    isDeleted: { "!=": true },
                    serialCylinder: cylinder.serial,
                    createdAt: { ">=": Date.parse(turnback.createdAt) },
                  })
                  .limit(1);

                let _weightReturn =
                  !weightReturn || weightReturn.length === 0
                    ? 0
                    : weightReturn[0].weight;

                return {
                  serialCylinder: cylinder.serial,
                  typeCylinder: cylinder.cylinderType,
                  weightCylinder: cylinder.weight,
                  weightTurnback: _weightReturn,
                };
              })
            );

            _dataTurnback.push(data);
          }
        })
      );

      if (_dataTurnback.length > 0) {
        return res.json({
          status: true,
          resCode: "SUCCESS-00020",
          message: "Lấy thông tin hồi lưu để in thành công",
          data: _dataTurnback,
        });
      } else {
        return res.json({
          status: false,
          resCode: "ERROR-00069",
          message: "Không tìm thấy thông tin hồi lưu để in",
          data: _dataTurnback,
        });
      }
    } catch (error) {
      return res.json({
        status: false,
        resCode: "ERROR-90012",
        message: "Gặp lỗi khi lấy dữ liệu hồi lưu để in",
        data: [],
        error: error.message,
      });
    }
  },
};

function getArrayOfSerials(cylinders) {
  return cylinders.map((cylinder) => {
    return cylinder.serial;
  });
}

// Sắp xếp mảng Order
async function sortOrder(array) {
  array.sort(function (a, b) {
    var nameA = a.createdAt.toISOString();
    var nameB = b.createdAt.toISOString();
    if (nameA < nameB) {
      return 1;
    }
    if (nameA > nameB) {
      return -1;
    }

    // name trùng nhau
    return 0;
  });
}
