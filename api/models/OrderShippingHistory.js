/**
 * OrderShippingHistory.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    order: {
      model: "ordershipping",
      // required: true
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
      ],
      // required: true
    },

    content: {
      type: "string",
    },

    // Xem chi tiết xuất/nhập hàng
    detail: {
      model: "ordershippinghistory",
    },

    //

    createdAt: {
      type: "string",
      columnType: "datetime",
      autoCreatedAt: true,
    },

    createdBy: {
      model: "user",
    },

    updatedBy: {
      model: "user",
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
  },
};
