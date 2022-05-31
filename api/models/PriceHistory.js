/**
 * PriceHistory.js
 *
 * @description :: PriceHistory model
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    cylinders: {
      model: "cylinder",
    },

    user: {
      model: "user",
    },

    price: {
      type: "number",
    },

    createdAt: {
      type: "string",
      columnType: "datetime",
    },

    updatedAt: {
      type: "string",
      columnType: "datetime",
      autoCreatedAt: true,
    },

    deletedAt: {
      type: "string",
      columnType: "datetime",
    },
    createBy: {
      model: "user",
    },
    updateBy: {
      model: "user",
    },
    isDeleted: {
      type: "boolean",
      defaultsTo: false,
    },
  },
};
