const { model } = require("mongoose");

module.exports = {
  attributes: {
    historyNoteOrder: {
      model: "Ordertank",
    },
    note: {
      type: "string",
    },
    user: {
      model: "user",
    },
    status: {
      type: "string",
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
