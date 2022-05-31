module.exports = {
  attributes: {
    exportOrderId: {
      model: "exportorder",
    },
    orderId: {
      model: "OrderTank",
    },
    // orderId:{
    //     collection :'ordertank',
    //     via :'exportId'
    // },
    isDeleted: {
      type: "boolean",
      defaultsTo: false,
    },
    createdAt: {
      type: "string",
      columnType: "datetime",
      autoCreatedAt: true,
    },

    updatedAt: {
      type: "string",
      columnType: "datetime",
    },

    deletedAt: {
      type: "string",
      columnType: "datetime",
    },
    status: {
      type: "string",
      isIn: ["INIT", "PROCESSING", "DELIVERING", "DELIVERED", "CANCELLED"],
      defaultsTo: "INIT",
    },
    deletedBy: {
      model: "user",
    },
  },
};
