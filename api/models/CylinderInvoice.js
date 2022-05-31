/**
 * CylinderInvoice.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    
    serial: {
      type: 'string',
      required: true
    },

    cylinderID: {
      model: 'cylinder',
      required: true
    },

    image: {
      type: 'string',
      required: true
    },

    imageCylinder: {
      type: 'string',
      // required: true
    },

    customerID: {
      model: 'customer',
      required: true
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

