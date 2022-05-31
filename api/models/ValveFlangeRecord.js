/**
 * Checklist.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    // 1
    emergencyShutValve_BeforeMaintenance: {
      type: "string",
    },

    emergencyShutValve_AfterMaintenance: {
      type: "string",
    },

    emergencyShutValve_Results: {
      type: "string",
    },

    // 2
    globeValve_BeforeMaintenance: {
      type: "string",
    },

    globeValve_AfterMaintenance: {
      type: "string",
    },

    globeValve_Results: {
      type: "string",
    },

    // 3
    ballValve_BeforeMaintenance: {
      type: "string",
    },

    ballValve_AfterMaintenance: {
      type: "string",
    },

    ballValve_Results: {
      type: "string",
    },

    // 4
    drainValve_BeforeMaintenance: {
      type: "string",
    },

    drainValve_AfterMaintenance: {
      type: "string",
    },

    drainValve_Results: {
      type: "string",
    },

    // 5
    electricalValve_BeforeMaintenance: {
      type: "string",
    },

    electricalValve_AfterMaintenance: {
      type: "string",
    },

    electricalValve_Results: {
      type: "string",
    },

    // 6
    stStageRegulator_BeforeMaintenance: {
      type: "string",
    },

    stStageRegulator_AfterMaintenance: {
      type: "string",
    },

    stStageRegulator_Results: {
      type: "string",
    },

    // 7
    pipeCorrosion_BeforeMaintenance: {
      type: "string",
    },

    pipeCorrosion_AfterMaintenance: {
      type: "string",
    },

    pipeCorrosion_Results: {
      type: "string",
    },

    // 8
    drainInsidePipeline_BeforeMaintenance: {
      type: "string",
    },

    drainInsidePipeline_AfterMaintenance: {
      type: "string",
    },

    drainInsidePipeline_Results: {
      type: "string",
    },

    // 9
    checkGasLeakage_BeforeMaintenance: {
      type: "string",
    },

    checkGasLeakage_AfterMaintenance: {
      type: "string",
    },

    checkGasLeakage_Results: {
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
