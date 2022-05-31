const _ = require("lodash");

module.exports = {
  createExportOrderDetail: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      let newOrder = [];
      const exportOrderId = req.body.exportOrderId;
      const __ExportOrderDetail = req.body.ExportOrderDetail;
      if (!exportOrderId) {
        return res.json({
          success: false,
          message: "không tim thấy ExportOrder",
        });
      }
      for (let i = 0; i < __ExportOrderDetail.length; i++) {
        listOrder = await OrderTank.findOne({
          isDeleted: { "!=": true },
          id: __ExportOrderDetail[i].orderId,
          isDeleted: false,
        });
        if (!listOrder) {
          return res.json({
            success: false,
            message: `Đơn hàng thứ ${i + 1} không tồn tại `,
          });
        }
        for (let j = i + 1; j < __ExportOrderDetail.length; j++) {
          if (
            __ExportOrderDetail[i].orderId === __ExportOrderDetail[j].orderId
          ) {
            return res.json({
              success: false,
              message: `Danh sách mã đơn hàng ${i + 1} và  ${
                j + 1
              } truyền lên bị trùng.`,
            });
          }
        }
      }

      if (__ExportOrderDetail.length === 0) {
        return res.json({
          success: false,
          message: "danh sách đơn hàng không được bỏ trống",
        });
      }

      const chkExportOrder = await ExportOrder.findOne({
        isDeleted: { "!=": true },
        _id: exportOrderId,
        isDeleted: false,
      });
      if (!chkExportOrder) {
        return res.json({
          success: false,
          message: "ExportOrder không tồn tại",
        });
      } else {
        for (let i = 0; i < __ExportOrderDetail.length; i++) {
          let exportOrderDetail = await ExportOrderDetail.find({
            isDeleted: { "!=": true },
            exportOrderId: exportOrderId,
            isDeleted: false,
          }).populate("orderId");

          let checkUpdate = {
            success: true,
            message: "",
          };

          let data = await Promise.all(
            exportOrderDetail.map(async (element) => {
              let data2 = await Promise.all(
                element.orderId.map(async (_element) => {
                  const chkOrderTank = await OrderTank.updateOne({
                    isDeleted: { "!=": true },
                    _id: _element.id,
                    isDeleted: false,
                  }).set({
                    exportId: null,
                  });
                  for (let i = 0; i < __ExportOrderDetail.length; i++) {
                    _check = await OrderTank.findOne({
                      isDeleted: { "!=": true },
                      id: __ExportOrderDetail[i].orderId,
                    });
                    if (_check.exportId !== null) {
                      await OrderTank.updateOne({
                        isDeleted: { "!=": true },
                        _id: _element.id,
                        isDeleted: false,
                      }).set({
                        exportId: element.id,
                      });
                      // return res.json({
                      //     success:false,
                      //     message:`Đơn hàng thứ ${i+1} đã được tạo `
                      // })
                      checkUpdate.success = false;
                      checkUpdate.message = `Đơn hàng thứ ${
                        i + 1
                      } đã được tạo `;
                    }
                  }
                })
              );
            })
          );

          if (!checkUpdate.success) {
            return res.json(checkUpdate);
          }

          for (let j = i + 1; j < __ExportOrderDetail.length; j++) {
            if (
              __ExportOrderDetail[i].orderId === __ExportOrderDetail[j].orderId
            ) {
              return res.json({
                success: false,
                message: `Danh sách mã đơn hàng ${i + 1} và  ${
                  j + 1
                } truyền lên bị trùng.`,
              });
            }
          }

          //  if(!chkOrderTank){
          //       return res.json({
          //           success:false,
          //           message:`OrderTank thứ ${i +1} không tồn tại`
          //       });
          //   }
          if (!__ExportOrderDetail[i].orderId) {
            return res.json({
              success: false,
              message: `orderGasId ${
                i + 1
              } is not defined. Please check out again.`,
            });
          } else {
            chkNewOrderTank = await OrderTank.findOne({
              isDeleted: { "!=": true },
              _id: __ExportOrderDetail[i].orderId,
              isDeleted: false,
            });

            newOrder.push(__ExportOrderDetail[i]);
          }
        }
        const _ExportorderDetail = await ExportOrderDetail.find({
          isDeleted: { "!=": true },
          exportOrderId: exportOrderId,
          isDeleted: false,
        });
        const _OrderTank = await Promise.all(
          _ExportorderDetail.map(async (element) => {
            return element.id;
          })
        );
        for (let i = 0; i < _OrderTank.length; i++) {
          const data = await ExportOrderDetail.updateOne({
            isDeleted: { "!=": true },
            id: _OrderTank[i],
          }).set({
            isDeleted: true,
          });
        }
        for (let i = 0; i < newOrder.length; i++) {
          const detail = await ExportOrderDetail.create({
            status: "INIT",
            exportOrderId: exportOrderId,
          }).fetch();

          await OrderTank.updateOne({
            isDeleted: { "!=": true },
            id: newOrder[i].orderId,
            isDeleted: false,
          }).set({
            exportId: detail.id,
          });
        }
        const listExportOrder = await ExportOrderDetail.find({
          isDeleted: { "!=": true },
          exportOrderId: exportOrderId,
          isDeleted: false,
        });
        if (
          !listExportOrder ||
          listExportOrder === null ||
          listExportOrder === ""
        ) {
          return res.json({
            success: false,
            message: "không tìm thấy ExportOrderDetail",
          });
        } else {
          return res.json({
            success: true,
            ExportOrderDetail: listExportOrder,
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
  deletedExportOrderDetail: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const deleted = {
        exportOrderDetailId: req.body.exportOrderDetailId,
      };
      if (deleted.exportOrderDetailId) {
        const checkExportOrderDetailID = await ExportOrderDetail.findOne({
          isDeleted: { "!=": true },
          _id: deleted.exportOrderDetailId,
          isDeleted: false,
        });
        if (!checkExportOrderDetailID) {
          return res.json({
            success: false,
            message: "ExportOrder không tồn tại!",
          });
        }
      }

      const cancelExportOrderDetail = await ExportOrderDetail.updateOne({
        isDeleted: { "!=": true },
        _id: deleted.exportOrderDetailId,
        isDeleted: false,
      }).set({
        isDeleted: true,
      });
      if (
        !cancelExportOrderDetail ||
        cancelExportOrderDetail == null ||
        cancelExportOrderDetail == ""
      ) {
        return res.json({
          success: false,
          message: "xóa không thành công",
        });
      } else {
        return res.json({
          success: true,
          ExportOrderDetail: cancelExportOrderDetail,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  getExportOrderDetailById: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const exportOrderDetailId = req.body.exportOrderDetailId;

      const chkexportOrderDetailId = await ExportOrderDetail.findOne({
        isDeleted: { "!=": true },
        _id: exportOrderDetailId,
        isDeleted: false,
      });
      if (
        !chkexportOrderDetailId ||
        chkexportOrderDetailId == null ||
        chkexportOrderDetailId == ""
      ) {
        return res.json({
          success: false,
          message: "lấy dữ liệu không thành công",
        });
      } else {
        return res.json({
          success: true,
          ExportOrderDetail: chkexportOrderDetailId,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  getAllExportOrderDetail: async function (req, res) {
    try {
      const ExportOrderDetailId = await ExportOrderDetail.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      });
      return res.json({ ExportOrderDetailId });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Lấy các đơn Detail của đơn ExportOrder
  getDetailOfExportOrder: async function (req, res) {
    try {
      const exportOrderID = req.query.exportOrderID;

      const checkExportOrder = await ExportOrder.findOne({
        isDeleted: { "!=": true },
        _id: exportOrderID,
        isDeleted: false,
      });

      if (!checkExportOrder) {
        return res.json({
          success: false,
          message: "ExportOrder không tồn tại.",
        });
      }

      const exportOrderDetail = await ExportOrderDetail.find({
        isDeleted: { "!=": true },
        exportOrderId: exportOrderID,
        isDeleted: false,
      });
      // .populate('orderGasId')

      if (
        !exportOrderDetail ||
        exportOrderDetail == "" ||
        exportOrderDetail == null
      ) {
        return res.json({
          success: false,
          message: "Không tìm thấy ExportOrderDetail.",
        });
      } else {
        let orderDetail = await Promise.all(
          exportOrderDetail.map(async (element) => {
            return await OrderTank.find({
              isDeleted: { "!=": true },
              exportId: element.id,
              isDeleted: false,
            })
              .populate("customergasId")
              .populate("warehouseId")
              .populate("exportId")
              .populate("createdBy");
          })
        );

        return res.json({
          success: true,
          ExportOrderDetail: orderDetail,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  updateExportOrderDetail: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const update = {
        id: req.body.id,
        orderId: req.body.orderId,
      };
      const _dataDetail = await ExportOrderDetail.findOne({
        isDeleted: { "!=": true },
        exportOrderId: update.id,
        isDeleted: false,
      });
      if (_dataDetail.orderId === update.orderId) {
        return res.json({
          success: true,
          message: "cập nhật thành công",
        });
      }
      const _dataExp = await ExportOrder.findOne({
        isDeleted: { "!=": true },
        id: update.id,
        isDeleted: false,
      });
      if (!_dataExp) {
        return res.json({
          success: false,
          message: "ko tìm thấy id",
        });
      }
      _dataExp.isDeleted = true;

      if (update.orderId) {
        const data = await OrderTank.findOne({
          isDeleted: { "!=": true },
          id: update.orderId,
          isDeleted: false,
        });
        if (!data) {
          return res.json({
            success: false,
            message: "ko tìm thấy đơn hàng",
          });
        }
      }
      const chkOrder = await OrderTank.findOne({
        isDeleted: { "!=": true },
        _id: update.orderId,
        isDeleted: false,
        status: {
          "!=": "CANCELLED",
        },
      });
      const listData = await HistoryNote.find({
        isDeleted: { "!=": true },
        historyNoteOrder: update.orderId,
        status: {
          "!=": "CANCELLED",
        },
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
      if (chkOrder.quantity < sum + (_dataExp.full - _dataExp.empty)) {
        return res.json({
          success: false,
          message: `đơn khối lượng đơn xuất phải nhỏ hơn hoặc bằng trong kho `,
          weight: rest,
        });
      }

      const _data = await ExportOrder.findOne({
        isDeleted: { "!=": true },
        id: update.id,
        isDeleted: false,
      }).populate("exportOrderDetail");
      _data.exportOrderId = await Promise.all(
        _data.exportOrderDetail.map(async (element) => {
          const dataLastHistory = await HistoryNote.find({
            isDeleted: { "!=": true },
            historyNoteOrder: element.orderId,
          })
            .limit(1)
            .sort("createdAt DESC");
          for (let i = 0; i < dataLastHistory.length; i++) {
            const updateHistory = await HistoryNote.create({
              data: _dataExp,
              historyNoteOrder: element.orderId,
              note: dataLastHistory[i].note,
              user: dataLastHistory[i].user,
              status: dataLastHistory[i].status,
            });
          }
          let data2 = await ExportOrderDetail.updateOne({
            isDeleted: { "!=": true },
            id: element.id,
            isDeleted: false,
          }).set({
            orderId: update.orderId,
          });
          if (!data2 || data2 === "" || data2 === null) {
            return res.json({
              success: false,
              message: "cập nhật ko thành công",
            });
          } else {
            const dataHisory = await HistoryNote.find({
              isDeleted: { "!=": true },
              historyNoteOrder: update.orderId,
              // isDeleted:false
            })
              .limit(1)
              .sort("createdAt DESC");
            const _dataExport = await ExportOrder.findOne({
              isDeleted: { "!=": true },
              id: update.id,
              isDeleted: false,
            });

            //_dataExport.isDeleted = true
            // const data =await ExportOrderDetail.create({
            //     exportOrderId: createExportOrder.id,
            //     orderId: _exportOrderDetail,
            // }).fetch();
            for (let i = 0; i < dataHisory.length; i++) {
              const _data = await HistoryNote.create({
                data: _dataExport,
                historyNoteOrder: update.orderId,
                note: dataHisory[i].note,
                user: dataHisory[i].user,
                status: dataHisory[i].status,
              });
            }
            return res.json({
              success: true,
              data: data2,
            });
          }
        })
      );
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Lấy danh sách đơn xuất của OrderTank
  getAllExportOrderOByOrderTankID: async function (req, res) {
    try {
      const _orderTankID = req.query._orderTankID;

      if (!_orderTankID) {
        return res.json({
          success: false,
          message: "_orderTankID không có",
        });
      }

      const result = await ExportOrderDetail.find({
        isDeleted: { "!=": true },
        orderId: _orderTankID,
        isDeleted: false,
      }).populate("exportOrderId");

      const _result = [];
      await Promise.all(
        result.map(async (order) => {
          if (order.exportOrderId.type === "X") {
            _result.push(order);
          }
        })
      );

      if (_result.length > 0) {
        return res.json({
          success: true,
          ExportOrder: _result,
        });
      } else {
        return res.json({
          success: true,
          message: "Không có dữ liệu",
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
