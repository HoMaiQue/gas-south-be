module.exports = {
  attributes: {
    name: {
      type: "string",
    },
    pageId: {
      model: "SystemPage",
    },
    url: {
      type: "string",
    },
    clas: {
      type: "string",
    },
    orderNo: {
      type: "number",
    },
    isVisible: {
      type: "boolean",
      defaultsTo: true,
    },
    parentId: {
      type: "string",
    },
    isDashBoard: {
      type: "boolean",
      defaultsTo: false,
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
