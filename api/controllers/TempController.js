/**
 * TempController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getDestinationBySerial: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      cylinders, // Array: [serial_0, ..., serial_n]
    } = req.body;

    const user = req.userInfo;

    if (!Array.isArray(cylinders)) {
      return res.badRequest(Utils.jsonErr("Wrong cylinders type"));
    }

    if (cylinders.length === 0) {
      return res.badRequest(Utils.jsonErr("Empty cylinders"));
    }

    if (user.userType !== "SuperAdmin" || user.userRole !== "Owner") {
      return res.badRequest(Utils.jsonErr("Permission denied"));
    }

    try {
      let returnData = {
        success: false,
        resCode: "",
        message: "",
        data: [
          // {serial: 'AAA123', destination: 'example@email.com'},
        ],
      };

      // Tìm những bình đang vận chuyển
      let deliveringCylinders = await Cylinder.find({
        isDeleted: { "!=": true },
        serial: { in: cylinders },
        placeStatus: "DELIVERING",
      }).populate("histories", {
        where: { type: "EXPORT" },
        limit: 1,
        sort: "createdAt DESC",
      });

      if (deliveringCylinders.length === 0) {
        returnData.success = true;
        returnData.resCode = "SUCCESS-00027";
        returnData.message = "Không tìm thấy mã bình nào đang vận chuyển";

        return res.json(returnData);
      }

      await Promise.all(
        deliveringCylinders.map(async (_cylinder) => {
          if (_cylinder.histories.length === 0) return;

          // Tìm lịch sử xuất hàng kèm thông tin điểm đến
          const exportHistory = await History.findOne({
            isDeleted: { "!=": true },
            _id: _cylinder.histories[0].id,
          }).populate("toArray");

          if (exportHistory.toArray.length === 0) return;

          await Promise.all(
            exportHistory.toArray.map(async (to) => {
              returnData.data.push({
                serial: _cylinder.serial,
                destination: to.email,
              });
            })
          );
        })
      );

      returnData.success = true;
      returnData.resCode = "SUCCESS-00028";
      returnData.message = "Tìm thấy thông tin vận chuyển";

      return res.json(returnData);
    } catch (err) {
      eturnData.success = false;
      returnData.resCode = "CATCH-00009";
      returnData.message = "Gặp lỗi khi tìm thông tin vận chuyển";

      return res.json(returnData);
    }
  },
};
