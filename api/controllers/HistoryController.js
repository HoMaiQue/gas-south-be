const USER_TYPE = require("../constants/UserTypes");
/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const moment = require("moment");
const _ = require("lodash");

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

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

async function validateData(req) {
  const driver = req.body.driver;
  const license_plate = req.body.license_plate;
  const cylinders = req.body.cylinders;
  let from = req.body.from;

  let to = req.body.to;
  const toArray = req.body.toArray;
  const type = req.body.type;
  const userType = req.userInfo.userType;
  let typeForPartner = req.body.typeForPartner;
  let toArrayModel = undefined;
  let toModel = undefined;
  //let fromModel = undefined;

  // FACTORY - GENERAL : EXPORT => toArray
  if (!type) {
    return Utils.jsonErr("Type is required");
  }

  if (type !== "TURN_BACK" && !from) {
    return Utils.jsonErr("From is required");
  }

  if (
    type !== "SALE" &&
    userType !== USER_TYPE.Factory &&
    userType !== USER_TYPE.Fixer &&
    userType !== USER_TYPE.General &&
    !to
  ) {
    return Utils.jsonErr("To is required");
  }

  // if(type === 'GIVE_BACK') {
  //   if(!typeForPartner) {return Utils.jsonErr('typeForPar is requiring when action type is GIVE_BACK');}
  // }
  // if(type=== 'EXPORT' && !!typeForPartner)
  // {

  // }

  // Lấy object user từ from và to
  try {
    toModel = await User.findOne({ isDeleted: { "!=": true }, id: to });
    //fromModel = await User.findOne({isDeleted: {"!=": true},id: from});
    toArrayModel = await User.findOne({
      isDeleted: { "!=": true },
      id: toArray[0],
    });
  } catch (e) {}

  if (
    type === "EXPORT" &&
    toModel === undefined &&
    toArrayModel === undefined &&
    userType === USER_TYPE.Agency
  ) {
    return Utils.jsonErr("Destination to export is missing");
  }

  if (!driver && type !== "SALE") {
    return Utils.jsonErr("Driver is required");
  }

  if (!license_plate && type !== "SALE") {
    return Utils.jsonErr("License_plate is required");
  }
  if ((type === "EXPORT" || type === "IMPORT") && !!typeForPartner) {
    //validate for sub type here
  } else {
    if (!cylinders || cylinders === []) {
      return Utils.jsonErr("Cylinders is required");
    }

    //Check status of Cylinder - Current removed status from system so we don't need to check
    // const emptyCylinders = _.takeWhile(cylinders, cylinder => { return cylinder.status === 'EMPTY';});
    // if(emptyCylinders.length > 0) {
    //   let serials = '';
    //   for(let i = 0; i < emptyCylinders.length; i++) {
    //     if(i !== 0) {serials = serials.concat(';');}
    //     serials = serials.concat(` ${emptyCylinders[i].serial}`);
    //   }

    //   if(type === 'IMPORT' && fromModel.userType !== USER_TYPE.Station) {

    //     return Utils.jsonErr(`Cylinders with serial ${serials} for import cannot empty`);
    //   }

    //   if(type === 'EXPORT' && !(fromModel.userType === USER_TYPE.Factory && toArrayModel.userType === USER_TYPE.Station) && !(fromModel.userType === USER_TYPE.Station && toModel.userType === USER_TYPE.Factory)) {
    //     return Utils.jsonErr(`Cylinders with serial ${serials} for export cannot empty`);
    //   }
    // }
  }

  return null;
}

module.exports = {
  // Xuất Excels chi tiết bình
  getCylinderHistoryExcels: async function (req, res) {
    try {
      const historyID = req.query.historyID;

      if (!historyID) {
        return res.json({
          success: false,
          message: "Không nhận được historyID",
        });
      }

      const heading = [["Danh sách chi tiết bình."]];

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

      const _history = await History.findOne({
        isDeleted: { "!=": true },
        _id: historyID,
      }).populate("cylinders");

      const dataSet = await Promise.all(
        _history.cylinders.map(async (element) => {
          const _cylinder = await Cylinder.findOne({
            isDeleted: { "!=": true },
            _id: element.id,
            // isDeleted: false
          })
            .populate("manufacture")
            .populate("category");

          return {
            serial: _cylinder.serial,
            color: _cylinder.color,
            valve: _cylinder.valve,
            weight: _cylinder.weight,
            checkedDate: moment(
              _cylinder.checkedDate,
              moment.ISO_8601,
              true
            ).isValid()
              ? moment(_cylinder.checkedDate).format("DD/MM/YYYY")
              : _cylinder.checkedDate,
            manufacture: _cylinder.manufacture.name,
            category: _cylinder.category.name,
          };
        })
      );

      // return res.send(dataSet);

      const report = excel.buildExport([
        // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
        {
          name: "Thông tin chi tiết bình", // <- Specify sheet name (optional)
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

  sortHistoryImport: async function (req, res) {
    let data = await History.find({
      isDeleted: { "!=": true },
      type: "IMPORT",
    }).sort({ createdAt: -1 });
    // console.log(data);
    if (data) {
      return res.json({ error: false, data: data });
    } else {
      return res.json({ error: true, message: "huhu" });
    }
  },
  sortHistoryExport: async function (req, res) {
    let data = await History.find({
      isDeleted: { "!=": true },
      type: "EXPORT",
    }).sort({ createdAt: -1 });
    // console.log(data);
    if (data) {
      return res.json({ error: false, data: data });
    } else {
      return res.json({ error: true, message: "huhu" });
    }
  },
  /**
   * Action for /history/create
   * @param email, password, password_confirm
   * @param res
   * @returns {*}
   */
  importCylinder: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    const type = req.body.type;
    // if(type === 'TURN_BACK_NOT_IN_SYSTEM')
    // {
    //   const driver = req.body.driver;
    //   const license_plate = req.body.license_plate;
    //   let to = req.body.to;
    //   let from = null;
    //   let numberOfCylinder = req.body.numberOfCylinder;

    //   // Validate request để đảm bảo params truyền lên đủ yêu cầu
    //   //const error = await validateData(req, toModel, fromModel);
    //   //if (error) {return res.ok(error);}

    //   // Tính tổng amount của những bình truyền lên
    //   let result = await History.create({
    //     driver,
    //     license_plate,
    //     from,
    //     to,
    //     type,
    //     numberOfCylinder,
    //     amount:0
    //   }).fetch();

    //   return res.created(result);

    // }
    // else{
    // const createBy = req.body.idUser
    const driver = req.body.driver;
    const license_plate = req.body.license_plate;
    let cylinders = req.body.cylinders;
    let signature = req.body.signature;
    const idDriver = req.body.idDriver;
    let typeForPartner = req.body.typeForPartner;
    let from = req.body.from;
    let saler = req.body.saler;

    // Ghi vào bảng CylinderImex
    const { objectId, idImex, typeImex, flow } = req.body;

    // Bình không đạt
    let {
      cylinderImex,
      cylinerIneligible,
      turnBack_cylinerIneligible,
      // {
      //   // --Bình đã hồi lưu--
      //   errCyl_current,
      //   // --Bình đang vận chuyển--
      //   errCyl_delivering,
      //   // --Bình đang ở trạm khác--
      //   errCyl_inFactory,
      //   // --Bình đang ở nhà máy--
      //   errCyl_inFixer,
      // }
    } = req.body;

    if (!cylinerIneligible) cylinerIneligible = [];

    // Kiểm tra input
    // if (cylinderImex.length !== cylinders) {
    //   return res.badRequest(Utils.jsonErr('Danh sách bình trong cylinderImex và cylinders không giống nhau'));
    // }
    // else {
    //   const difference = cylinders.filter(el => !toRemove.includes( el ))
    // }

    const { exportByDriver, turnbackByDriver } = req.body;

    let exportPlace;
    let customer = null;

    let to = req.body.to;
    let numberOfCylinder = 0;
    let cylindersWithoutSerial = !!req.body.cylindersWithoutSerial
      ? req.body.cylindersWithoutSerial
      : 0;
    if (!!req.body.cylinders) {
      numberOfCylinder = req.body.cylinders.length;
    }

    if (cylindersWithoutSerial !== 0) {
      numberOfCylinder += cylindersWithoutSerial;
    }

    const numberArray = req.body.numberArray;
    const toArray = req.body.toArray;
    let toModel = undefined;
    let fromModel = undefined;
    // Validate request để đảm bảo params truyền lên đủ yêu cầu
    const error = await validateData(req);
    if (!typeForPartner) {
      typeForPartner = "";
    }
    if (error) {
      return res.badRequest(error);
    }

    if (
      type === "SALE" &&
      (!signature || signature == "" || signature == undefined)
    ) {
      signature = "Bán lẻ cho người dân";
    }

    if (typeImex !== "IN" && typeImex !== "OUT") {
      return res.badRequest("typeImex not found!");
    }

    // if((type=== 'IMPORT' || type==='EXPORT') && !!typeForPartner)
    // {
    //   numberOfCylinder = req.body.numberOfCylinder;
    //   let result = await History.create({
    //     driver,
    //     license_plate,
    //     from,
    //     to,
    //     type,
    //     numberOfCylinder,
    //     typeForPartner
    //   }).fetch();

    //   return res.created(result);
    // }
    //else{

    try {
      // let newCyLinders=[];
      // let _infoCylinders = [];
      // let time = [];

      // for(let i =0; i<cylinders.length; i++)
      // {
      //   let _startTime = Date.now();
      //   // let _endTime = 0;

      //   let itemCylinder = await Cylinder.findOne({isDeleted: {"!=": true},id:cylinders[i]}).populate('histories').populate('current');
      //   if(typeof itemCylinder.histories !== 'undefined' && itemCylinder.histories !==null && itemCylinder.histories.length>0)
      //   {
      //     let final = itemCylinder.histories[itemCylinder.histories.length-1];

      //     try {
      //       final = await History.findOne(final).populate('toArray');
      //     } catch (error) {

      //     }
      //     if (type === 'EXPORT') {
      //       if(itemCylinder.current.id===from || itemCylinder.placeStatus === 'IN_FACTORY')
      //       {
      //         newCyLinders.push(cylinders[i]);
      //         _infoCylinders.push({
      //           cylinderId: itemCylinder.id,
      //           cylinderCategory: itemCylinder.category,
      //         });
      //       }
      //     }
      //     else if(type=== 'IMPORT')
      //     {
      //       //check lai && (final.to === to||final.toArray.indexOf(to) !==-1)
      //       if(itemCylinder.placeStatus === 'DELIVERING' && (final.to === to || _.find(final.toArray, o => {return o.id === to;}) !== undefined))
      //       {
      //         newCyLinders.push(cylinders[i]);
      //         _infoCylinders.push({
      //           cylinderId: itemCylinder.id,
      //           cylinderCategory: itemCylinder.category,
      //         });
      //       }
      //     }
      //     // else if(type=== 'GIVE_BACK')
      //     // {
      //     //   newCyLinders.push(cylinders[i]);
      //     // }
      //     else if(type === 'SALE')
      //     {
      //       if(itemCylinder.current.id===from)
      //       {
      //         newCyLinders.push(cylinders[i]);
      //         _infoCylinders.push({
      //           cylinderId: itemCylinder.id,
      //           cylinderCategory: itemCylinder.category,
      //         });
      //       }
      //     }
      //     else if (type==='TURN_BACK')
      //     {
      //       //if(itemCylinder.placeStatus==='IN_CUSTOMER'||itemCylinder.placeStatus==='UNKNOW'){
      //       newCyLinders.push(cylinders[i]);
      //       //}
      //       _infoCylinders.push({
      //         cylinderId: itemCylinder.id,
      //         cylinderCategory: itemCylinder.category,
      //       });
      //     }

      //   }
      //   else{
      //     newCyLinders.push(cylinders[i]);
      //     _infoCylinders.push({
      //       cylinderId: itemCylinder.id,
      //       cylinderCategory: itemCylinder.category,
      //     });
      //   }

      //   let _endTime = Date.now();
      //   time.push({
      //     _startTime,
      //     _endTime,
      //   })
      // }

      let _infoCylinders = [];
      if (type === "EXPORT") {
        // let startCheck = Date.now();
        _infoCylinders = await Cylinder.find({
          isDeleted: { "!=": true },
          id: { in: cylinders },
        });
        // .populate('current');
        if (_infoCylinders.length !== cylinders.length) {
          return res.badRequest(
            Utils.jsonErr("Danh sách bình không chính xác!!!")
          );
        }

        const foundErr = _infoCylinders.findIndex(
          (cylinder) =>
            cylinder.current !== from ||
            cylinder.placeStatus === "DELIVERING" ||
            cylinder.placeStatus === "IN_CUSTOMER"
        );

        if (foundErr >= 0) {
          return res.badRequest(
            Utils.jsonErr("Danh sách bình không chính xác!!!")
          );
        }
        // else {
        //   let endCheck = Date.now();
        //   time.push({
        //     startCheck,
        //     endCheck
        //   })
        // }

        // Xử lý những bình không đạt yêu cầu xuất hàng
        if (cylinerIneligible.length > 0) {
          // Tìm thông tin bình
          cylinerIneligible = await Cylinder.find({
            isDeleted: { "!=": true },
            serial: { in: cylinerIneligible },
          });

          const _infoCylinderIneligible = [...cylinerIneligible];

          // Tìm những bình đang vận chuyển
          const deliveringCylindersFrom = _.remove(cylinerIneligible, (o) => {
            return o.placeStatus === "DELIVERING";
          });
          if (deliveringCylindersFrom.length > 0) {
            // --- GROUP cylinder theo current ---
            const group = await groupByArray(
              deliveringCylindersFrom,
              "current"
            );

            // -- Xử lý nhập cho từng nhóm --
            await Promise.all(
              group.map(async (eachGroup) => {
                const listCylindersId = await getCylindersId(eachGroup.values);

                // Tìm thông tin eachGroup
                const eachGroupInfo = await User.findOne({
                  isDeleted: { "!=": true },
                  id: eachGroup.key,
                });

                let result = "";
                // + Trường hợp là Khách hàng thì hồi lưu về
                if (
                  eachGroupInfo.userType === "General" ||
                  eachGroupInfo.userType === "Agency"
                ) {
                  // Tạo bản ghi hồi lưu về from
                  result = await History.create({
                    driver: "Không xác định",
                    license_plate: "Không xác định",
                    cylinders: listCylindersId,
                    signature: "TURN_BACK_005",
                    idDriver: null,
                    from: eachGroup.key,
                    to: from,
                    type: "TURN_BACK",
                    // toArray,
                    // numberArray,
                    numberOfCylinder: eachGroup.values.length,
                    // cylindersWithoutSerial,
                    amount: 0,
                    // saler,
                    // typeForPartner: 'BUY',
                    // exportByDriver,
                    // turnbackByDriver,
                    importExportBySystem: true, // Xác định xử lý xuất nhập bởi hệ thống
                    createdBy: req.userInfo.id,
                  });
                }
                // + Trường hợp còn lại: trạm, nhà máy
                else {
                  // Tạo bản ghi nhập về from
                  result = await History.create({
                    driver: "Không xác định",
                    license_plate: "Không xác định",
                    cylinders: listCylindersId,
                    signature: "IMPORT_003",
                    idDriver: null,
                    from: eachGroup.key,
                    to: from,
                    type: "IMPORT",
                    // toArray,
                    // numberArray,
                    numberOfCylinder: eachGroup.values.length,
                    // cylindersWithoutSerial,
                    amount: 0,
                    // saler,
                    typeForPartner: "BUY",
                    // exportByDriver,
                    // turnbackByDriver,
                    importExportBySystem: true, // Xác định xử lý xuất nhập bởi hệ thống
                    createdBy: req.userInfo.id,
                  });
                }

                // Thay đổi trạng thái và vị trí bình sau khi tạo bản ghi nhập
                if (result) {
                  // Tìm thông tin from - nơi nhập vào
                  const fromInfo = await User.findOne({
                    isDeleted: { "!=": true },
                    id: from,
                  });

                  let _placeStatus = "IN_FACTORY";
                  let _current = from;

                  switch (fromInfo.userType) {
                    case USER_TYPE.Factory:
                      _placeStatus = "IN_FACTORY";
                      break;
                    case USER_TYPE.Fixer:
                      _placeStatus = "IN_REPAIR";
                      break;
                    case USER_TYPE.General:
                      _placeStatus = "IN_GENERAL";
                      break;
                    case USER_TYPE.Agency:
                      _placeStatus = "IN_AGENCY";
                      break;
                    default:
                      break;
                  }

                  let _updateForm = {
                    placeStatus: _placeStatus,
                    current: _current,
                  };

                  // Cập nhật lại thông tin bình
                  await Cylinder.update({
                    isDeleted: { "!=": true },
                    _id: { in: listCylindersId },
                  }).set(_updateForm);
                }

                // Tạo bản ghi tương ứng trong collection CylinderImex
                const _idImex = Date.now();
                await Promise.all(
                  eachGroup.values.map(async (cylinder) => {
                    await CylinderImex.create({
                      cylinder: cylinder.id,
                      status: cylinder.status,
                      condition: cylinder.classification.toUpperCase(),
                      idImex: _idImex,
                      typeImex: "IN",
                      flow: result.type === "IMPORT" ? "BRINGING_IN" : "RETURN",
                      flowDescription: "BY_SYSTEM",
                      category: cylinder.category,
                      manufacture: cylinder.manufacture,
                      createdBy: req.userInfo.id,
                      objectId: from ? from : req.userInfo.id,
                      history: result ? result.id : null,
                    });
                  })
                );
              })
            );
          }

          // Tìm những bình đang ở người dân
          const cylindersInCustomer = _.remove(cylinerIneligible, (o) => {
            return o.placeStatus === "IN_CUSTOMER";
          });
          if (cylindersInCustomer.length > 0) {
            const listCylindersId = await getCylindersId(cylindersInCustomer);

            // Tạo bản ghi hồi lưu về from
            const result = await History.create({
              driver: "Không xác định",
              license_plate: "Không xác định",
              cylinders: listCylindersId,
              signature: "TURN_BACK_002",
              idDriver: null,
              // from,
              to: from,
              type: "TURN_BACK",
              // toArray,
              // numberArray,
              numberOfCylinder: cylindersInCustomer.length,
              // cylindersWithoutSerial,
              amount: 0,
              // saler,
              typeForPartner,
              // exportByDriver,
              // turnbackByDriver,
              importExportBySystem: true, // Xác định xử lý xuất nhập bởi hệ thống
              createdBy: req.userInfo.id,
            });

            // Thay đổi trạng thái và vị trí bình sau khi tạo bản ghi nhập
            if (result) {
              // Tìm thông tin from - nơi nhập vào
              const fromInfo = await User.findOne({
                isDeleted: { "!=": true },
                id: from,
              });

              let _placeStatus = "IN_FACTORY";
              let _current = from;

              switch (fromInfo.userType) {
                case USER_TYPE.Factory:
                  _placeStatus = "IN_FACTORY";
                  break;
                case USER_TYPE.Fixer:
                  _placeStatus = "IN_REPAIR";
                  break;
                case USER_TYPE.General:
                  _placeStatus = "IN_GENERAL";
                  break;
                case USER_TYPE.Agency:
                  _placeStatus = "IN_AGENCY";
                  break;
                default:
                  break;
              }

              let _updateForm = {
                placeStatus: _placeStatus,
                current: _current,
              };

              // Cập nhật lại thông tin bình
              await Cylinder.update({
                isDeleted: { "!=": true },
                _id: { in: listCylindersId },
              }).set(_updateForm);
            }

            // Tạo bản ghi tương ứng trong collection CylinderImex
            const _idImex = Date.now();
            await Promise.all(
              cylindersInCustomer.map(async (cylinder) => {
                // Bản ghi xuất
                await CylinderImex.create({
                  cylinder: cylinder.id,
                  status: cylinder.status,
                  condition: cylinder.classification.toUpperCase(),
                  idImex: _idImex,
                  typeImex: "OUT",
                  flow: "GIVE_BACK",
                  flowDescription: "RETURN",
                  category: cylinder.category,
                  manufacture: cylinder.manufacture,
                  createdBy: req.userInfo.id,
                  objectId: cylinder.current,
                  history: result.id,
                });
                // Bản ghi nhập
                await CylinderImex.create({
                  cylinder: cylinder.id,
                  status: cylinder.status,
                  condition: cylinder.classification.toUpperCase(),
                  idImex: _idImex,
                  typeImex: "IN",
                  flow: "RETURN",
                  flowDescription: "BY_SYSTEM",
                  category: cylinder.category,
                  manufacture: cylinder.manufacture,
                  createdBy: req.userInfo.id,
                  objectId: from ? from : req.userInfo.id,
                  history: result.id,
                });
              })
            );
          }

          // Còn lại là những bình đang ở nơi khác
          // const deliveringCylindersFrom = _.remove(cylinerIneligible, o => {
          //     return o.current !== from;
          // });
          if (cylinerIneligible.length > 0) {
            // --- GROUP cylinder theo current ---
            const group = await groupByArray(cylinerIneligible, "current");

            // -- Xử lý nhập cho từng nhóm --
            await Promise.all(
              group.map(async (eachGroup) => {
                const listCylindersId = await getCylindersId(eachGroup.values);

                // Tìm thông tin eachGroup
                const eachGroupInfo = await User.findOne({
                  isDeleted: { "!=": true },
                  id: eachGroup.key,
                });

                // + Trường hợp là Khách hàng thì hồi lưu về
                if (
                  eachGroupInfo.userType === "General" ||
                  eachGroupInfo.userType === "Agency"
                ) {
                  // Tạo bản ghi hồi lưu về from
                  const resultTurnback = await History.create({
                    driver: "Không xác định",
                    license_plate: "Không xác định",
                    cylinders: listCylindersId,
                    signature: "TURN_BACK_006",
                    idDriver: null,
                    from: eachGroup.key,
                    to: from,
                    type: "TURN_BACK",
                    // toArray,
                    // numberArray,
                    numberOfCylinder: eachGroup.values.length,
                    // cylindersWithoutSerial,
                    amount: 0,
                    // saler,
                    // typeForPartner: 'BUY',
                    // exportByDriver,
                    // turnbackByDriver,
                    importExportBySystem: true, // Xác định xử lý xuất nhập bởi hệ thống
                    createdBy: req.userInfo.id,
                  });

                  // Thay đổi trạng thái và vị trí bình sau khi tạo bản ghi nhập
                  if (resultTurnback) {
                    // Tìm thông tin from - nơi nhập vào
                    const fromInfo = await User.findOne({
                      isDeleted: { "!=": true },
                      id: from,
                    });

                    let _placeStatus = "IN_FACTORY";
                    let _current = from;

                    switch (fromInfo.userType) {
                      case USER_TYPE.Factory:
                        _placeStatus = "IN_FACTORY";
                        break;
                      case USER_TYPE.Fixer:
                        _placeStatus = "IN_REPAIR";
                        break;
                      case USER_TYPE.General:
                        _placeStatus = "IN_GENERAL";
                        break;
                      case USER_TYPE.Agency:
                        _placeStatus = "IN_AGENCY";
                        break;
                      default:
                        break;
                    }

                    let _updateForm = {
                      placeStatus: _placeStatus,
                      current: _current,
                    };

                    // Cập nhật lại thông tin bình
                    await Cylinder.update({
                      isDeleted: { "!=": true },
                      _id: { in: listCylindersId },
                    }).set(_updateForm);
                  }

                  // Tạo bản ghi tương ứng trong collection CylinderImex
                  const _idImex = Date.now();
                  await Promise.all(
                    eachGroup.values.map(async (cylinder) => {
                      // Bản ghi xuất
                      await CylinderImex.create({
                        cylinder: cylinder.id,
                        status: cylinder.status,
                        condition: cylinder.classification.toUpperCase(),
                        idImex: _idImex,
                        typeImex: "OUT",
                        flow: "TRANSITION",
                        flowDescription: "BY_SYSTEM",
                        category: cylinder.category,
                        manufacture: cylinder.manufacture,
                        createdBy: req.userInfo.id,
                        objectId: eachGroup.key,
                        history: resultTurnback.id,
                      });
                      // Bản ghi nhập
                      await CylinderImex.create({
                        cylinder: cylinder.id,
                        status: cylinder.status,
                        condition: cylinder.classification.toUpperCase(),
                        idImex: _idImex,
                        typeImex: "IN",
                        flow: "RETURN",
                        flowDescription: "BY_SYSTEM",
                        category: cylinder.category,
                        manufacture: cylinder.manufacture,
                        createdBy: req.userInfo.id,
                        objectId: from ? from : req.userInfo.id,
                        history: resultTurnback.id,
                      });
                    })
                  );
                }
                // + Trường hợp còn lại: trạm, nhà máy
                else {
                  // Tạo bản ghi xuất đến from
                  const resultExport = await History.create({
                    driver: "Không xác định",
                    license_plate: "Không xác định",
                    cylinders: listCylindersId,
                    signature: "EXPORT_006",
                    idDriver: null,
                    from: eachGroup.key,
                    to: from,
                    type: "EXPORT",
                    toArray: [from],
                    numberArray: [eachGroup.values.length.toString()],
                    numberOfCylinder: eachGroup.values.length,
                    // cylindersWithoutSerial,
                    amount: 0,
                    // saler,
                    typeForPartner: "BUY",
                    // exportByDriver,
                    // turnbackByDriver,
                    importExportBySystem: true, // Xác định xử lý xuất nhập bởi hệ thống
                    createdBy: req.userInfo.id,
                  });
                  // Tạo bản ghi nhập về from
                  const resultImport = await History.create({
                    driver: "Không xác định",
                    license_plate: "Không xác định",
                    cylinders: listCylindersId,
                    signature: "IMPORT_004",
                    idDriver: null,
                    from: eachGroup.key,
                    to: from,
                    type: "IMPORT",
                    // toArray,
                    // numberArray,
                    numberOfCylinder: eachGroup.values.length,
                    // cylindersWithoutSerial,
                    amount: 0,
                    // saler,
                    typeForPartner: "BUY",
                    // exportByDriver,
                    // turnbackByDriver,
                    importExportBySystem: true, // Xác định xử lý xuất nhập bởi hệ thống
                    createdBy: req.userInfo.id,
                  });

                  // Thay đổi trạng thái và vị trí bình sau khi tạo bản ghi nhập
                  if (resultImport) {
                    // Tìm thông tin from - nơi nhập vào
                    const fromInfo = await User.findOne({
                      isDeleted: { "!=": true },
                      id: from,
                    });

                    let _placeStatus = "IN_FACTORY";
                    let _current = from;

                    switch (fromInfo.userType) {
                      case USER_TYPE.Factory:
                        _placeStatus = "IN_FACTORY";
                        break;
                      case USER_TYPE.Fixer:
                        _placeStatus = "IN_REPAIR";
                        break;
                      case USER_TYPE.General:
                        _placeStatus = "IN_GENERAL";
                        break;
                      case USER_TYPE.Agency:
                        _placeStatus = "IN_AGENCY";
                        break;
                      default:
                        break;
                    }

                    let _updateForm = {
                      placeStatus: _placeStatus,
                      current: _current,
                    };

                    // Cập nhật lại thông tin bình
                    await Cylinder.update({
                      isDeleted: { "!=": true },
                      _id: { in: listCylindersId },
                    }).set(_updateForm);
                  }

                  // Tạo bản ghi tương ứng trong collection CylinderImex
                  const _idImex = Date.now();
                  await Promise.all(
                    eachGroup.values.map(async (cylinder) => {
                      // Bản ghi xuất
                      await CylinderImex.create({
                        cylinder: cylinder.id,
                        status: cylinder.status,
                        condition: cylinder.classification.toUpperCase(),
                        idImex: _idImex,
                        typeImex: "OUT",
                        flow: "TRANSITION",
                        flowDescription: "BY_SYSTEM",
                        category: cylinder.category,
                        manufacture: cylinder.manufacture,
                        createdBy: req.userInfo.id,
                        objectId: eachGroup.key,
                        history: resultExport.id,
                      });
                      // Bản ghi nhập
                      await CylinderImex.create({
                        cylinder: cylinder.id,
                        status: cylinder.status,
                        condition: cylinder.classification.toUpperCase(),
                        idImex: _idImex,
                        typeImex: "IN",
                        flow: "BRINGING_IN",
                        flowDescription: "BY_SYSTEM",
                        category: cylinder.category,
                        manufacture: cylinder.manufacture,
                        createdBy: req.userInfo.id,
                        objectId: from ? from : req.userInfo.id,
                        history: resultImport.id,
                      });
                    })
                  );
                }
              })
            );
          }

          const _listIds = await getCylindersId(_infoCylinderIneligible);
          cylinders = cylinders.concat(_listIds);
          _infoCylinders = [..._infoCylinders, ..._infoCylinderIneligible];

          // Cập nhật lại danh sách cylinderImex để ghi vào collecion CylinderImex
          _listIds.forEach((elementId) => {
            cylinderImex.push({
              condition: "NEW",
              id: elementId,
              status: "FULL",
            });
          });

          // Uniq
          cylinders = _.uniq(cylinders);
          cylinderImex = _.uniqBy(cylinderImex, "id");

          // Cập nhật lại số lượng bình
          numberOfCylinder = cylinders.length;
        }
      } else if (type === "IMPORT") {
        let startCheck = Date.now();
        _infoCylinders = await Cylinder.find({
          isDeleted: { "!=": true },
          id: { in: cylinders },
        });
        // .populate('current');
        if (_infoCylinders.length !== cylinders.length) {
          return res.badRequest(
            Utils.jsonErr("Danh sách bình không chính xác!!!")
          );
        }

        const foundErr = _infoCylinders.findIndex(
          (cylinder) => cylinder.placeStatus !== "DELIVERING"
        );

        if (foundErr >= 0) {
          return res.badRequest(
            Utils.jsonErr("Có bình đang không ở trạng thái vận chuyển!!!")
          );
        }

        if (cylinerIneligible.length > 0) {
          // Tìm thông tin bình
          cylinerIneligible = await Cylinder.find({
            isDeleted: { "!=": true },
            serial: { in: cylinerIneligible },
          });

          const _infoCylinderIneligible = [...cylinerIneligible];

          // Tìm những bình chưa xuất
          // Thực hiện: Xuất ra
          const notDeliveringCylinders = _.remove(cylinerIneligible, (o) => {
            return o.placeStatus !== "DELIVERING";
          });
          if (notDeliveringCylinders.length > 0) {
            // --- GROUP cylinder theo current ---
            const group = await groupByArray(notDeliveringCylinders, "current");

            // -- Xử lý xuất cho từng nhóm --
            await Promise.all(
              group.map(async (eachGroup) => {
                const listCylindersId = await getCylindersId(eachGroup.values);

                // Tạo bản ghi xuất đến to
                const resultExport = await History.create({
                  driver: "Không xác định",
                  license_plate: "Không xác định",
                  cylinders: listCylindersId,
                  signature: "EXPORT_003",
                  idDriver: null,
                  from: eachGroup.key,
                  to: to,
                  type: "EXPORT",
                  toArray: [to],
                  numberArray: [eachGroup.values.length.toString()],
                  numberOfCylinder: eachGroup.values.length,
                  // cylindersWithoutSerial,
                  amount: 0,
                  // saler,
                  typeForPartner: "BUY",
                  // exportByDriver,
                  // turnbackByDriver,
                  importExportBySystem: true, // Xác định xử lý xuất nhập bởi hệ thống
                  createdBy: req.userInfo.id,
                });
                // Tạo bản ghi tương ứng trong collection CylinderImex
                const _idImex = Date.now();
                await Promise.all(
                  eachGroup.values.map(async (cylinder) => {
                    await CylinderImex.create({
                      cylinder: cylinder.id,
                      status: cylinder.status,
                      condition: cylinder.classification.toUpperCase(),
                      idImex: _idImex,
                      typeImex: "OUT",
                      flow: "TRANSITION",
                      flowDescription: "BY_SYSTEM",
                      category: cylinder.category,
                      manufacture: cylinder.manufacture,
                      createdBy: req.userInfo.id,
                      objectId: eachGroup.key,
                      history: resultExport.id,
                    });
                  })
                );
              })
            );
          }

          // Tìm những bình đang vận chuyển
          // Thực hiện: Không làm gì cả

          const _listIds = await getCylindersId(_infoCylinderIneligible);
          cylinders = cylinders.concat(_listIds);
          _infoCylinders = [..._infoCylinders, ..._infoCylinderIneligible];

          // Cập nhật lại danh sách cylinderImex để ghi vào collecion CylinderImex
          _listIds.forEach((elementId) => {
            cylinderImex.push({
              condition: "NEW",
              id: elementId,
              status: "FULL",
            });
          });

          // Uniq
          cylinders = _.uniq(cylinders);
          cylinderImex = _.uniqBy(cylinderImex, "id");

          // Cập nhật lại số lượng bình
          numberOfCylinder = cylinders.length;
        }
      } else if (type === "SALE") {
        _infoCylinders = await Cylinder.find({
          isDeleted: { "!=": true },
          id: { in: cylinders },
        });
        // .populate('current');
        if (_infoCylinders.length !== cylinders.length) {
          return res.badRequest(
            Utils.jsonErr("Danh sách bình không chính xác!!!")
          );
        }

        const foundErr = _infoCylinders.findIndex(
          (cylinder) => cylinder.current !== from
        );

        if (foundErr >= 0) {
          return res.badRequest(
            Utils.jsonErr("Danh sách bình không chính xác!!!")
          );
        }
      } else if (type === "TURN_BACK") {
        _infoCylinders = await Cylinder.find({
          isDeleted: { "!=": true },
          id: { in: cylinders },
        }).populate("histories", {
          where: {
            type: "IMPORT",
          },
          limit: 1,
          sort: "createdAt DESC",
        });

        // Check những mã đã hồi lưu
        const currentCylinders = _.filter(_infoCylinders, (o) => {
          return (
            o.current === req.userInfo.id && o.placeStatus !== "DELIVERING"
          );
        });
        if (currentCylinders.length > 0) {
          return res.badRequest(
            Utils.jsonErr(
              `Những mã này đã hồi lưu nên không thể hồi lưu tiếp : ${getArrayOfSerials(
                currentCylinders
              ).join(",")}`
            )
          );
        }

        // Check những mã đang vận chuyển
        const deliveringCylinders = _.filter(_infoCylinders, (o) => {
          return o.placeStatus === "DELIVERING";
        });
        if (deliveringCylinders.length > 0) {
          return res.badRequest(
            Utils.jsonErr(
              `Những mã này đang vận chuyển nên không thể hổi lưu : ${getArrayOfSerials(
                deliveringCylinders
              ).join(",")}`
            )
          );
        }

        //
        if (turnBack_cylinerIneligible) {
          // Xuất những bình đang ở nơi khác:
          // + đã hồi lưu
          // + đang ở trạm khác
          // + đang ở nhà máy khác

          //
          const notDeliveringCylinder = [
            ...turnBack_cylinerIneligible.errCyl_current,
            ...turnBack_cylinerIneligible.errCyl_inFactory,
            ...turnBack_cylinerIneligible.errCyl_inFixer,
          ];
          // Xóa mã bình bị trùng lặp ở cylinder (chứa danh sách bình trùng đạt yêu cầu)
          _.remove(notDeliveringCylinder, (o) => {
            return _infoCylinders.findIndex((_cyl) => _cyl.serial === o) !== -1;
          });

          // Tìm thông tin bình đang ở nơi khác
          const info_notDeliveringCylinder = await Cylinder.find({
            isDeleted: { "!=": true },
            serial: { in: notDeliveringCylinder },
          });

          // --- GROUP cylinder theo current ---
          const group = await groupByArray(
            info_notDeliveringCylinder,
            "current"
          );

          // -- Xử lý cho từng nhóm --
          await Promise.all(
            group.map(async (eachGroup) => {
              const listCylindersId = await getCylindersId(eachGroup.values);

              // Xuất ra khỏi nơi đang giữ bình
              const resultExport = await History.create({
                driver: "Không xác định",
                license_plate: "Không xác định",
                cylinders: listCylindersId,
                signature: "EXPORT_004",
                idDriver: null,
                from: eachGroup.key,
                to: to,
                type: "EXPORT",
                toArray: [to],
                numberArray: [eachGroup.values.length.toString()],
                numberOfCylinder: eachGroup.values.length,
                // cylindersWithoutSerial,
                amount: 0,
                // saler,
                typeForPartner: "BUY",
                // exportByDriver,
                // turnbackByDriver,
                importExportBySystem: true, // Xác định xử lý xuất nhập bởi hệ thống
                createdBy: req.userInfo.id,
              });
              // Tạo bản ghi tương ứng trong collection CylinderImex
              const _idImex = Date.now();
              await Promise.all(
                eachGroup.values.map(async (cylinder) => {
                  await CylinderImex.create({
                    cylinder: cylinder.id,
                    status: cylinder.status,
                    condition: cylinder.classification.toUpperCase(),
                    idImex: _idImex,
                    typeImex: "OUT",
                    flow: "TRANSITION",
                    flowDescription: "BY_SYSTEM",
                    category: cylinder.category,
                    manufacture: cylinder.manufacture,
                    createdBy: req.userInfo.id,
                    objectId: eachGroup.key,
                    history: resultExport.id,
                  });
                })
              );
            })
          );

          // Tìm thông tin bình đang vận chuyển
          const info_deliveringCylinder = await Cylinder.find({
            isDeleted: { "!=": true },
            serial: { in: turnBack_cylinerIneligible.errCyl_delivering },
          });

          const _listIds_Delivering = await getCylindersId(
            info_deliveringCylinder
          );
          const _listIds_notDelivering = await getCylindersId(
            info_notDeliveringCylinder
          );

          // const _listIds = await getCylindersId(
          //   [...info_deliveringCylinder, ...info_notDeliveringCylinder,]
          // )
          const _listIds = [..._listIds_Delivering, ..._listIds_notDelivering];

          cylinders = cylinders.concat(_listIds);
          _infoCylinders = [
            ..._infoCylinders,
            ...info_deliveringCylinder,
            ...info_notDeliveringCylinder,
          ];

          // Cập nhật lại danh sách cylinderImex để ghi vào collecion CylinderImex
          // + Trường hợp đang vận chuyển
          _listIds_Delivering.forEach((elementId) => {
            cylinderImex.push({
              condition: "OLD",
              id: elementId,
              status: "EMPTY",
              isDelivering: true,
            });
          });
          // + Trường hợp không vận chuyển
          // Đã xử lý: Xuất ra khỏi nơi đang giữ bình
          // Bình chuyển trạng thái thành đang vận chuyển
          _listIds_notDelivering.forEach((elementId) => {
            cylinderImex.push({
              condition: "OLD",
              id: elementId,
              status: "EMPTY",
              isDelivering: true,
            });
          });

          // Uniq
          cylinders = _.uniq(cylinders);
          cylinderImex = _.uniqBy(cylinderImex, "id");

          // Cập nhật lại số lượng bình
          numberOfCylinder = cylinders.length;
        }
      } else {
        _infoCylinders = await Cylinder.find({
          isDeleted: { "!=": true },
          id: { in: cylinders },
        });
      }

      // // console.log('Danh sach binh: ', newCyLinders);
      // if(newCyLinders.length !== cylinders.length)
      // {
      //   return res.ok(Utils.jsonErr('Danh sách bình không chính xác!!!'));
      // }

      // Tính tổng amount của những bình truyền lên
      let amount = 0;
      /*amount=await Cylinder.sum('currentSalePrice').where({_id: {in: cylinders}})*/
      // try {
      //   const saledCylinders = await Cylinder.find({isDeleted: {"!=": true},id : newCyLinders});
      //   for(let i = 0; i < saledCylinders.length; i++) {
      //     amount = amount + Number(saledCylinders[i].currentSalePrice !== 0 ? saledCylinders[i].currentSalePrice : saledCylinders[i].currentImportPrice);
      //   }
      // } catch (error) {
      //   amount = 0;
      // }

      // try {
      let result = await History.create({
        driver,
        license_plate,
        cylinders,
        signature,
        idDriver: idDriver ? idDriver : null,
        from,
        to,
        type,
        toArray,
        numberArray,
        numberOfCylinder,
        cylindersWithoutSerial,
        amount,
        saler,
        typeForPartner,
        exportByDriver,
        turnbackByDriver,
        createdBy: req.userInfo.id,
      }).fetch();

      if (result) {
        const history = await History.findOne({
          isDeleted: { "!=": true },
          id: result.id,
        }).populate("cylinders");

        await Log.create({
          inputData: JSON.stringify(req.body),
          cylinders: history.cylinders,
          // cylindersBody,
          // notDupAndCantExportBody,
          type: "HISTORY_LOG_0003",
          content: "Log kiem tra",
          historyType: type,
          history: result.id,
          createBy: req.userInfo.id,
          status: true,
        });

        // if (history.cylinders.length !== history.numberOfCylinder) {
        //     await Log.create({
        //         inputData: JSON.stringify(req.body),
        //         cylinders: history.cylinders,
        //         cylindersBody,
        //         notDupAndCantExportBody,
        //         type: 'DUPLICATE_ERROR_0001',
        //         content: 'cylinders.length !== numberOfCylinder',
        //         status: false
        //     });
        // }

        // if (history.cylinders.length !== cylinderImex.length) {
        //     await Log.create({
        //         inputData: JSON.stringify(req.body),
        //         cylinders: history.cylinders,
        //         cylindersBody,
        //         notDupAndCantExportBody,
        //         type: 'DUPLICATE_ERROR_0002',
        //         content: 'cylinders.length !== cylinderImex.length',
        //         status: false
        //     });
        // }
      }

      // }
      // catch(err) {
      //   return res.ok(Utils.jsonErr(err.message));
      // }

      // Kiểm tra from to và type của history để set placeStatus
      let placeStatus = "IN_FACTORY";
      let current = null;
      let status = "EMPTY";
      let pushGas = false;

      try {
        if (!!to) {
          toModel = await User.findOne({ isDeleted: { "!=": true }, id: to });
        }

        if (type !== "TURN_BACK" && !!from) {
          fromModel = await User.findOne({
            isDeleted: { "!=": true },
            id: from,
          });
        }
      } catch (e) {
        await Log.create({
          inputData: JSON.stringify(req.body),
          // inputData: req.body,
          type: "HISTORY_ERROR_0005",
          content: e.message,
          status: false,
        });
      }

      if (type === "EXPORT") {
        placeStatus = "DELIVERING";
        current = from;
        if (typeForPartner === "" && fromModel.userType === USER_TYPE.Factory) {
          exportPlace = from;
        }
      }

      if (type === "IMPORT") {
        if (toModel.userType === USER_TYPE.Factory) {
          placeStatus = "IN_FACTORY";
        }
        if (toModel.userType === USER_TYPE.Fixer) {
          placeStatus = "IN_REPAIR";
        }
        if (toModel.userType === USER_TYPE.General) {
          placeStatus = "IN_GENERAL";
        }
        if (toModel.userType === USER_TYPE.Agency) {
          placeStatus = "IN_AGENCY";
        }
        current = to;
      }
      // if (type === 'GIVE_BACK') { // Trả về cho nhà máy
      //   placeStatus = 'DELIVERING';
      //   current = from;
      // }
      if (type === "TURN_BACK") {
        // Nhà máy nhận bình trả về
        if (toModel.userType === "Factory") {
          placeStatus = "IN_FACTORY";
          //status = 'EMPTY';
          //pushGas=true;
        }
        current = to;
      }
      if (type === "SALE") {
        /*if (toModel.userType === 'Normal') placeStatus = 'IN_CUSTOMER'
        current = to*/
        placeStatus = "IN_CUSTOMER";
        current = from;
        if (
          !req.body.nameCustomer ||
          !req.body.addressCustomer ||
          req.body.nameCustomer === "" ||
          req.body.addressCustomer === ""
        ) {
          return req.badRequest("Missing customer infomation");
        }
        let form = {
          name: req.body.nameCustomer,
          address: req.body.addressCustomer,
          phone: req.body.phoneCustomer,
          owner: req.userInfo.id,
        };
        try {
          customer = await Customer.findOrCreate(
            { phone: req.body.phoneCustomer, owner: req.userInfo.id },
            form
          );
          if (customer) {
            result = await History.updateOne({
              isDeleted: { "!=": true },
              _id: result.id,
            }).set({ customer: customer.id, saler: req.userInfo.id });
          }
        } catch (e) {
          await Log.create({
            inputData: JSON.stringify(req.body),
            // inputData: req.body,
            type: "HISTORY_ERROR_0004",
            content: e.message,
            status: false,
          });

          // console.log('Error::::', e);
        }
      }

      // Kiểm tra from to và type của history để set trạng thái đủ gas hay chưa
      // if (type === 'EXPORT' && fromModel !== null && fromModel.userType === 'Station') {
      //   status = 'FULL';
      //   pushGas=true;
      //   console.log("vao");
      // }

      //Check exportPlace

      let updateForm = {
        placeStatus: placeStatus,
        current: current,
        //updateBy: idUser
      };

      if (exportPlace) {
        updateForm.exportPlace = exportPlace;
      }

      if (type === "TURN_BACK") {
        updateForm.exportPlace = null;
      }

      if (!result) {
        await Log.create({
          inputData: JSON.stringify(req.body),
          // inputData: req.body,
          type: "HISTORY_ERROR_0003",
          content: "Không ghi được lịch sử",
          status: false,
        });

        return res.badRequest(Utils.jsonErr(result.err));
      }
      let resultUpdated = null;
      // Update placeStatus của những bình truyền lên
      if (pushGas) {
        updateForm.status = status;
      }

      if (type === "TURN_BACK") {
        let db = Cylinder.getDatastore().manager;

        // Convert cylinders type
        // string[] => ObjectId[]
        const cylinderObjectId = await converToObjectId(cylinders);

        resultUpdated = await db.collection("cylinder").update(
          { _id: { $in: cylinderObjectId } },
          {
            $inc: { circleCount: 1 },
            $set: updateForm,
          },
          { multi: true }
        );
      } else {
        resultUpdated = await Cylinder.update({
          isDeleted: { "!=": true },
          _id: { in: cylinders },
        })
          .set(updateForm)
          .fetch();
      }

      if (!resultUpdated) {
        await Log.create({
          inputData: JSON.stringify(req.body),
          // inputData: req.body,
          type: "HISTORY_ERROR_0002",
          content: "Không cập nhật được thông tin bình",
          status: false,
        });

        return res.badRequest(Utils.jsonErr(result.err));
      }

      // Sau khi ghi vào bảng History và cập nhật lại trạng thái bình thành công
      // Ghi tiếp vào bảng CylinderImex
      if (typeImex) {
        // let _startTime = 0;
        // let _endTime = 0;
        // _startTime = Date.now();

        // // if (type === 'TURN_BACK') {
        // //   const dTimeTurnBack = idImex ? idImex : Date.now()
        // //   // Tạo bản ghi trả bình
        // //   await CylinderImex.create({
        // //     cylinder: cylinder.id,
        // //     status: cylinder.status ? cylinder.status : 'EMPTY',
        // //     condition: cylinder.condition ? cylinder.condition : 'OLD',
        // //     idImex: dTimeTurnBack,
        // //     typeImex: 'OUT',
        // //     flow: 'GIVE_BACK',
        // //     flowDescription: 'RETURN',
        // //     cylinderType: cylinderInfo.cylinderType ? cylinderInfo.cylinderType : '',
        // //     createdBy: req.userInfo.id,
        // //     objectId: from ?
        // //       from : objectId ?
        // //         objectId : req.userInfo.id,
        // //     history: result.id,

        // //     // cylinder: cylinder.id,
        // //     // idImex,
        // //     // status: cylinder.status ? cylinder.status : 'EMPTY',
        // //     // condition: 'OLD',
        // //     // typeImex: 'OUT',
        // //     // flow: 'GIVE_BACK',
        // //     // flowDescription: 'RETURN',
        // //     // // Cần thêm bản ghi trong collection History ???
        // //     // // history,
        // //     // objectId: cylinder.current,
        // //     // createdBy: userInfo.id,
        // //     // isDeleted: false,
        // //   })
        // // }

        const _idImex = Date.now();
        let dataForCreate = [];
        let dataForGiveback = [];

        await Promise.all(
          cylinderImex.map(async (cylinder) => {
            // let condition = ''
            // if (!cylinder.classification) {
            //   const record = await CylinderImex.find({isDeleted: {"!=": true},
            //     cylinder: cylinder.id
            //   }).sort('createdAt DESC')

            //   if (record.length > 0) {
            //     condition = record[0].condition
            //   }
            //   else {
            //     condition = 'NEW'
            //   }
            // }

            // const cylinderInfo = await Cylinder.findOne({isDeleted: {"!=": true},id: cylinder.id})

            // await CylinderImex.create({
            //   cylinder: cylinder.id,
            //   status: cylinder.status ? cylinder.status : 'FULL' ,
            //   condition: cylinder.classification ? cylinder.classification.toUpperCase() : 'NEW',
            //   idImex: _idImex,
            //   typeImex: typeImex,
            //   flow: flow,
            //   category: cylinderInfo ? cylinderInfo.category : null,
            //   createdBy: req.userInfo.id,
            //   objectId: req.userInfo.id,
            //   history: result.id,
            // })

            // _infoCylinders.push({
            //   cylinderId: itemCylinder.id,
            //   cylinderCategory: itemCylinder.category,
            // });
            const cylinderInfo = await _infoCylinders.find(
              (_cylinder) => _cylinder.id === cylinder.id
            );

            dataForCreate.push({
              cylinder: cylinder.id,
              status: cylinder.status ? cylinder.status : "EMPTY",
              condition: cylinderInfo
                ? cylinderInfo.classification.toUpperCase()
                : "OLD",
              idImex: _idImex,
              typeImex: typeImex,
              flow: flow,
              category: cylinderInfo ? cylinderInfo.category : null,
              manufacture: cylinderInfo ? cylinderInfo.manufacture : null,
              createdBy: req.userInfo.id,
              objectId: req.userInfo.id,
              history: result.id,
            });

            if (type === "TURN_BACK" && !cylinder.isDelivering) {
              dataForGiveback.push({
                cylinder: cylinder.id,
                status: cylinder.status ? cylinder.status : "EMPTY",
                condition: cylinderInfo.classification
                  ? cylinderInfo.classification.toUpperCase()
                  : "OLD",
                idImex: _idImex,
                typeImex: "OUT",
                flow: "GIVE_BACK",
                flowDescription: "RETURN",
                category: cylinderInfo ? cylinderInfo.category : null,
                manufacture: cylinderInfo ? cylinderInfo.manufacture : null,
                createdBy: req.userInfo.id,
                objectId: cylinderInfo.current,
                history: result.id,
              });
            }
          })
        );

        if (dataForGiveback.length > 0) {
          await CylinderImex.createEach(dataForGiveback);
        }

        if (dataForCreate.length > 0) {
          await CylinderImex.createEach(dataForCreate);

          // const createdImex = await CylinderImex.createEach(dataForCreate).fetch();
          // if (createdImex) _endTime = Date.now()
          // time.push({
          //   _startTime,
          //   _endTime,
          //   message: `Created ${createdImex.length} cylinderImex`
          // })
        }
      }

      // returnGas
      if (type === "TURN_BACK") {
        let { cylindersReturn, createBy } = req.body;

        if (cylindersReturn) {
          const dateReceived = Date();
          const length_returnGas = cylindersReturn.length;
          let data_returnGas = [];

          if (length_returnGas > 0) {
            for (let i = 0; i < length_returnGas; i++) {
              data_returnGas[i] = await returnGas
                .create({
                  serialCylinder: cylindersReturn[i].serial,
                  idCylinder: cylindersReturn[i].id,
                  dateReceived: dateReceived,
                  weight: cylindersReturn[i].weight,
                  //idCompany: createBy,
                  //createBy: createBy
                })
                .fetch();
            }

            // console.log("data_returnGas_mobile", data_returnGas);

            // return res.json({ error: false, data: data });
          }
        } else {
          const dateReceived = Date();
          const length_returnGas = cylinders.length;
          let data_returnGas = [];
          try {
            if (length_returnGas > 0) {
              for (let i = 0; i < length_returnGas; i++) {
                let cylWeight = await Cylinder.findOne({
                  isDeleted: { "!=": true },
                  id: cylinders[i],
                });
                //console.log('cylWeight.weight', cylWeight.weight)
                data_returnGas[i] = await returnGas
                  .create({
                    serialCylinder: cylWeight.serial,
                    idCylinder: cylWeight.id,
                    dateReceived: dateReceived,
                    weight: cylWeight.weight,
                    //idCompany: createBy,
                    //createBy: createBy
                  })
                  .fetch();
              }

              // console.log("data_returnGas_web", data_returnGas);

              // return res.json({ error: false, data: data });
            }
          } catch (err) {
            await Log.create({
              inputData: JSON.stringify(req.body),
              // inputData: req.body,
              type: "HISTORY_ERROR_0001",
              content: err.message,
              status: false,
            });

            return res.created("err_messaga", err.message);
          }
        }

        // else {
        //   return res.json({ error: true, message: 'Khong co binh nao' });
        // }
      }

      // result.time = time

      return res.created(result);
      //}
    } catch (error) {
      await Log.create({
        inputData: JSON.stringify(req.body),
        // inputData: req.body,
        type: "HISTORY",
        content: error.message,
        status: false,
      });

      return res.badRequest(Utils.jsonErr(error.message));
    }
  },

  importCylinderSkipScanWhenExport: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      driver,
      license_plate,
      // from,
      // toArray,
      //to,
      // cylindersWithoutSerial,
      type,
      cylinders,
      typeForPartner,
      //numberArray,
      idDriver,
      //signature,
      userId,
    } = req.body;
    //let cylindersWithoutSerial = !!req.body.cylindersWithoutSerial ? req.body.cylindersWithoutSerial :  0;

    if (!type) {
      return Utils.jsonErr("Type is required");
    }
    if (type !== "IMPORT_SKIP_EXPORT") {
      return Utils.jsonErr("Wrong aciton type");
    }
    // if (type !== 'TURN_BACK' && !from) {
    //   return Utils.jsonErr('From is required');
    // }
    if (!cylinders || cylinders === []) {
      return Utils.jsonErr("Cylinders is required");
    }
    if (!driver && type !== "SALE") {
      return Utils.jsonErr("Driver is required");
    }
    if (!license_plate && type !== "SALE") {
      return Utils.jsonErr("License_plate is required");
    }

    let dataExport = {};
    let dataImport = {};

    try {
      // Tìm vị trí hiện tại của cylinder
      let currentLocationCylinder = await Cylinder.findOne({
        isDeleted: { "!=": true },
        id: cylinders[0],
      }).populate("current");

      dataExport.driver = driver;
      dataExport.license_plate = license_plate;
      dataExport.from = currentLocationCylinder.current.id;
      dataExport.toArray = [userId];
      // dataExport.cylindersWithoutSerial = null
      dataExport.type = "EXPORT";
      dataExport.cylinders = cylinders;
      dataExport.typeForPartner = typeForPartner;
      dataExport.numberArray = [cylinders.length.toString()];
      dataExport.idDriver = idDriver;
      dataExport.signature = "Web signature - IMPORT_SKIP_EXPORT";

      let resultExport = await History.create(dataExport).fetch();

      if (
        resultExport &&
        resultExport.hasOwnProperty("type") &&
        resultExport.type
      ) {
        dataImport.driver = driver;
        dataImport.license_plate = license_plate;
        dataImport.from = resultExport.from;
        dataImport.to = userId;
        // dataImport.cylindersWithoutSerial = null
        dataImport.type = "IMPORT";
        dataImport.cylinders = cylinders;
        dataImport.typeForPartner = typeForPartner;
        //dataImport.numberArray = [(cylinders.length).toString()]
        dataImport.idDriver = idDriver;
        dataImport.signature = "Web signature - IMPORT_SKIP_EXPORT";

        let resultImport = await History.create(dataImport).fetch();

        if (
          resultImport &&
          resultImport.hasOwnProperty("type") &&
          resultImport.type
        ) {
          //update lại trạng thái, vị trí của cylinder
          let userInfo = await User.findOne({
            isDeleted: { "!=": true },
            id: userId,
          });
          let updateForm = {
            placeStatus: "IN_" + userInfo.userType.toUpperCase(),
            current: userInfo.id,
            exportPlace: currentLocationCylinder.current.id,
          };

          resultUpdated = await Cylinder.update({
            isDeleted: { "!=": true },
            _id: { in: cylinders },
          })
            .set(updateForm)
            .fetch();

          if (resultUpdated) {
            return res.json({ status: true, message: "Nhập hàng thành công" });
          } else {
            return res.json({
              status: false,
              message:
                "Tạo thành công bản ghi xuất hàng và nhập hàng, nhưung bị lỗi cập nhật lại thông tin trạng thái bình",
            });
          }
        } else {
          return res.json({
            status: false,
            message: "Không tạo được bản ghi nhập hàng",
          });
        }
      } else {
        return res.json({
          status: false,
          message: "Không tạo được bản ghi xuất hàng",
        });
      }
    } catch (error) {
      return res.json({
        status: false,
        data: error.message,
        message: "Gặp lỗi khi nhập hàng (mà không có bản ghi xuất hàng)",
      });
    }
  },

  createExportOrderHistory: async function (req, res) {
    if (!req.body) {
      return res.json({
        status: false,
        resCode: "ERROR-00027",
        message: "Empty body",
      });
    }

    const {
      //
      userId,

      // Chi tiết export
      type,
      driver,
      license_plate,
      from,
      toArray,
      // to,
      numberArray,
      cylinders,
      idDriver,
      signature,

      // Các đơn hàng
      orderId,
    } = req.body;

    const { objectId, cylinderImex, idImex, typeImex, flow } = req.body;

    if (!orderId || !Array.isArray(orderId)) {
      return res.json({
        status: false,
        resCode: "ERROR-00002",
        message: "Missing orderId",
      });
    } else {
      const isExistedOrder = await OrderShipping.find({
        isDeleted: { "!=": true },
        id: orderId,
      });
      if (!isExistedOrder || isExistedOrder.length === 0) {
        return res.json({
          status: false,
          resCode: "ERROR-00022",
          message: "Không tìm thấy đơn hàng nào",
        });
      }
      if (isExistedOrder.length !== orderId.length) {
        return res.json({
          status: false,
          resCode: "ERROR-00029",
          message: "Không tìm thấy đơn hàng: ",
        });
      }
    }

    if (!userId) {
      return res.json({
        status: false,
        resCode: "ERROR-00001",
        message: "Missing userId",
      });
    }

    if (!type) {
      return res.json({
        status: false,
        resCode: "ERROR-00003",
        message: "Missing actionType",
      });
    }

    if (!driver) {
      return res.json({
        status: false,
        resCode: "ERROR-00011",
        message: "Missing driver",
      });
    }

    if (!license_plate) {
      return res.json({
        status: false,
        resCode: "ERROR-00012",
        message: "Missing license_plate",
      });
    }

    if (!cylinders || !Array.isArray(cylinders)) {
      return res.json({
        status: false,
        resCode: "ERROR-00013",
        message: "Missing cylinders (IDs)",
      });
    }

    if (!from) {
      return res.json({
        status: false,
        resCode: "ERROR-00014",
        message: "Missing from",
      });
    }

    if (!numberArray) {
      return res.json({
        status: false,
        resCode: "ERROR-00015",
        message: "Missing numberArray",
      });
    }

    // if (!idDriver) {
    //   return res.json({ status: false, resCode: 'ERROR-00016', message: 'Missing idDriver' });
    // }

    try {
      let numberOfCylinder = 0;
      if (cylinders) {
        numberOfCylinder = req.body.cylinders.length;
      }

      let newCyLinders = [];
      for (let i = 0; i < cylinders.length; i++) {
        let itemCylinder = await Cylinder.findOne({
          isDeleted: { "!=": true },
          id: cylinders[i],
        })
          .populate("histories")
          .populate("current");
        if (
          typeof itemCylinder.histories !== "undefined" &&
          itemCylinder.histories !== null &&
          itemCylinder.histories.length > 0
        ) {
          let final = itemCylinder.histories[itemCylinder.histories.length - 1];

          final = await History.findOne(final).populate("toArray");

          if (type === "EXPORT") {
            if (
              itemCylinder.current.id === from ||
              itemCylinder.placeStatus === "IN_FACTORY"
            ) {
              newCyLinders.push(cylinders[i]);
            }
          }
        } else {
          newCyLinders.push(cylinders[i]);
        }
      }
      // console.log('Danh sach binh: ', newCyLinders);
      if (newCyLinders.length !== cylinders.length) {
        return res.json({
          status: false,
          resCode: "ERROR-00017",
          message: "Danh sách bình không chính xác",
        });
      }

      let result = await History.create({
        driver,
        license_plate,
        cylinders,
        signature,
        idDriver: idDriver ? idDriver : null,
        from,
        type,
        toArray,
        numberArray,
        numberOfCylinder,
        typeForPartner: "",
        createdBy: userId,
      }).fetch();

      if (!result) {
        return res.json({
          status: false,
          resCode: "ERROR-00018",
          message: "Tạo lịch sử xuất hàng thất bại",
        });
      }

      // --- Cập nhật lại thông tin, trạng thái bình ---
      let placeStatus = "IN_FACTORY";
      let current = null;
      let status = "FULL";

      if (type === "EXPORT") {
        placeStatus = "DELIVERING";
        current = from;
        //if(typeForPartner === '' && fromModel.userType === USER_TYPE.Factory) {exportPlace = from;}
      }

      let updateForm = {
        placeStatus: placeStatus,
        current: current,
        status: status,
      };

      let resultUpdated = null;
      resultUpdated = await Cylinder.update({
        isDeleted: { "!=": true },
        _id: { in: cylinders },
      })
        .set(updateForm)
        .fetch();

      if (!resultUpdated) {
        return res.json({
          status: false,
          resCode: "ERROR-00019",
          message:
            "Tạo bản ghi xuất hàng thành công, nhưng bị lỗi khi cập nhật lại trạng thái của bình",
        });
      }

      // --- Tạo bản ghi chi tiết lịch sử đơn hàng tương ứng ---
      await Promise.all(
        orderId.map(async (order) => {
          const createdOrderHistory = await OrderShippingHistory.create({
            order: order,
            status: "DELIVERING",
            content: "Xuất đơn hàng - Trên WEB, đang vận chuyển",
            detail: result.id,
            createdBy: userId,
          }).fetch();

          if (!createdOrderHistory) {
            return res.json({
              status: false,
              resCode: "ERROR-00020",
              message:
                "Tạo bản ghi xuất hàng và cập nhật lại trạng thái của bình thành công, nhưng bị lỗi khi tạo bản ghi lịch sử đơn hàng",
            });
          }
        })
      );

      // const createdOrderHistory = await OrderHistory.create({
      //   order: orderId,
      //   status: 'DELIVERING',
      //   content: 'Xuất đơn hàng - Trên WEB, đang vận chuyển',
      //   detail: result.id,
      //   createdBy: userId,
      // }).fetch()

      // if (!createdOrderHistory) {
      //   return res.json({
      //     status: false,
      //     resCode: 'ERROR-00020',
      //     message: 'Tạo bản ghi xuất hàng và cập nhật lại trạng thái của bình thành công, nhưng bị lỗi khi tạo bản ghi lịch sử đơn hàng'
      //   })
      // }

      // --- Cập nhật lại trạng thái đơn hàng ---
      await Promise.all(
        orderId.map(async (order) => {
          const resultUpdatedOrder = await OrderShipping.updateOne({
            isDeleted: { "!=": true },
            id: order,
          }).set({
            status: "DELIVERING",
            updatedBy: userId /* orderHistories: createdOrderHistory.id */,
          });

          if (!resultUpdatedOrder) {
            return res.json({
              status: false,
              resCode: "ERROR-00021",
              message:
                "Tạo bản ghi xuất hàng, cập nhật lại trạng thái của bình và tạo bản ghi lịch sử đơn hàng thành công, nhưng bị lỗi khi cập nhật lại trạng thái đơn hàng",
            });
          }
        })
      );

      // const resultUpdatedOrder = await Order.updateOne({isDeleted: {"!=": true}, id: orderId })
      //   .set({ status: 'DELIVERING', updatedBy: userId, /* orderHistories: createdOrderHistory.id */ })

      // if (!resultUpdatedOrder) {
      //   return res.json({
      //     status: false,
      //     resCode: 'ERROR-00021',
      //     message: 'Tạo bản ghi xuất hàng, cập nhật lại trạng thái của bình và tạo bản ghi lịch sử đơn hàng thành công, nhưng bị lỗi khi cập nhật lại trạng thái đơn hàng'
      //   })
      // }

      /* // --- Cập nhật lại lịch sử xuất bình ---
      const resultUpdatedHistory = await History.updateOne({isDeleted: {"!=": true}, id: result.id })
        .set({ orderHistory: createdOrderHistory.id })

      if (!resultUpdatedHistory) {
        return res.json({
          status: false,
          resCode: 'ERROR-00023',
          message: 'Lỗi khi cập nhật lại bản ghi lịch sử xuất hàng'
        })
      } */

      // const test1 = await Order.findOne({isDeleted: {"!=": true}, id: orderId }).populate('orderHistories')
      // const test2 = await OrderHistory.findOne({isDeleted: {"!=": true}, id: createdOrderHistory.id }).populate('order')
      // const test3 = await History.findOne({isDeleted: {"!=": true}, id: result.id }).populate('orderHistory')

      /////
      // Sau khi ghi vào bảng History và cập nhật lại trạng thái bình thành công
      // Ghi tiếp vào bảng CylinderImex
      if (typeImex) {
        await Promise.all(
          cylinderImex.map(async (cylinder) => {
            let condition = "";
            if (!cylinder.condition) {
              const record = await CylinderImex.find({
                isDeleted: { "!=": true },
                cylinder: cylinder.id,
              }).sort("createdAt DESC");

              if (record.length > 0) {
                condition = record[0].condition;
              } else {
                condition = "New";
              }
            }

            await CylinderImex.create({
              cylinder: cylinder.id,
              status: cylinder.status ? cylinder.status : "FULL",
              condition: cylinder.condition ? cylinder.conditions : condition,
              idImex: Date.now(),
              typeImex: typeImex,
              flow: flow,
              createdBy: userId,
              objectId: objectId ? objectId : userId,
              history: result.id,
            });
          })
        );
      }

      // SUCCESS - Xuất đơn hàng thành công
      return res.json({
        status: true,
        resCode: "SUCCESS-00002",
        message: "Xuất đơn hàng thành công",
        data: result,
      });

      // return res.created(result);
    } catch (error) {
      return res.json({
        status: false,
        resCode: "ERROR-90002",
        message: "Gặp lỗi khi xuất đơn hàng",
        error: error.message,
      });
    }
  },

  turnBackCylinder: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      driver,
      // flow,
      from,
      idDriver,
      // idImex,
      license_plate,
      // numberOfCylinder,
      signature,
      // to,
      successCylinders, // Danh sách bình đạt yêu cầu
      type,
      // typeImex
    } = req.body;

    // Ghi vào bảng CylinderImex
    const { idImex, typeImex, flow } = req.body;

    // Bình không đạt
    let {
      turnBack_cylinerIneligible,
      // {
      //   // --Bình đã hồi lưu--
      //   errCyl_current,
      //   // --Bình đang vận chuyển--
      //   errCyl_delivering,
      //   // --Bình đang ở trạm khác--
      //   errCyl_inFactory,
      //   // --Bình đang ở nhà máy--
      //   errCyl_inFixer,
      // }
    } = req.body;

    let {
      cylinders, // Danh sách bình trùng
      cylinderImex,
    } = req.body;

    if (!Array.isArray(cylinders)) {
      return res.badRequest(Utils.jsonErr("Wrong cylinders type"));
    }

    if (cylinders.length === 0) {
      return res.badRequest(Utils.jsonErr("cylinders is required"));
    }

    const { exportByDriver, turnbackByDriver } = req.body;

    let exportPlace;
    // let customer = null;

    let typeForPartner = req.body.typeForPartner;
    let to = req.body.to;
    let numberOfCylinder = 0;
    let cylindersWithoutSerial = !!req.body.cylindersWithoutSerial
      ? req.body.cylindersWithoutSerial
      : 0;
    if (!!req.body.cylinders) {
      numberOfCylinder = req.body.cylinders.length;
    }

    if (cylindersWithoutSerial !== 0) {
      numberOfCylinder += cylindersWithoutSerial;
    }

    const numberArray = req.body.numberArray;
    const toArray = req.body.toArray;
    let toModel = undefined;
    // let fromModel = undefined;
    // Validate request để đảm bảo params truyền lên đủ yêu cầu
    const error = await validateData(req);
    if (!typeForPartner) {
      typeForPartner = "";
    }
    if (error) {
      return res.badRequest(error);
    }
    try {
      // let newCyLinders = [];
      // let _infoCylinders = [];
      // let time = [];
      let _infoCylinders = [];
      if (type === "TURN_BACK") {
        _infoCylinders = await Cylinder.find({
          isDeleted: { "!=": true },
          id: { in: cylinders },
        });

        // Check những mã đã hồi lưu
        const currentCylinders = _.filter(_infoCylinders, (o) => {
          return (
            o.current === req.userInfo.id && o.placeStatus !== "DELIVERING"
          );
        });
        if (currentCylinders.length > 0) {
          return res.json(
            Utils.jsonErr(
              `Những mã này đã hồi lưu nên không thể hồi lưu tiếp : ${getArrayOfSerials(
                currentCylinders
              ).join(",")}`
            )
          );
        }

        // Tìm thông tin những bình đã đủ điều kiện hồi lưu
        // Được kiểm tra ở bước trước
        _infoSuccessCylinders = await Cylinder.find({
          isDeleted: { "!=": true },
          id: { in: successCylinders },
        });

        cylinders = cylinders.concat(successCylinders);
        _infoCylinders = _infoCylinders.concat(_infoSuccessCylinders);

        // Cập nhật lại số lượng bình
        numberOfCylinder = cylinders.length;
      } else {
        return res.badRequest(Utils.jsonErr("Wrong actionType"));
      }

      //
      if (turnBack_cylinerIneligible) {
        // Xuất những bình đang ở nơi khác:
        // + đã hồi lưu
        // + đang ở trạm khác
        // + đang ở nhà máy khác

        //
        const notDeliveringCylinder = [
          ...turnBack_cylinerIneligible.errCyl_current,
          ...turnBack_cylinerIneligible.errCyl_inFactory,
          ...turnBack_cylinerIneligible.errCyl_inFixer,
        ];

        // Tìm thông tin bình đang ở nơi khác
        const info_notDeliveringCylinder = await Cylinder.find({
          isDeleted: { "!=": true },
          serial: { in: notDeliveringCylinder },
        }).populate("duplicateCylinders");

        const _listIdFromInfo = getArrayOfIds(_infoCylinders);
        // Xóa mã bình bị trùng lặp ở cylinder (chứa danh sách bình trùng đạt yêu cầu)
        _.remove(info_notDeliveringCylinder, (o) => {
          if (!o.duplicateCylinders) return false;
          if (o.duplicateCylinders.length === 0) return false;

          return (
            o.duplicateCylinders.findIndex((_dupCyl) =>
              _listIdFromInfo.includes(_dupCyl.copy)
            ) !== -1
          );
        });

        // if (info_removedCyl.length > 0) {
        //   const _listSerialFromInfo = getArrayOfSerials(info_removedCyl)

        //   _.remove(notDeliveringCylinder, o => {
        //     return _listSerialFromInfo.findIndex(_serial => {
        //       _serial === o
        //     }) !== -1
        //   })
        // }

        // --- GROUP cylinder theo current ---
        const group = await groupByArray(info_notDeliveringCylinder, "current");

        // -- Xử lý cho từng nhóm --
        await Promise.all(
          group.map(async (eachGroup) => {
            const listCylindersId = await getCylindersId(eachGroup.values);

            // Xuất ra khỏi nơi đang giữ bình
            const resultExport = await History.create({
              driver: "Không xác định",
              license_plate: "Không xác định",
              cylinders: listCylindersId,
              signature: "EXPORT_005",
              idDriver: null,
              from: eachGroup.key,
              to: to,
              type: "EXPORT",
              toArray: [to],
              numberArray: [eachGroup.values.length.toString()],
              numberOfCylinder: eachGroup.values.length,
              // cylindersWithoutSerial,
              amount: 0,
              // saler,
              typeForPartner: "BUY",
              // exportByDriver,
              // turnbackByDriver,
              importExportBySystem: true, // Xác định xử lý xuất nhập bởi hệ thống
              createdBy: req.userInfo.id,
            });
            // Tạo bản ghi tương ứng trong collection CylinderImex
            const _idImex = Date.now();
            await Promise.all(
              eachGroup.values.map(async (cylinder) => {
                await CylinderImex.create({
                  cylinder: cylinder.id,
                  status: cylinder.status,
                  condition: cylinder.classification.toUpperCase(),
                  idImex: _idImex,
                  typeImex: "OUT",
                  flow: "TRANSITION",
                  flowDescription: "BY_SYSTEM",
                  category: cylinder.category,
                  manufacture: cylinder.manufacture,
                  createdBy: req.userInfo.id,
                  objectId: eachGroup.key,
                  history: resultExport.id,
                });
              })
            );
          })
        );

        // Tìm thông tin bình đang vận chuyển
        const info_deliveringCylinder = await Cylinder.find({
          isDeleted: { "!=": true },
          serial: { in: turnBack_cylinerIneligible.errCyl_delivering },
        }).populate("duplicateCylinders");

        // const _listIdFromInfo = getArrayOfIds(_infoCylinders)
        // Xóa mã bình bị trùng lặp ở cylinder (chứa danh sách bình trùng đạt yêu )
        _.remove(info_deliveringCylinder, (o) => {
          if (!o.duplicateCylinders) return false;
          if (o.duplicateCylinders.length === 0) return false;

          return (
            o.duplicateCylinders.findIndex((_dupCyl) =>
              _listIdFromInfo.includes(_dupCyl.copy)
            ) !== -1
          );
        });

        const _listIds_Delivering = await getCylindersId(
          info_deliveringCylinder
        );
        const _listIds_notDelivering = await getCylindersId(
          info_notDeliveringCylinder
        );

        // const _listIds = await getCylindersId(
        //   [...info_deliveringCylinder, ...info_notDeliveringCylinder,]
        // )
        const _listIds = [..._listIds_Delivering, ..._listIds_notDelivering];

        cylinders = cylinders.concat(_listIds);
        _infoCylinders = [
          ..._infoCylinders,
          ...info_deliveringCylinder,
          ...info_notDeliveringCylinder,
        ];

        // Cập nhật lại danh sách cylinderImex để ghi vào collecion CylinderImex
        // + Trường hợp đang vận chuyển
        _listIds_Delivering.forEach((elementId) => {
          cylinderImex.push({
            condition: "OLD",
            id: elementId,
            status: "EMPTY",
            isDelivering: true,
          });
        });
        // + Trường hợp không vận chuyển
        // Đã xử lý: Xuất ra khỏi nơi đang giữ bình
        // Bình chuyển trạng thái thành đang vận chuyển
        _listIds_notDelivering.forEach((elementId) => {
          cylinderImex.push({
            condition: "OLD",
            id: elementId,
            status: "EMPTY",
            isDelivering: true,
          });
        });

        // Uniq
        cylinders = _.uniq(cylinders);
        cylinderImex = _.uniqBy(cylinderImex, "id");

        // Cập nhật lại số lượng bình
        numberOfCylinder = cylinders.length;
      }

      let amount = 0;

      let result = await History.create({
        driver,
        license_plate,
        cylinders,
        signature,
        idDriver: idDriver ? idDriver : null,
        from,
        to,
        type,
        toArray,
        numberArray,
        numberOfCylinder,
        cylindersWithoutSerial,
        amount,
        // saler,
        typeForPartner,
        exportByDriver,
        turnbackByDriver,
        createdBy: req.userInfo.id,
      }).fetch();

      if (result) {
        const history = await History.findOne({
          isDeleted: { "!=": true },
          id: result.id,
        }).populate("cylinders");

        await Log.create({
          inputData: JSON.stringify(req.body),
          cylinders: history.cylinders,
          // cylindersBody,
          // notDupAndCantExportBody,
          type: "HISTORY_LOG_0004",
          content: "Log kiem tra",
          historyType: type,
          history: result.id,
          createBy: req.userInfo.id,
          status: true,
        });
      }

      // Kiểm tra from to và type của history để set placeStatus
      let placeStatus = "IN_FACTORY";
      let current = null;
      let status = "EMPTY";
      let pushGas = false;

      try {
        toModel = await User.findOne({ isDeleted: { "!=": true }, id: to });
        if (type !== "TURN_BACK" && !!from) {
          fromModel = await User.findOne({
            isDeleted: { "!=": true },
            id: from,
          });
        }
      } catch (e) {
        await Log.create({
          inputData: JSON.stringify(req.body),
          // inputData: req.body,
          type: "HISTORY_ERROR_0018",
          content: e.message,
          status: false,
        });
      }
      if (type === "TURN_BACK") {
        // Nhà máy nhận bình trả về
        if (toModel.userType === "Factory") {
          placeStatus = "IN_FACTORY";
        }
        current = to;
      }

      let updateForm = {
        placeStatus: placeStatus,
        current: current,
      };

      if (exportPlace) {
        updateForm.exportPlace = exportPlace;
      }

      if (type === "TURN_BACK") {
        updateForm.exportPlace = null;
      }

      if (!result) {
        await Log.create({
          inputData: JSON.stringify(req.body),
          // inputData: req.body,
          type: "HISTORY_ERROR_0019",
          content: "Không ghi được lịch sử",
          status: false,
        });

        return res.badRequest(Utils.jsonErr(result.err));
      }
      let resultUpdated = null;
      // Update placeStatus của những bình truyền lên
      if (pushGas) {
        updateForm.status = status;
      }

      if (type === "TURN_BACK") {
        let db = Cylinder.getDatastore().manager;

        // Convert cylinders type
        // string[] => ObjectId[]
        const cylinderObjectId = await converToObjectId(cylinders);

        resultUpdated = await db.collection("cylinder").update(
          { _id: { $in: cylinderObjectId } },
          {
            $inc: { circleCount: 1 },
            $set: updateForm,
          },
          { multi: true }
        );
      } else {
        resultUpdated = await Cylinder.update({
          isDeleted: { "!=": true },
          _id: { in: cylinders },
        })
          .set(updateForm)
          .fetch();
      }

      if (!resultUpdated) {
        await Log.create({
          inputData: JSON.stringify(req.body),
          // inputData: req.body,
          type: "HISTORY_ERROR_0020",
          content: "Không cập nhật được thông tin bình",
          status: false,
        });

        return res.badRequest(Utils.jsonErr(result.err));
      }

      // returnGas
      if (type === "TURN_BACK") {
        let { cylindersReturn, createBy } = req.body;

        if (cylindersReturn) {
          const dateReceived = Date();
          const length_returnGas = cylindersReturn.length;
          let data_returnGas = [];

          if (length_returnGas > 0) {
            for (let i = 0; i < length_returnGas; i++) {
              data_returnGas[i] = await returnGas
                .create({
                  serialCylinder: cylindersReturn[i].serial,
                  idCylinder: cylindersReturn[i].id,
                  dateReceived: dateReceived,
                  weight: cylindersReturn[i].weight,
                  //idCompany: createBy,
                  //createBy: createBy
                })
                .fetch();
            }

            // console.log("data_returnGas_mobile", data_returnGas);

            // return res.json({ error: false, data: data });
          }
        } else {
          const dateReceived = Date();
          const length_returnGas = cylinders.length;
          let data_returnGas = [];
          try {
            if (length_returnGas > 0) {
              for (let i = 0; i < length_returnGas; i++) {
                let cylWeight = await Cylinder.findOne({
                  isDeleted: { "!=": true },
                  id: cylinders[i],
                });
                //console.log('cylWeight.weight', cylWeight.weight)
                data_returnGas[i] = await returnGas
                  .create({
                    serialCylinder: cylWeight.serial,
                    idCylinder: cylWeight.id,
                    dateReceived: dateReceived,
                    weight: cylWeight.weight,
                    //idCompany: createBy,
                    //createBy: createBy
                  })
                  .fetch();
              }

              // console.log("data_returnGas_web", data_returnGas);

              // return res.json({ error: false, data: data });
            }
          } catch (err) {
            await Log.create({
              inputData: JSON.stringify(req.body),
              // inputData: req.body,
              type: "HISTORY_ERROR_0021",
              content: err.message,
              status: false,
            });

            return res.created("err_messaga", err.message);
          }
        }
        // else {
        //   return res.json({ error: true, message: 'Khong co binh nao' });
        // }
      }
      // Sau khi ghi vào bảng History và cập nhật lại trạng thái bình thành công
      // Ghi tiếp vào bảng CylinderImex
      if (typeImex) {
        // let start = new Date().getTime();
        const _idImex = Date.now();
        let dataForCreate = [];
        let dataForGiveback = [];

        await Promise.all(
          cylinderImex.map(async (cylinder) => {
            const cylinderInfo = await _infoCylinders.find(
              (_cylinder) => _cylinder.id === cylinder.id
            );

            dataForCreate.push({
              cylinder: cylinder.id,
              status: cylinder.status ? cylinder.status : "FULL",
              condition: cylinderInfo.classification
                ? cylinderInfo.classification.toUpperCase()
                : "OLD",
              idImex: _idImex,
              typeImex: typeImex,
              flow: flow,
              category: cylinderInfo ? cylinderInfo.category : null,
              manufacture: cylinderInfo ? cylinderInfo.manufacture : null,
              createdBy: req.userInfo.id,
              objectId: req.userInfo.id,
              history: result.id,
            });

            if (type === "TURN_BACK" && !cylinder.isDelivering) {
              dataForGiveback.push({
                cylinder: cylinder.id,
                status: cylinder.status ? cylinder.status : "EMPTY",
                condition: cylinderInfo.classification
                  ? cylinderInfo.classification.toUpperCase()
                  : "OLD",
                idImex: _idImex,
                typeImex: "OUT",
                flow: "GIVE_BACK",
                flowDescription: "RETURN",
                category: cylinderInfo ? cylinderInfo.category : null,
                manufacture: cylinderInfo ? cylinderInfo.manufacture : null,
                createdBy: req.userInfo.id,
                objectId: cylinderInfo.current,
                history: result.id,
              });
            }
          })
        );

        if (dataForGiveback.length > 0) {
          await CylinderImex.createEach(dataForGiveback);
        }

        if (dataForCreate.length > 0) {
          await CylinderImex.createEach(dataForCreate);
        }
      }

      // result.time = time

      return res.created(result);
      //}
    } catch (error) {
      await Log.create({
        inputData: JSON.stringify(req.body),
        // inputData: req.body,
        type: "HISTORY_ERROR_0022",
        content: error.message,
        status: false,
      });

      return res.badRequest(Utils.jsonErr(error.message));
    }
  },
  getHistoriesByType: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty query"));
    }

    const { to_or_from, id_user, id_saler, type, startDate, endDate } =
      req.query;

    // Phân trang
    let page = parseInt(req.query.page);
    if (!page) {
      page = 1;
    }

    let limit = parseInt(req.query.limit);
    if (!limit) {
      limit = 10;
    }

    const skip = limit * (page - 1);

    //
    const TOFROM = ["to", "from"];
    const TYPE = ["EXPORT", "IMPORT", "SALE", "TURN_BACK"];

    if (!TOFROM.includes(to_or_from)) {
      return res.badRequest(Utils.jsonErr("to_or_from is required"));
    }

    if (!id_user) {
      return res.badRequest(Utils.jsonErr("id_user is required"));
    }

    if (!type) {
      return res.badRequest(Utils.jsonErr("type is required"));
    }

    try {
      let returnData = {
        status: false,
        resCode: "",
        data: [],
        count: 0,
        message: "",
      };

      const _type = type.split(",");
      const notInType = _type.findIndex((type) => !TYPE.includes(type));

      if (notInType >= 0) {
        return res.badRequest(Utils.jsonErr("type is wrong"));
      }

      let criteria = {
        [to_or_from]: id_user,
        type: { in: _type },
        importExportBySystem: false,
      };
      // lấy trong khoảng thời gian
      let _object = {};
      if (startDate) {
        _criteria = Object.assign(
          criteria,
          (_object = {
            createdAt: { ">=": startDate, "<=": endDate },
          })
        );
      }
      if (id_saler) criteria.saler = id_saler;
      const count = await History.count({ where: criteria });
      if (count > 0) {
        returnData.count = count;

        if (count < limit) {
          limit = count;
        } else if (count > limit) {
          const remainResult = count - skip;
          if (remainResult < limit) {
            limit = remainResult;
          }
        }

        let dataHistories = [];

        if (_type.includes("SALE")) {
          dataHistories = await History.find({
            isDeleted: { "!=": true },
            where: criteria,
            limit,
            skip,
          })
            // .populate('from')
            // .populate('to')
            .populate("saler")
            .populate("customer")
            .populate("cylinders")
            .populate("idDriver")
            .sort("createdAt DESC");
        } else {
          dataHistories = await History.find({
            isDeleted: { "!=": true },
            where: criteria,
            limit,
            skip,
          })
            .populate("from")
            .populate("to")
            .populate("toArray")
            .populate("saler")
            .populate("customer")
            .populate("idDriver")
            .sort("createdAt DESC");
        }

        // if (to_or_from === 'to') {
        //   await Promise.all(dataHistories.map(async (history, index) => {
        //     const userInfo_toFrom = await User.findOne({isDeleted: {"!=": true}, id: history.from })
        //       .populate('isChildOf')

        //     dataHistories[index].from = userInfo_toFrom
        //   }))
        // }

        returnData.data = dataHistories;
        returnData.status = true;
        returnData.resCode = "SUCCESS-00025";
        returnData.message = "Tìm thấy thông tin";
      } else {
        returnData.status = true;
        returnData.resCode = "ERROR-00097";
        returnData.message = "Không tìm thấy kết quả nào";
      }

      return res.json(returnData);
    } catch (error) {
      return res.serverError("Gặp lỗi khi lấy thông tin xuất nhập");
    }
  },

  // Hồi lưu bình đầy
  returnCylinders: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      actionType,
      driver,
      idDriver,
      license_plate,
      reason,
      signature,
      //
      exportByDriver,
      turnbackByDriver,
    } = req.body;

    let { cylinders } = req.body;

    const userInfo = req.userInfo;

    if (actionType !== "RETURN") {
      return res.badRequest(Utils.jsonErr("Wrong actionType"));
    }

    let numberOfCylinder = 0;
    if (!!req.body.cylinders) {
      numberOfCylinder = req.body.cylinders.length;
    }

    let toModel;
    // // Validate request để đảm bảo params truyền lên đủ yêu cầu
    // const error = await validateData(req);
    // if (error) {return res.badRequest(error);}

    if (userInfo.userRole === "Deliver") {
      // Tìm thông tin công ty của tài xế
      const org = User.findOne({
        isDeleted: { "!=": true },
        _id: userInfo.isChildOf,
      });

      if (!org)
        return res.badRequest(
          Utils.jsonErr("Không xác định được nơi sẽ hồi lưu về")
        );

      toModel = org;
    } else {
      toModel = userInfo;
    }

    try {
      let _infoCylinders = [];

      if (actionType === "RETURN") {
        _infoCylinders = await Cylinder.find({
          isDeleted: { "!=": true },
          id: { in: cylinders },
        });

        if (_infoCylinders.length === 0) {
          return res.badRequest(Utils.jsonErr("Không tìm thấy mã bình nào"));
        }

        // Chỉ hồi lưu những bình Đang vận chuyển, ở Đại lý hoặc CHBL
        // Loại bỏ những trường hợp còn lại
        const notEligibleForReturn = _.remove(_infoCylinders, (o) => {
          return (
            o.placeStatus !== "DELIVERING" &&
            o.placeStatus !== "IN_GENERAL" &&
            o.placeStatus !== "IN_AGENCY"
          );
        });

        // if (notEligibleForReturn.length > 0) {
        //   returnData.success = false
        //   returnData.errCyl_notEligibleForReturn = getArrayOfSerials(notEligibleForReturn)
        // }

        // // Check những mã đang vận chuyển
        // const deliveringCylinders = _.filter(_infoCylinders, o => {
        //   return (o.placeStatus === 'DELIVERING');
        // });
        // // if (deliveringCylinders.length > 0) {
        // //   // Thêm vào cylinderImex
        // // }

        // Check những mã ở Đại Lý hoặc CHBL
        const cylindersInGNROrAGC = _.filter(_infoCylinders, (o) => {
          return (
            o.placeStatus === "IN_GENERAL" || o.placeStatus === "IN_AGENCY"
          );
        });
        // if (deliveringCylinders.length > 0) {
        //   // Thêm vào cylinderImex
        // }

        //
        if (cylindersInGNROrAGC.length > 0) {
          // Xuất những bình đang ở:
          // + đang ở Đại Lý
          // + đang ở CHBL

          // //
          // const notDeliveringCylinder = [
          //   ...turnBack_cylinerIneligible.errCyl_current,
          //   ...turnBack_cylinerIneligible.errCyl_inFactory,
          //   ...turnBack_cylinerIneligible.errCyl_inFixer,
          // ]
          // // Xóa mã bình bị trùng lặp ở cylinder (chứa danh sách bình trùng đạt yêu cầu)
          // _.remove(notDeliveringCylinder, o => {
          //   return _infoCylinders.findIndex(_cyl => _cyl.serial === o) !== -1;
          // })

          // // Tìm thông tin bình đang ở nơi khác
          // const info_notDeliveringCylinder = await Cylinder.find({isDeleted: {"!=": true},
          //   serial: { in: notDeliveringCylinder }
          // })

          // --- GROUP cylinder theo current ---
          const group = await groupByArray(cylindersInGNROrAGC, "current");

          // -- Xử lý cho từng nhóm --
          await Promise.all(
            group.map(async (eachGroup) => {
              const listCylindersId = await getCylindersId(eachGroup.values);

              // Xuất ra khỏi nơi đang giữ bình
              const resultExport = await History.create({
                driver: "Không xác định",
                license_plate: "Không xác định",
                cylinders: listCylindersId,
                signature: "EXPORT_007",
                idDriver: null,
                from: eachGroup.key,
                to: toModel.id,
                type: "EXPORT",
                toArray: [toModel.id],
                numberArray: [eachGroup.values.length.toString()],
                numberOfCylinder: eachGroup.values.length,
                // cylindersWithoutSerial,
                amount: 0,
                // saler,
                typeForPartner: "BUY",
                // exportByDriver,
                // turnbackByDriver,
                importExportBySystem: true, // Xác định xử lý xuất nhập bởi hệ thống
                createdBy: req.userInfo.id,
              });
              // Tạo bản ghi tương ứng trong collection CylinderImex
              const _idImex = Date.now();
              await Promise.all(
                eachGroup.values.map(async (cylinder) => {
                  await CylinderImex.create({
                    cylinder: cylinder.id,
                    status: "FULL",
                    condition: cylinder.classification.toUpperCase(),
                    idImex: _idImex,
                    typeImex: "OUT",
                    flow: "RETURN_FULLCYL",
                    flowDescription: "BY_SYSTEM",
                    category: cylinder.category,
                    manufacture: cylinder.manufacture,
                    createdBy: req.userInfo.id,
                    objectId: eachGroup.key,
                    history: resultExport.id,
                  });
                })
              );
            })
          );
        }

        // Cập nhật lại số lượng bình
        numberOfCylinder = _infoCylinders.length;

        // Cập nhật lại cylinders
        cylinders = await getCylindersId(_infoCylinders);
      } else {
        _infoCylinders = await Cylinder.find({
          isDeleted: { "!=": true },
          id: { in: cylinders },
        });

        // Cập nhật lại số lượng bình
        numberOfCylinder = _infoCylinders.length;

        // Cập nhật lại cylinders
        cylinders = await getCylindersId(_infoCylinders);
      }

      // try {
      let result = await History.create({
        driver,
        license_plate,
        cylinders,
        reason: reason ? reason : "",
        signature,
        idDriver: idDriver ? idDriver : null,
        from: null,
        to: toModel.id,
        type: actionType,
        // toArray,
        // numberArray,
        numberOfCylinder,
        // cylindersWithoutSerial,
        // amount,
        // saler,
        // typeForPartner,
        exportByDriver,
        turnbackByDriver,
        createdBy: req.userInfo.id,
      }).fetch();

      // if (result) {
      //   const history = await History.findOne({isDeleted: {"!=": true}, id: result.id })
      //     .populate('cylinders')

      //   await Log.create({
      //     inputData: JSON.stringify(req.body),
      //     cylinders: history.cylinders,
      //     // cylindersBody,
      //     // notDupAndCantExportBody,
      //     type: 'HISTORY_LOG_0003',
      //     content: 'Log kiem tra',
      //     historyType: type,
      //     history: result.id,
      //     createBy: req.userInfo.id,
      //     status: true
      //   });
      // }

      let placeStatus = "IN_FACTORY";
      let current = null;
      let status = "FULL";

      // try {
      //   if (!!to) {
      //     toModel = await User.findOne({isDeleted: {"!=": true},id: to});
      //   }

      //   if (type !== 'TURN_BACK' && !!from) {
      //     fromModel = await User.findOne({isDeleted: {"!=": true},id: from});
      //   }

      // }
      // catch (e) {
      //   await Log.create({
      //     inputData: JSON.stringify(req.body),
      //     // inputData: req.body,
      //     type: 'HISTORY_ERROR_0005',
      //     content: e.message,
      //     status: false
      //   });
      // }

      if (actionType === "RETURN") {
        // Trạm nhận bình trả về
        if (toModel.userType === "Factory") {
          placeStatus = "IN_FACTORY";
          //status = 'EMPTY';
          //pushGas=true;
        }
        current = toModel.id;
      }

      let updateForm = {
        placeStatus: placeStatus,
        current: current,
        status: status,
        //updateBy: idUser
      };

      if (actionType === "RETURN") {
        updateForm.exportPlace = null;
      }

      if (!result) {
        await Log.create({
          inputData: JSON.stringify(req.body),
          // inputData: req.body,
          type: "HISTORY_ERROR_0023",
          content: "Không ghi được lịch sử",
          status: false,
        });

        return res.badRequest(Utils.jsonErr(result.err));
      }

      // Update trạng thái của những bình truyền lên
      await Cylinder.update({
        isDeleted: { "!=": true },
        _id: { in: cylinders },
      }).set(updateForm);

      // Sau khi ghi vào bảng History và cập nhật lại trạng thái bình thành công
      // Ghi tiếp vào bảng CylinderImex
      // if (typeImex) {
      const _idImex = Date.now();

      await Promise.all(
        _infoCylinders.map(async (cylinder) => {
          await CylinderImex.create({
            cylinder: cylinder.id,
            status: "FULL",
            condition: cylinder.classification
              ? cylinder.classification.toUpperCase()
              : "OLD",
            idImex: _idImex,
            typeImex: "IN",
            flow: "RETURN_FULLCYL",
            category: cylinder.category,
            manufacture: cylinder.manufacture,
            createdBy: req.userInfo.id,
            objectId: toModel.id,
            history: result.id,
          });
        })
      );
      // }

      return res.created(result);
      //}
    } catch (error) {
      await Log.create({
        inputData: JSON.stringify(req.body),
        // inputData: req.body,
        type: "HISTORY_ERROR_0024",
        content: error.message,
        status: false,
      });

      return res.badRequest(Utils.jsonErr(error.message));
    }
  },
};

function getArrayOfSerials(cylinders) {
  return cylinders.map((cylinder) => {
    return cylinder.serial;
  });
}

function getArrayOfIds(cylinders) {
  return cylinders.map((cylinder) => {
    return cylinder.id;
  });
}

async function groupByArray(xs, key) {
  return xs.reduce(function (rv, x) {
    let v = key instanceof Function ? key(x) : x[key];
    let el = rv.find((r) => r && r.key === v);
    if (el) {
      el.values.push(x);
    } else {
      rv.push({
        key: v,
        values: [x],
      });
    }
    return rv;
  }, []);
}

async function converToObjectId(stringArray) {
  return stringArray.map((stringElm) => {
    return mongoose.Types.ObjectId(stringElm);
  });
}

// ************* Get list cylinder Id ************
const getCylindersId = async function (cylinders) {
  const result = await Promise.all(
    cylinders.map(async (cylinder) => {
      return cylinder.id;
    })
  );
  return result;
};
