/**
 * Region.js
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

    lat: {
      type: "number",
      required: true,
    },

    long: {
      type: "number",
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
