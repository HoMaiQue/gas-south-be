module.exports = {
  attributes: {
    name: {
      type: "string",
      unique: true,
      required: true,
    },

    icon: {
      type: "string",
    },

    controllerName: {
      type: "string",
    },

    actionName: {
      type: "string",
    },

    url: {
      type: "string",
    },

    status: {
      type: "number",
      isIn: [0, 1],
    },

    orderNo: {
      type: "number",
    },

    parentId: {
      model: "systempage",
    },

    level: {
      type: "number",
      isIn: [0, 1, 2],
      defaultsTo: 0,
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

    isDeleted: {
      type: "boolean",
      defaultsTo: false,
    },
    deletedBy: {
      model: "user",
    },
  },
};
