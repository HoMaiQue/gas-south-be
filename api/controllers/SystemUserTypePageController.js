/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  createSystemUserTypePage: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }

    try {
      const create = {
        userTypeId: req.body.userTypeId,
        pageId: req.body.pageId,
        parentId: req.body.parentId,
      };

      if (create.userTypeId) {
        const chkSystemPage = await UserType.findOne({
          isDeleted: { "!=": true },
          _id: create.userTypeId,
        });
        if (!chkSystemPage) {
          return res.json({
            success: false,
            message: "id UserType không tồn tại!",
          });
        }
      }

      if (create.pageId) {
        const chkUserType = await SystemPage.findOne({
          isDeleted: { "!=": true },
          _id: create.pageId,
        });
        if (!chkUserType) {
          return res.json({
            success: false,
            message: "id SystemPage không tồn tại!",
          });
        }
      }

      const createSystemUserTypePage = await SystemUserTypePage.create(
        create
      ).fetch();
      if (
        !createSystemUserTypePage ||
        createSystemUserTypePage == "" ||
        createSystemUserTypePage == null
      ) {
        return res.json({
          success: false,
          message: "Tạo SystemUserTypePage khồn thành công!",
        });
      } else {
        return res.json({
          success: true,
          SystemUserTypePage: createSystemUserTypePage,
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },

  updateSystemUserTypePage: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }

    try {
      const update = {
        systemUserTypePageId: req.body.systemUserTypePageId,
        userTypeId: req.body.userTypeId,
        pageId: req.body.pageId,
        updatedByUT: req.body.updatedByUT ? req.body.updatedByUT : null,
        updatedBySP: req.body.updatedBySP ? req.body.updatedBySP : null,
      };

      if (update.systemUserTypePageId) {
        const chkSystemUserTypePage = await SystemUserTypePage.findOne({
          isDeleted: { "!=": true },
          _id: update.systemUserTypePageId,
        });
        if (!chkSystemUserTypePage) {
          return res.json({
            success: false,
            message: "SystemUserTypePage không tồn tại!",
          });
        }
      }

      if (update.userTypeId) {
        const chkSystemPage = await UserType.findOne({
          isDeleted: { "!=": true },
          _id: update.userTypeId,
        });
        if (!chkSystemPage) {
          return res.json({
            success: false,
            message: "id UserType không tồn tại!",
          });
        }
      }

      if (update.pageId) {
        const chkUserTypeId = await SystemPage.findOne({
          isDeleted: { "!=": true },
          _id: update.pageId,
        });
        if (!chkUserTypeId) {
          return res.json({
            success: false,
            message: "id SystemPage không tồn tại!",
          });
        }
      }

      const udSystemUserTypePage = await SystemUserTypePage.updateOne({
        isDeleted: { "!=": true },
        _id: update.systemUserTypePageId,
      }).set({
        userTypeId: update.userTypeId,
        pageId: update.pageId,
        updatedByUT: update.updatedByUT,
        updatedBySP: update.updatedBySP,
      });

      if (
        !udSystemUserTypePage ||
        udSystemUserTypePage == "" ||
        udSystemUserTypePage == null
      ) {
        return res.json({
          success: false,
          message: "update SystemUserTypePage không thành công!",
        });
      } else {
        return res.json({
          success: true,
          SystemUserTypePage: udSystemUserTypePage,
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },

  deleteSystemUserTypePage: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }

    try {
      const dlSystemUserTypePage = {
        systemUserTypePageId: req.body.systemUserTypePageId,
      };

      if (dlSystemUserTypePage.systemUserTypePageId) {
        const chkSystemUserTypePage = await SystemUserTypePage.findOne({
          isDeleted: { "!=": true },
          _id: dlSystemUserTypePage.systemUserTypePageId,
        });
        if (!chkSystemUserTypePage) {
          return res.json({
            success: false,
            message: "systemUserTypePage không tồn tại!",
          });
        }
      }

      const cantSystemUserTypePage = await SystemUserTypePage.updateOne({
        isDeleted: { "!=": true },
        _id: dlSystemUserTypePage.systemUserTypePageId,
        isDeleted: false,
      }).set({
        isDeleted: true,
      });

      if (
        !cantSystemUserTypePage ||
        cantSystemUserTypePage == "" ||
        cantSystemUserTypePage == null
      ) {
        return res.json({
          success: false,
          message: "Xóa systemUserTypePage không thành công!",
        });
      } else {
        return res.json({
          success: true,
          message: "Xóa systemUserTypePage thành công!",
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },

  getAllSystemUserTypePage: async function (req, res) {
    try {
      let systemUserTypePage = await SystemUserTypePage.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      }).populate("parentId");

      systemUserTypePage = await Promise.all(
        systemUserTypePage.map(async (typePage) => {
          if (typePage.parentId) {
            typePage.parentId = await SystemPage.findOne({
              isDeleted: { "!=": true },
              id: typePage.parentId.id,
              isDeleted: false,
            }).populate("parentId");
          }

          return typePage;
        })
      );

      return res.json({ systemUserTypePage });
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },

  getSystemUserTypePageById: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }

    try {
      const systemUserTypePageId = req.body.systemUserTypePageId;
      const chkSystemUserTypePage = await SystemUserTypePage.findOne({
        isDeleted: { "!=": true },
        _id: systemUserTypePageId,
      });
      if (!chkSystemUserTypePage) {
        return res.json({
          success: false,
          message: "SystemUserTypePage không tồn tại!",
        });
      }

      if (
        !systemUserTypePageId ||
        systemUserTypePageId == "" ||
        systemUserTypePageId == null
      ) {
        return res.json({
          success: false,
          message: "Không tìm thấy SystemUserTypePage!",
        });
      } else {
        return res.json({
          success: true,
          SystemUserTypePage: chkSystemUserTypePage,
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },
};
