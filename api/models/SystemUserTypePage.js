/**
 * UserInfo.js
 *
 * @description :: UserInfo model
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = ({
    attributes: {
        userTypeId: {
            model: 'UserType'
        },

        parentId: {
            model: 'systempage'
        },

        pageId: {
            model: 'SystemPage'
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

        updatedByUT: {
            model: 'UserType'
        },

        updatedBySP: {
            model: 'SystemPage'
        },

        isDeleted: {
            type: 'boolean',
            defaultsTo: false
        },
        deletedBy: {
          model: "user",
        },
         
    }
});