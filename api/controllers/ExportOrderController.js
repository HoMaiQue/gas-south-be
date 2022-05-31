const _ = require("lodash");

module.exports = {
  // Tạo lệnh xuất
  createExportOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const create = {
        code: req.body.code,
        driverId: req.body.driverId ? req.body.driverId : null,
        nameDriver: req.body.nameDriver,
        nameUser: req.body.nameUser,
        licensePlate: req.body.licensePlate,
        wareHouseId: req.body.wareHouseId,
        userId: req.body.userId,
        empty: req.body.empty,
        full: req.body.full,
        deliveryDate: req.body.deliveryDate,
        deliveryHours: req.body.deliveryHours,
        node: req.body.node,
        weight: req.body.weight,
        type: req.body.type,

        //orderId: req.body.orderId,
      };
      const _exportOrderDetail = req.body.ExportOrderDetail;

      if (!create.code) {
        return res.json({
          success: false,
          message: "không tìm thấy code",
        });
      }
      const chkCode = await ExportOrder.findOne({
        isDeleted: { "!=": true },
        code: create.code,
      });
      if (chkCode) {
        return res.json({
          success: false,
          message: "code đã dc sử dụng",
        });
      }
      if (!create.licensePlate) {
        return res.json({
          success: false,
          message: "không tìm thấy licensePlate",
        });
      }
      if (!create.code) {
        return res.json({
          success: false,
          message: "không tìm thấy code",
        });
      }
      if (!create.empty) {
        return res.json({
          success: false,
          message: "không tìm thấy empty",
        });
      }
      if (!create.full) {
        return res.json({
          success: false,
          message: "không tìm thấy full",
        });
      }
      if (!create.deliveryDate) {
        return res.json({
          success: false,
          message: "không tìm thấy deliveryDate",
        });
      }
      if (!create.deliveryHours) {
        return res.json({
          success: false,
          message: "không tìm thấy deliverHours",
        });
      }
      if (!create.node) {
        return res.json({
          success: false,
          message: "không tìm thấy node",
        });
      }
      const chkOrder = await OrderTank.findOne({
        isDeleted: { "!=": true },
        id: _exportOrderDetail,
      });
      const listData = await HistoryNote.find({
        isDeleted: { "!=": true },
        historyNoteOrder: _exportOrderDetail,
      });
      const arrHistory = [];
      const arr = _.remove(listData, (o) => {
        return o.data;
      });
      for (let i = arr.length - 1; i >= 0; i--) {
        arrHistory.push(arr[i]);
      }
      const listarr = _.uniqBy(arrHistory, "data.id");
      const _arr = _.remove(listarr, (o) => {
        return o.data.isDeleted === false;
      });
      const Weight = await Promise.all(
        _arr.map(async (element) => {
          let sum = 0;
          const data = 0;
          //_arr.push(element)
          const arr = [];
          // if(element.data.isDeleted === false){
          //     arr.push(element)
          // }

          if (
            (element.data &&
              element.data.status === 1 &&
              element.data.isDeleted === false) ||
            (element.data &&
              element.data.status === 2 &&
              element.data.isDeleted === false)
          ) {
            sum = element.data.full - element.data.empty;
          }
          return sum;
        })
      );
      let sum = 0;
      for (let i = 0; i < Weight.length; i++) {
        sum += Weight[i];
      }
      let rest = chkOrder.quantity - sum;
      if (chkOrder.quantity < sum + (create.full - create.empty)) {
        return res.json({
          success: false,
          message: `đơn khối lượng đơn xuất phải nhỏ hơn hoặc bằng trong kho `,
          weight: rest,
        });
      }

      const chkWareHouse = await WareHouse.findOne({
        isDeleted: { "!=": true },
        _id: create.wareHouseId,
      });
      if (!chkWareHouse) {
        return res.json({
          success: false,
          message: "không tìm thấy nhà kho",
        });
      }
      const chkUser = await User.findOne({
        isDeleted: { "!=": true },
        _id: create.userId,
      });
      if (!chkUser) {
        return res.json({
          success: false,
          message: "không tìm thấy user",
        });
      }

      const createExportOrder = await ExportOrder.create(create).fetch();
      if (
        !createExportOrder ||
        createExportOrder == null ||
        createExportOrder == ""
      ) {
        return res.json({
          success: false,
          message: "tạo mới không thành công",
        });
      } else {
        const dataHisory = await HistoryNote.find({
          isDeleted: { "!=": true },
          historyNoteOrder: _exportOrderDetail,
          // isDeleted:false
        })
          .limit(1)
          .sort("createdAt DESC");

        const data = await ExportOrderDetail.create({
          exportOrderId: createExportOrder.id,
          orderId: _exportOrderDetail,
        }).fetch();
        for (let i = 0; i < dataHisory.length; i++) {
          const _data = await HistoryNote.create({
            data: createExportOrder,
            historyNoteOrder: _exportOrderDetail,
            note: dataHisory[i].note,
            user: dataHisory[i].user,
            status: dataHisory[i].status,
          });
        }
        //await OrderTank.addToCollection(_exportOrderDetail,'exportId').members([data.id]);
        const listDetail = await ExportOrderDetail.find({
          isDeleted: { "!=": true },
          exportOrderId: createExportOrder.id,
          isDeleted: false,
        });

        return res.json({
          success: true,
          _ExportOrder: createExportOrder,
          _ExportOrderDetail: listDetail,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  updateExportOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const update = {
        ExportOrderId: req.body.ExportOrderId,
        code: req.body.code,
        driverId: req.body.driverId,
        nameDriver: req.body.nameDriver,
        nameUser: req.body.nameUser,
        licensePlate: req.body.licensePlate,
        wareHouseId: req.body.wareHouseId,
        userId: req.body.userId,
        empty: req.body.empty,
        full: req.body.full,
        deliveryDate: req.body.deliveryDate,
        deliveryHours: req.body.deliveryHours,
        node: req.body.node,
        type: req.body.type,
        weight: req.body.weight,
        //orderId: req.body.orderId,
      };
      const _exportOrderDetail = req.body.ExportOrderDetail;
      const chkExport = await ExportOrder.findOne({
        isDeleted: { "!=": true },
        _id: update.ExportOrderId,
        isDeleted: false,
      });
      if (!chkExport) {
        return res.json({
          success: false,
          message: "không tìm thấy đơn hàng",
        });
      }
      if (update.driverId) {
        const checkUser = await User.findOne({
          isDeleted: { "!=": true },
          _id: update.driverId,
        });
        if (!checkUser) {
          return res.json({
            success: false,
            message: "user không tồn tại!",
          });
        }
      }
      const chkOrder = await OrderTank.findOne({
        isDeleted: { "!=": true },
        id: _exportOrderDetail,
      });
      const listData = await HistoryNote.find({
        isDeleted: { "!=": true },
        historyNoteOrder: _exportOrderDetail,
      });
      // const _listData = await HistoryNote.find({isDeleted: {"!=": true},
      //     historyNoteOrder:_exportOrderDetail
      // }).limit(1).sort('createdAt DESC');
      const arrHistory = [];
      const arr = _.remove(listData, (o) => {
        return o.data;
      });
      for (let i = arr.length - 1; i >= 0; i--) {
        arrHistory.push(arr[i]);
      }
      const listarr = _.uniqBy(arrHistory, "data.id");
      const __arr = _.remove(listarr, (o) => {
        return o.data.isDeleted === false;
      });
      const _arr = _.remove(__arr, (o) => {
        return o.data.id !== update.ExportOrderId;
      });
      const Weight = await Promise.all(
        _arr.map(async (element) => {
          let sum = 0;
          const data = 0;
          //_arr.push(element)
          const arr = [];
          // if(element.data.isDeleted === false){
          //     arr.push(element)
          // }

          if (
            (element.data &&
              element.data.status === 1 &&
              element.data.isDeleted === false) ||
            (element.data &&
              element.data.status === 2 &&
              element.data.isDeleted === false)
          ) {
            sum = element.data.full - element.data.empty;
          }
          return sum;
        })
      );
      let sum = 0;
      for (let i = 0; i < Weight.length; i++) {
        sum += Weight[i];
      }
      let rest = chkOrder.quantity - sum;
      if (chkOrder.quantity < sum + (update.full - update.empty)) {
        return res.json({
          success: false,
          message: `đơn khối lượng đơn xuất phải nhỏ hơn hoặc bằng trong kho `,
          weight: rest,
        });
      }

      if (update.userId) {
        const checkUser = await User.findOne({
          isDeleted: { "!=": true },
          _id: update.userId,
        });
        if (!checkUser) {
          return res.json({
            success: false,
            message: "người nhận không tồn tại!",
          });
        }
      }
      if (update.wareHouseId) {
        const checkwareHouseId = await WareHouse.findOne({
          isDeleted: { "!=": true },
          _id: update.wareHouseId,
        });
        if (!checkwareHouseId) {
          return res.json({
            success: false,
            message: "wareHouse không tồn tại!",
          });
        }
      }
      if (update.code) {
        const chkCode = await ExportOrder.findOne({
          isDeleted: { "!=": true },
          code: update.code,
          isDeleted: false,
        });
        if (chkCode) {
          return res.json({
            success: false,
            message: "mã đơn hàng đã tồn tại . vui lòng nhập mã khác",
          });
        }
      }

      const updateExportOrder = await ExportOrder.updateOne({
        isDeleted: { "!=": true },
        _id: update.ExportOrderId,
        isDeleted: false,
      }).set({
        code: update.code,
        driverId: update.driverId,
        nameDriver: update.nameDriver,
        nameUser: update.nameUser,
        licensePlate: update.licensePlate,
        wareHouseId: update.wareHouseId,
        userId: update.userId,
        empty: update.empty,
        full: update.full,
        deliveryDate: update.deliveryDate,
        deliveryHours: update.deliveryHours,
        node: update.node,
        type: update.type,
        weight: update.weight,
        //orderId:update.orderId,
      });

      if (
        !updateExportOrder ||
        updateExportOrder == "" ||
        updateExportOrder == null
      ) {
        return res.json({
          success: false,
          message: "Cập nhập không thành công!",
        });
      } else {
        const dataHisory = await HistoryNote.find({
          isDeleted: { "!=": true },
          historyNoteOrder: _exportOrderDetail,
          // isDeleted:false
        })
          .limit(1)
          .sort("createdAt DESC");
        for (let i = 0; i < dataHisory.length; i++) {
          const _data = await HistoryNote.create({
            data: updateExportOrder,
            historyNoteOrder: _exportOrderDetail,
            note: dataHisory[i].note,
            user: dataHisory[i].user,
            status: dataHisory[i].status,
          });
        }

        return res.json({
          success: true,
          ExportOder: updateExportOrder,
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },
  deleteExportOrder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const ExportOrderId = req.body.ExportOrderId;
      // const deletedAt = req.body.deletedAt ? req.body.deletedAt : null;
      if (!ExportOrderId) {
        return res.json({
          success: false,
          message: "ExportOrderId không tồn tại!",
        });
      }

      const checkExportOrderId = await ExportOrder.findOne({
        isDeleted: { "!=": true },
        id: ExportOrderId,
        isDeleted: false,
      });

      if (!checkExportOrderId) {
        return res.json({
          success: false,
          message: "checkExportOrderId không tồn tại!",
        });
      }

      const cancelcheckExportOrder = await ExportOrder.updateOne({
        isDeleted: { "!=": true },
        _id: ExportOrderId,
        isDeleted: false,
      }).set({
        isDeleted: true,
        // deletedAt: deletedAt,
        deletedAt: Date.now(),
      });
      const listOrder = await ExportOrderDetail.findOne({
        isDeleted: { "!=": true },
        exportOrderId: ExportOrderId,
        isDeleted: false,
      }).populate("orderId");
      const dataHisory = await HistoryNote.find({
        isDeleted: { "!=": true },
        historyNoteOrder: listOrder.orderId.id,
        // isDeleted:false
      })
        .limit(1)
        .sort("createdAt DESC");

      for (let i = 0; i < dataHisory.length; i++) {
        const _data = await HistoryNote.create({
          data: cancelcheckExportOrder,
          historyNoteOrder: listOrder.orderId.id,
          note: dataHisory[i].note,
          user: dataHisory[i].user,
          status: dataHisory[i].status,
        });
      }

      await ExportOrderDetail.updateOne({
        isDeleted: { "!=": true },
        exportOrderId: ExportOrderId,
        isDeleted: false,
      }).set({
        isDeleted: true,
      });

      if (
        !cancelcheckExportOrder ||
        cancelcheckExportOrder == "" ||
        cancelcheckExportOrder == null
      ) {
        return res.json({
          success: false,
          message: "Xóa ExportOrder không thành công!",
        });
      } else {
        return res.json({
          success: true,
          message: "ExportOrder đã được xóa thành công!",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  getExportOrderByID: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const ExportOrderId = req.body.ExportOrderId;
      let data1 = [];
      let chkUserExportOrderId = await ExportOrder.findOne({
        isDeleted: { "!=": true },
        _id: ExportOrderId,
        isDeleted: false,
      })
        .populate("driverId")
        .populate("userId")
        .populate("exportOrderDetail")
        .populate("wareHouseId");
      //chkUserExportOrderId = await Promise.all(chkUserExportOrderId.map(async element=>{
      chkUserExportOrderId.exportOrderDetail = await Promise.all(
        chkUserExportOrderId.exportOrderDetail.map(async (_element) => {
          //let  customerGas = await ExportOrderDetail.findOne({isDeleted: {"!=": true},id: _element.id}).populate('orderId')
          //customerGas.orderId = await Promise.all(customerGas.orderId.map(async __element=>{
          let _Customer = await OrderTank.find({
            isDeleted: { "!=": true },
            id: _element.orderId,
          }).populate("customergasId");
          return _Customer;
          //} ))

          return customerGas.orderId;
        })
      );

      data1.push(chkUserExportOrderId);

      return res.json({
        _dataExportOrder: data1,
      });
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },
  getAllExportOrder: async function (req, res) {
    try {
      let data = [];

      let order = [];
      let ggg = [];
      let data1 = [];
      let data2 = [];
      let _dataCustomer = [];
      let _dataCode = [];

      let ExportOrderId = await ExportOrder.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      })
        .populate("driverId")
        .populate("userId")
        .populate("exportOrderDetail")
        .populate("wareHouseId")
        .sort("createdAt DESC");

      ExportOrderId = await Promise.all(
        ExportOrderId.map(async (exportorder, index) => {
          //

          let _dataExport = {
            exportId: exportorder.id,
            status: exportorder.status,
            code: exportorder.code,
            //orderId:null,
            customerCode: null,
            customerName: null,
            ordercode: null,
            //_isDeleted:[],
            wareHouseName: exportorder.wareHouseId
              ? exportorder.wareHouseId.name
              : "",
            weight: exportorder.weight,
            empty: exportorder.empty,
            full: exportorder.full,
            licensePlate: exportorder.licensePlate,
            deliveryDate: exportorder.deliveryDate,
            deliveryHours: exportorder.deliveryHours,
            type: exportorder.type,
            node: exportorder.node,
            driverId: exportorder.driverId ? exportorder.driverId.name : "",
            nameDriver: exportorder.nameDriver,
            //isDeleted:exportorder.isDeleted
          };
          exportorder.exportOrderDetail = await Promise.all(
            exportorder.exportOrderDetail.map(
              async (exportOrderDetail, index) => {
                let data = await OrderTank.findOne({
                  isDeleted: { "!=": true },
                  id: exportOrderDetail.orderId,
                  isDeleted: false,
                });
                _dataExport.ordercode = data.orderCode;
                let _data = await CustomerGas.findOne({
                  isDeleted: { "!=": true },
                  id: data.customergasId,
                  isDeleted: false,
                });
                (_dataExport.customerCode = _data.code),
                  (_dataExport.customerName = _data.name);
              }
            )
          );

          return (data[index] = _dataExport);
        })
      );

      return res.json({
        _dataExportOrder: data,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  confirmationStatus: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }
    try {
      const update = {
        ExportOrderId: req.body.ExportOrderId,
        //status : req.body.status
      };
      if (update.ExportOrderId) {
        const chkExportOrder = await ExportOrder.findOne({
          isDeleted: { "!=": true },
          _id: update.ExportOrderId,
        });
        if (!chkExportOrder) {
          return res.json({
            success: false,
            message: "không tìm thấy đơn hàng ",
          });
        }
      }
      const dataOrder = await ExportOrderDetail.find({
        isDeleted: { "!=": true },
        id: update.ExportOrderId,
      });
      const updateExport = await ExportOrder.updateOne({
        isDeleted: { "!=": true },
        _id: update.ExportOrderId,
        isDeleted: false,
      }).set({
        status: 2,
      });
      if (!updateExport) {
        return res.json({
          success: false,
          message: "cập nhật không thành công",
        });
      } else {
        await ExportOrderDetail.update({
          isDeleted: { "!=": true },
          exportOrderId: update.ExportOrderId,
        }).set({
          status: "DELIVERING",
        });
        await OrderTank.update({
          isDeleted: { "!=": true },
          id: dataOrder.orderId,
        }).set({
          status: "DELIVERING",
        });
        return res.json({
          success: true,
          message: "cập nhật trạng thái thành công",
        });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },
  backStatus: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }
    try {
      const update = {
        ExportOrderId: req.body.ExportOrderId,
        //status : req.body.status
      };
      if (update.ExportOrderId) {
        const chkExportOrder = await ExportOrder.findOne({
          isDeleted: { "!=": true },
          _id: update.ExportOrderId,
        });
        if (!chkExportOrder) {
          return res.json({
            success: false,
            message: "không tìm thấy đơn hàng ",
          });
        }
      }

      const updateExport = await ExportOrder.updateOne({
        isDeleted: { "!=": true },
        _id: update.ExportOrderId,
        isDeleted: false,
      }).set({
        status: 1,
      });
      if (!updateExport) {
        return res.json({
          success: false,
          message: "cập nhật không thành công",
        });
      } else {
        await ExportOrderDetail.update({
          isDeleted: { "!=": true },
          exportOrderId: update.ExportOrderId,
        }).set({
          status: "INIT",
        });
        return res.json({
          success: true,
          message: "cập nhật trạng thái thành công",
        });
      }
    } catch (error) {
      return res.json({ success: false, message: error.message });
    }
  },

  // Lấy tất cả đơn hàng trạng thái 1 của tài xế
  getAllExportOrderINIT: async function (req, res) {
    try {
      const userId = req.query.userId;

      if (!userId) {
        return res.json({
          success: false,
          message: "userId không xác định.",
        });
      } else {
        const checkExportOrder = await ExportOrder.find({
          isDeleted: { "!=": true },
          driverId: userId,
          isDeleted: false,
          // status: 1
        }).sort([{ deliveryDate: "DESC" }, { deliveryHours: "DESC" }]);

        if (
          !checkExportOrder ||
          checkExportOrder == "" ||
          checkExportOrder == null
        ) {
          return res.json({
            success: false,
            message: "Không tìm thấy đơn vận chuyển nào.",
          });
        } else {
          return res.json({
            success: true,
            ExportOrders: checkExportOrder,
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

  // Đổi trạng thái đơn
  changeExportOrderStatus: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const update = {
        exportOrderID: req.body.exportOrderID,
        status: req.body.status,
        updatedBy: req.body.updatedBy,
      };

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

      const newExportOrder = await ExportOrder.updateOne({
        isDeleted: { "!=": true },
        _id: update.exportOrderID,
        isDeleted: false,
      }).set({
        status: update.status,
        updatedBy: update.updatedBy,
        updatedAt: Date.now(),
      });

      if (!newExportOrder || newExportOrder == "" || newExportOrder == null) {
        return res.json({
          success: false,
          message: "Lỗi...ExportOder không tồn tại.",
        });
      } else {
        if (newExportOrder.status === 1) {
          const orderTankStatus = await ExportOrderDetail.find({
            isDeleted: { "!=": true },
            exportOrderId: update.exportOrderID,
            isDeleted: false,
          });

          await ExportOrderDetail.update({
            isDeleted: { "!=": true },
            exportOrderId: newExportOrder.id,
            isDeleted: false,
          }).set({
            status: "INIT",
          });

          await Promise.all(
            orderTankStatus.map(async (element) => {
              await OrderTank.updateOne({
                isDeleted: { "!=": true },
                id: element.orderId,
                isDeleted: false,
              }).set({
                status: "PROCESSING",
              });
            })
          );
        }

        if (newExportOrder.status === 2) {
          const orderTankStatus = await ExportOrderDetail.find({
            isDeleted: { "!=": true },
            exportOrderId: update.exportOrderID,
            isDeleted: false,
          });

          await ExportOrderDetail.update({
            isDeleted: { "!=": true },
            exportOrderId: newExportOrder.id,
            isDeleted: false,
          }).set({
            status: "PROCESSING",
          });

          await Promise.all(
            orderTankStatus.map(async (element) => {
              await OrderTank.updateOne({
                isDeleted: { "!=": true },
                id: element.orderId,
                isDeleted: false,
              }).set({
                status: "PROCESSING",
              });
              const dataHisory = await HistoryNote.find({
                isDeleted: { "!=": true },
                historyNoteOrder: element.orderId,
                // isDeleted:false
              })
                .limit(1)
                .sort("createdAt DESC");
              for (let i = 0; i < dataHisory.length; i++) {
                const _data = await HistoryNote.create({
                  data: newExportOrder,
                  historyNoteOrder: dataHisory[i].historyNoteOrder,
                  note: dataHisory[i].note,
                  user: dataHisory[i].user,
                  status: "PROCESSING",
                });
              }
            })
          );
        }

        return res.json({
          success: true,
          message: "Cập nhật đơn hàng thành công.",
          ExportOrder: newExportOrder,
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
