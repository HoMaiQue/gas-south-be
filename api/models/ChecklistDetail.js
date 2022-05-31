/**
 * Checklist.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    combustiveMaterial: {
      type: "string",
    },

    warningSigns: {
      type: "string",
    },

    fireExtinguisher: {
      type: "string",
    },

    appearance: {
      type: "string",
    },

    cylindersOthers: {
      type: "string",
    },

    pigTails_Type: {
      type: "string",
    },

    pigTails_Appearance: {
      type: "string",
    },

    pipingBefore_1stRegulator_Leakage: {
      type: "string",
    },

    pipingBefore_1stRegulator_Others: {
      type: "string",
    },

    pipingAfter_1stRegulator_Leakage: {
      type: "string",
    },

    pipingAfter_1stRegulator_Others: {
      type: "string",
    },

    valesOnPiping_Leakage: {
      type: "string",
    },

    valesOnPiping_Others: {
      type: "string",
    },

    hoseConnect_Type: {
      type: "string",
    },

    hoseConnect_Appearance: {
      type: "string",
    },

    periodicalInspection_Devices: {
      type: "string",
    },

    checklist: {
      model: "checklist",
      unique: true,
    },

    // createdAt: {
    //   type: 'string',
    //   columnType: 'datetime',
    //   autoCreatedAt: true
    // },

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
