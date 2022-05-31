/**
 * ShippingOrder.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    driverId: {
      model: 'user',
    },

    nameDriver: {
      type: 'string',
    },

    licensePlate: {
      type: 'string',
    },

    deliveryDate: {
      type: 'string',
    },

    deliveryHours: {
      type: 'string',
    },

    note: {
      type: 'string'
    },

    status: {
      type: 'number',
      isIn: [ 1, 2, 3, 4],
      defaultsTo: 1
    },

    // provinceId: {
    //   model: 'province'
    // },

    // ---

    shippingOrderDetail: {
      collection: 'shippingorderdetail',
      via: 'shippingOrderId',
    },

    shippingCustomerDetail: {
      collection: 'shippingcustomerdetail',
      via: 'shippingOrderId',
    },

    shippingTextDetail: {
      collection: 'shippingtextdetail',
      via: 'shippingOrderId',
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
    numbercylinder: {
      type: 'number',
    },

  },

};

