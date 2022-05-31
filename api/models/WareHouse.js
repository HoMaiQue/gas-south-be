/**
 * WareHouse.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name: {
        type: 'string'
    },

    code: {
        type: 'string'
    },

    address: {
        type: 'string'
    },

    userId: {
        model: 'user'
    },

    mininventory: {
        type: 'number',
    },

    namecontact: {
        type: 'string',
    },

    mobilecontact: {
        type: 'string'
    },

    emailcontact: {
        type: 'string'
    },

    note: {
        type: 'string',
    },

    isSupplier: {
        type: 'boolean'
    },

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

