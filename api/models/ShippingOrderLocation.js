/**
 * ShippingOrderLocation.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    lat: {
      type: 'number'
    },

    long: {
      type: 'number'
    },

    retimener: {
      type: 'string',
      columnType: 'datetime',
    },

    shippingOrderDetailID: {
      model: 'shippingorderdetail'
    },

    orderShippingID: {
      model: 'ordershipping',
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

    createdAt: {
      type: 'string',
      columnType: 'datetime',
      autoCreatedAt: true,
    },

    updatedAt: {
      type: 'string',
      columnType: 'datetime',
    },

    deletedAt: {
      type: 'string',
      columnType: 'datetime',
    },

  },

};

