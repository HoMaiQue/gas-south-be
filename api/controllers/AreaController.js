/**
 * AreaController
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
      const isCodeExist = await Area.findOne({
        isDeleted: { "!=": true },
        code,
        isDeleted: false,
      });

      if (isCodeExist) {
        return res.badRequest(Utils.jsonErr("Code already exists"));
      }

      const createdArea = await Area.create({
        name,
        code,
        createdBy: req.query.objectId,
      }).fetch();

      if (!createdArea) {
        return res.json({
          success: false,
          data: {},
          message: "Tạo khu vực thất bại",
        });
      }

      return res.json({
        success: true,
        data: createdArea,
        message: "Tạo khu vực thành công",
      });
    } catch (error) {
      return res.json({
        success: false,
        data: {},
        message: "Gặp lỗi khi tạo khu vực",
      });
    }
  },

  // Lấy toàn bộ danh sách khu vực
  list: async function (req, res) {
    try {
      const areas = await Area.find({
        isDeleted: { "!=": true },
        createdBy: req.query.StationID,
        isDeleted: false,
      });
      if (areas.length === 0) {
        return res.json({ success: false, message: "Không tìm thấy" });
      } else {
        return res.json({
          success: true,
          data: areas,
          message: "Đã tìm thấy",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        data: {},
        message: "Gặp lỗi khi lấy danh sách khu vực",
      });
    }
  },

  // Xóa khu vực
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
      const areas = await Area.updateOne({ isDeleted: { "!=": true }, id }).set(
        {
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: req.query.userid,
        }
      );

      if (!areas) {
        return res.json({
          success: false,
          data: {},
          message: "Không tìm thấy khu vựa để xóa",
        });
      }

      return res.json({ success: true, message: "Xóa thành công." });
    } catch (error) {
      return res.json({
        success: false,
        data: {},
        message: "Gặp lỗi khi xóa khu vực",
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

    const foundArea = await Area.findOne({
      isDeleted: { "!=": true },
      _id: id,
    });
    if (!foundArea) {
      return res.json({
        status: false,
        resCode: "ERROR-00107",
        data: {},
        message: "Không tìm thấy khu vực cần cập nhật",
      });
    }
    try {
      const result = await Area.updateOne({
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
