/**
 * TruckController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const ReportServices = require("../services/ReportService");
//const USER_TYPES = require('../constants/UserTypes');
const excel = require("node-excel-export");
const styles = {
  headerDark: {
    fill: {
      fgColor: {
        rgb: "FF000000",
      },
    },
    font: {
      color: {
        rgb: "FFFFFFFF",
      },
      sz: 14,
      bold: true,
      underline: true,
    },
  },
  cellPink: {
    fill: {
      fgColor: {
        rgb: "FFFFCCFF",
      },
    },
  },
  cellGreen: {
    fill: {
      fgColor: {
        rgb: "FF00FF00",
      },
    },
  },
};
module.exports = {
  createTruck: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { license_plate, load_capacity, userId } = req.body;

    if (!license_plate) {
      return res.badRequest(Utils.jsonErr("License plate is required"));
    }
    if (!load_capacity) {
      return res.badRequest(Utils.jsonErr("Load capacity is required"));
    }
    if (!userId) {
      return res.badRequest(Utils.jsonErr("ID is required"));
    }

    try {
      const result = await Truck.create({
        license_plate,
        load_capacity,
        owner: userId,
      }).fetch();

      if (result.hasOwnProperty("license_plate")) {
        return res.json({
          success: true,
          data: result,
          message: "Thêm xe thành công",
        });
      } else {
        return res.json({ success: false, message: "Thêm xe thất bại" });
      }
    } catch (error) {
      return res.json({ success: false, message: "Gặp lỗi khi thêm xe" });
    }
  },

  getListTruck: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id } = req.body;

    if (!id) {
      return res.badRequest(Utils.jsonErr("ID is required"));
    }

    try {
      const result = await Truck.find({ isDeleted: { "!=": true }, owner: id });

      if (result.length > 0) {
        return res.json({
          success: true,
          data: result,
          message: "Lấy danh sách xe thành công",
        });
      } else {
        return res.json({
          success: false,
          message: "Lấy danh sách xe thất bại",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: "Gặp lỗi khi lấy danh sách xe",
      });
    }
  },

  updateTruck: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { truckId, license_plate, load_capacity } = req.body;

    if (!truckId) {
      return res.badRequest(Utils.jsonErr("Truck ID is required"));
    }
    if (!(license_plate && load_capacity)) {
      return res.badRequest(Utils.jsonErr("No information to update"));
    }

    dataUpdate = {};

    if (license_plate) dataUpdate.license_plate = license_plate;
    if (load_capacity) dataUpdate.load_capacity = load_capacity;

    try {
      const result = await Truck.updateOne({
        isDeleted: { "!=": true },
        _id: truckId,
      }).set(dataUpdate);

      if (result) {
        return res.json({
          success: true,
          data: result,
          message: "Cập nhật xe thành công",
        });
      } else {
        return res.json({ success: false, message: "Cập nhật xe thất bại" });
      }
    } catch (error) {
      return res.json({ success: false, message: "Gặp lỗi khi cập nhật xe" });
    }
  },
  delTruck: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const TruckID = req.body.TruckID;

      const chkTruck = await Truck.findOne({
        isDeleted: { "!=": true },
        _id: TruckID,
        isDeleted: false,
      });
      if (!chkTruck) {
        return res.json({
          success: false,
          message: "không tìm thấy xe",
        });
      }

      const cancelTruck = await Truck.updateOne({
        isDeleted: { "!=": true },
        _id: TruckID,
        isDeleted: false,
      }).set({
        isDeleted: true,
      });
      if (!cancelTruck || cancelTruck == null || chkTruck == "") {
        return res.json({
          success: false,
          message: "xóa không thành không",
        });
      } else {
        return res.json({
          success: true,
          message: "xóa thành công",
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },
  getExcelTruck: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id } = req.body;

    if (!id) {
      // return res.json({ success: false, message: 'Thiếu id' });
      return res.badRequest(Utils.jsonErr("Thiếu id"));
    }

    try {
      const heading = [["Danh sách xe"]];

      let specification;
      specification = {
        licensePlate: {
          // <- the key should match the actual data key
          displayName: "Biển số xe", // <- Here you specify the column header
          headerStyle: styles.cellGreen, // <- Header style
          // cellStyle: function(value, row) { // <- style renderer function
          //   // if the status is 1 then color in green else color in red
          //   // Notice how we use another cell value to style the current one
          //   return (row.status_id === 1) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}}; // <- Inline cell style is possible
          // },
          width: 120, // <- width in pixels
        },
        loadCapacity: {
          displayName: "Trọng tải của xe",
          headerStyle: styles.cellGreen,
          // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
          //   return (value === 1) ? 'Active' : 'Inactive';
          // },
          width: 100, // <- width in chars (when the number is passed as string)
        },
      };

      const dataSet = await ReportServices.getDataForTruck(id);

      const report = excel.buildExport([
        // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
        {
          name: "Report", // <- Specify sheet name (optional)
          heading: heading, // <- Raw heading array (optional)
          specification: specification,
          data: dataSet, // <-- Report data
        },
      ]);

      res.setHeader("Content-disposition", "attachment; filename=report.xlsx");
      res.setHeader(
        "Content-type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      return res.send(report);
    } catch (err) {
      return res.json({
        status: false,
        message: "Xảy ra lỗi trong quá trình xuất dữ liệu xe",
      });
    }
  },
};
