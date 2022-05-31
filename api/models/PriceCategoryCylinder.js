/**
 * PriceCategoryCylinder.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    regionId: {
      model: 'region'
    },

    categorycylinderId: {
      model: 'categorycylinder'
    },

    price: {
      type: 'number',
      required: true,
    },

    code: {
      type: 'string',
      required: true,
    },

    regionName: {
      type: 'string',
      required: true,
    },

    dateApply: {
      type: 'string',
      columnType: 'datetime',
      required: true,
    },

    isLastest: {
      type: 'boolean',
      defaultsTo: true
    },

    // ---
    isDeleted: {
      type: 'boolean',
      defaultsTo: false,
    },

    createdBy: {
      model: 'user',
    },

    updatedBy: {
      model: 'user',
    },

    deletedBy: {
      model: 'user',
    },

    // createdAt: {
    //   type: 'string',
    //   columnType: 'datetime',
    //   autoCreatedAt: true,
    // },

    // updatedAt: {
    //   type: 'string',
    //   columnType: 'datetime',
    // },

    deletedAt: {
      type: 'string',
      columnType: 'datetime',
    },
    
  },

};

