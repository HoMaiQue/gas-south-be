/**
 * ColorGasController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  create: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { name, code } = req.body;

    if (![name, code].every(Boolean)) {
      return res.badRequest(Utils.jsonErr("Invalid parameter"));
    }

    try {
      // Kiểm tra trùng code
      const isCodeExist = await ColorGas.findOne({
        isDeleted: { "!=": true },
        code,
        isDeleted: false,
      });

      if (isCodeExist) {
        return res.badRequest(Utils.jsonErr("Code already exists"));
      }

      const createdColorGas = await ColorGas.create({ name, code }).fetch();

      if (!createdColorGas) {
        return res.json({
          success: false,
          data: {},
          message: "Tạo màu gas thất bại",
        });
      }

      return res.json({
        success: true,
        data: createdColorGas,
        message: "Tạo màu gas thành công",
      });
    } catch (error) {
      return res.json({
        success: false,
        data: {},
        message: error.message,
      });
    }
  },

  // Lấy toàn bộ danh sách màu gas
  list: async function (req, res) {
    try {
      const colorGases = await ColorGas.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      });

      return res.json({
        success: true,
        data: colorGases,
        message: "Lấy danh sách màu gas thành công",
      });
    } catch (error) {
      return res.json({
        success: false,
        data: {},
        message: "Gặp lỗi khi lấy danh sách màu gas",
      });
    }
  },

  // Xóa màu gas
  delete: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty query"));
    }
    if (!req.query.userid) {
      console.log("Empty req.query.userid");
      return res.badRequest(Utils.jsonErr("Empty userid"));
    }

    const { id } = req.query;

    try {
      const colorGases = await ColorGas.updateOne({
        isDeleted: { "!=": true },
        id,
      }).set({
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: req.query.userid,
      });

      if (!colorGases) {
        return res.json({
          success: false,
          data: {},
          message: "Không tìm thấy màu gas để xóa",
        });
      }

      return res.json({ success: true, message: "Xóa thành công." });
    } catch (error) {
      return res.json({
        success: false,
        data: {},
        message: "Gặp lỗi khi xóa màu gas",
      });
    }
  },

  // Cập nhật
  update: async function (req, res) {
    if (!req.query) {
      return res.badRequest(Utils.jsonErr("Empty query"));
    }

    const { id } = req.query;
    const { name, code } = req.body;

    if (!id) {
      return res.badRequest(Utils.jsonErr("Id is required"));
    }
    // if (!name) {
    //     return res.badRequest(Utils.jsonErr('name is required'));
    // }

    dataUpdate = {};
    if (name) dataUpdate.name = name;
    if (code) dataUpdate.code = code;

    const foundColorGas = await ColorGas.findOne({
      isDeleted: { "!=": true },
      _id: id,
    });
    if (!foundColorGas) {
      return res.json({
        status: false,
        resCode: "ERROR-00107",
        data: {},
        message: "Không tìm thấy màu gas cần cập nhật",
      });
    }
    try {
      const result = await ColorGas.updateOne({
        isDeleted: { "!=": true },
        _id: id,
      }).set(dataUpdate);

      if (result) {
        return res.json({
          success: true,
          result,
          message: "Cập nhật thành công.",
        });
      } else {
        return res.json({ success: false, message: "Cập nhật thất bại." });
      }
    } catch (error) {
      return res.json(error.message);
    }
  },
};
