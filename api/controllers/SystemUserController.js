/**
 * SystemUserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const API_ERRORS = require("../constants/APIErrors");
const validator = require("validator");
const passValidator = require("password-validator");
// const SystemUser = require('../models/SystemUser');
const USER_TYPE = require("../constants/UserTypes");
const USER_ROLE = require("../constants/UserRoles");
const passSchema = new passValidator();
const passMinLen = 6;
const passMaxLen = 24;

passSchema
  .is()
  .min(passMinLen)
  .is()
  .max(passMaxLen)
  .has()
  .letters()
  .has()
  .digits();

module.exports = {
  /**
   * Action for /user/addUser
   * @param email, name, password,address,userType
   * @param res
   * @returns {*}
   */
  createSystemUser: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      let systemuser = {
        username: req.body.username,
        password: req.body.password,
        status: req.body.status,
        fullname: req.body.fullname,
        birthday: req.body.birthday,
        address: req.body.address,
        mobile: req.body.mobile,
        email: req.body.email,
        sex: req.body.sex,
        userTypeId: req.body.userTypeId,
        loginFailedCount: 0,
        profileimage: req.body.profileimage,
        createdBy: req.body.createdBy ? req.body.createdBy : null,
        updatedBy: req.body.createdBy ? req.body.createdBy : null,
      };

      if (!systemuser.username) {
        return res.json({
          status: false,
          message: "Username is required",
        });
      }

      if (!systemuser.password) {
        return res.json({
          status: false,
          message: "Password is required",
        });
      }

      if (!passSchema.validate(systemuser.password)) {
        return res.json({
          status: false,
          message:
            "Password must be 6-24 characters, including letters and digits",
        });
      }

      if (!systemuser.status) {
        return res.json({
          status: false,
          message: "Status is required",
        });
      }

      if (!systemuser.fullname) {
        return res.json({
          status: false,
          message: "Fullname is required",
        });
      }

      if (!systemuser.birthday) {
        return res.json({
          status: false,
          message: "Birth Day is required",
        });
      }

      // if (systemuser.email && !validator.isEmail(systemuser.email)) {
      //     return res.json({
      //         status: false,
      //         message: "Email khong dung"
      //     });
      // }

      if (!systemuser.sex) {
        return res.json({
          status: false,
          message: "Sex is required",
        });
      }

      if (!systemuser.userTypeId) {
        return res.json({
          status: false,
          message: "UserTypeId is not defined.",
        });
      }

      // if (!systemuser.profileimage) {
      //     return res.json({
      //         status: false,
      //         message: "ProfileImage is required"
      //     });
      // }

      if (systemuser.createdBy) {
        const checkSystemUserCreate = await User.findOne({
          isDeleted: { "!=": true },
          _id: systemuser.createdBy,
        });

        if (!checkSystemUserCreate) {
          return res.json({
            status: false,
            message: "System User Create không tồn tại.",
          });
        }
      }

      const checkUser = await UserType.findOne({
        isDeleted: { "!=": true },
        _id: systemuser.userTypeId,
      });

      if (!checkUser) {
        return res.json({
          status: false,
          message: "Không tìm thấy id của UserType.",
        });
      }

      // const hash = await SystemUser.setPasswordHash(systemuser.password);

      // if (!hash) {
      //     return res.json({
      //         status: false,
      //         message: 'Không thể mã hóa được password.'
      //     })
      // }

      // systemuser.password = hash;
      const newSystemUser = await SystemUsermanager.createUser(systemuser);

      if (!newSystemUser || newSystemUser == "" || newSystemUser == null) {
        return res.json({
          status: false,
          message: "Lỗi...Tạo system user không thành công.",
        });
      } else {
        return res.json({
          status: true,
          SystemUser: newSystemUser,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },
  /**
   * Action for /carrier/login
   * @param req email, password
   * @param res
   * @returns {*}
   */
  login: function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const email = req.body.email;
      const password = req.body.password;
      //const playerID = req.body.playerID;

      if (!email || !validator.isEmail(email)) {
        return res.badRequest(Utils.jsonErr("Tài khoản không đúng"));
      }

      if (!password) {
        return res.badRequest(
          Utils.jsonErr("Tài khoản hoặc mật khẩu không đúng")
        );
      }

      SystemUsermanager.authenticateUserByPassword(email, password)
        .then(async ({ user, token }) => {
          user.parentRoot =
            user.userType === USER_TYPE.Factory &&
            user.userRole === USER_ROLE.SUPER_ADMIN
              ? user.id
              : await getRootParent(user.isChildOf);
          console.log("Controller login", { user, token });
          //     if (playerID) {
          //       const updateUser = await User.updateOne({isDeleted: {"!=": true},
          //           email: email,
          //       })
          //       .set({
          //           playerID: playerID
          //       });

          //       const _user = await User.findOne({isDeleted: {"!=": true},
          //       _id: user.id
          //       })

          //       return res.ok({ user: _user, token });
          //   } else {
          return res.ok({ user, token });
          //}
        })
        .catch((err) => {
          switch (err) {
            case API_ERRORS.INVALID_EMAIL_PASSWORD:
            case API_ERRORS.USER_NOT_FOUND:
              return res.badRequest(
                Utils.jsonErr("Tài khoản hoặc mật khẩu không đúng")
              );
            case API_ERRORS.USER_LOCKED:
              return res.forbidden(Utils.jsonErr("Account locked"));
            default:
              /* istanbul ignore next */
              return res.serverError(Utils.jsonErr(err));
          }
        });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getAllSystemUser: async function (req, res) {
    try {
      const allSystemUser = await SystemUser.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      }).populate("userTypeId");

      if (!allSystemUser || allSystemUser == "" || allSystemUser == null) {
        return res.json({
          status: false,
          message: "Lỗi...Không tìm thấy System User.",
        });
      } else {
        return res.json({
          status: true,
          SystemUser: allSystemUser,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  getSystemUserById: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const systemUserId = req.body.systemUserId.trim();

      if (!systemUserId) {
        return res.json({
          status: false,
          message: "System User Id is not defined. Please check out again.",
        });
      }

      const checkSystemUser = await SystemUser.findOne({
        isDeleted: { "!=": true },
        _id: systemUserId,
        isDeleted: false,
      });

      if (
        !checkSystemUser ||
        checkSystemUser == "" ||
        checkSystemUser == null
      ) {
        return res.json({
          status: false,
          message: "Lỗi...Không tìm thấy SystemUser.",
        });
      } else {
        return res.json({
          status: true,
          SystemUser: checkSystemUser,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  updateSystemUser: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const update = {
        systemUserId: req.body.systemUserId.trim(),
        username: req.body.username,
        status: req.body.status,
        fullname: req.body.fullname,
        birthday: req.body.birthday,
        address: req.body.address,
        mobile: req.body.mobile,
        email: req.body.email,
        sex: req.body.sex,
        userTypeId: req.body.userTypeId,
        profileimage: req.body.profileimage,
        updatedBy: req.body.updateBy ? req.body.updateBy : null,
      };

      if (!update.username) {
        return res.json({
          status: false,
          message: "username is not defined. Please check out again.",
        });
      }

      if (!update.status) {
        return res.json({
          status: false,
          message: "status is not defined. Please check out again.",
        });
      }

      if (!update.fullname) {
        return res.json({
          status: false,
          message: "fullname is not defined. Please check out again.",
        });
      }

      if (!update.birthday) {
        return res.json({
          status: false,
          message: "birthday is not defined. Plase check out again.",
        });
      }

      if (update.email && !validator.isEmail(update.email)) {
        return res.json({
          status: false,
          message: "Email is not incorrect format. Plase check out again.",
        });
      }

      if (!update.sex) {
        return res.json({
          status: false,
          message: "Sex is not defined. Plase check out again.",
        });
      }

      if (update.userTypeId) {
        const checkUserTypeId = await UserType.findOne({
          isDeleted: { "!=": true },
          _id: update.userTypeId,
        });

        if (!checkUserTypeId) {
          return res.json({
            status: false,
            message: "UserType update không tồn tại.",
          });
        }
      }

      // if (!update.profileimage) {
      //     return res.json({
      //         status: false,
      //         message: 'Profile Image is not defined. Plase check out again.'
      //     })
      // }

      if (update.updatedBy) {
        const checkUserUpdate = await User.findOne({
          isDeleted: { "!=": true },
          _id: update.updatedBy,
        });

        if (!checkUserUpdate) {
          return res.json({
            status: false,
            message: "User Update không tồn tại.",
          });
        }
      }

      const updateSystemUser = await SystemUser.updateOne({
        isDeleted: { "!=": true },
        _id: update.systemUserId,
      }).set({
        username: update.username,
        status: update.status,
        fullname: update.fullname,
        birthday: update.birthday,
        address: update.address,
        mobile: update.mobile,
        email: update.email,
        sex: update.sex,
        userTypeId: update.userTypeId,
        profileimage: update.profileimage,
        updatedBy: update.updatedBy,
      });

      if (
        !updateSystemUser ||
        updateSystemUser == "" ||
        updateSystemUser == null
      ) {
        return res.json({
          status: false,
          message: "Lỗi...Không thể cập nhật thông tin System User.",
        });
      } else {
        return res.json({
          status: true,
          SystemUser: updateSystemUser,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  updatePasswordSystemUser: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const updatepassword = {
        systemUserId: req.body.systemUserId.trim(),
        password: req.body.password.trim(),
        newpassword: req.body.newpassword.trim(),
        confirmnewpassword: req.body.confirmnewpassword.trim(),
        updatedBy: req.body.updateBy ? req.body.updateBy : null,
      };

      if (!updatepassword.password) {
        return res.json({
          status: false,
          message: "Password is not defined. Please check out again.",
        });
      }

      if (!updatepassword.newpassword) {
        return res.json({
          status: false,
          message: "Password is not defined. Please check out again.",
        });
      }

      if (!updatepassword.confirmnewpassword) {
        return res.json({
          status: false,
          message:
            "Confirm New Password is not defined. Please check out again.",
        });
      }

      const checkSystemUser = await SystemUser.findOne({
        isDeleted: { "!=": true },
        _id: updatepassword.systemUserId,
      });

      if (!checkSystemUser) {
        return res.json({
          status: false,
          message: "SystemUser không tồn tại.",
        });
      }

      const checkhash = await SystemUser.validatePassword(
        updatepassword.password,
        checkSystemUser.password
      );

      if (!checkhash) {
        return res.json({
          status: false,
          message: "Password is incorrect. Please check out again.",
        });
      }

      if (updatepassword.confirmnewpassword != updatepassword.newpassword) {
        return res.json({
          status: false,
          message: "Mật khẩu mới và xác nhập mật khẩu không trùng khớp",
        });
      }

      if (!passSchema.validate(updatepassword.newpassword)) {
        return res.json({
          status: false,
          message:
            "New Password must be 6-24 characters, including letters and digits",
        });
      }

      // const hash = await SystemUser.setPasswordHash(updatepassword.newpassword);

      // if (!hash) {
      //     return res.json({
      //         status: false,
      //         message: 'Không thể mã hóa được password.'
      //     })
      // }

      if (updatepassword.updatedBy) {
        const checkUserUpdate = await User.findOne({
          isDeleted: { "!=": true },
          _id: update.updatedBy,
        });

        if (!checkUserUpdate) {
          return res.json({
            status: false,
            message: "User Update không tồn tại.",
          });
        }
      }

      const updateSystemUserPass = await SystemUser.updateOne({
        isDeleted: { "!=": true },
        _id: updatepassword.systemUserId,
      }).set({
        password: hash,
      });

      if (
        !updateSystemUserPass ||
        updateSystemUserPass == "" ||
        updateSystemUserPass == null
      ) {
        return res.json({
          status: false,
          message: "Lỗi...Không thể cập nhật mật khẩu System User.",
        });
      } else {
        return res.json({
          status: true,
          SystemUser: updateSystemUserPass,
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: err.message,
      });
    }
  },

  deleteSystemUser: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const systemUserId = req.body.systemUserId;
      const deletedBy = req.body.deletedBy ? req.body.deletedBy : null;

      if (!systemUserId) {
        return res.json({
          status: false,
          message: "systemUserId is not defined. Please check out again.",
        });
      }

      if (deletedBy) {
        const checkUserDelete = await User.findOne({
          isDeleted: { "!=": true },
          _id: deletedBy,
        });

        if (!checkUserDelete) {
          return res.json({
            status: false,
            message: "User Delete không tồn tại.",
          });
        }
      }

      const checkSystemUser = await SystemUser.findOne({
        isDeleted: { "!=": true },
        _id: systemUserId,
        isDeleted: false,
      });

      if (!checkSystemUser) {
        return res.json({
          status: false,
          message: "SystemUser không tồn tại.",
        });
      }

      const deleteSystemUser = await SystemUser.updateOne({
        isDeleted: { "!=": true },
        _id: systemUserId,
        isDeleted: false,
      }).set({
        isDeleted: true,
        deletedBy: deletedBy,
        deletedAt: Date.now(),
      });

      if (
        !deleteSystemUser ||
        deleteSystemUser == "" ||
        deleteSystemUser == null
      ) {
        return res.json({
          status: false,
          message: "Lỗi...Hủy System User không thành công.",
        });
      } else {
        return res.json({
          status: true,
          message: "SystemUser đã được hủy thành công.",
        });
      }
    } catch (err) {
      res.json({
        status: false,
        message: err.message,
      });
    }
  },

  getAllSystemUserDeleted: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }

    try {
      const isDeleted = req.query.isDeleted;

      const checkIsDeleted = await SystemUser.find({
        isDeleted: { "!=": true },
        isDeleted: true,
      });
      if (!checkIsDeleted) {
        return res.json({
          success: false,
          message: "All SystemUser deleted không tồn tại!",
        });
      } else {
        return res.json({
          success: true,
          SystemUser: checkIsDeleted,
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

// *************** Function to get root Parent of user tree
async function getRootParent(parentId) {
  if (parentId === null || typeof parentId === "undefined" || parentId === "") {
    return "";
  }
  let parent = await User.findOne({ isDeleted: { "!=": true }, id: parentId });
  if (!parent) {
    return "";
  }
  if (
    parent.userType === USER_TYPE.Factory &&
    parent.userRole === USER_ROLE.SUPER_ADMIN
  ) {
    return parent.id;
  }
  return await getRootParent(parent.isChildOf);
}
