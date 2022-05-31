/**
 * Area.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    cancelBy: {
      model: "user",
    },
    orderGSID: {
      model: "ordergs",
    },
    reason: {
      model: "reason",
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
    // ---

    createdAt: {
      type: "string",
      columnType: "datetime",
      autoCreatedAt: true,
    },
  },
};
