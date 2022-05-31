module.exports = {
  attributes: {
    request: {
      model: "reqimport",
    },

    serial: {
      type: "string",
    },

    // img_url: {
    //   type: 'string'
    // },

    color: {
      type: "string",
    },

    valve: {
      type: "string",
    },

    checkedDate: {
      type: "string",
    },

    weight: {
      type: "number",
    },

    // currentImportPrice: {
    //   type: 'string'
    // },

    manufacture: {
      type: "string",
    },

    classification: {
      type: "string",
    },

    //

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
