/**
 * orderGSHistory.js
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
    driver: {
      model: "user",
    },
    transport: {
      type: "string",
      required: true,
    },
    mass: {
      type: "number",
      defaultsTo: 0,
    },
    B6: {
      type: "number",
      defaultsTo: 0,
    },
    B12: {
      type: "number",
      defaultsTo: 0,
    },
    B20: {
      type: "number",
      defaultsTo: 0,
    },
    B45: {
      type: "number",
      defaultsTo: 0,
    },
    shippingType: {
      type: "string",
      isIn: ["GIAO_HANG", "TRA_VO"],
      defaultsTo: "GIAO_HANG",
    },
    cancel: {
      model: "cancelhistory",
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
