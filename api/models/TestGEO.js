/**
 * TestGEO.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    Id: {
      type: "number",
      required: true,
      unique: true,
    },

    ProductName: {
      type: "string",
    },

    Code: {
      type: "string",
    },

    CRUDBy: {
      type: "string",
    },

    CRUDDate: {
      type: "string",
      columnType: "datetime",
    },

    Description: {
      type: "string",
    },

    Note: {
      type: "string",
    },

    Type: {
      type: "number",
    },

    IsActive: {
      type: "boolean",
    },

    ParentId: {
      type: "string",
    },

    WeightType: {
      type: "string",
    },

    ServiceType: {
      type: "string",
    },

    ProductionType: {
      type: "string",
    },

    BrandNametId: {
      type: "number",
    },

    ColorId: {
      type: "string",
    },
    isDeleted: {
      type: "boolean",
      defaultsTo: false,
    },
    deletedBy: {
      model: "user",
    },
    deletedBy: {
      model: "user",
    },
  },
};
