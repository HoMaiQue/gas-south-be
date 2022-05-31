//const { read } = require("xlsx/types");
//const SystemSetting = require("../models/SystemSetting");

module.exports = {
  createSystemSetting: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const create = {
        Key: req.body.Key,
        Code: req.body.Code,
        Value: req.body.Value,
        Node: req.body.Node,
        UserId: req.body.UserId,
      };
      if (!create.Key) {
        return res.json({
          success: false,
          message: "không tìm thấy Key",
        });
      }
      if (!create.Code) {
        return res.json({
          success: false,
          message: "không tìm thấy Code",
        });
      }
      if (!create.Value) {
        return res.json({
          success: false,
          message: "không tìm thấy Value",
        });
      }
      if (!create.Node) {
        return res.json({
          success: false,
          message: "không tìm thấy Node",
        });
      }
      const chkUser = await User.findOne({
        isDeleted: { "!=": true },
        _id: create.UserId,
      });
      if (!chkUser) {
        return res.json({
          success: false,
          message: "không tìm thấy User",
        });
      }
      const createSystemSetting = await SystemSetting.create(create).fetch();
      if (
        !createSystemSetting ||
        !createSystemSetting == null ||
        createSystemSetting == ""
      ) {
        return res.json({
          success: false,
          message: "tạo SystemSetting không thành công",
        });
      } else
        return res.json({
          success: true,
          SystemSetting: createSystemSetting,
        });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  updateSystemSetting: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      update = {
        SettingId: req.body.SettingId,
        Key: req.body.Key,
        Code: req.body.Code,
        Value: req.body.Value,
        Node: req.body.Node,
        UserId: req.body.UserId,
      };

      // const chkUser = await User.findOne({isDeleted: {"!=": true},
      //     _id : update.UserId
      // });
      // if(!chkUser){
      //     return res.json({
      //         success:false,
      //         message:"không tìm thấy User"
      //     })
      // }
      const ckhSetting = await SystemSetting.findOne({
        isDeleted: { "!=": true },
        _id: update.SettingId,
      });
      if (!ckhSetting) {
        return res.json({
          success: false,
          message: "không tìm thấy SystemSetting",
        });
      }
      const updateSystemSetting = await SystemSetting.updateOne({
        isDeleted: { "!=": true },
        _id: update.SettingId,
      }).set({
        Key: update.Key,
        Code: update.Code,
        Value: update.Value,
        Node: update.Node,
      });
      if (
        !updateSystemSetting ||
        updateSystemSetting == null ||
        updateSystemSetting == ""
      ) {
        return res.json({
          success: false,
          message: "cập nhật không thành công",
        });
      } else {
        return res.json({
          success: true,
          SystemSetting: updateSystemSetting,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  deletedSystemSetting: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const SystemSettingId = req.body.SystemSettingId;
      const chkSystemSetting = await SystemSetting.findOne({
        isDeleted: { "!=": true },
        _id: SystemSettingId,
      });
      if (!chkSystemSetting) {
        return res.json({
          success: false,
          message: "không tìm thấy SystemSetting",
        });
      }
      const cancelSystemSetting = await SystemSetting.updateOne({
        isDeleted: { "!=": true },
        _id: SystemSettingId,
        isDeleted: false,
      }).set({
        isDeleted: true,
      });
      if (
        !cancelSystemSetting ||
        cancelSystemSetting == null ||
        cancelSystemSetting == ""
      ) {
        return res.json({
          success: false,
          message: "xóa SystemSetting không thành công",
        });
      } else {
        return res.json({
          success: true,
          SystemSetting: cancelSystemSetting,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  getSystemSettingById: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const SystemSettingId = req.body.SystemSettingId;
      const chkSystemSetting = await SystemSetting.findOne({
        isDeleted: { "!=": true },
        _id: SystemSettingId,
      });
      if (!chkSystemSetting) {
        return res.json({
          success: false,
          message: "không tìm thấy SystemSetting",
        });
      }
      const getSystemSettingById = await SystemSetting.findOne({
        isDeleted: { "!=": true },
        _id: SystemSettingId,
      });
      if (
        !getSystemSettingById ||
        getSystemSettingById == null ||
        getSystemSettingById == ""
      ) {
        return res.json({
          success: false,
          message: "lấy thông tin SystemSetting không thành công",
        });
      } else {
        return res.json({
          success: true,
          SystemSetting: getSystemSettingById,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  getAllSystemSetting: async function (req, res) {
    try {
      const GetSystemSetting = await SystemSetting.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      });
      return res.json({ GetSystemSetting });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
};
