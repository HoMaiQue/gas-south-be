/**
 * CylinderCancelController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const _ = require("lodash");

module.exports = {
  create: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { idCancel, cylinders, userId } = req.body;

    if (!idCancel) {
      return res.badRequest(Utils.jsonErr("idCancel is required"));
    }

    if (cylinders.length === 0) {
      return res.badRequest(Utils.jsonErr("Cylinders is required"));
    }

    if (!userId) {
      return res.badRequest(Utils.jsonErr("UserId is required"));
    }

    try {
      const userInfor = await User.findOne({
        isDeleted: { "!=": true },
        id: userId,
      });
      if (!userInfor) {
        return res.json({
          status: false,
          resCode: "ERROR-00004",
          data: {},
          message: "Không tìm thấy thông tin người dùng trong hệ thống",
        });
      }

      let list_cancelCylinders = [];
      let successfullyCanceledCylinders = [];
      let errorCancelCylinders = {
        notFound: {
          cylinders: [],
          message: "Danh sách serial không tìm thấy trong CSDL",
        },
        notInCurrent: {
          cylinders: [],
          message: "Danh sách serial không ở cơ sở hiện tại",
        },
        errorWhenUpdate: {
          cylinders: [],
          message:
            "Danh sách serial bị lỗi, không update lại được trạng thái bình",
        },
      };

      await Promise.all(
        cylinders.map(async (cylinder) => {
          const cylinderInfor = await Cylinder.findOne({
            isDeleted: { "!=": true },
            serial: cylinder,
            isDeleted: false,
            isCanceled: false,
          }).populate("current");
          if (!cylinderInfor) {
            errorCancelCylinders.notFound.cylinders.push(cylinder);
          } else if (cylinderInfor.current.id !== userInfor.id) {
            errorCancelCylinders.notInCurrent.cylinders.push({
              serial: cylinderInfor.serial,
              curernt: cylinderInfor.current.name,
            });
          } else {
            list_cancelCylinders.push(cylinderInfor.id);
          }
        })
      );

      if (list_cancelCylinders.length > 0) {
        list_cancelCylinders = await _.uniqWith(
          list_cancelCylinders,
          _.isEqual
        );

        const createCancel = await CylinderCancel.create({
          cylinders: list_cancelCylinders,
          idCancel: idCancel,
          createdBy: userInfor.id,
          objectId: userInfor.id,
        }).fetch();

        if (createCancel.hasOwnProperty("idCancel")) {
          const resultUpdate = await Cylinder.update({
            isDeleted: { "!=": true },
            id: { in: list_cancelCylinders },
          })
            .set({
              idCancel: createCancel.id,
              isCanceled: true,
              classification: "CANCEL",
            })
            .fetch();

          // Tạo bản ghi tương ứng trên bảng CylinderImex
          if (resultUpdate.length > 0) {
            const _idImex = Date.now();
            await Promise.all(
              resultUpdate.map(async (_cylinder) => {
                await CylinderImex.create({
                  cylinder: _cylinder.id,
                  status: "EMPTY",
                  condition: _cylinder.classification
                    ? _cylinder.classification.toUpperCase()
                    : "OLD",
                  idImex: _idImex,
                  typeImex: "OUT",
                  flow: "CANCEL",
                  flowDescription: "CANCEL",
                  category: _cylinder ? _cylinder.category : null,
                  manufacture: _cylinder ? _cylinder.manufacture : null,
                  createdBy: req.userInfo.id,
                  objectId: req.userInfo.id,
                  // history: result.id,
                });
              })
            );
          }

          if (resultUpdate.leng < list_cancelCylinders.length) {
            let errorUpdate = list_cancelCylinders.filter(
              (el) =>
                !resultUpdate.find((el_result) => {
                  el_result.id === el;
                })
            );

            errorCancelCylinders.errorWhenUpdate.cylinders = errorUpdate;
            return res.json({
              status: true,
              resCode: "ERROR-00007",
              data: {
                successfullyCanceledCylinders: resultUpdate,
                errorCancelCylinders: errorCancelCylinders,
              },
              message:
                "Tạo bản ghi thanh lý bình thành công. Có " +
                errorUpdate.length +
                " bình không cập nhật lại được trạng thái",
            });
          } else {
            return res.json({
              status: true,
              resCode: "SUCCESS-00003",
              data: {
                successfullyCanceledCylinders: resultUpdate,
                errorCancelCylinders: errorCancelCylinders,
              },
              message: "Tạo bản ghi thanh lý bình thành công",
            });
          }
        } else {
          return res.json({
            status: false,
            resCode: "ERROR-00006",
            data: {
              successfullyCanceledCylinders: successfullyCanceledCylinders,
              errorCancelCylinders: errorCancelCylinders,
            },
            message: "Không tạo được bản ghi thanh lý bình",
          });
        }
      } else {
        return res.json({
          status: false,
          resCode: "ERROR-00005",
          data: {
            successfullyCanceledCylinders: successfullyCanceledCylinders,
            errorCancelCylinders: errorCancelCylinders,
          },
          message: "Không có serial nào hợp lệ để thanh lý",
        });
      }
    } catch (error) {
      return res.json({
        status: false,
        resCode: "CATCH-00003",
        data: {
          error: error.message,
        },
        message: "Gặp lỗi khi tạo bản ghi thanh lý bình",
      });
    }
  },
};
