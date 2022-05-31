/**
 * Log.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    type: {
      type: "string",
      required: true,
    },

    inputData: {
      type: "string",
      // type: 'json',
    },

    // errorData: {
    //   type: 'string',
    // },

    cylinders: {
      type: "json",
      columnType: "array",
    },

    cylindersBody: {
      type: "json",
      columnType: "array",
    },

    notDupAndCantExportBody: {
      type: "json",
      columnType: "array",
    },

    notDupAndCantImportBody: {
      type: "json",
      columnType: "array",
    },

    content: {
      type: "string",
      required: true,
    },

    historyType: {
      type: "string",
    },

    history: {
      model: "history",
    },

    status: {
      type: "boolean",
      required: true,
    },

    createdAt: {
      type: "string",
      columnType: "datetime",
      autoCreatedAt: true,
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

    deletedAt: {
      type: "string",
      columnType: "datetime",
    },
  },
};
