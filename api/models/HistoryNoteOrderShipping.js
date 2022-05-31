/**
 * HistoryNoteOrderShipping.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    historyNoteOrder: {
      model: "ordershipping",
    },

    note: {
      type: "string",
    },

    user: {
      model: "user",
    },

    status: {
      type: "string",
      isIn: [
        "INIT",
        "CONFIRMED",
        "PROCESSING",
        "DELIVERING",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "ERROR",
        "REQUEST",
        "REMOVE",
      ],
    },

    deletedAt: {
      type: "string",
      columnType: "datetime",
    },

    createdAt: {
      type: "string",
      columnType: "datetime",
      autoCreatedAt: true,
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
