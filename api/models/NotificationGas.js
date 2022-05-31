/**
 * NotificationGas.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    title: {
      type: "string",
      required: true,
    },

    data: {
      type: "string",
      required: true,
    },

    iddata: {
      type: "string",
    },

    device: {
      type: "string",
    },

    appname: {
      type: "string",
      required: true,
    },

    type: {
      type: "string",
      isIn: ["KM", "CH"],
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
