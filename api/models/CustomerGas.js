module.exports = {
  attributes: {
    name: {
      type: "string",
      //required: true
    },
    branchname: {
      type: "string",
    },

    contactname: {
      type: "string",
    },

    address: {
      type: "string",
      required: true,
    },

    phone: {
      type: "string",
      // required: true,
      // unique: true
    },

    taxcode: {
      type: "number",
      // required: true
    },
    email: {
      type: "string",
    },

    code: {
      type: "string",
      required: true,
    },
    userID: {
      model: "User",
    },
    note: {
      type: "string",
      // required: true
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

    LAT: {
      type: "number",
    },

    LNG: {
      type: "number",
    },
  },
};
