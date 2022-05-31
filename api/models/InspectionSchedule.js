/**
 * Checklist.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    tittle: {
      type: "string",
    },

    idCheckingAt: {
      model: "user",
    },

    idStaff: {
      type: "string",
    },

    idInspector: {
      model: "user",
    },

    location: {
      type: "string",
    },

    maintenanceType: {
      type: "string",
    },

    maintenanceDate: {
      type: "string",
      columnType: "datetime",
    },

    // //
    // checklist: {
    //     model: 'checklist',
    //     unique: true
    // },

    createdAt: {
      type: "string",
      columnType: "datetime",
      autoCreatedAt: true,
    },

    createdBy: {
      model: "user",
    },

    updateBy: {
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
