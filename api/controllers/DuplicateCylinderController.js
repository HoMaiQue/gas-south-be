/**
 * DuplicateCylinderController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const _ = require("lodash");
const LogType = require("../constants/LogType");
const USER_TYPE = require("../constants/UserTypes");
const USER_ROLE = require("../constants/UserRoles");
// const { get } = require('grunt');

module.exports = {
  createDuplicate: async function (req, res) {
    const body = req.body;
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    if (req.userInfo.userType !== "Factory") {
      return res.badRequest(Utils.jsonErr("Bạn không có đủ thẩm quyền"));
    }

    try {
      const exitsCylinder = await Cylinder.findOne({
        isDeleted: { "!=": true },
        where: { serial: body.serial /* , manufacture: body.manufacture */ },
      });
      if (exitsCylinder) {
        if (!req.userInfo.prefix) {
          return res.badRequest(
            Utils.jsonErr("Đơn vị chưa khai báo mã tiền tố")
          );
        }

        // Thêm tiền tố mã đơn vị vào serial
        const _serial = req.userInfo.prefix + body.serial;

        // Kiểm tra trùng mã trong cùng đơn vị
        const exitsDuplicateCylinder = await Cylinder.findOne({
          isDeleted: { "!=": true },
          where: { serial: _serial },
        });
        if (exitsDuplicateCylinder) {
          return res.badRequest(
            Utils.jsonErr("Không được khai báo trùng mã trong cùng một đơn vị")
          );
        }

        body.serial = _serial;
        body.prefix = req.userInfo.prefix;
        body.isDuplicate = true;
      }

      body.factory = req.userInfo.id;
      if (
        body.cylinderAt_childFactory === undefined ||
        !body.cylinderAt_childFactory
      ) {
        body.current = req.userInfo.id;
      } else {
        body.current = body.cylinderAt_childFactory;

        const fixerComp = await User.findOne({
          isDeleted: { "!=": true },
          id: body.cylinderAt_childFactory,
        });
        if (fixerComp.userType === "Fixer") body.placeStatus = "IN_REPAIR";
      }

      const cylinder = await Cylinder.create(body).fetch();

      if (cylinder && exitsCylinder) {
        // Cập nhật lại thông tin bình bị trùng
        await Cylinder.updateOne({
          isDeleted: { "!=": true },
          id: exitsCylinder.id,
        }).set({ hasDuplicate: true });

        // Tạo thêm bản ghi bình trùng, bên collection DuplicateCylinder
        await DuplicateCylinder.create({
          serial: cylinder.serial,
          duplicate: exitsCylinder.id,
          copy: cylinder.id,
        });
      }

      const test11 = await Cylinder.findOne({
        isDeleted: { "!=": true },
        id: exitsCylinder.id,
      })
        .populate("duplicateCylinders")
        .populate("copyCylinder");

      const test22 = await Cylinder.findOne({
        isDeleted: { "!=": true },
        id: cylinder.id,
      })
        .populate("duplicateCylinders")
        .populate("copyCylinder");

      // Ghi tiếp vào bảng CylinderImex
      let condition = "";
      if (!cylinder.classification) {
        const record = await CylinderImex.find({
          isDeleted: { "!=": true },
          cylinder: cylinder.id,
        }).sort("createdAt DESC");

        if (record.length > 0) {
          condition = record[0].condition;
        } else {
          condition = "NEW";
        }
      }

      await CylinderImex.create({
        cylinder: cylinder.id,
        status: "EMPTY",
        condition: cylinder.classification
          ? cylinder.classification.toUpperCase()
          : condition,
        idImex: Date.now(),
        typeImex: "IN",
        flow: "CREATE",
        flowDescription: "DECLARE",
        category: req.body.category ? req.body.category : null,
        manufacture: req.body.manufacture ? req.body.manufacture : null,
        createdBy: req.userInfo.id,
        objectId: req.userInfo.id,
        // history: null,
      });

      return res.created(cylinder);
    } catch (err) {
      return res.serverError(Utils.jsonErr(err));
    }
  },

  // Tạo bình dưới công ty con, chi nhánh trực thuộc
  importDuplicateFromSubsidiary: async function (req, res) {
    const user = req.userInfo;

    if (!(user.userType === "Factory" || user.userType === "Fixer")) {
      return res.badRequest(Utils.jsonErr("Bạn không có đủ thẩm quyền"));
    }

    if (!user.prefix) {
      return res.badRequest(Utils.jsonErr("Đơn vị chưa khai báo mã tiền tố"));
    }

    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      listCylinders, // Danh sách mã trùng
      classification,
      manufacture,
      category,
    } = req.body;

    if (!listCylinders) {
      return res.badRequest(
        Utils.jsonErr("Dữ liệu truyền lên thiếu danh sách mã bình trùng")
      );
    }

    if (!Array.isArray(listCylinders)) {
      return res.badRequest(
        Utils.jsonErr("Cấu trúc danh sách mã bình trùng gửi lên bị sai.")
      );
    }

    if (!classification) {
      return res.badRequest(
        Utils.jsonErr('Dữ liệu truyền lên chưa "phân loại".')
      );
    }

    if (!manufacture) {
      return res.badRequest(
        Utils.jsonErr('Dữ liệu truyền lên chưa có "thương hiệu".')
      );
    }

    if (!category) {
      return res.badRequest(
        Utils.jsonErr('Dữ liệu truyền lên chưa có "loại bình".')
      );
    }

    // req.file('upload_file').upload({
    //     dirname: require('path').resolve(sails.config.appPath, 'excel/')
    // }, async (err, files) => {
    //     if (err) { return res.serverError(err); }

    try {
      // Tìm parentRoot
      const parent = await getRootParent(user.isChildOf);

      const availableManufacture = await Manufacture.findOne({
        isDeleted: { "!=": true },
        where: { owner: parent, id: manufacture },
      });
      if (!availableManufacture) {
        return res.badRequest(
          Utils.jsonErr(
            `Thương hiệu ${manufacture} không có trên hệ thống của bạn.`
          )
        );
      }

      const isExistCategory = await CategoryCylinder.findOne({
        isDeleted: { "!=": true },
        id: category,
      });
      if (!isExistCategory) {
        return res.badRequest(
          Utils.jsonErr(
            `Không tìm thấy loại bình với id = ${category} trong hệ thống`
          )
        );
      }

      const result =
        await DuplicateCylinderService.createDuplicateCylinderFromSubsidiary(
          listCylinders,
          user.id,
          classification,
          manufacture,
          category,
          parent,
          user.userType,
          user.prefix
        );
      const content =
        result.body.length > 0
          ? "Nhập dữ liệu bình trùng thành công."
          : result.err;
      await Log.create({
        type: LogType.IMPORT_EXCEL_CYLINDER_ACTION,
        content,
        status: result.status,
      });
      return res.ok({
        status: result.status,
        err: result.status ? "" : result.err,
        resCode: result.resCode,
        duplicateCylinders: result.duplicateCylinders,
      });
    } catch (err) {
      try {
        await Log.create({
          type: LogType.IMPORT_EXCEL_CYLINDER_ACTION,
          content: err.message,
          status: false,
        });
      } catch (error) {}
      // return res.serverError(Utils.jsonErr(err.message));
      return res.serverError(Utils.jsonErr("Gặp lỗi khi tạo mã trùng"));
    }
    // });
  },

  ExportDuplicateCylinder: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      driver,
      license_plate,
      from,
      toArray,
      to,
      // cylindersWithoutSerial
      successCylinders, // Danh sách bình đạt yêu cầu
      type,
      numberArray,
      idDriver,
      signature,
      saler,
      exportByDriver,
      turnbackByDriver,
      // cylinderImex,
      idImex,
      typeImex,
      flow,
    } = req.body;

    let {
      cylinders, // [id...] bình trùng
      notDupAndCantExport, // Bình không đạt điều kiện xuất
      cylinderImex,
      typeForPartner,
    } = req.body;

    let numberOfCylinder = 0;
    let cylindersWithoutSerial = !!req.body.cylindersWithoutSerial
      ? req.body.cylindersWithoutSerial
      : 0;

    if (!Array.isArray(cylinders)) {
      return res.badRequest(Utils.jsonErr("Wrong cylinders type"));
    }

    if (cylinders.length > 0) {
      numberOfCylinder = cylinders.length;
    } else {
      return res.badRequest(Utils.jsonErr("Empty cylinders"));
    }

    if (cylindersWithoutSerial !== 0) {
      numberOfCylinder += cylindersWithoutSerial;
    }

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

    try {
      // let newCyLinders = [];
      // let _infoCylinders = [];
      // let time = [];

      let cylinerEligible = [];
      let cylinerIneligible = [];
      let _infoCylinders = [];
      let _infoDupCylEligible = [];
      let exportPlace;

      let cylindersBody = [];
      let notDupAndCantExportBody = [];

      if (type === "EXPORT") {
        // let startCheck = Date.now();
        _infoCylinders = await Cylinder.find({
          isDeleted: { "!=": true },
          id: { in: cylinders },
        }).populate("duplicateCylinders");

        _infoCylinders = await Promise.all(
          _infoCylinders.map(async (cylinder) => {
            if (cylinder.duplicateCylinders.length > 0) {
              cylinder.duplicateCylinders = await Promise.all(
                cylinder.duplicateCylinders.map(async (dupCylinder) => {
                  return await Cylinder.findOne({
                    isDeleted: { "!=": true },
                    id: dupCylinder.copy,
                  });
                })
              );
            }

            cylindersBody.push({ ...cylinder });

            return cylinder;
          })
        );

        // Ghi log lại các bình
        if (notDupAndCantExport.length > 0) {
          notDupAndCantExportBody = await Cylinder.find({
            isDeleted: { "!=": true },
            serial: { in: notDupAndCantExport },
          });
        }

        let number = 0;
        await Promise.all(
          _infoCylinders.map(async (cylinder) => {
            number++;
            let cylinerEligibleExport;
            // try {
            console.log("::: cylinder ::: ", cylinder, number);
            cylinerEligibleExport = cylinder.duplicateCylinders.find(
              (cyl) =>
                cyl.current === from &&
                cyl.placeStatus !== "DELIVERING" &&
                cyl.placeStatus !== "IN_CUSTOMER"
            );
            // } catch (error) {
            //     console.log('::: ERROR ::: ', cylinder, number)
            // }

            if (cylinerEligibleExport) {
              _infoDupCylEligible.push(cylinerEligibleExport);
              cylinerEligible.push(cylinerEligibleExport.id);

              // Thay đổi id của bình ghi vào bảng CylinderImex
              const _index = cylinderImex.findIndex(
                (cylImex) => cylImex.id === cylinder.id
              );

              if (_index >= 0) {
                cylinderImex[_index].id = cylinerEligibleExport.id;
              }

              // Xóa thông tin bình tương ứng ở tab bình không đạt
              const index = notDupAndCantExport.findIndex((serial) => {
                return serial === cylinder.serial;
              });
              if (index > -1) {
                notDupAndCantExport.splice(index, 1);
              }
            } else {
              cylinerIneligible.push(cylinder);

              // Xóa thông tin bình tương ứng ở tab bình không đạt
              const _index = notDupAndCantExport.findIndex((serial) => {
                return serial === cylinder.serial;
              });
              if (_index > -1) {
                notDupAndCantExport.splice(_index, 1);
              }

              // Xóa thông tin bình tương ứng ở cylinderImex
              const index = cylinderImex.findIndex((element) => {
                return element.id === cylinder.id;
              });
              if (index > -1) {
                cylinderImex.splice(index, 1);
              }
            }
          })
        );

        // if (cylinerIneligible.length > 0) {
        //     return res.json({
        //         err_msg: `Có ${cylinerIneligible.length} bình không đủ điều kiện xuất`,
        //         err_cylinders: cylinerIneligible,
        //     });
        // }
        // else {
        cylinders = cylinerEligible;
        // }

        // Tìm thông tin những bình đã đủ điều kiện xuất hàng
        // Được kiểm tra ở bước trước
        _infoSuccessCylinders = await Cylinder.find({
          isDeleted: { "!=": true },
          id: { in: successCylinders },
        });

        cylinders = cylinders.concat(successCylinders);
        // _infoCylinders = _infoCylinders.concat(_infoSuccessCylinders)
        _infoCylinders = [..._infoDupCylEligible, ..._infoSuccessCylinders];

        // Cập nhật lại số lượng bình
        numberOfCylinder = cylinders.length;
      } else {
        return res.badRequest(Utils.jsonErr("Wrong actionType"));
      }

      // Tìm thông tin những bình không đạt
      const _infoNotDupAndCantExport = await Cylinder.find({
        isDeleted: { "!=": true },
        serial: { in: notDupAndCantExport },
        // hasDuplicate: { '!=': true },
      });

      cylinerIneligible = _.union(cylinerIneligible, _infoNotDupAndCantExport);
      // cylinerIneligible = _.difference(cylinerIneligible, _infoCylinders)

      // Xử lý những bình không đạt yêu cầu xuất hàng
      if (cylinerIneligible.length > 0) {
        const _infoCylinderIneligible = [...cylinerIneligible];

        // Tìm những bình đang vận chuyển
        const deliveringCylindersFrom = _.remove(cylinerIneligible, (o) => {
          return o.placeStatus === "DELIVERING";
        });
        if (deliveringCylindersFrom.length > 0) {
          // --- GROUP cylinder theo current ---
          const group = await groupByArray(deliveringCylindersFrom, "current");

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
                  signature: "TURN_BACK_003",
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
                  signature: "IMPORT_001",
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
                    objectId: req.userInfo.id,
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
            signature: "TURN_BACK_001",
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
                objectId: req.userInfo.id,
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
              // Uniq
              // eachGroup.values = _.uniq(eachGroup.values);
              eachGroup.values = _.uniqBy(eachGroup.values, "id");

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
                  signature: "TURN_BACK_004",
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
                  signature: "EXPORT_001",
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
                  signature: "IMPORT_002",
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
        idDriver,
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
          cylindersBody,
          notDupAndCantExportBody,
          type: "HISTORY_LOG_0001",
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
        // toModel = await User.findOne({isDeleted: {"!=": true}, id: to });
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
          type: "HISTORY_ERROR_0006",
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
            })
              .set({ customer: customer.id, saler: req.userInfo.id })
              .fetch();
          }
        } catch (e) {
          await Log.create({
            inputData: JSON.stringify(req.body),
            // inputData: req.body,
            type: "HISTORY_ERROR_0007",
            content: e.message,
            status: false,
          });
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

      if (!result) {
        await Log.create({
          inputData: JSON.stringify(req.body),
          // inputData: req.body,
          type: "HISTORY_ERROR_0008",
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
      resultUpdated = await Cylinder.update({
        isDeleted: { "!=": true },
        _id: { in: cylinders },
      })
        .set(updateForm)
        .fetch();

      if (!resultUpdated) {
        await Log.create({
          inputData: JSON.stringify(req.body),
          // inputData: req.body,
          type: "HISTORY_ERROR_0009",
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
              type: "HISTORY_ERROR_0010",
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
        // let _startTime = 0;
        // let _endTime = 0;
        // _startTime = Date.now();

        const _idImex = Date.now();
        let dataForCreate = [];

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
              status: cylinder.status ? cylinder.status : "FULL",
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
          })
        );

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

      // result.time = time

      return res.created(result);
      //}
    } catch (error) {
      await Log.create({
        inputData: JSON.stringify(req.body),
        // inputData: req.body,
        type: "HISTORY_ERROR_0011",
        content: error.message,
        status: false,
      });

      return res.badRequest(Utils.jsonErr(error.message));
    }
  },

  ImportDuplicateCylinder: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      driver,
      license_plate,
      from,
      toArray,
      to,
      // cylindersWithoutSerial
      successCylinders, // Danh sách bình đạt yêu cầu
      type,
      // typeForPartner,
      numberArray,
      idDriver,
      signature,
      saler,
      exportByDriver,
      turnbackByDriver,
      // cylinderImex,
      idImex,
      typeImex,
      flow,
    } = req.body;

    let {
      cylinders, // [id...] bình trùng
      notDupAndCantImport, // Bình không đạt điều kiện nhập
      cylinderImex,
      typeForPartner,
    } = req.body;

    let numberOfCylinder = 0;
    let cylindersWithoutSerial = !!req.body.cylindersWithoutSerial
      ? req.body.cylindersWithoutSerial
      : 0;

    if (!Array.isArray(cylinders)) {
      return res.badRequest(Utils.jsonErr("Wrong cylinders type"));
    }

    if (cylinders.length > 0) {
      numberOfCylinder = cylinders.length;
    } else {
      return res.badRequest(Utils.jsonErr("Empty cylinders"));
    }

    if (cylindersWithoutSerial !== 0) {
      numberOfCylinder += cylindersWithoutSerial;
    }

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

    try {
      // let newCyLinders = [];
      // let _infoCylinders = [];
      // let time = [];

      let cylinerEligible = [];
      let cylinerIneligible = [];
      let _infoCylinders = [];
      let _infoDupCylEligible = [];
      let exportPlace;

      let cylindersBody = [];
      let notDupAndCantImportBody = [];

      if (type === "IMPORT") {
        // let startCheck = Date.now();
        _infoCylinders = await Cylinder.find({
          isDeleted: { "!=": true },
          id: { in: cylinders },
        }).populate("duplicateCylinders");

        _infoCylinders = await Promise.all(
          _infoCylinders.map(async (cylinder) => {
            if (cylinder.duplicateCylinders.length > 0) {
              cylinder.duplicateCylinders = await Promise.all(
                cylinder.duplicateCylinders.map(async (dupCylinder) => {
                  return await Cylinder.findOne({
                    isDeleted: { "!=": true },
                    id: dupCylinder.copy,
                  }).populate("histories", {
                    where: {
                      type: "EXPORT",
                    },
                    limit: 1,
                    sort: "createdAt DESC",
                  });
                })
              );
            }

            cylindersBody.push({ ...cylinder });

            return cylinder;
          })
        );

        // Ghi log lại các bình
        if (notDupAndCantImport.length > 0) {
          notDupAndCantImportBody = await Cylinder.find({
            isDeleted: { "!=": true },
            serial: { in: notDupAndCantImport },
          });
        }

        await Promise.all(
          _infoCylinders.map(async (cylinder) => {
            let cylinderDelivering = cylinder.duplicateCylinders.filter(
              (cylinder) =>
                cylinder.placeStatus === "DELIVERING" &&
                cylinder.histories.length > 0
            );

            if (cylinderDelivering.length === 0) {
              cylinerIneligible.push(cylinder);

              // Xóa thông tin bình tương ứng ở tab bình không đạt
              const _index = notDupAndCantImport.findIndex((serial) => {
                return serial === cylinder.serial;
              });
              if (_index > -1) {
                notDupAndCantImport.splice(_index, 1);
              }

              // Xóa thông tin bình tương ứng ở cylinderImex
              const index = cylinderImex.findIndex((element) => {
                return element.id === cylinder.id;
              });
              if (index > -1) {
                cylinderImex.splice(index, 1);
              }
            } else {
              // Todo:
              // + Kiểm tra có lịch sử xuất hàng hay không?
              // + Kiểm tra có bị lỗi mất điểm đến khi xuất hàng hay không?

              cylinderDelivering = await Promise.all(
                cylinderDelivering.map(async (_cylinder) => {
                  _cylinder.histories = await Promise.all(
                    _cylinder.histories.map(async (history) => {
                      return await History.findOne({
                        isDeleted: { "!=": true },
                        id: history.id,
                      })
                        // .populate('to')
                        .populate("toArray");
                    })
                  );

                  return _cylinder;
                })
              );

              //
              const cylinderEligibleImport = cylinderDelivering.find(
                (cylinder) =>
                  _.find(cylinder.histories[0].toArray, (i) => {
                    return i.id === to;
                  })
              );

              if (cylinderEligibleImport) {
                _infoDupCylEligible.push(cylinderEligibleImport);
                cylinerEligible.push(cylinderEligibleImport.id);

                // Thay đổi id của bình ghi vào bảng CylinderImex
                const _index = cylinderImex.findIndex(
                  (cylImex) => cylImex.id === cylinder.id
                );

                if (_index >= 0) {
                  cylinderImex[_index].id = cylinderEligibleImport.id;
                }

                // Xóa thông tin bình tương ứng ở tab bình không đạt
                const index = notDupAndCantImport.findIndex((serial) => {
                  return serial === cylinder.serial;
                });
                if (index > -1) {
                  notDupAndCantImport.splice(index, 1);
                }
              } else {
                cylinerIneligible.push(cylinder);

                // Xóa thông tin bình tương ứng ở tab bình không đạt
                const _index = notDupAndCantImport.findIndex((serial) => {
                  return serial === cylinder.serial;
                });
                if (_index > -1) {
                  notDupAndCantImport.splice(_index, 1);
                }

                // Xóa thông tin bình tương ứng ở cylinderImex
                const index = cylinderImex.findIndex((element) => {
                  return element.id === cylinder.id;
                });
                if (index > -1) {
                  cylinderImex.splice(index, 1);
                }
              }
            }
          })
        );

        // if (cylinerIneligible.length > 0) {
        //     return res.json({
        //         err_msg: `Có ${cylinerIneligible.length} bình không đủ điều kiện nhập`,
        //         err_cylinders: cylinerIneligible,
        //     });
        // }
        // else {
        cylinders = cylinerEligible;
        // }

        // Tìm thông tin những bình đã đủ điều kiện nhập hàng
        // Được kiểm tra ở bước trước
        _infoSuccessCylinders = await Cylinder.find({
          isDeleted: { "!=": true },
          id: { in: successCylinders },
        });

        cylinders = cylinders.concat(successCylinders);
        // _infoCylinders = _infoCylinders.concat(_infoSuccessCylinders)
        _infoCylinders = [..._infoDupCylEligible, ..._infoSuccessCylinders];

        // Cập nhật lại số lượng bình
        numberOfCylinder = cylinders.length;
      } else {
        return res.badRequest(Utils.jsonErr("Wrong actionType"));
      }

      // Tìm thông tin những bình không đạt
      const _infoNotDupAndCantImport = await Cylinder.find({
        isDeleted: { "!=": true },
        serial: { in: notDupAndCantImport },
        // hasDuplicate: { '!=': true },
      });

      cylinerIneligible = _.union(cylinerIneligible, _infoNotDupAndCantImport);

      // Xử lý những bình không đạt yêu cầu nhập hàng
      if (cylinerIneligible.length > 0) {
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
                signature: "EXPORT_002",
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
          cylindersBody,
          notDupAndCantImportBody,
          type: "HISTORY_LOG_0002",
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
        //         notDupAndCantImportBody,
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
        //         notDupAndCantImportBody,
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
          type: "HISTORY_ERROR_0012",
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
            })
              .set({ customer: customer.id, saler: req.userInfo.id })
              .fetch();
          }
        } catch (e) {
          await Log.create({
            inputData: JSON.stringify(req.body),
            // inputData: req.body,
            type: "HISTORY_ERROR_0013",
            content: e.message,
            status: false,
          });
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

      if (!result) {
        await Log.create({
          inputData: JSON.stringify(req.body),
          // inputData: req.body,
          type: "HISTORY_ERROR_0014",
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
      resultUpdated = await Cylinder.update({
        isDeleted: { "!=": true },
        _id: { in: cylinders },
      })
        .set(updateForm)
        .fetch();

      if (!resultUpdated) {
        await Log.create({
          inputData: JSON.stringify(req.body),
          // inputData: req.body,
          type: "HISTORY_ERROR_0015",
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
              type: "HISTORY_ERROR_0016",
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
        // let _startTime = 0;
        // let _endTime = 0;
        // _startTime = Date.now();

        const _idImex = Date.now();
        let dataForCreate = [];

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
              status: cylinder.status ? cylinder.status : "FULL",
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
          })
        );

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

      // result.time = time

      return res.created(result);
      //}
    } catch (error) {
      await Log.create({
        inputData: JSON.stringify(req.body),
        // inputData: req.body,
        type: "HISTORY_ERROR_0017",
        content: error.message,
        status: false,
      });

      return res.badRequest(Utils.jsonErr(error.message));
    }
  },

  getExportPlace: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { duplicateCylinders } = req.body;

    try {
      const listDuplicateCylinders = duplicateCylinders.split(",");

      const infoCylinders = await Cylinder.find({
        isDeleted: { "!=": true },
        id: { in: listDuplicateCylinders },
      }).populate("histories", {
        where: {
          type: "EXPORT",
        },
        limit: 1,
        sort: "createdAt DESC",
      });

      // Danh sách user xuất hàng
      let listExportUser = [];
      await Promise.all(
        infoCylinders.map(async (cylinder) => {
          if (cylinder.histories.length > 0) {
            listExportUser.push(cylinder.histories[0].from);
          }
        })
      );
      if (listExportUser.length === 0) {
        return res.json({
          status: false,
          resCode: "ERROR-00047",
          message: "Không tìm thấy thông tin xuất hàng",
          data: [],
        });
      }
      // Loại bỏ user bị trùng
      const _exportUser = _.uniqWith(listExportUser, _.isEqual);

      // Thông tin user
      const exportUserInfo = await Promise.all(
        _exportUser.map(async (userId) => {
          let userInfo = await User.findOne({
            isDeleted: { "!=": true },
            id: userId,
          });
          userInfo.drivers = await User.find({
            isDeleted: { "!=": true },
            userRole: "Deliver",
            isChildOf: userInfo.id,
          });
          return userInfo;
        })
      );

      return res.json({
        status: true,
        resCode: "SUCCESS-00021",
        message: "Lấy thông tin điểm xuất thành công",
        data: exportUserInfo,
      });
    } catch (error) {
      return res.serverError(
        Utils.jsonErr("Gặp lỗi khi lấy danh sách điểm xuất")
      );
    }
  },

  //Hồi lưu bình trùng đủ điều kiện
  getDuplicateCylinder: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }
    const { id, actionType, to } = req.body;
    try {
      if (actionType === "TURN_BACK") {
        let getCylinder = [];
        arr = [];
        getCylinder = await Cylinder.find({
          isDeleted: { "!=": true },
          _id: id,
          hasDuplicate: true,
        }).populate([
          "duplicateCylinders",
          "current",
          "histories",
          "exportPlace",
        ]);
        let temp = getCylinder[0].placeStatus === "IN_CUSTOMER" ? 1 : 0;
        let duplicate = await Promise.all(
          getCylinder[0].duplicateCylinders.map(async (element) => {
            return await Cylinder.findOne({
              isDeleted: { "!=": true },
              _id: element.copy,
            }).populate(["manufacture", "current", "histories", "exportPlace"]);
          })
        );
        if (temp == 1) duplicate.push(getCylinder[0]);
        for (let i = 0; i < duplicate.length; i++) {
          if (
            duplicate[i].placeStatus !== "DELIVERING" ||
            duplicate[i].placeStatus !== "IN_REPAIR" ||
            duplicate[i].placeStatus !== "IN_FACTORY" ||
            duplicate[i].current !== to
          ) {
            arr.push(duplicate[i]);
          }
        }
        if (arr.length > 0) {
          res.json({ status: true, Cylinder: arr[0] });
        } else {
          res.json({ status: true, arr: [] });
        }
      }
    } catch (err) {
      res.json({ status: false, message: err.message });
    }
  },
  // xuất các bình trùng đủ điều kiện
  checkExport: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }
    const { id, actionType, from } = req.body;
    try {
      if (actionType === "EXPORT") {
        // // === TEST cho Hiếu Mobile ===
        // const _cylinders = await Cylinder.find({isDeleted: {"!=": true},
        //     // Bình ở 9999ct@gmail.com
        //     current: '5f5daafce683e22788470a72',
        //     placeStatus: 'IN_FACTORY',
        // }).limit(10);

        // if (_cylinders.length > 0) {
        //     res.json({ status: true, Cylinder: _cylinders[0] })
        // }
        // else {
        //     res.json({ status: false, Cylinder: {} })
        // }

        // === Code ban đầu ===
        // let getCylinder = [];
        arr = [];
        let getCylinder = await Cylinder.findOne({
          isDeleted: { "!=": true },
          _id: id,
          hasDuplicate: true,
        }).populate("duplicateCylinders");

        if (!getCylinder) return res.json({ status: false, Cylinder: {} });
        if (getCylinder.duplicateCylinders.length === 0)
          return res.json({ status: false, Cylinder: {} });

        for (let i = 0; i < getCylinder.duplicateCylinders.length; i++) {
          // if (getCylinder[i].placeStatus !== 'DELIVERING' || getCylinder[i].placeStatus !== 'IN_CUSTOMER'  || getCylinder[i].current === from) {
          //     arr.push(getCylinder[i]);
          // }
          const dupCylinderInfo = await Cylinder.findOne({
            isDeleted: { "!=": true },
            id: getCylinder.duplicateCylinders[i].copy,
          });
          if (dupCylinderInfo) {
            if (
              !["DELIVERING", "IN_CUSTOMER"].includes(
                dupCylinderInfo.placeStatus
              ) &&
              dupCylinderInfo.current === from
            ) {
              arr.push(getCylinder[i]);
              break;
            }
          }
        }

        if (arr.length > 0) {
          return res.json({ status: true, Cylinder: arr[0] });
        } else {
          return res.json({ status: false, Cylinder: {} });
        }
      }
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  importDupCylinder: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    const type = req.body.type;
    const driver = req.body.driver;
    const license_plate = req.body.license_plate;
    const cylinders = req.body.cylinders;
    let signature = req.body.signature;
    const idDriver = req.body.idDriver;
    let typeForPartner = req.body.typeForPartner;
    let from = req.body.from;
    let saler = req.body.saler;

    // Ghi vào bảng CylinderImex
    const { objectId, cylinderImex, idImex, typeImex, flow } = req.body;

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

    try {
      let newCyLinders = [];
      // let _infoCylinders = [];
      let time = [];

      let _infoCylinders = [];
      if (type === "EXPORT") {
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
      } else if (type === "IMPORT") {
        // let startCheck = Date.now();
        _infoCylinders = await Cylinder.find({
          isDeleted: { "!=": true },
          id: { in: cylinders },
        })
          .populate("histories", {
            where: {
              type: "EXPORT",
            },
            limit: 1,
            sort: "createdAt DESC",
          })
          .populate("duplicateCylinders");
        // .populate('current');

        _infoCylinders = await Promise.all(
          _infoCylinders.map(async (cylinder) => {
            cylinder.histories = await Promise.all(
              cylinder.histories.map(async (history) => {
                return await History.findOne({
                  isDeleted: { "!=": true },
                  id: history.id,
                })
                  .populate("to")
                  .populate("toArray");
              })
            );
            return cylinder;
          })
        );

        // Check những mã đang không vận chuyển
        const notDeliveringCylinders = _.remove(_infoCylinders, (o) => {
          return o.placeStatus !== "DELIVERING";
        });
        // if (notDeliveringCylinders.length > 0) {
        //     // returnData.success = false
        //     returnData.errCyl_notDelivering = getArrayOfSerials(notDeliveringCylinders)
        // }

        // Check những mã không xuất cho doanh nghiệp sở tại
        const notCorrectDestination = _.remove(_infoCylinders, (o) => {
          if (o.histories.length > 0) {
            const lastHistory = o.histories[o.histories.length - 1];
            if (lastHistory.toArray.length > 0) {
              return (
                _.find(lastHistory.toArray, (i) => {
                  return i.id === to;
                }) === undefined
              );
            } else {
              // [LỖI MỨC ĐỘ CAO]
              // Cần thêm điều kiện kiểm tra to === null
              // Lỗi khi không có điểm đến
              // Do user bị xóa
              return lastHistory.to.id !== user.id;
            }
          }
        });
        // if (notCorrectDestination.length > 0) {
        //     // returnData.success = false
        //     returnData.errCyl_notCorrectDestination = getArrayOfSerials(notCorrectDestination)
        // }

        // Gộp chung những mã lỗi lại
        const _arrCyinderError = [
          ...notDeliveringCylinders,
          ...notCorrectDestination,
        ];
        if (_arrCyinderError > 0) {
          // Lọc ra những bình có bình trùng
          const hasDuplicate = _.remove(_arrCyinderError, (o) => {
            return o.hasDuplicate === true;
          });

          // Tìm và trả ra những bình trùng đủ điều kiện nhập
          let cylinderSuccess = [];
          let cylinderError = [];

          await Promise.all(
            hasDuplicate.map(async (_cylinder) => {
              let _cylSuccess = [];

              await Promise.all(
                _cylinder.duplicateCylinders.map(async (_dupCylinder) => {
                  let _cylinderInfo = await Cylinder.findOne({
                    isDeleted: { "!=": true },
                    id: _dupCylinder.copy,
                  }).populate("histories", {
                    where: {
                      type: "EXPORT",
                    },
                    limit: 1,
                    sort: "createdAt DESC",
                  });

                  if (_cylinderInfo) {
                    // _cylinderInfo = await Promise.all(_cylinderInfo.map(async cylinder => {
                    _cylinderInfo.histories = await Promise.all(
                      _cylinderInfo.histories.map(async (history) => {
                        return await History.findOne({
                          isDeleted: { "!=": true },
                          id: history.id,
                        })
                          .populate("to")
                          .populate("toArray");
                      })
                    );
                    //     return cylinder;
                    // }));

                    // Check những mã đang không vận chuyển
                    // const _notDeliveringCylinders = _.remove(_cylinderInfo, o => { return o.placeStatus !== 'DELIVERING'; });
                    // if (notDeliveringCylinders.length > 0) {
                    //     // returnData.success = false
                    //     returnData.errCyl_notDelivering = getArrayOfSerials(notDeliveringCylinders)
                    // }
                    if (_cylinderInfo.placeStatus !== "DELIVERING") return;

                    // Check những mã không xuất cho doanh nghiệp sở tại
                    // const _notCorrectDestination = _.remove(_cylinderInfo, o => {
                    //     if (o.histories.length > 0) {
                    //         const lastHistory = o.histories[o.histories.length - 1];
                    //         if (lastHistory.toArray.length > 0) {
                    //             return _.find(lastHistory.toArray, i => { return i.id === to; }) === undefined;
                    //         } else {
                    //             // [LỖI MỨC ĐỘ CAO]
                    //             // Cần thêm điều kiện kiểm tra to === null
                    //             // Lỗi khi không có điểm đến
                    //             // Do user bị xóa
                    //             return lastHistory.to.id !== user.id;
                    //         }
                    //     }
                    // });
                    const _notCorrectDestination = _.find(
                      _cylinderInfo,
                      (o) => {
                        if (_cylinderInfo.histories.length > 0) {
                          const lastHistory =
                            o.histories[o.histories.length - 1];
                          if (lastHistory.toArray.length > 0) {
                            return (
                              _.find(lastHistory.toArray, (i) => {
                                return i.id === to;
                              }) === undefined
                            );
                          } else {
                            // [LỖI MỨC ĐỘ CAO]
                            // Cần thêm điều kiện kiểm tra to === null
                            // Lỗi khi không có điểm đến
                            // Do user bị xóa
                            return lastHistory.to.id !== user.id;
                          }
                        }
                      }
                    );
                    if (_notCorrectDestination.length > 0) return;

                    _cylSuccess.push(_cylinderInfo);

                    // if (!['DELIVERING', 'IN_REPAIR', 'IN_FACTORY'].includes(_cylinderInfo.placeStatus) && _cylinderInfo.current !== user.id) {
                    //     cylinderSuccess.push(_cylinderInfo)
                    // }
                  }
                })
              );

              if (_cylSuccess.length > 0) {
                cylinderSuccess.push(_cylSuccess);
              } else {
                cylinderError.push(_cylSuccess);
              }
            })
          );

          if (cylinderSuccess.length === _arrCyinderError.length) {
            return res.json({
              status: false,
              message: "Tất cả bình trùng đủ điều kiện nhập",
              resCode: "ERROR-00092",
              cylinderSuccess: _infoCylinders,
              cylinderDuplicateSuccess: cylinderSuccess,
              cylinderDuplicateError: [],
            });
          } else if (cylinderSuccess.length === 0) {
            return res.json({
              status: false,
              message: "Không có bình trùng nào đủ điều kiện nhập",
              resCode: "ERROR-00093",
              cylinderSuccess: _infoCylinders,
              cylinderDuplicateSuccess: [],
              cylinderDuplicateError: _arrCyinderError,
            });
          } else {
            return res.json({
              status: false,
              message: "Có bình trùng đủ và không đủ điều kiện nhập",
              resCode: "ERROR-00094",
              cylinderSuccess: _infoCylinders,
              cylinderDuplicateSuccess: cylinderSuccess,
              cylinderDuplicateError: cylinderError,
            });
          }
        }

        // if (_infoCylinders.length !== cylinders.length) {
        //     return res.badRequest(Utils.jsonErr('Danh sách bình không chính xác!!!'));
        // }

        // const foundErr = _infoCylinders.findIndex(
        //     cylinder => cylinder.placeStatus !== 'DELIVERING'
        // )

        // if (foundErr >= 0) {
        //     return res.badRequest(Utils.jsonErr('Có bình đang không ở trạng thái vận chuyển!!!'));
        // }
        // // else {
        // //   let endCheck = Date.now();
        // //   time.push({
        // //     startCheck,
        // //     endCheck
        // //   })
        // // }
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
        toModel = await User.findOne({ isDeleted: { "!=": true }, id: to });
        if (type !== "TURN_BACK" && !!from) {
          fromModel = await User.findOne({
            isDeleted: { "!=": true },
            id: from,
          });
        }
      } catch (e) {}

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
          console.log("Error::::", e);
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

      if (!result) {
        return res.badRequest(Utils.jsonErr(result.err));
      }
      let resultUpdated = null;
      // Update placeStatus của những bình truyền lên
      if (pushGas) {
        updateForm.status = status;
      }
      resultUpdated = await Cylinder.update({
        isDeleted: { "!=": true },
        _id: { in: cylinders },
      })
        .set(updateForm)
        .fetch();

      if (!resultUpdated) {
        return res.badRequest(Utils.jsonErr(result.err));
      }

      // Sau khi ghi vào bảng History và cập nhật lại trạng thái bình thành công
      // Ghi tiếp vào bảng CylinderImex
      if (typeImex) {
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
              status: cylinder.status ? cylinder.status : "EMPTY",
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

            if (type === "TURN_BACK") {
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
                objectId: cylinderInfo
                  ? cylinderInfo.histories[0].to
                  : from
                  ? from
                  : objectId
                  ? objectId
                  : req.userInfo.id,
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
      return res.badRequest(Utils.jsonErr(error.message));
    }
  },
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

// ************* Get list cylinder Id ************
getCylindersId = async function (cylinders) {
  const result = await Promise.all(
    cylinders.map(async (cylinder) => {
      return cylinder.id;
    })
  );
  return result;
};

/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
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

  // if (type !== 'TURN_BACK' && !from) {
  //   return Utils.jsonErr('From is required');
  // }

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
