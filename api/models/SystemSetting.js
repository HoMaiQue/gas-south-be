module.exports = {
  attributes: {
    Key: {
      type: "string",
    },
    Code: {
      type: "string",
    },
    Value: {
      type: "string",
    },
    Node: {
      type: "string",
    },
    IsLocked: {
      type: "boolean",
      defaultsTo: false,
    },
    UserId: {
      model: "user",
    },
    isDeleted: {
      type: "boolean",
      defaultsTo: false,
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
    deletedBy: {
      model: "user",
    },
  },
};
