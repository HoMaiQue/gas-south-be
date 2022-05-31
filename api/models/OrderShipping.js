/**
 * OrderShipping.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    orderCode: {
      type: "string",
    },

    customerId: {
      model: "user",
    },

    agencyId: {
      model: "user",
    },

    warehouseId: {
      model: "user",
    },

    deliveryDate: {
      type: "string",
      columnType: "datetime",
    },

    listCylinder: {
      type: "json",
      columnType: "array",
    },

    note: {
      type: "string",
    },

    status: {
      type: "string",
      isIn: [
        "INIT",
        "CONFIRMED",
        "PROCESSING",
        "DELIVERING",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
        "ERROR",
        "REQUEST",
        "REMOVE",
      ],
      defaultsTo: "INIT",
    },

    type: {
      type: "string",
      isIn: ["V", "B"],
      defaultsTo: "B",
    },
    orderHistories: {
      collection: "ordershippinghistory",
      via: "order",
    },

    shippingOrderDetail: {
      collection: "shippingorderdetail",
      via: "orderId",
    },

    //

    createdAt: {
      type: "string",
      columnType: "datetime",
      autoCreatedAt: true,
    },
    updatedAt: {
      type: "string",
      columnType: "datetime",
      autoUpdatedAt: true,
    },

    createdBy: {
      model: "user",
    },

    updatedBy: {
      model: "user",
    },
    reasonForCancellatic: {
      type: "string",
    },

    isDeleted: {
      type: "boolean",
      defaultsTo: false,
    },
    deletedBy: {
      model: "user",
    },
    
    deletedAt: {
      type: "string",
      columnType: "datetime",
    },

    cancelledBy: {
      model: "user",
    },
  },
};
