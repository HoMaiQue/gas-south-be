/**
 * ShippingGS.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    orderID: {
      model: "ordergs",
    },
    deliveryAddress: {
      type: "string",
      required: true,
    },
    deliveryDate: {
      type: "string",
      columnType: "datetime",
      required: true,
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
