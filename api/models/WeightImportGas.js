/**
 * WeightImportGas.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    serialCylinder: {
      type: "string",
      //required: true
    },
    idCylinder: {
      model: "cylinder",
    },
    weightImport: {
      type: "number",
      //required: true
    },
    createdBy: {
      model: "user",
    },
    driver: {
      type: "string",
    },

    createdAt: {
      type: "string",
      columnType: "datetime",
      autoCreatedAt: true,
    },

    updatedBy: {
      model: "user",
    },

    historyImport: {
      model: "history",
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
