/**
 * Checklist.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    // 1
    visualChecking_BeforeMaintenance: {
      type: "string",
    },

    visualChecking_AfterMaintenance: {
      type: "string",
    },

    visualChecking_Results: {
      type: "string",
    },

    // 2
    corrosionTank_BeforeMaintenance: {
      type: "string",
    },

    corrosionTank_AfterMaintenance: {
      type: "string",
    },

    corrosionTank_Results: {
      type: "string",
    },

    // 3
    combustiveMaterials_BeforeMaintenance: {
      type: "string",
    },

    combustiveMaterials_AfterMaintenance: {
      type: "string",
    },

    combustiveMaterials_Results: {
      type: "string",
    },

    // 4
    warningSigns_BeforeMaintenance: {
      type: "string",
    },

    warningSigns_AfterMaintenance: {
      type: "string",
    },

    warningSigns_Results: {
      type: "string",
    },

    // 5
    leakingTest_BeforeMaintenance: {
      type: "string",
    },

    leakingTest_AfterMaintenance: {
      type: "string",
    },

    leakingTest_Results: {
      type: "string",
    },

    //
    checklist: {
      model: "checklist",
      unique: true,
    },

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
    deletedBy: {
      model: "user",
    }, 
  },
};
