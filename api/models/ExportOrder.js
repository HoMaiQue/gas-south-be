module.exports = {
  attributes: {
    code: {
      type: "number",
    },
    // orderId:{
    //     model :'ordertank',
    //     // via :'exportId'
    //},
    driverId: {
      model: "User",
    },
    nameUser: {
      type: "string",
    },
    nameDriver: {
      type: "string",
    },
    weight: {
      type: "number",
    },
    licensePlate: {
      type: "string",
    },
    wareHouseId: {
      model: "WareHouse",
    },
    userId: {
      model: "User",
    },
    empty: {
      type: "number",
    },
    full: {
      type: "number",
    },
    deliveryDate: {
      type: "string",
    },
    deliveryHours: {
      type: "string",
    },
    node: {
      type: "string",
    },
    type: {
      type: "string",
      isIn: ["X", "N"],
      //defaultsTo: 'X'
    },
    status: {
      type: "number",
      isIn: [1, 2, 3],
      defaultsTo: 1,
    },
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
    deletedBy: {
      model: "user",
    },

    exportOrderDetail: {
      collection: "exportorderdetail",
      via: "exportOrderId",
    },
  },
};
