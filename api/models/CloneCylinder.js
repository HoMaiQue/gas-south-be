/**
 * CloneCylinder.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    serial: {
      type: "string",
      required: true,
    },
    color: {
      model: "colorgas",
    },
    manufacture: {
      model: "manufacture",
    },
    category: {
      model: "categorycylinder",
    },
    valve: {
      model: "valve",
    },
    isGS: {
      type: "boolean",
      defaultsTo: true,
    },
    // Add a reference to Users
    // users: {
    //   collection: "user",
    //   via: "colorgas",
    // },

    isDeleted: {
      type: "boolean",
      defaultsTo: false,
    },

    // ---
    createdBy: {
      model: "user",
    },

    updatedBy: {
      model: "user",
    },

    deletedBy: {
      model: "user",
    },

    createdAt: {
      type: "string",
      columnType: "datetime",
      autoCreatedAt: true,
    },

    updatedAt: {
      type: "string",
      columnType: "datetime",
      autoUpdatedAt: true,
    },

    deletedAt: {
      type: "string",
      columnType: "datetime",
    },
  },
};
