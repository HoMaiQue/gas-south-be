/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */
//

// const jwtAuthSystemUser = require("../api/policies/jwtAuthSystemUser");

module.exports.policies = {
  /***************************************************************************
   *                                                                          *
   * Default policy for all controllers and actions, unless overridden.       *
   * (`true` allows public access)                                            *
   *                                                                          *
   ***************************************************************************/

  // '*': true
  "*": ["jwtAuth"], // bắt buộc đăng nhập

  HistoryController: {
    sortHistoryImport: true,
    sortHistoryExport: true,
    // 'getHistoriesByType':true,
    // 'importCylinder':true,

    // 'sortHistoryImport10' : true,
    // 'sortHistoryExport10' : true,
    importCylinderSkipScanWhenExport: true,
    getCylinderHistoryExcels: true,
  },

  UserController: {
    find: ["jwtAuth", "permissionRoles"],
    create: true,
    login: true,
    forgotPassword: true,
    resetPasswordByResetToken: true,
    //'changePassword' : true,
    // 'updateBrandInformation': true,
    updateInformationUser: true,
    updateReturnGas: true,
    getListReturnGas: true,
    getAvatar: true,
    getDriver: true,
    listNameDriver: true,
    getSignature: true,
    getBrandInformation: true,

    //'uploadFile': true
    returnGasS: true,
    getInspector: true,
    getStaff: true,
    getAllChild: true,

    //'addUser': true,
    //'getAllCompanyToFix': true,
    getListUserByTpe: true,
    getListUserByType: true,
  },
  // 'returnGasController':{
  // 	'returnGas': true
  // },
  CylinderController: {
    searchCylinders: true,
    getReqImport: true,
    importCylinders: true,
    getListCylindersAutoInit: true,
  },

  ReportController: {
    create: true,
    //'checkInventory' : true,
    getListChild: true,
    getTopExport: true,
    getInventoryInfo: true,
  },

  Report2Controller: {
    // 'getAggregateByCylindersCondition': true,
  },

  ManufactureController: {
    find: true,
    updateBrandInformation: true,
    listManufactures: true,
  },

  ChecklistController: {
    setChecklist: true,
    setMonthlyChecklist: true,
  },

  InspectionScheduleController: {
    createSchedule: true,
    getSchedule: true,
    getListSchedule: true,
  },

  OrderController: {
    getOrders: true,
    getOrdersOfFactory: true,
  },

  //
  TestController: {
    getAllHistoryOfCylinder: true,
    getHistoryByID: true,
    testBugExcel: true,
    test123: true,
  },

  //
  TempController: {
    // 'getCylinderByHistory':true,
  },

  //
  RentalPartnersController: {
    createRentalPartners: true,
  },

  //
  CategoryCylinderController: {
    // 'list': true,
    create: true,
    listCategories: true,
  },

  CylinderCancelController: {
    // 'create': true,
  },

  CylinderImexController: {
    Test: true,
    getExport: true,
    getCurrentInventory: true,
    getStatistics: true,
  },

  CustomerController: {
    createInfo: true,
    updateAddress: true,
    checkCustomerIsExist: true,
    loginProvider: true,
    getCustomerById: true,
    updateCustomerInfo: true,
  },

  RegionController: {
    createRegion: true,
    getAllRegion: true,
  },

  PriceCategoryCylinderController: {
    createPrice: true,
    getPriceByID: true,
    getPriceByRegionID: true,
    getPriceByCategoryCylinderID: true,
    getAllPrice: true,
    updatePrice: true,
    getPriceLatest: true,
    cancelPrice: true,
  },

  OrderGasController: {
    createOrder: true,
    getProductOfOrder: true,
    changeOrderStatus: true,
    getOrderOfCustomer: true,
    destroyOrder: true,
    getOrderGasByCode: true,
    searchOrderGas: true,
    getAllOrderGas: true,
  },

  NotificationController: {
    createNotification: true,
    getNotificationById: true,
    getNotificationOfCustomer: true,
  },

  ProductTypeGEOController: {
    getAllProductTypeGEO: true,
    createProductTypeGEO: true,
  },

  UserTypeController: {
    createUserType: true,
    updateUserType: true,
    deleteUserType: true,
    getAllUserType: true,
    getUserTypeById: true,
    // 'getUserTypeBySystemPage':true,
    // 'getBySystemPage':true,
  },
  SystemPageController: {
    creteSystemPage: true,
    updateSystemPage: true,
    deleteSystemPage: true,
    getAllSystemPage: true,
    getSystemPageById: true,
    getSystemPageByLevel: true,
    //'aceessRight':['jwtAuthSystemUser']
    aceessRight: true,
  },

  SystemUserTypePageController: {
    createSystemUserTypePage: true,
    updateSystemUserTypePage: true,
    deleteSystemUserTypePage: true,
    getAllSystemUserTypePage: true,
    getSystemUserTypePageById: true,
  },

  SystemUserController: {
    createSystemUser: true,
    getSystemUserById: true,
    getAllSystemUser: true,
    updateSystemUser: true,
    deleteSystemUser: true,
    updatePasswordSystemUser: true,
    getAllSystemUserDeleted: true,
    login: true,
  },

  TransLocationInvoiceController: {
    getLocationBytransInvoiceDetailId: true,
    createTransLocationInvoice: true,
    getLocationByOrderGasId: true,
  },

  SendNotificationController: {
    SendNotification: true,
    SendNotificationForEachDevice: true,
    getNotificationsByAppName: true,
  },

  TransInvoiceDetailController: {
    getDetailOfTransInvoice: true,
    //'updateTransInvoiceDetail':true,
    //'getDetail': true
    getDetail: ["jwtAuthCarrier"],
    getTransInvoiceDetailOfCarrier: ["jwtAuthCarrier"],
    getOrderDeliveringOfCustomer: true,
    changeOrderStatus: true,
    getTransInvoiceDetailStatus456OfCarrier: ["jwtAuthCarrier"],
  },

  OrderShippingController: {
    getOrders: true,
    getOrdersOfFactory: true,
    getCompletedOrderAndCylinders: true,
    findOrder: true,
    approvalOrder: true,
    CancelOrder: true,
    setOrder: true,
    OrderApprovalRequest: true,
    getOrderShippingOfFactory: true,
    changeStatus: true,
    getHistoryNote: true,
    getOrdersOfGasTank: true,
  },

  OrderGasDetailSerialController: {
    createOrderScan: true,
    getOrderScanedOfOrderGasDetail: true,
  },

  SystemAppController: {
    createSystemApp: true,
  },

  FeedBackController: {
    SendFeedback: true,
    getAllFeedBack: true,
  },

  CylinderGasController: {
    searchCylinders: true,
    // 'searchCylinder': true,
    // 'getReqImport': true,
    // 'importCylinders': true,
    // 'create': true,
    updateCylinder: true,
    getAllCylinders: true,
    removeCylinder: true,
    //'getCylinderByHistory':true,
    // 'getCylinder': true,
  },
  SystemPageMenuController: {
    createPageMenu: true,
    updateSystemPageMenu: true,
    updateVisible: true,
    updateDashBoard: true,
    cancelSystemPageMenu: true,
  },

  ReviewController: {
    createReview: true,
    getAllReviewOfCarrier: true,
  },

  CylinderGasController: {
    create: true,
    updateCylinder: true,
    getInfomation: true,
    searchCylinder: true,
    searchCylinders: true,
  },

  CarrierController: {
    // 'createCarrier': ['jwtAuth'],
    // 'login': ['jwtAuthCarrier'],
    login: true,
    forgotPassword: true,
    resetPasswordByResetToken: true,
    changePassword: ["jwtAuthCarrier"],
    updateCarrierInfo: ["jwtAuthCarrier"],
    createCarrier: true,
  },

  CylinderInvoiceController: {
    createCylinderInvoice: true,
    getAllCylinderInvoice: true,
    getAllInvoiceOfCustomer: true,
  },
  CustomerGasController: {
    createCustomerGas: true,
    updateCustomerGas: true,
    //'deletedCustomerGas':true,
    getCustomerGasById: true,
    getAllCustomer: true,
  },
  SystemSettingController: {
    createSystemSetting: true,
    //'updateSystemSetting':true,
    //'deletedSystemSetting':true,
    getSystemSettingById: true,
    getAllSystemSetting: true,
  },

  WareHouseController: {
    createWareHouse: true,
    getAllWareHouse: true,
    getWareHouseById: true,
    updateWareHouse: true,
    deleteWareHouse: true,
    getWareHouseByUserId: true,
  },

  OrderTankController: {
    createOrderTank: true,
    getAllOrderTank: true,
    getOrderTankByOrderCode: true,
    getOrderTankByCustomerGasName: true,
    updateOrderTank: true,
    deleteOrderTank: true,
    getAllOrder: true,
    changeStatus: true,
    getHistoryNote: true,
  },
  ExportOrderController: {
    createExportOrder: true,
    updateExportOrder: true,
    deleteExportOrder: true,
    getExportOrderByID: true,
    getExportOrderId: true,
    getAllExportOrder: true,
    confirmationStatus: true,
    backStatus: true,
  },
  ShippingOrderLocationController: {
    createShippingOrderLocation: true,
    getLocationByShippingOrderDetailID: true,
    getLocationByOrderShippingID: true,
  },
  ImportOrderController: {
    createImportOrder: true,
    //'updateImportOrder':true,
    //'deleteImportOrder':true,
    getImportOrderByID: true,
    getImportOrderId: true,
    getAllImportOrder: true,
  },
  ExportOrderDetailController: {
    //'createExportOrderDetail':true,
    //'updateExportOrderDetail':true,
    //'deletedExportOrderDetail':true,
    getExportOrderDetailById: true,
    getAllExportOrderDetail: true,
    updateExportOrderDetail: true,
    getAllExportOrderOByOrderTankID: true,
  },
  TruckController: {
    createTruck: true,
    getListTruck: true,
    updateTruck: true,
  },

  WareHousePlanController: {
    createWareHousePlan: true,
    getAllWareHousePlanByWareHouseId: true,
    updateWareHousePlan: true,
    deleteWareHousePlan: true,
  },

  ManageImportExportController: {
    ManageImportExportWareHouse: true,
    manageWareHouse: true,
  },

  ExportOrderLocationController: {
    createExportOrderLocation: true,
    getLocationByExportOrderDetailID: true,
    getLocationByOrderTankID: true,
  },
  SupportController: {
    create: true,
    update: true,
    deleted: true,
    getSupportById: true,
    getAllSupport: true,
    uploadImage: true,
    removeImage: true,
    updateContent: true,
    deletedContent: true,
  },

  AssetControllerController: {
    loadFile: true,
    getName: true,
  },

  //trường
  // 'CategoryCylinderController':{
  // 	'*':'jwtAuthSystemUser'
  // },
  // 'SystemUserController':{
  // 	'*':'jwtAuthSystemUser',
  // 	'login':true,
  // },
  //  'SystemPageController':{
  //  	'*':['jwtAuthSystemUser'],
  //  },
  // 'ChecklistController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'CustomerController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'CustomerGasController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'CustomerGasPlanController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'CylinderCancelController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'CylinderController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'CylinderGasController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'CylinderImexController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'CylinderInvoiceController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'DuplicateCylinderController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'ExportOrderController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'ExportOrderDetailController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'ExportOrderLocationController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'ExportPlaceController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'FeedBackController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'HistoryController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'InspectionScheduleController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'LogController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'ManageImportExportController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'ManufactureController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'NotificationController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'OrderController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'OrderGasController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'OrderGasDetailSerialController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'OrderGasTruckController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'OrderShippingController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'OrderTankController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'PartnerController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'PriceCategoryCylinderController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'PriceHistoryController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'ProductTypeGEOController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'RegionController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'RentalPartnersController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'Report2Controller':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'ReportController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'ReviewController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'SendNotificationController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'ShippingCustomerDetailController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'ShippingOrderController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'ShippingOrderDetailController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'ShippingOrderLocationController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'ShippingOrderTurnbackController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'ShippingTextDetailController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'SystemAppController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'SystemPageMenuController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'SystemSettingController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'SystemUserController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'SystemUserTypePageController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'TransInvoiceController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'TransInvoiceDetailController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'TruckController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'WareHouseController':{
  // 	'*':'jwtAuthSystemUser',
  // },
  // 'WareHousePlanController':{
  // 	'*':'jwtAuthSystemUser',
  // },
};
