/**
 * Report.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    user: {
      model: "user",
    },

    cylinder: {
      model: "cylinder",
    },

    description: {
      type: "string",
      required: true,
    },

    createdAt: {
      type: "string",
      columnType: "datetime",
    },

    updatedAt: {
      type: "string",
      columnType: "datetime",
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
    deletedBy: {
      model: "user",
    },
  },
};
