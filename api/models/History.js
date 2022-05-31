/**
 * History.js
 *
 * @description :: History model
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    driver: {
      type: "string",
      //required: true
    },
    signature: {
      type: "string",
      //required: true
    },
    idDriver: {
      model: "user",
    },

    license_plate: {
      type: "string",
      //required: true
    },

    cylinders: {
      collection: "cylinder",
      via: "histories",
    },

    type: {
      type: "string",
      isIn: [
        "EXPORT",
        "IMPORT",
        "TURN_BACK",
        "RETURN",
        "SALE",
        "GIVE_BACK",
        "TURN_BACK_NOT_IN_SYSTEM",
      ],
      defaultsTo: "EXPORT",
    },

    // Lý do hồi lưu bình đầy
    reason: {
      type: "string",
    },

    exportByDriver: {
      type: "string",
    },

    turnbackByDriver: {
      type: "string",
    },

    typeForPartner: {
      type: "string",
      isIn: ["RENT", "BUY", "TO_FIX", "RETURN_CYLINDER"],
      defaultsTo: "",
    },

    numberOfCylinder: {
      type: "number",
    },

    cylindersWithoutSerial: {
      type: "number",
    },

    shipper: {
      type: "string",
    },

    phoneNumber: {
      type: "string",
    },

    from: {
      model: "user",
    },

    to: {
      model: "user",
    },

    customer: {
      model: "customer",
    },

    toArray: {
      collection: "user",
      via: "histories",
    },
    numberArray: {
      type: "json",
      columnType: "array",
    },

    amount: {
      type: "number",
    },

    saler: {
      model: "user",
    },

    cylinderImex: {
      collection: "cylinderimex",
      via: "history",
    },

    // Xác định xử lý xuất nhập bởi hệ thống
    importExportBySystem: {
      type: "boolean",
      defaultsTo: false,
    },

    //
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
     
  },

  // afterCreate: function (valuesToSet, proceed) {
  // 	valuesToSet.cylinders.map(function (cylinder) {
  // 		switch (cylinder.placeStatus) {
  // 			case PlaceStatus.IN_STATION:
  // 				cylinder.placeStatus = PlaceStatus.DELIVERING;
  // 				break;
  //
  // 			case PlaceStatus.IN_FACTORY:
  // 				cylinder.placeStatus = PlaceStatus.DELIVERING;
  // 				break;
  //
  // 			case PlaceStatus.IN_AGENCY:
  // 				cylinder.placeStatus = PlaceStatus.DELIVERING;
  // 				break;
  //
  // 			case PlaceStatus.IN_GENERAL:
  // 				cylinder.placeStatus = PlaceStatus.DELIVERING;
  // 				break;
  //
  // 			case PlaceStatus.IN_CUSTOMER:
  // 				cylinder.placeStatus = PlaceStatus.DELIVERING;
  // 				break;
  //
  // 			case PlaceStatus.DELIVERING:
  // 				const random = [PlaceStatus.IN_STATION, PlaceStatus.IN_FACTORY, PlaceStatus.IN_AGENCY, PlaceStatus.IN_GENERAL, PlaceStatus.IN_CUSTOMER]
  // 				cylinder.placeStatus = random[Math.floor(Math.random() * random.length)];
  // 				break;
  //
  // 			default:
  // 				cylinder.placeStatus = PlaceStatus.DELIVERING;
  // 				return false;
  // 		}
  // 		return cylinder
  // 	});
  //
  // 	console.log(valuesToSet);
  //
  // 	return pro---=
  // }
};
