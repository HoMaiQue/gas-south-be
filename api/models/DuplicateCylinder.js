/**
 * DuplicateCylinder.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    serial: {
      type: 'string',
      required: true,
    },

    duplicate: {
      model: 'cylinder',
    },

    copy: {
      model:'cylinder',
      unique: true,
    },

    //
    isDeleted: {
      type: 'boolean',
      defaultsTo: false,
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

    createdBy: {
      model: 'user',
    },

    updatedBy: {
      model: 'user',
    },

    deletedBy: {
      model: 'user',
    },
  },

};

