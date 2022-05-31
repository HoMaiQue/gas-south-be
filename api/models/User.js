/**
 * User.js
 *
 * @description :: User model
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const bcrypt = require("bcrypt");

function generatePasswordHash(password) {
  return bcrypt
    .genSalt(10) // 10 is default
    .then((salt) => {
      return bcrypt.hash(password, salt);
    })
    .then((hash) => {
      return Promise.resolve(hash);
    });
}

module.exports = {
  attributes: {
    email: {
      type: "string",
      required: true,
      unique: true,
    },

    avatar: {
      type: "string",
    },

    name: {
      type: "string",
      required: true,
    },

    phone: {
      type: "string",
    },

    shortName: {
      type: "string",
    },

    address: {
      type: "string",
      // required: true
    },

    code: {
      type: "string",
    },

    role: {
      type: "string",
      defaultsTo: "user",
    },

    locked: {
      type: "boolean",
      defaultsTo: false,
    },

    passwordFailures: {
      type: "number",
      defaultsTo: 0,
    },

    lastPasswordFailure: {
      type: "string",
      columnType: "datetime",
    },

    allowReport: {
      type: "boolean",
      defaultsTo: true,
    },

    resetToken: {
      type: "string",
    },

    factory_cylinders: {
      collection: "cylinder",
      via: "factory",
    },

    general_cylinders: {
      collection: "cylinder",
      via: "general",
    },

    agency_cylinders: {
      collection: "cylinder",
      via: "agency",
    },

    organization: {
      model: "user",
    },

    userType: {
      type: "string",
      isIn: [
        "SuperAdmin",
        "Government",
        "Factory",
        "Region",
        "Station",
        "Fixer",
        "General",
        "Agency",
        "Normal",
        "Manager",
        "Accounting",
        "Sales",
        "Warehouse",
        "Tram",
        "Tong_cong_ty",
        "Khach_hang",
      ],
      defaultsTo: "Normal",
    },

    userRole: {
      type: "string",
      isIn: [
        "SuperAdmin",
        "Owner",
        "Staff",
        "Deliver",
        "Inspector",
        "Giam_doc",
        "Pho_giam_doc",
        "Thu_ky",
        "Truong_phongKD",
        "Pho_giam_docKD",
        "Dieu_do_tram",
        "Truong_tram",
        "Ke_toan",
        "Nhan_vien",
        "To_nhan_lenh",
        "Tong_dai_ly",
        "Cua_hang_thuoc_tram",
        "Cong_ty",
      ],
      defaultsTo: "SuperAdmin",
    },

    isChildOf: {
      model: "user",
    },

    owner: {
      model: "user",
    },
    OfStation: {
      model: "user",
    },
    stationType: {
      type: "string",
      isIn: ["Own", "Rent"],
      defaultsTo: "Own",
    },

    staffs: {
      collection: "user",
    },

    relations: {
      collection: "user",
    },

    importPrice: {
      type: "number",
      defaultsTo: 0,
    },

    salePrice: {
      type: "number",
      defaultsTo: 0,
    },

    histories: {
      collection: "history",
      via: "toArray",
    },

    // Add a reference to Area
    area: {
      model: "area",
    },

    createdAt: {
      type: "string",
      columnType: "datetime",
      autoCreatedAt: true,
    },

    updatedAt: {
      type: "string",
      columnType: "datetime",
    },

    deletedAt: {
      type: "string",
      columnType: "datetime",
    },

    createdBy: {
      model: "user",
    },

    updatedBy: {
      model: "user",
    },

    deletedBy: {
      model: "user",
    },

    isDeleted: {
      type: "boolean",
      defaultsTo: false,
    },

    updateBrandBy: {
      model: "user",
    },
    LAT: {
      type: "number",
    },
    LNG: {
      type: "number",
    },
    customerCode: {
      type: "string",
      //required: true
    },

    staffOf: {
      type: "string",
    },

    encryptedPassword: {
      type: "string",
    },

    playerID: {
      type: "string",
    },

    carrier: {
      collection: "carrier",
      via: "userId",
    },
    customer: {
      collection: "ordergs",
      via: "customers",
    },
    prefix: {
      type: "string",
    },

    customerType: {
      type: "string",
      isIn: ["Industry"],
    },

    // thông tin nhãn hàng
    // trademark: { //thương hiệu
    //   type: 'string'
    // },

    // origin: { //xuất sứ
    //   type: 'string'
    // },

    // addressAt: { // đóng bình tại
    //   type: 'string'
    // },

    // mass: { //khối lượng bao bì
    //   type: 'string'
    // },

    // ingredient: { //thành phần
    //   type: 'string'
    // },

    // preservation: { // hướng dẫn bảo quản
    //   type: 'string'
    // },

    // appliedStandard: { // tiêu chuẩn áp dụng
    //   type: 'string'
    // }
  },

  // customToJSON: function () {
  // const obj = this.toObject();

  // return _.omit(this, ['id', 'email']);
  // return {
  //     id: obj.id,
  //     email: obj.email
  // };
  // },

  /**
   * Validates user password with stored password hash
   * @param password
   * @returns {Promise}
   */
  validatePassword: function (password) {
    return bcrypt.compare(password, this.toObject().encryptedPassword);
  },

  /**
   * Set user password
   * @param password
   * @returns {Promise}
   */
  setPassword: function (user, password) {
    return generatePasswordHash(password).then((hash) => {
      user.encryptedPassword = hash;
      return user;
    });
    //return user;
  },

  /**
   * Encrypt password before creating a User
   * @param values
   * @param next
   */
  beforeCreate: function (values, next) {
    generatePasswordHash(values.password)
      .then((hash) => {
        delete values.password;
        values.encryptedPassword = hash;
        next();
      })
      .catch((err) => {
        /* istanbul ignore next */
        next(err);
      });
  },
};
