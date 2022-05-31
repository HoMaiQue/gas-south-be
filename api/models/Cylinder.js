/**
 * Cylinder.js
 *
 * @description :: Cylinder model
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    serial: {
      type: 'string',
      required: true
    },

    factory: {
      model: 'user'
    },

    general: {
      model: 'user'
    },

    agency: {
      model: 'user'
    },

    station: {
      model: 'user'
    },

    current: {
      model: 'user'
    },

    manufacture: {
      model: 'manufacture',
    },

    manufacturedBy: {
      model: 'user',
    },

    exportPlace: {
      model: 'user'
    },

    img_url: {
      type: 'string'
    },

    color: {
      type: 'string',
      defaultsTo: 'Grey'
    },

    cylinderType: {
      type: 'string',
    },

    checkedDate: {
      type: 'string',
      columnType: 'datetime'
    },

    weight: {
      type: 'number'
    },

    placeStatus: {
      type: 'string',
      isIn: ['IN_FACTORY', 'IN_REPAIR', 'DELIVERING', 'IN_GENERAL', 'IN_AGENCY', 'IN_CUSTOMER', 'IN_STATION'],
      defaultsTo: 'IN_FACTORY'
    },

    status: {
      type: 'string',
      isIn: ['DISABLED', 'FULL', 'EMPTY'],
      defaultsTo: 'EMPTY'
    },

    histories: {
      collection: 'history',
      via: 'cylinders'
    },

    priceHistories: {
      collection: 'PriceHistory',
      via: 'cylinders'
    },

    circleCount: {
      type: 'number',
      defaultsTo: 0
    },

    currentImportPrice: {
      type: 'number'
    },

    currentSalePrice: {
      type: 'number'
    },

    category: {
      model: 'categorycylinder',
    },

    isDeleted: {
      type: 'boolean',
      defaultsTo: false
    },

    isCanceled: {
      type: 'boolean',
      defaultsTo: false
    },

    idCancel: {
      model: 'cylindercancel',
    },
    
    imexRecords: {
      collection: 'cylinderimex',
      via: 'cylinder',
    },

    idGeo: {
      type: 'string',
    },

    // assetType: {
    //   type: 'string'
    // },

    rentalPartner: {
      model: 'RentalPartners'
    },

    classification: {
      type: 'string',
      isIn: ['New', 'Old', 'NEW', 'OLD'],
      defaultsTo: 'Old'
    },

    // Trùng mã    
    hasDuplicate: {
      type: 'boolean',
      defaultsTo: false,
    },

    duplicateCylinders: {
      collection: 'duplicatecylinder',
      via: 'duplicate',
    },

    isDuplicate: {
      type: 'boolean',
      defaultsTo: false,
    },

    copyCylinder: {
      collection:'duplicatecylinder',
      via: 'copy',
    },

    prefix: {
      type: 'string',
    },

    // Tự động khai báo
    // Cần bổ sung thông tin
    needMoreInfo: {
      type: 'boolean',
      defaultsTo: false,
    },

    //
    createdAt: {
      type: 'string',
      columnType: 'datetime',
      autoCreatedAt: true
    },

    updatedAt: {
      type: 'string',
      columnType: 'datetime'
    },

    deletedAt: {
      type: 'string',
      columnType: 'datetime'
    },

    valve: {
      type: 'string'
    },

    createdBy: {
      model: 'user'
    },

    updatedBy: {
      model: 'user'
    },

    deletedBy: {
      model: 'user'
    },

    geoType: {
      model: 'testgeo'
    },
  },
};

