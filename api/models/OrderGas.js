/**
 * OrderGas.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    orderCode: {
      type: 'string',
      unique: true
    },

    customerId: {
      model: 'customer'
    },

    deliveryDate: {
      type: 'string',
      columnType: 'datetime',
    },

    note: {
      type: 'string'
    },

    total: {
      type: 'number'
    },

    status: {
      type: 'string',
      isIn: ['INIT', 'CONFIRMED', 'PROCESSING', 'DELIVERING', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'ERROR','REQUEST', 'REMOVE'],
      defaultsTo: 'INIT'
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

