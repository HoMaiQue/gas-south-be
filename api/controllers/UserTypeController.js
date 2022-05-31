/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  createUserType: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const create = {
        name: req.body.name,
        orderNo: req.body.orderNo,
        note: req.body.note,
        objectId: req.body.objectId,
        createdBy: req.body.createdBy ? req.body.updateBy : null,
        updateBy: req.body.updateBy ? req.body.createdBy : null,
      };

      if (!create.name) {
        return res.json({
          success: false,
          message: "Không tìm thấy name!",
        });
      }

      if (!create.orderNo) {
        return res.json({
          success: false,
          message: "Không tìm thấy orderNo!",
        });
      }

      if (!create.note) {
        return res.json({
          success: false,
          message: "Không tìm thấy note!",
        });
      }

      if (!create.objectId) {
        return res.json({
          success: false,
          message: "Không tìm thấy objectId!",
        });
      }

      const checkUser = await User.findOne({
        isDeleted: { "!=": true },
        _id: create.objectId,
      });

      if (!checkUser) {
        return res.json({
          success: false,
          message: "Không tìm thấy id User!",
        });
      }

      const checkUserType = await UserType.findOne({
        isDeleted: { "!=": true },
        name: create.name,
        isDeleted: false,
      });

      if (checkUserType) {
        return res.json({
          success: false,
          message: "Tên userType đã tồn tại!",
        });
      }

      const newUserType = await UserType.create(create).fetch();

      if (!newUserType || newUserType == "" || newUserType == null) {
        return res.json({
          success: false,
          message: "Tạo userType không thành công!",
        });
      } else {
        return res.json({
          success: true,
          UserType: newUserType,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  updateUserType: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const update = {
        usertypeId: req.body.usertypeId,
        name: req.body.name,
        orderNo: req.body.orderNo,
        note: req.body.note,
        objectId: req.body.objectId,
        updatedBy: req.body.updatedBy ? req.body.updatedBy : null,
      };

      if (update.usertypeId) {
        const checkUserType = await UserType.findOne({
          isDeleted: { "!=": true },
          _id: update.usertypeId,
          isDeleted: false,
        });
        if (!checkUserType) {
          return res.json({
            success: false,
            message: "userType không tồn tại!",
          });
        }
      }

      if (update.objectId) {
        const checkUser = await User.findOne({
          isDeleted: { "!=": true },
          _id: update.objectId,
        });
        if (!checkUser) {
          return res.json({
            success: false,
            message: "id User không tồn tại!",
          });
        }
      }

      // if (update.name) {
      //     const checkUserType = await UserType.findOne({isDeleted: {"!=": true},
      //         name: update.name
      //     });
      //     if (checkUserType) {
      //         return res.json({
      //             success: false,
      //             message: 'Tên UserType đã tồn tại!'
      //         });
      //     }
      // }

      const updateUserType = await UserType.updateOne({
        isDeleted: { "!=": true },
        isDeleted: false,
        _id: update.usertypeId,
      }).set({
        name: update.name,
        orderNo: update.orderNo,
        note: update.note,
        objectId: update.objectId,
        updateBy: update.updatedBy,
      });

      if (!updateUserType || updateUserType == "" || updateUserType == null) {
        return res.json({
          success: false,
          message: "Cập nhập không thành công!",
        });
      } else {
        return res.json({
          success: true,
          UserType: updateUserType,
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },

  deleteUserType: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const usertypeId = req.body.usertypeId;
      // const deletedAt = req.body.deletedAt ? req.body.deletedAt : null;
      if (!usertypeId) {
        return res.json({
          success: false,
          message: "usertypeId không tồn tại!",
        });
      }

      const checkUserType = await UserType.findOne({
        isDeleted: { "!=": true },
        _id: usertypeId,
      });

      if (!checkUserType) {
        return res.json({
          success: false,
          message: "UserType không tồn tại!",
        });
      }

      const cancelUserType = await UserType.updateOne({
        isDeleted: { "!=": true },
        _id: usertypeId,
        isDeleted: false,
      }).set({
        isDeleted: true,
        // deletedAt: deletedAt,
        deletedAt: Date.now(),
      });

      if (!cancelUserType || cancelUserType == "" || cancelUserType == null) {
        return res.json({
          success: false,
          message: "Xóa userType không thành công!",
        });
      } else {
        return res.json({
          success: true,
          message: "userType đã được xóa thành công!",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getAllUserType: async function (req, res) {
    try {
      const userType = await UserType.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      });
      return res.json({ userType });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getUserTypeById: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const usertypeId = req.body.usertypeId;

      const checkUserType = await UserType.findOne({
        isDeleted: { "!=": true },
        _id: usertypeId,
        isDeleted: false,
      });

      if (!checkUserType) {
        return res.json({
          success: false,
          message: "UserType không tồn tại!",
        });
      }

      if (!usertypeId || usertypeId == "" || usertypeId == null) {
        return res.json({
          success: false,
          message: "Không tìm thấy UserType!",
        });
      } else {
        return res.json({
          success: true,
          UserType: checkUserType,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getUserTypeBySystemPage: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const userTypeBySystemPageId = req.body.userTypeBySystemPageId;

      const chkUserTypeBySystemPage = await UserType.findOne({
        isDeleted: { "!=": true },
        _id: userTypeBySystemPageId,
        isDeleted: false,
      });

      if (
        !chkUserTypeBySystemPage ||
        chkUserTypeBySystemPage == "" ||
        chkUserTypeBySystemPage == null
      ) {
        return res.json({
          success: false,
          message: "Không tìm thấy UserTypeBySystemPage!",
        });
      } else {
        let userTypeBySystemPage = await SystemUserTypePage.find({
          isDeleted: { "!=": true },
          userTypeId: userTypeBySystemPageId,
          isDeleted: false,
        }).populate("pageId");

        return res.json({
          success: true,
          UserType: userTypeBySystemPage,
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },

  getBySystemPage: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }

    try {
      const { userTypeBySystemPageId } = req.body;

      let data = "";
      data = await UserType.findOne({
        isDeleted: { "!=": true },
        _id: userTypeBySystemPageId,
        isDeleted: false,
      });
      if (!data || data == "" || data == null) {
        return res.json({
          success: false,
          message: "Không tìm thấy UserType!",
        });
      } else {
        let obj = {};
        let arr = [];
        data = await SystemUserTypePage.find({
          isDeleted: { "!=": true },
          userTypeId: userTypeBySystemPageId,
          isDeleted: false,
        }).populate("pageId");

        for (let i = 0; i < data.length; i++) {
          obj = {
            name: data[i].pageId.name,
            url: data[i].pageId.url,
            status: data[i].pageId.status,
            orderNo: data[i].pageId.orderNo,
            level: data[i].pageId.level,
            parentId: data[i].pageId.parentId,
          };
          arr.push(obj);
        }
        if (arr.length > 0) {
          return res.json({ success: true, data: arr });
        } else {
          return res.json({ success: false, message: "Không lấy được!" });
        }
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },
};
