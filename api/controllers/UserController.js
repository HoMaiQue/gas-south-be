/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const API_ERRORS = require("../constants/APIErrors");
const validator = require("validator");
const passValidator = require("password-validator");
const USER_TYPE = require("../constants/UserTypes");
const USER_ROLE = require("../constants/UserRoles");
// const User = require('../models/User');

//var {uploadF}     = require("../../middleware/multer.middleware");
// uploadF.single('avatar');

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
  // Lấy khách hàng theo loại General / Industry
  getListUserByType: async function (req, res) {
    const { isChildOf, customerType } = req.query;

    if (!isChildOf) {
      return res.badRequest(Utils.jsonErr("Id is required"));
    }

    try {
      // Khách hàng công nghiệp
      if (customerType === "Industry") {
        const result = await User.find({
          isDeleted: { "!=": true },
          customerType: customerType,
          userType: "General",
          userRole: "SuperAdmin",
          isChildOf: isChildOf,
          isDeleted: false,
        });

        if (result.length > 0) {
          return res.json({
            success: true,
            data: result,
            message: "Tìm thấy danh sách khách hàng",
          });
        } else {
          return res.json({
            success: false,
            message: "Không tìm thấy khách hàng nào",
          });
        }
      }

      // Đại lý phân phối
      if (customerType === "Distribution") {
        const result = await User.find({
          isDeleted: { "!=": true },
          customerType: {
            "!=": "Industry",
          },
          userType: "General",
          userRole: "SuperAdmin",
          isChildOf: isChildOf,
          isDeleted: false,
        });

        if (result.length > 0) {
          return res.json({
            success: true,
            data: result,
            message: "Tìm thấy danh sách khách hàng",
          });
        } else {
          return res.json({
            success: false,
            message: "Không tìm thấy khách hàng nào",
          });
        }
      }

      // Cửa Hàng Bán Lẻ
      if (customerType === "Agency") {
        const result = await User.find({
          isDeleted: { "!=": true },
          // customerType: customerType,
          userType: "Agency",
          userRole: "SuperAdmin",
          isChildOf: isChildOf,
          isDeleted: false,
        });

        if (result.length > 0) {
          return res.json({
            success: true,
            data: result,
            message: "Tìm thấy danh sách khách hàng",
          });
        } else {
          return res.json({
            success: false,
            message: "Không tìm thấy khách hàng nào",
          });
        }
      }
    } catch (error) {
      return res.json({
        success: false,
        message: "Gặp lỗi khi tìm kiếm danh sách khách hàng",
      });
    }
  },

  // Sopet - Lay danh sach khach hang theo loai
  getListByCustomerType: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    const { isChildOf, customerType } = req.body.reqListCustomer;
    if (!customerType) {
      return res.badRequest(Utils.jsonErr("CustomerType is required"));
    }
    if (!isChildOf) {
      return res.badRequest(Utils.jsonErr("Id is required"));
    }
    try {
      const result = await User.find({
        isDeleted: { "!=": true },
        customerType: customerType,
        isChildOf: isChildOf,
        warehouseCode: { "!=": null },
        isDeleted: false,
      });
      if (result.length > 0) {
        return res.json({
          success: true,
          data: result,
          message: "Tìm thấy danh sách khách hàng",
        });
      } else {
        return res.json({
          success: false,
          message: "Không tìm thấy khách hàng nào",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: "Gặp lỗi khi tìm kiếm danh sách khách hàng",
      });
    }
  },
  // sopet- lay danh sach chi nhanh
  getListBranch: async function (req, res) {
    if (!req.body) {
      // return res.badRequest(Utils.jsonErr('Empty body'));
      return res.json({ success: false, message: "Empty body" });
    }
    const { id } = req.body.reqListBranch;
    if (!id) {
      // return res.badRequest(Utils.jsonErr('Id is required'))
      return res.json({ success: false, message: "Id is required" });
    }
    try {
      const result = await User.find({
        isDeleted: { "!=": true },
        isChildOf: id,
        agencyCode: { "!=": null },
        userRole: "SuperAdmin",
        isDeleted: false,
      });
      if (result.length > 0) {
        return res.json({
          success: true,
          data: result,
          message: "Tìm thấy danh sách chi nhánh",
        });
      } else {
        return res.json({
          success: false,
          message: "Không tìm thấy chi nhánh nào",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: "Gặp lỗi khi tìm kiếm danh sách chi nhánh",
      });
    }
  },

  //////

  findNew: async function (req, res) {
    let user = await User.find({
      isDeleted: { "!=": true },
      userType: req.query.userType,
    }).populate("isChildOf");
    res.ok(user);
  },

  /**
   * Action for /user
   * @param req
   * @param res
   */
  index: function (req, res) {
    // We use here req.userInfo which is set in policies/jwtAuth.js
    res.ok({
      id: req.userInfo.id,
      email: req.userInfo.email,
    });
  },

  /**
   * Action for /user/info
   * @param req
   * @param res
   */
  info: async function (req, res) {
    // We use here req.userInfo which is set in policies/jwtAuth.js
    let user = await User.findOne({
      isDeleted: { "!=": true },
      id: req.userInfo.id,
    }).populate("relations");
    res.ok(user);
  },

  getInforById: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id } = req.body;

    try {
      let user = await User.findOne({ isDeleted: { "!=": true }, id: id });

      if (user) {
        return res.json({
          status: true,
          data: user,
          message: "Lay thong tin user thanh cong",
        });
      } else {
        return res.json({
          status: false,
          message: "Lay thong tin user that bai",
        });
      }
    } catch (err) {
      return res.json({ status: false, message: err.message });
    }
  },

  /**
   * Action for /user/info
   * @param req
   * @param res
   */
  me: function (req, res) {
    let user = User.findOne({
      isDeleted: { "!=": true },
      id: req.userInfo.id,
    }).populate("relations");
    return res.ok(user);
  },

  /**
   * Action for /user/addUser
   * @param email, name, password,address,userType
   * @param res
   * @returns {*}
   */
  addUser: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    const email = req.body.email;
    const name = req.body.name;
    const address = req.body.address;
    const phone = req.body.phone;
    const password = req.body.password;
    const userType = req.body.userType;
    const userRole = req.body.userRole;
    const relations = req.body.relations;
    const owner = req.body.owner;
    const isChildOf = req.body.isChildOf;
    const code = req.body.code;
    const LAT = req.body.lat;
    const LNG = req.body.lng;
    const staffOf = req.body.staffOf;
    // thông tin nhãn hàng
    const prefix = req.body.prefix;
    const customerType = req.body.customerType ? req.body.customerType : "";

    if (!email || !validator.isEmail(email)) {
      return res.badRequest(Utils.jsonErr("Tài khoản không đúng"));
    }

    const emailExist = await User.findOne({
      isDeleted: { "!=": true },
      email: email,
    });
    if (emailExist)
      return res.json({ error: true, message: "Email da ton tai" });

    if (!name) {
      return res.badRequest(Utils.jsonErr("Name is required"));
    }

    if (!code && userRole === "SuperAdmin") {
      return res.badRequest(Utils.jsonErr("Code is required"));
    }

    if (!address) {
      return res.badRequest(Utils.jsonErr("Address is required"));
    }
    if (!userType) {
      return res.badRequest(Utils.jsonErr("UserType is required"));
    }

    if (!passSchema.validate(password)) {
      return res.badRequest(
        Utils.jsonErr(
          "Password must be 6-24 characters, including letters and digits"
        )
      );
    }

    if (
      !prefix &&
      // Trạm
      ((userType === "Factory" && userRole === "Onwer") ||
        // Nhà máy sửa chữa
        (userType === "Fixer" && userRole === "SuperAdmin"))
    ) {
      // && ['Factory', 'Fixer'].includes(userType) && ['SuperAdmin', 'Owner'].includes(userRole)) {
      return res.badRequest(Utils.jsonErr("Prefix is required"));
    }

    const result = await UserManager.createUser({
      email,
      password,
      name,
      address,
      phone,
      userType,
      userRole,
      isChildOf,
      owner,
      code,
      LAT,
      LNG,
      staffOf,
      prefix,
      customerType,
    });
    if (!result.success) {
      return res.badRequest(Utils.jsonErr(result.err));
    }

    res.created(result.data);
  },

  /**
   * Action for /user/create
   * @param email, password, password_confirm
   * @param res
   * @returns {*}
   */
  create: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const email = req.body.email;
    const name = req.body.name;
    const address = req.body.address;
    const phone = req.body.phone;
    const password = req.body.password;
    const passwordConfirm = req.body.password_confirm;
    const userType = req.body.userType;
    const userRole = req.body.userRole;
    const relations = req.body.relations;
    const owner = req.body.owner;
    const isChildOf = req.body.isChildOf;
    const createBy = req.body.idUser;
    const LAT = req.body.lat;
    const LNG = req.body.lng;
    const code = req.body.code;
    const prefix = req.body.prefix;
    // const trademark = "";
    // const origin = "";
    // const addressAt = "";
    // const mass = "";
    // const ingredient = "";
    // const preservation = "";
    // const appliedStandard = "";

    if (!email || !validator.isEmail(email)) {
      return res.badRequest(Utils.jsonErr("Tài khoản không đúng"));
    }

    if (!name) {
      return res.badRequest(Utils.jsonErr("Name is required"));
    }

    if (!code) {
      return res.badRequest(Utils.jsonErr("code is required"));
    } else if (code) {
      const user = User.find({ code: code, isDeleted: { "!=": true } });
      if (!user || user.length <= 0) {
        return res.badRequest(Utils.jsonErr("code is exist"));
      }
    }

    if (!address) {
      return res.badRequest(Utils.jsonErr("Address is required"));
    }

    if (password !== passwordConfirm) {
      return res.badRequest(Utils.jsonErr("Password does not match"));
    }

    if (!passSchema.validate(password)) {
      return res.badRequest(
        Utils.jsonErr(
          "Password must be 6-24 characters, including letters and digits"
        )
      );
    }

    if (!prefix) {
      return res.badRequest(Utils.jsonErr("Prefix is required"));
    }

    const result = await UserManager.createUser({
      email,
      password,
      name,
      address,
      phone,
      userType,
      userRole,
      isChildOf,
      owner,
      //  trademark, origin, addressAt, mass, ingredient, preservation, appliedStandard,
      createBy,
      LAT,
      LNG,
      code,
      prefix,
    });
    if (!result.success) {
      return res.badRequest({ message: result.err });
    }

    res.created(result.data);
  },

  /**
   * Action for /user/login
   * @param req email, password
   * @param res
   * @returns {*}
   */
  login: function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

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

    UserManager.authenticateUserByPassword(email, password)
      .then(async ({ user, token }) => {
        user.parentRoot =
          user.userType === USER_TYPE.Factory &&
          user.userRole === USER_ROLE.SUPER_ADMIN
            ? user.id
            : await getRootParent(user.isChildOf);
        console.log("Controller login", { user, token });
        if (playerID) {
          const updateUser = await User.updateOne({
            isDeleted: { "!=": true },
            email: email,
          }).set({
            playerID: playerID,
          });

          const _user = await User.findOne({
            isDeleted: { "!=": true },
            _id: user.id,
          });
          // console.log(user.isChildOf);
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

    UserManager.generateResetToken(email)
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

  /**
   * Action for /user/updateChild
   * @param req
   * @param res
   * @returns {*}
   */
  updateChild: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const user = req.userInfo;

    const targetId = req.body.target_id;
    const name = req.body.name;
    const shortName = req.body.short_name;
    const address = req.body.address;
    const phone = req.body.phone;
    const newPassword = req.body.new_password;
    const LAT = req.body.LAT;
    const LNG = req.body.LNG;
    const prefix = req.body.prefix;
    const code = req.body.code;

    if (!targetId) {
      return res.badRequest(Utils.jsonErr("Missing target_id"));
    }

    if (newPassword && !passSchema.validate(newPassword)) {
      return res.badRequest(
        Utils.jsonErr(
          "Password must be 6-24 characters, including letters and digits"
        )
      );
    }

    try {
      const targetUser = await User.findOne({
        isDeleted: { "!=": true },
        id: targetId,
      });

      if (targetUser.isChildOf !== user.id) {
        return res.badRequest(
          Utils.jsonErr(
            "You don't have permission to change info of this account"
          )
        );
      }
      let userChangeInfo = {};
      if (name) {
        userChangeInfo.name = name;
      }
      if (shortName) {
        userChangeInfo.shortName = shortName;
      }
      if (address) {
        userChangeInfo.address = address;
      }
      if (phone) {
        userChangeInfo.phone = phone;
      }
      if (LAT) {
        userChangeInfo.LAT = LAT;
      }
      if (LNG) {
        userChangeInfo.LNG = LNG;
      }
      if (prefix) {
        userChangeInfo.prefix = prefix;
      }
      if (code) {
        userChangeInfo.code = code;
      }

      UserManager.updateUser(targetUser, newPassword, userChangeInfo)
        .then((updatedChild) => {
          return res.ok({ updatedChild });
        })
        .catch((err) => {
          throw err;
        });
    } catch (error) {
      return res.serverError(Utils.jsonErr(error));
    }
  },

  /**
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

    UserManager.changePassword(email, currentPassword, newPassword)
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

    UserManager.resetPasswordByResetToken(email, resetToken, newPassword)
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

  /**
   * Action for /user/getDestination
   * @param req
   * @param res
   * @returns {*}
   */
  getDestination: async function (req, res) {
    const user = req.userInfo;

    const userType = req.query.user_type;
    const actionType = req.query.action_type;
    const userRole = req.query.user_role;
    // import, export, turn_back,
    let query = {};

    if (
      actionType &&
      actionType === "IMPORT" &&
      user.userType !== USER_TYPE.Factory
    ) {
      query.id = user.isChildOf ? user.isChildOf : -11111;
    } else {
      if (user.userType === USER_TYPE.Agency) {
        if (user.userRole === "SuperAdmin") {
          query.isChildOf = user.id;
        } else {
          query.isChildOf = user.isChildOf;
        }
      } else {
        query.isChildOf = user.id;
      }

      if (userType) {
        query.userType = userType;
      }

      if (userRole && user.userRole !== "Staff" && user.userRole !== "Driver") {
        query.userRole = userRole;
      }

      if (user.userType === USER_TYPE.Factory) {
        if (actionType === "IMPORT") {
          query.userType = USER_TYPE.Station;
        }
        if (actionType === "EXPORT" && userType !== USER_TYPE.Station) {
          query.userType = [USER_TYPE.Agency, USER_TYPE.General];
        }
      }

      if (user.userType === USER_TYPE.Station) {
        if (actionType === "EXPORT_PARENT_CHILD") {
          query.isChildOf = user.isChildOf;
          delete query.userType;
        }
        if (actionType === "EXPORT") {
          query = {
            id: user.isChildOf,
          };
        }
      }
    }
    sails.log("QUERRYYY::::", query);

    try {
      let relativeUsers = await User.find(query);

      if (
        user.userType === USER_TYPE.Station &&
        actionType === "EXPORT_PARENT_CHILD"
      ) {
        const childs = await User.find({
          isDeleted: { "!=": true },
          isChildOf: user.id,
        });
        relativeUsers = relativeUsers.concat(childs);
        _.remove(relativeUsers, (item) => {
          return item.id === user.id;
        });
      }

      return res.ok(relativeUsers);
    } catch (err) {
      return res.badRequest({ message: err.message });
    }
  },

  /**
   * Action GET for /user/getAllFactory
   * @param req
   * @param res
   * @returns {partner}
   */
  getAllFactory: async function (req, res) {
    const user = req.userInfo;
    const searchWord = req.query.search;

    let page = parseInt(req.query.page);
    if (!page) {
      page = 1;
    }

    let limit = parseInt(req.query.limit);
    if (!limit) {
      limit = 10;
    }

    const skip = limit * (page - 1);

    try {
      let partners = [];
      let count = 0;
      if (searchWord) {
        partners = await User.find({
          isDeleted: { "!=": true },
          where: {
            isChildOf: { "!=": user.id },
            userType: USER_TYPE.Factory,
            id: { "!=": user.id },
            or: [
              { name: { contains: searchWord } },
              { email: { contains: searchWord } },
              { address: { contains: searchWord } },
            ],
          },
          limit,
          skip,
        });
        count = await User.count({
          isChildOf: { "!=": user.id },
          userType: USER_TYPE.Factory,
          id: { "!=": user.id },
          or: [
            { name: { contains: searchWord } },
            { email: { contains: searchWord } },
            { address: { contains: searchWord } },
          ],
        });
      } else {
        partners = await User.find({
          isDeleted: { "!=": true },
          where: {
            isChildOf: { "!=": user.id },
            userType: USER_TYPE.Factory,
            id: { "!=": user.id },
          },
          limit,
          skip,
        });
        //const partners = await User.find({isDeleted: {"!=": true},where: {userType: 'Factory', id: {'!=': user.id}}});
        count = await User.count({
          where: {
            isChildOf: { "!=": user.id },
            userType: USER_TYPE.Factory,
            id: { "!=": user.id },
          },
        });
      }

      //const totalItem = (page - 1) * limit + partners.length;
      //console.log('Maximum Item:', count);

      const response = {
        data: partners,
        totalItem: count,
      };
      return res.ok(response);
    } catch (error) {
      return res.serverError(error);
    }
  },

  /**
   * Action GET for /user/getReportChilds
   * @param req
   * @param res
   * @returns {partner}
   */
  getReportChilds: async function (req, res) {
    const user = req.userInfo;
    const userId = req.query.user_id;
    const userType = req.query.user_type;

    let credential = {
      userType: userType,
      isChildOf: userId,
      allowReport: true,
    };

    if (userType === USER_TYPE.Factory) {
      credential.userRole = USER_ROLE.OWNER;
    }

    try {
      let result = await User.find(credential);
      const parentRoot = await getRootParent(userId);
      result = result.map((child) => {
        child.parentRoot = parentRoot;
        return child;
      });

      return res.ok(result);
    } catch (error) {
      return res.serverError(error);
    }
  },
  // lấy cân nặng bình ga hồi lưu
  returnGasS: async function (req, res) {
    //let { id, serialCylinder, dateReceived, weight } = req.body;
    let { idManufacture, cylindersReturn, createBy } = req.body;

    const dateReceived = Date();
    const length = cylindersReturn.length;
    let data = [];

    // let IdManufacture = await tmp[0].manufacture;

    // console.log("id la " + IdManufacture);

    // if (id != IdManufacture) {
    //   let name = await Manufacture.find({isDeleted: {"!=": true}, _id: IdManufacture });
    //   let nameCompany = name[0].name
    //   console.log("namecompany la " + nameCompany);
    //   return res.json({
    //     statuscode: 400,
    //     message: "binh gas khong thuoc so huu cua " + nameCompany
    //   });
    // }

    if (length > 0) {
      for (let i = 0; i < length; i++) {
        data[i] = await returnGas
          .create({
            serialCylinder: cylindersReturn[i].serial,
            dateReceived: dateReceived,
            weight: cylindersReturn[i].weight,
            idCompany: idManufacture,
            createBy: createBy,
          })
          .fetch();
      }

      console.log({ data });

      return res.json({ error: false, data: data });
    } else {
      return res.json({ error: true, message: "Khong co binh nao" });
    }

    // ---   ---   ---

    // if (!serialCylinder) {
    //   return res.json({
    //     statuscode: 400,
    //     message: "bạn chưa nhập serial binh ga"
    //   });
    // }

    // let tmp = await Cylinder.find({isDeleted: {"!=": true}, serial: serialCylinder });

    // if (tmp == undefined || tmp == "" || tmp == null) {
    //   return res.json({
    //     statuscode: 400,
    //     message: "khong co serial nay trong he thong"
    //   });
    // }
    // if (!id) {
    //   return res.json({
    //     statuscode: 400,
    //     message: "bạn chưa login"
    //   });
    // }
    // let IdManufacture = await tmp[0].manufacture;

    // console.log("id la " + IdManufacture);

    // if (id != IdManufacture) {
    //   let name = await Manufacture.find({isDeleted: {"!=": true}, _id: IdManufacture });
    //   let nameCompany = name[0].name
    //   console.log("namecompany la " + nameCompany);
    //   return res.json({
    //     statuscode: 400,
    //     message: "binh gas khong thuoc so huu cua " + nameCompany
    //   });
    // }

    // if (!dateReceived) {
    //   return res.json({
    //     statuscode: 400,
    //     message: "bạn chưa nhập ngay hoi luu"
    //   });
    // }
    // if (!weight) {
    //   return res.json({
    //     statuscode: 400,
    //     message: "bạn chưa nhập can nang"
    //   });
    // }

    // let data = await returnGas.create({ serialCylinder: serialCylinder, dateReceived: dateReceived, weight: weight, idCompany: id, createBy: id }).fetch();
    // console.log({ data });

    // if (data) {
    //   return res.json({ error: false, data: data });
    // }
    // else {
    //   return res.json({ error: true, message: 'Them that bai' });
    // }
  },
  // cap nhat thong tin binh gas hoi luu
  updateReturnGas: async function (req, res) {
    var { idCylinder, idUser, serialCylinder, dateReceived, weight } = req.body;
    let data = await returnGas.findOne({
      isDeleted: { "!=": true },
      _id: idCylinder,
    });

    if (data == undefined || data == "" || data == null) {
      return res.json({ error: true, message: "cylinder Không tồn tại !" });
    }
    if (!serialCylinder) {
      serialCylinder = data.serialCylinder;
    }
    if (!dateReceived) {
      dateReceived = data.dateReceived;
    }
    if (!weight) {
      weight = data.weight;
    }
    let a = await returnGas
      .updateOne({ isDeleted: { "!=": true }, _id: idCylinder })
      .set({
        serialCylinder: serialCylinder,
        dateReceived: dateReceived,
        weight: weight,
        updateBy: idUser,
      });
    if (a) {
      return res.json({ error: false, data: a });
    } else {
      return res.json({ error: true, message: "loi update !" });
    }
  },
  // lay danh sach binh gas hoi luu
  getListReturnGas: async function (req, res) {
    let data = await returnGas.find({ isDeleted: { "!=": true } });
    //let data = await returnGas.find({isDeleted: {"!=": true},where: {_id : "5e96d1152749f718a0e6ed6d"},select: ['serialCylinder', 'dateReceived', 'weight', 'createBy', 'updateBy','idCompany']});
    console.log(data);

    if (data) {
      return res.json({ error: false, data: data });
    } else {
      return res.json({ error: true, message: "loi get !" });
    }
  },

  //  cap nhat thong tin doi tac
  //  uploadFile:  async function (req, res){
  updateInformationUser: async function (req, res) {
    email = req.body.email;
    name = req.body.name;
    address = req.body.address;

    console.log("Upload anh", req.body);

    var data = await User.find({
      isDeleted: { "!=": true },
      email: email,
    }).limit(1);
    //var data = await User.findOne({isDeleted: {"!=": true}, email: email });

    console.log(data);
    if (data == undefined || data == "" || data == null) {
      return res.json({ error: true, message: "email Không tồn tại !" });
    }
    if (!name) {
      name = data.name;
    }
    if (!address) {
      address = data.address;
    }

    // await req.file('avatar').upload({
    //   dirname: require('path').resolve(__dirname, './.tmp/public/images')
    // },function (err, uploadedFiles) {
    //   if (err) return res.serverError(err);

    //   // return res.json({
    //   //   message: uploadedFiles.length + ' file(s) uploaded successfully!'
    //   // });
    // });

    await req.file("avatar").upload(
      {
        dirname: require("path").resolve(__dirname, "../../.tmp/public/images"),
        //dirname: require('path').resolve(__dirname, '../../../Picture')
      },
      async function (err, uploadedFiles) {
        if (err) return res.serverError(err);

        let hieu = uploadedFiles[0] ? uploadedFiles[0].fd : "";
        console.log("uploadedFiles[0]", hieu);

        let data = hieu.split(/(\\|\/)/g).pop();
        console.log("hieu.split", data);
        //
        let a;
        if (!data) {
          a = await User.updateOne({
            isDeleted: { "!=": true },
            email: email,
          }).set({
            name: name,
            address: address,
          });
        } else {
          a = await User.updateOne({
            isDeleted: { "!=": true },
            email: email,
          }).set({
            avatar: data,
            name: name,
            address: address,
          });

          var fs = require("fs");

          var error = false;
          var proImagePath = `./.tmp/public/images/${data}`;
          var stream = fs.createReadStream(proImagePath);
          var desti = fs.createWriteStream(`./assets/images/${data}`);

          stream.on("error", function (error) {
            error = true;
            console.log("Caught", error);
          });

          stream.on("open", function () {
            stream.pipe(desti);
          });

          stream.on("close", function () // Finished downloading...
          {
            if (!error) {
              // If no errors occured
              //fs.unlink(proImagePath); // Delete the archive
            }
          });

          // a = await User.updateOne({isDeleted: {"!=": true},email: email}).set({avatar: data, name: name, address: address});
        }

        if (a != undefined && a != "" && a != null) {
          return res.json({ error: false, data: a });
        } else {
          return res.json({ error: true, message: "loi update !" });
        }
      }
    );
  },
  // lấy danh sách tài xế của thương nhân sở hữu
  getDriver: async function (req, res) {
    id = req.body.id;
    let data = await User.find({
      isDeleted: { "!=": true },
      isChildOf: id,
      userRole: "Deliver",
      staffOf: id,
    });
    console.log(data);
    if (data) {
      return res.json({ error: false, data: data });
    } else {
      return res.json({ error: true, message: "không có tài xế nào" });
    }
  },

  // lay ten tai xe
  listNameDriver: async function (req, res) {
    let id = req.body.id;
    // var usersNamedFinn = await User.find({isDeleted: {"!=": true},isChildOf : id, userRole :"Deliver"},{name: 1});
    // console.log(usersNamedFinn);
    let obj = {};
    let arr = [];
    if (id) {
      let data = await User.find({
        isDeleted: { "!=": true },
        isChildOf: id,
        userRole: "Deliver",
        staffOf: id,
      });
      if (data.length > 0) console.log(data[0].name);
      // let obj = {};
      // let arr = [];
      for (let i = 0; i < data.length; i++) {
        obj = { name: data[i].name, id: data[i].id };
        arr.push(obj);
      }
      if (arr) {
        return res.json({ error: false, data: arr });
      } else {
        return res.json({ error: true, message: "không có tài xế nào" });
      }
    } else {
      return res.json({ error: true, data: arr });
    }
  },
  // lay chu ky tai xe
  getSignature: async function (req, res) {
    let id = req.body.id;
    let data = await History.find({
      isDeleted: { "!=": true },
      idDriver: id,
    }).sort([{ createdAt: "DESC" }]);
    console.log(data);
    if (data != undefined || data != null || data != "") {
      return res.json({ err: false, data: data });
    } else {
      return res.json({ err: true, message: "loi lay chu ky tai xe" });
    }
  },

  // lấy danh sách thanh tra
  getInspector: async function (req, res) {
    id = req.body.id;
    let data = await User.find({
      isDeleted: { "!=": true },
      owner: id,
      userRole: "Inspector",
      staffOf: id,
    });
    console.log(data);
    if (data) {
      return res.json({ error: false, data: data });
    } else {
      return res.json({ error: true, message: "Không có thanh tra nào" });
    }
  },

  // lấy danh sách nhân viên
  getStaff: async function (req, res) {
    id = req.body.id;
    let data = await User.find({
      isDeleted: { "!=": true },
      owner: id,
      userRole: { in: ["Staff", "Deliver"] },
      staffOf: id,
    });
    console.log(data);
    if (data) {
      return res.json({ error: false, data: data });
    } else {
      return res.json({ error: true, message: "Không có nhân viên nào" });
    }
  },

  // tiep
  getAllChild: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { isChildOf } = req.body;

    let obj = {};
    let arr = [];

    try {
      // let data = await User.find({isDeleted: {"!=": true},
      //   where: {isChildOf: req.body.id},
      //   select: ['name', 'id']
      // })

      let data = await User.find({
        isDeleted: { "!=": true },
        isChildOf: isChildOf,
        userRole: { in: ["SuperAdmin", "Owner"] },
      });

      let isFixer = await User.findOne({
        isDeleted: { "!=": true },
        id: isChildOf,
      });

      for (let i = 0; i < data.length; i++) {
        obj = {
          name: data[i].name,
          id: data[i].id,
          address: data[i].address,
          code: data[i].code,
        };
        arr.push(obj);
      }

      if (isFixer.userType === "Fixer") {
        let allChildOfTNSH = await User.find({
          isDeleted: { "!=": true },
          isChildOf: isFixer.isChildOf,
          userRole: { in: ["SuperAdmin", "Owner"] },
        });

        for (let i = 0; i < allChildOfTNSH.length; i++) {
          obj = {
            name: allChildOfTNSH[i].name,
            id: allChildOfTNSH[i].id,
            address: allChildOfTNSH[i].address,
          };
          arr.push(obj);
        }
      }

      if (arr) {
        return res.json({ error: false, childCompany: arr });
      } else {
        return res.json({
          error: true,
          message: "Không có công ty con, đại lý nào",
        });
      }
    } catch (err) {
      return res.json({ error: true, message: err.message });
    }
  },

  //
  getListChilds: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    let obj = {};
    let arr = [];

    try {
      // let data = await User.find({isDeleted: {"!=": true},
      //   where: {isChildOf: req.body.id},
      //   select: ['name', 'id']
      // })

      let result = await User.find({
        isDeleted: { "!=": true },
        isChildOf: req.body.isChildOf,
        userRole: { in: ["SuperAdmin", "Owner"] },
        isDeleted: false,
      });

      // for (let i = 0; i < data.length; i++) {
      //   obj = { name: data[i].name, id: data[i].id, address: data[i].address }
      //   arr.push(obj);
      // }

      // if (arr) {
      //   return res.json({ success: true, data: arr });
      // }
      // else {
      //   return res.json({ success: false, message: "Không có công ty con, đại lý nào" });
      // }
      if (result.length > 0) {
        return res.json({
          success: true,
          data: result,
          message: "Tìm thấy danh sách chi nhánh",
        });
      } else {
        return res.json({
          success: false,
          message: "Không tìm thấy chi nhánh",
        });
      }
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  },

  // Lấy 2 cấp con của target
  getSubChilds: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { isChildOf } = req.body;

    if (!isChildOf) {
      return res.badRequest(Utils.jsonErr("isChildOf is required"));
    }

    try {
      let childs = await User.find({
        isDeleted: { "!=": true },
        isChildOf: isChildOf,
        userRole: { in: ["SuperAdmin", "Owner"] },
        isDeleted: false,
      });

      if (childs.length > 0) {
        childs = await Promise.all(
          childs.map(async (_child) => {
            _child.listChild = await User.find({
              isDeleted: { "!=": true },
              isChildOf: _child.id,
              userRole: { in: ["SuperAdmin", "Owner"] },
              isDeleted: false,
            });

            return _child;
          })
        );

        return res.json({
          success: true,
          data: childs,
          message: "Tìm thấy danh sách đơn vị con",
        });
      } else {
        return res.json({
          success: false,
          data: [],
          message: "Không tìm thấy danh sách đơn vị con",
        });
      }
    } catch (err) {
      return res.json({ success: false, data: [], message: err.message });
    }
  },

  // lay avatar
  getAvatar: async function (req, res) {
    email = req.body.email;
    console.log("hehe " + email);

    if (!email) {
      res.json({
        statuscode: 400,
        message: "bạn chưa nhập email",
      });
      return;
    }
    let data = await User.find({
      isDeleted: { "!=": true },
      email: email,
    }).limit(1);
    //  let data =  await User.findOne({isDeleted: {"!=": true},email: email});
    if (data == undefined || data == null || data == "") {
      return res.json({ error: true, message: "email Không tồn tại !" });
    }
    let a = await data[0].avatar;
    console.log(a);
    if (a) {
      return res.json({ error: false, data: a });
    } else {
      return res.json({ error: true, message: "loi get avatar !" });
    }
  },
  // lay thong tin thuong hieu theo binh gas
  getBrandInformation: async function (req, res) {
    let serial = req.body.serial;
    let a = await Cylinder.find({
      isDeleted: { "!=": true },
      serial: serial,
    }).limit(1);
    let id = a[0].current;
    let b = await User.find({ isDeleted: { "!=": true }, id: id }).limit(1);
    let obj = {
      trademark: b[0].trademark,

      origin: b[0].origin,

      addressAt: b[0].addressAt,

      mass: b[0].mass,

      ingredient: b[0].ingredient,

      preservation: b[0].preservation,

      appliedStandard: b[0].appliedStandard,
    };
    if (obj != undefined || obj != null || obj != "") {
      return res.json({ err: false, data: obj });
    } else {
      return res.json({ err: true, message: "loi lay thong tin thuong hieu" });
    }
  },

  //
  getAllCompanyToFix: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id } = req.body;

    //let data = []

    try {
      let data = await User.find({
        isDeleted: { "!=": true },
        isChildOf: id,
        userType: { in: ["Factory", "Fixer"] },
        userRole: { nin: ["Deliver", "Inspector"] },
      });
      // let data_partners = await Partner.find({isDeleted: {"!=": true},host: id}).populate('guest')
      // data_partners.map( data_partner => {
      //   //let partnerInfor = await User.find({isDeleted: {"!=": true}, id: data_partner.guest.id })
      //   data.push(data_partner.guest)
      // })

      if (data) {
        return res.json({
          error: false,
          data: data,
          message: "Lấy thông tin thành công",
        });
      } else {
        return res.json({
          error: true,
          message: "Không có công ty con, đối tác nào",
        });
      }
    } catch (err) {
      return res.json({ error: true, message: err.message });
    }
  },

  //
  getDriverImport: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id, isChildOf } = req.body;

    //let data = []

    try {
      let data = await User.find({
        isDeleted: { "!=": true },
        isChildOf: id,
        userRole: "Deliver",
        staffOf: id,
      });
      let data_2 = await User.find({
        isDeleted: { "!=": true },
        isChildOf: isChildOf,
        userRole: "Deliver",
        staffOf: isChildOf,
      });
      //console.log(data);

      data = Object.assign(data, data_2);

      if (data) {
        return res.json({ error: false, data: data });
      } else {
        return res.json({ error: true, message: "không có tài xế nào" });
      }
    } catch (err) {
      return res.json({ error: true, message: err.message });
    }
  },

  // Tạo chi nhánh vùng
  createRegion: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      name,
      email,
      password,
      address,
      userType,
      userRole,
      createdBy,
      isChildOf,
      LAT,
      LNG,
      prefix,
    } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.badRequest(Utils.jsonErr("Email is required"));
    }

    if (!name) {
      return res.badRequest(Utils.jsonErr("Name is required"));
    }

    if (!prefix) {
      return res.badRequest(Utils.jsonErr("Prefix is required"));
    }

    const result = await UserManager.createUser({
      name,
      email,
      password: password ? password : "A123!@#",
      address,
      userType,
      userRole,
      createdBy,
      isChildOf,
      LAT,
      LNG,
      prefix,
    });

    if (!result.success) {
      return res.badRequest({ message: result.err });
    }

    // if (arr_createdAgency.length === listAgency.length) {
    //   return res.json({ success: true, data: { customer: result.data, agency: arr_createdAgency }, message: "Tạo trạm thành công" });
    // }

    // if (arr_errAgency.length > 0) {
    //   return res.json({ success: false, data: { customer: result.data, agency: arr_createdAgency, err_agency: arr_errAgency }, message: "Có lỗi khi tạo trạm" });
    // }

    res.created(result.data);
  },

  // Lấy danh sách vùng
  getListRegion: async function (req, res) {
    if (!req.query) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id } = req.query;

    if (!id) {
      return res.badRequest(Utils.jsonErr("ID is required"));
    }
    try {
      const result = await User.find({
        isDeleted: { "!=": true },
        isChildOf: id,
        userType: { in: ["Region", "Fixer"] },
        userRole: "SuperAdmin",
        isDeleted: false,
      });

      if (result.length > 0) {
        return res.json({
          success: true,
          data: result,
          message: "Tìm thấy danh sách chi nhánh",
        });
      } else {
        return res.json({
          success: false,
          message: "Không tìm thấy chi nhánh",
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: "Gặp lỗi khi tìm kiếm danh sách chi nhánh",
      });
    }
  },

  // Tạo trạm
  createStation: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      name,
      email,
      password,
      address,
      userType,
      userRole,
      createdBy,
      isChildOf,
      owner,
      stationType,
      LAT,
      LNG,
      prefix,
    } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.badRequest(Utils.jsonErr("Email is required"));
    }

    if (!name) {
      return res.badRequest(Utils.jsonErr("Name is required"));
    }

    if (!prefix) {
      return res.badRequest(Utils.jsonErr("Prefix is required"));
    }

    const result = await UserManager.createUser({
      name,
      email,
      password: password ? password : "A123!@#",
      address,
      userType,
      userRole,
      createdBy,
      isChildOf,
      owner,
      stationType,
      LAT,
      LNG,
      prefix,
    });

    if (!result.success) {
      return res.badRequest({ message: result.err });
    }

    // if (arr_createdAgency.length === listAgency.length) {
    //   return res.json({ success: true, data: { customer: result.data, agency: arr_createdAgency }, message: "Tạo trạm thành công" });
    // }

    // if (arr_errAgency.length > 0) {
    //   return res.json({ success: false, data: { customer: result.data, agency: arr_createdAgency, err_agency: arr_errAgency }, message: "Có lỗi khi tạo trạm" });
    // }

    res.created(result.data);
  },

  // Lấy danh sách trạm
  getListStation: async function (req, res) {
    if (!req.query) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id } = req.query;

    const { stationType } = req.query;

    if (!id) {
      return res.badRequest(Utils.jsonErr("ID is required"));
    }

    try {
      let result = [];

      const type = ["Own", "Rent"];
      if (!type.includes(stationType)) {
        result = await User.find({
          isDeleted: { "!=": true },
          isChildOf: id,
          // owner: id,
          userType: "Factory",
          userRole: "Owner",
          isDeleted: false,
        });
      } else {
        result = await User.find({
          isDeleted: { "!=": true },
          isChildOf: id,
          // owner: id,
          stationType,
          userType: "Factory",
          userRole: "Owner",
          isDeleted: false,
        });
      }

      if (result.length > 0) {
        return res.json({
          success: true,
          data: result,
          message: "Tìm thấy danh sách trạm",
        });
      } else {
        return res.json({ success: false, message: "Không tìm thấy trạm" });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: "Gặp lỗi khi tìm kiếm danh sách trạm",
      });
    }
  },

  // Lấy danh sách Đại lý
  getListGeneral: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id } = req.query;

    if (!id) {
      return res.badRequest(Utils.jsonErr("ID is required"));
    }

    try {
      let result = [];

      result = await User.find({
        isDeleted: { "!=": true },
        isChildOf: id,
        userType: "General",
        userRole: "SuperAdmin",
        // isDeleted: false,
      });

      if (result.length > 0) {
        return res.json({
          success: true,
          data: result,
          message: "Tìm thấy danh sách đại lý",
        });
      } else {
        return res.json({
          success: false,
          message: "Không tìm thấy đại lý nào",
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: "Gặp lỗi khi tìm kiếm danh sách đại lý",
      });
    }
  },

  // Lấy danh sách cửa hàng bán lẻ
  getListAgency: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id } = req.query;

    if (!id) {
      return res.badRequest(Utils.jsonErr("ID is required"));
    }

    try {
      let result = [];

      result = await User.find({
        isDeleted: { "!=": true },
        isChildOf: id,
        userType: "Agency",
        userRole: "SuperAdmin",
        // isDeleted: false,
      });

      if (result.length > 0) {
        return res.json({
          success: true,
          data: result,
          message: "Tìm thấy danh sách CHBL",
        });
      } else {
        return res.json({ success: false, message: "Không tìm thấy CHBL nào" });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: "Gặp lỗi khi tìm kiếm danh sách CHBL",
      });
    }
  },

  // Lấy danh sách toàn bộ user trong hệ thống theo loại
  getListUserByTpe: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id, userType } = req.query;

    if (!id) {
      return res.badRequest(Utils.jsonErr("ID is required"));
    }

    if (!userType) {
      return res.badRequest(Utils.jsonErr("userType is required"));
    }

    try {
      let result = [];
      const parentRoot = await getRootParent(id);

      if (parentRoot) {
        // // Tìm danh sách loại user trong hệ thống của công ty mẹ
        // result = await getUserByType(parentRoot, userType)

        result = await User.find({
          isDeleted: { "!=": true },
          organization: parentRoot,
          userType: userType,
          userRole: "SuperAdmin",
        });
      }

      if (result.length > 0) {
        return res.json({ success: true, data: result, message: "Tìm thấy" });
      } else {
        return res.json({ success: false, message: "Không tìm thấy" });
      }
    } catch (err) {
      return res.json({ success: false, message: "Gặp lỗi khi tìm kiếm" });
    }
  },

  // Lấy danh sách toàn bộ user trong hệ thống
  getAllUserOfParent: async function (req, res) {
    // if (Object.keys(req.query).length === 0) {
    //   return res.badRequest(Utils.jsonErr('Empty body'));
    // }

    // const {
    //   id,
    // } = req.query

    // if (!id) {
    //   return res.badRequest(Utils.jsonErr('ID is required'));
    // }

    // if (!userType) {
    //   return res.badRequest(Utils.jsonErr('userType is required'));
    // }

    const user = req.userInfo;

    try {
      let result = [];
      const parentRoot = await getRootParent(user.id);

      if (parentRoot) {
        // Tìm danh sách user trong hệ thống của công ty mẹ
        result = await _getAllUserOfParent(parentRoot);
      }

      if (result.length > 0) {
        return res.json({ success: true, data: result, message: "Tìm thấy" });
      } else {
        return res.json({ success: false, message: "Không tìm thấy" });
      }
    } catch (err) {
      return res.json({ success: false, message: "Gặp lỗi khi tìm kiếm" });
    }
  },
  getUserCustomer: async function (req, res) {
    try {
      const AllUser = await User.find({
        isDeleted: { "!=": true },
        or: [{ userType: "Khach_hang" }, { userRole: "Tong_dai_ly" }],
        isDeleted: false,
      });
      if (AllUser.length === 0) {
        return res.json({ success: false, message: "Không tìm thấy" });
      } else {
        return res.json({
          success: true,
          data: AllUser,
          message: "Đã tìm thấy",
        });
      }
    } catch (error) {
      return res.serverError(error);
    }
  },

  // Lấy toàn bộ nhà máy và trạm trong hệ thống
  getFixerAndStation: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const {
      id,
      // userType,
    } = req.query;

    if (!id) {
      return res.badRequest(Utils.jsonErr("ID is required"));
    }

    // if (!userType) {
    //   return res.badRequest(Utils.jsonErr('userType is required'));
    // }

    try {
      let result = [];
      const parentRoot = await getRootParent(id);

      if (parentRoot) {
        // // Tìm danh sách nhà máy sửa chữa trong hệ thống của công ty mẹ
        // resultFixer = await getUserByType2(parentRoot, 'Fixer')

        // // Tìm danh sách trạm trong hệ thống của công ty mẹ
        // resultStation = await getUserByType2(parentRoot, 'Factory')

        // result = [...resultFixer, ...resultStation]

        result = await User.find({
          isDeleted: { "!=": true },
          organization: parentRoot,
          userType: { in: ["Fixer", "Factory"] },
          userRole: { in: ["SuperAdmin", "Owner"] },
        });
      }

      if (result.length > 0) {
        return res.json({ success: true, data: result, message: "Tìm thấy" });
      } else {
        return res.json({ success: false, message: "Không tìm thấy" });
      }
    } catch (err) {
      return res.json({ success: false, message: "Gặp lỗi khi tìm kiếm" });
    }
  },

  // Lấy toàn bộ trạm thuộc hệ thống công ty mẹ
  getAllStation: async function (req, res) {
    const userId = req.userInfo.id;

    try {
      const parentRoot = await getRootParent(userId);

      const result = await User.find({
        isDeleted: { "!=": true },
        organization: parentRoot,
        userType: "Factory",
        userRole: "Owner",
        isDeleted: false,
      });

      return res.json({ success: true, data: result, message: "Tìm thấy" });
    } catch (error) {
      return res.json({
        success: false,
        data: [],
        message: "Gặp lỗi khi tìm kiếm",
      });
    }
  },

  // Lấy danh sách theo loại
  getChildByType: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id, userType } = req.query;

    if (!id) {
      return res.badRequest(Utils.jsonErr("ID is required"));
    }

    if (!userType) {
      return res.badRequest(Utils.jsonErr("userType is required"));
    }

    const USER_TYPE = ["General", "Agency"];
    if (!USER_TYPE.includes(userType)) {
      return res.badRequest(Utils.jsonErr("userType is wrong"));
    }

    try {
      let result = [];

      result = await User.find({
        isDeleted: { "!=": true },
        isChildOf: id,
        userType: userType,
        userRole: "SuperAdmin",
      });

      return res.json({ success: true, data: result, message: "Tìm thấy" });
    } catch (err) {
      return res.json({
        success: false,
        data: [],
        message: "Gặp lỗi khi tìm kiếm",
      });
    }
  },

  //  cap nhat thong tin doi tac
  // updateInformationUser: async function(req, res){
  //     var {email, name, address,avatar} = req.body;
  //     if(!email){
  //       res.json({
  //         statuscode: 400,
  //         message: "bạn chưa nhập email"
  //       });
  //       return;
  //     }
  //     let data = await User.findOne({isDeleted: {"!=": true},email: email});
  //     if(data == undefined || data == "" || data == null){
  //       return res.json({error: true, message: 'email Không tồn tại !'});
  //     }
  //     if(!name){
  //       name = data.name;
  //     }
  //     if(!address){
  //       address = data.address;
  //     }
  //     if(!avatar){
  //       avatar = data.avatar;
  //     }

  //     let a = await User.updateOne({isDeleted: {"!=": true},email: email}).set({name: name, address: address, avatar: avatar});
  //     if(a){
  //       return res.json({error: false, data: a});
  //     }
  //     else{
  //         return res.json({error: true, message: 'loi update !'});
  //     }
  //   },
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

async function getUserByType(id, userType) {
  let returnData = [];
  const users = await User.find({
    isDeleted: { "!=": true },
    isChildOf: id,
    userType: userType,
    userRole: "SuperAdmin",
  });
  if (users.length > 0) {
    returnData = returnData.concat(users);
  }

  const childs = await User.find({ isDeleted: { "!=": true }, isChildOf: id });
  if (childs.length > 0) {
    const _user = await Promise.all(
      childs.map(async (child) => {
        return await getUserByType(child.id, userType);
      })
    );
    returnData = returnData.concat(..._user);
  }

  return returnData;
}

async function getUserByType2(id, userType) {
  let returnData = [];
  const users = await User.find({
    isDeleted: { "!=": true },
    isChildOf: id,
    // userType: userType,
    userRole: { in: ["SuperAdmin", "Owner"] },
  });

  if (users.length > 0) {
    // Lọc những bình có userType cần tìm
    const found = users.filter((user) => user.userType === userType);

    if (found.length > 0) returnData = returnData.concat(found);
  }

  const childs = await User.find({ isDeleted: { "!=": true }, isChildOf: id });
  if (childs.length > 0) {
    const _user = await Promise.all(
      childs.map(async (child) => {
        return await getUserByType2(child.id, userType);
      })
    );
    returnData = returnData.concat(..._user);
  }

  return returnData;
}

async function _getAllUserOfParent(id) {
  let returnData = [];
  const users = await User.find({
    isDeleted: { "!=": true },
    isChildOf: id,
    userRole: { in: ["SuperAdmin", "Owner"] },
  });
  if (users.length > 0) {
    returnData = returnData.concat(users);
  }

  const childs = await User.find({ isDeleted: { "!=": true }, isChildOf: id });
  if (childs.length > 0) {
    const _user = await Promise.all(
      childs.map(async (child) => {
        return await _getAllUserOfParent(child.id);
      })
    );
    returnData = returnData.concat(..._user);
  }

  return returnData;
}
