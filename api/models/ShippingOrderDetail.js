/**
 * ShippingOrderDetail.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    shippingOrderId: {
      model: 'shippingorder'
    },

    orderId: {
      model: 'ordershipping'
    },

    provinceId: {
      model: 'region'
    },

    status: {
      type: 'string',
      isIn: ['PROCESSING', 'DELIVERING', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
      defaultsTo: 'PROCESSING'
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
    namekh: {
      type: 'string',
    },

  },

};

