/**
 * Manufacture.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    name: {
      type: "string",
      required: true,
    },

    code: {
      type: "string",
      // isIn: ['DK', 'DG', 'VT', 'AG', 'PV', 'DP', 'JP'],
      // defaultsTo: 'VT'
    },

    logo: {
      type: "string",
      required: true,
    },

    address: {
      type: "string",
    },

    owner: {
      model: "user",
    },

    phone: {
      type: "string",
    },

    cylinders: {
      collection: "cylinder",
      via: "manufacture",
    },

    createdAt: {
      type: "string",
      columnType: "datetime",
      autoCreatedAt: true,
    },

    updatedAt: {
      type: "string",
      columnType: "datetime",
      // autoUpdatedAt: true
    },

    deletedAt: {
      type: "string",
      columnType: "datetime",
      // defaultsTo: new Date().toString()
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

    // createBy: {
    //   model: 'user'
    // },
    // updateBy: {
    //     model: 'user'
    // },
    origin: {
      //xuất sứ
      type: "string",
    },
    mass: {
      //khối lượng bao bì
      type: "string",
    },

    ingredient: {
      //thành phần
      type: "string",
    },

    preservation: {
      // hướng dẫn bảo quản
      type: "string",
    },

    appliedStandard: {
      // tiêu chuẩn áp dụng
      type: "string",
    },

    optionSafetyInstructions: {
      type: "string",
    },

    safetyInstructions: {
      type: "string",
    },
  },
};
