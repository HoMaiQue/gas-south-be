/**
 * OrderTankController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  createOrderTank: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const ordertank = {
        orderCode: req.body.orderCode,
        customergasId: req.body.customergasId,
        userId: req.body.userId,
        warehouseId: req.body.warehouseId,
        quantity: req.body.quantity,
        divernumber: req.body.divernumber,
        typeproduct: req.body.typeproduct,
        fromdeliveryDate: req.body.fromdeliveryDate,
        todeliveryDate: req.body.todeliveryDate,
        deliveryHours: req.body.deliveryHours,
        reminderschedule: req.body.reminderschedule,
        note: req.body.note,
        createdBy: req.body.createdBy ? req.body.createdBy : null,
        updatedBy: req.body.createdBy ? req.body.createdBy : null,
      };
      const image = req.body.image;

      if (!ordertank.orderCode) {
        return res.json({
          status: false,
          message: "OrderCode is required",
        });
      }

      const checkCode = await OrderTank.findOne({
        isDeleted: { "!=": true },
        orderCode: ordertank.orderCode,
      });

      if (checkCode) {
        return res.json({
          status: false,
          message: "Order Code đã được sử dụng.",
        });
      }

      if (!ordertank.customergasId) {
        return res.json({
          status: false,
          message: "CustomerGasId is required",
        });
      }

      if (!ordertank.userId) {
        return res.json({
          status: false,
          message: "UserId is required",
        });
      }

      if (!ordertank.warehouseId) {
        return res.json({
          status: false,
          message: "WareHouseId is required",
        });
      }

      if (!ordertank.quantity) {
        return res.json({
          status: false,
          message: "Quantity is required",
        });
      }

      if (!ordertank.divernumber) {
        return res.json({
          status: false,
          message: "Driver Number is required",
        });
      }

      if (!ordertank.typeproduct) {
        return res.json({
          status: false,
          message: "Type Product is required",
        });
      }

      if (!ordertank.fromdeliveryDate) {
        return res.json({
          status: false,
          message: "Date Dilivery Date From is required",
        });
      }

      if (!ordertank.todeliveryDate) {
        return res.json({
          status: false,
          message: "Date Dilivery Date To is required",
        });
      }

      if (!ordertank.deliveryHours) {
        return res.json({
          status: false,
          message: "Dilivery Hours is required",
        });
      }

      if (!ordertank.reminderschedule) {
        return res.json({
          status: false,
          message: "Reminder Schedule is required",
        });
      }

      if (!image) {
        return res.json({
          status: false,
          message: "Image is required",
        });
      }

      if (ordertank.createdBy) {
        const checkOrderTankCreate = await User.findOne({
          isDeleted: { "!=": true },
          _id: ordertank.createdBy,
        });

        if (!checkOrderTankCreate) {
          return res.json({
            status: false,
            message: "Order Tank Create không tồn tại.",
          });
        }
      }

      const checkCustomerGas = await CustomerGas.findOne({
        isDeleted: { "!=": true },
        _id: ordertank.customergasId,
      });

      if (!checkCustomerGas) {
        return res.json({
          status: false,
          message: "Không tìm thấy id của Customer Gas.",
        });
      }
      if (!ordertank.note) {
        return res.json({
          status: false,
          message: "ko tìm thấy note",
        });
      }

      const checkUser = await User.findOne({
        isDeleted: { "!=": true },
        _id: ordertank.userId,
      });

      if (!checkUser) {
        return res.json({
          status: false,
          message: "Không tìm thấy id của User.",
        });
      }

      const checkWareHouse = await WareHouse.findOne({
        isDeleted: { "!=": true },
        _id: ordertank.warehouseId,
      });

      if (!checkWareHouse) {
        return res.json({
          status: false,
          message: "Không tìm thấy id của WareHouse.",
        });
      }

      const newOrderTank = await OrderTank.create({ ...ordertank }).fetch();
      const listimage = [];

      if (!newOrderTank || newOrderTank == "" || newOrderTank == null) {
        return res.json({
          status: false,
          message: "Lỗi...Tạo Order Tank không thành công.",
        });
      } else {
        const _data = await HistoryNote.create({
          historyNoteOrder: newOrderTank.id,
          note: ordertank.note,
          status: newOrderTank.status,
        }).fetch();
        for (let index = 0; index < image.length; index++) {
          const file = {
            ordertankId: newOrderTank.id,
            filename: image[index],
            createdBy: newOrderTank.createdBy,
            updatedBy: newOrderTank.createdBy,
          };
          const newImageOrderTank = await OrderTankFile.create(file).fetch();
          if (
            !newImageOrderTank ||
            newImageOrderTank == "" ||
            newImageOrderTank == null
          ) {
            return res.json({
              status: false,
              message: "Lỗi...Tạo Order Tank File không thành công.",
            });
          } else {
            await listimage.push(file);
          }
        }
        return res.json({
          status: true,
          OrderTank: newOrderTank,
          Image: listimage,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  getAllOrderTank: async function (req, res) {
    try {
      const allOrderTank = await OrderTank.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      })
        .populate("customergasId")
        .populate("warehouseId")
        .populate("note", {
          sort: "createdAt DESC",
          limit: "1",
        })
        .sort("createdAt DESC");

      if (!allOrderTank || allOrderTank == "" || allOrderTank == null) {
        return res.json({
          status: false,
          message: "Lỗi...Không tìm thấy OrderTank.",
        });
      }

      const ordertankfile = await Promise.all(
        allOrderTank.map(async (element) => {
          return await OrderTankFile.find({
            isDeleted: { "!=": true },
            ordertankId: element.id,
            isDeleted: false,
          });
        })
      );

      return res.json({
        status: true,
        OrderTank: allOrderTank,
        Image: ordertankfile,
      });
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  getOrderTankByOrderCode: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const OrderCode = req.body.orderCode;

      if (!OrderCode) {
        return res.json({
          status: false,
          message: "Order Code is not defined. Please check out again.",
        });
      }

      const AllOrderTank = await OrderTank.find({ isDeleted: { "!=": true } })
        .populate("note", {
          sort: "createdAt DESC",
          limit: "1",
        })
        .populate("customergasId")
        .populate("warehouseId");

      let checkOrderTank = AllOrderTank.filter((AllOrderTank) => {
        return (
          AllOrderTank.orderCode
            .toLowerCase()
            .indexOf(OrderCode.toLowerCase()) !== -1
        );
      });
      if (!checkOrderTank) {
        return res.json({
          status: false,
          message: "ko tìm thấy customergas",
        });
      }

      const data = await Promise.all(
        checkOrderTank.map(async (element) => {
          let _data = await Promise.all(
            element.note.map(async (_element) => {
              return _element.note;
            })
          );
          return _data;
        })
      );
      // for(let i=0;i<data.length;i++){
      //     return data
      // }
      if (!checkOrderTank || checkOrderTank == "" || checkOrderTank == null) {
        return res.json({
          status: false,
          message: "Lỗi...Không tìm thấy Order Tank.",
        });
      }

      const checkOrderTankFile = await OrderTankFile.find({
        isDeleted: { "!=": true },
        ordertankId: checkOrderTank.id,
        isDeleted: false,
      });

      // if (!checkOrderTankFile || checkOrderTankFile == '' || checkOrderTankFile == null) {
      //     return res.json({
      //         status: false,
      //         message: 'Lỗi...Không tìm thấy Order Tank File.'
      //     })
      // }

      return res.json({
        status: true,
        OrderTank: checkOrderTank,
        File: checkOrderTankFile,
        //note : data
      });
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  getOrderTankByCustomerGasName: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const customerGasName = req.body.name;

      if (!customerGasName) {
        return res.json({
          status: false,
          message: "CustomerGas Name is not defined. Please check out again.",
        });
      }

      const data = await CustomerGas.find();
      let AllCustomerGas = data.filter((data) => {
        return (
          data.name.toLowerCase().indexOf(customerGasName.toLowerCase()) !== -1
        );
      });
      if (!AllCustomerGas) {
        return res.json({
          status: false,
          message: "ko tìm thấy customergas",
        });
      }

      // let result = [];
      // for (let i = 0; i < AllCustomerGas.length; i++) {
      //     AllCustomerGas[i].name.toLowerCase() === customerGasName.toLowerCase() ? result.push(AllCustomerGas[i]) : result
      // }
      // // const checkCustomerGasa = await CustomerGas.find({isDeleted: {"!=": true},
      // //     name : customerGasName,
      // //     isDeleted: false,
      // // })

      // if (!result || result == '' || result == null) {
      //     return res.json({
      //         status: false,
      //         message: 'Lỗi...Không tìm thấy Customer Gas.'
      //     })
      // }

      const checkOrderTank = await Promise.all(
        AllCustomerGas.map(async (element) => {
          return await OrderTank.find({
            isDeleted: { "!=": true },
            customergasId: element.id,
            isDeleted: false,
          })
            .populate("customergasId")
            .populate("warehouseId");
        })
      );

      const listOrderTankFile = [];
      for (let i = 0; i < checkOrderTank.length; i++) {
        const checkOrderTankFile = await Promise.all(
          checkOrderTank[i].map(async (element) => {
            return await OrderTankFile.find({
              isDeleted: { "!=": true },
              ordertankId: element.id,
              isDeleted: false,
            });
          })
        );

        // if (!checkOrderTankFile || checkOrderTankFile == '' || checkOrderTankFile == null) {
        //     return res.json({
        //         status: false,
        //         message: 'Lỗi...Không tìm thấy Order Tank File.'
        //     })
        // }

        listOrderTankFile.push(checkOrderTankFile);
      }

      // if (!listOrderTankFile || listOrderTankFile == '' || listOrderTankFile == null) {
      //     return res.json({
      //         status: false,
      //         message: 'Lỗi...Không tìm thấy Order Tank File.'
      //     })
      // }

      return res.json({
        status: true,
        OrderTank: checkOrderTank,
        File: listOrderTankFile,
      });
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  updateOrderTank: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const update = {
        ordertankId: req.body.ordertankId,
        orderCode: req.body.orderCode,
        customergasId: req.body.customergasId,
        userId: req.body.userId,
        warehouseId: req.body.warehouseId,
        quantity: req.body.quantity,
        divernumber: req.body.divernumber,
        typeproduct: req.body.typeproduct,
        fromdeliveryDate: req.body.fromdeliveryDate,
        todeliveryDate: req.body.todeliveryDate,
        deliveryHours: req.body.deliveryHours,
        status: req.body.status,
        note: req.body.note,
        reminderschedule: req.body.reminderschedule,
        updatedBy: req.body.updatedBy ? req.body.updatedBy : null,
      };
      const image = req.body.image;
      const imagechange = req.body.imagechange;

      if (!update.orderCode) {
        return res.json({
          status: false,
          message: "OrderCode is not defined. Please check out again.",
        });
      }

      if (!update.customergasId) {
        return res.json({
          status: false,
          message: "CustomerGasId is not defined. Please check out again.",
        });
      }

      if (!update.userId) {
        return res.json({
          status: false,
          message: "UserId is not defined. Please check out again.",
        });
      }

      if (!update.warehouseId) {
        return res.json({
          status: false,
          message: "WareHouseId is not defined. Please check out again.",
        });
      }

      if (!update.quantity) {
        return res.json({
          status: false,
          message: "Quantity is not defined. Please check out again.",
        });
      }

      if (!update.divernumber) {
        return res.json({
          status: false,
          message: "Driver Number is not defined. Please check out again.",
        });
      }

      if (!update.typeproduct) {
        return res.json({
          status: false,
          message: "Type Product is not defined. Please check out again.",
        });
      }

      if (!update.fromdeliveryDate) {
        return res.json({
          status: false,
          message:
            "Date Dilivery Date From is not defined. Please check out again.",
        });
      }

      if (!update.todeliveryDate) {
        return res.json({
          status: false,
          message:
            "Date Dilivery Date To is not defined. Please check out again.",
        });
      }

      if (!update.deliveryHours) {
        return res.json({
          status: false,
          message: "Dilivery Hours is not defined. Please check out again.",
        });
      }

      if (!update.status) {
        return res.json({
          status: false,
          message: "Status is not defined. Please check out again.",
        });
      }

      if (!update.reminderschedule) {
        return res.json({
          status: false,
          message: "Reminder Schedule is not defined. Please check out again.",
        });
      }

      if (!image) {
        return res.json({
          status: false,
          message: "Image is not defined. Please check out again.",
        });
      }

      if (update.updatedBy) {
        const checkOrderTankId = await User.findOne({
          isDeleted: { "!=": true },
          _id: update.updatedBy,
        });

        if (!checkOrderTankId) {
          return res.json({
            status: false,
            message: "Order Tank Update không tồn tại.",
          });
        }
      }

      const checkCustomerGas = await CustomerGas.findOne({
        isDeleted: { "!=": true },
        _id: update.customergasId,
      });

      if (!checkCustomerGas) {
        return res.json({
          status: false,
          message: "Không tìm thấy id của Customer Gas.",
        });
      }

      const checkUser = await User.findOne({
        isDeleted: { "!=": true },
        _id: update.userId,
      });

      if (!checkUser) {
        return res.json({
          status: false,
          message: "Không tìm thấy id của User.",
        });
      }

      const checkWareHouse = await WareHouse.findOne({
        isDeleted: { "!=": true },
        _id: update.warehouseId,
      });

      if (!checkWareHouse) {
        return res.json({
          status: false,
          message: "Không tìm thấy id của WareHouse.",
        });
      }

      const updateOrderTank = await OrderTank.updateOne({
        isDeleted: { "!=": true },
        _id: update.ordertankId,
      }).set({
        orderCode: update.orderCode,
        customergasId: update.customergasId,
        userId: update.userId,
        warehouseId: update.warehouseId,
        quantity: update.quantity,
        divernumber: update.divernumber,
        typeproduct: update.typeproduct,
        fromdeliveryDate: update.fromdeliveryDate,
        todeliveryDate: update.todeliveryDate,
        deliveryHours: update.deliveryHours,
        status: update.status,
        reminderschedule: update.reminderschedule,
        //note: update.note,
        updatedBy: update.updatedBy,
      });

      if (
        !updateOrderTank ||
        updateOrderTank == "" ||
        updateOrderTank == null
      ) {
        return res.json({
          status: false,
          message: "Lỗi...Không thể cập nhật thông tin OrderTank.",
        });
      } else if (update.note) {
        await HistoryNote.create({
          historyNoteOrder: update.ordertankId,
          note: update.note,
          user: updateOrderTank.userId,
          status: updateOrderTank.status,
        }).fetch();
      }

      const listimage = [];

      for (let index = 0; index < imagechange.length; index++) {
        if (imagechange[index]) {
          if (image[index]) {
            const updateOrderTankFile = await OrderTankFile.updateOne({
              isDeleted: { "!=": true },
              _id: image[index],
              //ordertankId: update.ordertankId
            }).set({
              filename: imagechange[index],
            });

            if (
              !updateOrderTankFile ||
              updateOrderTankFile == "" ||
              updateOrderTankFile == null
            ) {
              return res.json({
                status: false,
                message: "Lỗi...Update Order Tank File không thành công.",
              });
            } else {
              await listimage.push(updateOrderTankFile);
            }
          } else {
            const file = {
              ordertankId: update.ordertankId,
              filename: imagechange[index],
              createdBy: update.updatedBy,
              updatedBy: update.updatedBy,
            };

            const newImageOrderTank = await OrderTankFile.create(file).fetch();

            if (
              !newImageOrderTank ||
              newImageOrderTank == "" ||
              newImageOrderTank == null
            ) {
              return res.json({
                status: false,
                message: "Lỗi...Tạo Order Tank File không thành công.",
              });
            } else {
              await listimage.push(file);
            }
          }
        } else {
          const deleteimage = await OrderTankFile.destroyOne({
            _id: image[index],
          });

          if (!deleteimage || deleteimage == "" || deleteimage == null) {
            return res.json({
              status: false,
              message: "Lỗi...Xóa Order Tank File không thành công.",
            });
          }
        }
      }

      return res.json({
        status: true,
        OrderTank: updateOrderTank,
        listimage: listimage,
      });
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  deleteOrderTank: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const ordertankId = req.body.ordertankId;
      const deletedBy = req.body.deletedBy ? req.body.deletedBy : null;

      if (!ordertankId) {
        return res.json({
          status: false,
          message: "ordertankId is not defined. Please check out again.",
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

      const checkOrderTank = await OrderTank.findOne({
        isDeleted: { "!=": true },
        _id: ordertankId,
        isDeleted: false,
      });

      if (!checkOrderTank) {
        return res.json({
          status: false,
          message: "OrderTank không tồn tại.",
        });
      }

      const checkOrderTankFile = await OrderTankFile.find({
        isDeleted: { "!=": true },
        ordertankId: ordertankId,
        isDeleted: false,
      });

      if (!checkOrderTankFile) {
        return res.json({
          status: false,
          message: "OrderTank File không tồn tại.",
        });
      }

      //Huy OrderTank
      const deleteOrderTank = await OrderTank.updateOne({
        isDeleted: { "!=": true },
        _id: ordertankId,
        isDeleted: false,
      }).set({
        isDeleted: true,
        deletedBy: deletedBy,
        deletedAt: Date.now(),
      });

      if (
        !deleteOrderTank ||
        deleteOrderTank == "" ||
        deleteOrderTank == null
      ) {
        return res.json({
          status: false,
          message: "Lỗi...Hủy OrderTank không thành công.",
        });
      }

      //Huy image OrderTank
      const deleteOrderTankFile = await OrderTankFile.update({
        isDeleted: { "!=": true },
        ordertankId: ordertankId,
        isDeleted: false,
      })
        .set({
          isDeleted: true,
          deletedBy: deletedBy,
          deletedAt: Date.now(),
        })
        .fetch();

      if (
        !deleteOrderTankFile ||
        deleteOrderTankFile == "" ||
        deleteOrderTankFile == null
      ) {
        return res.json({
          status: false,
          message: "Lỗi...Hủy OrderTank File không thành công.",
        });
      } else {
        return res.json({
          status: false,
          message: "OrderTank đã hủy thành công.",
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  getOrderTankByCustomerGasId: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const customerGasId = req.body.customerGasId;

      if (!customerGasId) {
        return res.json({
          status: false,
          message: "customerGasId is not defined. Please check out again.",
        });
      }

      const checkCustomerGas = await CustomerGas.find({
        isDeleted: { "!=": true },
        id: customerGasId,
        isDeleted: false,
      });

      if (
        !checkCustomerGas ||
        checkCustomerGas == "" ||
        checkCustomerGas == null
      ) {
        return res.json({
          status: false,
          message: "Lỗi...Không tìm thấy Customer Gas.",
        });
      }

      const checkOrderTank = await Promise.all(
        checkCustomerGas.map(async (element) => {
          return await OrderTank.find({
            isDeleted: { "!=": true },
            customergasId: element.id,
            isDeleted: false,
          }).populate("customergasId");
        })
      );

      const listOrderTankFile = [];
      for (let i = 0; i < checkOrderTank.length; i++) {
        const checkOrderTankFile = await Promise.all(
          checkOrderTank[i].map(async (element) => {
            return await OrderTankFile.find({
              isDeleted: { "!=": true },
              ordertankId: element.id,
              isDeleted: false,
            });
          })
        );

        // if (!checkOrderTankFile || checkOrderTankFile == '' || checkOrderTankFile == null) {
        //     return res.json({
        //         status: false,
        //         message: 'Lỗi...Không tìm thấy Order Tank File.'
        //     })
        // }

        listOrderTankFile.push(checkOrderTankFile);
      }

      // if (!listOrderTankFile || listOrderTankFile == '' || listOrderTankFile == null) {
      //     return res.json({
      //         status: false,
      //         message: 'Lỗi...Không tìm thấy Order Tank File.'
      //     })
      // }

      return res.json({
        status: true,
        OrderTank: checkOrderTank,
        File: listOrderTankFile,
      });
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  changeOrderTankStatus: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      updatedBy,
      orderStatus,
      orderId,
      exportOrderID,
      exportOrderDetailID,
    } = req.body.updateOrderStatus;

    if (!updatedBy) {
      return res.json({
        status: false,
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
          message: "User not found",
        });
      }
    }

    if (!orderStatus) {
      return res.json({
        status: false,
        message: "Missing orderStatus",
      });
    }

    if (!orderId) {
      return res.json({
        status: false,
        message: "Missing orderId",
      });
    }

    try {
      // Tìm thông tin đơn hàng
      const orderInfor = await OrderTank.findOne({
        isDeleted: { "!=": true },
        id: orderId,
        isDeleted: false,
      });

      if (!orderInfor) {
        return res.json({
          status: false,
          message: "Không tìm thấy thông tin đơn hàng",
        });
      }

      // Trường hợp tài xế ấn xác nhận đã giao hàng  - DELIVERED
      if (orderStatus === "DELIVERED") {
        if (orderInfor.status !== "DELIVERING") {
          return res.json({
            status: false,
            message:
              "Chỉ cho phép tài xế xác nhận những đơn hàng trong trạng thái đang vận chuyển",
          });
        } else {
          // Cập nhật trạng thái đơn hàng
          const changeOrderStatus = await OrderTank.updateOne({
            isDeleted: { "!=": true },
            id: orderId,
          }).set({
            updatedBy: updatedBy,
            status: orderStatus,
          });

          if (!changeOrderStatus) {
            return res.json({
              status: false,
              message: "Lỗi khi cập nhật lại trạng thái đơn hàng",
            });
          } else {
            await ExportOrderDetail.updateOne({
              isDeleted: { "!=": true },
              id: exportOrderDetailID,
              isDeleted: false,
            }).set({
              status: "DELIVERED",
            });

            const checkDelivered = await ExportOrderDetail.find({
              isDeleted: { "!=": true },
              orderId: exportOrderID,
              isDeleted: false,
              status: ["PROCESSING", "DELIVERING"],
            });

            if (checkDelivered.length === 0) {
              const data = await ExportOrder.updateOne({
                isDeleted: { "!=": true },
                id: exportOrderID,
                isDeleted: false,
              }).set({
                status: 3,
              });
              _dataHistoryNote = await HistoryNote.find({
                isDeleted: { "!=": true },
                historyNoteOrder: orderId,
              })
                .limit(1)
                .sort("createdAt DESC");
              for (let i = 0; i < _dataHistoryNote.length; i++) {
                const dataHistory = await HistoryNote.create({
                  data: data,
                  historyNoteOrder: orderId,
                  note: _dataHistoryNote[i].note,
                  user: _dataHistoryNote[i].user,
                  status: _dataHistoryNote[i].status,
                });
              }
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
            message: "Không thể hủy bỏ đơn với trạng thái hiện tại",
          });
        } else {
          // Cập nhật trạng thái đơn hàng
          const changeOrderStatus = await OrderTank.updateOne({
            isDeleted: { "!=": true },
            id: orderId,
          }).set({
            updatedBy: updatedBy,
            status: orderStatus,
          });

          if (!changeOrderStatus) {
            return res.json({
              status: false,
              message: "Lỗi khi cập nhật lại trạng thái đơn hàng",
            });
          } else {
            await ExportOrderDetail.updateOne({
              isDeleted: { "!=": true },
              id: exportOrderDetailID,
              isDeleted: false,
            }).set({
              status: "CANCELLED",
            });

            const checkDelivered = await ExportOrderDetail.find({
              isDeleted: { "!=": true },
              orderId: exportOrderID,
              isDeleted: false,
              status: ["PROCESSING", "DELIVERING"],
            });

            if (checkDelivered.length === 0) {
              const data = await ExportOrder.updateOne({
                isDeleted: { "!=": true },
                id: exportOrderID,
                isDeleted: false,
              }).set({
                status: 3,
              });
              _dataHistoryNote = await HistoryNote.find({
                isDeleted: { "!=": true },
                historyNoteOrder: orderId,
              })
                .limit(1)
                .sort("createdAt DESC");
              for (let i = 0; i < _dataHistoryNote.length; i++) {
                const dataHistory = await HistoryNote.create({
                  data: data,
                  historyNoteOrder: orderId,
                  note: _dataHistoryNote[i].note,
                  user: _dataHistoryNote[i].user,
                  status: _dataHistoryNote[i].status,
                });
              }
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
            message:
              "Chỉ cho phép tài xế giao những đơn hàng đã được điều phối",
          });
        } else {
          // Cập nhật trạng thái đơn hàng
          const changeOrderStatus = await OrderTank.updateOne({
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
            await ExportOrderDetail.updateOne({
              isDeleted: { "!=": true },
              id: exportOrderDetailID,
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
        message: "Gặp lỗi khi cập nhật trạng thái đơn hàng",
        error: error.message,
      });
    }
  },

  // Lấy danh sách OrderTank, lồng thêm dữ liệu
  getAllOrder: async function (req, res) {
    try {
      const allOrderTank = await OrderTank.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      })
        .populate("customergasId")
        .populate("warehouseId")
        .sort("createdAt DESC");

      if (!allOrderTank || allOrderTank == "" || allOrderTank == null) {
        return res.json({
          status: false,
          message: "Lỗi...Không tìm thấy OrderTank.",
        });
      }

      const _orderTank = [];
      const ordertankfile = await Promise.all(
        allOrderTank.map(async (element) => {
          const warehouse = await User.findOne({
            isDeleted: { "!=": true },
            _id: element.userId,
            isDeleted: false,
          });

          const data = {
            order: element,
            warehouse_playerID: warehouse.playerID ? warehouse.playerID : null,
          };
          _orderTank.push(data);

          return await OrderTankFile.find({
            isDeleted: { "!=": true },
            ordertankId: element.id,
            isDeleted: false,
          });
        })
      );

      sortOrder(_orderTank);

      return res.json({
        status: true,
        OrderTank: _orderTank,
        Image: ordertankfile,
      });
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },
  changeStatus: async function (req, res) {
    try {
      const ordertank = {
        status: req.body.status,
        note: req.body.note,
        user: req.body.user,
      };
      let listOrder = await Promise.all(
        req.body.orderTank.map(async (element) => {
          return {
            orderTankId: element.orderTankId,
          };
        })
      );

      for (let i = 0; i < listOrder.length; i++) {
        let data = await OrderTank.updateOne({
          isDeleted: { "!=": true },
          id: listOrder[i].orderTankId,
        }).set({
          status: ordertank.status,
        });
        if (!data || !data === "") {
          return res.json({
            status: false,
            message: "lỗi ko cập nhật được trạng thái",
          });
        } else if (ordertank.note) {
          await HistoryNote.create({
            historyNoteOrder: listOrder[i].orderTankId,
            note: ordertank.note,
            user: ordertank.user,
            status: ordertank.status,
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

  // Lấy lý do hủy đơn
  getHistoryNote: async function (req, res) {
    try {
      const orderTankID = req.query.orderTankID;

      const checkOrder = await OrderTank.findOne({
        isDeleted: { "!=": true },
        id: orderTankID,
        isDeleted: false,
      });

      if (!checkOrder) {
        return res.json({
          status: false,
          message: "ID đơn hàng không đúng.",
        });
      } else {
        const _historyNote = await HistoryNote.findOne({
          isDeleted: { "!=": true },
          historyNoteOrder: orderTankID,
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
};

// Sắp xếp mảng Order
async function sortOrder(array) {
  array.sort(function (a, b) {
    var nameA = a.order.createdAt.toISOString(); // bỏ qua hoa thường
    var nameB = b.order.createdAt.toISOString(); // bỏ qua hoa thường
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
