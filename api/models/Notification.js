/**
 * Notification.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    customerId: {
      model: "customer",
    },

    title: {
      type: "string",
      // required: true
    },

    content: {
      type: "string",
      // required: true
    },

    code: {
      type: "string",
      // unique: true,
      // required: true
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
