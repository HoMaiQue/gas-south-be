module.exports = {
  attributes: {
    id_ReqFrom: {
      model: "user",
    },

    codeReq: {
      type: "string",
      unique: true,
    },

    detail_Req: {
      collection: "detailreqimport",
      via: "request",
    },

    id_ReqTo: {
      model: "user",
    },

    status_Req: {
      type: "string",
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

    createdBy: {
      model: "user",
    },

    updatedBy: {
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
