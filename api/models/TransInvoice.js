/**
 * TransInvoice.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    code: {
      type: 'string'
    },

    status: {
      type: 'number',
      isIn: [ 1, 2, 3],
      defaultsTo: 1
    },

    deliveryDate: {
      type: 'string',
    },

    deliveryHours: {
      type: 'string',
    },

    carrierId: {
      model: 'carrier'
    },

    userId: {
      model: 'user'
    },

    note: {
      type: 'string'
    },

    transInvoiceDetail: {
      collection: 'transinvoicedetail',
      via: 'transInvoiceId',
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

