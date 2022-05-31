/**
 * CylinderImex.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    // ---
    // cylinders: {
    //   collection: 'cylinder',
    //   via: 'idImex'
    // },

    cylinder: {
      model: 'cylinder'
    },

    isDeleted: {
      type: 'boolean',
      defaultsTo: false,
    },

    // ---
    idImex: {
      type: 'string'
    },

    status: {
      type: 'string',
      isIn: ['FULL', 'EMPTY']
    },

    condition: {
      type: 'string',
      isIn: ['NEW', 'OLD', 'CANCEL']
    },

    category: {
      model: 'categorycylinder',
    },

    manufacture: {
      model: 'manufacture',
    },

    typeImex: {
      type: 'string',
      isIn: ['IN', 'OUT']
    },

    flow: {
      type: 'string',
      isIn: ['CREATE', 'EXPORT', 'IMPORT',
        'EXPORT_CELL', 'IMPORT_CELL',
        'GIVE_BACK', 'TURN_BACK',
        'TRANSITION', 'RETURN', 'RETURN_FULLCYL',
        'BRINGING_IN', 'SALE', 'CANCEL']
    },

    flowDescription: {
      type: 'string',
      isIn: [
        'CREATE', 'DECLARE', 'SELL', 'BUY', 'OWN', 'RENT', 'ROTATION',
        'TO_FIX', 'FIXED', 'CANCEL', 'TURN_BACK', 'RETURN', 'BY_SYSTEM',
      ]
    },

    objectId: {
      model: 'user'
    },

    history: {
      model: 'history'
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

