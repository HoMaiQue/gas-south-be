/**
 * CylinderImexController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const USER_TYPE = require("../constants/UserTypes");
const USER_ROLE = require("../constants/UserRoles");
const mongoose = require("mongoose");
const { forEach } = require("async");
const ObjectId = mongoose.Types.ObjectId;
const CylinderImexService = require("../services/CylinderImexService");

const excel = require("node-excel-export");
const styles = {
  headerDark: {
    fill: {
      fgColor: {
        rgb: "FF8ac2ce",
      },
    },
    font: {
      color: {
        rgb: "FF000000",
      },
      sz: 14,
      bold: true,
      // underline: true
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
  // Bản đồ phân phối
  locationCylindersImex: async function (req, res) {
    try {
      const objectId = req.query.objectId;
      const currentDate = new Date();
      // const startDate = new Date(currentDate.getFullYear(),currentDate.getMonth(),01);

      //Tìm theo objectId và ngày
      if (objectId) {
        const checkUser = await User.findOne({
          isDeleted: { "!=": true },
          _id: objectId,
          isDeleted: false,
        });

        const _result = [];
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
            isDeleted: false,
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
                isDeleted: false,
              });

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
          const _factory = await User.find({
            isDeleted: { "!=": true },
            isChildOf: checkUser.id,
            // owner: id,
            // stationType,
            userType: "Factory",
            userRole: "Owner",
            isDeleted: false,
          });

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
          const factory = await User.findOne({
            isDeleted: { "!=": true },
            _id: checkUser.id,
            // owner: id,
            // stationType,
            userType: "Factory",
            userRole: "Owner",
            isDeleted: false,
          });

          _result.push(factory);

          const _factory = await User.find({
            isDeleted: { "!=": true },
            isChildOf: checkUser.id,
            // owner: id,
            // stationType,
            userType: ["General", "Agency"],
            userRole: "SuperAdmin",
            isDeleted: false,
          });

          forEach(_factory, (element) => {
            !element || element === null || element === ""
              ? _result
              : _result.push(element);
          });
        }

        if (_result.length === 0) {
          return res.json({
            success: false,
            message: "Không tìm thấy trạm nào.",
          });
        }
        const result_Factory = [];
        await Promise.all(
          _result.map(async (factory) => {
            // Bình khai báo mới
            const total_Declaration = await CylinderImex.count({
              objectId: factory.id,
              //  category: category.id,
              typeImex: "IN",
              flow: "CREATE",
              //  condition: condition,
              createdAt: {
                //   '>=': startDate.toISOString(),
                "<=": currentDate.toISOString(),
              },
              // isDeleted: false,
            });

            // Bình đã xuất
            const total_Export = await CylinderImex.count({
              objectId: factory.id,
              // category: category.id,
              typeImex: "OUT",
              flow: "EXPORT",
              // condition: condition,
              createdAt: {
                // '>=': startDate.toISOString(),
                "<=": currentDate.toISOString(),
              },
              // isDeleted: false,
            });

            // Bình hồi lưu
            const total_TURN_BACK = await CylinderImex.count({
              objectId: factory.id,
              // category: category.id,
              typeImex: "IN",
              flow: "TURN_BACK",
              // condition: condition,
              createdAt: {
                // '>=': startDate.toISOString(),
                "<=": currentDate.toISOString(),
              },
              // isDeleted: false,
            });

            // Bình tồn kho
            const result_IN = await CylinderImex.count({
              objectId: factory.id,
              // category: category.id,
              typeImex: "IN",
              // condition: condition,
              createdAt: {
                //'>=': new Date(0).toISOString(),
                "<=": currentDate.toISOString(),
              },
              // isDeleted: false,
            });

            const result_OUT = await CylinderImex.count({
              objectId: factory.id,
              // category: category.id,
              typeImex: "OUT",
              // condition: condition,
              createdAt: {
                //'>=': new Date(0).toISOString(),
                "<=": currentDate.toISOString(),
              },
              // isDeleted: false,
            });

            const data = {
              Factory_Name: factory.name,
              LAT: factory.LAT,
              LNG: factory.LNG,
              Declaration: total_Declaration,
              Export: total_Export,
              TURN_BACK: total_TURN_BACK,
              Inventory: result_IN - result_OUT,
            };

            result_Factory.push(data);
          })
        );

        return res.json({
          success: true,
          Factories: result_Factory,
        });
      } else {
        return res.json({
          success: false,
          message: "Dữ liệu truyền lên bị thiếu.",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Báo cáo thống kê bình
  searchCylindersImex: async function (req, res) {
    try {
      const objectId = req.query.objectId;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      const condition = req.query.condition;

      //Tìm theo objectId và ngày
      if (objectId && startDate && endDate && condition) {
        // const start = new Date(startDate).valueOf();
        // const end = new Date(endDate).valueOf();

        // if (start > end) {
        //     return res.json({
        //         success: false,
        //         message: 'Lỗi...Ngày bắt đầu không được nhỏ hơn ngày kết thúc.'
        //     });
        // }

        // Tìm parentRoot
        const parent = await getRootParent(objectId);

        const _category = await CategoryCylinder.find({
          isDeleted: { "!=": true },
          createdBy: parent,
        }).sort("code ASC");

        // Bình khai báo mới
        const result_Declaration = [];
        await Promise.all(
          _category.map(async (category) => {
            const total = await CylinderImex.count({
              objectId: objectId,
              category: category.id,
              typeImex: "IN",
              flow: "CREATE",
              condition: condition,
              createdAt: {
                ">=": startDate,
                "<=": endDate,
              },
              //isDeleted: false,
            });

            const data = {
              id: category.id,
              code: category.code,
              name: category.name,
              number: total,
            };

            result_Declaration.push(data);
          })
        );

        sortArray(result_Declaration);

        // Bình đã xuất
        const result_Export = [];
        await Promise.all(
          _category.map(async (category) => {
            const total = await CylinderImex.count({
              objectId: objectId,
              category: category.id,
              typeImex: "OUT",
              flow: "EXPORT_CELL",
              condition: condition,
              createdAt: {
                ">=": startDate,
                "<=": endDate,
              },
              //isDeleted: false,
            });

            const data = {
              id: category.id,
              code: category.code,
              name: category.name,
              number: total,
            };

            result_Export.push(data);
          })
        );

        sortArray(result_Export);

        // Bình tồn kho
        const result_Declaration_NEW = [];
        await Promise.all(
          _category.map(async (category) => {
            const total = await CylinderImex.count({
              objectId: objectId,
              category: category.id,
              typeImex: "IN",
              condition: condition,
              createdAt: {
                ">=": new Date(0).toISOString(),
                "<=": endDate,
              },
              //isDeleted: false,
            });

            const data = {
              id: category.id,
              code: category.code,
              name: category.name,
              number: total,
            };

            result_Declaration_NEW.push(data);
          })
        );

        sortArray(result_Declaration_NEW);

        const result_Export_NEW = [];
        await Promise.all(
          _category.map(async (category) => {
            const total = await CylinderImex.count({
              objectId: objectId,
              category: category.id,
              typeImex: "OUT",
              condition: condition,
              createdAt: {
                ">=": new Date(0).toISOString(),
                "<=": endDate,
              },
              //isDeleted: false,
            });

            const data = {
              id: category.id,
              code: category.code,
              name: category.name,
              number: total,
            };

            result_Export_NEW.push(data);
          })
        );

        sortArray(result_Export_NEW);

        const result_Inventory = [];
        for (let i = 0; i < result_Declaration_NEW.length; i++) {
          const data = {
            id: result_Declaration_NEW[i].id,
            code: result_Declaration_NEW[i].code,
            name: result_Declaration_NEW[i].name,
            number:
              result_Declaration_NEW[i].number - result_Export_NEW[i].number,
          };

          result_Inventory.push(data);
        }

        // sortArray(result_Inventory);

        return res.json({
          success: true,
          Declaration: result_Declaration,
          Export: result_Export,
          Inventory: result_Inventory,
        });
      } else {
        return res.json({
          success: false,
          message: "Dữ liệu truyền lên bị thiếu.",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Xem chi tiết bình trong báo cáo thống kê
  detailCylindersImex: async function (req, res) {
    try {
      const objectId = req.body.objectId;
      const startDate = req.body.startDate;
      const endDate = req.body.endDate;
      const condition = req.body.condition;
      const typeImex = req.body.typeImex;
      const flow = req.body.flow;
      const categoryID = req.body.categoryID;
      const page = req.body.page ? req.body.page : 1;
      const limit = req.body.limit ? req.body.limit : 10;

      //Tìm theo objectId và ngày
      if (objectId && startDate && endDate && condition) {
        if (flow && typeof flow !== "undefined" && typeof flow !== null) {
          if (
            categoryID &&
            typeof categoryID !== "undefined" &&
            typeof categoryID !== null
          ) {
            const _cylindersImexCount = await CylinderImex.count({
              objectId: objectId,
              category: categoryID,
              typeImex: typeImex,
              flow: flow,
              condition: condition,
              createdAt: {
                ">=": startDate,
                "<=": endDate,
              },
              isDeleted: false,
            });

            const _cylindersImex = await CylinderImex.find({
              isDeleted: { "!=": true },
              objectId: objectId,
              category: categoryID,
              typeImex: typeImex,
              flow: flow,
              condition: condition,
              createdAt: {
                ">=": startDate,
                "<=": endDate,
              },
              isDeleted: false,
            })
              .limit(limit)
              .skip((page - 1) * limit);

            const result_Cylinders = [];
            await Promise.all(
              _cylindersImex.map(async (cylinder) => {
                const _cylinder = await Cylinder.findOne({
                  isDeleted: { "!=": true },
                  _id: cylinder.cylinder,
                  isDeleted: false,
                })
                  .populate("manufacture")
                  .populate("category");

                const data = {
                  id: _cylinder.id,
                  serial: _cylinder.serial,
                  color: _cylinder.color,
                  valve: _cylinder.valve,
                  weight: _cylinder.weight,
                  checkedDate: _cylinder.checkedDate,
                  manufacture: _cylinder.manufacture.name,
                  category: _cylinder.category.name,
                };

                result_Cylinders.push(data);
              })
            );

            sortArrayDetail(result_Cylinders);

            return res.json({
              success: true,
              Cylinders: result_Cylinders,
              Cylinders_Count: _cylindersImexCount,
            });
          } else {
            const _cylindersImexCount = await CylinderImex.count({
              objectId: objectId,
              typeImex: typeImex,
              flow: flow,
              condition: condition,
              createdAt: {
                ">=": startDate,
                "<=": endDate,
              },
              isDeleted: false,
            });

            const _cylindersImex = await CylinderImex.find({
              isDeleted: { "!=": true },
              objectId: objectId,
              typeImex: typeImex,
              flow: flow,
              condition: condition,
              createdAt: {
                ">=": startDate,
                "<=": endDate,
              },
              isDeleted: false,
            })
              .limit(limit)
              .skip((page - 1) * limit);

            const result_Cylinders = [];
            await Promise.all(
              _cylindersImex.map(async (cylinder) => {
                const _cylinder = await Cylinder.findOne({
                  isDeleted: { "!=": true },
                  _id: cylinder.cylinder,
                  isDeleted: false,
                })
                  .populate("manufacture")
                  .populate("category");

                const data = {
                  id: _cylinder.id,
                  serial: _cylinder.serial,
                  color: _cylinder.color,
                  valve: _cylinder.valve,
                  weight: _cylinder.weight,
                  checkedDate: _cylinder.checkedDate,
                  manufacture: _cylinder.manufacture.name,
                  category: _cylinder.category.name,
                };

                result_Cylinders.push(data);
              })
            );

            sortArrayDetail(result_Cylinders);

            return res.json({
              success: true,
              Cylinders: result_Cylinders,
              Cylinders_Count: _cylindersImexCount,
            });
          }
        } else {
          if (
            categoryID &&
            typeof categoryID !== "undefined" &&
            typeof categoryID !== null
          ) {
            const _cylindersImex_IN = await CylinderImex.find({
              isDeleted: { "!=": true },
              objectId: objectId,
              category: categoryID,
              typeImex: "IN",
              condition: condition,
              createdAt: {
                ">=": new Date(0).toISOString(),
                "<=": endDate,
              },
              isDeleted: false,
            });

            const _cylindersImex_OUT = await CylinderImex.find({
              isDeleted: { "!=": true },
              objectId: objectId,
              category: categoryID,
              typeImex: "OUT",
              condition: condition,
              createdAt: {
                ">=": new Date(0).toISOString(),
                "<=": endDate,
              },
              isDeleted: false,
            });

            const result_Inventory = [];
            for (let i = 0; i < _cylindersImex_IN.length; i++) {
              let temp = 0;
              for (let j = 0; j < _cylindersImex_OUT.length; j++) {
                if (
                  _cylindersImex_IN[i].cylinder ===
                  _cylindersImex_OUT[j].cylinder
                ) {
                  temp++;
                  break;
                }
              }
              if (temp === 0) {
                result_Inventory.push(_cylindersImex_IN[i]);
              }
            }

            const result_Cylinders = [];
            // await Promise.all(result_Inventory.map(async cylinder => {
            //     const _cylinder = await Cylinder.findOne({isDeleted: {"!=": true},
            //         _id: cylinder.cylinder,
            //         isDeleted: false
            //     })
            //     .populate('manufacture')
            //     .populate('category')

            //     const data = {
            //         id: _cylinder.id,
            //         serial: _cylinder.serial,
            //         color: _cylinder.color,
            //         valve: _cylinder.valve,
            //         weight: _cylinder.weight,
            //         checkedDate: _cylinder.checkedDate,
            //         manufacture: _cylinder.manufacture.name,
            //         category: _cylinder.category.name
            //     };

            //     result_Cylinders.push(data);
            // }))

            let c = 0;
            for (let i = (page - 1) * limit; c !== limit; i++) {
              c++;
              if (result_Inventory[i]) {
                const _cylinder = await Cylinder.findOne({
                  isDeleted: { "!=": true },
                  _id: result_Inventory[i].cylinder,
                  isDeleted: false,
                })
                  .populate("manufacture")
                  .populate("category");

                const data = {
                  id: _cylinder.id,
                  serial: _cylinder.serial,
                  color: _cylinder.color,
                  valve: _cylinder.valve,
                  weight: _cylinder.weight,
                  checkedDate: _cylinder.checkedDate,
                  manufacture: _cylinder.manufacture.name,
                  category: _cylinder.category.name,
                };

                result_Cylinders.push(data);
              }
            }

            sortArrayDetail(result_Cylinders);

            return res.json({
              success: true,
              Cylinders: result_Cylinders,
              Cylinders_Count: result_Inventory.length,
            });
          } else {
            const _cylindersImex_IN = await CylinderImex.find({
              isDeleted: { "!=": true },
              objectId: objectId,
              // category: categoryID,
              typeImex: "IN",
              condition: condition,
              createdAt: {
                ">=": new Date(0).toISOString(),
                "<=": endDate,
              },
              isDeleted: false,
            });

            const _cylindersImex_OUT = await CylinderImex.find({
              isDeleted: { "!=": true },
              objectId: objectId,
              // category: categoryID,
              typeImex: "OUT",
              condition: condition,
              createdAt: {
                ">=": new Date(0).toISOString(),
                "<=": endDate,
              },
              isDeleted: false,
            });

            const result_Inventory = [];
            for (let i = 0; i < _cylindersImex_IN.length; i++) {
              let temp = 0;
              for (let j = 0; j < _cylindersImex_OUT.length; j++) {
                if (
                  _cylindersImex_IN[i].cylinder ===
                  _cylindersImex_OUT[j].cylinder
                ) {
                  temp++;
                  break;
                }
              }
              if (temp === 0) {
                result_Inventory.push(_cylindersImex_IN[i]);
              }
            }

            const result_Cylinders = [];
            // await Promise.all(result_Inventory.map(async cylinder => {
            //     const _cylinder = await Cylinder.findOne({isDeleted: {"!=": true},
            //         _id: cylinder.cylinder,
            //         isDeleted: false
            //     })
            //     .populate('manufacture')
            //     .populate('category')

            //     const data = {
            //         id: _cylinder.id,
            //         serial: _cylinder.serial,
            //         color: _cylinder.color,
            //         valve: _cylinder.valve,
            //         weight: _cylinder.weight,
            //         checkedDate: _cylinder.checkedDate,
            //         manufacture: _cylinder.manufacture.name,
            //         category: _cylinder.category.name
            //     };

            //     result_Cylinders.push(data);
            // }))

            let c = 0;
            for (let i = (page - 1) * limit; c !== limit; i++) {
              c++;
              if (result_Inventory[i]) {
                const _cylinder = await Cylinder.findOne({
                  isDeleted: { "!=": true },
                  _id: result_Inventory[i].cylinder,
                  isDeleted: false,
                })
                  .populate("manufacture")
                  .populate("category");

                const data = {
                  id: _cylinder.id,
                  serial: _cylinder.serial,
                  color: _cylinder.color,
                  valve: _cylinder.valve,
                  weight: _cylinder.weight,
                  checkedDate: _cylinder.checkedDate,
                  manufacture: _cylinder.manufacture.name,
                  category: _cylinder.category.name,
                };

                result_Cylinders.push(data);
              }
            }

            sortArrayDetail(result_Cylinders);

            return res.json({
              success: true,
              Cylinders: result_Cylinders,
              Cylinders_Count: result_Inventory.length,
            });
          }
        }
      } else {
        return res.json({
          success: false,
          message: "Dữ liệu truyền lên bị thiếu.",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Xuất Excels chi tiết bình trong báo cáo thống kê
  getDetailCylindersImexExcels: async function (req, res) {
    try {
      const objectId = req.body.objectId;
      const startDate = req.body.startDate;
      const endDate = req.body.endDate;
      const condition = req.body.condition;
      const typeImex = req.body.typeImex;
      const flow = req.body.flow;
      const categoryID = req.body.categoryID;

      const heading = [["Danh sách chi tiết bình trong báo cáo thống kê."]];

      let specification = {
        serial: {
          // <- the key should match the actual data key
          displayName: "Số Seri", // <- Here you specify the column header
          headerStyle: styles.cellGreen, // <- Header style
          // cellStyle: function(value, row) { // <- style renderer function
          //   // if the status is 1 then color in green else color in red
          //   // Notice how we use another cell value to style the current one
          //   return (row.status_id === 1) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}}; // <- Inline cell style is possible
          // },
          width: 120, // <- width in pixels
        },
        color: {
          displayName: "Màu Sắc",
          headerStyle: styles.cellGreen,
          // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
          //   return (value === 1) ? 'Active' : 'Inactive';
          // },
          width: 100, // <- width in chars (when the number is passed as string)
        },
        valve: {
          displayName: "Loại van",
          headerStyle: styles.cellGreen,
          width: 100, // <- width in chars (when the number is passed as string)
        },
        weight: {
          displayName: "Cân nặng",
          headerStyle: styles.cellGreen,
          width: 100, // <- width in chars (when the number is passed as string)
        },
        checkedDate: {
          displayName: "Ngày kiểm định",
          headerStyle: styles.cellGreen,
          // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
          //   return (value === 1) ? 'Active' : 'Inactive';
          // },
          width: 100, // <- width in chars (when the number is passed as string)
        },
        manufacture: {
          displayName: "Thương hiệu",
          headerStyle: styles.cellGreen,
          // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
          //   return (value === 1) ? 'Active' : 'Inactive';
          // },
          width: 100, // <- width in chars (when the number is passed as string)
        },
        category: {
          displayName: "Loại bình",
          headerStyle: styles.cellGreen,
          width: 100, // <- width in chars (when the number is passed as string)
        },
      };

      const dataSet = await CylinderImexService.getDataForDetailCylinderImex(
        objectId,
        startDate,
        endDate,
        condition,
        typeImex,
        flow,
        categoryID
      );

      if (dataSet === -1) {
        return res.json({
          success: false,
          message: "Dữ liệu truyền lên bị thiếu.",
        });
      }

      const report = excel.buildExport([
        // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
        {
          name: "Báo cáo thống kê", // <- Specify sheet name (optional)
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
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Tính [action] của [target] theo ngày
  // Có thể phân loại bình theo [searchs]
  getExport: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      target, // Id
      action, // isIn: ['CREATED_CYLINDER', 'IN_CYLINDER',
      // 'OUT_CYLINDER', 'EXPORT_CYLINDER',
      // 'IMPORT_CYLINDER', 'EXPORT_CELL_CYLINDER',
      // 'IMPORT_CELL_CYLINDER', 'SALE_CYLINDER',
      // 'TURN_BACK_CYLINDER']
      startDate, // ISODate
      endDate, // ISODate
      statisticalType, // isIn: ['byItself', 'byItsChildren']
      // Search theo danh sách loại
      // [
      //     {
      //         type: {isIn: ['WEIGHT', 'COLOR', 'VALVE', 'CLASS']}
      //         contents: {isIn: [...]}
      //     },
      //     {...}
      // ]
      searchs,
    } = req.query;

    let {
      // Nếu thống kê các đơn vị con
      // Sử dụng param dưới để lọc loại đơn vị con cần tính
      // if (Region) => Region, ...đơn vị con
      // if (ALL) => ['Warehouse', 'Fixer', 'General', 'Agency']
      typesOfChildren, // isIn: ['ALL', 'Region', 'Warehouse', 'Fixer', 'General', 'Agency']
    } = req.query;

    if (!target) {
      return res.badRequest(Utils.jsonErr("target is required"));
    }

    if (!action) {
      return res.badRequest(Utils.jsonErr("action is required"));
    } else {
      const _Action = [
        "CREATED_CYLINDER",
        "IN_CYLINDER",
        "OUT_CYLINDER",
        "EXPORT_CYLINDER",
        "IMPORT_CYLINDER",
        "EXPORT_CELL_CYLINDER",
        "IMPORT_CELL_CYLINDER",
        "SALE_CYLINDER",
        "TURN_BACK_CYLINDER",
      ];
      if (!_Action.includes(action)) {
        return res.badRequest(Utils.jsonErr("action is wrong"));
      }
    }

    if (!startDate) {
      return res.badRequest(Utils.jsonErr("startDate is required"));
    }

    if (!endDate) {
      return res.badRequest(Utils.jsonErr("endDate is required"));
    }

    if (!statisticalType) {
      return res.badRequest(Utils.jsonErr("statisticalType is required"));
    } else {
      const typeStatistic = ["byItself", "byItsChildren"];
      if (!typeStatistic.includes(statisticalType)) {
        return res.badRequest(Utils.jsonErr("statisticalType is wrong"));
      }

      // Trường hợp thống kê đơn vị con
      if (statisticalType === "byItsChildren") {
        if (!typesOfChildren) {
          return res.badRequest(Utils.jsonErr("typesOfChildren is required"));
        } else {
          // Kiểm tra typesOfChildren là array
          if (!Array.isArray(typesOfChildren)) {
            return res.badRequest(
              Utils.jsonErr("statisticalType is wrong type")
            );
          }
          // Kiểm tra typesOfChildren array rỗng
          if (typesOfChildren.length === 0) {
            return res.badRequest(Utils.jsonErr("typesOfChildren is required"));
          }

          const typeChildren = [
            "ALL",
            "Region",
            "Warehouse",
            "Fixer",
            "General",
            "Agency",
          ];

          for (let i = 0; i < typesOfChildren.length; i++) {
            if (!typeChildren.includes(typesOfChildren[i])) {
              return res.badRequest(
                Utils.jsonErr("typesOfChildren is wrong type")
              );
            }
          }
        }
      }

      // Trường hợp thống kê chính nó
      if (statisticalType === "byItself") {
        // Yêu cầu có thông tin [searchs]
        if (!searchs) {
          return res.badRequest(Utils.jsonErr("searchs is required"));
        }
        // Kiểm tra [searchs] là array
        if (!Array.isArray(searchs)) {
          return res.badRequest(Utils.jsonErr("searchs is wrong type"));
        }
        // // Kiểm tra thành phần property của [searchs]
        // if (!searchs[i].hasOwnProperty('type') || !searchs[i].hasOwnProperty('contents')) {
        //     return res.badRequest(Utils.jsonErr('property of searchs is wrong '));
        // }
        // --- Cần kiểm tra nữa và viết hàm riêng ---
      }
    }

    try {
      const userInfor = await User.findOne({
        isDeleted: { "!=": true },
        id: target,
      });
      if (!userInfor) {
        return res.json({
          status: false,
          resCode: "ERROR-00081",
          data: {},
          message: "Không tìm thấy thông tin người dùng trong hệ thống",
        });
      }

      let _data = [];

      // Thống kê chính nó
      if (statisticalType === "byItself") {
        _data = {
          _key: searchs[0].type,
          success: false,
          message: "",
        };

        // // Danh sách các loại bình
        // const cylinderTypes = ['CYL12KG', 'CYL12KGCO', 'CYL45KG', 'CYL50KG']

        // const searchs = [
        //     {
        //         type: 'WEIGHT',
        //         contents: ['CYL12KG', 'CYL12KGCO', 'CYL45KG', 'CYL50KG'],
        //     },
        //     {
        //         type: 'COLOR',
        //         contents: ['Xám', 'Đỏ', 'Vàng', 'Cam', 'Shell', 'VT', 'Petro'],
        //     },
        //     {
        //         type: 'VALVE',
        //         contents: ['POL', 'COMPACT', '1 VAN', '2 VAN'],
        //     },
        // ]

        // Search cho loại bình (search.type = WEIGHT) đã có collectin danh mục loại bình
        // Cần search cho các loại khác (COLOR, VALVE)
        let searchContents = searchs[0].contents;
        const parent = await getRootParent(userInfor.id);

        let _searchs = [
          {
            type: "WEIGHT",
            contents: ["ALL"],
          },
        ];
        // Danh sách các loại bình
        if (
          _searchs[0].type === "WEIGHT" &&
          _searchs[0].contents.includes("ALL")
        ) {
          const foundType = await CategoryCylinder.find({
            isDeleted: { "!=": true },
            createdBy: parent,
            isDeleted: false,
          });

          if (foundType.length > 0) {
            searchContents = [];
            foundType.forEach((type) => {
              searchContents.push({
                code: type.code,
                name: type.name,
              });
            });
          }
        }

        // // Thống kê từng loại bình
        // const cylinders = await Promise.all(searchContents.map(async searchContent => {
        //     const isReturnCylinders = true
        //     let countData = await _countTotalActionCylinderByType(
        //         target,
        //         action,
        //         startDate,
        //         endDate,
        //         searchs[0].type,
        //         searchContent.code,
        //         isReturnCylinders,
        //     )

        //     if (countData.success) {
        //         if (searchs.length > 1) {
        //             // Sau khi search xong cắt bỏ điều kiện search đầu tiên
        //             const newSearchs = searchs.slice(1)
        //             countData.detail = await _filterCylindersBySearchType(countData.cylinders, newSearchs)
        //         }
        //     }

        //     delete countData.cylinders

        //     return countData
        // }))

        let cylinders = {
          _key: "WEIGHT",
          success: false,
          //"message": "Thành công",
          cylinders: [],
        };

        // Tạo cấu trúc dữ liệu trả về
        await Promise.all(
          searchContents.map(async (content) => {
            try {
              cylinders.cylinders.push({
                success: true,
                code: content.code,
                name: content.name,
                count: 0,
                detail: {
                  _key: "CLASS",
                  success: true,
                  cylinders: [
                    {
                      success: true,
                      code: "New",
                      name: "New",
                      count: 0,
                    },
                    {
                      success: true,
                      code: "Old",
                      name: "Old",
                      count: 0,
                    },
                  ],
                },
              });
            } catch (error) {
              return res.badRequest(Utils.jsonErr(error.message));
            }
          })
        );

        let criteria = {
          objectId: ObjectId(target),
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        };

        switch (action) {
          // Tổng số bình đã tạo
          case "CREATED_CYLINDER":
            criteria = Object.assign(
              {
                typeImex: "IN",
                flow: "CREATE",
              },
              criteria
            );
            break;
          // Tổng số lần nhập bình (khai báo + nhập vỏ + nhập hàng)
          case "IN_CYLINDER":
            criteria = Object.assign(
              {
                typeImex: "IN",
              },
              criteria
            );
            break;
          // Tổng số lần xuất bình (xuất hàng + xuất vỏ)
          case "OUT_CYLINDER":
            criteria = Object.assign(
              {
                typeImex: "OUT",
              },
              criteria
            );
            break;
          // Tổng số lần xuất hàng
          case "EXPORT_CYLINDER":
            criteria = Object.assign(
              {
                typeImex: "OUT",
                flow: "EXPORT",
              },
              criteria
            );
            break;
          // Tổng số lần nhập hàng
          case "IMPORT_CYLINDER":
            criteria = Object.assign(
              {
                typeImex: "IN",
                flow: "IMPORT",
              },
              criteria
            );
            break;
          // Tổng số lần xuất vỏ
          case "EXPORT_CELL_CYLINDER":
            criteria = Object.assign(
              {
                typeImex: "OUT",
                flow: "EXPORT_CELL",
              },
              criteria
            );
            break;
          // Tổng số lần nhập vỏ
          case "IMPORT_CELL_CYLINDER":
            criteria = Object.assign(
              {
                typeImex: "IN",
                flow: "IMPORT_CELL",
              },
              criteria
            );
            break;
          // Tổng số lần bán bình cho người dân
          case "SALE_CYLINDER":
            criteria = Object.assign(
              {
                typeImex: "OUT",
                flow: "SALE",
              },
              criteria
            );
            break;
          // Tổng số lần hồi lưu bình
          case "TURN_BACK_CYLINDER":
            criteria = Object.assign(
              {
                typeImex: "IN",
                flow: "TURN_BACK",
              },
              criteria
            );
            break;
          default:
            break;
        }

        let db = await CylinderImex.getDatastore().manager;
        let _Aggregate = await db
          .collection("cylinderimex")
          .aggregate([
            {
              $match: criteria,
            },
            // {
            //     $lookup:
            //     {
            //         localField: "cylinder",
            //         from: "cylinder",
            //         foreignField: "_id",
            //         as: "cylinderDetail"
            //     }
            // },
            // {
            //     $unwind: {
            //         path: "$cylinderDetail",
            //         preserveNullAndEmptyArrays: false
            //     }
            // },
            {
              $group: {
                _id: {
                  condition: "$condition",
                  category: "$category",
                  typeImex: "$typeImex",
                  flow: "$flow",
                },

                // _id: "$cylinderDetail.classification",
                count: {
                  $sum: 1,
                },
              },
            },
            {
              $lookup: {
                localField: "_id.category",
                from: "categorycylinder",
                foreignField: "_id",
                as: "categorycylinder",
              },
            },
            {
              $unwind: {
                path: "$categorycylinder",
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $project: {
                _id: "$_id",
                count: "$count",
                name: "$categorycylinder.name",
                code: "$categorycylinder.code",
              },
            },
          ])
          .toArray();

        if (_Aggregate.length > 0) {
          await Promise.all(
            _Aggregate.map(async (aggregate) => {
              let indexWeight = cylinders.cylinders.findIndex(
                (el) => el.code === aggregate.code
              );
              let indexClass = cylinders.cylinders[
                indexWeight
              ].detail.cylinders.findIndex(
                (el) =>
                  el.code.toUpperCase() ===
                  aggregate._id.condition.toUpperCase()
              );

              let typeImex = "";
              let flow = [
                "CREATE",
                "EXPORT",
                "IMPORT",
                "EXPORT_CELL",
                "IMPORT_CELL",
                "TURN_BACK",
                "SALE",
                "RETURN",
                "CANCEL",
              ];

              switch (action) {
                // Tổng số bình đã tạo
                case "CREATED_CYLINDER":
                  typeImex = "IN";
                  flow = ["CREATE"];
                  break;
                // Tổng số lần nhập bình (khai báo + nhập vỏ + nhập hàng)
                case "IN_CYLINDER":
                  typeImex = "IN";
                  break;
                // Tổng số lần xuất bình (xuất hàng + xuất vỏ)
                case "OUT_CYLINDER":
                  typeImex = "OUT";
                  break;
                // Tổng số lần xuất hàng
                case "EXPORT_CYLINDER":
                  typeImex = "OUT";
                  flow = ["EXPORT"];
                  break;
                // Tổng số lần nhập hàng
                case "IMPORT_CYLINDER":
                  typeImex = "IN";
                  flow = ["IMPORT"];
                  break;
                // Tổng số lần xuất vỏ
                case "EXPORT_CELL_CYLINDER":
                  typeImex = "OUT";
                  flow = ["EXPORT_CELL"];
                  break;
                // Tổng số lần nhập vỏ
                case "IMPORT_CELL_CYLINDER":
                  typeImex = "IN";
                  flow = ["IMPORT_CELL"];
                  break;
                // Tổng số lần bán bình cho người dân
                case "SALE_CYLINDER":
                  typeImex = "OUT";
                  flow = ["SALE"];
                  break;
                // Tổng số lần hồi lưu bình
                case "TURN_BACK_CYLINDER":
                  typeImex = "IN";
                  flow = ["TURN_BACK"];
                  break;
                default:
                  break;
              }

              if (
                aggregate._id.typeImex === typeImex &&
                flow.includes(aggregate._id.flow)
              ) {
                cylinders.cylinders[indexWeight].detail.cylinders[
                  indexClass
                ].count += aggregate.count;
              }
            })
          );

          const _listWeight = cylinders.cylinders;
          await _listWeight.forEach(async (elementWeight, indexWeight) => {
            const _listClassification =
              cylinders.cylinders[indexWeight].detail.cylinders;
            await _listClassification.forEach(async (elementClass) => {
              cylinders.cylinders[indexWeight].count += elementClass.count;
            });
          });
        }

        cylinders.success = true;
        cylinders.message = "Thành công";

        _data = cylinders;
      }

      // Thống kê đơn vị con
      if (statisticalType === "byItsChildren") {
        // !!! Cần loại bỏ trùng trong array typesOfChildren

        // Trường hợp công ty mẹ thống kê xem số liệu chi nhánh
        if (typesOfChildren.includes("Region")) {
          typesOfChildren = ["Region"];

          _data = await Promise.all(
            typesOfChildren.map(async (type) => {
              let returnData = {
                type: type,
                list: [],
              };

              // Tìm các chi nhánh vùng và nhà máy sửa chữa
              const listRegion = await User.find({
                isDeleted: { "!=": true },
                isChildOf: target,
                userType: { in: ["Region", "Fixer"] },
                userRole: "SuperAdmin",
                isDeleted: false,
              });

              // Cần kiểm tra listRegion.length > 0

              const _dataRegion = await Promise.all(
                listRegion.map(async (region) => {
                  let returnRegionData = {
                    success: false,
                    name: "",
                    id: "",
                    count: 0,
                    message: "",
                  };

                  let criteria = {
                    isChildOf: region.id,
                    userRole: { in: ["SuperAdmin", "Owner"] },
                  };

                  // Tìm các đơn vị con
                  const childs = await User.find(criteria);

                  if (childs.length > 0) {
                    let countRegion = 0;
                    const _dataChilds = await Promise.all(
                      childs.map(async (child) => {
                        const isReturnCylinders = false;
                        let countData = await _countTotalActionCylinder(
                          child.id,
                          action,
                          startDate,
                          endDate,
                          isReturnCylinders
                        );

                        // // Thêm thông tin ID và tên của đơn vị con vào từng Object trả ra
                        // countData.id = child.id
                        // countData.name = child.name

                        // Mẫu
                        // const searchs = [
                        //     {
                        //         type: 'COLOR',
                        //         contents: ['Xám', 'Đỏ', 'Vàng', 'Cam', 'Shell', 'VT', 'Petro'],
                        //     },
                        //     {
                        //         type: 'VALVE',
                        //         contents: ['POL', 'COMPACT', '1 VAN', '2 VAN'],
                        //     },
                        // ]

                        if (searchs) {
                          if (searchs.length > 0 && isReturnCylinders) {
                            countData.detail =
                              await _filterCylindersBySearchType(
                                countData.cylinders,
                                searchs
                              );
                          }
                        }

                        delete countData.cylinders;

                        return countData;
                      })
                    );

                    await Promise.all(
                      _dataChilds.map((element) => {
                        if (element.success) countRegion += element.count;
                      })
                    );

                    returnRegionData.success = true;
                    returnRegionData.name = region.name;
                    returnRegionData.count = countRegion;
                    returnRegionData.message = "Success";
                  } else {
                    returnRegionData.success = true;
                    returnRegionData.name = region.name;
                    returnRegionData.message = "Not found any subsidiary";
                  }

                  return returnRegionData;
                })
              );

              returnData.list = _dataRegion;

              return returnData;
            })
          );
        }
        // Xem thống kê các trường hợp còn lại
        else {
          if (typesOfChildren.includes("ALL")) {
            typesOfChildren = ["Warehouse", "Fixer", "General", "Agency"];
          }

          let objs = [];

          let _listWarehouse = [];
          let _listFixer = [];
          let _listGeneral = [];
          let _listAgency = [];

          let searchContents = searchs[0].contents;
          const parent = await getRootParent(userInfor.id);
          let _searchs = [
            {
              type: "WEIGHT",
              contents: ["ALL"],
            },
          ];
          // Danh sách các loại bình
          if (
            _searchs[0].type === "WEIGHT" &&
            _searchs[0].contents.includes("ALL")
          ) {
            const foundType = await CategoryCylinder.find({
              isDeleted: { "!=": true },
              createdBy: parent,
              isDeleted: false,
            });

            if (foundType.length > 0) {
              searchContents = [];
              foundType.forEach((type) => {
                searchContents.push({
                  code: type.code,
                  name: type.name,
                });
              });
            }
          }

          _data = await Promise.all(
            typesOfChildren.map(async (type) => {
              let returnData = {
                type: type,
                list: [],
              };
              let criteria = {
                isChildOf: userInfor.id,
              };

              switch (type) {
                case "Warehouse":
                  criteria = Object.assign(
                    {
                      userType: { in: ["Factory"] },
                      userRole: { in: ["Owner"] },
                    },
                    criteria
                  );
                  break;
                case "Fixer":
                  criteria = Object.assign(
                    {
                      userType: { in: ["Fixer"] },
                      userRole: { in: ["SuperAdmin"] },
                    },
                    criteria
                  );
                  break;
                case "General":
                  criteria = Object.assign(
                    {
                      userType: { in: ["General"] },
                      userRole: { in: ["SuperAdmin"] },
                    },
                    criteria
                  );
                  break;
                case "Agency":
                  criteria = Object.assign(
                    {
                      userType: { in: ["Agency"] },
                      userRole: { in: ["SuperAdmin"] },
                    },
                    criteria
                  );
                  break;
                default:
                  break;
              }

              // Tìm các đơn vị con
              const childs = await User.find(criteria);

              if (childs.length > 0) {
                const _data = await Promise.all(
                  childs.map(async (child) => {
                    objs.push(ObjectId(child.id));
                    if (type === "Warehouse") {
                      _listWarehouse.push(child.id);
                    } else if (type === "Fixer") {
                      _listFixer.push(child.id);
                    } else if (type === "General") {
                      _listGeneral.push(child.id);
                    } else if (type === "Agency") {
                      _listAgency.push(child.id);
                    }

                    let childDetail = {
                      success: false,
                      count: 0,
                      // "message": "Thành công",
                      id: child.id,
                      name: child.name,
                      detail: {
                        _key: "WEIGHT",
                        success: false,
                        //"message": "Thành công",
                        cylinders: [],
                      },
                    };

                    // Tạo cấu trúc dữ liệu trả về
                    await Promise.all(
                      searchContents.map(async (content) => {
                        try {
                          childDetail.detail.cylinders.push({
                            success: true,
                            code: content.code,
                            name: content.name,
                            count: 0,
                            detail: {
                              _key: "CLASS",
                              success: true,
                              cylinders: [
                                {
                                  success: true,
                                  code: "New",
                                  name: "New",
                                  count: 0,
                                },
                                {
                                  success: true,
                                  code: "Old",
                                  name: "Old",
                                  count: 0,
                                },
                              ],
                            },
                          });
                        } catch (error) {
                          return res.badRequest(Utils.jsonErr(error.message));
                        }
                      })
                    );

                    // const isReturnCylinders = true
                    // let countData = await _countTotalActionCylinder(
                    //     child.id,
                    //     action,
                    //     startDate,
                    //     endDate,
                    //     isReturnCylinders,
                    // )

                    // // Thêm thông tin ID và tên của đơn vị con vào từng Object trả ra
                    // countData.id = child.id
                    // countData.name = child.name

                    // // Mẫu
                    // // const searchs = [
                    // //     {
                    // //         type: 'COLOR',
                    // //         contents: ['Xám', 'Đỏ', 'Vàng', 'Cam', 'Shell', 'VT', 'Petro'],
                    // //     },
                    // //     {
                    // //         type: 'VALVE',
                    // //         contents: ['POL', 'COMPACT', '1 VAN', '2 VAN'],
                    // //     },
                    // // ]

                    // if (searchs) {
                    //     if (searchs.length > 0) {
                    //         countData.detail = await _filterCylindersBySearchType(countData.cylinders, searchs, child.id)
                    //     }
                    // }

                    // delete countData.cylinders

                    return childDetail;
                  })
                );

                returnData.list = _data;
              }

              return returnData;
            })
          );

          let criteria = {
            objectId: { $in: objs },
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          };

          switch (action) {
            // Tổng số bình đã tạo
            case "CREATED_CYLINDER":
              criteria = Object.assign(
                {
                  typeImex: "IN",
                  flow: "CREATE",
                },
                criteria
              );
              break;
            // Tổng số lần nhập bình (khai báo + nhập vỏ + nhập hàng)
            case "IN_CYLINDER":
              criteria = Object.assign(
                {
                  typeImex: "IN",
                },
                criteria
              );
              break;
            // Tổng số lần xuất bình (xuất hàng + xuất vỏ)
            case "OUT_CYLINDER":
              criteria = Object.assign(
                {
                  typeImex: "OUT",
                },
                criteria
              );
              break;
            // Tổng số lần xuất hàng
            case "EXPORT_CYLINDER":
              criteria = Object.assign(
                {
                  typeImex: "OUT",
                  flow: "EXPORT",
                },
                criteria
              );
              break;
            // Tổng số lần nhập hàng
            case "IMPORT_CYLINDER":
              criteria = Object.assign(
                {
                  typeImex: "IN",
                  flow: "IMPORT",
                },
                criteria
              );
              break;
            // Tổng số lần xuất vỏ
            case "EXPORT_CELL_CYLINDER":
              criteria = Object.assign(
                {
                  typeImex: "OUT",
                  flow: "EXPORT_CELL",
                },
                criteria
              );
              break;
            // Tổng số lần nhập vỏ
            case "IMPORT_CELL_CYLINDER":
              criteria = Object.assign(
                {
                  typeImex: "IN",
                  flow: "IMPORT_CELL",
                },
                criteria
              );
              break;
            // Tổng số lần bán bình cho người dân
            case "SALE_CYLINDER":
              criteria = Object.assign(
                {
                  typeImex: "OUT",
                  flow: "SALE",
                },
                criteria
              );
              break;
            // Tổng số lần hồi lưu bình
            case "TURN_BACK_CYLINDER":
              criteria = Object.assign(
                {
                  typeImex: "IN",
                  flow: "TURN_BACK",
                },
                criteria
              );
              break;
            default:
              break;
          }

          let db = await CylinderImex.getDatastore().manager;
          let _Aggregate = await db
            .collection("cylinderimex")
            .aggregate([
              {
                $match: criteria,
              },
              // {
              //     $lookup:
              //     {
              //         localField: "cylinder",
              //         from: "cylinder",
              //         foreignField: "_id",
              //         as: "cylinderDetail"
              //     }
              // },
              // {
              //     $unwind: {
              //         path: "$cylinderDetail",
              //         preserveNullAndEmptyArrays: false
              //     }
              // },
              {
                $group: {
                  _id: {
                    condition: "$condition",
                    category: "$category",
                    typeImex: "$typeImex",
                    flow: "$flow",
                    idChild: "$objectId",
                  },

                  // _id: "$cylinderDetail.classification",
                  count: {
                    $sum: 1,
                  },
                },
              },
              {
                $lookup: {
                  localField: "_id.category",
                  from: "categorycylinder",
                  foreignField: "_id",
                  as: "categorycylinder",
                },
              },
              {
                $unwind: {
                  path: "$categorycylinder",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $project: {
                  _id: "$_id",
                  count: "$count",
                  name: "$categorycylinder.name",
                  code: "$categorycylinder.code",
                  idChild: "$idChild",
                },
              },
            ])
            .toArray();

          // let _listWarehouse = []
          // let _listFixer = []
          // let _listGeneral = []
          // let _listAgency = []

          console.log(_data);

          // Trạm
          if (_listWarehouse.length > 0) {
            await Promise.all(
              _listWarehouse.map(async (_elementFixer) => {
                let indexWarehouse = _data.findIndex(
                  (el) => el.type === "Warehouse"
                );
                let indexElementWarehouse = -1;

                if (_Aggregate.length > 0) {
                  await Promise.all(
                    _Aggregate.map(async (aggregate) => {
                      let id = aggregate._id.idChild.toString();
                      if (id === _elementFixer) {
                        indexElementWarehouse = _data[
                          indexWarehouse
                        ].list.findIndex((el) => el.id === id);

                        let cylinders =
                          _data[indexWarehouse].list[indexElementWarehouse]
                            .detail;

                        let indexWeight = cylinders.cylinders.findIndex(
                          (el) => el.code === aggregate.code
                        );
                        let indexClass = cylinders.cylinders[
                          indexWeight
                        ].detail.cylinders.findIndex(
                          (el) =>
                            el.code.toUpperCase() ===
                            aggregate._id.condition.toUpperCase()
                        );

                        let typeImex = "";
                        let flow = [
                          "CREATE",
                          "EXPORT",
                          "IMPORT",
                          "EXPORT_CELL",
                          "IMPORT_CELL",
                          "TURN_BACK",
                          "SALE",
                          "RETURN",
                          "CANCEL",
                        ];

                        switch (action) {
                          // Tổng số bình đã tạo
                          case "CREATED_CYLINDER":
                            typeImex = "IN";
                            flow = ["CREATE"];
                            break;
                          // Tổng số lần nhập bình (khai báo + nhập vỏ + nhập hàng)
                          case "IN_CYLINDER":
                            typeImex = "IN";
                            break;
                          // Tổng số lần xuất bình (xuất hàng + xuất vỏ)
                          case "OUT_CYLINDER":
                            typeImex = "OUT";
                            break;
                          // Tổng số lần xuất hàng
                          case "EXPORT_CYLINDER":
                            typeImex = "OUT";
                            flow = ["EXPORT"];
                            break;
                          // Tổng số lần nhập hàng
                          case "IMPORT_CYLINDER":
                            typeImex = "IN";
                            flow = ["IMPORT"];
                            break;
                          // Tổng số lần xuất vỏ
                          case "EXPORT_CELL_CYLINDER":
                            typeImex = "OUT";
                            flow = ["EXPORT_CELL"];
                            break;
                          // Tổng số lần nhập vỏ
                          case "IMPORT_CELL_CYLINDER":
                            typeImex = "IN";
                            flow = ["IMPORT_CELL"];
                            break;
                          // Tổng số lần bán bình cho người dân
                          case "SALE_CYLINDER":
                            typeImex = "OUT";
                            flow = ["SALE"];
                            break;
                          // Tổng số lần hồi lưu bình
                          case "TURN_BACK_CYLINDER":
                            typeImex = "IN";
                            flow = ["TURN_BACK"];
                            break;
                          default:
                            break;
                        }

                        if (
                          aggregate._id.typeImex === typeImex &&
                          flow.includes(aggregate._id.flow)
                        ) {
                          cylinders.cylinders[indexWeight].detail.cylinders[
                            indexClass
                          ].count += aggregate.count;
                        }

                        _data[indexWarehouse].list[
                          indexElementWarehouse
                        ].detail = cylinders;
                      }
                    })
                  );

                  if (indexElementWarehouse >= 0) {
                    let cylinders =
                      _data[indexWarehouse].list[indexElementWarehouse].detail;

                    const _listWeight = cylinders.cylinders;
                    await _listWeight.forEach(
                      async (elementWeight, _indexWeight) => {
                        const _listClassification =
                          cylinders.cylinders[_indexWeight].detail.cylinders;
                        await _listClassification.forEach((elementClass) => {
                          cylinders.cylinders[_indexWeight].count +=
                            elementClass.count;
                        });
                      }
                    );

                    _data[indexWarehouse].list[indexElementWarehouse].detail =
                      cylinders;
                  }

                  // console.log(_data)
                }

                if (indexElementWarehouse >= 0) {
                  const _listWeight =
                    _data[indexWarehouse].list[indexElementWarehouse].detail
                      .cylinders;
                  await _listWeight.forEach(async (elementWeight) => {
                    _data[indexWarehouse].list[indexElementWarehouse].count +=
                      elementWeight.count;
                  });
                }
              })
            );
          }

          // Nhà máy sửa chữa
          if (_listFixer.length > 0) {
            await Promise.all(
              _listFixer.map(async (_elementFixer) => {
                let indexWarehouse = _data.findIndex(
                  (el) => el.type === "Fixer"
                );
                let indexElementWarehouse = -1;

                if (_Aggregate.length > 0) {
                  await Promise.all(
                    _Aggregate.map(async (aggregate) => {
                      let id = aggregate._id.idChild.toString();
                      if (id === _elementFixer) {
                        indexElementWarehouse = _data[
                          indexWarehouse
                        ].list.findIndex((el) => el.id === id);

                        let cylinders =
                          _data[indexWarehouse].list[indexElementWarehouse]
                            .detail;

                        let indexWeight = cylinders.cylinders.findIndex(
                          (el) => el.code === aggregate.code
                        );
                        let indexClass = cylinders.cylinders[
                          indexWeight
                        ].detail.cylinders.findIndex(
                          (el) =>
                            el.code.toUpperCase() ===
                            aggregate._id.condition.toUpperCase()
                        );

                        let typeImex = "";
                        let flow = [
                          "CREATE",
                          "EXPORT",
                          "IMPORT",
                          "EXPORT_CELL",
                          "IMPORT_CELL",
                          "TURN_BACK",
                          "SALE",
                          "RETURN",
                          "CANCEL",
                        ];

                        switch (action) {
                          // Tổng số bình đã tạo
                          case "CREATED_CYLINDER":
                            typeImex = "IN";
                            flow = ["CREATE"];
                            break;
                          // Tổng số lần nhập bình (khai báo + nhập vỏ + nhập hàng)
                          case "IN_CYLINDER":
                            typeImex = "IN";
                            break;
                          // Tổng số lần xuất bình (xuất hàng + xuất vỏ)
                          case "OUT_CYLINDER":
                            typeImex = "OUT";
                            break;
                          // Tổng số lần xuất hàng
                          case "EXPORT_CYLINDER":
                            typeImex = "OUT";
                            flow = ["EXPORT"];
                            break;
                          // Tổng số lần nhập hàng
                          case "IMPORT_CYLINDER":
                            typeImex = "IN";
                            flow = ["IMPORT"];
                            break;
                          // Tổng số lần xuất vỏ
                          case "EXPORT_CELL_CYLINDER":
                            typeImex = "OUT";
                            flow = ["EXPORT_CELL"];
                            break;
                          // Tổng số lần nhập vỏ
                          case "IMPORT_CELL_CYLINDER":
                            typeImex = "IN";
                            flow = ["IMPORT_CELL"];
                            break;
                          // Tổng số lần bán bình cho người dân
                          case "SALE_CYLINDER":
                            typeImex = "OUT";
                            flow = ["SALE"];
                            break;
                          // Tổng số lần hồi lưu bình
                          case "TURN_BACK_CYLINDER":
                            typeImex = "IN";
                            flow = ["TURN_BACK"];
                            break;
                          default:
                            break;
                        }

                        if (
                          aggregate._id.typeImex === typeImex &&
                          flow.includes(aggregate._id.flow)
                        ) {
                          cylinders.cylinders[indexWeight].detail.cylinders[
                            indexClass
                          ].count += aggregate.count;
                        }

                        _data[indexWarehouse].list[
                          indexElementWarehouse
                        ].detail = cylinders;
                      }
                    })
                  );

                  if (indexElementWarehouse >= 0) {
                    let cylinders =
                      _data[indexWarehouse].list[indexElementWarehouse].detail;

                    const _listWeight = cylinders.cylinders;
                    await _listWeight.forEach(
                      async (elementWeight, _indexWeight) => {
                        const _listClassification =
                          cylinders.cylinders[_indexWeight].detail.cylinders;
                        await _listClassification.forEach((elementClass) => {
                          cylinders.cylinders[_indexWeight].count +=
                            elementClass.count;
                        });
                      }
                    );

                    _data[indexWarehouse].list[indexElementWarehouse].detail =
                      cylinders;
                  }

                  // console.log(_data)
                }

                if (indexElementWarehouse >= 0) {
                  const _listWeight =
                    _data[indexWarehouse].list[indexElementWarehouse].detail
                      .cylinders;
                  await _listWeight.forEach(async (elementWeight) => {
                    _data[indexWarehouse].list[indexElementWarehouse].count +=
                      elementWeight.count;
                  });
                }
              })
            );
          }

          // Tổng đại lý - Thương nhân mua bán
          if (_listGeneral.length > 0) {
            await Promise.all(
              _listGeneral.map(async (_elementFixer) => {
                let indexWarehouse = _data.findIndex(
                  (el) => el.type === "General"
                );
                let indexElementWarehouse = -1;

                if (_Aggregate.length > 0) {
                  await Promise.all(
                    _Aggregate.map(async (aggregate) => {
                      let id = aggregate._id.idChild.toString();
                      if (id === _elementFixer) {
                        indexElementWarehouse = _data[
                          indexWarehouse
                        ].list.findIndex((el) => el.id === id);

                        let cylinders =
                          _data[indexWarehouse].list[indexElementWarehouse]
                            .detail;

                        let indexWeight = cylinders.cylinders.findIndex(
                          (el) => el.code === aggregate.code
                        );
                        let indexClass = cylinders.cylinders[
                          indexWeight
                        ].detail.cylinders.findIndex(
                          (el) =>
                            el.code.toUpperCase() ===
                            aggregate._id.condition.toUpperCase()
                        );

                        let typeImex = "";
                        let flow = [
                          "CREATE",
                          "EXPORT",
                          "IMPORT",
                          "EXPORT_CELL",
                          "IMPORT_CELL",
                          "TURN_BACK",
                          "SALE",
                          "RETURN",
                          "CANCEL",
                        ];

                        switch (action) {
                          // Tổng số bình đã tạo
                          case "CREATED_CYLINDER":
                            typeImex = "IN";
                            flow = ["CREATE"];
                            break;
                          // Tổng số lần nhập bình (khai báo + nhập vỏ + nhập hàng)
                          case "IN_CYLINDER":
                            typeImex = "IN";
                            break;
                          // Tổng số lần xuất bình (xuất hàng + xuất vỏ)
                          case "OUT_CYLINDER":
                            typeImex = "OUT";
                            break;
                          // Tổng số lần xuất hàng
                          case "EXPORT_CYLINDER":
                            typeImex = "OUT";
                            flow = ["EXPORT"];
                            break;
                          // Tổng số lần nhập hàng
                          case "IMPORT_CYLINDER":
                            typeImex = "IN";
                            flow = ["IMPORT"];
                            break;
                          // Tổng số lần xuất vỏ
                          case "EXPORT_CELL_CYLINDER":
                            typeImex = "OUT";
                            flow = ["EXPORT_CELL"];
                            break;
                          // Tổng số lần nhập vỏ
                          case "IMPORT_CELL_CYLINDER":
                            typeImex = "IN";
                            flow = ["IMPORT_CELL"];
                            break;
                          // Tổng số lần bán bình cho người dân
                          case "SALE_CYLINDER":
                            typeImex = "OUT";
                            flow = ["SALE"];
                            break;
                          // Tổng số lần hồi lưu bình
                          case "TURN_BACK_CYLINDER":
                            typeImex = "IN";
                            flow = ["TURN_BACK"];
                            break;
                          default:
                            break;
                        }

                        if (
                          aggregate._id.typeImex === typeImex &&
                          flow.includes(aggregate._id.flow)
                        ) {
                          cylinders.cylinders[indexWeight].detail.cylinders[
                            indexClass
                          ].count += aggregate.count;
                        }

                        _data[indexWarehouse].list[
                          indexElementWarehouse
                        ].detail = cylinders;
                      }
                    })
                  );

                  if (indexElementWarehouse >= 0) {
                    let cylinders =
                      _data[indexWarehouse].list[indexElementWarehouse].detail;

                    const _listWeight = cylinders.cylinders;
                    await _listWeight.forEach(
                      async (elementWeight, _indexWeight) => {
                        const _listClassification =
                          cylinders.cylinders[_indexWeight].detail.cylinders;
                        await _listClassification.forEach((elementClass) => {
                          cylinders.cylinders[_indexWeight].count +=
                            elementClass.count;
                        });
                      }
                    );

                    _data[indexWarehouse].list[indexElementWarehouse].detail =
                      cylinders;
                  }

                  // console.log(_data)
                }

                if (indexElementWarehouse >= 0) {
                  const _listWeight =
                    _data[indexWarehouse].list[indexElementWarehouse].detail
                      .cylinders;
                  await _listWeight.forEach(async (elementWeight) => {
                    _data[indexWarehouse].list[indexElementWarehouse].count +=
                      elementWeight.count;
                  });
                }
              })
            );
          }

          // Cửa hàng bán lẻ
          if (_listAgency.length > 0) {
            await Promise.all(
              _listAgency.map(async (_elementFixer) => {
                let indexWarehouse = _data.findIndex(
                  (el) => el.type === "Agency"
                );
                let indexElementWarehouse = -1;

                if (_Aggregate.length > 0) {
                  await Promise.all(
                    _Aggregate.map(async (aggregate) => {
                      let id = aggregate._id.idChild.toString();
                      if (id === _elementFixer) {
                        indexElementWarehouse = _data[
                          indexWarehouse
                        ].list.findIndex((el) => el.id === id);

                        let cylinders =
                          _data[indexWarehouse].list[indexElementWarehouse]
                            .detail;

                        let indexWeight = cylinders.cylinders.findIndex(
                          (el) => el.code === aggregate.code
                        );
                        let indexClass = cylinders.cylinders[
                          indexWeight
                        ].detail.cylinders.findIndex(
                          (el) =>
                            el.code.toUpperCase() ===
                            aggregate._id.condition.toUpperCase()
                        );

                        let typeImex = "";
                        let flow = [
                          "CREATE",
                          "EXPORT",
                          "IMPORT",
                          "EXPORT_CELL",
                          "IMPORT_CELL",
                          "TURN_BACK",
                          "SALE",
                          "RETURN",
                          "CANCEL",
                        ];

                        switch (action) {
                          // Tổng số bình đã tạo
                          case "CREATED_CYLINDER":
                            typeImex = "IN";
                            flow = ["CREATE"];
                            break;
                          // Tổng số lần nhập bình (khai báo + nhập vỏ + nhập hàng)
                          case "IN_CYLINDER":
                            typeImex = "IN";
                            break;
                          // Tổng số lần xuất bình (xuất hàng + xuất vỏ)
                          case "OUT_CYLINDER":
                            typeImex = "OUT";
                            break;
                          // Tổng số lần xuất hàng
                          case "EXPORT_CYLINDER":
                            typeImex = "OUT";
                            flow = ["EXPORT"];
                            break;
                          // Tổng số lần nhập hàng
                          case "IMPORT_CYLINDER":
                            typeImex = "IN";
                            flow = ["IMPORT"];
                            break;
                          // Tổng số lần xuất vỏ
                          case "EXPORT_CELL_CYLINDER":
                            typeImex = "OUT";
                            flow = ["EXPORT_CELL"];
                            break;
                          // Tổng số lần nhập vỏ
                          case "IMPORT_CELL_CYLINDER":
                            typeImex = "IN";
                            flow = ["IMPORT_CELL"];
                            break;
                          // Tổng số lần bán bình cho người dân
                          case "SALE_CYLINDER":
                            typeImex = "OUT";
                            flow = ["SALE"];
                            break;
                          // Tổng số lần hồi lưu bình
                          case "TURN_BACK_CYLINDER":
                            typeImex = "IN";
                            flow = ["TURN_BACK"];
                            break;
                          default:
                            break;
                        }

                        if (
                          aggregate._id.typeImex === typeImex &&
                          flow.includes(aggregate._id.flow)
                        ) {
                          cylinders.cylinders[indexWeight].detail.cylinders[
                            indexClass
                          ].count += aggregate.count;
                        }

                        _data[indexWarehouse].list[
                          indexElementWarehouse
                        ].detail = cylinders;
                      }
                    })
                  );

                  if (indexElementWarehouse >= 0) {
                    let cylinders =
                      _data[indexWarehouse].list[indexElementWarehouse].detail;

                    const _listWeight = cylinders.cylinders;
                    await _listWeight.forEach(
                      async (elementWeight, _indexWeight) => {
                        const _listClassification =
                          cylinders.cylinders[_indexWeight].detail.cylinders;
                        await _listClassification.forEach((elementClass) => {
                          cylinders.cylinders[_indexWeight].count +=
                            elementClass.count;
                        });
                      }
                    );

                    _data[indexWarehouse].list[indexElementWarehouse].detail =
                      cylinders;
                  }

                  // console.log(_data)
                }

                if (indexElementWarehouse >= 0) {
                  const _listWeight =
                    _data[indexWarehouse].list[indexElementWarehouse].detail
                      .cylinders;
                  await _listWeight.forEach(async (elementWeight) => {
                    _data[indexWarehouse].list[indexElementWarehouse].count +=
                      elementWeight.count;
                  });
                }
              })
            );
          }

          // console.log(_data)
        }
      }

      return res.json({
        status: true,
        resCode: "SUCCESS-00012",
        data: _data,
        message: "Lấy thông tin thống kê thành công",
      });
    } catch (error) {
      return res.json({
        status: false,
        resCode: "CATCH-00001",
        data: {
          error: error.message,
        },
        message: "Gặp lỗi khi lấy thông tin",
      });
    }
  },

  // Tính tồn kho của user theo thời gian
  getCurrentInventory: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      target, // Id
      // action,     // isIn: ['CREATED_CYLINDER', 'IN_CYLINDER',
      //             // 'OUT_CYLINDER', 'EXPORT_CYLINDER',
      //             // 'IMPORT_CYLINDER', 'EXPORT_CELL_CYLINDER',
      //             // 'IMPORT_CELL_CYLINDER', 'SALE_CYLINDER',
      //             // 'TURN_BACK_CYLINDER']
      // startDate,  // ISODate
      statisticalType, // isIn: ['byItself', 'byItsChildren']
      // Search theo danh sách loại
      // [
      //     {
      //         type: {isIn: ['WEIGHT', 'COLOR', 'VALVE', 'CLASS']}
      //         contents: {isIn: [...]}
      //     },
      //     {...}
      // ]
      searchs,
    } = req.query;

    let {
      endDate, // ISODate
      // Nếu thống kê các đơn vị con
      // Sử dụng param dưới để lọc loại đơn vị con cần tính
      typesOfChildren, // isIn: ['ALL', 'Region', 'Warehouse', 'Fixer', 'General', 'Agency']
    } = req.query;

    if (!target) {
      return res.badRequest(Utils.jsonErr("target is required"));
    }

    // if (!action) {
    //     return res.badRequest(Utils.jsonErr('action is required'));
    // }
    // else {
    //     const _Action = [
    //         'CREATED_CYLINDER', 'IN_CYLINDER',
    //         'OUT_CYLINDER', 'EXPORT_CYLINDER',
    //         'IMPORT_CYLINDER', 'EXPORT_CELL_CYLINDER',
    //         'IMPORT_CELL_CYLINDER', 'SALE_CYLINDER',
    //         'TURN_BACK_CYLINDER'
    //     ]
    //     if (!_Action.includes(action)) {
    //         return res.badRequest(Utils.jsonErr('action is wrong'));
    //     }
    // }

    // if (!startDate) {
    //     return res.badRequest(Utils.jsonErr('startDate is required'));
    // }

    // if (!endDate) {
    //     return res.badRequest(Utils.jsonErr('endDate is required'));
    // }

    if (!statisticalType) {
      return res.badRequest(Utils.jsonErr("statisticalType is required"));
    } else {
      const typeStatistic = ["byItself", "byItsChildren"];
      if (!typeStatistic.includes(statisticalType)) {
        return res.badRequest(Utils.jsonErr("statisticalType is wrong"));
      }

      // Trường hợp thống kê đơn vị con
      if (statisticalType === "byItsChildren") {
        if (!typesOfChildren) {
          return res.badRequest(Utils.jsonErr("typesOfChildren is required"));
        } else {
          // Kiểm tra typesOfChildren là array
          if (!Array.isArray(typesOfChildren)) {
            return res.badRequest(Utils.jsonErr("statisticalType is wrong"));
          }
          // Kiểm tra typesOfChildren array rỗng
          if (typesOfChildren.length === 0) {
            return res.badRequest(Utils.jsonErr("typesOfChildren is required"));
          }

          const typeChildren = [
            "ALL",
            "Region",
            "Warehouse",
            "Fixer",
            "General",
            "Agency",
          ];

          for (let i = 0; i < typesOfChildren.length; i++) {
            if (!typeChildren.includes(typesOfChildren[i])) {
              return res.badRequest(Utils.jsonErr("typesOfChildren is wrong"));
            }
          }
        }
      }

      // Trường hợp thống kê chính nó
      if (statisticalType === "byItself") {
        // Yêu cầu có thông tin [searchs]
        if (!searchs) {
          return res.badRequest(Utils.jsonErr("searchs is required"));
        }
        // Kiểm tra [searchs] là array
        if (!Array.isArray(searchs)) {
          return res.badRequest(Utils.jsonErr("searchs is wrong type"));
        }
        // // Kiểm tra thành phần property của [searchs]
        // if (!searchs[i].hasOwnProperty('type') || !searchs[i].hasOwnProperty('contents')) {
        //     return res.badRequest(Utils.jsonErr('property of searchs is wrong '));
        // }
        // --- Cần kiểm tra nữa và viết hàm riêng ---
      }
    }

    try {
      const userInfor = await User.findOne({
        isDeleted: { "!=": true },
        id: target,
      });
      if (!userInfor) {
        return res.json({
          status: false,
          resCode: "ERROR-00082",
          data: {},
          message: "Không tìm thấy thông tin người dùng trong hệ thống",
        });
      }

      if (!endDate) {
        // Tìm tồn kho đến thời điểm hiện tại
        endDate = new Date().toISOString();
      }

      let _data = [];

      // Thống kê chính nó
      if (statisticalType === "byItself") {
        // Search cho loại bình (search.type = WEIGHT) đã có collectin danh mục loại bình
        // Cần search cho các loại khác (COLOR, VALVE)
        let searchContents = searchs[0].contents;
        const parent = await getRootParent(userInfor.id);

        let _searchs = [
          {
            type: "WEIGHT",
            contents: ["ALL"],
          },
        ];

        // Danh sách các loại bình
        if (
          _searchs[0].type === "WEIGHT" &&
          _searchs[0].contents.includes("ALL")
        ) {
          const foundType = await CategoryCylinder.find({
            isDeleted: { "!=": true },
            createdBy: parent,
            isDeleted: false,
          });

          if (foundType.length > 0) {
            searchContents = [];
            foundType.forEach((type) => {
              searchContents.push({
                code: type.code,
                name: type.name,
              });
            });
          }
        }

        _data = {
          _key: "WEIGHT",
          success: false,
          message: "",
          cylinders: [],
        };

        // Tạo cấu trúc dữ liệu trả về
        await Promise.all(
          searchContents.map(async (content) => {
            try {
              _data.cylinders.push({
                success: true,
                code: content.code,
                name: content.name,
                count: 0,
                detail: {
                  _key: "CLASS",
                  success: true,
                  cylinders: [
                    {
                      success: true,
                      code: "New",
                      name: "New",
                      count: 0,
                    },
                    {
                      success: true,
                      code: "Old",
                      name: "Old",
                      count: 0,
                    },
                  ],
                },
              });
            } catch (error) {
              return res.badRequest(Utils.jsonErr(error.message));
            }
          })
        );

        // // Thống kê từng loại
        // const cylinders = await Promise.all(searchContents.map(async searchContent => {
        //     const isReturnCylinders = true
        //     let countData = await _countTotalCylinderInWarehouseByType(
        //         target,
        //         endDate,
        //         searchs[0].type,
        //         searchContent,
        //         isReturnCylinders,
        //     )

        //     if (countData.success) {
        //         if (searchs.length > 1) {
        //             // Sau khi search xong cắt bỏ điều kiện search đầu tiên
        //             const newSearchs = searchs.slice(1)
        //             countData.detail = await _filterCylindersBySearchType(countData.cylinders, newSearchs, target)
        //         }
        //     }

        //     delete countData.cylinders

        //     return countData
        // }))

        let criteriaInven = {
          // typeImex: 'IN',
          // flow: 'CREATE',
          objectId: ObjectId(target),
          createdAt: {
            // $gte: startDate,
            $lte: endDate,
          },
        };

        let db = await CylinderImex.getDatastore().manager;
        let _AggregateInven = await db
          .collection("cylinderimex")
          .aggregate([
            {
              $match: criteriaInven,
            },
            // {
            //     $lookup:
            //     {
            //         localField: "cylinder",
            //         from: "cylinder",
            //         foreignField: "_id",
            //         as: "cylinderDetail"
            //     }
            // },
            // {
            //     $unwind: {
            //         path: "$cylinderDetail",
            //         preserveNullAndEmptyArrays: false
            //     }
            // },
            {
              $group: {
                _id: {
                  condition: "$condition",
                  category: "$category",
                  typeImex: "$typeImex",
                  // "flow": '$flow',
                },

                // _id: "$cylinderDetail.classification",
                count: {
                  $sum: 1,
                },
              },
            },
            {
              $lookup: {
                localField: "_id.category",
                from: "categorycylinder",
                foreignField: "_id",
                as: "categorycylinder",
              },
            },
            {
              $unwind: {
                path: "$categorycylinder",
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $project: {
                _id: "$_id",
                count: "$count",
                name: "$categorycylinder.name",
                code: "$categorycylinder.code",
              },
            },
          ])
          .toArray();

        if (_AggregateInven.length > 0) {
          await Promise.all(
            _AggregateInven.map(async (aggregate) => {
              const _indexWeight = _data.cylinders.findIndex(
                (el) => el.code === aggregate.code
              );
              const _indexClass = _data.cylinders[
                _indexWeight
              ].detail.cylinders.findIndex(
                (el) =>
                  el.code.toUpperCase() ===
                  aggregate._id.condition.toUpperCase()
              );

              if (aggregate._id.typeImex === "IN") {
                _data.cylinders[_indexWeight].detail.cylinders[
                  _indexClass
                ].count += aggregate.count;
              } else if (aggregate._id.typeImex === "OUT") {
                _data.cylinders[_indexWeight].detail.cylinders[
                  _indexClass
                ].count -= aggregate.count;
              }
            })
          );

          const _listWeight = _data.cylinders;
          await Promise.all(
            _listWeight.map(async (elementWeight, indexWeight) => {
              const _listClassification =
                _data.cylinders[indexWeight].detail.cylinders;
              await Promise.all(
                _listClassification.map(async (elementClass) => {
                  _data.cylinders[indexWeight].count += elementClass.count;
                })
              );
            })
          );
        }

        _data.success = true;
        _data.message = "Thành công";
        // _data.cylinders = cylinders
      }

      // Thống kê các đơn vị con
      if (statisticalType === "byItsChildren") {
        // !!! Cần loại bỏ trùng trong array typesOfChildren

        // Trường hợp công ty mẹ thống kê xem số liệu chi nhánh
        if (typesOfChildren.includes("Region")) {
          typesOfChildren = ["Region"];

          _data = await Promise.all(
            typesOfChildren.map(async (type) => {
              let returnData = {
                type: type,
                list: [],
              };

              // Tìm các chi nhánh vùng và nhà máy sửa chữa
              const listRegion = await User.find({
                isDeleted: { "!=": true },
                isChildOf: target,
                userType: { in: ["Region", "Fixer"] },
                userRole: "SuperAdmin",
                isDeleted: false,
              });

              // Cần kiểm tra listRegion.length > 0

              const _dataRegion = await Promise.all(
                listRegion.map(async (region) => {
                  let returnRegionData = {
                    success: false,
                    name: "",
                    id: "",
                    count: 0,
                    message: "",
                  };

                  let criteria = {
                    isChildOf: region.id,
                    userRole: { in: ["SuperAdmin", "Owner"] },
                  };

                  // Nếu là chi nhánh/công ty con thì tìm các đơn vị con của nó
                  if (region.userType === "Region") {
                    const childs = await User.find(criteria);

                    if (childs.length > 0) {
                      let countRegion = 0;
                      const _dataChilds = await Promise.all(
                        childs.map(async (child) => {
                          const isReturnCylinders = false;
                          let countData = await _countTotalCylinderInWarehouse(
                            child.id,
                            endDate,
                            isReturnCylinders
                          );

                          // // Thêm thông tin ID và tên của đơn vị con vào từng Object trả ra
                          // countData.id = child.id
                          // countData.name = child.name

                          // Mẫu
                          // const searchs = [
                          //     {
                          //         type: 'COLOR',
                          //         contents: ['Xám', 'Đỏ', 'Vàng', 'Cam', 'Shell', 'VT', 'Petro'],
                          //     },
                          //     {
                          //         type: 'VALVE',
                          //         contents: ['POL', 'COMPACT', '1 VAN', '2 VAN'],
                          //     },
                          // ]

                          if (searchs) {
                            if (searchs.length > 0 && isReturnCylinders) {
                              countData.detail =
                                await _filterCylindersBySearchType(
                                  countData.cylinders,
                                  searchs,
                                  child.id
                                );
                            }
                          }

                          delete countData.cylinders;

                          return countData;
                        })
                      );

                      await Promise.all(
                        _dataChilds.map((element) => {
                          if (element.success) countRegion += element.count;
                        })
                      );

                      returnRegionData.success = true;
                      returnRegionData.name = region.name;
                      returnRegionData.count = countRegion;
                      returnRegionData.message = "Success";
                    } else {
                      returnRegionData.success = true;
                      returnRegionData.name = region.name;
                      returnRegionData.message = "Not found any subsidiary";
                    }
                  }
                  // Nếu là nhà máy sửa chữa thì thống kê chính nó
                  if (region.userType === "Fixer") {
                    let countRegion = 0;
                    const isReturnCylinders = false;

                    const countData = await _countTotalCylinderInWarehouse(
                      region.id,
                      endDate,
                      isReturnCylinders
                    );

                    if (searchs) {
                      if (searchs.length > 0 && isReturnCylinders) {
                        countData.detail = await _filterCylindersBySearchType(
                          countData.cylinders,
                          searchs
                        );
                      }
                    }

                    delete countData.cylinders;

                    if (countData.success) {
                      countRegion = countData.count;

                      returnRegionData.success = true;
                      returnRegionData.name = region.name;
                      returnRegionData.count = countRegion;
                      returnRegionData.message = "Success";
                    } else {
                      returnRegionData.success = true;
                      returnRegionData.name = region.name;
                      returnRegionData.message = countData.message;
                    }
                  }

                  return returnRegionData;
                })
              );

              returnData.list = _dataRegion;

              return returnData;
            })
          );
        }
        // Xem thống kê các trường hợp còn lại
        else {
          if (typesOfChildren.includes("ALL")) {
            typesOfChildren = ["Warehouse", "Fixer", "General", "Agency"];
          }

          let objs = [];

          let _listWarehouse = [];
          let _listFixer = [];
          let _listGeneral = [];
          let _listAgency = [];

          let searchContents = searchs[0].contents;
          const parent = await getRootParent(userInfor.id);
          let _searchs = [
            {
              type: "WEIGHT",
              contents: ["ALL"],
            },
          ];
          // Danh sách các loại bình
          if (
            _searchs[0].type === "WEIGHT" &&
            _searchs[0].contents.includes("ALL")
          ) {
            const foundType = await CategoryCylinder.find({
              isDeleted: { "!=": true },
              createdBy: parent,
              isDeleted: false,
            });

            if (foundType.length > 0) {
              searchContents = [];
              foundType.forEach((type) => {
                searchContents.push({
                  code: type.code,
                  name: type.name,
                });
              });
            }
          }

          _data = await Promise.all(
            typesOfChildren.map(async (type) => {
              let returnData = {
                type: type,
                list: [],
              };
              let criteria = {
                isChildOf: userInfor.id,
              };

              switch (type) {
                case "Warehouse":
                  criteria = Object.assign(
                    {
                      userType: { in: ["Factory"] },
                      userRole: { in: ["Owner"] },
                    },
                    criteria
                  );
                  break;
                case "Fixer":
                  criteria = Object.assign(
                    {
                      userType: { in: ["Fixer"] },
                      userRole: { in: ["SuperAdmin"] },
                    },
                    criteria
                  );
                  break;
                case "General":
                  criteria = Object.assign(
                    {
                      userType: { in: ["General"] },
                      userRole: { in: ["SuperAdmin"] },
                    },
                    criteria
                  );
                  break;
                case "Agency":
                  criteria = Object.assign(
                    {
                      userType: { in: ["Agency"] },
                      userRole: { in: ["SuperAdmin"] },
                    },
                    criteria
                  );
                  break;
                default:
                  break;
              }

              // Tìm các đơn vị con
              const childs = await User.find(criteria);

              if (childs.length > 0) {
                const _data = await Promise.all(
                  childs.map(async (child) => {
                    objs.push(ObjectId(child.id));
                    if (type === "Warehouse") {
                      _listWarehouse.push(child.id);
                    } else if (type === "Fixer") {
                      _listFixer.push(child.id);
                    } else if (type === "General") {
                      _listGeneral.push(child.id);
                    } else if (type === "Agency") {
                      _listAgency.push(child.id);
                    }

                    let childDetail = {
                      success: false,
                      count: 0,
                      // "message": "Thành công",
                      id: child.id,
                      name: child.name,
                      detail: {
                        _key: "WEIGHT",
                        success: false,
                        //"message": "Thành công",
                        cylinders: [],
                      },
                    };

                    // Tạo cấu trúc dữ liệu trả về
                    await Promise.all(
                      searchContents.map(async (content) => {
                        try {
                          childDetail.detail.cylinders.push({
                            success: true,
                            code: content.code,
                            name: content.name,
                            count: 0,
                          });
                        } catch (error) {
                          return res.badRequest(Utils.jsonErr(error.message));
                        }
                      })
                    );

                    // const isReturnCylinders = true
                    // let countData = await _countTotalCylinderInWarehouse(
                    //     child.id,
                    //     endDate,
                    //     isReturnCylinders,
                    // )

                    // // Thêm thông tin ID và tên của đơn vị con vào từng Object trả ra
                    // countData.id = child.id
                    // countData.name = child.name

                    // // Mẫu
                    // // const searchs = [
                    // //     {
                    // //         type: 'COLOR',
                    // //         contents: ['Xám', 'Đỏ', 'Vàng', 'Cam', 'Shell', 'VT', 'Petro'],
                    // //     },
                    // //     {
                    // //         type: 'VALVE',
                    // //         contents: ['POL', 'COMPACT', '1 VAN', '2 VAN'],
                    // //     },
                    // // ]

                    // if (searchs) {
                    //     if (searchs.length > 0 && isReturnCylinders) {
                    //         countData.detail = await _filterCylindersBySearchType(countData.cylinders, searchs, child.id)
                    //     }
                    // }

                    // delete countData.cylinders

                    return childDetail;
                  })
                );

                returnData.list = _data;
              }

              return returnData;
            })
          );

          // let criteria = {
          //     objectId: { $in: objs },
          //     createdAt: {
          //         $gte: startDate,
          //         $lte: endDate,
          //     }
          // }

          // switch (action) {
          //     // Tổng số bình đã tạo
          //     case 'CREATED_CYLINDER':
          //         criteria = Object.assign({
          //             typeImex: 'IN',
          //             flow: 'CREATE'
          //         }, criteria);
          //         break;
          //     // Tổng số lần nhập bình (khai báo + nhập vỏ + nhập hàng)
          //     case 'IN_CYLINDER':
          //         criteria = Object.assign({
          //             typeImex: 'IN'
          //         }, criteria);
          //         break;
          //     // Tổng số lần xuất bình (xuất hàng + xuất vỏ)
          //     case 'OUT_CYLINDER':
          //         criteria = Object.assign({
          //             typeImex: 'OUT'
          //         }, criteria);
          //         break;
          //     // Tổng số lần xuất hàng
          //     case 'EXPORT_CYLINDER':
          //         criteria = Object.assign({
          //             typeImex: 'OUT',
          //             flow: 'EXPORT'
          //         }, criteria);
          //         break;
          //     // Tổng số lần nhập hàng
          //     case 'IMPORT_CYLINDER':
          //         criteria = Object.assign({
          //             typeImex: 'IN',
          //             flow: 'IMPORT'
          //         }, criteria);
          //         break;
          //     // Tổng số lần xuất vỏ
          //     case 'EXPORT_CELL_CYLINDER':
          //         criteria = Object.assign({
          //             typeImex: 'OUT',
          //             flow: 'EXPORT_CELL'
          //         }, criteria);
          //         break;
          //     // Tổng số lần nhập vỏ
          //     case 'IMPORT_CELL_CYLINDER':
          //         criteria = Object.assign({
          //             typeImex: 'IN',
          //             flow: 'IMPORT_CELL'
          //         }, criteria);
          //         break;
          //     // Tổng số lần bán bình cho người dân
          //     case 'SALE_CYLINDER':
          //         criteria = Object.assign({
          //             typeImex: 'OUT',
          //             flow: 'SALE'
          //         }, criteria);
          //         break;
          //     // Tổng số lần hồi lưu bình
          //     case 'TURN_BACK_CYLINDER':
          //         criteria = Object.assign({
          //             typeImex: 'IN',
          //             flow: 'TURN_BACK'
          //         }, criteria);
          //         break;
          //     default:
          //         break;
          // }

          let criteriaInven = {
            // typeImex: 'IN',
            // flow: 'CREATE',
            objectId: { $in: objs },
            createdAt: {
              // $gte: startDate,
              $lte: endDate,
            },
          };

          let db = await CylinderImex.getDatastore().manager;
          let _Aggregate = await db
            .collection("cylinderimex")
            .aggregate([
              {
                $match: criteriaInven,
              },
              // {
              //     $lookup:
              //     {
              //         localField: "cylinder",
              //         from: "cylinder",
              //         foreignField: "_id",
              //         as: "cylinderDetail"
              //     }
              // },
              // {
              //     $unwind: {
              //         path: "$cylinderDetail",
              //         preserveNullAndEmptyArrays: false
              //     }
              // },
              {
                $group: {
                  _id: {
                    condition: "$condition",
                    category: "$category",
                    typeImex: "$typeImex",
                    // flow": "$flow",
                    idChild: "$objectId",
                  },

                  // _id: "$cylinderDetail.classification",
                  count: {
                    $sum: 1,
                  },
                },
              },
              {
                $lookup: {
                  localField: "_id.category",
                  from: "categorycylinder",
                  foreignField: "_id",
                  as: "categorycylinder",
                },
              },
              {
                $unwind: {
                  path: "$categorycylinder",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $project: {
                  _id: "$_id",
                  count: "$count",
                  name: "$categorycylinder.name",
                  code: "$categorycylinder.code",
                  idChild: "$idChild",
                },
              },
            ])
            .toArray();

          // console.log(_data, _Aggregate)

          // Trạm
          if (_listWarehouse.length > 0) {
            await Promise.all(
              _listWarehouse.map(async (_elementFixer) => {
                let indexWarehouse = _data.findIndex(
                  (el) => el.type === "Warehouse"
                );
                let indexElementWarehouse = -1;

                if (_Aggregate.length > 0) {
                  await Promise.all(
                    _Aggregate.map(async (aggregate) => {
                      let id = aggregate._id.idChild.toString();
                      if (id === _elementFixer) {
                        indexElementWarehouse = _data[
                          indexWarehouse
                        ].list.findIndex((el) => el.id === id);

                        let cylinders =
                          _data[indexWarehouse].list[indexElementWarehouse]
                            .detail;

                        let indexWeight = cylinders.cylinders.findIndex(
                          (el) => el.code === aggregate.code
                        );
                        // let indexClass = cylinders.cylinders[indexWeight].detail.cylinders.findIndex(el => el.code === aggregate._id.classification)

                        if (aggregate._id.typeImex === "IN") {
                          _data[indexWarehouse].list[
                            indexElementWarehouse
                          ].detail.cylinders[indexWeight].count +=
                            aggregate.count;
                        } else if (aggregate._id.typeImex === "OUT") {
                          _data[indexWarehouse].list[
                            indexElementWarehouse
                          ].detail.cylinders[indexWeight].count -=
                            aggregate.count;
                        }
                      }
                    })
                  );

                  if (indexElementWarehouse >= 0) {
                    let cylinders =
                      _data[indexWarehouse].list[indexElementWarehouse].detail;

                    const _listWeight = cylinders.cylinders;
                    await Promise.all(
                      _listWeight.map(async (elementWeight, _indexWeight) => {
                        _data[indexWarehouse].list[
                          indexElementWarehouse
                        ].count += elementWeight.count;
                      })
                    );

                    _data[indexWarehouse].list[
                      indexElementWarehouse
                    ].detail.success = true;
                    _data[indexWarehouse].list[
                      indexElementWarehouse
                    ].success = true;
                  }
                }
              })
            );
          }

          // Nhà máy sửa chữa
          if (_listFixer.length > 0) {
            await Promise.all(
              _listFixer.map(async (_elementFixer) => {
                let indexWarehouse = _data.findIndex(
                  (el) => el.type === "Fixer"
                );
                let indexElementWarehouse = -1;

                if (_Aggregate.length > 0) {
                  await Promise.all(
                    _Aggregate.map(async (aggregate) => {
                      let id = aggregate._id.idChild.toString();
                      if (id === _elementFixer) {
                        indexElementWarehouse = _data[
                          indexWarehouse
                        ].list.findIndex((el) => el.id === id);

                        let cylinders =
                          _data[indexWarehouse].list[indexElementWarehouse]
                            .detail;

                        let indexWeight = cylinders.cylinders.findIndex(
                          (el) => el.code === aggregate.code
                        );
                        // let indexClass = cylinders.cylinders[indexWeight].detail.cylinders.findIndex(el => el.code === aggregate._id.classification)

                        if (aggregate._id.typeImex === "IN") {
                          _data[indexWarehouse].list[
                            indexElementWarehouse
                          ].detail.cylinders[indexWeight].count +=
                            aggregate.count;
                        } else if (aggregate._id.typeImex === "OUT") {
                          _data[indexWarehouse].list[
                            indexElementWarehouse
                          ].detail.cylinders[indexWeight].count -=
                            aggregate.count;
                        }
                      }
                    })
                  );

                  if (indexElementWarehouse >= 0) {
                    let cylinders =
                      _data[indexWarehouse].list[indexElementWarehouse].detail;

                    const _listWeight = cylinders.cylinders;
                    await Promise.all(
                      _listWeight.map(async (elementWeight, _indexWeight) => {
                        _data[indexWarehouse].list[
                          indexElementWarehouse
                        ].count += elementWeight.count;
                      })
                    );

                    _data[indexWarehouse].list[
                      indexElementWarehouse
                    ].detail.success = true;
                    _data[indexWarehouse].list[
                      indexElementWarehouse
                    ].success = true;
                  }
                }
              })
            );
          }

          // Tổng đại lý - Thương nhân mua bán
          if (_listGeneral.length > 0) {
            await Promise.all(
              _listGeneral.map(async (_elementFixer) => {
                let indexWarehouse = _data.findIndex(
                  (el) => el.type === "General"
                );
                let indexElementWarehouse = -1;

                if (_Aggregate.length > 0) {
                  await Promise.all(
                    _Aggregate.map(async (aggregate) => {
                      let id = aggregate._id.idChild.toString();
                      if (id === _elementFixer) {
                        indexElementWarehouse = _data[
                          indexWarehouse
                        ].list.findIndex((el) => el.id === id);

                        let cylinders =
                          _data[indexWarehouse].list[indexElementWarehouse]
                            .detail;

                        let indexWeight = cylinders.cylinders.findIndex(
                          (el) => el.code === aggregate.code
                        );
                        // let indexClass = cylinders.cylinders[indexWeight].detail.cylinders.findIndex(el => el.code === aggregate._id.classification)

                        if (aggregate._id.typeImex === "IN") {
                          _data[indexWarehouse].list[
                            indexElementWarehouse
                          ].detail.cylinders[indexWeight].count +=
                            aggregate.count;
                        } else if (aggregate._id.typeImex === "OUT") {
                          _data[indexWarehouse].list[
                            indexElementWarehouse
                          ].detail.cylinders[indexWeight].count -=
                            aggregate.count;
                        }
                      }
                    })
                  );

                  if (indexElementWarehouse >= 0) {
                    let cylinders =
                      _data[indexWarehouse].list[indexElementWarehouse].detail;

                    const _listWeight = cylinders.cylinders;
                    await Promise.all(
                      _listWeight.map(async (elementWeight, _indexWeight) => {
                        _data[indexWarehouse].list[
                          indexElementWarehouse
                        ].count += elementWeight.count;
                      })
                    );

                    _data[indexWarehouse].list[
                      indexElementWarehouse
                    ].detail.success = true;
                    _data[indexWarehouse].list[
                      indexElementWarehouse
                    ].success = true;
                  }
                }
              })
            );
          }

          // Cửa hàng bán lẻ
          if (_listAgency.length > 0) {
            await Promise.all(
              _listAgency.map(async (_elementFixer) => {
                let indexWarehouse = _data.findIndex(
                  (el) => el.type === "Agency"
                );
                let indexElementWarehouse = -1;

                if (_Aggregate.length > 0) {
                  await Promise.all(
                    _Aggregate.map(async (aggregate) => {
                      let id = aggregate._id.idChild.toString();
                      if (id === _elementFixer) {
                        indexElementWarehouse = _data[
                          indexWarehouse
                        ].list.findIndex((el) => el.id === id);

                        let cylinders =
                          _data[indexWarehouse].list[indexElementWarehouse]
                            .detail;

                        let indexWeight = cylinders.cylinders.findIndex(
                          (el) => el.code === aggregate.code
                        );
                        // let indexClass = cylinders.cylinders[indexWeight].detail.cylinders.findIndex(el => el.code === aggregate._id.classification)

                        if (aggregate._id.typeImex === "IN") {
                          _data[indexWarehouse].list[
                            indexElementWarehouse
                          ].detail.cylinders[indexWeight].count +=
                            aggregate.count;
                        } else if (aggregate._id.typeImex === "OUT") {
                          _data[indexWarehouse].list[
                            indexElementWarehouse
                          ].detail.cylinders[indexWeight].count -=
                            aggregate.count;
                        }
                      }
                    })
                  );

                  if (indexElementWarehouse >= 0) {
                    let cylinders =
                      _data[indexWarehouse].list[indexElementWarehouse].detail;

                    const _listWeight = cylinders.cylinders;
                    await Promise.all(
                      _listWeight.map(async (elementWeight, _indexWeight) => {
                        _data[indexWarehouse].list[
                          indexElementWarehouse
                        ].count += elementWeight.count;
                      })
                    );

                    _data[indexWarehouse].list[
                      indexElementWarehouse
                    ].detail.success = true;
                    _data[indexWarehouse].list[
                      indexElementWarehouse
                    ].success = true;
                  }
                }
              })
            );
          }
        }
      }

      return res.json({
        status: true,
        resCode: "SUCCESS-00012",
        data: _data,
        message: "Lấy thông tin thống kê thành công",
      });
    } catch (error) {
      return res.json({
        status: false,
        resCode: "CATCH-00002",
        data: {
          error: error.message,
        },
        message: "Gặp lỗi khi lấy thông tin tồn kho",
      });
    }
  },

  // Thống kê
  getStatistics: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      target, // Id
      startDate, // ISODate
      endDate, // ISODate
      statisticalType, // isIn: ['byItself', 'byItsChildren']
      manufacture,
    } = req.query;
    // searchs,

    let {
      // Nếu thống kê các đơn vị con
      // Sử dụng param dưới để lọc loại đơn vị con cần tính
      // if (Region) => Region, ...đơn vị con
      // if (ALL) => ['Warehouse', 'Fixer', 'General', 'Agency']
      typesOfChildren, // isIn: ['ALL', 'Region', 'Warehouse', 'Fixer', 'General', 'Agency']
      actions, // []
    } = req.query;

    if (!target) {
      return res.badRequest(Utils.jsonErr("target is required"));
    }

    if (!startDate) {
      return res.badRequest(Utils.jsonErr("startDate is required"));
    }

    if (!endDate) {
      return res.badRequest(Utils.jsonErr("endDate is required"));
    }

    if (!statisticalType) {
      return res.badRequest(Utils.jsonErr("statisticalType is required"));
    } else {
      const type = ["byItself", "byItsChildren"];
      if (!type.includes(statisticalType)) {
        return res.badRequest(Utils.jsonErr("statisticalType is wrong"));
      }
    }

    try {
      const userInfor = await User.findOne({
        isDeleted: { "!=": true },
        id: target,
      });
      if (!userInfor) {
        return res.json({
          status: false,
          resCode: "ERROR-00083",
          data: {},
          message: "Không tìm thấy thông tin người dùng trong hệ thống",
        });
      }

      let returnData = {};

      // // Danh sách [action]
      // const actions = ['CREATED_CYLINDER', 'OUT_CYLINDER', 'TURN_BACK_CYLINDER', 'INVENTORY_CYLINDER']
      actions.push("INVENTORY_CYLINDER");

      let searchs = [
        {
          type: "CLASS",
          contents: ["New", "Old"],
        },
      ];
      let _searchContents = [];

      const parent = await getRootParent(userInfor.id);
      // Tìm danh sách các loại bình
      const foundType = await CategoryCylinder.find({
        isDeleted: { "!=": true },
        createdBy: parent,
        isDeleted: false,
      });

      if (foundType.length > 0) {
        foundType.forEach((type) => {
          _searchContents.push(type.code);
        });

        searchs[1] = {
          type: "WEIGHT",
          contents: _searchContents,
        };
      } else {
        return res.badRequest(Utils.jsonErr("Not found any cylinderType"));
      }

      // --- [Rất quan trọng]: searchs --- //

      // Tạo cấu trúc dữ liệu trả về
      await Promise.all(
        actions.map(async (action) => {
          try {
            Object.assign(returnData, {
              [action]: {
                count: 0,
              },
            });

            const detail = await _createDataStructureBySearch(searchs);
            returnData[action].detail = detail;
          } catch (error) {
            console.log(error.message);
          }
        })
      );

      // Loại bỏ INVENTORY_CYLINDER khỏi danh sách action
      const indexInven = actions.findIndex(
        (action) => action === "INVENTORY_CYLINDER"
      );
      actions.splice(indexInven, 1);

      let objs = [];

      // --- TH1: Thống kê số liệu của chính nó
      if (statisticalType === "byItself") {
        // // // Trường hợp có phân chia theo thương hiệu bình
        if (manufacture) {
          // // Thống kê tổng số ===================================
          // // Tồn kho
          // const searchManufacture = [{
          //     type: 'MANUFACTURE',
          //     contents: [manufacture]
          // }]

          // const isReturnCylinders = true
          // let countDataInventory = await _countTotalCylinderInWarehouse(
          //     target,
          //     endDate,
          //     isReturnCylinders,
          // )

          // if (countDataInventory.success) {
          //     const filterCylinder = await _filterCylindersBySearchType(countDataInventory.cylinders, searchManufacture)
          //     returnData['INVENTORY_CYLINDER'].count += filterCylinder.cylinders[0].count
          // }

          // // Thống kê từng loại bình
          // const cylinders = await Promise.all(searchs[0].contents.map(async searchContent => {
          //     const isReturnCylinders = true
          //     let countData = await _countTotalCylinderInWarehouseByType(
          //         target,
          //         endDate,
          //         searchs[0].type,
          //         searchContent,
          //         isReturnCylinders,
          //     )

          //     if (countData.success) {
          //         let index = returnData['INVENTORY_CYLINDER'].detail.cylinder.findIndex(el => el.code === searchContent)
          //         let filterCylinder
          //         if (index >= 0) {
          //             filterCylinder = await _filterCylindersBySearchType(countData.cylinders, searchManufacture)
          //             returnData['INVENTORY_CYLINDER'].detail.cylinder[index].count += filterCylinder.cylinders[0].count
          //         }

          //         if (searchs.length > 1) {
          //             // Sau khi search xong cắt bỏ điều kiện search đầu tiên
          //             const newSearchs = searchs.slice(1)
          //             countData.detail = await _filterCylindersBySearchType2(countData.cylinders, newSearchs, manufacture)

          //             const length = countData.detail.cylinders.length
          //             for (let i = 0; i < length; i++) {
          //                 let _index = returnData['INVENTORY_CYLINDER'].detail.cylinder[index].detail.cylinder.findIndex(el => el.code === countData.detail.cylinders[i].code)
          //                 if (_index >= 0) {
          //                     // const filterCylinder = await _filterCylindersBySearchType(countData.cylinders, searchManufacture)
          //                     returnData['INVENTORY_CYLINDER'].detail.cylinder[index].detail.cylinder[_index].count += countData.detail.cylinders[i].count
          //                 }
          //             }
          //         }
          //     }
          // }))

          // ******** Thống kê trực tiếp qua MongoDB
          // let objInven = ObjectId(target)
          // let objsInven = []
          // let objInven_manufacture = ObjectId(manufacture)

          // objsInven.push(objInven)

          let criteriaInven = {
            // typeImex: 'IN',
            // flow: 'CREATE',
            objectId: ObjectId(target),
            createdAt: {
              // $gte: startDate,
              $lte: endDate,
            },
          };

          let db = await CylinderImex.getDatastore().manager;
          let _AggregateInven = await db
            .collection("cylinderimex")
            .aggregate([
              {
                $match: criteriaInven,
              },
              // {
              //     $lookup:
              //     {
              //         localField: "cylinder",
              //         from: "cylinder",
              //         foreignField: "_id",
              //         as: "cylinderDetail"
              //     }
              // },
              // {
              //     $unwind: {
              //         path: "$cylinderDetail",
              //         preserveNullAndEmptyArrays: false
              //     }
              // },
              {
                $match: {
                  "cylinderDetail.manufacture": ObjectId(manufacture),
                },
              },
              {
                $group: {
                  _id: {
                    condition: "$condition",
                    category: "$category",
                    typeImex: "$typeImex",
                    flow: "$flow",
                  },

                  // _id: "$cylinderDetail.classification",
                  count: {
                    $sum: 1,
                  },
                },
              },
              {
                $lookup: {
                  localField: "_id.category",
                  from: "categorycylinder",
                  foreignField: "_id",
                  as: "categorycylinder",
                },
              },
              {
                $unwind: {
                  path: "$categorycylinder",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $project: {
                  _id: "$_id",
                  count: "$count",
                  name: "$categorycylinder.name",
                  code: "$categorycylinder.code",
                },
              },
            ])
            .toArray();

          if (_AggregateInven.length > 0) {
            await Promise.all(
              _AggregateInven.map(async (aggregate) => {
                const indexClass = returnData[
                  "INVENTORY_CYLINDER"
                ].detail.cylinder.findIndex(
                  (el) =>
                    el.code.toUpperCase() ===
                    aggregate._id.condition.toUpperCase()
                );
                const indexWeight = returnData[
                  "INVENTORY_CYLINDER"
                ].detail.cylinder[indexClass].detail.cylinder.findIndex(
                  (el) => el.code === aggregate.code
                );

                if (aggregate._id.typeImex === "IN") {
                  returnData["INVENTORY_CYLINDER"].detail.cylinder[
                    indexClass
                  ].detail.cylinder[indexWeight].count += aggregate.count;
                } else if (aggregate._id.typeImex === "OUT") {
                  returnData["INVENTORY_CYLINDER"].detail.cylinder[
                    indexClass
                  ].detail.cylinder[indexWeight].count -= aggregate.count;
                }
              })
            );

            const _listClassification =
              returnData["INVENTORY_CYLINDER"].detail.cylinder;
            await Promise.all(
              _listClassification.map(async (elementClass, indexClass) => {
                const _listWeight =
                  returnData["INVENTORY_CYLINDER"].detail.cylinder[indexClass]
                    .detail.cylinder;
                await Promise.all(
                  _listWeight.map(async (elementWeight) => {
                    returnData["INVENTORY_CYLINDER"].detail.cylinder[
                      indexClass
                    ].count += elementWeight.count;
                  })
                );
                returnData["INVENTORY_CYLINDER"].count += elementClass.count;
              })
            );
          }

          // // Thống kê tổng số ===================================
          // // Theo [action]
          // await Promise.all(actions.map(async action => {
          //     const isReturnCylinders = true
          //     let countData = await _countTotalActionCylinder(
          //         target,
          //         action,
          //         startDate,
          //         endDate,
          //         isReturnCylinders,
          //     )

          //     if (countData.success) {
          //         const filterCylinder = await _filterCylindersBySearchType(countData.cylinders, searchManufacture)
          //         returnData[action].count += filterCylinder.cylinders[0].count
          //     }

          //     // Thống kê từng loại bình
          //     const cylinders = await Promise.all(searchs[0].contents.map(async searchContent => {
          //         const isReturnCylinders = true
          //         let countData = await _countTotalActionCylinderByType(
          //             target,
          //             action,
          //             startDate,
          //             endDate,
          //             searchs[0].type,
          //             searchContent,
          //             isReturnCylinders,
          //         )

          //         if (countData.success) {
          //             let index = returnData[action].detail.cylinder.findIndex(el => el.code === searchContent)
          //             let filterCylinder
          //             if (index >= 0) {
          //                 filterCylinder = await _filterCylindersBySearchType(countData.cylinders, searchManufacture)
          //                 returnData[action].detail.cylinder[index].count += filterCylinder.cylinders[0].count
          //             }

          //             if (searchs.length > 1) {
          //                 // Sau khi search xong cắt bỏ điều kiện search đầu tiên
          //                 const newSearchs = searchs.slice(1)
          //                 countData.detail = await _filterCylindersBySearchType2(countData.cylinders, newSearchs, manufacture)

          //                 const length = countData.detail.cylinders.length
          //                 for (let i = 0; i < length; i++) {
          //                     let _index = returnData[action].detail.cylinder[index].detail.cylinder.findIndex(el => el.code === countData.detail.cylinders[i].code)
          //                     if (_index >= 0) {
          //                         returnData[action].detail.cylinder[index].detail.cylinder[_index].count += countData.detail.cylinders[i].count
          //                     }
          //                 }
          //             }
          //         }

          //         // if (countData.success) {
          //         //     let index = returnData[action].detail.cylinder.findIndex(el => el.code === searchContent)
          //         //     if (index >= 0) {
          //         //         returnData[action].detail.cylinder[index].count += countData.count
          //         //     }
          //         // }

          //         // delete countData.cylinders

          //         // return countData
          //     }))

          //     // console.log(cylinders)

          //     // await Promise.all(searchs.map(async (search, index,) => {
          //     // Thống kê động theo path
          //     // https://stackoverflow.com/questions/6842795/dynamic-deep-setting-for-a-javascript-object
          //     // }))
          // }))

          // ******** Thống kê trực tiếp qua MongoDB
          let obj = ObjectId(target);
          let obj_manufacture = ObjectId(manufacture);

          objs.push(obj);

          let criteria = {
            // typeImex: 'IN',
            // flow: 'CREATE',
            objectId: { $in: objs },
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          };

          // let db = await CylinderImex.getDatastore().manager;
          let _Aggregate = await db
            .collection("cylinderimex")
            .aggregate([
              {
                $match: criteria,
              },
              // {
              //     $lookup:
              //     {
              //         localField: "cylinder",
              //         from: "cylinder",
              //         foreignField: "_id",
              //         as: "cylinderDetail"
              //     }
              // },
              // {
              //     $unwind: {
              //         path: "$cylinderDetail",
              //         preserveNullAndEmptyArrays: false
              //     }
              // },
              {
                $match: {
                  "cylinderDetail.manufacture": obj_manufacture,
                },
              },
              {
                $group: {
                  _id: {
                    classification: "$cylinderDetail.classification",
                    category: "$cylinderDetail.category",
                    typeImex: "$typeImex",
                    flow: "$flow",
                  },

                  // _id: "$cylinderDetail.classification",
                  count: {
                    $sum: 1,
                  },
                },
              },
              {
                $lookup: {
                  localField: "_id.category",
                  from: "categorycylinder",
                  foreignField: "_id",
                  as: "categorycylinder",
                },
              },
              {
                $unwind: {
                  path: "$categorycylinder",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $project: {
                  _id: "$_id",
                  count: "$count",
                  name: "$categorycylinder.name",
                  code: "$categorycylinder.code",
                },
              },
            ])
            .toArray();

          if (_Aggregate.length > 0) {
            // _Aggregate.forEach(aggregate => {
            //     let indexClass = returnData['INVENTORY_CYLINDER'].detail.cylinder.findIndex(el => el.code === aggregate._id.classification)
            //     let indexWeight = returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder.findIndex(el => el.code === aggregate.code)

            //     if (aggregate._id.typeImex === 'IN') {
            //         returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder[indexWeight].count += aggregate.count
            //     }
            //     else if (aggregate._id.typeImex === 'OUT') {
            //         returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder[indexWeight].count -= aggregate.count
            //     }
            // });

            // const _listClassification = returnData['INVENTORY_CYLINDER'].detail.cylinder
            // _listClassification.forEach((elementClass, indexClass) => {
            //     const _listWeight = returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder
            //     _listWeight.forEach(elementWeight => {
            //         returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].count += elementWeight.count
            //     });
            //     returnData['INVENTORY_CYLINDER'].count += elementClass.count
            // });

            await Promise.all(
              actions.map(async (action) => {
                await Promise.all(
                  _Aggregate.map(async (aggregate) => {
                    let indexClass = returnData[
                      action
                    ].detail.cylinder.findIndex(
                      (el) =>
                        el.code.toUpperCase() ===
                        aggregate._id.condition.toUpperCase()
                    );
                    let indexWeight = returnData[action].detail.cylinder[
                      indexClass
                    ].detail.cylinder.findIndex(
                      (el) => el.code === aggregate.code
                    );

                    let typeImex = "";
                    let flow = [
                      "CREATE",
                      "EXPORT",
                      "IMPORT",
                      "EXPORT_CELL",
                      "IMPORT_CELL",
                      "TURN_BACK",
                      "SALE",
                      "RETURN",
                      "CANCEL",
                    ];

                    switch (action) {
                      // Tổng số bình đã tạo
                      case "CREATED_CYLINDER":
                        typeImex = "IN";
                        flow = ["CREATE"];
                        break;
                      // Tổng số lần nhập bình (khai báo + nhập vỏ + nhập hàng)
                      case "IN_CYLINDER":
                        typeImex = "IN";
                        break;
                      // Tổng số lần xuất bình (xuất hàng + xuất vỏ)
                      case "OUT_CYLINDER":
                        typeImex = "OUT";
                        break;
                      // Tổng số lần xuất hàng
                      case "EXPORT_CYLINDER":
                        typeImex = "OUT";
                        flow = ["EXPORT"];
                        break;
                      // Tổng số lần nhập hàng
                      case "IMPORT_CYLINDER":
                        typeImex = "IN";
                        flow = ["IMPORT"];
                        break;
                      // Tổng số lần xuất vỏ
                      case "EXPORT_CELL_CYLINDER":
                        typeImex = "OUT";
                        flow = ["EXPORT_CELL"];
                        break;
                      // Tổng số lần nhập vỏ
                      case "IMPORT_CELL_CYLINDER":
                        typeImex = "IN";
                        flow = ["IMPORT_CELL"];
                        break;
                      // Tổng số lần bán bình cho người dân
                      case "SALE_CYLINDER":
                        typeImex = "OUT";
                        flow = ["SALE"];
                        break;
                      // Tổng số lần hồi lưu bình
                      case "TURN_BACK_CYLINDER":
                        typeImex = "IN";
                        flow = ["TURN_BACK"];
                        break;
                      default:
                        break;
                    }

                    if (
                      aggregate._id.typeImex === typeImex &&
                      flow.includes(aggregate._id.flow)
                    ) {
                      returnData[action].detail.cylinder[
                        indexClass
                      ].detail.cylinder[indexWeight].count += aggregate.count;
                    }
                  })
                );

                const _listClassification = returnData[action].detail.cylinder;
                await _listClassification.forEach(
                  async (elementClass, indexClass) => {
                    const _listWeight =
                      returnData[action].detail.cylinder[indexClass].detail
                        .cylinder;
                    await _listWeight.forEach(async (elementWeight) => {
                      returnData[action].detail.cylinder[indexClass].count +=
                        elementWeight.count;
                    });
                    returnData[action].count += elementClass.count;
                  }
                );
              })
            );
          }
        }
        // // // Trường hợp không phân chia theo thương hiệu
        else {
          let criteriaInven = {
            // typeImex: 'IN',
            // flow: 'CREATE',
            objectId: ObjectId(target),
            createdAt: {
              // $gte: startDate,
              $lte: endDate,
            },
          };

          let db = await CylinderImex.getDatastore().manager;
          let _AggregateInven = await db
            .collection("cylinderimex")
            .aggregate([
              {
                $match: criteriaInven,
              },
              // {
              //     $lookup:
              //     {
              //         localField: "cylinder",
              //         from: "cylinder",
              //         foreignField: "_id",
              //         as: "cylinderDetail"
              //     }
              // },
              // {
              //     $unwind: {
              //         path: "$cylinderDetail",
              //         preserveNullAndEmptyArrays: false
              //     }
              // },
              // // {
              // //     $match: {
              // //         "cylinderDetail.manufacture": ObjectId(manufacture)
              // //     }
              // // },
              {
                $group: {
                  _id: {
                    condition: "$condition",
                    category: "$category",
                    typeImex: "$typeImex",
                    flow: "$flow",
                  },

                  // _id: "$cylinderDetail.classification",
                  count: {
                    $sum: 1,
                  },
                },
              },
              {
                $lookup: {
                  localField: "_id.category",
                  from: "categorycylinder",
                  foreignField: "_id",
                  as: "categorycylinder",
                },
              },
              {
                $unwind: {
                  path: "$categorycylinder",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $project: {
                  _id: "$_id",
                  count: "$count",
                  name: "$categorycylinder.name",
                  code: "$categorycylinder.code",
                },
              },
            ])
            .toArray();

          if (_AggregateInven.length > 0) {
            await Promise.all(
              _AggregateInven.map(async (aggregate) => {
                let indexClass = returnData[
                  "INVENTORY_CYLINDER"
                ].detail.cylinder.findIndex(
                  (el) =>
                    el.code.toUpperCase() ===
                    aggregate._id.condition.toUpperCase()
                );
                let indexWeight = returnData[
                  "INVENTORY_CYLINDER"
                ].detail.cylinder[indexClass].detail.cylinder.findIndex(
                  (el) => el.code === aggregate.code
                );

                if (aggregate._id.typeImex === "IN") {
                  returnData["INVENTORY_CYLINDER"].detail.cylinder[
                    indexClass
                  ].detail.cylinder[indexWeight].count += aggregate.count;
                } else if (aggregate._id.typeImex === "OUT") {
                  returnData["INVENTORY_CYLINDER"].detail.cylinder[
                    indexClass
                  ].detail.cylinder[indexWeight].count -= aggregate.count;
                }
              })
            );

            const _listClassification =
              returnData["INVENTORY_CYLINDER"].detail.cylinder;
            _listClassification.forEach((elementClass, indexClass) => {
              const _listWeight =
                returnData["INVENTORY_CYLINDER"].detail.cylinder[indexClass]
                  .detail.cylinder;
              _listWeight.forEach((elementWeight) => {
                returnData["INVENTORY_CYLINDER"].detail.cylinder[
                  indexClass
                ].count += elementWeight.count;
              });
              returnData["INVENTORY_CYLINDER"].count += elementClass.count;
            });
          }
          // // Thống kê tổng số ===================================
          // // Tồn kho
          // const isReturnCylinders = false
          // let countDataInventory = await _countTotalCylinderInWarehouse(
          //     target,
          //     endDate,
          //     isReturnCylinders,
          // )

          // if (countDataInventory.success) {
          //     returnData['INVENTORY_CYLINDER'].count += countDataInventory.count
          // }

          // // Thống kê từng loại bình
          // const cylinders = await Promise.all(searchs[0].contents.map(async searchContent => {
          //     const isReturnCylinders = true
          //     let countData = await _countTotalCylinderInWarehouseByType(
          //         target,
          //         endDate,
          //         searchs[0].type,
          //         searchContent,
          //         isReturnCylinders,
          //     )

          //     if (countData.success) {
          //         let index = returnData['INVENTORY_CYLINDER'].detail.cylinder.findIndex(el => el.code === searchContent)
          //         if (index >= 0) {
          //             returnData['INVENTORY_CYLINDER'].detail.cylinder[index].count += countData.count
          //         }

          //         if (searchs.length > 1) {
          //             // Sau khi search xong cắt bỏ điều kiện search đầu tiên
          //             const newSearchs = searchs.slice(1)
          //             countData.detail = await _filterCylindersBySearchType(countData.cylinders, newSearchs)

          //             for (let i = 0; i < countData.detail.cylinders.length; i++) {
          //                 let _index = returnData['INVENTORY_CYLINDER'].detail.cylinder[index].detail.cylinder.findIndex(el => el.code === countData.detail.cylinders[i].code)
          //                 if (_index >= 0) {
          //                     returnData['INVENTORY_CYLINDER'].detail.cylinder[index].detail.cylinder[_index].count += countData.detail.cylinders[i].count
          //                 }
          //             }
          //         }
          //     }
          // }))

          // ******** Thống kê trực tiếp qua MongoDB
          let obj = ObjectId(target);
          let objs = [];

          objs.push(obj);

          let criteria = {
            // typeImex: 'IN',
            // flow: 'CREATE',
            objectId: { $in: objs },
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          };

          // let db = await CylinderImex.getDatastore().manager;
          let _Aggregate = await db
            .collection("cylinderimex")
            .aggregate([
              {
                $match: criteria,
              },
              // {
              //     $lookup:
              //     {
              //         localField: "cylinder",
              //         from: "cylinder",
              //         foreignField: "_id",
              //         as: "cylinderDetail"
              //     }
              // },
              // {
              //     $unwind: {
              //         path: "$cylinderDetail",
              //         preserveNullAndEmptyArrays: false
              //     }
              // },
              {
                $group: {
                  _id: {
                    condition: "$condition",
                    category: "$category",
                    typeImex: "$typeImex",
                    flow: "$flow",
                  },

                  // _id: "$cylinderDetail.classification",
                  count: {
                    $sum: 1,
                  },
                },
              },
              {
                $lookup: {
                  localField: "_id.category",
                  from: "categorycylinder",
                  foreignField: "_id",
                  as: "categorycylinder",
                },
              },
              {
                $unwind: {
                  path: "$categorycylinder",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $project: {
                  _id: "$_id",
                  count: "$count",
                  name: "$categorycylinder.name",
                  code: "$categorycylinder.code",
                },
              },
            ])
            .toArray();

          if (_Aggregate.length > 0) {
            // _Aggregate.forEach(aggregate => {
            //     let indexClass = returnData['INVENTORY_CYLINDER'].detail.cylinder.findIndex(el => el.code === aggregate._id.classification)
            //     let indexWeight = returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder.findIndex(el => el.code === aggregate.code)

            //     if (aggregate._id.typeImex === 'IN') {
            //         returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder[indexWeight].count += aggregate.count
            //     }
            //     else if (aggregate._id.typeImex === 'OUT') {
            //         returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder[indexWeight].count -= aggregate.count
            //     }
            // });

            // const _listClassification = returnData['INVENTORY_CYLINDER'].detail.cylinder
            // _listClassification.forEach((elementClass, indexClass) => {
            //     const _listWeight = returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder
            //     _listWeight.forEach(elementWeight => {
            //         returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].count += elementWeight.count
            //     });
            //     returnData['INVENTORY_CYLINDER'].count += elementClass.count
            // });

            await Promise.all(
              actions.map(async (action) => {
                await Promise.all(
                  _Aggregate.map(async (aggregate) => {
                    let indexClass = returnData[
                      action
                    ].detail.cylinder.findIndex(
                      (el) =>
                        el.code.toUpperCase() ===
                        aggregate._id.condition.toUpperCase()
                    );
                    let indexWeight = returnData[action].detail.cylinder[
                      indexClass
                    ].detail.cylinder.findIndex(
                      (el) => el.code === aggregate.code
                    );

                    let typeImex = "";
                    let flow = [
                      "CREATE",
                      "EXPORT",
                      "IMPORT",
                      "EXPORT_CELL",
                      "IMPORT_CELL",
                      "TURN_BACK",
                      "SALE",
                      "RETURN",
                      "CANCEL",
                    ];

                    switch (action) {
                      // Tổng số bình đã tạo
                      case "CREATED_CYLINDER":
                        typeImex = "IN";
                        flow = ["CREATE"];
                        break;
                      // Tổng số lần nhập bình (khai báo + nhập vỏ + nhập hàng)
                      case "IN_CYLINDER":
                        typeImex = "IN";
                        break;
                      // Tổng số lần xuất bình (xuất hàng + xuất vỏ)
                      case "OUT_CYLINDER":
                        typeImex = "OUT";
                        break;
                      // Tổng số lần xuất hàng
                      case "EXPORT_CYLINDER":
                        typeImex = "OUT";
                        flow = ["EXPORT"];
                        break;
                      // Tổng số lần nhập hàng
                      case "IMPORT_CYLINDER":
                        typeImex = "IN";
                        flow = ["IMPORT"];
                        break;
                      // Tổng số lần xuất vỏ
                      case "EXPORT_CELL_CYLINDER":
                        typeImex = "OUT";
                        flow = ["EXPORT_CELL"];
                        break;
                      // Tổng số lần nhập vỏ
                      case "IMPORT_CELL_CYLINDER":
                        typeImex = "IN";
                        flow = ["IMPORT_CELL"];
                        break;
                      // Tổng số lần bán bình cho người dân
                      case "SALE_CYLINDER":
                        typeImex = "OUT";
                        flow = ["SALE"];
                        break;
                      // Tổng số lần hồi lưu bình
                      case "TURN_BACK_CYLINDER":
                        typeImex = "IN";
                        flow = ["TURN_BACK"];
                        break;
                      default:
                        break;
                    }

                    if (
                      aggregate._id.typeImex === typeImex &&
                      flow.includes(aggregate._id.flow)
                    ) {
                      returnData[action].detail.cylinder[
                        indexClass
                      ].detail.cylinder[indexWeight].count += aggregate.count;
                    }
                  })
                );

                const _listClassification = returnData[action].detail.cylinder;
                await _listClassification.forEach(
                  async (elementClass, indexClass) => {
                    const _listWeight =
                      returnData[action].detail.cylinder[indexClass].detail
                        .cylinder;
                    await _listWeight.forEach(async (elementWeight) => {
                      returnData[action].detail.cylinder[indexClass].count +=
                        elementWeight.count;
                    });
                    returnData[action].count += elementClass.count;
                  }
                );
              })
            );
          }
        }

        return res.json({
          status: true,
          resCode: "SUCCESS-00014",
          data: returnData,
          message: "Lấy thông tin thống kê thành công",
        });
      }

      // --- TH2: Thống kê số liệu của các đơn vị con
      if (statisticalType === "byItsChildren") {
        // returnData.inventoryCylinder = {
        //     code: 'TOTAL',
        //     name: 'Tổng số bình tồn kho',
        //     count: 0,
        // }

        let _countTotal = 0;
        let _listCountByType = [];

        // Search cho loại bình (search.type = WEIGHT) đã có collectin danh mục loại bình
        // Cần search cho các loại khác (COLOR, VALVE)
        let searchContents = searchs[0].contents;
        const parent = await getRootParent(userInfor.id);

        // Danh sách các loại bình
        if (searchs[0].contents.includes("ALL")) {
          const foundType = await CategoryCylinder.find({
            isDeleted: { "!=": true },
            createdBy: parent,
            isDeleted: false,
          });

          if (foundType.length > 0) {
            searchContents = [];
            foundType.forEach((type) => {
              searchContents.push({
                code: type.code,
                name: type.name,
              });
              _listCountByType.push({
                code: type.code,
                name: type.name,
                count: 0,
              });
            });
          }
        }

        // === === === ===

        // Trường hợp công ty mẹ thống kê xem số liệu chi nhánh
        if (typesOfChildren.includes("Region")) {
          typesOfChildren = ["Region"];

          // let obj = ObjectId(target)
          // let objs = []

          // // --- [Rất quan trọng]: searchs --- //

          // // Tạo cấu trúc dữ liệu trả về
          // await Promise.all(actions.map(async action => {
          //     try {
          //         Object.assign(returnData, {
          //             [action]: {
          //                 count: 0,
          //             }
          //         })

          //         const detail = await _createDataStructureBySearch(searchs)
          //         returnData[action].detail = detail
          //     }
          //     catch(error) {
          //         console.log(error.message)
          //     }
          // }));

          // // Loại bỏ INVENTORY_CYLINDER khỏi danh sách action
          // const indexInven = actions.findIndex(action => action === 'INVENTORY_CYLINDER')
          // actions.splice(indexInven, 1)

          // Thống kê các đơn vị con

          await Promise.all(
            typesOfChildren.map(async (type) => {
              // if (userType === Factory && userRole === SuperAdmin)
              // Tìm các chi nhánh vùng và nhà máy sửa chữa
              const listRegion = await User.find({
                isDeleted: { "!=": true },
                isChildOf: target,
                userType: { in: ["Region", "Fixer"] },
                userRole: "SuperAdmin",
                isDeleted: false,
              });

              // Cần kiểm tra listRegion.length > 0

              // --- Thống kê tồn kho
              await Promise.all(
                listRegion.map(async (region) => {
                  let criteria = {
                    isChildOf: region.id,
                    userRole: { in: ["SuperAdmin", "Owner"] },
                  };

                  // Nếu là chi nhánh/công ty con thì tìm các đơn vị con của nó
                  if (region.userType === "Region") {
                    const childs = await User.find(criteria);

                    if (childs.length > 0) {
                      const _dataChilds = await Promise.all(
                        childs.map(async (child) => {
                          objs.push(ObjectId(child.id));

                          // // Thống kê tổng số ===================================
                          // // Tồn kho
                          // const isReturnCylinders = false
                          // let countDataInventory = await _countTotalCylinderInWarehouse(
                          //     child.id,
                          //     endDate,
                          //     isReturnCylinders,
                          // )

                          // if (countDataInventory.success) {
                          //     returnData['INVENTORY_CYLINDER'].count += countDataInventory.count
                          // }

                          // // Thống kê từng loại bình
                          // const cylinders = await Promise.all(searchs[0].contents.map(async searchContent => {
                          //     const isReturnCylinders = true
                          //     let countData = await _countTotalCylinderInWarehouseByType(
                          //         child.id,
                          //         endDate,
                          //         searchs[0].type,
                          //         searchContent,
                          //         isReturnCylinders,
                          //     )

                          //     if (countData.success) {
                          //         let index = returnData['INVENTORY_CYLINDER'].detail.cylinder.findIndex(el => el.code === searchContent)
                          //         if (index >= 0) {
                          //             returnData['INVENTORY_CYLINDER'].detail.cylinder[index].count += countData.count
                          //         }

                          //         if (searchs.length > 1) {
                          //             // Sau khi search xong cắt bỏ điều kiện search đầu tiên
                          //             const newSearchs = searchs.slice(1)
                          //             countData.detail = await _filterCylindersBySearchType(countData.cylinders, newSearchs)

                          //             for (let i = 0; i < countData.detail.cylinders.length; i++) {
                          //                 let _index = returnData['INVENTORY_CYLINDER'].detail.cylinder[index].detail.cylinder.findIndex(el => el.code === countData.detail.cylinders[i].code)
                          //                 if (_index >= 0) {
                          //                     returnData['INVENTORY_CYLINDER'].detail.cylinder[index].detail.cylinder[_index].count += countData.detail.cylinders[i].count
                          //                 }
                          //             }
                          //         }
                          //     }
                          // }))

                          // // Thống kê tổng số ===================================
                          // // theo [action]
                          // await Promise.all(actions.map(async action => {
                          //     const isReturnCylinders = false
                          //     let countData = await _countTotalActionCylinder(
                          //         child.id,
                          //         action,
                          //         startDate,
                          //         endDate,
                          //         isReturnCylinders,
                          //     )

                          //     if (countData.success) {
                          //         returnData[action].count += countData.count
                          //     }

                          //     // Thống kê từng loại bình
                          //     const cylinders = await Promise.all(searchs[0].contents.map(async searchContent => {
                          //         const isReturnCylinders = true
                          //         let countData = await _countTotalActionCylinderByType(
                          //             child.id,
                          //             action,
                          //             startDate,
                          //             endDate,
                          //             searchs[0].type,
                          //             searchContent,
                          //             isReturnCylinders,
                          //         )

                          //         if (countData.success) {
                          //             let index = returnData[action].detail.cylinder.findIndex(el => el.code === searchContent)
                          //             if (index >= 0) {
                          //                 returnData[action].detail.cylinder[index].count += countData.count
                          //             }

                          //             if (searchs.length > 1) {
                          //                 // Sau khi search xong cắt bỏ điều kiện search đầu tiên
                          //                 const newSearchs = searchs.slice(1)
                          //                 countData.detail = await _filterCylindersBySearchType(countData.cylinders, newSearchs)

                          //                 for (let i = 0; i < countData.detail.cylinders.length; i++) {
                          //                     let _index = returnData[action].detail.cylinder[index].detail.cylinder.findIndex(el => el.code === countData.detail.cylinders[i].code)
                          //                     if (_index >= 0) {
                          //                         returnData[action].detail.cylinder[index].detail.cylinder[_index].count += countData.detail.cylinders[i].count
                          //                     }
                          //                 }
                          //             }
                          //         }
                          //     }))
                          // }))
                        })
                      );
                    }
                  }
                  // Nếu là nhà máy sửa chữa thì thống kê chính nó
                  if (region.userType === "Fixer") {
                    objs.push(ObjectId(region.id));

                    // // Thống kê tổng số ===================================
                    // // Tồn kho
                    // const isReturnCylinders = false
                    // let countDataInventory = await _countTotalCylinderInWarehouse(
                    //     region.id,
                    //     endDate,
                    //     isReturnCylinders,
                    // )

                    // if (countDataInventory.success) {
                    //     returnData['INVENTORY_CYLINDER'].count += countDataInventory.count
                    // }

                    // // Thống kê từng loại bình
                    // const cylinders = await Promise.all(searchs[0].contents.map(async searchContent => {
                    //     const isReturnCylinders = true
                    //     let countData = await _countTotalCylinderInWarehouseByType(
                    //         region.id,
                    //         endDate,
                    //         searchs[0].type,
                    //         searchContent,
                    //         isReturnCylinders,
                    //     )

                    //     if (countData.success) {
                    //         let index = returnData['INVENTORY_CYLINDER'].detail.cylinder.findIndex(el => el.code === searchContent)
                    //         if (index >= 0) {
                    //             returnData['INVENTORY_CYLINDER'].detail.cylinder[index].count += countData.count
                    //         }

                    //         if (searchs.length > 1) {
                    //             // Sau khi search xong cắt bỏ điều kiện search đầu tiên
                    //             const newSearchs = searchs.slice(1)
                    //             countData.detail = await _filterCylindersBySearchType(countData.cylinders, newSearchs)

                    //             for (let i = 0; i < countData.detail.cylinders.length; i++) {
                    //                 let _index = returnData['INVENTORY_CYLINDER'].detail.cylinder[index].detail.cylinder.findIndex(el => el.code === countData.detail.cylinders[i].code)
                    //                 if (_index >= 0) {
                    //                     returnData['INVENTORY_CYLINDER'].detail.cylinder[index].detail.cylinder[_index].count += countData.detail.cylinders[i].count
                    //                 }
                    //             }
                    //         }
                    //     }
                    // }))

                    // // Thống kê tổng số ===================================
                    // //
                    // await Promise.all(actions.map(async action => {
                    //     const isReturnCylinders = false
                    //     let countData = await _countTotalActionCylinder(
                    //         region.id,
                    //         action,
                    //         startDate,
                    //         endDate,
                    //         isReturnCylinders,
                    //     )

                    //     if (countData.success) {
                    //         returnData[action].count += countData.count
                    //     }

                    //     // Thống kê từng loại bình
                    //     const cylinders = await Promise.all(searchs[0].contents.map(async searchContent => {
                    //         const isReturnCylinders = true
                    //         let countData = await _countTotalActionCylinderByType(
                    //             region.id,
                    //             action,
                    //             startDate,
                    //             endDate,
                    //             searchs[0].type,
                    //             searchContent,
                    //             isReturnCylinders,
                    //         )

                    //         if (countData.success) {
                    //             let index = returnData[action].detail.cylinder.findIndex(el => el.code === searchContent)
                    //             if (index >= 0) {
                    //                 returnData[action].detail.cylinder[index].count += countData.count
                    //             }

                    //             if (searchs.length > 1) {
                    //                 // Sau khi search xong cắt bỏ điều kiện search đầu tiên
                    //                 const newSearchs = searchs.slice(1)
                    //                 countData.detail = await _filterCylindersBySearchType(countData.cylinders, newSearchs)

                    //                 for (let i = 0; i < countData.detail.cylinders.length; i++) {
                    //                     let _index = returnData[action].detail.cylinder[index].detail.cylinder.findIndex(el => el.code === countData.detail.cylinders[i].code)
                    //                     if (_index >= 0) {
                    //                         returnData[action].detail.cylinder[index].detail.cylinder[_index].count += countData.detail.cylinders[i].count
                    //                     }
                    //                 }
                    //             }
                    //         }

                    //         // if (countData.success) {
                    //         //     let index = returnData[action].detail.cylinder.findIndex(el => el.code === searchContent)
                    //         //     if (index >= 0) {
                    //         //         returnData[action].detail.cylinder[index].count += countData.count
                    //         //     }
                    //         // }

                    //         // delete countData.cylinders

                    //         // return countData
                    //     }))

                    //     // console.log(cylinders)

                    //     // await Promise.all(searchs.map(async (search, index,) => {
                    //         // Thống kê động theo path
                    //         // https://stackoverflow.com/questions/6842795/dynamic-deep-setting-for-a-javascript-object
                    //     // }))
                    // }))
                  }
                })
              );
            })
          );

          // console.log(objs.toString())

          let criteriaInven = {
            // typeImex: 'IN',
            // flow: 'CREATE',
            objectId: { $in: objs },
            createdAt: {
              // $gte: startDate,
              $lte: endDate,
            },
          };

          let db = await CylinderImex.getDatastore().manager;
          let _AggregateInven = await db
            .collection("cylinderimex")
            .aggregate([
              {
                $match: criteriaInven,
              },
              // {
              //     $lookup:
              //     {
              //         localField: "cylinder",
              //         from: "cylinder",
              //         foreignField: "_id",
              //         as: "cylinderDetail"
              //     }
              // },
              // {
              //     $unwind: {
              //         path: "$cylinderDetail",
              //         preserveNullAndEmptyArrays: false
              //     }
              // },
              // // {
              // //     $match: {
              // //         "cylinderDetail.manufacture": ObjectId(manufacture)
              // //     }
              // // },
              {
                $group: {
                  _id: {
                    condition: "$condition",
                    category: "$category",
                    typeImex: "$typeImex",
                    flow: "$flow",
                  },

                  // _id: "$cylinderDetail.classification",
                  count: {
                    $sum: 1,
                  },
                },
              },
              {
                $lookup: {
                  localField: "_id.category",
                  from: "categorycylinder",
                  foreignField: "_id",
                  as: "categorycylinder",
                },
              },
              {
                $unwind: {
                  path: "$categorycylinder",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $project: {
                  _id: "$_id",
                  count: "$count",
                  name: "$categorycylinder.name",
                  code: "$categorycylinder.code",
                },
              },
            ])
            .toArray();

          if (_AggregateInven.length > 0) {
            await Promise.all(
              _AggregateInven.map(async (aggregate) => {
                let indexClass = returnData[
                  "INVENTORY_CYLINDER"
                ].detail.cylinder.findIndex(
                  (el) =>
                    el.code.toUpperCase() ===
                    aggregate._id.condition.toUpperCase()
                );
                let indexWeight = returnData[
                  "INVENTORY_CYLINDER"
                ].detail.cylinder[indexClass].detail.cylinder.findIndex(
                  (el) => el.code === aggregate.code
                );

                if (aggregate._id.typeImex === "IN") {
                  returnData["INVENTORY_CYLINDER"].detail.cylinder[
                    indexClass
                  ].detail.cylinder[indexWeight].count += aggregate.count;
                } else if (aggregate._id.typeImex === "OUT") {
                  returnData["INVENTORY_CYLINDER"].detail.cylinder[
                    indexClass
                  ].detail.cylinder[indexWeight].count -= aggregate.count;
                }
              })
            );

            const _listClassification =
              returnData["INVENTORY_CYLINDER"].detail.cylinder;
            _listClassification.forEach((elementClass, indexClass) => {
              const _listWeight =
                returnData["INVENTORY_CYLINDER"].detail.cylinder[indexClass]
                  .detail.cylinder;
              _listWeight.forEach((elementWeight) => {
                returnData["INVENTORY_CYLINDER"].detail.cylinder[
                  indexClass
                ].count += elementWeight.count;
              });
              returnData["INVENTORY_CYLINDER"].count += elementClass.count;
            });
          }

          // ******** Thống kê trực tiếp qua MongoDB
          // let obj = ObjectId(target)
          // let objs = []

          // objs.push(obj)

          let criteria = {
            // typeImex: 'IN',
            // flow: 'CREATE',
            objectId: { $in: objs },
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          };

          // let db2 = await CylinderImex.getDatastore().manager;
          let _Aggregate = await db
            .collection("cylinderimex")
            .aggregate([
              {
                $match: criteria,
              },
              // {
              //     $lookup:
              //     {
              //         localField: "cylinder",
              //         from: "cylinder",
              //         foreignField: "_id",
              //         as: "cylinderDetail"
              //     }
              // },
              // {
              //     $unwind: {
              //         path: "$cylinderDetail",
              //         preserveNullAndEmptyArrays: false
              //     }
              // },
              {
                $group: {
                  _id: {
                    condition: "$condition",
                    category: "$category",
                    typeImex: "$typeImex",
                    flow: "$flow",
                  },

                  // _id: "$cylinderDetail.classification",
                  count: {
                    $sum: 1,
                  },
                },
              },
              {
                $lookup: {
                  localField: "_id.category",
                  from: "categorycylinder",
                  foreignField: "_id",
                  as: "categorycylinder",
                },
              },
              {
                $unwind: {
                  path: "$categorycylinder",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $project: {
                  _id: "$_id",
                  count: "$count",
                  name: "$categorycylinder.name",
                  code: "$categorycylinder.code",
                },
              },
            ])
            .toArray();

          if (_Aggregate.length > 0) {
            // _Aggregate.forEach(aggregate => {
            //     let indexClass = returnData['INVENTORY_CYLINDER'].detail.cylinder.findIndex(el => el.code === aggregate._id.classification)
            //     let indexWeight = returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder.findIndex(el => el.code === aggregate.code)

            //     if (aggregate._id.typeImex === 'IN') {
            //         returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder[indexWeight].count += aggregate.count
            //     }
            //     else if (aggregate._id.typeImex === 'OUT') {
            //         returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder[indexWeight].count -= aggregate.count
            //     }
            // });

            // const _listClassification = returnData['INVENTORY_CYLINDER'].detail.cylinder
            // _listClassification.forEach((elementClass, indexClass) => {
            //     const _listWeight = returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder
            //     _listWeight.forEach(elementWeight => {
            //         returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].count += elementWeight.count
            //     });
            //     returnData['INVENTORY_CYLINDER'].count += elementClass.count
            // });

            await Promise.all(
              actions.map(async (action) => {
                await Promise.all(
                  _Aggregate.map(async (aggregate) => {
                    let indexClass = returnData[
                      action
                    ].detail.cylinder.findIndex(
                      (el) =>
                        el.code.toUpperCase() ===
                        aggregate._id.condition.toUpperCase()
                    );
                    let indexWeight = returnData[action].detail.cylinder[
                      indexClass
                    ].detail.cylinder.findIndex(
                      (el) => el.code === aggregate.code
                    );

                    let typeImex = "";
                    let flow = [
                      "CREATE",
                      "EXPORT",
                      "IMPORT",
                      "EXPORT_CELL",
                      "IMPORT_CELL",
                      "TURN_BACK",
                      "SALE",
                      "RETURN",
                      "CANCEL",
                    ];

                    switch (action) {
                      // Tổng số bình đã tạo
                      case "CREATED_CYLINDER":
                        typeImex = "IN";
                        flow = ["CREATE"];
                        break;
                      // Tổng số lần nhập bình (khai báo + nhập vỏ + nhập hàng)
                      case "IN_CYLINDER":
                        typeImex = "IN";
                        break;
                      // Tổng số lần xuất bình (xuất hàng + xuất vỏ)
                      case "OUT_CYLINDER":
                        typeImex = "OUT";
                        break;
                      // Tổng số lần xuất hàng
                      case "EXPORT_CYLINDER":
                        typeImex = "OUT";
                        flow = ["EXPORT"];
                        break;
                      // Tổng số lần nhập hàng
                      case "IMPORT_CYLINDER":
                        typeImex = "IN";
                        flow = ["IMPORT"];
                        break;
                      // Tổng số lần xuất vỏ
                      case "EXPORT_CELL_CYLINDER":
                        typeImex = "OUT";
                        flow = ["EXPORT_CELL"];
                        break;
                      // Tổng số lần nhập vỏ
                      case "IMPORT_CELL_CYLINDER":
                        typeImex = "IN";
                        flow = ["IMPORT_CELL"];
                        break;
                      // Tổng số lần bán bình cho người dân
                      case "SALE_CYLINDER":
                        typeImex = "OUT";
                        flow = ["SALE"];
                        break;
                      // Tổng số lần hồi lưu bình
                      case "TURN_BACK_CYLINDER":
                        typeImex = "IN";
                        flow = ["TURN_BACK"];
                        break;
                      default:
                        break;
                    }

                    if (
                      aggregate._id.typeImex === typeImex &&
                      flow.includes(aggregate._id.flow)
                    ) {
                      returnData[action].detail.cylinder[
                        indexClass
                      ].detail.cylinder[indexWeight].count += aggregate.count;
                    }
                  })
                );

                const _listClassification = returnData[action].detail.cylinder;
                await _listClassification.forEach(
                  async (elementClass, indexClass) => {
                    const _listWeight =
                      returnData[action].detail.cylinder[indexClass].detail
                        .cylinder;
                    await _listWeight.forEach(async (elementWeight) => {
                      returnData[action].detail.cylinder[indexClass].count +=
                        elementWeight.count;
                    });
                    returnData[action].count += elementClass.count;
                  }
                );
              })
            );
          }
        }

        // Thống kê các trường hợp còn lại
        else {
          if (typesOfChildren.includes("ALL")) {
            typesOfChildren = ["Warehouse", "Fixer", "General", "Agency"];
          }

          await Promise.all(
            typesOfChildren.map(async (type) => {
              // let _returnData = {
              //     type: type,
              //     list: []
              // }
              let criteria = {
                isChildOf: userInfor.id,
              };

              switch (type) {
                case "Warehouse":
                  criteria = Object.assign(
                    {
                      userType: { in: ["Factory"] },
                      userRole: { in: ["Owner"] },
                    },
                    criteria
                  );
                  break;
                case "Fixer":
                  criteria = Object.assign(
                    {
                      userType: { in: ["Fixer"] },
                      userRole: { in: ["SuperAdmin"] },
                    },
                    criteria
                  );
                  break;
                case "General":
                  criteria = Object.assign(
                    {
                      userType: { in: ["General"] },
                      userRole: { in: ["SuperAdmin"] },
                    },
                    criteria
                  );
                  break;
                case "Agency":
                  criteria = Object.assign(
                    {
                      userType: { in: ["Agency"] },
                      userRole: { in: ["SuperAdmin"] },
                    },
                    criteria
                  );
                  break;
                default:
                  break;
              }

              // Tìm các đơn vị con
              const childs = await User.find(criteria);

              if (childs.length > 0) {
                const _dataChilds = await Promise.all(
                  childs.map(async (child) => {
                    objs.push(ObjectId(child.id));

                    // // Thống kê tổng số ===================================
                    // // Tồn kho
                    // const isReturnCylinders = false
                    // let countDataInventory = await _countTotalCylinderInWarehouse(
                    //     child.id,
                    //     endDate,
                    //     isReturnCylinders,
                    // )

                    // if (countDataInventory.success) {
                    //     returnData['INVENTORY_CYLINDER'].count += countDataInventory.count
                    // }

                    // // Thống kê từng loại bình
                    // const cylinders = await Promise.all(searchs[0].contents.map(async searchContent => {
                    //     const isReturnCylinders = true
                    //     let countData = await _countTotalCylinderInWarehouseByType(
                    //         child.id,
                    //         endDate,
                    //         searchs[0].type,
                    //         searchContent,
                    //         isReturnCylinders,
                    //     )

                    //     if (countData.success) {
                    //         let index = returnData['INVENTORY_CYLINDER'].detail.cylinder.findIndex(el => el.code === searchContent)
                    //         if (index >= 0) {
                    //             returnData['INVENTORY_CYLINDER'].detail.cylinder[index].count += countData.count
                    //         }

                    //         if (searchs.length > 1) {
                    //             // Sau khi search xong cắt bỏ điều kiện search đầu tiên
                    //             const newSearchs = searchs.slice(1)
                    //             countData.detail = await _filterCylindersBySearchType(countData.cylinders, newSearchs)

                    //             for (let i = 0; i < countData.detail.cylinders.length; i++) {
                    //                 let _index = returnData['INVENTORY_CYLINDER'].detail.cylinder[index].detail.cylinder.findIndex(el => el.code === countData.detail.cylinders[i].code)
                    //                 if (_index >= 0) {
                    //                     returnData['INVENTORY_CYLINDER'].detail.cylinder[index].detail.cylinder[_index].count += countData.detail.cylinders[i].count
                    //                 }
                    //             }
                    //         }
                    //     }
                    // }))

                    // // Thống kê tổng số ===================================
                    // // theo [action]
                    // await Promise.all(actions.map(async action => {
                    //     const isReturnCylinders = false
                    //     let countData = await _countTotalActionCylinder(
                    //         child.id,
                    //         action,
                    //         startDate,
                    //         endDate,
                    //         isReturnCylinders,
                    //     )

                    //     if (countData.success) {
                    //         returnData[action].count += countData.count
                    //     }

                    //     // Thống kê từng loại bình
                    //     const cylinders = await Promise.all(searchs[0].contents.map(async searchContent => {
                    //         const isReturnCylinders = true
                    //         let countData = await _countTotalActionCylinderByType(
                    //             child.id,
                    //             action,
                    //             startDate,
                    //             endDate,
                    //             searchs[0].type,
                    //             searchContent,
                    //             isReturnCylinders,
                    //         )

                    //         if (countData.success) {
                    //             let index = returnData[action].detail.cylinder.findIndex(el => el.code === searchContent)
                    //             if (index >= 0) {
                    //                 returnData[action].detail.cylinder[index].count += countData.count
                    //             }

                    //             if (searchs.length > 1) {
                    //                 // Sau khi search xong cắt bỏ điều kiện search đầu tiên
                    //                 const newSearchs = searchs.slice(1)
                    //                 countData.detail = await _filterCylindersBySearchType(countData.cylinders, newSearchs)

                    //                 for (let i = 0; i < countData.detail.cylinders.length; i++) {
                    //                     let _index = returnData[action].detail.cylinder[index].detail.cylinder.findIndex(el => el.code === countData.detail.cylinders[i].code)
                    //                     if (_index >= 0) {
                    //                         returnData[action].detail.cylinder[index].detail.cylinder[_index].count += countData.detail.cylinders[i].count
                    //                     }
                    //                 }
                    //             }
                    //         }
                    //     }))
                    // }))
                  })
                );
              }

              // return returnData
            })
          );

          let criteriaInven = {
            // typeImex: 'IN',
            // flow: 'CREATE',
            objectId: { $in: objs },
            createdAt: {
              // $gte: startDate,
              $lte: endDate,
            },
          };

          let db = await CylinderImex.getDatastore().manager;
          let _AggregateInven = await db
            .collection("cylinderimex")
            .aggregate([
              {
                $match: criteriaInven,
              },
              // {
              //     $lookup:
              //     {
              //         localField: "cylinder",
              //         from: "cylinder",
              //         foreignField: "_id",
              //         as: "cylinderDetail"
              //     }
              // },
              // {
              //     $unwind: {
              //         path: "$cylinderDetail",
              //         preserveNullAndEmptyArrays: false
              //     }
              // },
              // // {
              // //     $match: {
              // //         "cylinderDetail.manufacture": ObjectId(manufacture)
              // //     }
              // // },
              {
                $group: {
                  _id: {
                    condition: "$condition",
                    category: "$category",
                    typeImex: "$typeImex",
                    flow: "$flow",
                  },

                  // _id: "$cylinderDetail.classification",
                  count: {
                    $sum: 1,
                  },
                },
              },
              {
                $lookup: {
                  localField: "_id.category",
                  from: "categorycylinder",
                  foreignField: "_id",
                  as: "categorycylinder",
                },
              },
              {
                $unwind: {
                  path: "$categorycylinder",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $project: {
                  _id: "$_id",
                  count: "$count",
                  name: "$categorycylinder.name",
                  code: "$categorycylinder.code",
                },
              },
            ])
            .toArray();

          if (_AggregateInven.length > 0) {
            await Promise.all(
              _AggregateInven.map(async (aggregate) => {
                let indexClass = returnData[
                  "INVENTORY_CYLINDER"
                ].detail.cylinder.findIndex(
                  (el) =>
                    el.code.toUpperCase() ===
                    aggregate._id.condition.toUpperCase()
                );
                let indexWeight = returnData[
                  "INVENTORY_CYLINDER"
                ].detail.cylinder[indexClass].detail.cylinder.findIndex(
                  (el) => el.code === aggregate.code
                );

                if (aggregate._id.typeImex === "IN") {
                  returnData["INVENTORY_CYLINDER"].detail.cylinder[
                    indexClass
                  ].detail.cylinder[indexWeight].count += aggregate.count;
                } else if (aggregate._id.typeImex === "OUT") {
                  returnData["INVENTORY_CYLINDER"].detail.cylinder[
                    indexClass
                  ].detail.cylinder[indexWeight].count -= aggregate.count;
                }
              })
            );

            const _listClassification =
              returnData["INVENTORY_CYLINDER"].detail.cylinder;
            _listClassification.forEach((elementClass, indexClass) => {
              const _listWeight =
                returnData["INVENTORY_CYLINDER"].detail.cylinder[indexClass]
                  .detail.cylinder;
              _listWeight.forEach((elementWeight) => {
                returnData["INVENTORY_CYLINDER"].detail.cylinder[
                  indexClass
                ].count += elementWeight.count;
              });
              returnData["INVENTORY_CYLINDER"].count += elementClass.count;
            });
          }

          // ******** Thống kê trực tiếp qua MongoDB
          // let obj = ObjectId(target)
          // let objs = []

          // objs.push(obj)

          let criteria = {
            // typeImex: 'IN',
            // flow: 'CREATE',
            objectId: { $in: objs },
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          };

          // let db = await CylinderImex.getDatastore().manager;
          let _Aggregate = await db
            .collection("cylinderimex")
            .aggregate([
              {
                $match: criteria,
              },
              // {
              //     $lookup:
              //     {
              //         localField: "cylinder",
              //         from: "cylinder",
              //         foreignField: "_id",
              //         as: "cylinderDetail"
              //     }
              // },
              // {
              //     $unwind: {
              //         path: "$cylinderDetail",
              //         preserveNullAndEmptyArrays: false
              //     }
              // },
              {
                $group: {
                  _id: {
                    condition: "$condition",
                    category: "$category",
                    typeImex: "$typeImex",
                    flow: "$flow",
                  },

                  // _id: "$cylinderDetail.classification",
                  count: {
                    $sum: 1,
                  },
                },
              },
              {
                $lookup: {
                  localField: "_id.category",
                  from: "categorycylinder",
                  foreignField: "_id",
                  as: "categorycylinder",
                },
              },
              {
                $unwind: {
                  path: "$categorycylinder",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $project: {
                  _id: "$_id",
                  count: "$count",
                  name: "$categorycylinder.name",
                  code: "$categorycylinder.code",
                },
              },
            ])
            .toArray();

          if (_Aggregate.length > 0) {
            // _Aggregate.forEach(aggregate => {
            //     let indexClass = returnData['INVENTORY_CYLINDER'].detail.cylinder.findIndex(el => el.code === aggregate._id.classification)
            //     let indexWeight = returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder.findIndex(el => el.code === aggregate.code)

            //     if (aggregate._id.typeImex === 'IN') {
            //         returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder[indexWeight].count += aggregate.count
            //     }
            //     else if (aggregate._id.typeImex === 'OUT') {
            //         returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder[indexWeight].count -= aggregate.count
            //     }
            // });

            // const _listClassification = returnData['INVENTORY_CYLINDER'].detail.cylinder
            // _listClassification.forEach((elementClass, indexClass) => {
            //     const _listWeight = returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].detail.cylinder
            //     _listWeight.forEach(elementWeight => {
            //         returnData['INVENTORY_CYLINDER'].detail.cylinder[indexClass].count += elementWeight.count
            //     });
            //     returnData['INVENTORY_CYLINDER'].count += elementClass.count
            // });

            await Promise.all(
              actions.map(async (action) => {
                await Promise.all(
                  _Aggregate.map(async (aggregate) => {
                    let indexClass = returnData[
                      action
                    ].detail.cylinder.findIndex(
                      (el) =>
                        el.code.toUpperCase() ===
                        aggregate._id.condition.toUpperCase()
                    );
                    let indexWeight = returnData[action].detail.cylinder[
                      indexClass
                    ].detail.cylinder.findIndex(
                      (el) => el.code === aggregate.code
                    );

                    let typeImex = "";
                    let flow = [
                      "CREATE",
                      "EXPORT",
                      "IMPORT",
                      "EXPORT_CELL",
                      "IMPORT_CELL",
                      "TURN_BACK",
                      "SALE",
                      "RETURN",
                      "CANCEL",
                    ];

                    switch (action) {
                      // Tổng số bình đã tạo
                      case "CREATED_CYLINDER":
                        typeImex = "IN";
                        flow = ["CREATE"];
                        break;
                      // Tổng số lần nhập bình (khai báo + nhập vỏ + nhập hàng)
                      case "IN_CYLINDER":
                        typeImex = "IN";
                        break;
                      // Tổng số lần xuất bình (xuất hàng + xuất vỏ)
                      case "OUT_CYLINDER":
                        typeImex = "OUT";
                        break;
                      // Tổng số lần xuất hàng
                      case "EXPORT_CYLINDER":
                        typeImex = "OUT";
                        flow = ["EXPORT"];
                        break;
                      // Tổng số lần nhập hàng
                      case "IMPORT_CYLINDER":
                        typeImex = "IN";
                        flow = ["IMPORT"];
                        break;
                      // Tổng số lần xuất vỏ
                      case "EXPORT_CELL_CYLINDER":
                        typeImex = "OUT";
                        flow = ["EXPORT_CELL"];
                        break;
                      // Tổng số lần nhập vỏ
                      case "IMPORT_CELL_CYLINDER":
                        typeImex = "IN";
                        flow = ["IMPORT_CELL"];
                        break;
                      // Tổng số lần bán bình cho người dân
                      case "SALE_CYLINDER":
                        typeImex = "OUT";
                        flow = ["SALE"];
                        break;
                      // Tổng số lần hồi lưu bình
                      case "TURN_BACK_CYLINDER":
                        typeImex = "IN";
                        flow = ["TURN_BACK"];
                        break;
                      default:
                        break;
                    }

                    if (
                      aggregate._id.typeImex === typeImex &&
                      flow.includes(aggregate._id.flow)
                    ) {
                      returnData[action].detail.cylinder[
                        indexClass
                      ].detail.cylinder[indexWeight].count += aggregate.count;
                    }
                  })
                );

                const _listClassification = returnData[action].detail.cylinder;
                await _listClassification.forEach(
                  async (elementClass, indexClass) => {
                    const _listWeight =
                      returnData[action].detail.cylinder[indexClass].detail
                        .cylinder;
                    await _listWeight.forEach(async (elementWeight) => {
                      returnData[action].detail.cylinder[indexClass].count +=
                        elementWeight.count;
                    });
                    returnData[action].count += elementClass.count;
                  }
                );
              })
            );
          }
        }

        // returnData.inventoryCylinder[0].count = _countTotal
        // const newData = returnData.inventoryCylinder.concat(_listCountByType)
        // returnData.inventoryCylinder = newData

        return res.json({
          status: true,
          resCode: "SUCCESS-00014",
          data: returnData,
          message: "Lấy thông tin thống kê thành công",
        });
      }
    } catch (error) {
      return res.json({
        status: false,
        resCode: "CATCH-00003",
        data: {
          error: error.message,
        },
        message: "Gặp lỗi khi lấy thông tin thống kê",
      });
    }
  },

  // Test
  Test: async function (req, res) {
    // Deprecated

    const {
      email,
      // target,
      // action,
      // startDate,
      // endDate,
      // typeCylinder,
    } = req.body;

    try {
      // let flaverr = require('flaverr');

      // await sails.getDatastore()
      //     .transaction(async (db) => {

      //         const userInfo = await User.findOne({isDeleted: {"!=": true}, email: email })
      //             .usingConnection(db);
      //         if (!userInfo) {
      //             throw new Error('Consistency violation: Database is corrupted-- logged in user record has gone missing');
      //         }

      //         // var myAccount = await BankAccount.findOne({isDeleted: {"!=": true}, owner: this.req.session.userId })
      //         //     .usingConnection(db);
      //         // if (!myAccount) {
      //         //     throw new Error('Consistency violation: Database is corrupted-- logged in user record has gone missing');
      //         // }

      //         // var recipientAccount = await BankAccount.findOne({isDeleted: {"!=": true}, owner: inputs.recipientId }).usingConnection(db)
      //         // if (!recipientAccount) {
      //         //     throw flaverr('E_NO_SUCH_RECIPIENT', new Error('There is no recipient with that id'));
      //         // }

      //         // // Do the math to subtract from the logged-in user's account balance,
      //         // // and add to the recipient's bank account balance.
      //         // var myNewBalance = myAccount.balance - inputs.amount;

      //         // // If this would put the logged-in user's account balance below zero,
      //         // // then abort.  (The transaction will be rolled back automatically.)
      //         // if (myNewBalance < 0) {
      //         //     throw flaverr('E_INSUFFICIENT_FUNDS', new Error('Insufficient funds'));
      //         // }

      //         // // Update the current user's bank account
      //         // await BankAccount.update({isDeleted: {"!=": true}, owner: this.req.session.userId })
      //         //     .set({
      //         //         balance: myNewBalance
      //         //     })
      //         //     .usingConnection(db);

      //         // // Update the recipient's bank account
      //         // await BankAccount.update({isDeleted: {"!=": true}, owner: inputs.recipientId })
      //         //     .set({
      //         //         balance: recipientAccount.balance + inputs.amount
      //         //     })
      //         //     .usingConnection(db);
      //     })
      //     .intercept('E_INSUFFICIENT_FUNDS', () => 'badRequest')
      //     .intercept('E_NO_SUCH_RECIPIENT', () => 'notFound');

      // return res.ok()

      var db = await sails.getDatastore().manager;

      let userInfor = await db
        .collection("user")
        .findOne({ isDeleted: { "!=": true }, email: "hoanganhgas@gmail.com" });

      // const session = db.startSession();

      const transactionOptions = {
        readPreference: "primary",
        readConcern: { level: "local" },
        writeConcern: { w: "majority" },
      };

      try {
        await db.withTransaction(async () => {
          // const coll1 = client.db('mydb1').collection('foo');
          // const coll2 = client.db('mydb2').collection('bar');

          // Important:: You must pass the session to the operations

          await db.collection("user").insertOne({
            email: "testTransaction@gmail.com",
            name: "testTransaction",
          });
          // await coll2.insertOne({ xyz: 999 }, { session });
        }, transactionOptions);
      } catch (error) {
        console.log(error.message);
      } finally {
        // await session.endSession();
        await db.close();
      }

      return res.json({
        data: userInfor,
      });

      // console.log(userInfor)

      // // ================================================

      // var db = await CylinderImex.getDatastore().manager;

      // let obj = ObjectId(target)
      // let objs = []

      // objs.push(obj)

      // let criteria = {
      //     // typeImex: 'IN',
      //     // flow: 'CREATE',
      //     objectId : {$in: objs},
      //     createdAt: {
      //         $gte: startDate,
      //         $lte: endDate,
      //     }
      // }

      // let t_Agg = await db.collection("cylinderimex").aggregate([
      //     {
      //         $match: criteria
      //     },
      //     {
      //       $lookup:
      //         {
      //             localField: "cylinder",
      //             from: "cylinder",
      //             foreignField: "_id",
      //             as: "inventory_docs"
      //         }
      //     },
      //     // {
      //     //     $count: "total"
      //     // },
      //     {
      //         $unwind : {
      //             path : "$inventory_docs",
      //             preserveNullAndEmptyArrays : false
      //         }
      //     },
      //     // {
      //     //     $lookup:
      //     //     {
      //     //         localField: "inventory_docs.category",
      //     //         from: "categorycylinder",
      //     //         foreignField: "_id",
      //     //         as: "categorycylinder"
      //     //     }
      //     // },
      //     // {
      //     //     $unwind : {
      //     //         path : "$categorycylinder",
      //     //         preserveNullAndEmptyArrays : false
      //     //     }
      //     // },
      //     {
      //         $group: {
      //             _id : {
      //                 "classification" : "$inventory_docs.classification",
      //                 "category" : "$inventory_docs.category",
      //                 "typeImex": "$typeImex",
      //                 "flow": '$flow',
      //             },

      //             // _id: "$inventory_docs.classification",
      //             count : {
      //                 "$sum" : 1
      //             },
      //         }
      //     },
      //     // {
      //     //     $lookup:
      //     //     {
      //     //         localField: "_id.category",
      //     //         from: "categorycylinder",
      //     //         foreignField: "_id",
      //     //         as: "categorycylinder"
      //     //     }
      //     // },
      //     // {
      //     //     $unwind : {
      //     //         path : "$categorycylinder",
      //     //         preserveNullAndEmptyArrays : false
      //     //     }
      //     // },
      //     // {
      //     //     $project: {
      //     //         _id: "$_id",
      //     //         count: "$count",
      //     //         name: "$categorycylinder.name"
      //     //     }
      //     // },
      // ]).toArray()

      // return res.ok({ data: t_Agg })
    } catch (error) {
      console.log(error.message);
      return res.serverError(error.message);
    }
  },
};

/**
 * Tìm tổng số bình theo Action
 * @param target
 * @param action
 * @param startDate
 * @param endDate
 * @returns {*}
 */
_countTotalActionCylinder = async function (
  target,
  action,
  startDate,
  endDate,
  isReturnCylinders
) {
  let returnData = {
    success: false,
    count: 0,
    message: "",
  };

  try {
    let criteria = {
      objectId: target,
      createdAt: { ">=": startDate, "<=": endDate },
    };

    switch (action) {
      // Tổng số bình đã tạo
      case "CREATED_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "IN",
            flow: "CREATE",
          },
          criteria
        );
        break;
      // Tổng số lần nhập bình (khai báo + nhập vỏ + nhập hàng)
      case "IN_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "IN",
          },
          criteria
        );
        break;
      // Tổng số lần xuất bình (xuất hàng + xuất vỏ)
      case "OUT_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "OUT",
          },
          criteria
        );
        break;
      // Tổng số lần xuất hàng
      case "EXPORT_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "OUT",
            flow: "EXPORT",
          },
          criteria
        );
        break;
      // Tổng số lần nhập hàng
      case "IMPORT_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "IN",
            flow: "IMPORT",
          },
          criteria
        );
        break;
      // Tổng số lần xuất vỏ
      case "EXPORT_CELL_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "OUT",
            flow: "EXPORT_CELL",
          },
          criteria
        );
        break;
      // Tổng số lần nhập vỏ
      case "IMPORT_CELL_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "IN",
            flow: "IMPORT_CELL",
          },
          criteria
        );
        break;
      // Tổng số lần bán bình cho người dân
      case "SALE_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "OUT",
            flow: "SALE",
          },
          criteria
        );
        break;
      // Tổng số lần hồi lưu bình
      case "TURN_BACK_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "IN",
            flow: "TURN_BACK",
          },
          criteria
        );
        break;
      default:
        break;
    }

    let cylinders = [];
    let numberCylinder = 0;

    if (isReturnCylinders === true) {
      const find = await CylinderImex.find(criteria).populate("cylinder");
      cylinders = await Promise.all(
        find.map((el) => {
          return el.cylinder;
        })
      );
      numberCylinder = cylinders.length;
    } else {
      numberCylinder = await CylinderImex.count(criteria);
    }

    returnData.success = true;
    returnData.count = numberCylinder;
    returnData.message = "Thành công";
    returnData.cylinders = cylinders;

    return returnData;
  } catch (error) {
    return {
      success: false,
      count: 0,
      message: error.message,
    };
  }
};

/**
 * Tìm tổng số bình [Action] theo loại
 * @param target
 * @param action
 * @param startDate
 * @param endDate
 * @param typeCylinder
 * @returns {*}
 */
_countTotalActionCylinderByType = async function (
  target,
  action,
  startDate,
  endDate,
  searchType,
  searchContent,
  isReturnCylinders
) {
  let returnData = {
    success: false,
    code: "",
    name: "",
    count: 0,
    message: "",
  };

  try {
    let criteria = {
      objectId: target,
      createdAt: { ">=": startDate, "<=": endDate },
    };

    switch (action) {
      // Tổng số bình đã tạo
      case "CREATED_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "IN",
            flow: "CREATE",
          },
          criteria
        );
        break;
      // Tổng số lần nhập bình (khai báo + nhập vỏ + nhập hàng + hồi lưu)
      case "IN_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "IN",
          },
          criteria
        );
        break;
      // Tổng số lần xuất bình (xuất hàng + xuất vỏ + bán hàng)
      case "OUT_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "OUT",
          },
          criteria
        );
        break;
      // Tổng số lần xuất hàng
      case "EXPORT_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "OUT",
            flow: "EXPORT",
          },
          criteria
        );
        break;
      // Tổng số lần nhập hàng
      case "IMPORT_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "IN",
            flow: "IMPORT",
          },
          criteria
        );
        break;
      // Tổng số lần xuất vỏ
      case "EXPORT_CELL_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "OUT",
            flow: "EXPORT_CELL",
          },
          criteria
        );
        break;
      // Tổng số lần nhập vỏ
      case "IMPORT_CELL_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "IN",
            flow: "IMPORT_CELL",
          },
          criteria
        );
        break;
      // Tổng số lần bán bình cho người dân
      case "SALE_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "OUT",
            flow: "SALE",
          },
          criteria
        );
        break;
      // Tổng số lần hồi lưu bình
      case "TURN_BACK_CYLINDER":
        criteria = Object.assign(
          {
            typeImex: "IN",
            flow: "TURN_BACK",
          },
          criteria
        );
        break;
      default:
        break;
    }

    let cylinders = [];
    let count = 0;

    //
    const _search = await _criteriaForSearch(searchType);
    const _searchContent = await _criteriaForContent(searchType, searchContent);

    if (_searchContent.success) {
      // Tìm danh sách bình với action tương ứng
      const records = await CylinderImex.find(criteria).populate("cylinder");

      if (isReturnCylinders === true) {
        await Promise.all(
          records.map((record) => {
            if (record.cylinder[_search] === _searchContent.content) {
              cylinders.push(record.cylinder);
              count++;
            }
          })
        );
      } else {
        await Promise.all(
          records.map((record) => {
            if (record.cylinder[_search] === _searchContent.content) {
              count++;
            }
          })
        );
      }
    } else {
      return {
        success: false,
        code: searchContent,
        name: searchContent,
        count: 0,
        message: "Not found",
        cylinders,
      };
    }

    // // Tìm danh sách bình với action tương ứng
    // const records = await CylinderImex.find(criteria).populate('cylinder')

    // // Lọc và đếm danh sách bình theo loại
    // let count = 0
    // await Promise.all(records.map(record => {
    //     if (record.cylinder[searchType] === searchContent) {
    //         count++
    //     }
    // }))

    returnData.success = true;
    returnData.code = _searchContent.code;
    returnData.name = _searchContent.name;
    returnData.count = count;
    returnData.message = "Thành công";
    returnData.cylinders = cylinders;

    return returnData;
  } catch (error) {
    return {
      success: false,
      code: "",
      name: "",
      count: 0,
      message: error.message,
    };
  }
};

/**
 * Tìm tổng số bình trong kho
 * @param target
 * @param endDate
 * @returns {*}
 */
_countTotalCylinderInWarehouse = async function (
  target,
  endDate,
  isReturnCylinders
) {
  let returnData = {
    success: false,
    count: 0,
    message: "",
  };

  try {
    // "1970-01-01T00:00:00.000Z"
    const startDate = new Date(0).toISOString();

    const totalIN = await _countTotalActionCylinder(
      target,
      "IN_CYLINDER",
      startDate,
      endDate,
      isReturnCylinders
    );
    const totalOUT = await _countTotalActionCylinder(
      target,
      "OUT_CYLINDER",
      startDate,
      endDate,
      isReturnCylinders
    );

    const numberCylinder = totalIN.count - totalOUT.count;

    if (isReturnCylinders === true) {
      let cylindersIN = totalIN.cylinders;
      let cylindersOUT = totalOUT.cylinders;

      // Lấy danh sách bình trong kho
      for (let i = 0; i < cylindersOUT.length; i++) {
        // for (let j = 0; j < cylindersIN.length; j++) {
        const found = cylindersIN.find(
          (element) => element.id === cylindersOUT[i].id
        );
        if (found) {
          const index = cylindersIN.indexOf(found);
          cylindersIN.splice(index, 1);
          // break;
        }
        // }
      }

      //
      returnData.cylinders = cylindersIN;
    }

    returnData.success = true;
    returnData.count = numberCylinder;
    returnData.message = "Thành công";

    return returnData;
  } catch (error) {
    return {
      success: false,
      count: 0,
      message: error.message,
    };
  }
};

/**
 * Tìm tổng số bình trong kho theo loại
 * @param target
 * @param endDate
 * @param typeCylinder
 * @returns {*}
 */
_countTotalCylinderInWarehouseByType = async function (
  target,
  endDate,
  searchType,
  searchContent,
  isReturnCylinders
) {
  let returnData = {
    success: false,
    code: "",
    name: "",
    count: 0,
    message: "",
  };

  try {
    // "1970-01-01T00:00:00.000Z"
    const startDate = new Date(0).toISOString();

    // //
    // const _search = await _criteriaForSearch(searchType)
    const _searchContent = await _criteriaForContent(searchType, searchContent);

    const totalIN = await _countTotalActionCylinderByType(
      target,
      "IN_CYLINDER",
      startDate,
      endDate,
      searchType,
      searchContent,
      isReturnCylinders
    );
    const totalOUT = await _countTotalActionCylinderByType(
      target,
      "OUT_CYLINDER",
      startDate,
      endDate,
      searchType,
      searchContent,
      isReturnCylinders
    );

    const numberCylinder = totalIN.count - totalOUT.count;

    if (isReturnCylinders === true) {
      let cylindersIN = totalIN.cylinders;
      let cylindersOUT = totalOUT.cylinders;

      // Lấy danh sách bình trong kho
      for (let i = 0; i < cylindersOUT.length; i++) {
        // for (let j = 0; j < cylindersIN.length; j++) {
        const found = cylindersIN.find(
          (element) => element.id === cylindersOUT[i].id
        );
        if (found) {
          const index = cylindersIN.indexOf(found);
          cylindersIN.splice(index, 1);
          // break;
        }
        // }
      }

      //
      returnData.cylinders = cylindersIN;
    }

    returnData.success = true;
    returnData.code = _searchContent.code;
    returnData.name = _searchContent.name;
    returnData.count = numberCylinder;
    returnData.message = "Thành công";

    return returnData;
  } catch (error) {
    return {
      success: false,
      code: searchContent,
      name: searchContent,
      count: 0,
      message: error.message,
    };
  }
};

//
_criteriaForSearch = async function (searchType) {
  let returnSearch = "";

  switch (searchType) {
    case "WEIGHT":
      returnSearch = "category";
      break;
    case "COLOR":
      returnSearch = "color";
      break;
    case "VALVE":
      returnSearch = "valve";
      break;
    case "CLASS":
      returnSearch = "classification";
      break;
    case "MANUFACTURE":
      returnSearch = "manufacture";
      break;
    default:
      break;
  }

  return returnSearch;
};

//
_criteriaForContent = async function (searchType, searchContent) {
  let returnData = {
    success: false,
    code: searchContent,
    name: "",
    content: "",
  };

  switch (searchType) {
    case "WEIGHT":
      const found = await CategoryCylinder.findOne({
        isDeleted: { "!=": true },
        code: searchContent,
      });
      if (found) {
        returnData.success = true;
        returnData.name = found.name;
        returnData.content = found.id;
      }
      break;
    case "COLOR":
      returnData.success = true;
      returnData.name = searchContent;
      returnData.content = searchContent;
      break;
    case "VALVE":
      returnData.success = true;
      returnData.name = searchContent;
      returnData.content = searchContent;
      break;
    case "CLASS":
      returnData.success = true;
      returnData.name = searchContent;
      returnData.content = searchContent;
      break;
    case "MANUFACTURE":
      returnData.success = true;
      returnData.name = searchContent;
      returnData.content = searchContent;
      break;
    default:
      break;
  }

  return returnData;
};

//
_filterCylindersBySearchType = async function (cylinders, searchs, userId) {
  let returnData = {
    _key: "",
    success: false,
    message: "",
  };
  try {
    if (searchs.length > 0) {
      let search = searchs[0];
      let searchContents = searchs[0].contents;
      let nameContents = [];
      // Nếu tìm theo danh mục bình (VD: WEIGHT - danh mục trọng lượng bình)
      // Thì trả ra name theo tên trong Collection danh mục
      // Nếu tìm theo field trên Collection Cylinder (VD: COLOR, VALVE, CLASS)
      // Thì trả ra name theo tên filed tương ứng trong Collection Cylinder
      let isChangeName = false;

      // Cần danh sách content!!! - Trường hợp search {WEIGHT - ALL}
      if (search.type === "WEIGHT" && search.contents.includes("ALL")) {
        const parent = await getRootParent(userId);

        const foundType = await CategoryCylinder.find({
          isDeleted: { "!=": true },
          createdBy: parent,
          isDeleted: false,
        });

        if (foundType.length > 0) {
          // Đổi tên trả ra
          isChangeName = true;

          nameContents = [];
          searchContents = [];
          foundType.forEach((type) => {
            searchContents.push(type.code);
            nameContents.push(type.name);
          });
        }
      }

      // await Promise.all(searchs.map( async search => {
      const _search = await _criteriaForSearch(search.type);

      const _data = await Promise.all(
        searchContents.map(async (content, index) => {
          let returnData = {
            success: false,
            code: content,
            name: "",
            count: 0,
          };

          // Cần danh sách content!!! - Trường hợp search {WEIGHT - ALL}
          const _searchContent = await _criteriaForContent(
            search.type,
            content
          );

          if (_searchContent.success) {
            try {
              const _listCylinders = cylinders.filter(
                (cylinder) => cylinder[_search] === _searchContent.content
              );

              returnData.count = _listCylinders.length;
              returnData.success = true;
              returnData.name = isChangeName
                ? nameContents[index]
                : _searchContent.content;
              returnData.cylinders = _listCylinders;

              if (searchs.length > 1) {
                // Sau khi search xong cắt bỏ điều kiện search đầu tiên
                const newSearchs = searchs.slice(1);
                returnData.detail = await _filterCylindersBySearchType(
                  returnData.cylinders,
                  newSearchs,
                  userId
                );
              }

              delete returnData.cylinders;

              return returnData;
            } catch (error) {
              return {
                _key: _search,
                success: false,
                count: 0,
                message: error.message,
              };
            }
          } else {
            return {
              _key: _search,
              success: false,
              count: 0,
              message: "Not found",
            };
          }
        })
      );
      // }))

      returnData._key = search.type;
      returnData.success = true;
      returnData.message = "Thành công";
      returnData.cylinders = _data;

      return returnData;
    } else {
      return {
        _key: "",
        success: true,
        message: "Không còn _key để tìm kiếm",
      };
    }
  } catch (error) {
    return {
      _key: "",
      success: false,
      message: error.message,
    };
  }
};

//
_filterCylindersBySearchType2 = async function (
  cylinders,
  searchs,
  manufacture
) {
  let returnData = {
    _key: "",
    success: false,
    message: "",
  };
  try {
    if (searchs.length > 0) {
      let search = searchs[0];
      let searchContents = searchs[0].contents;

      // await Promise.all(searchs.map( async search => {
      const _search = await _criteriaForSearch(search.type);

      const _data = await Promise.all(
        searchContents.map(async (content) => {
          let returnData = {
            success: false,
            code: content,
            name: "",
            count: 0,
          };

          // Cần danh sách content!!! - Trường hợp search {WEIGHT - ALL}
          const _searchContent = await _criteriaForContent(
            search.type,
            content
          );

          if (_searchContent.success) {
            try {
              // // // === === Lọc danh sách bình theo manufacture === === // // //
              const newCylinders = cylinders.filter(
                (cylinder) => cylinder.manufacture === manufacture
              );

              const _listCylinders = newCylinders.filter(
                (cylinder) => cylinder[_search] === _searchContent.content
              );

              returnData.count = _listCylinders.length;
              returnData.success = true;
              returnData.name = _searchContent.content;
              returnData.cylinders = _listCylinders;

              if (searchs.length > 1) {
                // Sau khi search xong cắt bỏ điều kiện search đầu tiên
                const newSearchs = searchs.slice(1);
                returnData.detail = await _filterCylindersBySearchType2(
                  returnData.cylinders,
                  newSearchs,
                  userId
                );
              }

              delete returnData.cylinders;

              return returnData;
            } catch (error) {
              return {
                _key: _search,
                success: false,
                count: 0,
                message: error.message,
              };
            }
          } else {
            return {
              _key: _search,
              success: false,
              count: 0,
              message: "Not found",
            };
          }
        })
      );
      // }))

      returnData._key = search.type;
      returnData.success = true;
      returnData.message = "Thành công";
      returnData.cylinders = _data;

      return returnData;
    } else {
      return {
        _key: "",
        success: true,
        message: "Không còn _key để tìm kiếm",
      };
    }
  } catch (error) {
    return {
      _key: "",
      success: false,
      message: error.message,
    };
  }
};

//
_createDataStructureBySearch = async function (searchs) {
  // returnData.push({
  //     [action]: {
  //         count: 0,
  //         _key: '',
  //         cylinder: [],
  //     }
  // })

  let _returnData = {
    _key: searchs[0].type,
    cylinder: [],
  };

  await Promise.all(
    searchs[0].contents.map(async (content) => {
      const _searchContent = await _criteriaForContent(
        searchs[0].type,
        content
      );

      _returnData.cylinder.push({
        code: _searchContent.code,
        name: _searchContent.name,
        count: 0,
      });
    })
  );

  await Promise.all(
    _returnData.cylinder.map(async (cylinder) => {
      if (searchs.length > 1) {
        const newSearchs = searchs.slice(1);
        cylinder.detail = await _createDataStructureBySearch(newSearchs);
      }
    })
  );

  return _returnData;
};

// *************** Function to get root Parent of user tree
async function getRootParent(parentId) {
  try {
    if (
      parentId === null ||
      typeof parentId === "undefined" ||
      parentId === ""
    ) {
      return "";
    }
    let parent = await User.findOne({
      isDeleted: { "!=": true },
      id: parentId,
    });
    if (!parent) {
      return "";
    }
    if (
      parent.userType === USER_TYPE.Factory &&
      parent.userRole === USER_ROLE.SUPER_ADMIN
    ) {
      return parent.id;
    }
    return await getRootParent(parent.isChildOf);
  } catch (error) {
    console.log(error.message);
  }
}

// Dùng cho searchCylindersImex
async function sortArray(array) {
  array.sort(function (a, b) {
    var nameA = a.code.toUpperCase(); // bỏ qua hoa thường
    var nameB = b.code.toUpperCase(); // bỏ qua hoa thường
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // name trùng nhau
    return 0;
  });
}

// Dùng cho detailCylindersImex
async function sortArrayDetail(array) {
  array.sort(function (a, b) {
    var nameA = a.serial.toUpperCase(); // bỏ qua hoa thường
    var nameB = b.serial.toUpperCase(); // bỏ qua hoa thường
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // name trùng nhau
    return 0;
  });
}
