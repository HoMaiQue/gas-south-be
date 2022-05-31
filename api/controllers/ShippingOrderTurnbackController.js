/**
 * ShippingOrderTurnbackController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const IMAGE_BASE64 = require("../constants/ImageBase64");

module.exports = {
  //
  returnCylinders: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { userId, shippingOrderId, cylinders } = req.body;

    if (!userId) {
      return res.badRequest(Utils.jsonErr("userId is required"));
    }

    if (!shippingOrderId) {
      return res.badRequest(Utils.jsonErr("shippingOrderId is required"));
    }

    if (!cylinders) {
      return res.badRequest(Utils.jsonErr("cylinders is required"));
    }

    if (typeof cylinders !== "string") {
      return res.badRequest(Utils.jsonErr("cylinders is wrong type"));
    }

    try {
      // let listCylinders_ERROR = []
      const idImex = Date.now();

      const _cylinder = cylinders.split(",");
      if (_cylinder.length === 0) {
        return res.badRequest(Utils.jsonErr("cylinders is empty"));
      }

      const userInfo = await User.findOne({
        isDeleted: { "!=": true },
        id: userId,
      });
      if (!userInfo) {
        return res.badRequest(Utils.jsonErr("Not found user"));
      }

      const isExistShippingOrder = await ShippingOrder.findOne({
        isDeleted: { "!=": true },
        id: shippingOrderId,
      });
      if (!isExistShippingOrder) {
        return res.badRequest(Utils.jsonErr("Not found shippingOrder"));
      }

      const cylindersInfo = await Cylinder.find({
        isDeleted: { "!=": true },
        serial: { in: _cylinder },
      });

      if (cylindersInfo.length !== _cylinder.length) {
        // Cần trả ra cụ thể hơn
        return res.badRequest(
          Utils.jsonErr("Có mã bình không tìm thấy trong hệ thống")
        );
      }

      // Không cho phép hồi lưu những bình đã ở userId
      const currentCylinders = _.filter(cylindersInfo, (o) => {
        return o.current === userInfo.id && o.placeStatus !== "DELIVERING";
      });
      if (currentCylinders.length > 0) {
        return res.badRequest(
          Utils.jsonErr(
            `Những mã này đã hồi lưu nên không thể hồi lưu tiếp: ${getArrayOfSerials(
              currentCylinders
            ).join(",")}`
          )
        );
      }

      // Ghi vào collection ShippingOrderTurnback
      await Promise.all(
        cylindersInfo.map(async (cylinder) => {
          await ShippingOrderTurnback.create({
            createdBy: userInfo.id,
            shippingOrderId: shippingOrderId,
            cylinder: cylinder.id,
          });
        })
      );

      // Cập nhật lại trạng thái bình
      let turnbackCylinders = [];
      const updatedCylinders = await Promise.all(
        cylindersInfo.map(async (cylinder) => {
          // let returnData = {
          //     success: false,
          //     error: '',
          // }

          // Trường hợp bình đang trên đường vận chuyển
          if (cylinder.placeStatus === "DELIVERING") {
            const findExportPlace = await User.findOne({
              isDeleted: { "!=": true },
              id: cylinder.current,
            });
            // if (!findExportPlace) {
            //      Kiểm tra xem có còn tồn tại thông tin điểm xuất bình hay không?
            // }

            let placeStatus = "";
            switch (findExportPlace.userType) {
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

            // if (!placeStatus) {
            //     Kiểm tra lỗi vị trí
            // }

            const updated = await Cylinder.updateOne({
              isDeleted: { "!=": true },
              id: cylinder.id,
            }).set({ placeStatus: placeStatus });
          }
          // Trường hợp còn lại, bình đã nhập điểm đến
          else {
            // // Tạo bản ghi lịch sử
            // await History.create({
            //     driver: isExistShippingOrder.nameDriver,
            //     license_plate: isExistShippingOrder.licensePlate,
            //     cylinders,
            //     signature: imageQLVC,
            //     idDriver: isExistShippingOrder.driverId ? isExistShippingOrder.driverId : null,
            //     from: null,
            //     to: userInfo.id,
            //     type: 'TURN_BACK',
            //     // toArray,
            //     // numberArray,
            //     numberOfCylinder,
            //     // cylindersWithoutSerial,
            //     // amount,
            //     // saler,
            //     // typeForPartner,
            //     // exportByDriver,
            //     // turnbackByDriver,
            //     createdBy: userInfo.id,
            // })
            turnbackCylinders.push(cylinder.id);

            // Tạo bản ghi trả bình
            await CylinderImex.create({
              cylinder: cylinder.id,
              idImex,
              status: cylinder.status ? cylinder.status : "EMPTY",
              condition: "OLD",
              typeImex: "OUT",
              flow: "GIVE_BACK",
              flowDescription: "RETURN",
              // Cần thêm bản ghi trong collection History ???
              // history,
              objectId: cylinder.current,
              createdBy: userInfo.id,
              isDeleted: false,
            });

            const updated = await Cylinder.updateOne({
              isDeleted: { "!=": true },
              id: cylinder.id,
            }).set({
              current: userInfo.id,
              placeStatus:
                userInfo.userType === "Fixer"
                  ? "IN_REPAIR"
                  : "IN_" + userInfo.userType.toUpperCase(),
            });
          }
        })
      );

      if (turnbackCylinders.length > 0) {
        // Tạo bản ghi lịch sử
        await History.create({
          driver: isExistShippingOrder.nameDriver,
          license_plate: isExistShippingOrder.licensePlate,
          cylinders: turnbackCylinders,
          signature: IMAGE_BASE64.IMAGE_QLVC,
          idDriver: isExistShippingOrder.driverId
            ? isExistShippingOrder.driverId
            : null,
          from: null,
          to: userInfo.id,
          type: "TURN_BACK",
          // toArray,
          // numberArray,
          numberOfCylinder: turnbackCylinders.length,
          // cylindersWithoutSerial,
          // amount,
          // saler,
          typeForPartner: "",
          // exportByDriver,
          // turnbackByDriver,
          createdBy: userInfo.id,
        });

        // Tạo bản ghi cân nặng khi mượn lại bình
        const dateReceived = new Date(idImex).toISOString();
        const length_returnGas = turnbackCylinders.length;

        if (length_returnGas > 0) {
          await Promise.all(
            turnbackCylinders.map(async (tbCylinder) => {
              let cylWeight = await WeightImportGas.find({
                isDeleted: { "!=": true },
                idCylinder: tbCylinder,
              })
                .sort("createdAt DESC")
                .limit(1);

              await returnGas.create({
                serialCylinder: cylWeight[0].serialCylinder,
                idCylinder: cylWeight[0].idCylinder,
                dateReceived: dateReceived,
                weight: cylWeight[0].weightImport,
                createBy: userInfo.id,
              });
            })
          );
        }
      }

      // Ghi vào collection CylinderImex
      // const idImex = Date.now()
      const updatedImex = await Promise.all(
        cylindersInfo.map(async (cylinder) => {
          await CylinderImex.create({
            cylinder: cylinder.id,
            idImex,
            status: cylinder.status ? cylinder.status : "EMPTY",
            condition: "OLD",
            typeImex: "IN",
            flow: "TURN_BACK",
            flowDescription: "RETURN",
            // Cần thêm bản ghi trong collection History ???
            // history,
            objectId: userInfo.id,
            createdBy: userInfo.id,
            isDeleted: false,
          });
        })
      );

      return res.json({
        success: true,
        message: "Bình đã được hồi lưu",
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
};

function getArrayOfSerials(cylinders) {
  return cylinders.map((cylinder) => {
    return cylinder.serial;
  });
}
