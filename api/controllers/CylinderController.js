/**
 * CylinderController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const API_ERRORS = require("../constants/APIErrors");
const LogType = require("../constants/LogType");
const USER_TYPE = require("../constants/UserTypes");
const USER_ROLE = require("../constants/UserRoles");
const excel = require("node-excel-export");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

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
  // Lấy danh sách bình tự động khai báo
  getListCylindersAutoInit: async function (req, res) {
    try {
      const { limit, page } = req.query;

      const count = await Cylinder.count({
        needMoreInfo: true,
        isDeleted: false,
      });

      const result = await Cylinder.find({
        isDeleted: { "!=": true },
        needMoreInfo: true,
        isDeleted: false,
      })
        .limit(limit)
        .skip((page - 1) * limit);

      if (result.length > 0) {
        return res.json({
          success: true,
          message: "Lấy danh sách bình thành công.",
          Cylinders: result,
          Total: count,
        });
      } else {
        return res.json({
          success: true,
          message: "Không tìm thấy bình.",
          Cylinders: result,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Action for /cylinder
   * @param req
   * @param res
   * @returns {*}
   */
  index: async function (req, res) {
    let userId = req.userInfo.id;
    let cylinders = await Cylinder.find({
      isDeleted: { "!=": true },
      current: req.userInfo.id,
    });
    return res.ok(cylinders);
  },

  /**
   * Action for /cylinder/:id
   * @param req
   * @param res
   * @returns {*}
   */
  detail: async function (req, res) {
    if (req.query.cyliner_id === "" || req.query.cyliner_id === '""') {
      return res.badRequest(Utils.jsonErr("Cyliner ID not found"));
    }

    try {
      const result = await Cylinder.findOne(req.query.cyliner_id);
      return res.ok({ data: result });
    } catch (err) {
      return res.serverError(Utils.jsonErr(err));
    }
  },

  /**
   * Action for /cylinder/import
   * @param req
   * @param res
   * @returns {*}
   */
  import: async function (req, res) {
    const user = req.userInfo;

    if (user.userType !== "Factory") {
      return res.badRequest(Utils.jsonErr("Bạn không có đủ thẩm quyền"));
    }

    if (!req.body || req.body === {}) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    // const fixerId = req.body.fixerId;
    // const companyId = req.body.companyId;
    // const classification = req.body.classification;

    const { fixerId, companyId, classification, manufacture } = req.body;

    if (!manufacture) return res.serverError("Missing manufacture!");

    req.file("upload_file").upload(
      {
        dirname: require("path").resolve(sails.config.appPath, "excel/"),
      },
      async (err, files) => {
        if (err) {
          return res.serverError(err);
        }

        try {
          const result = await CylinderService.excelToCylinder(
            files,
            user.id,
            fixerId,
            companyId,
            classification,
            manufacture
          );
          const content =
            result.body.length > 0
              ? "Success import Cylinders data"
              : result.err;
          await Log.create({
            type: LogType.IMPORT_EXCEL_CYLINDER_ACTION,
            content,
            status: result.status,
          });
          return res.ok({
            status: result.status,
            err: result.status ? "" : result.err,
          });
        } catch (err) {
          try {
            await Log.create({
              type: LogType.IMPORT_EXCEL_CYLINDER_ACTION,
              content: err.message,
              status: false,
            });
          } catch (error) {
            console.log("catch (error)", error);
          }
          console.log("catch (err)", err);
          return res.serverError(Utils.jsonErr(err));
        }
      }
    );
  },

  // Gui req len TNSH, yeu cau tao ma binh theo danh sach trong file excel
  createReqImport: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      id_ReqTo,
      classification,
      manufacture,
      // codeReq
    } = req.body;

    if (!id_ReqTo) return res.badRequest(Utils.jsonErr("Missing id_ReqTo"));
    if (!manufacture)
      return res.badRequest(Utils.jsonErr("Missing manufacture"));
    if (!classification)
      return res.badRequest(Utils.jsonErr("Missing classification"));

    const user = req.userInfo;

    if (user.userType !== "Factory" && user.userType !== "Fixer") {
      // can kiem tra them Truc thuoc (Owner)
      return res.badRequest(Utils.jsonErr("Bạn không có đủ thẩm quyền"));
    }

    if (req.body === {}) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    //const fixerId = req.body.fixerId;

    req.file("upload_file").upload(
      {
        dirname: require("path").resolve(
          sails.config.appPath,
          "excel/createReqImport"
        ),
      },
      async (err, files) => {
        if (err) {
          return res.serverError(err);
        }

        try {
          const result = await CylinderService.excelReqToCylinder(
            files,
            user.id,
            id_ReqTo,
            classification,
            manufacture
          );
          const content =
            result.body.length > 0
              ? "Success import Cylinders data"
              : result.err;
          await Log.create({
            type: LogType.IMPORT_EXCEL_CYLINDER_ACTION,
            content,
            status: result.status,
          });
          return res.ok({
            status: result.status,
            err: result.status ? "" : result.err,
          });
        } catch (err) {
          try {
            await Log.create({
              type: LogType.IMPORT_EXCEL_CYLINDER_ACTION,
              content: err.message,
              status: false,
            });
          } catch (error) {}
          return res.serverError(Utils.jsonErr(err));
        }
      }
    );
  },

  // Tạo bình dưới công ty con, chi nhánh trực thuộc
  importFromSubsidiary: async function (req, res) {
    const user = req.userInfo;

    if (!(user.userType === "Factory" || user.userType === "Fixer")) {
      return res.badRequest(Utils.jsonErr("Bạn không có đủ thẩm quyền"));
    }

    if (req.body === {}) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    // return  res.badRequest(Utils.jsonErr('TEST'));

    const {
      // fixerId,
      // companyId,
      classification,
      manufacture,
      category,
      // assetType,
      // rentalPartner,
    } = req.body;

    req.file("upload_file").upload(
      {
        dirname: require("path").resolve(sails.config.appPath, "excel/"),
      },
      async (err, files) => {
        if (err) {
          return res.serverError(err);
        }

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

          const result = await CylinderService.excelToCylinderFromSubsidiary(
            files,
            user.id,
            classification,
            manufacture,
            category,
            /* assetType, rentalPartner, */ parent,
            user.userType
          );
          const content =
            result.body.length > 0
              ? "Nhập dữ liệu bình thành công."
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
          return res.serverError(Utils.jsonErr(err));
        }
      }
    );
  },

  // // Tạo bình trùng bằng file excel
  // importDuplicateFromSubsidiary: async function (req, res) {
  //   const user = req.userInfo;

  //   if (!(user.userType === 'Factory' || user.userType === 'Fixer')) {
  //     return res.badRequest(Utils.jsonErr('Bạn không có đủ thẩm quyền'));
  //   }

  //   if (req.body === {}) {
  //     return res.badRequest(Utils.jsonErr('Empty body'));
  //   }

  //   // return  res.badRequest(Utils.jsonErr('TEST'));

  //   const {
  //     // fixerId,
  //     // companyId,
  //     classification,
  //     manufacture,
  //     category,
  //     // assetType,
  //     // rentalPartner,
  //   } = req.body

  //   req.file('upload_file').upload({
  //     dirname: require('path').resolve(sails.config.appPath, 'excel/')
  //   }, async (err, files) => {
  //     if (err) {return res.serverError(err);}

  //     try {
  //       // Tìm parentRoot
  //       const parent = await getRootParent(user.isChildOf)

  //       const availableManufacture = await Manufacture.findOne({isDeleted: {"!=": true}, where: { owner: parent, id: manufacture } });
  //       if (!availableManufacture) {
  //         return res.badRequest(Utils.jsonErr(
  //           `Manufacture ${manufacture} is not available on your system`
  //         ));
  //       }

  //       const isExistCategory = await CategoryCylinder.findOne({isDeleted: {"!=": true}, id: category })
  //       if (!isExistCategory) {
  //         return res.badRequest(Utils.jsonErr(
  //           `Không tìm thấy loại bình với id = ${category} trong hệ thống`
  //         ));
  //       }

  //       const result = await CylinderService.excelToCylinderFromSubsidiary(files, user.id, classification, manufacture, category, /* assetType, rentalPartner, */ parent, user.userType);
  //       const content = result.body.length > 0 ? 'Success import Cylinders data' : result.err;
  //       await Log.create({type: LogType.IMPORT_EXCEL_CYLINDER_ACTION, content, status: result.status });
  //       return res.ok({
  //         status: result.status,
  //         err: result.status ? '' : result.err,
  //         resCode: result.resCode,
  //         duplicateCylinders: result.duplicateCylinders,
  //       });
  //     } catch (err) {
  //       try {
  //         await Log.create({type: LogType.IMPORT_EXCEL_CYLINDER_ACTION, content: err.message, status: false });
  //       } catch (error) {}
  //       return res.serverError(Utils.jsonErr(err));
  //     }
  //   });
  // },

  // Tạo bình tự động từ phần mềm in
  // Đồng bộ số liệu với GEO
  importCylinders: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      email, // email
      cylinders,
    } = req.body;

    if (!email) {
      return res.badRequest(Utils.jsonErr("email is required"));
    }

    if (!cylinders) {
      return res.badRequest(Utils.jsonErr("cylinders is required"));
    }

    if (!Array.isArray(cylinders)) {
      return res.badRequest(Utils.jsonErr("cylinders is wrong type"));
    }

    if (cylinders.length === 0) {
      return res.badRequest(Utils.jsonErr("List cylinders is empty"));
    }

    try {
      const length = cylinders.length;
      const idImex = Date.now();
      // // Gán cứng id của chi nhánh Bình Khí
      // const ownerId = ''
      const userInfo = await User.findOne({
        isDeleted: { "!=": true },
        email: email,
      });
      if (!userInfo) {
        return res.badRequest(Utils.jsonErr("User not found"));
      }

      if (!userInfo.prefix) {
        return res.badRequest(Utils.jsonErr("Đơn vị chưa khai báo mã tiền tố"));
      }

      const parent = await getRootParent(userInfo.id);

      let result = {
        body: [],
        err: "non of error",
        status: false,
      };
      let body = [];
      let errorLogs = [];

      // // Setting tạo bình trùng
      // const systemSetting = await SystemSetting.findOne({isDeleted: {"!=": true}, Code: 'DUP382903' })
      // let enableDup = false
      // if (systemSetting) {
      //   enableDup = systemSetting.IsLocked
      // }

      for (let i = 0; i < length; i++) {
        let createdData = await CylinderService.createEachCylinders(
          cylinders[i],
          userInfo.id,
          parent,
          userInfo.userType,
          idImex,
          userInfo.prefix
        );
        if (!createdData.status) {
          errorLogs.push(createdData.err);
          //break;
        } else {
          //console.log('Created data::::', createdData);
          body.push(createdData.data);
        }
      }

      if (body.length === cylinders.length) {
        result.status = true;
        result.body = body;
      }

      if (errorLogs.length > 0) {
        result.err = errorLogs.join(";");
      }

      //const result = await CylinderService.excelToCylinderFromSubsidiary(files, user.id, classification, manufacture, category, /* assetType, rentalPartner, */ parent, user.userType);
      const content =
        result.body.length > 0 ? "Success import Cylinders data" : result.err;
      await Log.create({
        inputData: JSON.stringify(req.body),
        // inputData: req.body,
        // errorData: '',
        type: LogType.IMPORT_EXCEL_CYLINDER_ACTION,
        content,
        status: result.status,
      });
      return res.ok({
        status: result.status,
        err: result.status ? "" : result.err,
      });
    } catch (err) {
      try {
        await Log.create({
          inputData: JSON.stringify(req.body),
          // inputData: req.body,
          type: LogType.IMPORT_EXCEL_CYLINDER_ACTION,
          content: err.message,
          status: false,
        });
      } catch (error) {}
      return res.serverError(Utils.jsonErr(err));
    }
  },

  // Lay thong tin request
  getReqImport: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id } = req.body;

    try {
      let data = await ReqImport.find({
        isDeleted: { "!=": true },
        id_ReqTo: id,
        status_Req: "INIT",
      })
        .populate("detail_Req")
        .populate("id_ReqFrom");

      if (data) {
        return res.json({
          status: true,
          data: data,
          message: "Lay du lieu thanh cong",
        });
      } else {
        return res.json({ status: false, message: "Lay du lieu that bai" });
      }
    } catch (err) {
      return res.json({ status: false, message: err.message });
    }
  },

  // Xac nhan Req
  confirmReqImport: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { idUser, idReq } = req.body;

    let createdData = [];
    let errData = [];

    try {
      const reqImport = await ReqImport.findOne({
        isDeleted: { "!=": true },
        id: idReq,
      });

      if (!reqImport)
        return res.json({
          status: false,
          message: `Khong co yeu cau tao binh nao voi ma : ${reqImport}`,
        });

      const userInfor_reqImport = await User.findOne({
        isDeleted: { "!=": true },
        id: reqImport.id_ReqFrom,
      });

      // if (userInfor_reqImport.hasOwnp)

      let placeStatus = "";
      if (userInfor_reqImport.userType === "Factory")
        placeStatus = "IN_FACTORY";
      if (userInfor_reqImport.userType === "Fixer") placeStatus = "IN_REPAIR";

      const detail_ReqImport = await DetailReqImport.find({
        isDeleted: { "!=": true },
        request: idReq,
      });

      for (i = 0; i < detail_ReqImport.length; i++) {
        let data;

        const availableManufacture = await Manufacture.findOne({
          isDeleted: { "!=": true },
          where: { owner: idUser, id: detail_ReqImport[i].manufacture },
        });
        if (!availableManufacture) {
          data = `Manufacture ${data.manufacture} is not available on your system`;
          //return createdData;
          errData.push(data);
        } else {
          const exitsCylinder = await Cylinder.findOne({
            isDeleted: { "!=": true },
            // where: { serial:  detail_ReqImport[i].serial, manufacture:  detail_ReqImport[i].manufacture },
            serial: detail_ReqImport[i].serial,
          });
          if (exitsCylinder) {
            data = `The cylinder with serial ${detail_ReqImport[i].serial} with manufacture ${detail_ReqImport[i].manufacture} ALREADY EXIST`;
            //return createdData;
            errData.push(data);
          } else {
            try {
              let createCylinder = await Cylinder.create({
                serial: detail_ReqImport[i].serial,
                //img_url: detail_ReqImport[i].img_url,
                color: detail_ReqImport[i].color,
                valve: detail_ReqImport[i].valve,
                checkedDate: detail_ReqImport[i].checkedDate,
                weight: detail_ReqImport[i].weight,
                classification: detail_ReqImport[i].classification,
                //currentImportPrice: detail_ReqImport[i].currentImportPrice,
                manufacture: detail_ReqImport[i].manufacture,
                manufacturedBy: reqImport.id_ReqFrom,
                current: reqImport.id_ReqFrom,
                factory: idUser,
                placeStatus: placeStatus,
              }).fetch();
              if (createCylinder)
                data = `The cylinder with serial ${detail_ReqImport[i].serial} with manufacture ${detail_ReqImport[i].manufacture} CREATE SUCCESS`;
            } catch (err) {
              // await Log.create({  })
              return res.json({
                status: false,
                data: err.message,
                message: "Co loi khi tao binh",
              });
            }

            createdData.push(data);
          }
        }
      }

      if (createdData.length > 0) {
        let updatedReq = await ReqImport.updateOne({
          isDeleted: { "!=": true },
          id: idReq,
        }).set({
          status_Req: "CREATED",
          updatedBy: idUser,
          updatedAt: new Date(),
        });
      }

      if (errData.length <= 0 && createdData.length > 0) {
        return res.json({
          status: true,
          data: createdData,
          message: "Tao request thanh cong",
        });
      } else {
        let returnData = errData.concat(createdData);
        return res.json({
          status: false,
          data: returnData,
          message: "Co loi khi tao binh",
        });
      }
    } catch (err) {
      return res.json({ status: false, message: err.message });
    }
  },

  // Xoa request
  removeReqImport: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { idReq } = req.body;

    //if (!idUser) return res.json({ status: false, message: 'ID User is required'});
    if (!idReq)
      return res.json({ status: false, message: "ID Request is required" });

    try {
      let data = await ReqImport.updateOne({
        isDeleted: { "!=": true },
        id: idReq,
      }).set({ status_Req: "REMOVE" });

      if (data) {
        return res.json({
          status: true,
          data: data,
          message: "Xoa request thanh cong",
        });
      } else {
        return res.json({ status: false, message: "Xoa request that bai" });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: "Gap loi khi cap nhat request",
      });
    }
  },

  /**
   * Action for /cylinder/upPlaceStatus
   * @param req
   * @param res
   * @returns {*}
   */
  upPlaceStatus: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const result = await CylinderService.upPlaceStatus(
        req.body.cyliner_id,
        req.userInfo
      );
      if (!result) {
        res.badRequest(Utils.jsonErr(API_ERRORS.ROLE_RESTRICT));
      }
      return res.ok(result);
    } catch (err) {
      return res.serverError(Utils.jsonErr(err));
    }
  },

  /**
   * Action for /cylinder/create
   * @param req
   * @param res
   * @returns {*}
   */
  create: async function (req, res) {
    const body = req.body;
    if (!body || !body.manufacture || !body.serial) {
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
        return res.badRequest(Utils.jsonErr(API_ERRORS.EXIST_MODEL));
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

  // createDuplicate: async function (req, res) {
  //   const body = req.body;
  //   if (!body || !body.manufacture || !body.serial) {
  //     return res.badRequest(Utils.jsonErr('Empty body'));
  //   }

  //   if (req.userInfo.userType !== 'Factory') {
  //     return res.badRequest(Utils.jsonErr('Bạn không có đủ thẩm quyền'));
  //   }

  //   try {
  //     const exitsCylinder = await Cylinder.findOne({isDeleted: {"!=": true},
  //       where: {serial: body.serial/* , manufacture: body.manufacture */},
  //     });
  //     if(exitsCylinder) {
  //       if (!req.userInfo.prefix) {
  //         return res.badRequest(Utils.jsonErr('Đơn vị chưa khai báo mã tiền tố'));
  //       }

  //       // Thêm tiền tố mã đơn vị vào serial
  //       const _serial = req.userInfo.prefix + body.serial

  //       // Kiểm tra trùng mã trong cùng đơn vị
  //       const exitsDuplicateCylinder = await Cylinder.findOne({isDeleted: {"!=": true},
  //         where: {serial: _serial},
  //       });
  //       if (exitsDuplicateCylinder) {
  //         return res.badRequest(Utils.jsonErr('Không được khai báo trùng mã trong cùng một đơn vị'));
  //       }

  //       body.serial = _serial
  //       body.prefix = req.userInfo.prefix
  //       body.isDuplicate = true
  //     }

  //     body.factory = req.userInfo.id;
  //     if (body.cylinderAt_childFactory===undefined || !body.cylinderAt_childFactory) {
  //       body.current = req.userInfo.id;
  //     }
  //     else {
  //       body.current = body.cylinderAt_childFactory;

  //       const fixerComp = await User.findOne({isDeleted: {"!=": true},id: body.cylinderAt_childFactory})
  //       if (fixerComp.userType === 'Fixer') body.placeStatus = 'IN_REPAIR'
  //     }

  //     const cylinder = await Cylinder.create(body).fetch();

  //     if (cylinder) {
  //       // Cập nhật lại thông tin bình bị trùng
  //       await Cylinder.updateOne({isDeleted: {"!=": true},id: exitsCylinder.id})
  //         .set({ hasDuplicate: true })

  //       // Tạo thêm bản ghi bình trùng, bên collection DuplicateCylinder
  //       await DuplicateCylinder.create({
  //         serial: cylinder.serial,
  //         duplicate: exitsCylinder.id,
  //         copy: cylinder.id,
  //       })
  //     }

  //     const test11 = await Cylinder.findOne({isDeleted: {"!=": true}, id: exitsCylinder.id })
  //       .populate('duplicateCylinders')
  //       .populate('copyCylinder')

  //     const test22 = await Cylinder.findOne({isDeleted: {"!=": true}, id: cylinder.id })
  //       .populate('duplicateCylinders')
  //       .populate('copyCylinder')

  //     // Ghi tiếp vào bảng CylinderImex
  //     let condition = ''
  //     if (!cylinder.classification) {
  //       const record = await CylinderImex.find({isDeleted: {"!=": true},
  //         cylinder: cylinder.id
  //       }).sort('createdAt DESC')

  //       if (record.length > 0) {
  //         condition = record[0].condition
  //       }
  //       else {
  //         condition = 'NEW'
  //       }
  //     }

  //     await CylinderImex.create({
  //       cylinder: cylinder.id,
  //       status: 'EMPTY',
  //       condition: cylinder.classification ? cylinder.classification.toUpperCase() : condition,
  //       idImex: Date.now(),
  //       typeImex: 'IN',
  //       flow: 'CREATE',
  //       category: req.body.category ? req.body.category : null,
  //       createdBy: req.userInfo.id,
  //       objectId: req.userInfo.id,
  //       // history: null,
  //     })

  //     return res.created(cylinder);
  //   } catch (err) {
  //     return res.serverError(Utils.jsonErr(err));
  //   }
  // },

  /**
   * Action for /cylinder/getInfomation
   * @param req
   * @param res
   * @returns {*}
   */
  getInfomation: async function (req, res) {
    if (req.body === {}) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const user = req.userInfo;
    const actionType = req.body.action_type;
    const parentRoot = req.body.parent_root;
    const cylinderSerial = req.body.cylinder_serials;
    let credential = {};

    if (!actionType) {
      return res.ok(Utils.jsonErr("Missing action_type"));
    }

    if (!parentRoot) {
      return res.ok(Utils.jsonErr("Missing parent_root"));
    }

    if (!cylinderSerial || cylinderSerial.length === 0) {
      return res.ok(
        Utils.jsonErr(
          "Empty request cylinder_serials, cylinder_serials must be serials array"
        )
      );
    }

    credential.serial = cylinderSerial;
    //credential.factory = parentRoot;

    try {
      let cylinders = [];
      if (actionType === "CHANGE_DATE") {
        cylinders = await Cylinder.find(credential);
        const deliveringCylinders = _.filter(cylinders, (o) => {
          return o.current !== user.id;
        }); // Check những mã đang Vận chuyển
        if (deliveringCylinders.length > 0) {
          return res.ok(
            Utils.jsonErr(
              `Những mã này đang vận chuyển, đã bán, bình rỗng, hoặc đang không ở doanh nghiệp sở tại nên không thể xuất : ${getArrayOfSerials(
                deliveringCylinders
              ).join(",")}`
            )
          );
        }
        return res.ok(cylinders);
      } else {
        cylinders = await Cylinder.find(credential).populate("histories", {
          limit: 1,
          sort: "createdAt DESC",
        });

        if (actionType === "IMPORT") {
          cylinders = await Promise.all(
            cylinders.map(async (cylinder) => {
              // let _startTime = Date.now();
              // let _endTime = 0;
              // let time = {}
              cylinder.histories = await Promise.all(
                cylinder.histories.map(async (history) => {
                  return await History.findOne({
                    isDeleted: { "!=": true },
                    id: history.id,
                  })
                    .populate("to")
                    .populate("from")
                    .populate("toArray");
                })
              );
              // if (cylinder.histories) {
              //   cylinder.time = {
              //     _startTime,
              //     _endTime: Date.now()
              //   };
              // }

              return cylinder;
            })
          );
        }

        // if (actionType === 'IMPORT') return res.ok(cylinders);
        return await getSuitableCylinders(
          res,
          user,
          actionType,
          cylinderSerial,
          cylinders
        );
      }
    } catch (err) {
      return res.serverError(Utils.jsonErr(err.message));
    }
  },

  //
  getInfomationReturn: async function (req, res) {
    if (req.body === {}) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const user = req.userInfo;
    const actionType = req.body.action_type;
    const parentRoot = req.body.parent_root;
    const cylinderSerial = req.body.cylinder_serials;
    let credential = {};

    if (!actionType) {
      return res.ok(Utils.jsonErr("Missing action_type"));
    }

    if (!parentRoot) {
      return res.ok(Utils.jsonErr("Missing parent_root"));
    }

    if (!cylinderSerial || cylinderSerial.length === 0) {
      return res.ok(
        Utils.jsonErr(
          "Empty request cylinder_serials, cylinder_serials must be serials array"
        )
      );
    }

    credential.serial = cylinderSerial;
    //credential.factory = parentRoot;

    try {
      let cylinders = [];
      if (actionType === "CHANGE_DATE") {
        cylinders = await Cylinder.find(credential);
        const deliveringCylinders = _.filter(cylinders, (o) => {
          return o.current !== user.id;
        }); // Check những mã đang Vận chuyển
        if (deliveringCylinders.length > 0) {
          return res.ok(
            Utils.jsonErr(
              `Những mã này đang vận chuyển, đã bán, bình rỗng, hoặc đang không ở doanh nghiệp sở tại nên không thể xuất : ${getArrayOfSerials(
                deliveringCylinders
              ).join(",")}`
            )
          );
        }
        return res.ok(cylinders);
      } else {
        cylinders = await Cylinder.find(credential).populate("histories", {
          limit: 1,
          sort: "createdAt DESC",
        });

        if (actionType === "IMPORT") {
          cylinders = await Promise.all(
            cylinders.map(async (cylinder) => {
              // let _startTime = Date.now();
              // let _endTime = 0;
              // let time = {}
              cylinder.histories = await Promise.all(
                cylinder.histories.map(async (history) => {
                  return await History.findOne({
                    isDeleted: { "!=": true },
                    id: history.id,
                  })
                    .populate("to")
                    .populate("from")
                    .populate("toArray");
                })
              );
              // if (cylinder.histories) {
              //   cylinder.time = {
              //     _startTime,
              //     _endTime: Date.now()
              //   };
              // }

              return cylinder;
            })
          );
        }

        // if (actionType === 'IMPORT') return res.ok(cylinders);
        return await getSuitableReturnCylinders(
          res,
          user,
          actionType,
          cylinderSerial,
          cylinders
        );
      }
    } catch (err) {
      return res.serverError(Utils.jsonErr(err.message));
    }
  },

  // lay thong tin cylinder tu file excel
  getInfomationExcel: async function (req, res) {
    if (req.body === {}) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const user = req.userInfo;
    const actionType = req.body.action_type;
    const parentRoot = req.body.parent_root;
    const cylinderSerial = req.body.cylinder_serials;
    let credential = {};

    if (!actionType) {
      return res.ok(Utils.jsonErr("Missing action_type"));
    }

    if (!parentRoot) {
      return res.ok(Utils.jsonErr("Missing parent_root"));
    }

    if (!cylinderSerial || cylinderSerial.length === 0) {
      return res.ok(Utils.jsonErr("Empty request cylinder_serials"));
    }

    credential.serial = [];

    for (i = 0; i < cylinderSerial.length; i++) {
      credential.serial.push(cylinderSerial[i]);
    }

    //credential.serial = cylinderSerial;
    //credential.factory = parentRoot;

    try {
      let cylinders = [];
      if (actionType === "CHANGE_DATE") {
        cylinders = await Cylinder.find(credential);
        const deliveringCylinders = _.filter(cylinders, (o) => {
          return o.current !== user.id;
        }); // Check những mã đang Vận chuyển
        if (deliveringCylinders.length > 0) {
          return res.ok(
            Utils.jsonErr(
              `Những mã này đang vận chuyển, đã bán, bình rỗng, hoặc đang không ở doanh nghiệp sở tại nên không thể xuất : ${getArrayOfSerials(
                deliveringCylinders
              ).join(",")}`
            )
          );
          //return res.json({ success: false, message: `Những mã này đang vận chuyển, đã bán, bình rỗng, hoặc đang không ở doanh nghiệp sở tại nên không thể xuất : ${getArrayOfSerials(deliveringCylinders).join(',')}` });
        }
        return res.ok(cylinders);
      } else {
        cylinders = await Cylinder.find(credential).populate("histories");

        cylinders = await Promise.all(
          cylinders.map(async (cylinder) => {
            cylinder.histories = await Promise.all(
              cylinder.histories.map(async (history) => {
                return await History.findOne({
                  isDeleted: { "!=": true },
                  id: history.id,
                }).populate(["to", "from", "toArray"]);
              })
            );
            return cylinder;
          })
        );
        return await getSuitableCylinders(
          res,
          user,
          actionType,
          cylinderSerial,
          cylinders
        );
      }
    } catch (err) {
      return res.serverError(Utils.jsonErr(err));
    }
  },

  /**
   * Action for /cylinder/updateVerifiedDates
   * @param amount
   * @param res
   * @returns {*}
   */
  updateVerifiedDates: async function (req, res) {
    const user = req.userInfo;
    const cylinderIds = req.body.cylinder_serials;
    const newDate = req.body.newDate;

    if (
      user.userType !== "Factory" &&
      user.userType !== "Fixer" &&
      user.userRole !== "SuperAdmin"
    ) {
      return res.ok(Utils.jsonErr("Bạn không có đủ quyền"));
    }

    if (!cylinderIds) {
      return res.ok(Utils.jsonErr("cylinder_serials is required"));
    }

    if (!newDate) {
      return res.ok(Utils.jsonErr("newDate is required"));
    }

    let passedCylinderIds = [];
    let listErrorCylinder = [];
    // let passedCylinderIds = await Promise.all(cylinderIds.filter(async cylinderId => {
    //   const modelCylinder = await Cylinder.findOne({isDeleted: {"!=": true},'id': cylinderId});
    //   if(modelCylinder.current === user.id && (modelCylinder.placeStatus === 'IN_FACTORY' || modelCylinder.placeStatus === 'IN_REPAIR')) {return cylinderId;}
    // }));
    for (let index = 0; index < cylinderIds.length; index++) {
      const modelCylinder = await Cylinder.findOne({
        isDeleted: { "!=": true },
        id: cylinderIds[index],
      });
      if (
        modelCylinder.current === user.id &&
        (modelCylinder.placeStatus === "IN_FACTORY" ||
          modelCylinder.placeStatus === "IN_REPAIR")
      ) {
        passedCylinderIds.push(cylinderIds[index]);
      } else {
        listErrorCylinder.push(cylinderIds[index]);
      }
    }

    //Return error if non of cylinderid passed the check
    if (passedCylinderIds.length === 0) {
      return res.ok(
        Utils.jsonErr("Không update được vì không mã nào ở cở sở hiện tại")
      );
    }
    //Get all error serial
    //let listErrorCylinder = _.difference(cylinderIds, passedCylinderIds);

    let listError = "";
    if (listErrorCylinder.length > 0) {
      listError = listErrorCylinder.join("; ");
    }

    try {
      const patchedCylinders = await Cylinder.update({
        isDeleted: { "!=": true },
        _id: passedCylinderIds,
      }).set({ checkedDate: newDate });
      if (listErrorCylinder.length === 0) {
        return res.ok(patchedCylinders);
      } else {
        return res.ok(
          Utils.jsonErr(
            `Cập nhật thành công nhưng các mã dưới đây lỗi do không ở tại cơ sở hiện tại ${listError}`
          )
        );
      }
    } catch (error) {
      return res.ok(Utils.jsonErr(error));
    }
  },

  //
  updateCylinderInformationExcel: async function (req, res) {
    const user = req.userInfo;

    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      cylinder_serials,
      // checkedDate,
      // serial
    } = req.body;

    const listCylinders = cylinder_serials;

    if (
      user.userType !== "Factory" &&
      user.userType !== "Fixer" &&
      user.userRole !== "SuperAdmin"
    ) {
      // return res.ok(Utils.jsonErr('Bạn không có đủ quyền'));
      return res.json({ success: false, message: "Bạn không có đủ quyền" });
    }

    if (!Array.isArray(listCylinders)) {
      // return res.ok(Utils.jsonErr('cylinder_serials is required'));
      return res.json({
        success: false,
        message: "Update information is required",
      });
    }

    if (listCylinders.length === 0) {
      return res.json({
        success: false,
        message: "Update information is required",
      });
    }

    // if (!newDate) {
    //   return res.ok(Utils.jsonErr('newDate is required'));
    // }

    let passedCylinderIds = [];
    let listErrorCylinder = [];
    // let passedCylinderIds = await Promise.all(cylinderIds.filter(async cylinderId => {
    //   const modelCylinder = await Cylinder.findOne({isDeleted: {"!=": true},'id': cylinderId});
    //   if(modelCylinder.current === user.id && (modelCylinder.placeStatus === 'IN_FACTORY' || modelCylinder.placeStatus === 'IN_REPAIR')) {return cylinderId;}
    // }));

    await Promise.all(
      listCylinders.map(async (cylidner, index) => {
        if (cylidner.hasOwnProperty("serial")) {
          const modelCylinder = await Cylinder.findOne({
            isDeleted: { "!=": true },
            serial: cylidner.serial,
          });
          if (modelCylinder) {
            if (
              modelCylinder.current === user.id &&
              (modelCylinder.placeStatus === "IN_FACTORY" ||
                modelCylinder.placeStatus === "IN_REPAIR")
            ) {
              passedCylinderIds.push(cylidner);
            } else {
              element = passedCylinderIds[index];
              listErrorCylinder.push(cylidner);
              passedCylinderIds.splice(index, 1);
            }
          } else {
            element = passedCylinderIds[index];
            listErrorCylinder.push(cylidner);
            passedCylinderIds.splice(index, 1);
          }
        } else {
          element = passedCylinderIds[index];
          listErrorCylinder.push(cylidner);
          passedCylinderIds.splice(index, 1);
        }
      })
    );

    // for (let index = 0; index < listCylinders.length; index++) {

    //   if (listCylinders[index].hasOwnProperty('serial')) {
    //     const modelCylinder = await Cylinder.findOne({isDeleted: {"!=": true}, 'serial': listCylinders[index].serial });
    //     if (modelCylinder.current === user.id && (modelCylinder.placeStatus === 'IN_FACTORY' || modelCylinder.placeStatus === 'IN_REPAIR')) {
    //       passedCylinderIds.push(listCylinders[index]);
    //     } else {
    //       const element = passedCylinderIds[index]
    //       listErrorCylinder.push(listCylinders[index])
    //       passedCylinderIds.slice(index, 1)
    //     }
    //   }
    //   else {
    //     const element = passedCylinderIds[index]
    //     listErrorCylinder.push(listCylinders[index])
    //     passedCylinderIds.slice(index, 1)
    //   }
    // }

    //Return error if non of cylinderid passed the check
    if (passedCylinderIds.length === 0) {
      // return res.ok(Utils.jsonErr('Không update được vì không mã nào ở cở sở hiện tại'));
      return res.json({
        success: false,
        message: "Không update được vì không mã nào ở cở sở hiện tại",
      });
    }
    //Get all error serial
    //let listErrorCylinder = _.difference(cylinderIds, passedCylinderIds);

    let listError = "";
    if (listErrorCylinder.length > 0) {
      listError = listErrorCylinder.join("; ");
    }

    let dataUpdate = [];
    let elmErr = [];

    await Promise.all(
      passedCylinderIds.map(async (cylinder, index) => {
        // let elm
        if (cylinder.manufacture) {
          const manufacture = await Manufacture.findOne({
            isDeleted: { "!=": true },
            id: cylinder.manufacture,
          });
          if (manufacture) {
            dataUpdate.push({
              checkedDate: cylinder.checkDate
                ? cylinder.checkDate
                : new Date().toISOString(),
              classification: cylinder.classification
                ? cylinder.classification
                : "",
              color: cylinder.color ? cylinder.color : "",
              manufacture: cylinder.manufacture ? cylinder.manufacture : "",
              valve: cylinder.valve ? cylinder.valve : "",
              weight: cylinder.weight ? cylinder.weight : 0,
            });
          } else {
            listErrorCylinder.push(passedCylinderIds[index]);
            elmErr.push(passedCylinderIds[index]);
          }
        } else {
          listErrorCylinder.push(passedCylinderIds[index]);
          elmErr.push(passedCylinderIds[index]);
        }
      })
    );

    if (elmErr.length > 0) {
      elmErr.forEach((element) => {
        passedCylinderIds.splice(passedCylinderIds.indexOf(element), 1);
      });
    }

    // checkDate: "2023-02-13T12:00:00.000Z"
    // classification: "New"
    // color: "Xám"
    // manufacture: "5ec5fba3dc6b454dd46c035c"
    // serial: "DVSA513411"
    // valve: "POL"
    // weight: 13.7

    try {
      // const patchedCylinders = await Cylinder.update({isDeleted: {"!=": true},'serial': passedCylinderIds}).set({checkedDate: newDate});
      let patchedCylinders = [];
      await Promise.all(
        passedCylinderIds.map(async (cylinder, index) => {
          const updatedCylinder = await Cylinder.updateOne({
            isDeleted: { "!=": true },
            serial: cylinder.serial,
          }).set(dataUpdate[index]);
          patchedCylinders.push(updatedCylinder);
        })
      );

      if (listErrorCylinder.length === 0 && patchedCylinders.length > 0) {
        // return res.ok(patchedCylinders);
        return res.json({
          success: true,
          data: patchedCylinders,
          message: "Cập nhật thông tin bình thành công",
        });
      } else {
        // return res.ok(Utils.jsonErr(`Cập nhật thành công nhưng các mã dưới đây lỗi do không ở tại cơ sở hiện tại ${listError}`));
        return res.json({
          success: false,
          data: [patchedCylinders, listErrorCylinder],
          message:
            "Cập nhật thông tin " +
            patchedCylinders.length +
            " bình thành công, " +
            listErrorCylinder.length +
            " bình thất bại",
        });
      }
    } catch (error) {
      // return res.ok(Utils.jsonErr(error));
      return res.json({
        success: false,
        message: "Gặp lỗi khi cập nhật thông tin bình",
      });
    }
  },

  /**
   * Action for /cylinder/updateCylinder
   * @param amount
   * @param res
   * @returns {*}
   */
  updateCylinder: async function (req, res) {
    const user = req.userInfo;
    const cylinderId = req.body.cylinder_id;
    const newPrice = req.body.price;
    const newColor = req.body.color;
    const newWeight = req.body.weight;
    const newCheckedDate = req.body.checked_date;
    const newImageUrl = req.body.img_url;
    const idUser = req.body.idUser;
    const valve = req.body.valve;
    const classification = req.body.classification;
    const manufacture = req.body.manufacture;
    const category = req.body.category;

    if (!cylinderId) {
      return res.ok(Utils.jsonErr("cylinder_id is required"));
    }

    if (newPrice && typeof newPrice !== "number") {
      return res.ok(Utils.jsonErr("price is not type number"));
    }

    if (newColor && typeof newColor !== "string") {
      return res.ok(Utils.jsonErr("color is not type string"));
    }

    if (newWeight && typeof newWeight !== "number") {
      return res.ok(Utils.jsonErr("weight is not type number"));
    }

    if (newCheckedDate && typeof newCheckedDate !== "string") {
      return res.ok(Utils.jsonErr("check_date is not type string"));
    }

    if (newImageUrl && typeof newImageUrl !== "string") {
      return res.ok(Utils.jsonErr("img_url is not type string"));
    }

    if (valve && typeof valve !== "string") {
      return res.ok(Utils.jsonErr("valve is not type string"));
    }

    if (classification && typeof classification !== "string") {
      return res.ok(Utils.jsonErr("classification is not type string"));
    }

    if (manufacture && typeof manufacture !== "string") {
      return res.ok(Utils.jsonErr("manufacture is not type string"));
    }

    if (category && typeof category !== "string") {
      return res.ok(Utils.jsonErr("category is not type string"));
    }

    patch = {};
    if (newPrice) {
      patch.currentSalePrice = newPrice;
    }
    if (newColor) {
      patch.color = newColor;
    }
    if (newWeight) {
      patch.weight = newWeight;
    }
    if (newCheckedDate) {
      patch.checkedDate = newCheckedDate;
    }
    if (newImageUrl) {
      patch.img_url = newImageUrl;
    }
    if (valve) {
      patch.valve = valve;
    }
    if (classification) {
      patch.classification = classification;
    }
    if (manufacture) {
      patch.manufacture = manufacture;
    }
    if (category) {
      patch.category = category;
    }

    patch.updateBy = idUser;

    try {
      const patchedCylinder = await Cylinder.updateOne({
        isDeleted: { "!=": true },
        _id: cylinderId,
      }).set(patch);

      if (patchedCylinder) {
        if (newPrice) {
          await PriceHistory.create({
            cylinders: patchedCylinder.id,
            user: user.id,
            price: newPrice,
          });
        }
        res.ok(patchedCylinder);
      } else {
        res.notFound("Cannot update un-exist cylinder");
      }
    } catch (error) {
      res.serverError(error);
    }
  },

  searchCylinder: async function (req, res) {
    const cylinderSerial = req.query.cylinder_serial;
    if (!cylinderSerial) {
      return res.ok("Missing cylinder_serial");
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

    const user = req.userInfo;

    try {
      let manufactures = await Manufacture.find({
        isDeleted: { "!=": true },
        owner: user.parentRoot,
      });

      manufactures = manufactures.map((item) => {
        return item.id;
      });

      // manufactures = manufactures.map(item => {
      //   return ObjectId(item.id);
      // });

      const credential = {
        serial: { contains: cylinderSerial },
        manufacture: { in: manufactures },
      };

      const cylinders = await Cylinder.find({
        isDeleted: { "!=": true },
        where: credential,
        limit,
        skip,
      })
        .populate("manufacture")
        .populate("current")
        .populate("exportPlace")
        .populate("category")
        .populate("histories", {
          sort: "createdAt DESC",
          limit: 1,
        });
      const count = await Cylinder.count({ where: credential });

      // Tìm thêm thông tin Xuất Từ - Nhập Đến
      if (cylinders.length > 0) {
        await Promise.all(
          cylinders.map(async (cyl, index) => {
            if (!cyl.histories || cyl.histories.length === 0) return;

            let foundExport;
            let foundImport;

            // Trường hợp Nhập hàng
            if (cyl.histories[0].type === "IMPORT") {
              foundExport = await History.findOne({
                isDeleted: { "!=": true },
                _id: cyl.histories[0].id,
              })
                .populate("from")
                .populate("to");

              foundImport = { ...foundExport };
            }

            // Trường hợp Hồi lưu
            if (cyl.histories[0].type === "TURN_BACK") {
              foundImport = await History.findOne({
                isDeleted: { "!=": true },
                _id: cyl.histories[0].id,
              })
                .populate("from")
                .populate("to");

              // Tìm thông tin xuất từ
              const cylExport = await Cylinder.findOne({
                isDeleted: { "!=": true },
                _id: cyl.id,
              }).populate("histories", {
                where: {
                  type: "IMPORT",
                  createdAt: { "<": foundImport.createdAt },
                },
                sort: "createdAt DESC",
                limit: 1,
              });
              if (cylExport.histories && cylExport.histories.length > 0) {
                foundExport = await History.findOne({
                  isDeleted: { "!=": true },
                  _id: cylExport.histories[0].id,
                }).populate("to");

                foundExport.from = { ...foundExport.to };
                // delete foundExport.to
              }
            }

            if (cyl.histories[0].type === "EXPORT") {
              foundExport = await History.findOne({
                isDeleted: { "!=": true },
                id: cyl.histories[0].id,
              }).populate("from");
              // .populate('to')
            }

            // // Tìm thông tin xuất từ
            // const cylExport = await Cylinder.findOne({isDeleted: {"!=": true}, _id: cyl.id })
            //   .populate('histories', {
            //     where: {type: 'EXPORT'},
            //     sort: 'createdAt DESC',
            //     limit: 1,
            //   });
            // if (!cylExport.histories || cylExport.histories.length === 0) return

            // const foundExport = await History.findOne({isDeleted: {"!=": true}, _id: cylExport.histories[0].id })
            //   .populate('from')
            //   // .populate('to')

            // // Tìm thông tin nhập đến
            // const cylImport = await Cylinder.findOne({isDeleted: {"!=": true}, _id: cyl.id })
            //   .populate('histories', {
            //     where: {createdAt: {'>=': foundExport.createdAt}, type: 'IMPORT'},
            //     sort: 'createdAt DESC',
            //     limit: 1,
            //   });
            // if (!cylImport.histories || cylImport.histories.length === 0) return

            // const foundImport = await History.findOne({isDeleted: {"!=": true}, _id: cylImport.histories[0].id })
            //   // .populate('from')
            //   .populate('to')

            // // const found = await History.findOne({isDeleted: {"!=": true}, _id: cyl.histories[0].id })
            // //   .populate('from')
            // //   .populate('to')

            cylinders[index].histories = [];

            if (foundExport) {
              cylinders[index].histories[0] = foundExport;
            } else {
              cylinders[index].histories[0] = "";
            }

            if (foundImport) {
              cylinders[index].histories[1] = foundImport;
            } else {
              cylinders[index].histories[1] = "";
            }
          })
        );
      }

      const response = {
        data: cylinders,
        totalItem: count,
        // totalItem: cylinders.length,
      };
      return res.ok(response);
    } catch (error) {
      return res.ok(Utils.jsonErr(error.message));
    }
  },

  searchCylinders: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const cylindersId = req.body.findCylinders;
    let cylindersInfor = [];

    try {
      await Promise.all(
        cylindersId.map(async (idCyl) => {
          let cylinderInfor = await Cylinder.findOne({
            isDeleted: { "!=": true },
            id: idCyl,
          });
          if (cylinderInfor) {
            cylindersInfor.push(cylinderInfor);
          }
        })
      );

      if (cylindersInfor.length > 0) {
        return res.json({
          success: true,
          data_cylindersInfor: cylindersInfor,
          message: "Lấy thông tin thành công",
        });
      } else {
        return res.json({
          success: false,
          message: "Lấy thông tin không thành công",
        });
      }
    } catch (error) {
      return res.json({ success: false, message: err.message });
    }
  },

  //lấy danh sách bình có mã bị trùngg
  getCylinderDuplicate: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      actionType, // isIn: ['EXPORT', 'IMPORT', 'TURN_BACK']
      listSerial, // 'serial, ...'
    } = req.body;

    const user = req.userInfo;

    try {
      let listSuccess = [];
      let listError = [];

      // _serial = listSerial.split(',');
      const _serial = listSerial;
      let listDuplicate = await Cylinder.find({
        isDeleted: { "!=": true },
        where: {
          serial: { in: _serial },
          // or: [
          //   { isDuplicate: true },
          //   { hasDuplicate: true },
          // ],
          hasDuplicate: true,
        },
      }).populate("duplicateCylinders");

      if (listDuplicate.length > 0) {
        if (actionType === "EXPORT") {
        } else if (actionType === "IMPORT") {
        } else if (actionType === "TURN_BACK") {
          await Promise.all(
            listDuplicate.map(async (_cylinder) => {
              // // Lọc ra id danh sách bình trùng, đưa vào mảng
              // const serialCylinders = await Promise.all(_cylinder.duplicateCylinders.map(async _dupCylinder => {
              //   return _dupCylinder.copy
              // }))
              let cylinderSuccess = [];
              //let cylinderFalse = []

              await Promise.all(
                _cylinder.duplicateCylinders.map(async (_dupCylinder) => {
                  const _cylinderInfo = await Cylinder.findOne({
                    isDeleted: { "!=": true },
                    id: _dupCylinder.copy,
                  });

                  if (_cylinderInfo) {
                    if (
                      !["DELIVERING", "IN_REPAIR", "IN_FACTORY"].includes(
                        _cylinderInfo.placeStatus
                      ) &&
                      _cylinderInfo.current !== user.id
                    ) {
                      cylinderSuccess.push(_cylinderInfo);
                    }
                  }
                })
              );

              if (cylinderSuccess.length > 0) {
                _cylinder.duplicateCylinders = cylinderSuccess;
                listSuccess.push(_cylinder);
              } else {
                listError.push(_cylinder);
              }
            })
          );

          return res.json({
            status: true,
            listDuplicate: listSuccess,
            listError: listError,
          });
        }
      }

      if (listDuplicate.length > 0 && listDuplicate.length < _serial.length) {
        // Lọc ra những bình không phải bình trùng
        // Và cũng không đạt yêu cầu xuất nhập từ bước trước đó

        const listCylinder = await Promise.all(
          listDuplicate.map(async (dupCylinder) => {
            return dupCylinder.serial;
          })
        );

        const _listError = _serial.filter(
          (serial) => !listCylinder.includes(serial)
        );

        return res.json({
          status: true,
          listDuplicate: listDuplicate,
          listError: _listError,
        });
      } else if (listDuplicate.length === _serial.length) {
        return res.json({
          status: true,
          listDuplicate: listDuplicate,
          listError: [],
        });
      } else {
        return res.json({
          status: true,
          listDuplicate: [],
          listError: _serial,
        });
      }
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  //Xuất excels danh sách bình gốc có mã trùng
  getCylinderDuplicateExcels: async function (req, res) {
    try {
      const data = await Cylinder.find({
        isDeleted: { "!=": true },
        isDeleted: false,
        or: [{ isDuplicate: true }, { hasDuplicate: true }],
      });
      let specification = {
        serial: {
          // <- the key should match the actual data key
          displayName: "Số Serial", // <- Here you specify the column header
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
        checkedDate: {
          displayName: "Hạn kiểm định",
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
          // cellFormat: function (value, row) { // <- Renderer function, you can access also any row.property
          //   // return value + ' kg';
          //   return value;
          // },
          width: 100, // <- width in chars (when the number is passed as string)
        },
        currentSalePrice: {
          displayName: "Giá bán",
          headerStyle: styles.cellGreen,
          // cellFormat: function(value, row) { // <- Renderer function, you can access also any row.property
          //   return (value === 1) ? 'Active' : 'Inactive';
          // },
          width: 100, // <- width in chars (when the number is passed as string)
        },
      };

      // let dataSet = await ReportServices.getDataForReport(data);

      const dataSet = await Promise.all(
        data.map(async (cylinder) => {
          return {
            serial: cylinder.serial,
            color: cylinder.color,
            checkedDate: cylinder.checkedDate,
            valve: cylinder.valve,
            weight: cylinder.weight,
            currentSalePrice: cylinder.currentSalePrice,
          };
        })
      );

      let cylinder = excel.buildExport([
        // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
        {
          name: "Cylinder", // <- Specify sheet name (optional)
          //heading: heading, // <- Raw heading array (optional)
          specification: specification,
          data: dataSet, // <-- Report data
        },
      ]);

      res.setHeader("Content-disposition", "attachment; filename=report.xlsx");
      res.setHeader(
        "Content-type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      return res.send(cylinder);
    } catch (err) {
      return res.serverError(Utils.jsonErr(err.message));
    }
  },

  ExportCylinder: async function (req, res) {
    // const driver = req.body.driver;
    //const license_plate = req.body.license_plate;
    try {
      const cylinders = req.body.cylinders;
      const from = req.body.from;
      // const chkcurent = await User.findOne({isDeleted: {"!=": true},
      //     _id : curent
      // })

      let _DupCylinder = [];

      const obj = {};
      const arr1 = [];
      const arr2 = [];
      const arr3 = [];

      _DupCylinder = await Cylinder.find({
        isDeleted: { "!=": true },
        _id: cylinders,
      }).populate("duplicateCylinders");
      let dataDup = [];
      let data = [];
      if (!_DupCylinder.length) {
        return res.badRequest(
          Utils.jsonErr("Danh sách bình không chính xác!!!")
        );
      }
      for (let i = 0; i < _DupCylinder.length; i++) {
        if (
          _DupCylinder[i].placeStatus === "IN_CUSTOMER" ||
          _DupCylinder[i].placeStatus === "DELIVERING" ||
          from !== _DupCylinder[i].current
        ) {
          arr2.push(_DupCylinder[i]);
        } else {
          arr1.push(_DupCylinder[i]);
        }
      }
      for (let i = 0; i < arr2.length; i++) {
        let temp = 0;
        for (let j = 0; j < arr2[i].duplicateCylinders.length; j++) {
          const cylinder = await Cylinder.find({
            isDeleted: { "!=": true },
            _id: arr2[i].duplicateCylinders[j].copy,
          });
          for (let y = 0; y < cylinder.length; y++) {
            if (
              cylinder[y].placeStatus === "DELIVERING" ||
              cylinder[y].placeStatus === "IN_CUSTOMER" ||
              from !== cylinder[y].current
            ) {
              //arr1.push(cylinder[i].serial)
              //temp ++;
            } else {
              //if(temp ===0)
              arr1.push(cylinder[y]);
              temp++;
            }
          }
          //data.push(_DupCylinder[i].duplicateCylinders[j].copy)
        }
        if (temp === 0) {
          arr3.push(arr2[i]);
          // return res.json({

          // })
        }
      }
      for (let z = 0; z < arr1.length; z++) {
        let id = arr1[z].id;
        let updateCylinder = await Cylinder.updateOne({
          isDeleted: { "!=": true },
          _id: id,
        }).set({
          placeStatus: "DELIVERING",
        });
        // res.json({
        //   Cylinder:updateCylinder
        // })
      }
      if (arr2)
        res.json({
          data1: arr1,
          data2: arr3,
        });

      // for(let i=0;i<_DupCylinder.length;i++){
      //   if(_DupCylinder[i].placeStatus ==='DELIVERING' || _DupCylinder[i].placeStatus ==='IN_CUSTOMER')
      //     {
      //       fo
      //     }
      // }

      // const Err = _DupCylinder.findIndex(
      //   cylinder => cylinder.placeStatus ==='DELIVERING'||cylinder.placeStatus==='IN_CUSTOMER'

      // )
      // if(Err >=0){
      //   return res.badRequest(Utils.jsonErr('Danh sách bình không chính xác!!!'));
      // }
      //else{
      //_DupCylinder = await Cylinder.find({isDeleted: {"!=": true}, id: { in: cylinders } })
      //res.json({
      //data : _DupCylinder
      // })
      //}
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },

  importcylinder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const listCylinder = req.body.cylinders;
      const toArray = req.body.toArray;
      let listimport = [];
      let listnoimport = [];

      const CylinderList = await Promise.all(
        listCylinder.map(async (element) => {
          return await Cylinder.findOne({
            isDeleted: { "!=": true },
            _id: element,
          }).populate("duplicateCylinders");
        })
      );

      for (let i = 0; i < CylinderList.length; i++) {
        let temp = 0;
        if (
          CylinderList[i].placeStatus === "DELIVERING" &&
          CylinderList[i].current == toArray
        ) {
          if (temp == 0) {
            listimport.push(CylinderList[i].serial);
            temp = 1;
          }
        } else {
          listnoimport.push(CylinderList[i].serial);
        }

        const CylinderDuplicateList = await Promise.all(
          CylinderList[i].duplicateCylinders.map(async (element) => {
            return await Cylinder.findOne({
              isDeleted: { "!=": true },
              _id: element.copy,
            });
          })
        );

        for (let j = 0; j < CylinderDuplicateList.length; j++) {
          if (
            CylinderDuplicateList[j].placeStatus === "DELIVERING" &&
            CylinderDuplicateList[j].current == toArray
          ) {
            if (temp == 0) {
              listimport.push(CylinderDuplicateList[j].serial);
              temp = 1;
            }
          } else {
            listnoimport.push(CylinderDuplicateList[j].serial);
          }
        }
        temp = 0;
      }

      const UpdateCylinder = await Promise.all(
        listimport.map(async (element) => {
          return await Cylinder.updateOne({
            isDeleted: { "!=": true },
            serial: element,
          }).set({
            placeStatus: "IN_FACTORY",
          });
        })
      );

      return res.json({
        status: true,
        Import: listimport,
        NoImport: listnoimport,
      });
    } catch (err) {
      return res.json({ status: false, message: err.message });
    }
  },

  // Tự động khai báo
  // Cần bổ sung thông tin
  autoCreateCylinder: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { userId, serials } = req.body;

    if (!userId) {
      return res.badRequest(Utils.jsonErr("userId is required"));
    }

    if (!Array.isArray(serials)) {
      return res.badRequest(Utils.jsonErr("Wrong serials type"));
    }

    if (serials.length === 0) {
      return res.badRequest(Utils.jsonErr("Empty serials"));
    }

    try {
      // Tìm thông tin user
      const userInfo = await User.findOne({
        isDeleted: { "!=": true },
        id: userId,
      });
      if (!userInfo) {
        return res.badRequest(Utils.jsonErr("Not found user"));
      }

      let placeStatus = "";
      switch (userInfo.userType) {
        case "Factory":
          placeStatus = "IN_FACTORY";
          break;
        case "Fixer":
          placeStatus = "IN_REPAIR";
          break;
        case "General":
          placeStatus = "IN_GENERAL";
          break;
        case "Agency":
          placeStatus = "IN_AGENCY";
          break;
        default:
          break;
      }
      if (!placeStatus) {
        return res.badRequest(
          Utils.jsonErr("Không có đủ thẩm quyền để tạo bình")
        );
      }

      // Tìm parentRoot
      const parent = await getRootParent(userId);

      // Tìm danh sách loại bình
      const cylinderCategory = await CategoryCylinder.find({
        isDeleted: { "!=": true },
        createdBy: parent,
        isDeleted: false,
      });
      // Mặc định loại 12Kg
      let _type12;
      const indexCategory = cylinderCategory.findIndex((category) => {
        return category.mass === 12;
      });
      if (indexCategory > -1) {
        _type12 = [cylinderCategory[indexCategory]];
      }

      // Tìm danh sách thương hiệu
      const cylinderManufacture = await Manufacture.find({
        isDeleted: { "!=": true },
        owner: parent,
        isDeleted: false,
      });

      // *** Thương hiệu ***
      // 'DK': GAS DẦU KHÍ
      // 'DG': DAK GAS,
      // 'VT': VT GAS,
      // 'AG': A GAS,
      // 'PV': PETROVIETNAM GAS,
      // 'DP': ĐẶNG PHƯỚC GAS,
      // 'JP': JP GAS
      const _manufactureCode = ["DK", "DG", "VT", "AG", "PV", "DP", "JP"];

      // *** Loại bình ***
      // 'Z': 6
      // 'X': 12
      // 'C': 20
      // 'V': 45
      const _cylinderType = [
        { character: "Z", code: "B6", weight: 8 },
        { character: "X", code: "B12", weight: 13 },
        { character: "C", code: "B20", weight: 19 },
        { character: "V", code: "B45", weight: 38 },
      ];

      // const serials = ['DGHX085651', 'DGHX078292', 'VTDG085651', 'VTHX082341', 'AGHX085651']

      // const regex = new RegExp(`^${manufacture[0]}`)
      // const find = serials.filter(serial => serial.search(regex) !== -1)

      const groupManufactureAndType = [];

      // Nhóm danh sách mã bình theo thương hiệu và loại bình
      cylinderManufacture.forEach((manufacture) => {
        _cylinderType.forEach((type) => {
          const regex = new RegExp(
            `^(?=${manufacture.code})(?=...${type.character})`
          );

          const found = _.remove(serials, (serial) => {
            return serial.search(regex) !== -1;
          });

          if (found.length > 0) {
            // Tìm thông tin loại bình
            const _indexCategory = cylinderCategory.findIndex((category) => {
              return category.character === type.character;
            });
            let _type = "";
            if (_indexCategory > -1) {
              _type = cylinderCategory[_indexCategory];
            }

            groupManufactureAndType.push({
              manufacture: manufacture.id,
              cylinderType: _type ? _type.id : _type12 ? _type12.id : null,
              weight: type.weight,
              serials: found,
            });
          }
        });
      });

      // Tạo cấu trúc dữ liệu trả về
      let returnData = {
        success: false,
        resCode: "",
        message: "",
        successCylinder: [],
        errorCylinder: [],
      };

      const ID_IMEX = Date.now();

      // Khai báo bình
      await Promise.all(
        groupManufactureAndType.map(async (group) => {
          await Promise.all(
            group.serials.map(async (serial) => {
              const exitsCylinder = await Cylinder.findOne({
                isDeleted: { "!=": true },
                serial: serial,
              });
              if (exitsCylinder) {
                returnData.errorCylinder.push(serial);
              } else {
                const cylinder = await Cylinder.create({
                  serial: serial,
                  color: "Thông tin ghi trên vỏ bình",
                  valve: "Thông tin ghi trên vỏ bình",
                  weight: group.weight,
                  checkedDate: new Date(2025, 1, 1).toISOString(),
                  category: group.cylinderType,
                  classification: "Old",
                  manufacture: group.manufacture,
                  manufacturedBy: userId,
                  current: userId,
                  factory: parent,
                  placeStatus: placeStatus,
                  createdBy: userId,
                  needMoreInfo: true,
                }).fetch();

                if (!cylinder) {
                  returnData.errorCylinder.push(serial);
                } else {
                  await CylinderImex.create({
                    cylinder: cylinder.id,
                    status: "EMPTY",
                    condition: cylinder.classification.toUpperCase(),
                    idImex: ID_IMEX,
                    typeImex: "IN",
                    flow: "CREATE",
                    category: cylinder.category,
                    manufacture: cylinder.manufacture,
                    createdBy: userId,
                    objectId: userId,
                  });

                  returnData.successCylinder.push(cylinder.id);
                }
              }
            })
          );
        })
      );

      if (returnData.successCylinder.length === 0) {
        returnData.resCode = "ERROR-00048";
        returnData.message = "Không khai báo được mã bình nào";
      } else if (returnData.successCylinder.length === serials.length) {
        returnData.success = true;
        returnData.resCode = "SUCCESS-00013";
        returnData.message = "Tất cả bình được khai báo thành công";
      } else {
        returnData.success = true;
        returnData.resCode = "SUCCESS-00014";
        returnData.message = `Khai báo thành công ${returnData.successCylinder.length} mã bình, không thành công ${returnData.errorCylinder.length} mã bình`;
      }

      return res.json(returnData);
    } catch (error) {
      return res.serverError("Gặp lỗi khi khai báo tự động");
    }
  },

  // Lấy danh sách bình cho máy PDA
  cylindersForPDA: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty query"));
    }

    const { parentRoot } = req.query;

    try {
      const cylinders = await Cylinder.find({
        isDeleted: { "!=": true },
        where: {
          current: req.userInfo.id,
          factory: parentRoot,
          placeStatus: { "!=": "DELIVERING" },
          status: { "!=": "DISABLED" },
        },
        // select: ['serial', 'checkedDate', 'current']
      });

      const cyls = cylinders.map((cyl) => {
        return {
          serial: cyl.serial,
          checkedDate: cyl.checkedDate,
          current: cyl.current,
        };
      });

      return res.json({
        data: cyls,
        message: "Lấy danh sách bình thành công",
      });
    } catch (error) {
      return res.serverError("Gặp lỗi khi lấy danh sách bình");
    }
  },

  // Lấy danh sách xuất bình cho máy PDA
  cylindersExportForPDA: async function (req, res) {
    // if (Object.keys(req.query).length === 0) {
    //   return res.badRequest(Utils.jsonErr('Empty query'));
    // }

    let { period, date } = req.query;

    let endDate;
    if (!date) {
      endDate = new Date();
      // endDate = new Date('2021-09-12T13:58:43.599Z')
    } else {
      endDate = new Date(date);
    }

    let startDate;
    if (!period) {
      const milliseconds = endDate.getTime() - 172800000; // 2 days
      startDate = new Date(milliseconds);
    } else {
      periodDays = parseInt(period);
      if (periodDays > 7) {
        // Khoảng thời gian tối đa 7 ngày
        periodDays = 7;
      }
      const milliseconds = endDate.getTime() - periodDays * 1000 * 60 * 60 * 24;
      startDate = new Date(milliseconds);
    }

    try {
      // Tìm bản ghi xuất bình
      const exportHistories = await History.find({
        isDeleted: { "!=": true },
        where: {
          from: req.userInfo.id,
          type: "EXPORT",
          createdAt: { ">=": startDate, "<=": endDate },
        },
        // select: ['createdAt']
      }).populate(
        "cylinders" /* , {
          select: ['serial', 'checkedDate', 'current']
        } */
      );

      // // Tìm bản ghi xuất bình
      // const exportHistories = await CylinderImex.find({isDeleted: {"!=": true},
      //   where: {
      //     objectId: req.userInfo.id,
      //     typeImex: 'OUT',
      //     createdAt: { '>=': startDate, '<=': endDate }
      //   },
      //   select: ['createdAt']
      // })
      //   .populate('cylinder', /* {
      //     select: ['serial', 'checkedDate', 'current']
      //   } */)

      const cylinders = exportHistories.reduce((previousValue, history) => {
        const cyls = history.cylinders.map((cyl) => {
          return {
            serial: cyl.serial,
            checkedDate: cyl.checkedDate,
            current: cyl.current,
          };
        });

        return previousValue.concat(...cyls);

        // return previousValue.concat(...history.cylinders)
      }, []);

      return res.json({
        data: cylinders,
        message: "Lấy danh sách bình thành công",
      });
    } catch (error) {
      return res.serverError("Gặp lỗi khi lấy danh sách bình");
    }
  },

  // Lấy danh sách nhập bình cho máy PDA
  cylindersImportForPDA: async function (req, res) {
    // if (Object.keys(req.query).length === 0) {
    //   return res.badRequest(Utils.jsonErr('Empty query'));
    // }

    let { period, date } = req.query;

    let endDate;
    if (!date) {
      endDate = new Date();
      // endDate = new Date('2021-09-12T13:58:43.599Z')
    } else {
      endDate = new Date(date);
    }

    let startDate;
    if (!period) {
      const milliseconds = endDate.getTime() - 172800000; // 2 days
      startDate = new Date(milliseconds);
    } else {
      periodDays = parseInt(period);
      if (periodDays > 7) {
        // Khoảng thời gian tối đa 7 ngày
        periodDays = 7;
      }
      const milliseconds = endDate.getTime() - periodDays * 1000 * 60 * 60 * 24;
      startDate = new Date(milliseconds);
    }

    try {
      // Tìm bản ghi nhập bình
      const importHistories = await History.find({
        isDeleted: { "!=": true },
        where: {
          to: req.userInfo.id,
          type: {
            in: [
              "IMPORT",
              "TURN_BACK",
              "RETURN",
              "GIVE_BACK",
              "TURN_BACK_NOT_IN_SYSTEM",
            ],
          },
          createdAt: { ">=": startDate, "<=": endDate },
        },
        // select: ['createdAt']
      }).populate(
        "cylinders" /* , {
          select: ['serial', 'checkedDate', 'current']
        } */
      );

      // let cylinders = []
      // if (exportHistories.length > 0) {

      // }
      const cylinders = importHistories.reduce((previousValue, history) => {
        const cyls = history.cylinders.map((cyl) => {
          return {
            serial: cyl.serial,
            checkedDate: cyl.checkedDate,
            current: cyl.current,
          };
        });

        return previousValue.concat(...cyls);

        // return previousValue.concat(...history.cylinders)
      }, []);

      return res.json({
        data: cylinders,
        message: "Lấy danh sách bình thành công",
      });
    } catch (error) {
      return res.serverError("Gặp lỗi khi lấy danh sách bình");
    }
  },

  // Kiểm tra trạng thái bình cho máy PDA
  checkCylinderForPDA: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    let {
      body: { type, serial },
      userInfo,
    } = req;

    const TYPE = [
      "EXPORT",
      "IMPORT",
      "TURN_BACK",
      "EXPORT_CELL",
      "IMPORT_CELL",
    ];
    if (!TYPE.includes(type)) {
      return res.badRequest(Utils.jsonErr("Wrong type"));
    }

    if (!serial) {
      return res.badRequest(Utils.jsonErr("serial is required"));
    }

    try {
      // Tìm thông tin bình trong hệ thống
      const cylinder = await Cylinder.findOne({
        isDeleted: { "!=": true },
        serial,
      }).populate("histories", {
        limit: 1,
        sort: "createdAt DESC",
      });
      if (!cylinder) {
        return res.badRequest(Utils.jsonErr("serial not found"));
      }

      // Kiểm tra điều kiện dựa trên type
      // Xuất hàng
      if (type === "EXPORT") {
        // Kiểm tra bình đang vận chuyển hoặc không ở cơ sở hiện tại
        if (
          cylinder.placeStatus === "DELIVERING" ||
          cylinder.placeStatus === "IN_CUSTOMER" ||
          cylinder.current !== userInfo.id
        ) {
          return res.badRequest(
            Utils.jsonErr(
              "Mã này đang vận chuyển, đã bán hoặc đang không ở doanh nghiệp sở tại nên không thể xuất"
            )
          );
        }
      }

      // Nhập hàng
      if (type === "IMPORT") {
        // Kiểm tra bình đang không vận chuyển
        if (cylinder.placeStatus !== "DELIVERING") {
          return res.badRequest(
            Utils.jsonErr("Mã này chưa xuất nên không thể nhập")
          );
        }

        // Kiểm tra thông tin xuất hàng
        if (cylinder.histories.length === 0) {
          return res.badRequest(Utils.jsonErr("Không có thông tin xuất"));
        }

        // Kiểm tra thông tin điểm nhập
        if (!cylinder.histories[0].toArray) {
          return res.badRequest(Utils.jsonErr("Không có thông tin điểm nhập"));
        }

        // Kiểm tra địa điểm nhập
        if (cylinder.histories[0].toArray.id !== user.id) {
          return res.badRequest(
            Utils.jsonErr("Mã này không nhập cho đơn vị sở tại")
          );
        }
      }

      // Hồi lưu
      if (type === "TURN_BACK") {
        // Check mã đang Vận chuyển
        if (cylinder.placeStatus === "DELIVERING") {
          return res.badRequest(
            Utils.jsonErr("Mã này đang vận chuyển nên không thể hồi lưu")
          );
        }

        // Check những mã đã hồi lưu
        if (cylinder.current === userInfo.id) {
          return res.badRequest(
            Utils.jsonErr("Mã này đã hồi lưu nên không thể hồi lưu tiếp")
          );
        }
      }

      // Xuất vỏ
      if (type === "EXPORT_CELL") {
        // Kiểm tra bình đang vận chuyển hoặc không ở cơ sở hiện tại
        if (
          cylinder.placeStatus === "DELIVERING" ||
          cylinder.placeStatus === "IN_CUSTOMER" ||
          cylinder.current !== userInfo.id
        ) {
          return res.badRequest(
            Utils.jsonErr(
              "Mã này đang vận chuyển, đã bán hoặc đang không ở doanh nghiệp sở tại nên không thể xuất"
            )
          );
        }
      }

      // Nhập vỏ
      if (type === "IMPORT_CELL") {
        // Kiểm tra bình đang không vận chuyển
        if (cylinder.placeStatus !== "DELIVERING") {
          return res.badRequest(
            Utils.jsonErr("Mã này chưa xuất nên không thể nhập")
          );
        }

        // Kiểm tra thông tin xuất hàng
        if (cylinder.histories.length === 0) {
          return res.badRequest(Utils.jsonErr("Không có thông tin xuất"));
        }

        // Kiểm tra thông tin điểm nhập
        if (!cylinder.histories[0].toArray) {
          return res.badRequest(Utils.jsonErr("Không có thông tin điểm nhập"));
        }

        // Kiểm tra địa điểm nhập
        if (cylinder.histories[0].toArray.id !== user.id) {
          return res.badRequest(
            Utils.jsonErr("Mã này không nhập cho đơn vị sở tại")
          );
        }
      }

      return res.json({
        data: cylinder,
        message: "Bình đạt điều kiện",
      });
    } catch (error) {
      return res.serverError("Gặp lỗi khi kiểm tra điều kiện bình");
    }
  },
};

// =============== get Available Cylinders suitable by action ===================

async function getSuitableCylinders(
  res,
  user,
  actionType,
  requestSerials,
  cylinders
) {
  /**
   *  enum for action type
   *  EXPORT: Hành động xuất bình đầy
   *  EXPORT_STATION: Hành động xuất từ factory --> Station (cho phép bình rỗng và đầy)
   *  IMPORT: Hành động nhập bình
   **/

  let returnData = {
    success: true,
    err_msg: "",
    //
    errCyl_notCreated: [],
    errCyl_notInSystem: [],
    // EXPORT
    errCyl: [],
    // IMPORT
    errCyl_notDelivering: [],
    errCyl_notCorrectDestination: [],
    //TURN_BACK
    errCyl_delivering: [],
    errCyl_current: [],
    errCyl_inFixer: [],
    errCyl_inFactory: [],
    //
    success_cylinders: [],
    success_idCylinders: [],
    resCode: "",
  };

  // let begin = Date.now()
  // let end = 0
  if (cylinders.length > 0) {
    // Check những mã request không trong hệ thống
    const cylinderSerials = getArrayOfSerials(cylinders);
    const serialNotInSystemTree = _.difference(requestSerials, cylinderSerials);
    if (serialNotInSystemTree.length > 0) {
      // return res.ok({
      //   err_msg: `Những mã này không nằm trong Hệ thống của bạn : ${serialNotInSystemTree.join(',')}`,
      //   resCode: 'ERROR-00098'
      // })
      _.remove(cylinders, (o) => {
        return serialNotInSystemTree.includes(o.id);
      });

      returnData.errCyl_notCreated = serialNotInSystemTree;
    }

    // Nếu action là EXPORT
    if (actionType === "EXPORT") {
      // Cấu trúc dữ liệu trả về khi bị lỗi
      // let returnData = {
      //   success: true,
      //   err_msg: '',
      //   errCyl: [],
      //   success_cylinders: [],
      //   success_idCylinders: [],
      // }

      Object.assign(returnData, {
        success: true,
        err_msg: "",
        errCyl: [],
        success_cylinders: [],
        success_idCylinders: [],
      });

      const deliveringCylinders = _.remove(cylinders, (o) => {
        return (
          o.placeStatus === "DELIVERING" ||
          o.placeStatus === "IN_CUSTOMER" ||
          o.current !== user.id
        );
      }); // Check những mã đang Vận chuyển
      // if (deliveringCylinders.length > 0) { return res.ok(Utils.jsonErr(`Những mã này đang vận chuyển, đã bán hoặc đang không ở doanh nghiệp sở tại nên không thể xuất : ${getArrayOfSerials(deliveringCylinders).join(',')}`)); }

      returnData.success_cylinders = getArrayOfSerials(cylinders);
      returnData.success_idCylinders = getArrayOfIds(cylinders);

      if (deliveringCylinders.length > 0) {
        returnData.success = false;
        returnData.errCyl = getArrayOfSerials(deliveringCylinders);
        returnData.err_msg = `Những mã này đang vận chuyển, đã bán hoặc đang không ở doanh nghiệp sở tại nên không thể xuất : ${returnData.errCyl.join(
          ","
        )}`;
        // returnData.success_cylinders = getArrayOfSerials(cylinders)
        // returnData.success_idCylinders = getArrayOfIds(cylinders)

        return res.ok(returnData);
      }
    }

    // Nếu action là EXPORT_STATION
    // if(actionType === 'EXPORT_STATION') {
    //   const deliveringCylinders = _.filter(cylinders, o => {return (o.placeStatus === 'DELIVERING' || o.placeStatus === 'IN_CUSTOMER' || o.current !== user.id );}); // Check những mã đang Vận chuyển
    //   if(deliveringCylinders.length > 0) {return res.ok(Utils.jsonErr(`Những mã này đang vận chuyển, đã bán hoặc đang không ở doanh nghiệp sở tại nên không thể xuất : ${getArrayOfSerials(deliveringCylinders).join(',')}`));}
    // }

    // Nếu action là IMPORT

    if (actionType === "IMPORT") {
      // Cấu trúc dữ liệu trả về khi bị lỗi
      // let returnData = {
      //   success: true,
      //   err_msg: '',
      //   errCyl_notDelivering: [],
      //   errCyl_notCorrectDestination: [],
      //   success_cylinders: [],
      //   success_idCylinders: [],
      // }

      Object.assign(returnData, {
        success: true,
        err_msg: "",
        errCyl_notDelivering: [],
        errCyl_notCorrectDestination: [],
        success_cylinders: [],
        success_idCylinders: [],
      });

      // let _startTime = Date.now();
      // let _endTime = 0;
      // let time = {}
      const notDeliveringCylinders = _.remove(cylinders, (o) => {
        return o.placeStatus !== "DELIVERING";
      }); // Check những mã đang không vận chuyển
      // if (notDeliveringCylinders.length > 0) { return res.ok(Utils.jsonErr(`Những mã này chưa xuất nên không thể nhập : ${getArrayOfSerials(notDeliveringCylinders).join(',')}`)); }

      if (notDeliveringCylinders.length > 0) {
        returnData.success = false;
        returnData.errCyl_notDelivering = getArrayOfSerials(
          notDeliveringCylinders
        );
      }

      const notCorrectDestination = _.remove(cylinders, (o) => {
        if (o.histories.length > 0) {
          const lastHistory = o.histories[o.histories.length - 1];
          if (lastHistory.toArray.length > 0) {
            return (
              _.find(lastHistory.toArray, (i) => {
                return i.id === user.id;
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
      //   return res.ok(Utils.jsonErr(`Những mã không thể nhập vì không xuất cho doanh nghiệp sở tại : ${getArrayOfSerials(notCorrectDestination).join(',')}`));
      // }
      // else {
      //   _endTime = Date.now();
      //   time = {
      //     _startTime,
      //     _endTime
      //   }
      //   cylinders.push(time)
      // }
      if (notCorrectDestination.length > 0) {
        returnData.success = false;
        returnData.errCyl_notCorrectDestination = getArrayOfSerials(
          notCorrectDestination
        );
      }

      returnData.success_cylinders = getArrayOfSerials(cylinders);
      returnData.success_idCylinders = getArrayOfIds(cylinders);
      returnData.successCylinders = cylinders;

      if (!returnData.success) {
        returnData.err_msg = `Có ${
          returnData.errCyl_notDelivering.length
        } mã chưa xuất nên không thể nhập: ${returnData.errCyl_notDelivering.join(
          ","
        )}\n
        Có ${
          returnData.errCyl_notCorrectDestination.length
        } mã không thể nhập vì không xuất cho doanh nghiệp sở tại: ${returnData.errCyl_notCorrectDestination.join(
          ","
        )}\n`;
        // returnData.success_cylinders = getArrayOfSerials(cylinders)
        // returnData.success_idCylinders = getArrayOfIds(cylinders)
        // returnData.successCylinders = cylinders

        return res.ok(returnData);
      }
    }

    if (actionType === "TURN_BACK") {
      // Cấu trúc dữ liệu trả về khi bị lỗi
      // let returnData = {
      //   success: true,
      //   err_msg: '',
      //   errCyl_delivering: [],
      //   errCyl_current: [],
      //   errCyl_inFixer: [],
      //   errCyl_inFactory: [],
      //   success_cylinders: [],
      //   success_idCylinders: [],
      // }

      Object.assign(returnData, {
        success: true,
        err_msg: "",
        errCyl_delivering: [],
        errCyl_current: [],
        errCyl_inFixer: [],
        errCyl_inFactory: [],
        success_cylinders: [],
        success_idCylinders: [],
      });

      // Check những mã đang Vận chuyển
      const deliveringCylinders = _.remove(cylinders, (o) => {
        return o.placeStatus === "DELIVERING";
      });
      if (deliveringCylinders.length > 0) {
        returnData.success = false;
        returnData.errCyl_delivering = getArrayOfSerials(deliveringCylinders);

        //  return res.ok(Utils.jsonErr(`Những mã này đang vận chuyển nên không thể nhập : ${getArrayOfSerials(deliveringCylinders).join(',')}`));
        //  res.ok({
        //   err_msg: `Những mã này đang vận chuyển nên không thể nhập : ${arrSerial.join(',')}`,
        //   errSerials: arrSerial,
        // })
      }
      // Check những mã đã hồi lưu
      const currentCylinders = _.remove(cylinders, (o) => {
        return o.current === user.id;
      });
      if (currentCylinders.length > 0) {
        returnData.success = false;
        returnData.errCyl_current = getArrayOfSerials(currentCylinders);

        // return res.ok(Utils.jsonErr(`Những mã này đã hồi lưu nên không thể hồi lưu tiếp : ${getArrayOfSerials(currentCylinders).join(',')}`));
        //  res.ok({
        //   err_msg: `Những mã này đã hồi lưu nên không thể hồi lưu tiếp : ${arrSerial.join(',')}`,
        //   errSerials:arrSerial,
        // })
      }
      // Check những mã ở nhà máy
      const inFixer = _.remove(cylinders, (o) => {
        return o.placeStatus === "IN_REPAIR";
      });
      if (inFixer.length > 0) {
        returnData.success = false;
        returnData.errCyl_inFixer = getArrayOfSerials(inFixer);

        // return res.ok(Utils.jsonErr(`Những mã này đang ở nhà máy : ${getArrayOfSerials(inFixer).join(',')}`));
        //  res.ok({
        //   err_msg: `Những mã này đang ở nhà máy : ${arrSerial.join(',')}`,
        //   errSerials: arrSerial,
        // })
      }
      // Check những mã ở trạm
      const inFactory = _.remove(cylinders, (o) => {
        return o.placeStatus === "IN_FACTORY";
      });
      if (inFactory.length > 0) {
        returnData.success = false;
        returnData.errCyl_inFactory = getArrayOfSerials(inFactory);

        //  res.ok({
        //   err_msg: `Những mã này đang ở trạm : ${arrSerial.join(',')}`,
        //   errSerials: arrSerial,
        // })
      }

      returnData.success_cylinders = getArrayOfSerials(cylinders);
      returnData.success_idCylinders = getArrayOfIds(cylinders);

      if (!returnData.success) {
        returnData.err_msg = `Có ${returnData.errCyl_delivering.length} bình đang vận chuyển\n
        Có ${returnData.errCyl_current.length} bình đã hồi lưu\n
        Có ${returnData.errCyl_inFixer.length} bình ở nhà máy khác\n
        Có ${returnData.errCyl_inFactory.length} bình ở trạm khác\n`;
        // returnData.success_cylinders = getArrayOfSerials(cylinders)
        // returnData.success_idCylinders = getArrayOfIds(cylinders)

        return res.ok(returnData);
      }
    }

    // cylinders.push({
    //   begin,
    //   end:Date.now()
    // })

    if (serialNotInSystemTree.length > 0) {
      returnData.err_msg = `Những mã này không nằm trong Hệ thống của bạn : ${serialNotInSystemTree.join(
        ","
      )}`;
      returnData.resCode = "ERROR-00099";

      return res.ok(returnData);
    } else {
      return res.ok(cylinders);
    }
  } else {
    // return res.ok({
    //   err_msg: 'Không tìm thấy bất kì mã nào',
    //   resCode: 'ERROR-00098'
    // });

    returnData.errCyl_notCreated = requestSerials;
    returnData.err_msg = "Không tìm thấy bất kì mã nào";
    returnData.resCode = "ERROR-00098";

    return res.ok(returnData);
  }
}

// Kiểm tra điều kiện khi hồi lưu bình đầy
async function getSuitableReturnCylinders(
  res,
  user,
  actionType,
  requestSerials,
  cylinders
) {
  let returnData = {
    success: true,
    err_msg: "",
    //
    errCyl_notCreated: [],
    // errCyl_notInSystem: [],
    //RETURN
    errCyl_notEligibleForReturn: [],
    //
    success_cylinders: [],
    success_idCylinders: [],
    resCode: "",
  };

  if (cylinders.length > 0) {
    // Check những mã request không trong hệ thống
    const cylinderSerials = getArrayOfSerials(cylinders);
    const serialNotInSystemTree = _.difference(requestSerials, cylinderSerials);
    if (serialNotInSystemTree.length > 0) {
      // return res.ok({
      //   err_msg: `Những mã này không nằm trong Hệ thống của bạn : ${serialNotInSystemTree.join(',')}`,
      //   resCode: 'ERROR-00098'
      // })
      _.remove(cylinders, (o) => {
        return serialNotInSystemTree.includes(o.id);
      });

      returnData.errCyl_notCreated = serialNotInSystemTree;
    }

    if (actionType === "RETURN") {
      // Chỉ hồi lưu những bình Đang vận chuyển, ở Đại lý hoặc CHBL
      // Loại bỏ những trường hợp còn lại
      const notEligibleForReturn = _.remove(cylinders, (o) => {
        return (
          o.placeStatus === "IN_CUSTOMER" ||
          o.placeStatus === "IN_FACTORY" ||
          o.placeStatus === "IN_REPAIR" ||
          o.placeStatus === "IN_STATION"
        );
      });
      if (notEligibleForReturn.length > 0) {
        returnData.success = false;
        returnData.errCyl_notEligibleForReturn =
          getArrayOfSerials(notEligibleForReturn);
      }

      returnData.success_cylinders = getArrayOfSerials(cylinders);
      returnData.success_idCylinders = getArrayOfIds(cylinders);

      if (!returnData.success) {
        returnData.err_msg = `Có ${returnData.errCyl_notEligibleForReturn.length} bình không đạt điều kiện hồi lưu\n
        Có ${returnData.errCyl_notCreated.length} bình không nằm trong Hệ thống của bạn`;

        return res.ok(returnData);
      }
    } else {
      return res.badRequest(Utils.jsonErr("sai actionType"));
    }

    if (serialNotInSystemTree.length > 0) {
      returnData.err_msg = `Những mã này không nằm trong Hệ thống của bạn : ${serialNotInSystemTree.join(
        ","
      )}`;
      returnData.resCode = "ERROR-00101";

      return res.ok(returnData);
    } else {
      return res.ok(returnData);
    }
  } else {
    returnData.errCyl_notCreated = requestSerials;
    returnData.err_msg = "Không tìm thấy bất kì mã nào";
    returnData.resCode = "ERROR-00100";

    return res.ok(returnData);
  }
}

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
