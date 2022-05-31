module.exports = {
  attributes: {
    idCompany: {
      model: "manufacture",
    },
    serialCylinder: {
      type: "string",
      //required: true
    },
    idCylinder: {
      model: "cylinder",
    },
    dateReceived: {
      type: "string",
      required: true,
    },

    weight: {
      type: "number",
      //required: true
    },

    //
    isDeleted: {
      type: "boolean",
      defaultsTo: false,
    },

    createdBy: {
      model: "user",
    },

    updatedBy: {
      model: "user",
    },

    deletedBy: {
      model: "user",
    },
    deletedBy: {
      model: "user",
    },
  },
};
