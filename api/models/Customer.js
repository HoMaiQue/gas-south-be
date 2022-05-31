/**
 * Customer.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    name: {
      type: "string",
      required: true,
    },

    address: {
      type: "string",
      // required: true
    },

    phone: {
      type: "string",
      // required: true,
      // unique: true
    },

    lat: {
      type: "number",
      defaultsTo: 0,
      // required: true
    },

    long: {
      type: "number",
      defaultsTo: 0,
      // required: true
    },

    loginprovider: {
      type: "string",
      isIn: ["Facebook", "Google", "AppleID"],
    },

    providerkey: {
      type: "string",
    },

    playerId: {
      type: "string",
    },

    owner: {
      model: "user",
    },

    createBy: {
      model: "user",
    },

    updateBy: {
      model: "user",
    },

    orderGas: {
      collection: "ordergas",
      via: "customerId",
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
