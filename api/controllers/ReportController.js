/**
 * ReportController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const ReportServices = require("../services/ReportService");
const USER_TYPES = require("../constants/UserTypes");
const USER_ROLE = require("../constants/UserRoles");
const excel = require("node-excel-export");
const fs = require("fs");
const moment = require("moment");
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
  //lay danh sach TNMB va CHBL cua TNSH va kiem tra ton kho
  getListChild: async function (req, res) {
    let email = req.body.email;
    let data = await User.findOne({ isDeleted: { "!=": true }, email: email });
    if (data == undefined || data == "" || data == null) {
      return res.json({ err: true, message: "email khong ton tai !" });
    }
    let d = data.id;
    let a = await User.find({
      isDeleted: { "!=": true },
      isChildOf: d,
      userRole: { in: ["Region", "SuperAdmin", "Owner"] },
    });

    const arr = [];
    let obj = {};

    await Promise.all(
      a.map(async (user) => {
        if (user.userType === "Fixer") {
          let h = await Cylinder.count({
            current: user.id,
            placeStatus: "IN_REPAIR",
          });
          // console.log("asd " + h);

          obj = {
            ...user,
            soluong: h,
          };
          arr.push(obj);
          // console.log(obj);
        } else if (user.userType === "Region") {
          // let h = await Cylinder.count({ current: child.id, placeStatus: "IN_REPAIR" });
          // console.log("asd " + h);

          obj = {
            ...user,
            soluong: 0,
          };
          arr.push(obj);
          // console.log(obj);
        }

        const childs = await User.find({
          isDeleted: { "!=": true },
          isChildOf: user.id,
          userRole: { in: ["SuperAdmin", "Owner"] },
        });
        if (childs.length > 0) {
          await Promise.all(
            childs.map(async (child) => {
              if (child.userType === "Factory") {
                let h = await Cylinder.count({
                  current: child.id,
                  placeStatus: "IN_FACTORY",
                });
                //console.log("asd " + h);
                obj = {
                  ...child,
                  soluong: h,
                };
                arr.push(obj);
              } else if (child.userType === "Fixer") {
                let h = await Cylinder.count({
                  current: child.id,
                  placeStatus: "IN_REPAIR",
                });
                // console.log("asd " + h);

                obj = {
                  ...child,
                  soluong: h,
                };
                arr.push(obj);
                // console.log(obj);
              } else if (child.userType === "General") {
                let h = await Cylinder.count({
                  current: child.id,
                  placeStatus: "IN_GENERAL",
                });
                // console.log("asd " + h);

                obj = {
                  ...child,
                  soluong: h,
                };
                arr.push(obj);
                // console.log(obj);
              } else if (child.userType === "Agency") {
                let h = await Cylinder.count({
                  current: child.id,
                  placeStatus: "IN_AGENCY",
                });
                // console.log("asd " + h);
                obj = {
                  ...child,
                  soluong: h,
                };
                arr.push(obj);
              }
            })
          );
        }
      })
    );

    // for (let i = 0; i < a.length; i++) {
    //   if (a[i].userType === "Factory") {
    //     let h = await Cylinder.count({ current: a[i].id, placeStatus: "IN_FACTORY" });
    //     //console.log("asd " + h);
    //     obj = {
    //       ...a[i],
    //       soluong: h
    //     }
    //     arr.push(obj)
    //   }
    //   else if (a[i].userType === "General") {
    //     let h = await Cylinder.count({ current: a[i].id, placeStatus: "IN_GENERAL" });
    //     console.log("asd " + h);

    //     obj = {
    //       ...a[i],
    //       soluong: h
    //     }
    //     arr.push(obj);
    //     console.log(obj);
    //   }
    //   else if (a[i].userType === "Agency") {
    //     let h = await Cylinder.count({ current: a[i].id, placeStatus: "IN_AGENCY" });
    //     console.log("asd " + h);
    //     obj = {
    //       ...a[i],
    //       soluong: h
    //     }
    //     arr.push(obj)
    //   }
    // }
    // console.log(arr);
    if (arr == undefined || arr == "" || arr == null) {
      return res.json({
        err: true,
        message: "kh??ng c?? th????ng nh??n mua b??n hay c???a h??ng b??n l??? n??o",
      });
    } else {
      return res.json({ err: false, data: arr });
    }
  },

  // kiem tra ton kho
  // checkInventory : async function(req, res){
  //   const idUser = req.body.idUser;
  //   let kind = await User.find({isDeleted: {"!=": true},_id : idUser}).limit(1);
  //   if(kind[0].userType === "Factory"){
  //     let data = await Cylinder.count({current : idUser, placeStatus : "IN_FACTORY"});
  //     console.log("thuong nhan so huu "+data);
  //     return res.json({err: false, data: data});
  //   }else if( kind[0].userType === "General"){
  //     let data = await Cylinder.count({current : idUser, placeStatus : "IN_GENERAL"});
  //     console.log("thuong nhan mua ban "+data);
  //     return res.json({err: false, data: data});
  //   }else if( kind[0].userType === "Agency"){
  //     let data = await Cylinder.count({current : idUser, placeStatus : "IN_AGENCY"});
  //     console.log("cua hang ban le "+data);
  //     return res.json({ error: false, data: data});
  //   }
  // },
  /**
   * Action for /report/getCustomer
   * @param destination,
   * @param res
   * @returns {*}
   */
  getCustomers: async function (req, res) {
    const user = req.userInfo;

    if (
      user.userType !== USER_TYPES.Agency ||
      (user.userRole !== "SuperAdmin" && user.userRole !== "Owner")
    ) {
      return res.ok(Utils.jsonErr("B???n kh??ng c?? quy???n coi th??ng tin n??y"));
    }

    let page = parseInt(req.query.page);
    if (!page) {
      page = 1;
    }

    let limit = parseInt(req.query.limit);
    if (!limit) {
      limit = 10;
    }

    const skip = limit * (page - 1);

    const credential = {
      owner: user.id,
    };

    try {
      const customers = await Customer.find({
        isDeleted: { "!=": true },
        where: credential,
        limit,
        skip,
      })
        .populate("owner")
        .sort("createdAt ASC");
      const count = await Customer.count({ where: credential });
      const totalItem = (page - 1) * limit + customers.length;

      const response = {
        data: customers,
        isHasNext: totalItem < count,
      };
      return res.ok(response);
    } catch (error) {
      return res.ok(Utils.jsonErr(error));
    }
  },

  /**
   * Action for /report/reportCylinder
   * @param destination,
   * @param res
   * @returns {*}
   */
  reportCylinder: async function (req, res) {
    const user = req.userInfo;

    if (user === null || user === "undefined") {
      return res.notFound(err);
    }
    try {
      let data = await ReportServices.getReportForFactory(user, req, res);

      return res.ok(data);
    } catch (err) {
      return res.ok(Utils.jsonErr(err.message));
    }
  },

  /**
   * Action for /report/reportChartData
   * @param destination,
   * @param res
   * @returns {*}
   */
  reportChartData: async function (req, res) {
    const user = req.userInfo;

    if (user === null || user === "undefined") {
      return res.notFound(err);
    }
    try {
      let data = await ReportServices.getChartData(user, req, res);

      return res.ok(data);
    } catch (err) {
      return res.ok(Utils.jsonErr(err.message));
    }
  },

  /**
   * Action for /report/getReportFilters
   * @param destination,
   * @param res
   * @returns {*}
   */
  getReportFilters: async function (req, res) {
    const user = req.userInfo;

    if (
      user.userType !== USER_TYPES.Agency ||
      (user.userRole !== "SuperAdmin" && user.userRole !== "Owner")
    ) {
      return res.ok(Utils.jsonErr("B???n kh??ng c?? quy???n coi th??ng tin n??y"));
    }

    try {
      let data = await ReportServices.getReportFilter(user, res);
      return res.ok(data);
    } catch (err) {
      return res.ok(Utils.jsonErr(err.message));
    }
  },

  /**
   * Action for /report/getInventoryInfo
   * @param destination,
   * @param res
   * @returns {*}
   */
  getInventoryInfo: async function (req, res) {
    const targetId = req.query.target_id;
    const factoryId = req.query.factory_id;

    if (!targetId) {
      return res.badRequest(Utils.jsonErr("target_id is required"));
    }

    if (!factoryId) {
      return res.badRequest(Utils.jsonErr("factory_id is required"));
    }

    try {
      const userInfo = await User.findOne({
        isDeleted: { "!=": true },
        id: targetId,
      });

      if (!userInfo) {
        return res.notFound();
      }

      const inventoryInfo = await ReportServices.getInventoryOfBranch(
        userInfo,
        factoryId
      );
      return res.ok(inventoryInfo);
    } catch (error) {
      return res.serverError(Utils.jsonErr(error.message));
    }
  },
  /**
   * Action for /report/getChildAndNumberImportByDateTime
   * @param destination,
   * @param res
   * @returns {*}
   */
  getChildAndNumberImportByDateTime: async function (req, res) {
    //targetId la Id cua nguoi duoc chon
    const targetId = req.body.target_id;
    const startDate = req.body.start_date;
    const endDate = req.body.end_date;

    if (!targetId) {
      return res.badRequest(Utils.jsonErr("target_id is required"));
    }

    try {
      const userInfo = await User.findOne({
        isDeleted: { "!=": true },
        id: targetId,
      });

      if (!userInfo) {
        return res.notFound();
      }

      const dataInfo = await ReportServices.getChildAndNumberImportByDateTime(
        userInfo,
        startDate,
        endDate
      );
      return res.ok(dataInfo);
    } catch (error) {
      return res.serverError(Utils.jsonErr(error.message));
    }
  },

  /**
   * Action for /report/getCustomerReport
   * @param destination,
   * @param res
   * @returns {*}
   */
  getCustomerReport: async function (req, res) {
    //parentRoot
    const parentRoot = req.body.parent_root;

    if (!parentRoot) {
      return res.badRequest(Utils.jsonErr("parent_root is required"));
    }

    try {
      const reports = await Report.find().populate("cylinder");

      const reportTargets = reports.filter(
        (report) => report.cylinder && report.cylinder.factory === parentRoot
      );
      return res.ok(reportTargets);
    } catch (error) {
      return res.serverError(Utils.jsonErr(error.message));
    }
  },

  /**
   * Action for /report/getTurnBackInfo
   * @param factory_id,
   * @param res
   * @returns {*}
   */
  getTurnBackInfo: async function (req, res) {
    const targetId = req.body.target_id;
    const factoryId = req.body.factory_id;

    if (!targetId) {
      return res.badRequest(Utils.jsonErr("target_id is required"));
    }
    if (!factoryId) {
      return res.badRequest(Utils.jsonErr("factory_id is required"));
    }
    try {
      const userInfo = await _validateUser(targetId, res);
      const data = await ReportServices.getTurnBackInfo(
        userInfo,
        factoryId,
        req.body.begin,
        req.body.end
      );
      return res.ok(data);
    } catch (error) {
      return res.serverError(Utils.jsonErr(error.message));
    }
  },

  /**
   * Action for /report/getTurnBackDetails
   * @param cylinder_ids,
   * @param res
   * @returns {*}
   */
  getTurnBackCylinders: async function (req, res) {
    const listCylindersId = req.body.cylinder_ids;

    if (!listCylindersId) {
      return res.badRequest(Utils.jsonErr("cylinder_ids is required"));
    }
    try {
      const cylinders = await Cylinder.find({
        isDeleted: { "!=": true },
        id: listCylindersId,
      }).populate("manufacture");
      return res.ok(cylinders);
    } catch (error) {
      return res.serverError(Utils.jsonErr(error.message));
    }
  },

  /**
   * Action for /report/getCylinderHistoryExcels
   * @param history_Ids,
   * @param res
   * @returns {*}
   */
  getCylinderExcels: async function (req, res) {
    const targetId = req.query.history_id;

    if (!targetId) {
      return res.badRequest(Utils.jsonErr("history_id is required"));
    }
    try {
      const data = await History.findOne({
        isDeleted: { "!=": true },
        id: targetId,
      }).populate("cylinders");

      const heading = [
        [
          "Th??ng tin b??nh",
          // {value: 'S???n xu???t t???i', style: styles.cellGreen},
          // {value: '??ang ??? t???i', style: styles.cellGreen},
          // {value: 'M??u S???c', style: styles.cellGreen},
          // {value: 'Ng??y ki???m ?????nh', style: styles.cellGreen},
          // {value: 'C??n n???ng', style: styles.cellGreen},
          // {value: 'Gi?? b??n', style: styles.cellGreen}
        ],
      ];

      //Here you specify the export structure
      const specification = {
        serial: {
          // <- the key should match the actual data key
          displayName: "S??? Serial", // <- Here you specify the column header
          headerStyle: styles.cellGreen, // <- Header style
          // cellStyle: function(value, row) { // <- style renderer function
          //   // if the status is 1 then color in green else color in red
          //   // Notice how we use another cell value to style the current one
          //   return (row.status_id === 1) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}}; // <- Inline cell style is possible
          // },
          width: 120, // <- width in pixels
        },
        color: {
          displayName: "M??u S???c",
          headerStyle: styles.cellGreen,
          // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
          //   return (value === 1) ? 'Active' : 'Inactive';
          // },
          width: 100, // <- width in chars (when the number is passed as string)
        },
        checkedDate: {
          displayName: "Ng??y ki???m ?????nh",
          headerStyle: styles.cellGreen,
          // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
          //   return (value === 1) ? 'Active' : 'Inactive';
          // },
          width: 100, // <- width in chars (when the number is passed as string)
        },
        weight: {
          displayName: "C??n n???ng",
          headerStyle: styles.cellGreen,
          // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
          //   return (value === 1) ? 'Active' : 'Inactive';
          // },
          width: 100, // <- width in chars (when the number is passed as string)
        },
        currentSalePrice: {
          displayName: "Gi?? b??n",
          headerStyle: styles.cellGreen,
          // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
          //   return (value === 1) ? 'Active' : 'Inactive';
          // },
          width: 100, // <- width in chars (when the number is passed as string)
        },
      };

      const dataSet = await Promise.all(
        data.cylinders.map(async (cylinder) => {
          return {
            serial: cylinder.serial,
            color: cylinder.color,
            checkedDate: cylinder.checkedDate,
            weight: cylinder.weight,
            currentSalePrice: cylinder.currentSalePrice,
          };
        })
      );

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
      //return res.xls('test.xlsx', data.cylinders);
    } catch (error) {
      return res.serverError(Utils.jsonErr(error.message));
    }
  },

  /**
   * Action for /report/getReportExcels
   * @param history_Ids,
   * @param res
   * @returns {*}
   */
  getReportExcels: async function (req, res) {
    const targetIds = req.body.target_ids;
    const actionType = req.body.action_type;
    const parentRoot = req.body.parent_root;
    const startDate = req.body.start_date;
    const endDate = req.body.end_date;

    if (!targetIds || targetIds.length === 0) {
      return res.badRequest(Utils.jsonErr("target_ids is required"));
    }
    if (!actionType) {
      return res.badRequest(Utils.jsonErr("action_type is required"));
    }
    try {
      const targetUser = await User.find({
        isDeleted: { "!=": true },
        id: targetIds,
      });

      if (targetUser.length === 0) {
        return res.badRequest(Utils.jsonErr("target not found"));
      }

      let listTarget = targetUser;
      // N???u target l?? Chi Nh??nh
      if (
        targetUser[0].userType === "Region" &&
        targetUser[0].userRole === "SuperAdmin"
      ) {
        // T??m tr???m c???a chi nh??nh
        listTarget = await User.find({
          isDeleted: { "!=": true },
          isChildOf: targetUser[0].id,
          userType: "Factory",
          userRole: "Owner",
        });
      }
      // N???u target l?? c??ng ty m???
      else if (
        targetUser[0].userType === "Factory" &&
        targetUser[0].userRole === "SuperAdmin"
      ) {
        listTarget = [];

        // T??m chi nh??nh
        listTarget = await User.find({
          isDeleted: { "!=": true },
          isChildOf: targetUser[0].id,
          userType: { in: ["Region", "Fixer"] },
          userRole: "SuperAdmin",
        });

        // // T??m tr???m c???a c??c chi nh??nh
        // await Promise.all(listRegion.map(async region => {
        //   const listStation = await User.find({isDeleted: {"!=": true},
        //     isChildOf: region.id,
        //     userType: 'Factory',
        //     userRole: 'Owner',
        //   })

        //   if (listStation.length > 0) {
        //     listTarget = listTarget.concat(listStation)
        //   }
        // }))
      }
      // N???u target l?? Kh??ch h??ng, CHBL
      else if (
        (targetUser[0].userType === "General" ||
          targetUser[0].userType === "Agency") &&
        targetUser[0].userRole === "SuperAdmin"
      ) {
      }

      const heading = [
        [
          `Th??ng tin Report ${_getNameAction(
            actionType,
            targetUser[0].userType
          )}`,
        ],
      ];

      // Here you specify the export structure
      let specification;
      // let specificationFixer

      //
      if (actionType === "CREATE") {
        specification = {
          serial: {
            // <- the key should match the actual data key
            displayName: "S??? Serial", // <- Here you specify the column header
            headerStyle: styles.cellGreen, // <- Header style
            // cellStyle: function(value, row) { // <- style renderer function
            //   // if the status is 1 then color in green else color in red
            //   // Notice how we use another cell value to style the current one
            //   return (row.status_id === 1) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}}; // <- Inline cell style is possible
            // },
            width: 120, // <- width in pixels
          },
          color: {
            displayName: "M??u S???c",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          valve: {
            displayName: "Lo???i van",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          weight: {
            displayName: "Tr???ng l?????ng v???",
            headerStyle: styles.cellGreen,
            cellFormat: function (value, row) {
              // <- Renderer function, you can access also any row.property
              // return value + ' kg';
              return value;
            },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          checkedDate: {
            displayName: "Ng??y ki???m ?????nh",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          manufacture: {
            displayName: "Th????ng hi???u",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          cylinderType: {
            displayName: "Lo???i b??nh",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          createdAt: {
            displayName: "Ng??y khai b??o",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
        };
      }

      //
      else if (actionType === "EXPORT_CELL") {
        specification = {
          serial: {
            // <- the key should match the actual data key
            displayName: "S??? Serial", // <- Here you specify the column header
            headerStyle: styles.cellGreen, // <- Header style
            width: 120, // <- width in pixels
          },
          color: {
            displayName: "M??u S???c",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          valve: {
            displayName: "Lo???i van",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          weight: {
            displayName: "C??n n???ng",
            headerStyle: styles.cellGreen,
            cellFormat: function (value, row) {
              // <- Renderer function, you can access also any row.property
              // return value + ' kg';
              return value;
            },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          checkedDate: {
            displayName: "Ng??y ki???m ?????nh",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          manufacture: {
            displayName: "Th????ng hi???u",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          cylinderType: {
            displayName: "Lo???i b??nh",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          // importWarehouseCode: {
          //   // displayName: `N??i ${_getNameAction(actionType, targetUser[0].userType, true)}`,
          //   displayName: "N??i nh???p",
          //   headerStyle: styles.cellGreen,
          //   width: 100 // <- width in chars (when the number is passed as string)
          // },
          dynamicDate: {
            displayName: "Ng??y xu???t",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
        };
      }

      //
      else if (actionType === "IMPORT_CELL") {
        specification = {
          serial: {
            // <- the key should match the actual data key
            displayName: "S??? Serial", // <- Here you specify the column header
            headerStyle: styles.cellGreen, // <- Header style
            width: 120, // <- width in pixels
          },
          color: {
            displayName: "M??u S???c",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          valve: {
            displayName: "Lo???i van",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          weight: {
            displayName: "C??n n???ng",
            headerStyle: styles.cellGreen,
            cellFormat: function (value, row) {
              // <- Renderer function, you can access also any row.property
              // return value + ' kg';
              return value;
            },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          checkedDate: {
            displayName: "Ng??y ki???m ?????nh",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          manufacture: {
            displayName: "Th????ng hi???u",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          cylinderType: {
            displayName: "Lo???i b??nh",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          dynamicDate: {
            displayName: "Ng??y nh???p",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          exportPlace: {
            // displayName: `N??i ${_getNameAction(actionType, targetUser[0].userType, true)}`,
            displayName: "Nh???p t???",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
        };
      }

      //
      else if (actionType === "EXPORT") {
        specification = {
          serial: {
            // <- the key should match the actual data key
            displayName: "S??? Serial", // <- Here you specify the column header
            headerStyle: styles.cellGreen, // <- Header style
            // cellStyle: function(value, row) { // <- style renderer function
            //   // if the status is 1 then color in green else color in red
            //   // Notice how we use another cell value to style the current one
            //   return (row.status_id === 1) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}}; // <- Inline cell style is possible
            // },
            width: 120, // <- width in pixels
          },
          color: {
            displayName: "M??u S???c",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          checkedDate: {
            displayName: "H???n ki???m ?????nh",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          valve: {
            displayName: "Lo???i van",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          cylinderType: {
            displayName: "Lo???i b??nh",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          weight: {
            displayName: "C??n n???ng",
            headerStyle: styles.cellGreen,
            cellFormat: function (value, row) {
              // <- Renderer function, you can access also any row.property
              // return value + ' kg';
              return value;
            },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          dynamicDate: {
            displayName: "Ng??y xu???t h??ng",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return value + 'kg';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          customerName: {
            displayName: "T??n kh??ch h??ng",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          nameDriver: {
            displayName: "T??n t??i x???",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          license_plate: {
            displayName: "Bi???n s???",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
        };
      }

      //
      else if (actionType === "IMPORT") {
        specification = {
          serial: {
            // <- the key should match the actual data key
            displayName: "S??? Serial", // <- Here you specify the column header
            headerStyle: styles.cellGreen, // <- Header style
            // cellStyle: function(value, row) { // <- style renderer function
            //   // if the status is 1 then color in green else color in red
            //   // Notice how we use another cell value to style the current one
            //   return (row.status_id === 1) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}}; // <- Inline cell style is possible
            // },
            width: 120, // <- width in pixels
          },
          cylinderType: {
            displayName: "Lo???i b??nh",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          color: {
            displayName: "M??u S???c",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          valve: {
            displayName: "Lo???i van",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          checkedDate: {
            displayName: "Ng??y ki???m ?????nh",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          weight: {
            displayName: "C??n n???ng",
            headerStyle: styles.cellGreen,
            cellFormat: function (value, row) {
              // <- Renderer function, you can access also any row.property
              // return value + ' kg';
              return value;
            },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          dynamicDate: {
            displayName: "Ng??y nh???p v???",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return value + 'kg';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          exportPlace: {
            displayName: "N??i xu???t",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
        };
      }

      //
      else if (actionType === "TURN_BACK") {
        specification = {
          serial: {
            // <- the key should match the actual data key
            displayName: "S??? Serial", // <- Here you specify the column header
            headerStyle: styles.cellGreen, // <- Header style
            // cellStyle: function(value, row) { // <- style renderer function
            //   // if the status is 1 then color in green else color in red
            //   // Notice how we use another cell value to style the current one
            //   return (row.status_id === 1) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}}; // <- Inline cell style is possible
            // },
            width: 120, // <- width in pixels
          },
          color: {
            displayName: "M??u S???c",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          checkedDate: {
            displayName: "Ng??y ki???m ?????nh",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          valve: {
            displayName: "Lo???i van",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          cylinderType: {
            displayName: "Lo???i b??nh",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          weight: {
            displayName: "C??n n???ng",
            headerStyle: styles.cellGreen,
            cellFormat: function (value, row) {
              // <- Renderer function, you can access also any row.property
              return value + " kg";
            },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          dynamicDate: {
            displayName: "Ng??y h???i l??u",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return value + 'kg';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          dynamicPlace: {
            displayName: "T??n kh??ch h??ng",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          nameDriver: {
            displayName: "T??n t??i x???",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          license_plate: {
            displayName: "Bi???n s???",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
        };
      }

      //
      else if (actionType === "SALE") {
        specification = {
          serial: {
            // <- the key should match the actual data key
            displayName: "S??? Serial", // <- Here you specify the column header
            headerStyle: styles.cellGreen, // <- Header style
            // cellStyle: function(value, row) { // <- style renderer function
            //   // if the status is 1 then color in green else color in red
            //   // Notice how we use another cell value to style the current one
            //   return (row.status_id === 1) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}}; // <- Inline cell style is possible
            // },
            width: 120, // <- width in pixels
          },
          color: {
            displayName: "M??u S???c",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          valve: {
            displayName: "Lo???i van",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          weight: {
            displayName: "Tr???ng l?????ng v???",
            headerStyle: styles.cellGreen,
            cellFormat: function (value, row) {
              // <- Renderer function, you can access also any row.property
              // return value + ' kg';
              return value;
            },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          checkedDate: {
            displayName: "Ng??y ki???m ?????nh",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          manufacture: {
            displayName: "Th????ng hi???u",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          cylinderType: {
            displayName: "Lo???i b??nh",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          customerName: {
            displayName: "Kh??ch h??ng",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
          dynamicDate: {
            displayName: "Ng??y b??n",
            headerStyle: styles.cellGreen,
            width: 100, // <- width in chars (when the number is passed as string)
          },
        };
      } else {
        specification = {
          serial: {
            // <- the key should match the actual data key
            displayName: "S??? Serial", // <- Here you specify the column header
            headerStyle: styles.cellGreen, // <- Header style
            // cellStyle: function(value, row) { // <- style renderer function
            //   // if the status is 1 then color in green else color in red
            //   // Notice how we use another cell value to style the current one
            //   return (row.status_id === 1) ? styles.cellGreen : {fill: {fgColor: {rgb: 'FFFF0000'}}}; // <- Inline cell style is possible
            // },
            width: 120, // <- width in pixels
          },
          color: {
            displayName: "M??u S???c",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          classification: {
            displayName: "Lo???i b??nh",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          checkedDate: {
            displayName: "Ng??y ki???m ?????nh",
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          weight: {
            displayName: "C??n n???ng",
            headerStyle: styles.cellGreen,
            cellFormat: function (value, row) {
              // <- Renderer function, you can access also any row.property
              return value + " kg";
            },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          // weightReturn: {
          //   displayName: 'C??n n???ng h???i l??u',
          //   headerStyle: styles.cellGreen,
          //   cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
          //     return value + ' kg';
          //   },
          //   width: 100 // <- width in chars (when the number is passed as string)
          // },
          // weightTexcess : {
          //   displayName: 'C??n n???ng th???a',
          //   headerStyle: styles.cellGreen,
          //   cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
          //     return value + ' kg';
          //   },
          //   width: 100 // <- width in chars (when the number is passed as string)
          // },
          dynamicDate: {
            displayName: `Ng??y ${_getNameAction(
              actionType,
              targetUser[0].userType
            )}`,
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return value + 'kg';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
          dynamicPlace: {
            // displayName: `N??i ${_getNameAction(actionType, targetUser[0].userType, true)}`,
            displayName: `${_getNameAction(
              actionType,
              targetUser[0].userType,
              true
            )}`,
            headerStyle: styles.cellGreen,
            // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
            //   return (value === 1) ? 'Active' : 'Inactive';
            // },
            width: 100, // <- width in chars (when the number is passed as string)
          },
        };
      }

      // const dataSet = await ReportServices.getDataForReport(targetUser, actionType, parentRoot, startDate, endDate);
      const dataSet = await ReportServices.getDataForReport(
        listTarget,
        actionType,
        parentRoot,
        startDate,
        endDate
      );

      const dataExcel = await Promise.all(
        dataSet.map(async (_data) => {
          let _specification = { ...specification };

          if (_data.targetUserType === "Fixer") {
            _specification.classification = {
              displayName: "T??nh tr???ng",
              headerStyle: styles.cellGreen,
              width: 100, // <- width in chars (when the number is passed as string)
            };
          } else if (_data.targetUserType === "Region") {
            _specification.stationName = {
              displayName: "Tr???m",
              headerStyle: styles.cellGreen,
              width: 100, // <- width in chars (when the number is passed as string)
            };
          }

          return {
            name: _data.targetName, // <- Specify sheet name (optional)
            // heading: heading, // <- Raw heading array (optional)
            specification: _specification,
            data: _data.targetData, // <-- Report data
          };
        })
      );

      const report = excel.buildExport(dataExcel);

      // const report = excel.buildExport(
      //   [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
      //     {
      //       name: 'Report', // <- Specify sheet name (optional)
      //       heading: heading, // <- Raw heading array (optional)
      //       specification: specification,
      //       data: dataSet // <-- Report data
      //     }
      //   ]
      // );

      res.setHeader("Content-disposition", "attachment; filename=report.xlsx");
      res.setHeader(
        "Content-type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      return res.send(report);
      //return res.xls('test.xlsx', data.cylinders);
    } catch (error) {
      return res.serverError(Utils.jsonErr(error.message));
    }
  },

  // --- --- ---

  getTopExport: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id } = req.body;
    //let dataSets = []

    try {
      let list_isChildOf = await User.find({
        isDeleted: { "!=": true },
        isChildOf: id,
        userRole: { in: ["SuperAdmin", "Owner"] },
      });
      if (list_isChildOf.length > 0) {
        let data = await Promise.all(
          list_isChildOf.map(async (child) => {
            let dataReturn = {
              id: "",
              name: "",
              numberOfCylinder: 0,
            };
            let daynow = Date.parse(new Date());
            let daymonthago = daynow - 2629800000;
            let startDate = new Date(daynow).toISOString();
            let endDate = new Date(daymonthago).toISOString();
            let count_CylinderExportNumber = 0;
            let historyExport = await History.find({
              isDeleted: { "!=": true },
              from: child.id,
              type: ["EXPORT", "SALE"],
              createdAt: { ">=": endDate, "<": startDate },
            });

            if (historyExport.length > 0) {
              historyExport.forEach((element) => {
                count_CylinderExportNumber += element.numberOfCylinder;
              });
            }

            dataReturn.id = child.id;
            dataReturn.name = child.name;
            dataReturn.numberOfCylinder = count_CylinderExportNumber;

            return dataReturn;
          })
        );

        console.log("data count_CylinderExportNumber", data);
        if (data.length > 0) {
          const n = data.length;
          for (i = 0; i < n - 1; i++)
            for (j = 0; j < n - i - 1; j++) {
              if (data[j].numberOfCylinder < data[j + 1].numberOfCylinder) {
                let swap = data[j];
                data[j] = data[j + 1];
                data[j + 1] = swap;
              }
            }
          return res.json({ error: false, data: data, message: "thanh cong" });
        } else {
          return res.json({ error: true, message: "huhu" });
        }
      } else {
        return res.json({
          error: false,
          message: "Khong co TNMB, cong ty con, dai ly nao",
        });
      }
    } catch (err) {
      return res.json({ error: true, message: err.message });
    }
  },
};

_validateUser = async function (userId, res) {
  try {
    const userInfo = await User.findOne({
      isDeleted: { "!=": true },
      id: userId,
    });
    if (!userInfo) {
      throw res.notFound();
    }
    if (
      userInfo.userType !== USER_TYPES.Factory ||
      (userInfo.userRole !== USER_ROLE.SUPER_ADMIN &&
        userInfo.userRole !== USER_ROLE.OWNER)
    ) {
      return res.badRequest(
        Utils.jsonErr("B???n kh??ng c?? quy???n coi th??ng tin n??y")
      );
    }
    return userInfo;
  } catch (err) {
    return res.serverError(Utils.jsonErr(err.message));
  }
};

_getNameAction = function (action, userType, isDestination = false) {
  switch (action) {
    case "IMPORT":
      if (userType === USER_TYPES.Factory) {
        return isDestination ? "Nh???p v??? t???" : "Nh???p v???";
      }
      return isDestination ? "Nh???p h??ng t???" : "Nh???p h??ng";
    case "EXPORT":
      return isDestination ? "Xu???t h??ng ?????n" : "Xu???t h??ng";
    case "EXPORT_CELL":
      return isDestination ? "Xu???t v??? ?????n" : "Xu???t v???";
    case "IMPORT_CELL":
      return isDestination ? "Nh???p v??? t???" : "Nh???p v???";
    case "TURN_BACK":
      return "H???i l??u";
    case "FIX":
      return "Xu???t s???a ch???a";
    case "CREATE":
      return "B??nh ???? t???o";
  }
};
