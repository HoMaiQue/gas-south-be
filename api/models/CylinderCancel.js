/**
 * CylinderCancel.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    // ---
    cylinders: {
      collection: 'cylinder',
      via: 'idCancel'
    },

    isDeleted: {
      type: 'boolean',
      defaultsTo: false
    },

    // ---
    idCancel: {
      type: 'string'
    },

    objectId: {
      model: 'user'
    },
    
    // ---
    createdBy: {
      model: 'user'
    },

    updatedBy: {
      model: 'user'
    },

    deletedBy: {
      model: 'user'
    },

    createdAt: {
      type: 'string',
      columnType: 'datetime',
      autoCreatedAt: true
    },

    updatedAt: {
      type: 'string',
      columnType: 'datetime'
    },

    deletedAt: {
      type: 'string',
      columnType: 'datetime'
    },

  },

};

