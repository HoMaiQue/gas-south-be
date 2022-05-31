/**
 * Statistic.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    // --- Thời gian thống kê --- //
    startDate: {
      type: "string",
      columnType: "datetime",
    },

    endDate: {
      type: "string",
      columnType: "datetime",
    },

    // --- Thông tin trạm --- //
    idStation: {
      model: "user",
    },

    nameStation: {
      type: "string",
    },

    // --- Thông tin loại bình --- //
    codeCylinderType: {
      type: "string",
    },

    idCylinderType: {
      model: "categorycylinder",
    },

    massCylinderType: {
      type: "string",
    },

    nameCylinderType: {
      type: "string",
    },

    // --- Thông tin tình trạng bình --- //
    conditionCylinder: {
      type: "string",
      isIn: ["NEW", "OLD", "CANCEL"],
    },

    // --- Thông tin thương hiệu --- //
    idManufacture: {
      model: "manufacture",
    },

    nameManufacture: {
      type: "string",
    },

    // --- Thông tin thống kê --- //
    // Tạo mới
    create: {
      type: "number",
    },
    // Nhập vỏ
    importShellFromFixer: {
      type: "number",
    },
    importShellFromElsewhere: {
      type: "number",
    },
    turnback: {
      type: "number",
    },
    returnFullCylinder: {
      // hồi lưu bình đầy
      type: "number",
    },
    // Xuất vỏ:
    exportShellToFixer: {
      type: "number",
    },
    exportShellToElsewhere: {
      type: "number",
    },
    // Xuất hàng:
    numberExport: {
      type: "number",
    },
    massExport: {
      type: "number",
    },
    // Thanh lý
    cancel: {
      type: "number",
    },
    // Tồn kho
    inventory: {
      type: "number",
    },

    // ---
    createdBy: {
      model: "user",
    },

    updatedBy: {
      model: "user",
    },

    deletedBy: {
      model: "user",
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
    isDeleted: {
      type: "boolean",
      defaultsTo: false,
    },
  },
};
