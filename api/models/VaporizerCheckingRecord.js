/**
 * Checklist.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    // 1
    chkCtrlSystem_BeforeMaintenance: {
      type: "string",
    },

    chkCtrlSystem_AfterMaintenance: {
      type: "string",
    },

    chkCtrlSystem_Results: {
      type: "string",
    },

    // 2
    chkVapoArea_BeforeMaintenance: {
      type: "string",
    },

    chkVapoArea_AfterMaintenance: {
      type: "string",
    },

    chkVapoArea_Results: {
      type: "string",
    },

    // 3
    drainVapo_BeforeMaintenance: {
      type: "string",
    },

    drainVapo_AfterMaintenance: {
      type: "string",
    },

    drainVapo_Results: {
      type: "string",
    },

    // 4
    topUpWater_BeforeMaintenance: {
      type: "string",
    },

    topUpWater_AfterMaintenance: {
      type: "string",
    },

    topUpWater_Results: {
      type: "string",
    },

    // 5
    chkWaterLev_BeforeMaintenance: {
      type: "string",
    },

    chkWaterLev_AfterMaintenance: {
      type: "string",
    },

    chkWaterLev_Results: {
      type: "string",
    },

    // 6
    leakTest_BeforeMaintenance: {
      type: "string",
    },

    leakTest_AfterMaintenance: {
      type: "string",
    },

    leakTest_Results: {
      type: "string",
    },

    // 7
    chkPower_BeforeMaintenance: {
      type: "string",
    },

    chkPower_AfterMaintenance: {
      type: "string",
    },

    chkPower_Results: {
      type: "string",
    },

    // 8
    chkVapoComp_BeforeMaintenance: {
      type: "string",
    },

    chkVapoComp_AfterMaintenance: {
      type: "string",
    },

    chkVapoComp_Results: {
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
    
    deletedAt: {
      type: "string",
      columnType: "datetime",
    },
  },
};
