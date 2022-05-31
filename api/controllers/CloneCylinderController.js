/**
 * CloneCylinderController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  create: async function (req, res) {
    const { serial, color, manufacture, category, valve } = req.body;

    try {
      // Kiểm tra trùng code
      const isCodeExist = await CloneCylinder.findOne({
        isDeleted: { "!=": true },
        serial,
        isDeleted: false,
      });

      if (isCodeExist) {
        return res.badRequest(Utils.jsonErr("Code already exists"));
      }
      let createdCylinder = await CloneCylinder.create({
        serial,
        color,
        manufacture,
        category,
        valve,
        createdBy: req.query.ByID,
        updatedBy: req.query.ByID,
      }).fetch();
      console.log(createdCylinder);
      if (!createdCylinder || createdCylinder.length <= 0) {
        return res.json({
          success: false,
          message: "Tạo bình thất bại",
        });
      }
      return res.json({
        success: true,
        data: createdCylinder,
        message: "Tạo bình thành công",
      });
    } catch (error) {
      console.log(error);
      return res.json({
        success: false,
        data: {},
        message: "Gặp lỗi khi tạo bình",
      });
    }
  },

  list: async function (req, res) {
    try {
      const cylinder = await CloneCylinder.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      });
      if (cylinder.length === 0) {
        return res.json({ success: false, message: "Không tìm thấy" });
      } else {
        return res.json({
          success: true,
          data: cylinder,
          message: "Đã tìm thấy",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        data: {},
        message: "Gặp lỗi khi lấy danh sách",
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
      const cylinder = await CloneCylinder.updateOne({
        isDeleted: { "!=": true },
        id,
      }).set({
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: req.query.userid,
      });

      if (!cylinder) {
        return res.json({
          success: false,
          data: {},
          message: "Không tìm thấy để xóa",
        });
      }

      return res.json({ success: true, message: "Xóa thành công." });
    } catch (error) {
      return res.json({
        success: false,
        data: {},
        message: "Gặp lỗi khi xóa",
      });
    }
  },

  // Cập nhật
  update: async function (req, res) {
    if (!req.query) {
      return res.badRequest(Utils.jsonErr("Empty query"));
    }

    const { id } = req.query;

    if (!id) {
      return res.badRequest(Utils.jsonErr("Id is required"));
    }
    // if (!name) {
    //     return res.badRequest(Utils.jsonErr('name is required'));
    // }

    const cylinder = await CloneCylinder.findOne({
      isDeleted: { "!=": true },
      _id: id,
    });
    if (!cylinder) {
      return res.json({
        status: false,
        resCode: "ERROR-00107",
        data: {},
        message: "Không tìm thấy bình cần cập nhật",
      });
    }
    try {
      dataUpdate = req.body;
      const result = await CloneCylinder.updateOne({
        isDeleted: { "!=": true },
        _id: id,
      }).set(dataUpdate);

      if (result) {
        return res.json({
          success: true,
          data: result,
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
