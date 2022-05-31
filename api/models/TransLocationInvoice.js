/**
 * TransLocationInvoice.js
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

    transInvoiceDetailId: {
      model: 'transinvoicedetail'
    },

    ordergasId: {
      model: 'ordergas',
    },

    // ---
    isDeleted: {
      type: 'boolean',
      defaultsTo: false,
    },

    createdBy: {
      model: 'carrier',
    },

    updatedBy: {
      model: 'carrier',
    },

    deletedBy: {
      model: 'carrier',
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

