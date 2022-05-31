/**
 * OrderTank.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    orderCode: {
      type: 'string'
    },

    // exportId:{
    //   model:'exportorderdetail'
    // },
    exportId:{
      collection :'exportorderdetail',
      via :'orderId'
  },

    customergasId: {
      model: 'customergas'
    },

    userId: {
      model: 'user'
    },

    warehouseId: {
      model: 'warehouse'
    },

    quantity: {
      type: 'string'
    },

    divernumber: {
      type: 'string',
    },

    typeproduct: {
      type: 'string'
    },

    fromdeliveryDate: {
      type: 'string',
      columnType: 'datetime',
    },

    todeliveryDate: {
      type: 'string',
      columnType: 'datetime',
    },

    deliveryHours: {
      type: 'string'
    },

    status: {
      type: 'string',
      isIn: ['INIT', 'PENDING', 'CONFIRMED', 'PROCESSING', 'DELIVERING', 'DELIVERED', 'CANCELLED'],
      defaultsTo: 'INIT'
    },

    reminderschedule: {
      type: 'string',
      columnType: 'datetime',
    },

    // note: {
    //   type: 'string',
    // },
    note: {
      collection: 'historynote',
      via: 'historyNoteOrder',
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

    exportOrderDetail: {
      collection: 'exportorderdetail',
      via: 'orderId',
    },
    // status:{
    //   type:'string',
    //   isIn:['INIT','PROCESSING','DELIVERING','DELIVERED','CANCELLED'],
    //   defaultsTo : 'INIT'
    // },

  },

};

