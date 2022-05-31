/**
 * ManageImportExportController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  ManageImportExportWareHouse: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const manageIEWareHouse = {
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
        warehouseId: req.body.warehouseId ? req.body.warehouseId : null,
      };

      if (!manageIEWareHouse.fromDate) {
        return res.json({
          status: false,
          message: "Date From is required",
        });
      }

      if (!manageIEWareHouse.toDate) {
        return res.json({
          status: false,
          message: "Date To is required",
        });
      }

      const start = new Date(manageIEWareHouse.fromDate).valueOf();
      const end = new Date(manageIEWareHouse.toDate).valueOf();

      if (start > end) {
        return res.json({
          status: false,
          message: "Lỗi...Ngày bắt đầu không được nhỏ hơn ngày kết thúc.",
        });
      }

      if (manageIEWareHouse.warehouseId) {
        const checkWareHouse = await WareHouse.findOne({
          isDeleted: { "!=": true },
          _id: manageIEWareHouse.warehouseId,
        });

        if (!checkWareHouse) {
          return res.json({
            status: false,
            message: "Không tìm thấy id của WareHouse.",
          });
        }

        const getAllWareHouseImport = await ExportOrder.find({
          isDeleted: { "!=": true },
          wareHouseId: manageIEWareHouse.warehouseId,
          type: "N",
          status: 2,
          isDeleted: false,
        }).sort("createdAt");

        const getAllWareHouseExport = await ExportOrder.find({
          isDeleted: { "!=": true },
          wareHouseId: manageIEWareHouse.warehouseId,
          type: "X",
          status: 2,
          isDeleted: false,
        }).sort("createdAt");

        // if (!getAllWareHouseImport || getAllWareHouseImport == '' || getAllWareHouseImport == null) {
        //     return res.json({
        //         status: false,
        //         message: 'Không tìm thấy nhập kho nào.'
        //     });
        // }

        // if (!getAllWareHouseExport || getAllWareHouseExport == '' || getAllWareHouseExport == null) {
        //     return res.json({
        //         status: false,
        //         message: 'Không tìm thấy xuất kho nào.'
        //     });
        // }

        let before = 0;
        let afterimport = 0;
        let afterexport = 0;
        for (let i = 0; i < getAllWareHouseImport.length; i++) {
          let checkDate = new Date(
            getAllWareHouseImport[i].createdAt
          ).valueOf();
          if (checkDate < start) {
            const sum =
              getAllWareHouseImport[i].full - getAllWareHouseImport[i].empty;
            before += sum;
            continue;
          }
          if (checkDate >= start && checkDate <= end) {
            afterimport +=
              getAllWareHouseImport[i].full - getAllWareHouseImport[i].empty;
          } else {
            break;
          }
        }

        for (let i = 0; i < getAllWareHouseExport.length; i++) {
          let checkDate = new Date(
            getAllWareHouseExport[i].createdAt
          ).valueOf();
          if (checkDate < start) {
            before -=
              getAllWareHouseExport[i].full - getAllWareHouseExport[i].empty;
            continue;
          }
          if (checkDate >= start && checkDate <= end) {
            afterexport +=
              getAllWareHouseExport[i].full - getAllWareHouseExport[i].empty;
          } else {
            break;
          }
        }

        const result = before + afterimport - afterexport;

        return res.json({
          status: true,
          BeforeImport: before,
          Import: afterimport,
          Export: afterexport,
          AfterImportExport: result,
        });
      } else {
        const getAllWareHouseImport = await ExportOrder.find({
          isDeleted: { "!=": true },
          type: "N",
          status: 2,
          isDeleted: false,
        })
          .sort("createdAt")
          .populate("wareHouseId");

        const getAllWareHouseExport = await ExportOrder.find({
          isDeleted: { "!=": true },
          type: "X",
          status: 2,
          isDeleted: false,
        })
          .sort("createdAt")
          .populate("wareHouseId");

        // if (!getAllWareHouseImport || getAllWareHouseImport == '' || getAllWareHouseImport == null) {
        //     return res.json({
        //         status: false,
        //         message: 'Không tìm thấy nhập kho nào.'
        //     });
        // }

        // if (!getAllWareHouseExport || getAllWareHouseExport == '' || getAllWareHouseExport == null) {
        //     return res.json({
        //         status: false,
        //         message: 'Không tìm thấy xuất kho nào.'
        //     });
        // }

        const warehouseId = [];
        const warehouseName = [];
        for (let i = 0; i < getAllWareHouseImport.length; i++) {
          let temp = 0;
          for (let j = 0; j < warehouseId.length; j++) {
            getAllWareHouseImport[i].wareHouseId.id == warehouseId[j]
              ? (temp = 1)
              : temp;
          }
          temp == 0
            ? warehouseId.push(getAllWareHouseImport[i].wareHouseId.id)
            : warehouseId;
          temp == 0
            ? warehouseName.push(getAllWareHouseImport[i].wareHouseId.name)
            : warehouseName;
        }

        for (let i = 0; i < getAllWareHouseExport.length; i++) {
          let temp = 0;
          for (let j = 0; j < warehouseId.length; j++) {
            getAllWareHouseExport[i].wareHouseId.id == warehouseId[j]
              ? (temp = 1)
              : temp;
          }
          temp == 0
            ? warehouseId.push(getAllWareHouseExport[i].wareHouseId.id)
            : warehouseId;
          temp == 0
            ? warehouseName.push(getAllWareHouseExport[i].wareHouseId.name)
            : warehouseName;
        }

        const resultarr = [];
        const importarr = [];
        const exportarr = [];
        const beforearr = [];

        for (let i = 0; i < warehouseId.length; i++) {
          const getAllWareHouseImportWareHouse = await ExportOrder.find({
            isDeleted: { "!=": true },
            wareHouseId: warehouseId[i],
            type: "N",
            status: 2,
            isDeleted: false,
          }).sort("createdAt");

          const getAllWareHouseExportWareHouse = await ExportOrder.find({
            isDeleted: { "!=": true },
            wareHouseId: warehouseId[i],
            type: "X",
            status: 2,
            isDeleted: false,
          }).sort("createdAt");
          // if (!getAllWareHouseImportWareHouse || getAllWareHouseImportWareHouse == '' || getAllWareHouseImportWareHouse == null) {
          //     return res.json({
          //         status: false,
          //         message: 'Không tìm thấy nhập kho nào.'
          //     });
          // }

          // if (!getAllWareHouseExportWareHouse || getAllWareHouseExportWareHouse == '' || getAllWareHouseExportWareHouse == null) {
          //     return res.json({
          //         status: false,
          //         message: 'Không tìm thấy xuất kho nào.'
          //     });
          // }

          let before = 0;
          let afterimport = 0;
          let afterexport = 0;
          for (let i = 0; i < getAllWareHouseImportWareHouse.length; i++) {
            let checkDate = new Date(
              getAllWareHouseImportWareHouse[i].createdAt
            ).valueOf();
            if (checkDate < start) {
              const sum =
                getAllWareHouseImportWareHouse[i].full -
                getAllWareHouseImportWareHouse[i].empty;
              before += sum;
              continue;
            }
            if (checkDate >= start && checkDate <= end) {
              afterimport +=
                getAllWareHouseImportWareHouse[i].full -
                getAllWareHouseImportWareHouse[i].empty;
            } else {
              break;
            }
          }

          for (let i = 0; i < getAllWareHouseExportWareHouse.length; i++) {
            let checkDate = new Date(
              getAllWareHouseExportWareHouse[i].createdAt
            ).valueOf();
            if (checkDate < start) {
              before -=
                getAllWareHouseExportWareHouse[i].full -
                getAllWareHouseExportWareHouse[i].empty;
              continue;
            }
            if (checkDate >= start && checkDate <= end) {
              afterexport +=
                getAllWareHouseExportWareHouse[i].full -
                getAllWareHouseExportWareHouse[i].empty;
            } else {
              break;
            }
          }

          const result = before + afterimport - afterexport;
          await resultarr.push(result);
          await importarr.push(afterimport);
          await exportarr.push(afterexport);
          await beforearr.push(before);
        }

        return res.json({
          status: true,
          WareHouseName: warehouseName,
          BeforeImport: beforearr,
          Import: importarr,
          Export: exportarr,
          AfterImportExport: resultarr,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  manageWareHouse: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const manageIEWareHouse = {
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
      };

      if (!manageIEWareHouse.fromDate) {
        return res.json({
          status: false,
          message: "Date From is required",
        });
      }

      if (!manageIEWareHouse.toDate) {
        return res.json({
          status: false,
          message: "Date To is required",
        });
      }

      const start = new Date(manageIEWareHouse.fromDate).valueOf();
      const end = new Date(manageIEWareHouse.toDate).valueOf();

      const _startDate = new Date(manageIEWareHouse.fromDate);
      const endDate = new Date(manageIEWareHouse.toDate);

      const diffTime = Math.abs(endDate - _startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      console.log(diffDays);

      if (start > end) {
        return res.json({
          status: false,
          message: "Lỗi...Ngày bắt đầu không được nhỏ hơn ngày kết thúc.",
        });
      }

      const getAllWareHouseImport = await ExportOrder.find({
        isDeleted: { "!=": true },
        type: "N",
        status: 2,
        isDeleted: false,
      })
        .sort("createdAt")
        .populate("wareHouseId");

      const getAllWareHouseExport = await ExportOrder.find({
        isDeleted: { "!=": true },
        type: "X",
        status: 2,
        isDeleted: false,
      })
        .sort("createdAt")
        .populate("wareHouseId");

      // if (!getAllWareHouseImport || getAllWareHouseImport == '' || getAllWareHouseImport == null) {
      //     return res.json({
      //         status: false,
      //         message: 'Không tìm thấy nhập kho nào.'
      //     });
      // }

      // if (!getAllWareHouseExport || getAllWareHouseExport == '' || getAllWareHouseExport == null) {
      //     return res.json({
      //         status: false,
      //         message: 'Không tìm thấy xuất kho nào.'
      //     });
      // }

      const warehouseId = [];
      const warehouseName = [];
      for (let i = 0; i < getAllWareHouseImport.length; i++) {
        let temp = 0;
        for (let j = 0; j < warehouseId.length; j++) {
          getAllWareHouseImport[i].wareHouseId.id == warehouseId[j]
            ? (temp = 1)
            : temp;
        }
        temp == 0
          ? warehouseId.push(getAllWareHouseImport[i].wareHouseId.id)
          : warehouseId;
        temp == 0
          ? warehouseName.push(getAllWareHouseImport[i].wareHouseId.name)
          : warehouseName;
      }

      for (let i = 0; i < getAllWareHouseExport.length; i++) {
        let temp = 0;
        for (let j = 0; j < warehouseId.length; j++) {
          getAllWareHouseExport[i].wareHouseId.id == warehouseId[j]
            ? (temp = 1)
            : temp;
        }
        temp == 0
          ? warehouseId.push(getAllWareHouseExport[i].wareHouseId.id)
          : warehouseId;
        temp == 0
          ? warehouseName.push(getAllWareHouseExport[i].wareHouseId.name)
          : warehouseName;
      }

      const _result = [];

      for (let i = -1; i < diffDays; i++) {
        console.log(getValueOfDate(_startDate, i));

        const resultarr = [];
        const importarr = [];
        const exportarr = [];
        const beforearr = [];

        for (let i = 0; i < warehouseId.length; i++) {
          const getAllWareHouseImportWareHouse = await ExportOrder.find({
            isDeleted: { "!=": true },
            wareHouseId: warehouseId[i],
            type: "N",
            status: 2,
            isDeleted: false,
          }).sort("createdAt");

          const getAllWareHouseExportWareHouse = await ExportOrder.find({
            isDeleted: { "!=": true },
            wareHouseId: warehouseId[i],
            type: "X",
            status: 2,
            isDeleted: false,
          }).sort("createdAt");
          // if (!getAllWareHouseImportWareHouse || getAllWareHouseImportWareHouse == '' || getAllWareHouseImportWareHouse == null) {
          //     return res.json({
          //         status: false,
          //         message: 'Không tìm thấy nhập kho nào.'
          //     });
          // }

          // if (!getAllWareHouseExportWareHouse || getAllWareHouseExportWareHouse == '' || getAllWareHouseExportWareHouse == null) {
          //     return res.json({
          //         status: false,
          //         message: 'Không tìm thấy xuất kho nào.'
          //     });
          // }

          let before = 0;
          let afterimport = 0;
          let afterexport = 0;
          for (let i = 0; i < getAllWareHouseImportWareHouse.length; i++) {
            let checkDate = new Date(
              getAllWareHouseImportWareHouse[i].createdAt
            ).valueOf();
            if (checkDate < getValueOfDate(_startDate, i).valueOf()) {
              const sum =
                getAllWareHouseImportWareHouse[i].full -
                getAllWareHouseImportWareHouse[i].empty;
              before += sum;
              continue;
            }
            if (
              checkDate >= getValueOfDate(_startDate, i).valueOf() &&
              checkDate <= getValueOfDate(_startDate, i + 1).valueOf()
            ) {
              afterimport +=
                getAllWareHouseImportWareHouse[i].full -
                getAllWareHouseImportWareHouse[i].empty;
            } else {
              break;
            }
          }

          for (let i = 0; i < getAllWareHouseExportWareHouse.length; i++) {
            let checkDate = new Date(
              getAllWareHouseExportWareHouse[i].createdAt
            ).valueOf();
            if (checkDate < getValueOfDate(_startDate, i).valueOf()) {
              before -=
                getAllWareHouseExportWareHouse[i].full -
                getAllWareHouseExportWareHouse[i].empty;
              continue;
            }
            if (
              checkDate >= getValueOfDate(_startDate, i).valueOf() &&
              checkDate <= getValueOfDate(_startDate, i + 1).valueOf()
            ) {
              afterexport +=
                getAllWareHouseExportWareHouse[i].full -
                getAllWareHouseExportWareHouse[i].empty;
            } else {
              break;
            }
          }

          const result = before + afterimport - afterexport;
          await resultarr.push(result);
          // await importarr.push(afterimport);
          // await exportarr.push(afterexport);
          // await beforearr.push(before);
        }

        const data = {
          date:
            getValueOfDate(_startDate, i + 1).getDate() +
            "/" +
            (getValueOfDate(_startDate, i + 1).getMonth() + 1),
          WareHouseName: warehouseName,
          // WareHouseID: warehouseId,
          // BeforeImport: beforearr,
          // Import: importarr,
          // Export: exportarr,
          AfterImportExport: resultarr,
        };

        _result.push(data);
      }

      return res.json({
        status: true,
        Result: _result,
      });
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },
};

// Lấy giá trị Date
function getValueOfDate(date, index) {
  const _date = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + index
  );
  return _date;
}
