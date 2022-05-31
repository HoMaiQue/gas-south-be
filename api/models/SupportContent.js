/**
 * SupportContent.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    content:{
      type : 'string'
    },
    
    supportID: {
      model: 'support'
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

      support_img: {
        collection: 'SupportImage',
        via: 'contentID'
      },
  },

};

