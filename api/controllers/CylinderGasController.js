/**
 * CylinderGasController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const API_ERRORS = require("../constants/APIErrors");
const LogType = require("../constants/LogType");
const { Factory } = require("../constants/UserTypes");
const USER_TYPE = require("../constants/UserTypes");
const USER_ROLE = require("../constants/UserRoles");
// const CylinderGas = require('../models/CylinderGas');

module.exports = {
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

    // if (req.userInfo.userType !== 'Factory') {
    //   return res.badRequest(Utils.jsonErr('Bạn không có đủ thẩm quyền'));
    // }

    try {
      const exitsCylinder = await CylinderGas.findOne({
        isDeleted: { "!=": true },
        where: { serial: body.serial, manufacture: body.manufacture },
      });
      if (exitsCylinder) {
        return res.badRequest(Utils.jsonErr(API_ERRORS.EXIST_MODEL));
      }

      body.factory = req.body.id;
      if (
        body.cylinderAt_childFactory === undefined ||
        !body.cylinderAt_childFactory
      ) {
        body.current = req.body.id;
      } else {
        body.current = body.cylinderAt_childFactory;

        const fixerComp = await User.findOne({
          isDeleted: { "!=": true },
          id: body.cylinderAt_childFactory,
        });

        if (fixerComp.userType === "Fixer") body.placeStatus = "IN_REPAIR";
      }

      const cylinder = await CylinderGas.create(body).fetch();

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
        createdBy: req.body.id,

        objectId: req.body.id,
        // history: null,
      });

      return res.created(cylinder);
    } catch (err) {
      return res.serverError(Utils.jsonErr(err));
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
    patch.updateBy = idUser;

    try {
      const patchedCylinder = await CylinderGas.updateOne({
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
          "Empty request cylinder_serials, cylinder_serials must be id array"
        )
      );
    }

    credential.serial = cylinderSerial;
    //credential.factory = parentRoot;

    try {
      let cylinders = [];
      if (actionType === "CHANGE_DATE") {
        cylinders = await CylinderGas.find(credential);
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
        cylinders = await CylinderGas.find(credential).populate("histories");

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

      const credential = {
        serial: { contains: cylinderSerial },
        manufacture: { in: manufactures },
      };

      const cylinders = await CylinderGas.find({
        isDeleted: { "!=": true },
        where: credential,
        limit,
        skip,
      })
        .populate("manufacture")
        .populate("current")
        .populate("category");
      const count = await CylinderGas.count({ where: credential });
      //const cylinders =  await CylinderGas.find({isDeleted: {"!=": true},where: {serial: {contains : cylinderSerial}}}).paginate(page, limit);

      //const totalItem = (page - 1) * limit + cylinders.length;
      //console.log('Maximum Item:', count);

      const response = {
        data: cylinders,
        totalItem: count,
      };
      return res.ok(response);
    } catch (error) {
      return res.ok(Utils.jsonErr(error));
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
          let cylinderInfor = await CylinderGas.findOne({
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

  // Get all Cylinders
  getAllCylinders: async function (req, res) {
    try {
      const checkCylinders = await CylinderGas.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      })
        .populate("manufacture")
        .populate("current")
        .populate("category");
      // .sort('createdAt DESC');

      if (!checkCylinders || checkCylinders == "" || checkCylinders == null) {
        return res.json({
          success: false,
          message: "Không tìm thấy sản phẩm nào.",
        });
      } else {
        return res.json({
          success: true,
          Cylinders: checkCylinders,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Remove Cylinder
  removeCylinder: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const cylinders = await Promise.all(
        req.body.Cylinders.map(async (element) => {
          return {
            cylinderId: element.cylinderId,
          };
        })
      );

      for (let i = 0; i < cylinders.length; i++) {
        const checkCylinder = await CylinderGas.findOne({
          isDeleted: { "!=": true },
          _id: cylinders[i].cylinderId,
          isDeleted: false,
        });

        if (!checkCylinder) {
          return res.json({
            success: false,
            message: `Cylinder thứ ${i + 1} không tồn tại.`,
          });
        }
      }

      for (let i = 0; i < cylinders.length; i++) {
        await Promise.all([
          await CylinderGas.updateOne({
            isDeleted: { "!=": true },
            _id: cylinders[i].cylinderId,
            isDeleted: false,
          }).set({
            isDeleted: true,
            // deletedBy: req.userInfo.id,
            deletedAt: Date.now(),
          }),
        ])
          // .then(function(data){
          //         return res.json({
          //             success: true,
          //             message: 'Đơn hàng đã được hủy thành công.',
          //         });
          // })
          .catch(function (data) {
            return res.json({
              success: false,
              message: `Lỗi...Cylinder thứ ${
                i + 1
              } trở đi hủy không thành công.`,
            });
          });
      }

      return res.json({
        success: true,
        message: "Cylinder đã được hủy thành công.",
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getCylinder: async function (req, res) {
    try {
      if (!req.query.serial) {
        return res.json({
          success: false,
          message: "Serial không xác định!",
        });
      }

      const cylinder = await CylinderGas.findOne({
        isDeleted: { "!=": true },
        serial: req.query.serial,
        isDeleted: false,
      })
        .populate("current")
        .populate("category");

      if (!cylinder) {
        return res.json({
          success: false,
          message: "Không tìm thấy bình",
        });
      }

      let _manufacture = {
        name: "",
        id: "",
      };
      if (cylinder.manufacture) {
        const manufacture = await Manufacture.findOne({
          isDeleted: { "!=": true },
          _id: cylinder.manufacture,
        });

        if (manufacture) {
          _manufacture = {
            name: manufacture.name,
            id: manufacture.id,
          };
        }
      }

      return res.json({
        success: true,
        Cylinder: cylinder,
        Manufacture: _manufacture,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
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
  if (cylinders.length > 0) {
    // Check những mã request không trong hệ thống
    const cylinderSerials = getArrayOfSerials(cylinders);
    const serialNotInSystemTree = _.difference(requestSerials, cylinderSerials);
    if (serialNotInSystemTree.length > 0) {
      res.ok(
        Utils.jsonErr(
          `Những mã này không nằm trong Hệ thống của bạn : ${serialNotInSystemTree.join(
            ","
          )}`
        )
      );
    }

    // Nếu action là EXPORT
    if (actionType === "EXPORT") {
      const deliveringCylinders = _.filter(cylinders, (o) => {
        return (
          o.placeStatus === "DELIVERING" ||
          o.placeStatus === "IN_CUSTOMER" ||
          o.current !== user.id
        );
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
    }

    // Nếu action là EXPORT_STATION
    // if(actionType === 'EXPORT_STATION') {
    //   const deliveringCylinders = _.filter(cylinders, o => {return (o.placeStatus === 'DELIVERING' || o.placeStatus === 'IN_CUSTOMER' || o.current !== user.id );}); // Check những mã đang Vận chuyển
    //   if(deliveringCylinders.length > 0) {return res.ok(Utils.jsonErr(`Những mã này đang vận chuyển, đã bán hoặc đang không ở doanh nghiệp sở tại nên không thể xuất : ${getArrayOfSerials(deliveringCylinders).join(',')}`));}
    // }

    // Nếu action là IMPORT
    if (actionType === "IMPORT") {
      const notDeliveringCylinders = _.filter(cylinders, (o) => {
        return o.placeStatus !== "DELIVERING";
      }); // Check những mã đang không vận chuyển
      if (notDeliveringCylinders.length > 0) {
        return res.ok(
          Utils.jsonErr(
            `Những mã này chưa xuất nên không thể nhập : ${getArrayOfSerials(
              notDeliveringCylinders
            ).join(",")}`
          )
        );
      }
      const notCorrectDestination = _.filter(cylinders, (o) => {
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
      if (notCorrectDestination.length > 0) {
        return res.ok(
          Utils.jsonErr(
            `Những mã không thể nhập vì không xuất cho doanh nghiệp sở tại : ${getArrayOfSerials(
              notCorrectDestination
            ).join(",")}`
          )
        );
      }
    }

    if (actionType === "TURN_BACK") {
      const deliveringCylinders = _.filter(cylinders, (o) => {
        return o.placeStatus === "DELIVERING";
      }); // Check những mã đang Vận chuyển
      if (deliveringCylinders.length > 0) {
        return res.ok(
          Utils.jsonErr(
            `Những mã này đang vận chuyển nên không thể nhập : ${getArrayOfSerials(
              deliveringCylinders
            ).join(",")}`
          )
        );
      }
      const currentCylinders = _.filter(cylinders, (o) => {
        return o.current === user.id;
      }); // Check những mã đang Vận chuyển
      if (currentCylinders.length > 0) {
        return res.ok(
          Utils.jsonErr(
            `Những mã này đã hồi lưu nên không thể hồi lưu tiếp : ${getArrayOfSerials(
              currentCylinders
            ).join(",")}`
          )
        );
      }
    }

    res.ok(cylinders);
  }
  return res.ok(Utils.jsonErr("Không tìm thấy bất kì mã nào"));
}
