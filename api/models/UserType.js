/**
 * UserInfo.js
 *
 * @description :: UserInfo model
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = ({
  attributes: {
    name: {
      type: 'string',
      unique: true,
      required: true
    },
    orderNo: {
      type: 'number'
    },

    note: {
      type: 'string'
    },
    objectId: {
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

    createdBy: {
      model: 'user'
    },

    updatedBy: {
      model: 'user'
    },

    deletedBy: {
      model: 'user'
    },

    isDeleted: {
      type: 'boolean',
      defaultsTo: false
    },
  }
});
