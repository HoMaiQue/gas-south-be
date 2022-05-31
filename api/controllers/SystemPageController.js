/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  creteSystemPage: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }

    try {
      const create = {
        name: req.body.name,
        icon: req.body.icon,
        controllerName: req.body.controllerName,
        actionName: req.body.actionName,
        url: req.body.url,
        status: req.body.status,
        orderNo: req.body.orderNo,
        parentId: req.body.parentId,
        level: req.body.level,
      };

      const chkName = await SystemPage.findOne({
        isDeleted: { "!=": true },
        name: create.name,
      });
      if (chkName) {
        return res.json({
          success: false,
          message: "Name đã tồn tại!",
        });
      }

      // const chkControllerName = await SystemPage.findOne({isDeleted: {"!=": true},
      //     controllerName: create.controllerName
      // });
      // if (chkControllerName) {
      //     return res.json({
      //         success: false,
      //         message: 'controllerName đã tồn tại!'
      //     });
      // }

      // const chkActionName = await SystemPage.findOne({isDeleted: {"!=": true},
      //     actionName: create.actionName
      // });
      // if (chkActionName) {
      //     return res.json({
      //         success: false,
      //         message: 'actionName đã tồn tại!'
      //     });
      // }

      // const chkUrl = await SystemPage.findOne({isDeleted: {"!=": true},
      //     url: create.url
      // });
      // if (chkUrl) {
      //     return res.json({
      //         success: false,
      //         message: 'url đã tồn tại!'
      //     });
      // }

      const newCreateSystemPage = await SystemPage.create(create).fetch();
      if (
        !newCreateSystemPage ||
        newCreateSystemPage == "" ||
        newCreateSystemPage == null
      ) {
        return res.json({
          success: false,
          message: "Tạo SystemPage không thành công!",
        });
      } else {
        return res.json({
          success: true,
          SystemPage: newCreateSystemPage,
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },

  updateSystemPage: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }

    try {
      const update = {
        systemPageId: req.body.systemPageId,
        name: req.body.name,
        icon: req.body.icon,
        controllerName: req.body.controllerName,
        actionName: req.body.actionName,
        url: req.body.url,
        status: req.body.status,
        orderNo: req.body.orderNo,
        parentId: req.body.parentId,
        level: req.body.level,
        updateAt: req.body.updateAt ? req.body.updateAt : null,
      };

      if (update.systemPageId) {
        const chkSystemPage = await SystemPage.findOne({
          isDeleted: { "!=": true },
          _id: update.systemPageId,
        });
        if (!chkSystemPage) {
          return res.json({
            success: false,
            message: "SystemPage không tồn tại!",
          });
        }
      }

      if (update.name) {
        const chkSystemPage = await SystemPage.findOne({
          isDeleted: { "!=": true },
          name: update.name,
        });
        if (chkSystemPage) {
          return res.json({
            success: false,
            message: "name đã tồn tại!",
          });
        }
      }

      if (update.controllerName) {
        const chkSystemPage = await SystemPage.findOne({
          isDeleted: { "!=": true },
          controllerName: update.controllerName,
        });
        if (chkSystemPage) {
          return res.json({
            success: false,
            message: "controllerName đã tồn tại!",
          });
        }
      }

      if (update.actionName) {
        const chkSystemPage = await SystemPage.findOne({
          isDeleted: { "!=": true },
          actionName: update.actionName,
        });
        if (chkSystemPage) {
          return res.json({
            success: false,
            message: "actionName đã tồn tại!",
          });
        }
      }

      const updateSPage = await SystemPage.updateOne({
        isDeleted: { "!=": true },
        _id: update.systemPageId,
        isDeleted: false,
      }).set({
        name: update.name,
        icon: update.icon,
        controllerName: update.controllerName,
        actionName: update.actionName,
        url: update.url,
        status: update.status,
        orderNo: update.orderNo,
        parentId: update.parentId,
        level: update.level,
        updateAt: update.updateAt,
      });

      if (!updateSPage || updateSPage == "" || updateSPage == null) {
        return res.json({
          success: false,
          message: "update SystemPage không thành công!",
        });
      } else {
        return res.json({
          success: true,
          SystemPage: updateSPage,
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },

  deleteSystemPage: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }

    try {
      const dlSystemPage = {
        systemPageId: req.body.systemPageId,
      };

      if (dlSystemPage.systemPageId) {
        const chkSystemPage = await SystemPage.findOne({
          isDeleted: { "!=": true },
          _id: dlSystemPage.systemPageId,
        });
        if (!chkSystemPage) {
          return res.json({
            success: false,
            message: "SystemPage không tồn tại!",
          });
        }
      }

      const cancelSystemPage = await SystemPage.updateOne({
        isDeleted: { "!=": true },
        _id: dlSystemPage.systemPageId,
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

  getAllSystemPage: async function (req, res) {
    try {
      const systemPage = await SystemPage.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      });
      return res.json({ systemPage });
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },

  getSystemPageById: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }

    try {
      const systemPageId = req.body.systemPageId;

      const chkSystemPage = await SystemPage.findOne({
        isDeleted: { "!=": true },
        _id: systemPageId,
        isDeleted: false,
      });
      if (!chkSystemPage) {
        return res.json({
          success: false,
          message: "SystemPage không tồn tại!",
        });
      }

      if (!systemPageId || systemPageId == "" || systemPageId == null) {
        return res.json({
          success: false,
          message: "Không tìm thấy SystemPage!",
        });
      } else {
        return res.json({
          success: true,
          SystemPage: chkSystemPage,
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },

  getSystemPageByLevel: async function (req, res) {
    try {
      const level = req.query.level;

      if (!level) {
        return res.json({
          success: false,
          message: "level không tồn tại!",
        });
      }
      const checkSystemPageLevel = await SystemPage.find({
        isDeleted: { "!=": true },
        level: level,
        isDeleted: false,
      });
      // .sort({'orderNo': -1})

      if (
        !checkSystemPageLevel ||
        checkSystemPageLevel == "" ||
        checkSystemPageLevel == null
      ) {
        return res.json({
          success: false,
          message: "Không tìm thấy SystemPageLevel!",
        });
      } else {
        return res.json({
          success: true,
          SystemPage: checkSystemPageLevel,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  aceessRight: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }
    try {
      const AceessRight = {
        controllerName: req.body.controllerName,
        actionName: req.body.actionName,
        userID: req.body.userID,
        //pageId : req.body.pageId
      };
      const chkUser = await SystemUser.findOne({
        isDeleted: { "!=": true },
        id: AceessRight.userID,
      }).populate("userTypeId");
      if (!chkUser) {
        return res.json({
          success: false,
          message: "ko tìm thấy user",
        });
      }
      const chkPageId = await SystemPage.find({
        isDeleted: { "!=": true },
        controllerName: AceessRight.controllerName,
        actionName: AceessRight.actionName,
      });
      if (!chkPageId.length > 0) {
        return res.json({
          success: false,
          message: "ko tìm thấy Page",
        });
      }
      const arr = [];
      //let data = await Promise.all(chkPageId.map(async element=>{
      //chkUser = await Promise.all(chkUser.map(async _element=>{
      //chkUser.userTypeId = await Promise.all(chkUser.userTypeId.map(async __element=>{
      let data = await Promise.all(
        chkPageId.map(async (element) => {
          let chkRight = await SystemUserTypePage.find({
            isDeleted: { "!=": true },
            // where:{
            userTypeId: chkUser.userTypeId.id,
            pageId: element.id,
            isDeleted: false,
            // }
          });
          if (chkRight.length > 0) {
            arr.push(chkRight);
          }
        })
      );
      if (chkUser.userTypeId.name === "Admin") {
        return res.json({
          success: true,
          message: "truy cập thành công",
        });
      } else if (arr.length > 0) {
        return res.json({
          success: true,
          message: "truy cập  thành công",
        });
      } else {
        return res.json({
          success: false,
          message: "truy cập ko thành công",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
};
