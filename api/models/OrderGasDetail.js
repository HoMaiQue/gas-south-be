/**
 * OrderGasDetail.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    orderGasId: {
      model: "ordergas",
    },

    cylinder: {
      model: "cylindergas",
    },

    quantity: {
      type: "string",
    },

    price: {
      type: "number",
    },

    serial: {
      type: "string",
    },

    img_url: {
      type: "string",
    },

    // ---
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
  },
};
