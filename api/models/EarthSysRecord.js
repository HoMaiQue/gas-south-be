module.exports = {
  attributes: {
    // 1
    earthResisTest_BeforeMaintenance: {
      type: "string",
    },

    earthResisTest_AfterMaintenance: {
      type: "string",
    },

    earthResisTest_Results: {
      type: "string",
    },

    // 2
    chkConnEarthPoint_BeforeMaintenance: {
      type: "string",
    },

    chkConnEarthPoint_AfterMaintenance: {
      type: "string",
    },

    chkConnEarthPoint_Results: {
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
