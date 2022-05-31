module.exports = {
  attributes: {
    license_plate: {
      type: "string",
    },

    load_capacity: {
      type: "string",
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
