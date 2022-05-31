/**
 * ExportPlace.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    address: {
      type: "string",
      required: true,
    },

    name: {
      type: "string",
      required: true,
    },

    createdAt: {
      type: "string",
      columnType: "datetime",
      autoCreatedAt: true,
    },

    updatedAt: {
      type: "string",
      columnType: "datetime",
      autoUpdatedAt: true,
    },
    createBy: {
      model: "user",
    },
    updateBy: {
      model: "user",
    },
    owner: {
      model: "user",
    },
    isDeleted: {
      type: "boolean",
      defaultsTo: false,
    },
    deletedBy: {
      model: "user",
    },
    
    deletedAt: {
      type: "string",
      columnType: "datetime",
    },
  },
};
