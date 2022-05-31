//const SystemPage = require("../models/SystemPage");
//const { model } = require("mongoose");
//const SystemPage = require("../models/SystemPage");

//const SystemPageMenu = require("../models/SystemPageMenu");

module.exports = {
  createPageMenu: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }
    try {
      const create = {
        name: req.body.name,
        pageId: req.body.pageId,
        url: req.body.url,
        clas: req.body.clas,
        orderNo: req.body.orderNo,
        parentId: req.body.parentId,
        isVisible: req.body.isVisible,
      };

      if (!create.name) {
        return res.json({
          ssuccess: false,
          message: "Không tìm thấy name",
        });
      }
      //

      if (!create.url) {
        return res.json({
          success: false,
          message: "không tìm thấy url",
        });
      }
      if (!create.orderNo) {
        return res.json({
          success: false,
          message: "không tìm thấy orderNo",
        });
      }

      const newCreateSystemPageMenu = await SystemPageMenu.create(
        create
      ).fetch();
      if (
        !newCreateSystemPageMenu ||
        newCreateSystemPageMenu == "" ||
        newCreateSystemPageMenu == null
      ) {
        return res.json({
          ssuccess: false,
          message: "Tạo PageMenu không thành công",
        });
      } else {
        return res.json({
          ssuccess: true,
          SystemPageMenu: newCreateSystemPageMenu,
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },
  updateSystemPageMenu: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }
    try {
      const update = {
        systemPageMenuId: req.body.systemPageMenuId,
        name: req.body.name,
        pageId: req.body.pageId,
        url: req.body.url,
        clas: req.body.clas,
        orderNo: req.body.orderNo,
        parentId: req.body.parentId,
      };
      if (update.systemPageMenuId) {
        chkSystemPageMenuId = await SystemPageMenu.findOne({
          isDeleted: { "!=": true },
          _id: update.systemPageMenuId,
        });
        // console.log(chkSystemPageMenuId)
        if (!chkSystemPageMenuId) {
          return res.json({
            success: false,
            message: "không tìm thấy SystePageMenu",
          });
        }
      }
      // console.log(chkSystemPageMenuId)
      // if(!update.url){
      //     return res.json({
      //         success: false,
      //         message: 'không tìm thấy url'
      //     })
      // }
      // if(!update.orderNo){
      //     return res.json({
      //         success: false,
      //         message:'không tìm thấy orderNo'
      //     })
      // }
      // if(!update.name){
      //     return res.json({
      //         success: false,
      //         message:'không tìm thấy name'
      //     })
      // }
      const updateSystemPageMenu = await SystemPageMenu.updateOne({
        isDeleted: { "!=": true },
        _id: update.systemPageMenuId,
      }).set({
        name: update.name,
        orderNo: update.orderNo,
        url: update.url,
        clas: update.clas,
        pageId: update.pageId,
        parentId: update.parentId,
      });
      if (
        !updateSystemPageMenu ||
        updateSystemPageMenu == "" ||
        updateSystemPageMenu == null
      ) {
        return res.json({
          success: false,
          message: "Cập nhập không thành công!",
        });
      } else {
        return res.json({
          success: true,
          SystemPageMenu: updateSystemPageMenu,
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },
  updateVisible: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }
    try {
      const dlSystemPageMenu = {
        systemPageMenuId: req.body.systemPageMenuId,
      };
      if (!dlSystemPageMenu.systemPageMenuId) {
        return res.json({
          success: false,
          message: "không tìm thấy systePageMenu",
        });
      }
      const chkSystemPageMenuId = await SystemPageMenu.findOne({
        isDeleted: { "!=": true },
        _id: dlSystemPageMenu.systemPageMenuId,
      });
      if (!chkSystemPageMenuId) {
        return res.json({
          success: false,
          message: "không thấy systemPageMenuId",
        });
      }

      //console.log(chkSystemPageMenuId)
      const cancelSystemPageMenu = await SystemPageMenu.updateOne({
        isDeleted: { "!=": true },
        _id: dlSystemPageMenu.systemPageMenuId,
        isVisible: true,
      }).set({
        isVisible: false,
      });
      if (
        !cancelSystemPageMenu ||
        cancelSystemPageMenu == "" ||
        cancelSystemPageMenu == null
      ) {
        return res.json({
          success: false,
          message: "Xập nhập trạng thái Visible không thành công!",
        });
      } else {
        return res.json({
          success: true,
          message: "Cập nhập trạng thái Visible thành công!",
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },
  updateDashBoard: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }
    try {
      const dlSystemPageMenu = {
        systemPageMenuId: req.body.systemPageMenuId,
      };
      if (!dlSystemPageMenu.systemPageMenuId) {
        return res.json({
          success: false,
          message: "không tìm thấy systePageMenu",
        });
      }
      const chkSystemPageMenuId = await SystemPageMenu.findOne({
        isDeleted: { "!=": true },
        _id: dlSystemPageMenu.systemPageMenuId,
      });
      if (!chkSystemPageMenuId) {
        return res.json({
          success: false,
          message: "không thấy systemPageMenuId",
        });
      }

      //console.log(chkSystemPageMenuId)
      const cancelSystemPageMenu = await SystemPageMenu.updateOne({
        isDeleted: { "!=": true },
        _id: dlSystemPageMenu.systemPageMenuId,
        isDashBoard: false,
      }).set({
        isDashBoard: true,
      });
      if (
        !cancelSystemPageMenu ||
        cancelSystemPageMenu == "" ||
        cancelSystemPageMenu == null
      ) {
        return res.json({
          success: false,
          message: "cập nhật trạng thái DashBoard không thành công!",
        });
      } else {
        return res.json({
          success: true,
          message: "cập nhật trạng thái DashBoard thành công!",
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },
  cancelSystemPageMenu: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }

    try {
      const dlSystemPageMenu = {
        systemPageMenuId: req.body.systemPageMenuId,
      };

      if (dlSystemPageMenu.systemPageMenuId) {
        const chkSystemPageMenu = await SystemPageMenu.findOne({
          isDeleted: { "!=": true },
          _id: dlSystemPageMenu.systemPageMenuId,
        });
        if (!chkSystemPageMenu) {
          return res.json({
            success: false,
            message: "SystemPage không tồn tại!",
          });
        }
      }

      const cancelSystemPage = await SystemPageMenu.updateOne({
        isDeleted: { "!=": true },
        _id: dlSystemPageMenu.systemPageMenuId,
        isDeleted: false,
      }).set({
        isDeleted: true,
      });

      if (
        !cancelSystemPage ||
        cancelSystemPage == "" ||
        cancelSystemPage == null
      ) {
        return res.json({
          success: false,
          message: "Xóa SystemPage không thành công!",
        });
      } else {
        return res.json({
          success: true,
          message: "Xóa SystemPage thành công!",
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },

  getAll: async function (req, res) {
    try {
      const getAll = await SystemPageMenu.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      });
      return res.json({ getAll });
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  },
};
