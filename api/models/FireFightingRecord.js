module.exports = {
  attributes: {
    // 1
    testCoolingSys_BeforeMaintenance: {
      type: "string",
    },

    testCoolingSys_AfterMaintenance: {
      type: "string",
    },

    testCoolingSys_Results: {
      type: "string",
    },

    // 2
    chkWaterSupl_BeforeMaintenance: {
      type: "string",
    },

    chkWaterSupl_AfterMaintenance: {
      type: "string",
    },

    chkWaterSupl_Results: {
      type: "string",
    },

    // 3
    chkPortableEqm_BeforeMaintenance: {
      type: "string",
    },

    chkPortableEqm_AfterMaintenance: {
      type: "string",
    },

    chkPortableEqm_Results: {
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
