/**
 * OrderGSConfirmationHistory.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    // id đơn hàng
    orderGSId: {
      model: "ordergs",
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
      ],
      defaultsTo: "DON_HANG_MOI",
    },
    action: {
      type: "string",
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
