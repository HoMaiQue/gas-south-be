/**
 * OrderDetail.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    orderGSId: {
      model: "ordergs",
      required: true,
    },
    manufacture: {
      model: "manufacture",
      required: true,
    },
    categoryCylinder: {
      model: "categorycylinder",
      required: true,
    },
    colorGas: {
      model: "colorgas",
      required: true,
    },
    valve: {
      model: "valve",
      required: true,
    },
    quantity: {
      type: "number",
      defaultsTo: 0,
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
