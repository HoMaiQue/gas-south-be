/**
 * Checklist.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    orderId: {
      type: "string",
    },

    factoryId: {
      model: "user",
    },

    numberCylinders: {
      type: "string",
    },

    orderDate: {
      type: "string",
      columnType: "datetime",
    },

    status: {
      type: "string",
    },

    //

    createdAt: {
      type: "string",
      columnType: "datetime",
      autoCreatedAt: true,
    },

    createdBy: {
      model: "user",
    },

    updatedBy: {
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
