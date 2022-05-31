/**
 * OrderGS.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    orderCode: {
      type: "string",
    },

    orderDetail: {
      collection: "orderdetail",
      via: "orderGSId",
    },
    delivery: {
      collection: "shippinggs",
      via: "orderID",
    },
    status: {
      type: "string",
      isIn: [
        "DON_HANG_MOI",
        "TO_NHAN_LENH_DA_DUYET",
        "TU_CHOI_LAN_1",
        "TU_CHOI_LAN_2",
        "GUI_DUYET_LAI",
        "DANG_DUYET",
        "DA_DUYET",
        "DANG_GIAO",
        "DA_HOAN_THANH",
        "KHONG_DUYET",
        "DA_HUY",
      ],
      defaultsTo: "DON_HANG_MOI",
    },
    status2: {
      type: "string",
      isIn: [
        "DON_HANG_MOI",
        "TU_CHOI_LAN_1",
        "TU_CHOI_LAN_2",
        "GUI_DUYET_LAI",
        "DANG_DUYET",
        "DA_DUYET",
        "DANG_GIAO",
        "DA_HOAN_THANH",
        "KHONG_DUYET",
      ],
      defaultsTo: "DON_HANG_MOI",
    },
    statusforPGD: {
      type: "string",
      isIn: [
        "DON_HANG_MOI",
        "TU_CHOI_LAN_1",
        "TU_CHOI_LAN_2",
        "GUI_DUYET_LAI",
        "DA_DUYET",
        "DANG_GIAO",
        "DA_HOAN_THANH",
        "KHONG_DUYET",
      ],
      defaultsTo: "DON_HANG_MOI",
    },
    statusforTRAM: {
      type: "string",
      isIn: ["DON_HANG_MOI", "DANG_GIAO", "DA_HOAN_THANH"],
      defaultsTo: "DON_HANG_MOI",
    },
    statusforCustomer: {
      type: "string",
      isIn: [
        "CHO_XAC_NHAN",
        "XAC_NHAN",
        "DANG_GIAO",
        "DA_HOAN_THANH",
        "DA_HUY",
      ],
      defaultsTo: "CHO_XAC_NHAN",
    },

    // ngày hoàn thành đơn hàng
    dateDone: {
      type: "string",
      columnType: "datetime",
      defaultsTo: "",
    },

    supplier: {
      model: "user",
      // required: true,
    },
    area: {
      model: "area",
      required: true,
    },
    customerType: {
      type: "string",
    },
    customerName: {
      type: "string",
    },
    customers: {
      model: "user",
      required: true,
    },
    orderType: {
      type: "string",
      isIn: ["KHONG", "COC_VO", "MUON_VO"],
      defaultsTo: "KHONG",
    },

    note: {
      type: "string",
    },
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
      model: "cancelhistory",
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
