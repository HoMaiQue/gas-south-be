/**
 * CarrierController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const API_ERRORS = require("../constants/APIErrors");
const validator = require("validator");
const passValidator = require("password-validator");
const USER_TYPE = require("../constants/UserTypes");
const USER_ROLE = require("../constants/UserRoles");

const passSchema = new passValidator();
const passMinLen = 6;
const passMaxLen = 24;

// Scheme for password validation
// See ref https://github.com/tarunbatra/password-validator
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
  createCarrier: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const order = {
        email: req.body.email,
        address: req.body.address,
        phone: req.body.phone,
        password: req.body.password,
        // userType: req.body.userType,
        // userRole: req.body.userRole,
        avatar: req.body.avatar,
        ////
        code: req.body.code,
        name: req.body.name,
        driverNumber: req.body.driverNumber,
        userId: req.body.userId,
        createdBy: req.userInfo.id,
        updatedBy: req.userInfo.id,
      };

      if (!order.email || !validator.isEmail(order.email)) {
        return res.badRequest(Utils.jsonErr("Tài khoản không đúng"));
      }

      const emailExist = await Carrier.findOne({
        isDeleted: { "!=": true },
        email: order.email,
        isDeleted: false,
      });
      if (emailExist)
        return res.json({
          error: true,
          message: "Email da ton tai",
        });

      if (!order.code) {
        return res.badRequest(Utils.jsonErr("Code is required"));
      }

      if (!order.name) {
        return res.badRequest(Utils.jsonErr("Name is required"));
      }

      if (!passSchema.validate(order.password)) {
        return res.badRequest(
          Utils.jsonErr(
            "Password must be 6-24 characters, including letters and digits"
          )
        );
      }

      if (!order.userId) {
        return res.json({
          success: false,
          message: "userId is not defined. Please check out again.",
        });
      } else {
        const checkUser = await User.findOne({
          isDeleted: { "!=": true },
          _id: order.userId,
        });

        if (!checkUser) {
          return res.json({
            success: false,
            message: "userId không tồn tại.",
          });
        }
      }

      const checkCarrier = await Carrier.findOne({
        isDeleted: { "!=": true },
        code: order.code,
        isDeleted: false,
      });

      if (checkCarrier) {
        return res.json({
          success: false,
          message: "Mã tài xế đã tồn tại.",
        });
      }

      const result = await CarrierManager.createUser(order);
      if (!result.success) {
        return res.badRequest(Utils.jsonErr(result.err));
      }

      res.created(result.data);
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Action for /carrier/login
   * @param req email, password
   * @param res
   * @returns {*}
   */
  login: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const email = req.body.email;
      const password = req.body.password;
      const playerID = req.body.playerID;

      if (!email || !validator.isEmail(email)) {
        return res.badRequest(Utils.jsonErr("Tài khoản không đúng"));
      }

      if (!password) {
        return res.badRequest(
          Utils.jsonErr("Tài khoản hoặc mật khẩu không đúng")
        );
      }

      const checkCarrier = await Carrier.findOne({
        isDeleted: { "!=": true },
        email: email,
        isDeleted: false,
      });

      if (!checkCarrier || checkCarrier == "" || checkCarrier == null) {
        return res.json({
          success: false,
          message: "Không tìm thấy tài khoản liên kết với email này.",
        });
      }

      CarrierManager.authenticateUserByPassword(email, password)
        .then(async ({ user, token }) => {
          // user.parentRoot = user.userType === USER_TYPE.Factory && user.userRole === USER_ROLE.SUPER_ADMIN ? user.id : await getRootParent(user.isChildOf);
          console.log("Controller login", { user, token });
          if (playerID) {
            const updateUser = await Carrier.updateOne({
              isDeleted: { "!=": true },
              email: email,
              isDeleted: false,
            }).set({
              playerID: playerID,
            });

            const _user = await Carrier.findOne({
              isDeleted: { "!=": true },
              _id: user.id,
            });

            return res.ok({ user: _user, token });
          } else {
            return res.ok({ user, token });
          }
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
              return res.serverError(Utils.jsonErr(err.message));
          }
        });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * Action for /user/reset_password
   * @param req
   * @param res
   * @returns {*}
   */
  resetPasswordByResetToken: function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const email = req.body.email;
    const resetToken = req.body.reset_token;
    const newPassword = req.body.new_password;
    const newPasswordConfirm = req.body.new_password_confirm;

    if (!email || !validator.isEmail(email)) {
      return res.badRequest(Utils.jsonErr("Tài khoản không đúng"));
    }

    if (!resetToken) {
      return res.badRequest(Utils.jsonErr("Reset token is required"));
    }

    if (!newPassword || newPassword !== newPasswordConfirm) {
      return res.badRequest(Utils.jsonErr("Password does not match"));
    }

    if (!passSchema.validate(newPassword)) {
      return res.badRequest(
        Utils.jsonErr(
          "Password must be 6-24 characters, including letters and digits"
        )
      );
    }

    CarrierManager.resetPasswordByResetToken(email, resetToken, newPassword)
      .then(() => {
        res.ok({ message: "Done" });
      })
      .catch((err) => {
        if (err === API_ERRORS.USER_NOT_FOUND) {
          // We show Tài khoản không đúng instead of User Not Found
          return res.badRequest(Utils.jsonErr("Tài khoản không đúng"));
        }
        /* istanbul ignore next */
        return res.serverError(Utils.jsonErr(err));
      });
  },

  /** Api dành cho tài xế
   * Action for /user/change_password
   * @param req
   * @param res
   * @returns {*}
   */
  changePassword: function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const email = req.body.email;
    const currentPassword = req.body.password;
    const newPassword = req.body.new_password;
    const newPasswordConfirm = req.body.new_password_confirm;

    if (!email || !validator.isEmail(email)) {
      return res.badRequest(Utils.jsonErr("Tài khoản không đúng"));
    }

    if (!currentPassword) {
      return res.badRequest(Utils.jsonErr("Current password is required"));
    }

    if (!newPassword || newPassword !== newPasswordConfirm) {
      return res.badRequest(Utils.jsonErr("Password does not match"));
    }

    if (!passSchema.validate(newPassword)) {
      return res.badRequest(
        Utils.jsonErr(
          "Password must be 6-24 characters, including letters and digits"
        )
      );
    }

    CarrierManager.changePassword(email, currentPassword, newPassword)
      .then((updatedUser) => {
        return res.ok({ updatedUser });
      })
      .catch((err) => {
        switch (err) {
          case API_ERRORS.USER_NOT_FOUND:
            return res.badRequest(Utils.jsonErr("Email not found"));

          // Processed by 'Invalid token' from policy
          // case API_ERRORS.USER_LOCKED:
          // 	return res.forbidden(Utils.jsonErr('Account locked'));

          case API_ERRORS.INVALID_PASSWORD:
            return res.badRequest(Utils.jsonErr("Invalid password"));
          default:
            /* istanbul ignore next */
            return res.serverError(Utils.jsonErr(err));
        }
      });
  },

  /** Api dành cho quản lý
   * Action for /user/change_password
   * @param req
   * @param res
   * @returns {*}
   */
  adminChangePassword: function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const email = req.body.email;
    const currentPassword = req.body.password;
    const newPassword = req.body.new_password;
    const newPasswordConfirm = req.body.new_password_confirm;

    if (!email || !validator.isEmail(email)) {
      return res.badRequest(Utils.jsonErr("Tài khoản không đúng"));
    }

    if (!currentPassword) {
      return res.badRequest(Utils.jsonErr("Current password is required"));
    }

    if (!newPassword || newPassword !== newPasswordConfirm) {
      return res.badRequest(Utils.jsonErr("Password does not match"));
    }

    if (!passSchema.validate(newPassword)) {
      return res.badRequest(
        Utils.jsonErr(
          "Password must be 6-24 characters, including letters and digits"
        )
      );
    }

    CarrierManager.changePassword(email, currentPassword, newPassword)
      .then((updatedUser) => {
        return res.ok({ updatedUser });
      })
      .catch((err) => {
        switch (err) {
          case API_ERRORS.USER_NOT_FOUND:
            return res.badRequest(Utils.jsonErr("Email not found"));

          // Processed by 'Invalid token' from policy
          // case API_ERRORS.USER_LOCKED:
          // 	return res.forbidden(Utils.jsonErr('Account locked'));

          case API_ERRORS.INVALID_PASSWORD:
            return res.badRequest(Utils.jsonErr("Invalid password"));
          default:
            /* istanbul ignore next */
            return res.serverError(Utils.jsonErr(err));
        }
      });
  },

  /**
   * Action for /user/forgot
   * @param req
   * @param res
   * @returns {*}
   */
  forgotPassword: function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const email = req.body.email;

    if (!email || !validator.isEmail(email)) {
      return res.badRequest(Utils.jsonErr("Tài khoản không đúng"));
    }

    CarrierManager.generateResetToken(email)
      .then(() => {
        res.ok({ message: "Check your email" });
      })
      .catch((err) => {
        if (err === API_ERRORS.USER_NOT_FOUND) {
          return res.notFound(Utils.jsonErr("User not found"));
        }
        /* istanbul ignore next */
        return res.serverError(Utils.jsonErr(err));
      });
  },

  getCarrierById: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const carrierId = req.body.carrierId.trim();

      if (!carrierId) {
        return res.json({
          success: false,
          message: "carrierId is not defined. Please check out again.",
        });
      }

      const checkCarrier = await Carrier.findOne({
        isDeleted: { "!=": true },
        _id: carrierId,
        isDeleted: false,
      });

      if (!checkCarrier || checkCarrier == "" || checkCarrier == null) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy tài xế.",
        });
      } else {
        return res.json({
          success: true,
          Carrier: checkCarrier,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getCarrierByUserId: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const userId = req.body.userId.trim();

      if (!userId) {
        return res.json({
          success: false,
          message: "userId is not defined. Please check out again.",
        });
      }

      const checkCarrier = await Carrier.findOne({
        isDeleted: { "!=": true },
        userId: userId,
        isDeleted: false,
      });

      if (!checkCarrier || checkCarrier == "" || checkCarrier == null) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy tài xế.",
        });
      } else {
        return res.json({
          success: true,
          Carrier: checkCarrier,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getAllCarrier: async function (req, res) {
    try {
      const checkCarrier = await Carrier.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      });
      //.populate('userId');//hoapd bo vi khong can thiet

      if (!checkCarrier || checkCarrier == "" || checkCarrier == null) {
        return res.json({
          success: false,
          message: "Lỗi...Không tìm thấy tài xế.",
        });
      } else {
        return res.json({
          success: true,
          Carrier: checkCarrier,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Api cập nhật dành cho phía quản lý
  updateCarrier: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const update = {
        carrierId: req.body.carrierId.trim(),
        name: req.body.name,
        driverNumber: req.body.driverNumber,
        userId: req.body.userId,
        address: req.body.address,
        phone: req.body.phone,
        avatar: req.body.avatar,
        updatedBy: req.userInfo.id,
      };

      if (!update.carrierId) {
        return res.json({
          success: false,
          message: "carrierId is not defined. Please check out again.",
        });
      }

      const checkCarrier = await Carrier.findOne({
        isDeleted: { "!=": true },
        _id: update.carrierId,
        isDeleted: false,
      });

      if (!checkCarrier) {
        return res.json({
          success: false,
          message: "Tài xế không tồn tại.",
        });
      }

      const updateCarrier = await Carrier.updateOne({
        isDeleted: { "!=": true },
        _id: update.carrierId,
      }).set({
        avatar: update.avatar,
        name: update.name,
        driverNumber: update.driverNumber,
        userId: update.userId,
        address: update.address,
        phone: update.phone,
        updatedBy: update.updatedBy,
      });

      // await req.file('avatar').upload({
      //     dirname: require('path').resolve(__dirname, '../../.tmp/public/images')
      //     //dirname: require('path').resolve(__dirname, '../../../Picture')
      //     },async function (err, uploadedFiles) {
      //       if (err) return res.serverError(err);

      //       let image = uploadedFiles[0] ? uploadedFiles[0].fd: '';
      //       console.log('uploadedFiles[0]', image);

      //       let data = image.split(/(\\|\/)/g).pop()
      //       console.log('image.split', data);
      //       //
      //       let updateCarrier
      //       if (!data) {
      //         updateCarrier = await Carrier.updateOne({isDeleted: {"!=": true},
      //             _id: update.carrierId
      //         })
      //         .set({
      //             name: update.name,
      //             driverNumber: update.driverNumber,
      //             userId: update.userId,
      //             address: update.address,
      //             phone: update.phone,
      //             updatedBy: update.updatedBy,
      //         });
      //       }
      //       else {

      //         updateCarrier = await Carrier.updateOne({isDeleted: {"!=": true},
      //             _id: update.carrierId
      //         })
      //         .set({
      //             avatar: data,
      //             name: update.name,
      //             driverNumber: update.driverNumber,
      //             userId: update.userId,
      //             address: update.address,
      //             phone: update.phone,
      //             updatedBy: update.updatedBy,
      //         });

      //         var fs = require('fs');

      //         var error = false;
      //         var proImagePath = `./.tmp/public/images/${data}`;
      //         var stream = fs.createReadStream(proImagePath);
      //         var desti = fs.createWriteStream(`./assets/images/${data}`);

      //         stream.on('error', function (error) {
      //           error = true;
      //           console.log("Caught", error);
      //         });

      //         stream.on('open', function () {

      //           stream.pipe(desti);

      //         });

      //         stream.on('close', function () // Finished downloading...
      //         {
      //           if (!error) // If no errors occured
      //           {
      //             //fs.unlink(proImagePath); // Delete the archive
      //           }
      //         });

      //         // a = await User.updateOne({isDeleted: {"!=": true},email: email}).set({avatar: data, name: name, address: address});
      //       }

      if (!updateCarrier || updateCarrier == "" || updateCarrier == null) {
        return res.json({
          success: false,
          message: "Lỗi...Không thể cập nhật thông tin tài xế.",
        });
      } else {
        return res.json({
          success: true,
          Carrier: updateCarrier,
        });
      }

      // });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Api cập nhật dành cho phía tài xế
  updateCarrierInfo: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const update = {
        carrierId: req.body.carrierId.trim(),
        name: req.body.name,
        phone: req.body.phone,
      };

      if (!update.carrierId) {
        return res.json({
          success: false,
          message: "ID tài xế không xác định!",
        });
      }

      const checkCarrier = await Carrier.findOne({
        isDeleted: { "!=": true },
        _id: update.carrierId,
        isDeleted: false,
      });

      if (!checkCarrier) {
        return res.json({
          success: false,
          message: "Tài xế không tồn tại.",
        });
      }

      const updateCarrier = await Carrier.updateOne({
        isDeleted: { "!=": true },
        _id: update.carrierId,
      }).set({
        name: update.name,
        phone: update.phone,
        updatedBy: req.userInfo.id,
      });

      if (!updateCarrier || updateCarrier == "" || updateCarrier == null) {
        return res.json({
          success: false,
          message: "Lỗi...Không thể cập nhật thông tin tài xế.",
        });
      } else {
        return res.json({
          success: true,
          Carrier: updateCarrier,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Hủy
  cancelCarrier: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const carrierId = req.body.carrierId.trim();
      const deletedBy = req.body.deletedBy ? req.body.deletedBy : null;
      if (!carrierId) {
        return res.json({
          success: false,
          message: "carrierId is not defined. Please check out again.",
        });
      }

      if (deletedBy) {
        const checkUserDelete = await User.findOne({
          isDeleted: { "!=": true },
          _id: deletedBy,
        });

        if (!checkUserDelete) {
          return res.json({
            success: false,
            message: "User Delete không tồn tại.",
          });
        }
      }

      const checkCarrier = await Carrier.findOne({
        isDeleted: { "!=": true },
        _id: carrierId,
        isDeleted: false,
      });

      if (!checkCarrier) {
        return res.json({
          success: false,
          message: "Tài xế không tồn tại.",
        });
      }

      const cancelCarrier = await Carrier.updateOne({
        isDeleted: { "!=": true },
        _id: carrierId,
        isDeleted: false,
      }).set({
        isDeleted: true,
        deletedBy: deletedBy,
        deletedAt: Date.now(),
      });

      if (!cancelCarrier || cancelCarrier == "" || cancelCarrier == null) {
        return res.json({
          success: false,
          message: "Lỗi...Hủy tài xế không thành công.",
        });
      } else {
        return res.json({
          success: true,
          message: "Tài xế đã được hủy thành công",
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

// *************** Function to get root Parent of user tree
async function getRootParent(parentId) {
  if (parentId === null || typeof parentId === "undefined" || parentId === "") {
    return "";
  }
  let parent = await Carrier.findOne({
    isDeleted: { "!=": true },
    id: parentId,
  });
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
