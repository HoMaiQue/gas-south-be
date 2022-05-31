/**
 * CloneCylinder.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const orderGSHistory = require("./orderGSHistory");

module.exports = {
  attributes: {
    cylinder: {
      model: "clonecylinder",
    },
    name: {
      type: "string",
    },
    status: {
      type: "string",
      isIn: ["BINH", "VO", "BINH_DAY"],
      defaultsTo: "BINH",
    },
    isShip: {
      type: "boolean",
      defaultsTo: false,
    },
    isShipOf: {
      model: "ordergshistory",
    },
    mass: {
      type: "number",
    },
    orderID: {
      model: "ordergs",
    },
    isGasSouth: {
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
