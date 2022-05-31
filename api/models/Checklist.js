/**
 * Checklist.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    number: {
      type: "string",
    },

    schedule: {
      model: "inspectionschedule",
    },

    name_Checklist: {
      type: "string",
    },

    checking_at: {
      type: "string",
    },

    location: {
      type: "string",
    },

    checkingDate: {
      type: "string",
      columnType: "datetime",
    },

    person_in_charge: {
      type: "string",
    },

    phone: {
      type: "string",
    },

    signature_CheckedBy: {
      type: "string",
    },

    signature_VerifiedBy: {
      type: "string",
    },

    note: {
      type: "string",
    },

    //

    checklistdetail: {
      collection: "checklistdetail",
      via: "checklist",
    },

    tankCheckingRecord: {
      collection: "tankcheckingrecord",
      via: "checklist",
    },

    valveFlangeRecord: {
      collection: "valveflangerecord",
      via: "checklist",
    },

    vaporizerCheckingRecord: {
      collection: "vaporizercheckingrecord",
      via: "checklist",
    },

    earthSysRecord: {
      collection: "earthsysrecord",
      via: "checklist",
    },

    fireFightingRecord: {
      collection: "firefightingrecord",
      via: "checklist",
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
