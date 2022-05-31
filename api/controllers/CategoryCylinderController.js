/**
 * CategoryCylinderController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const USER_TYPE = require("../constants/UserTypes");
const USER_ROLE = require("../constants/UserRoles");

module.exports = {
  delete: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.json({
        success: false,
        message: "Vui lòng nhập dữ liệu",
      });
    }
    if (!req.query.userid) {
      console.log("Empty req.query.userid");
      return res.badRequest(Utils.jsonErr("Empty userid"));
    }

    const { id } = req.query;

    try {
      const categoryCylinder = await CategoryCylinder.updateOne({
        isDeleted: { "!=": true },
        id,
      }).set({
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: req.query.userid,
      });

      if (!categoryCylinder) {
        return res.json({
          success: false,
          message: "Không tìm thấy bình để xóa",
        });
      }

      return res.json({ success: true, message: "Xóa thành công." });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Cập nhật
  update: async function (req, res) {
    if (!req.query) {
      return res.json({
        success: false,
        message: "Vui lòng nhập dữ liệu",
      });
    }

    const { id } = req.query;
    const { name, code, mass } = req.body;

    if (!id) {
      return res.json({
        success: false,
        message: "Vui lòng nhập id",
      });
    }
    // if (!name) {
    //     return res.badRequest(Utils.jsonErr('name is required'));
    // }

    dataUpdate = {};
    if (name) dataUpdate.name = name;
    if (code) dataUpdate.code = code;
    if (mass) dataUpdate.mass = mass;

    const foundCylinder = await CategoryCylinder.findOne({
      isDeleted: { "!=": true },
      _id: id,
    });
    if (!foundCylinder) {
      return res.json({
        status: false,
        resCode: "ERROR-00107",
        data: {},
        message: "Không tìm thấy loại bình cần cập nhật",
      });
    }
    try {
      const result = await CategoryCylinder.updateOne({
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
      return res.json({ success: false, message: error.message });
    }
  },
  getAll: async function (req, res) {
    try {
      const cateCy = await CategoryCylinder.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      });

      return res.json({
        success: true,
        data: cateCy,
        message: "Lấy danh sách loại bình thành công",
      });
    } catch (error) {
      return res.json({
        success: false,
        data: {},
        message: "Gặp lỗi khi lấy danh sách loại bình",
      });
    }
  },
  create: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { code, name, userId, mass } = req.body;

    if (!code) {
      return res.badRequest(Utils.jsonErr("Code is required"));
    }

    if (!name) {
      return res.badRequest(Utils.jsonErr("Name is required"));
    }

    if (!mass) {
      return res.badRequest(Utils.jsonErr("Mass is required"));
    }

    if (!userId) {
      return res.badRequest(Utils.jsonErr("UserId is required"));
    }

    // if (typeof weight !== 'number') {
    //     return res.badRequest(Utils.jsonErr('Weight phải là kiểu number'));
    // }

    try {
      const userInfor = await User.findOne({
        isDeleted: { "!=": true },
        id: userId,
      });
      if (!userInfor) {
        return res.json({
          status: false,
          resCode: "ERROR-00001",
          data: {},
          message: "Không tìm thấy thông tin người dùng trong hệ thống",
        });
      }

      const isExistCategory = await CategoryCylinder.findOne({
        isDeleted: { "!=": true },
        code: code,
        createdBy: userInfor.id,
        isDeleted: false,
      });
      if (isExistCategory) {
        return res.json({
          status: false,
          resCode: "ERROR-00002",
          data: {},
          message: "Trùng mã loại bình",
        });
      }

      const categoryCylinder = await CategoryCylinder.create({
        code: code,
        name: name,
        mass: mass,
        createdBy: userInfor.id,
      }).fetch();

      if (!categoryCylinder) {
        return res.json({
          status: false,
          resCode: "ERROR-00003",
          data: {},
          message: "Tạo loại bình mới thất bại",
        });
      } else {
        return res.json({
          status: true,
          resCode: "SUCCESS-00001",
          data: categoryCylinder,
          message: "Tạo danh mục bình mới thành công",
        });
      }
    } catch (error) {
      return res.json({
        status: false,
        resCode: "CATCH-00001",
        data: {
          error: error.message,
        },
        message: "Gặp lỗi khi tạo danh mục loại bình",
      });
    }
  },

  list: async function (req, res) {
    const { id } = req.query;

    if (!id) {
      return res.badRequest(Utils.jsonErr("Id is required"));
    }

    try {
      const parent = await getRootParent(id);

      const categoryCylinder = await CategoryCylinder.find({
        isDeleted: { "!=": true },
        createdBy: parent,
        isDeleted: false,
      });
      return res.ok({
        status: true,
        resCode: "SUCCESS-00002",
        data: categoryCylinder,
        message: "Lấy danh mục loại bình thành công",
      });
    } catch (error) {
      return res.badRequest({
        status: false,
        resCode: "CATCH-00002",
        data: {
          error: error.message,
        },
        message: "Gặp lỗi khi lấy danh mục loại bình",
      });
    }
  },

  // Lấy danh sách loại bình
  // Cho in đồng bộ với GEO
  listCategories: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { email } = req.query;

    if (!email) return res.badRequest(Utils.jsonErr("Missing email"));

    try {
      const userInfo = await User.findOne({
        isDeleted: { "!=": true },
        email: email,
      });
      if (!userInfo) {
        return res.badRequest(Utils.jsonErr("User not found"));
      }

      const parent = await getRootParent(userInfo.id);

      const categoryCylinder = await CategoryCylinder.find({
        isDeleted: { "!=": true },
        createdBy: parent,
        isDeleted: false,
      });

      if (categoryCylinder.length > 0) {
        let returnData = [];
        categoryCylinder.forEach((category) => {
          returnData.push({
            id: category.id,
            code: category.code,
            name: category.name,
          });
        });

        return res.json({
          status: true,
          data: returnData,
          message: "Tìm thấy danh sách loại bình",
        });
      } else {
        return res.json({
          status: false,
          data: [],
          message: "Không tìm thấy loại bình nào",
        });
      }
    } catch (error) {
      return res.json({
        status: false,
        data: [],
        message: "Gặp lỗi khi lấy danh mục loại bình",
      });
    }
  },
};

// *************** Function to get root Parent of user tree
async function getRootParent(parentId) {
  try {
    if (
      parentId === null ||
      typeof parentId === "undefined" ||
      parentId === ""
    ) {
      return "";
    }
    let parent = await User.findOne({
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
  } catch (error) {
    console.log(error.message);
  }
}
