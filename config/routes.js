/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */
module.exports.routes = {
  //CloneCylinder
  "POST /cylinder/createCylinder": "CloneCylinderController.create",
  //HistoryCylinder
  "GET /history/getHistoryCylinder": "HistoryCylinderController.getHistory",
  "POST /history/createHistoryCylinder": "HistoryCylinderController.create",
  // OrderDetail
  "POST /orderDetail/createOrderDetail": "OrderDetailController.create",
  "GET /orderDetail/getOrderDetailByOrderGSId":
    "OrderDetailController.getOrderDetailByOrderGSId",
  "DELETE /orderDetail/delete": "OrderDetailController.delete",
  "PUT /orderDetail/update": "OrderDetailController.updateById",
  //Reason
  "POST /reason/createReason": "ReasonController.create",
  "GET /reason/showListReason": "ReasonController.list",
  "PUT /reason/updateReason": "ValveController.update",
  "DELETE /reason/deleteReason": "ReasonController.delete",
  // OrderGS
  "GET /orderGS/getOrderByCode": "OrderGSController.getOrderByCode",
  "POST /orderGS/createOrderGS": "OrderGSController.create",
  "GET /orderGS/getTypeCustomers": "OrderGSController.getTypeCustomer",
  "GET /orderGS/getStation": "OrderGSController.getStation",
  "GET /orderGS/getArea": "OrderGSController.getArea",
  "POST /orderGS/getAll": "OrderGSController.getAll",
  "GET /orderGS/showAddressUser": "OrderGSController.showAddressUser",
  "POST /orderGS/getAllIfIdIsCustomer":
    "OrderGSController.getAllIfIdIsCustomer",
  "POST /orderGS/getAllIfIdIsSupplier":
    "OrderGSController.getAllIfIdIsSupplier",
  "GET /orderGS/getStatus": "OrderGSController.getStatus",
  "GET /orderGS/Customers/getFromTo":
    "OrderGSController.getListScheduleOfCustomers",
  "GET /orderGS/Supplier/getFromTo":
    "OrderGSController.getListScheduleOfSuppliers",
  "PUT /orderGS/acpOrder": "OrderGSController.acpOrder",
  "PUT /orderGS/notacpOrder": "OrderGSController.notacpOrder",
  "PUT /orderGS/updateById": "OrderGSController.updateById",
  "DELETE /orderGS/deleteOrderGS": "OrderGSController.delete",
  // Valve
  "POST /valve/createValve": "ValveController.create",
  "GET /valve/showListValve": "ValveController.list",
  "PUT /valve/updateValve": "ValveController.update",
  "DELETE /valve/deleteValve": "ValveController.delete",
  // ColorGas
  "POST /colorGas": "ColorGasController.create",
  "GET /colorGas": "ColorGasController.list",
  "PUT /colorGas": "ColorGasController.update",
  "DELETE /colorGas": "ColorGasController.delete",

  "/": {
    view: "pages/homepage",
  },
  "GET /history/showList": "OrderGSHistoryController.ShowListShippingHistory",
  "GET /history/getOrderGSConfirmationHistory":
    "OrderGSHistoryController.getOrderGSConfirmationHistory",
  // user Supperadmin use route
  "POST /history/orderGSConfirmationHistoryRUD":
    "OrderGSHistoryController.orderGSConfirmationHistoryRUD",

  "POST /history/createShippingOrderGSID": "OrderGSHistoryController.create",
  "POST /cylinder/ExportCylinder": "CylinderController.ExportCylinder",

  // Truck Controller
  "/POST /Truck/createTruck": "TruckController.createTruck",
  "/POST /Truck/getListTruck": "TruckController.getListTruck",
  "/POST /Truck/updateTruck": "TruckController.updateTruck",
  // ExportOrderDetail Controller
  "/POST /ExportOrderDetail/deletedExportOrderDetail":
    "ExportOrderDetailController.deletedExportOrderDetail",
  "/POST /ExportOrderDetail/createExportOrderDetail":
    "ExportOrderDetailController.createExportOrderDetail",
  "/POST /ExportOrderDetail/updateExportOrderDetail":
    "ExportOrderDetailController.updateExportOrderDetail",
  "/POST /ExportOrderDetail/getExportOrderDetailById":
    "ExportOrderDetailController.getExportOrderDetailById",
  "/POST /ExportOrderDetail/getAllExportOrderDetail":
    "ExportOrderDetailController.getAllExportOrderDetail",
  "/POST /  ": "ExportOrderDetailController.updateExportOrderDetail",
  "GET /ExportOrderDetail/getAllExportOrderOByOrderTankID":
    "ExportOrderDetailController.getAllExportOrderOByOrderTankID",

  //ExportOrder Controller
  "/POST /ExportOrder/createExportOrder":
    "ExportOrderController.createExportOrder",
  "/POST /ExportOrder/updateExportOrder":
    "ExportOrderController.updateExportOrder",
  "/POST /ExportOrder/deleteExportOrder":
    "ExportOrderController.deleteExportOrder",
  "/POST /ExportOrder/getExportOrderByID":
    "ExportOrderController.getExportOrderByID",
  "/POST /ExportOrder/getExportOrderId":
    "ExportOrderController.getExportOrderId",
  "/POST /ExportOrder/getAllExportOrder":
    "ExportOrderController.getAllExportOrder",
  "/POST /ExportOrder/backStatus": "ExportOrderController.backStatus",
  "/POST /ExportOrder/confirmationStatus":
    "ExportOrderController.confirmationStatus",
  "GET /ExportOrder/getAllExportOrderINIT":
    "ExportOrderController.getAllExportOrderINIT",
  "/POST /ExportOrder/changeExportOrderStatus":
    "ExportOrderController.changeExportOrderStatus",

  "GET /ExportOrder/getDetailOfExportOrder":
    "ExportOrderDetailController.getDetailOfExportOrder",

  //SystemSetting Controller
  "/POST /SystemSetting/createSystemSetting":
    "SystemSettingController.createSystemSetting",
  "/POST /SystemSetting/updateSystemSetting":
    "SystemSettingController.updateSystemSetting",
  "/POST /SystemSetting/deletedSystemSetting":
    "SystemSettingController.deletedSystemSetting",
  "/POST /SystemSetting/getSystemSettingById":
    "SystemSettingController.getSystemSettingById",
  "/GET /SystemSetting/getAllSystemSetting":
    "SystemSettingController.getAllSystemSetting",
  //CustomerGas Controller
  "/POST /CustomerGas/createCustomerGas":
    "CustomerGasController.createCustomerGas",
  "/POST /CustomerGas/updateCustomerGas":
    "CustomerGasController.updateCustomerGas",
  "/POST /CustomerGas/deletedCustomerGas":
    "CustomerGasController.deletedCustomerGas",
  "/POST /CustomerGas/getCustomerGasById":
    "CustomerGasController.getCustomerGasById",
  "/GET /CustomerGas/getAllCustomer": "CustomerGasController.getAllCustomer",

  //Vinh

  "POST /cylinder/getCylinderDuplicateExcels":
    "CylinderController.getCylinderDuplicateExcels",
  "POST /cylinder/getCylinderDuplicate":
    "CylinderController.getCylinderDuplicate",
  "POST /history/turnBackCylinder": "HistoryController.turnBackCylinder",
  "POST /cylinder/getDuplicateCylinder":
    "DuplicateCylinderController.getDuplicateCylinder",
  "POST /ordertank/getOrderTankByCustomerGasId":
    "OrderTankController.getOrderTankByCustomerGasId",

  //CustomerGasPlan Controller
  "/POST /customerGasPlan/create": "CustomerGasPlanController.create",
  "/POST /customerGasPlan/update": "CustomerGasPlanController.update",
  "/POST /customerGasPlan/delete": "CustomerGasPlanController.delete",
  "/GET /customerGasPlan/getAll": "CustomerGasPlanController.getAll",
  "/POST /customerGasPlan/getById": "CustomerGasPlanController.getById",

  // SystemPageMenu Controller
  "/POST /  ": "SystemPageMenuController.createPageMenu",
  "/POST /SystemPageMenu/updateSystemPageMenu":
    "SystemPageMenuController.updateSystemPageMenu",
  "/POST /SystemPageMenu/updateVisible":
    "SystemPageMenuController.updateVisible",
  "/POST /SystemPageMenu/updateDashBoard":
    "SystemPageMenuController.updateDashBoard",
  "/POST /SystemPageMenu/cancelSystemPageMenu":
    "SystemPageMenuController.cancelSystemPageMenu",
  "/GET /SystemPageMenu/getAll": "SystemPageMenuController.getAll",
  // orderShipping Controller
  "/POST /orderShipping/approvalOrder": "OrderShippingController.approvalOrder",
  "/POST /orderShipping/CancelOrder": "OrderShippingController.CancelOrder",
  "/POST /orderShipping/setOrder": "OrderShippingController.setOrder",
  "/POST /orderShipping/OrderApprovalRequest":
    "OrderShippingController.OrderApprovalRequest",
  //SystemUserTypePage Controller
  "/POST /systemUserTypePage/createSystemUserTypePage":
    "SystemUserTypePageController.createSystemUserTypePage",
  "/POST /systemUserTypePage/updateSystemUserTypePage":
    "SystemUserTypePageController.updateSystemUserTypePage",
  "/POST /systemUserTypePage/deleteSystemUserTypePage":
    "SystemUserTypePageController.deleteSystemUserTypePage",
  "/POST /systemUserTypePage/getAllSystemUserTypePage":
    "SystemUserTypePageController.getAllSystemUserTypePage",
  "/POST /systemUserTypePage/getSystemUserTypePageById":
    "SystemUserTypePageController.getSystemUserTypePageById",

  //SystemPage Controller
  "/POST /systemPage/creteSystemPage": "SystemPageController.creteSystemPage",
  "/POST /systemPage/updateSystemPage": "SystemPageController.updateSystemPage",
  "/POST /systemPage/deleteSystemPage": "SystemPageController.deleteSystemPage",
  "/POST /systemPage/getAllSystemPage": "SystemPageController.getAllSystemPage",
  "/POST /systemPage/getSystemPageById":
    "SystemPageController.getSystemPageById",
  "/POST /systemPage/aceessRight": "SystemPageController.aceessRight",
  "/GET /systemPage/getSystemPageByLevel":
    "SystemPageController.getSystemPageByLevel",

  //UserType controller
  "/POST /userType/createUserType": "UserTypeController.createUserType",
  "POST /userType/updateUserType": "UserTypeController.updateUserType",
  "POST /userType/deleteUserType": "UserTypeController.deleteUserType",
  "POST /userType/getAllUserType": "UserTypeController.getAllUserType",
  "POST /userType/getUserTypeById": "UserTypeController.getUserTypeById",
  "POST /userType/getUserTypeBySystemPage":
    "UserTypeController.getUserTypeBySystemPage",
  "POST /userType/getBySystemPage": "UserTypeController.getBySystemPage",

  // User Controler
  "GET /user/getUserCustomer": "UserController.getUserCustomer",
  "/me": "UserController.me",
  "GET /user/info": "UserController.info",
  "POST /user/addUser": "UserController.addUser",
  "POST /user/getInforById": "UserController.getInforById",
  "POST /user/getListChilds": "UserController.getListChilds",

  // Cuong
  "/user/forgot": "UserController.forgotPassword",
  "/user/reset_password": "UserController.resetPasswordByResetToken",
  "POST /user/change_password": "UserController.changePassword",
  "POST /user/getAllChild": "UserController.getAllChild",
  "GET /user/getListGeneral": "UserController.getListGeneral",
  "GET /user/getListAgency": "UserController.getListAgency",
  "GET /user/getChildByType": "UserController.getChildByType",
  "GET /user/getAllUserOfParent": "UserController.getAllUserOfParent",
  "POST /user/getSubChilds": "UserController.getSubChilds",
  "GET /user/getFixerAndStation": "UserController.getFixerAndStation",

  "GET /user/getDestination": "UserController.getDestination",
  "GET /user/getAllFactory": "UserController.getAllFactory",
  "GET /user/getReportChilds": "UserController.getReportChilds",
  "POST /user/updateChild": "UserController.updateChild",
  "POST /user/getAllCompanyToFix": "UserController.getAllCompanyToFix",
  "POST /cylinder/searchCylinders": "CylinderController.searchCylinders",
  "POST /cylinder/createReqImport": "CylinderController.createReqImport",
  "POST /cylinder/getReqImport": "CylinderController.getReqImport",
  "POST /cylinder/confirmReqImport": "CylinderController.confirmReqImport",
  "POST /cylinder/removeReqImport": "CylinderController.removeReqImport",
  "GET /user/getListUserByTpe": "UserController.getListUserByTpe",
  "POST /cylinder/importCylinders": "CylinderController.importCylinders",
  "GET /manufacture/listManufactures": "ManufactureController.listManufactures",
  "GET /category/listCategories": "CategoryCylinderController.listCategories",
  "POST /cylinder/getDestinationBySerial":
    "TempController.getDestinationBySerial",

  "GET /user/getListUserByType": "UserController.getListUserByType",

  // List user by customerType
  "POST /user/getListByCustomerType": "UserController.getListByCustomerType",
  //
  "POST /cylinder/checkExport": "DuplicateCylinderController.checkExport",
  //

  // Hồi lưu bình đầy
  "POST /cylinder/getInfomationReturn":
    "CylinderController.getInfomationReturn",
  "POST /cylinder/returnCylinders": "HistoryController.returnCylinders",

  // Máy PDA
  "GET /cylinder/forPDA": "CylinderController.cylindersForPDA",
  "GET /cylinder/exportForPDA": "CylinderController.cylindersExportForPDA",
  "GET /cylinder/importForPDA": "CylinderController.cylindersImportForPDA",
  "POST /cylinder/checkCylinderForPDA":
    "CylinderController.checkCylinderForPDA",

  // hieu
  //'POST /user/uploadFile' : 'UserController.uploadFile',
  "POST /user/updateInformationUser": "UserController.updateInformationUser",
  "POST /returnGas": "UserController.returnGasS",
  "POST /updateReturnGas": "UserController.updateReturnGas",
  "GET /getListReturnGas": "UserController.getListReturnGas",
  "POST /getBrandInformation": "UserController.getBrandInformation",

  "POST /user/getAvatar": "UserController.getAvatar",
  "POST /user/getDriver": "UserController.getDriver",
  "POST /user/getDriverImport": "UserController.getDriverImport",
  "POST /user/listNameDriver": "UserController.listNameDriver",
  "POST /user/getSignature": "UserController.getSignature",

  // Cylinder Controllers
  /*'/cylinder': 'CylinderController.index',*/
  "POST /cylinder/import": "CylinderController.import",
  "POST /cylinder/update_place_status": "CylinderController.upPlaceStatus",
  "POST /cylinder/create": "CylinderController.create",
  "POST /cylinder/getInfomation": "CylinderController.getInfomation",
  "POST /cylinder/updateCylinder": "CylinderController.updateCylinder",
  "GET /cylinder/searchCylinder": "CylinderController.searchCylinder",
  "POST /cylinder/updateVerifiedDates":
    "CylinderController.updateVerifiedDates",
  "POST /cylinder/getInfomationExcel": "CylinderController.getInfomationExcel",
  "POST /cylinder/updateCylinderInformationExcel":
    "CylinderController.updateCylinderInformationExcel",
  "POST /cylinder/importFromSubsidiary":
    "CylinderController.importFromSubsidiary",
  "POST /cylinder/createDuplicate":
    "DuplicateCylinderController.createDuplicate",
  "POST /cylinder/importDuplicateFromSubsidiary":
    "DuplicateCylinderController.importDuplicateFromSubsidiary",
  "POST /cylinder/importcylinder": "CylinderController.importcylinder",
  "POST /cylinder/autoCreateCylinder": "CylinderController.autoCreateCylinder",
  "GET /cylinder/getListCylindersAutoInit":
    "CylinderController.getListCylindersAutoInit",

  // Duplicate Controllers
  "POST /cylinder/ExportDuplicateCylinder":
    "DuplicateCylinderController.ExportDuplicateCylinder",
  "POST /cylinder/ImportDuplicateCylinder":
    "DuplicateCylinderController.ImportDuplicateCylinder",
  "POST /cylinder/getExportPlace": "DuplicateCylinderController.getExportPlace",
  "POST /cylinder/importDupCylinder":
    "DuplicateCylinderController.importDupCylinder",

  // History Controllers
  "POST /history/importCylinder": "HistoryController.importCylinder",
  "GET /history/sortHistoryImport": "HistoryController.sortHistoryImport",
  "GET /history/sortHistoryExport": "HistoryController.sortHistoryExport",
  // 'GET /history/sortHistoryImport10': 'HistoryController.sortHistoryImport10',
  // 'GET /history/sortHistoryExport10': 'HistoryController.sortHistoryExport10',
  "POST /history/importCylinderSkipScanWhenExport":
    "HistoryController.importCylinderSkipScanWhenExport",
  "POST /history/createExportOrderHistory":
    "HistoryController.createExportOrderHistory",
  "GET /history/getHistoriesByType": "HistoryController.getHistoriesByType",
  "GET /history/getCylinderHistoryExcels":
    "HistoryController.getCylinderHistoryExcels",

  // Manufature Controllers
  "POST /manufacture/create": "ManufactureController.create",
  "GET /manufacture/find": "ManufactureController.find",
  "GET /manufacture/list": "ManufactureController.list",
  "GET /manufacture/ShowList": "ManufactureController.getAllList",
  "POST /manufacture/updateBrandInformation":
    "ManufactureController.updateBrandInformation",
  "POST /manufacture/listManufacture": "ManufactureController.listManufacture",

  //Report Controllers
  "POST /report/reportCylinder": "ReportController.reportCylinder",
  "GET /report/getCustomers": "ReportController.getCustomers",
  "POST /report/getCustomerReport": "ReportController.getCustomerReport",
  "POST /report/getReportFilters": "ReportController.getReportFilters",
  "POST /report/reportChartData": "ReportController.reportChartData",
  "GET /report/getInventoryInfo": "ReportController.getInventoryInfo",
  "POST /report/getTurnBackCylinders": "ReportController.getTurnBackCylinders",
  "POST /report/getTurnBackInfo": "ReportController.getTurnBackInfo",
  "POST /report/getChildAndNumberImportByDateTime:":
    "ReportController.getChildAndNumberImportByDateTime",
  "GET /report/getCylinderHistoryExcels": "ReportController.getCylinderExcels",
  "POST /report/getReportExcels": "ReportController.getReportExcels",
  "POST /report/getTopExport": "ReportController.getTopExport",

  // Report Controllers 2
  "GET /reportVer2/getStatistic": "Report2Controller.getStatistic",
  "GET /reportVer2/getAggregate": "Report2Controller.getAggregate",
  "GET /reportVer2/getExportChart": "Report2Controller.getExportChart",
  "GET /reportVer2/getAggregateByCylindersCondition":
    "Report2Controller.getAggregateByCylindersCondition",
  "GET /reportVer2/getTotalCylinder": "Report2Controller.getTotalCylinder",

  // hieu
  // 'POST /report/checkInventory': 'ReportController.checkInventory',
  "POST /report/getListChild": "ReportController.getListChild",

  //Price History
  "GET /priceHistory": "PriceHistoryController.getHistoryPrice",

  //Partner Controller
  "POST /partner/relationship": "PartnerController.createRelationship",
  "GET /partner/relationship": "PartnerController.getListRelationship",
  "GET /partner/getFixersRelationship":
    "PartnerController.getAllFixerInRelationship",
  "POST /partner/getAllFixerM": "PartnerController.getAllFixerM",

  //ExportPlace Controller
  //'/exportPlace': 'ExportPlaceController'

  // Inspector
  "POST /inspector/checklist": "ChecklistController.setChecklist",
  "POST /inspector/setMonthlyChecklist":
    "ChecklistController.setMonthlyChecklist",
  "POST /inspector/getInspector": "UserController.getInspector",
  "POST /inspector/getStaff": "UserController.getStaff",
  "POST /inspector/getListSchedule":
    "InspectionScheduleController.getListSchedule",

  //
  "POST /schedule/createSchedule":
    "InspectionScheduleController.createSchedule",
  "POST /schedule/getSchedule": "InspectionScheduleController.getSchedule",
  "POST /schedule/getListSchedule":
    "InspectionScheduleController.getListSchedule",

  // Order
  // 'POST /ordsetOrderer/': 'OrderController.setOrder',
  // 'POST /order/getOrders': 'OrderController.getOrders',
  // 'POST /order/getOrdersOfFactory': 'OrderController.getOrdersOfFactory',
  // 'POST /order/changeOrderStatus': 'OrderController.changeOrderStatus',

  // Test
  "POST /test/getAllHistoryOfCylinder":
    "TestController.getAllHistoryOfCylinder",
  "POST /test/getHistoryByID": "TestController.getHistoryByID",
  "POST /test/Test": "CylinderImexController.Test",
  "POST /test/testBugExcel": "TestController.testBugExcel",
  "POST /test/test123": "TestController.test123",

  // RentalPartners
  "POST /rentalPartners/createRentalPartners":
    "RentalPartnersController.createRentalPartners",

  // CategoryCylinder
  "POST /categoryCylinder/create": "CategoryCylinderController.create",
  "GET /categoryCylinder/list": "CategoryCylinderController.list",
  "GET /categoryCylinder/getAll": "CategoryCylinderController.getAll",
  "PUT /categoryCylinder/updateById": "CategoryCylinderController.update",
  "DELETE /categoryCylinder/deleteById": "CategoryCylinderController.delete",
  // CylinderCancel
  "POST /cylinderCancel/create": "CylinderCancelController.create",

  // CylinderImex
  "GET /imex/getExport": "CylinderImexController.getExport",
  "GET /imex/getCurrentInventory": "CylinderImexController.getCurrentInventory",
  "GET /imex/getStatistics": "CylinderImexController.getStatistics",
  "GET /imex/searchCylindersImex": "CylinderImexController.searchCylindersImex",
  "POST /imex/detailCylindersImex":
    "CylinderImexController.detailCylindersImex",
  "GET /imex/locationCylindersImex":
    "CylinderImexController.locationCylindersImex",
  "POST /imex/getDetailCylindersImexExcels":
    "CylinderImexController.getDetailCylindersImexExcels",

  // Region Company
  "POST /regionCompany/createRegion": "UserController.createRegion",
  "GET /regionCompany/getListRegion": "UserController.getListRegion",

  // Station
  "POST /station/createStation": "UserController.createStation",
  "GET /station/getListStation": "UserController.getListStation",
  "GET /station": "UserController.getAllStation",

  // Customer
  "POST /customer/info": "CustomerController.createInfo",
  "POST /customer/update": "CustomerController.updateAddress",
  "POST /customer/checkCustomerIsExist":
    "CustomerController.checkCustomerIsExist",
  "POST /customer/loginProvider": "CustomerController.loginProvider",
  "POST /customer/getCustomerById": "CustomerController.getCustomerById",
  "POST /customer/updateCustomerInfo": "CustomerController.updateCustomerInfo",

  // Region
  "POST /region/create": "RegionController.createRegion",
  "GET /region/getAllRegion": "RegionController.getAllRegion",

  // PriceCategoryCylinder
  "POST /price/create": "PriceCategoryCylinderController.createPrice",
  "POST /price/getPriceByID": "PriceCategoryCylinderController.getPriceByID",
  "POST /price/getPriceByRegionID":
    "PriceCategoryCylinderController.getPriceByRegionID",
  "POST /price/getPriceByCategoryCylinderID":
    "PriceCategoryCylinderController.getPriceByCategoryCylinderID",
  "GET /price/getAllPrice": "PriceCategoryCylinderController.getAllPrice",
  "POST /price/updatePrice": "PriceCategoryCylinderController.updatePrice",
  "POST /price/getPriceLatest":
    "PriceCategoryCylinderController.getPriceLatest",
  "POST /price/cancelPrice": "PriceCategoryCylinderController.cancelPrice",

  // OrderGas
  "POST /ordergas/create": "OrderGasController.createOrder",
  "POST /ordergas/getProductOfOrder": "OrderGasController.getProductOfOrder",
  "POST /ordergas/changeOrderStatus": "OrderGasController.changeOrderStatus",
  "POST /ordergas/getOrderOfCustomer": "OrderGasController.getOrderOfCustomer",
  "POST /ordergas/destroyOrder": "OrderGasController.destroyOrder",
  "GET /ordergas/getOrderGasByCode": "OrderGasController.getOrderGasByCode",
  "GET /ordergas/searchOrderGas": "OrderGasController.searchOrderGas",
  "GET /ordergas/getAllOrderGas": "OrderGasController.getAllOrderGas",

  // Notification
  "POST /notification/create": "NotificationController.createNotification",
  "POST /notification/getNotificationById":
    "NotificationController.getNotificationById",
  "POST /notification/getNotificationOfCustomer":
    "NotificationController.getNotificationOfCustomer",

  // Order Gas Truck
  "POST /ordergastruck/create": "OrderGasTruckController.createOrder",
  "POST /ordergastruck/changeOrderStatus":
    "OrderGasTruckController.changeOrderStatus",
  "POST /ordergastruck/getOrderOfUser":
    "OrderGasTruckController.getOrderOfUser",
  "POST /ordergastruck/getOrderOfUserCreate":
    "OrderGasTruckController.getOrderOfUserCreate",
  "POST /ordergastruck/destroyOrder": "OrderGasTruckController.destroyOrder",

  // Product Type GEO
  "GET /geo/getAllProductTypeGEO":
    "ProductTypeGEOController.getAllProductTypeGEO",
  "POST /geo/createProductTypeGEO":
    "ProductTypeGEOController.createProductTypeGEO",

  // Carrier
  "POST /carrier/createCarrier": "CarrierController.createCarrier",
  "POST /carrier/login": "CarrierController.login",
  "POST /carrier/getCarrierById": "CarrierController.getCarrierById",
  "GET /carrier/getAllCarrier": "CarrierController.getAllCarrier",
  "POST /carrier/updateCarrier": "CarrierController.updateCarrier",
  "POST /carrier/cancelCarrier": "CarrierController.cancelCarrier",
  "POST /carrier/getCarrierByUserId": "CarrierController.getCarrierByUserId",
  "POST /carrier/change_password": "CarrierController.changePassword",
  // 'POST /carrier/reset_password': 'CarrierController.resetPasswordByResetToken',
  // 'POST /carrier/forgot': 'CarrierController.forgotPassword',
  "POST /carrier/updateCarrierInfo": "CarrierController.updateCarrierInfo",
  "POST /carrier/adminChangePassword": "CarrierController.adminChangePassword",

  // TransInvoice
  "POST /transinvoice/createTransInvoice":
    "TransInvoiceController.createTransInvoice",
  "POST /transinvoice/getTransInvoiceById":
    "TransInvoiceController.getTransInvoiceById",
  "GET /transinvoice/getAllTransInvoiceOfCarrier":
    "TransInvoiceController.getAllTransInvoiceOfCarrier",
  "POST /transinvoice/updateTransInvoice":
    "TransInvoiceController.updateTransInvoice",
  "POST /transinvoice/cancelTransInvoice":
    "TransInvoiceController.cancelTransInvoice",
  "GET /transinvoice/getAllTransInvoice":
    "TransInvoiceController.getAllTransInvoice",

  // TransInvoiceDetail
  "POST /transinvoicedetail/updateTransInvoiceDetail":
    "TransInvoiceDetailController.updateTransInvoiceDetail",
  "GET /transinvoicedetail/getDetailOfTransInvoice":
    "TransInvoiceDetailController.getDetailOfTransInvoice",
  "POST /transinvoicedetail/cancelTransInvoiceDetail":
    "TransInvoiceDetailController.cancelTransInvoiceDetail",
  "GET /transinvoicedetail/getDetail": "TransInvoiceDetailController.getDetail",
  "GET /transinvoicedetail/getTransInvoiceDetailOfCarrier":
    "TransInvoiceDetailController.getTransInvoiceDetailOfCarrier",
  "GET /transinvoicedetail/getOrderDeliveringOfCustomer":
    "TransInvoiceDetailController.getOrderDeliveringOfCustomer",
  "POST /transinvoicedetail/changeOrderStatus":
    "TransInvoiceDetailController.changeOrderStatus",
  "GET /transinvoicedetail/getTransInvoiceDetailStatus456OfCarrier":
    "TransInvoiceDetailController.getTransInvoiceDetailStatus456OfCarrier",

  // TransLocationInvoice
  "POST /translocationinvoice/createTransLocationInvoice":
    "TransLocationInvoiceController.createTransLocationInvoice",
  "GET /translocationinvoice/getLocationBytransInvoiceDetailId":
    "TransLocationInvoiceController.getLocationBytransInvoiceDetailId",
  "GET /translocationinvoice/getLocationByOrderGasId":
    "TransLocationInvoiceController.getLocationByOrderGasId",

  //Phu
  //System User
  "POST /systemuser/createSystemUser": "SystemUserController.createSystemUser",
  "GET /systemuser/getAllSystemUser": "SystemUserController.getAllSystemUser",
  "POST /systemuser/updateSystemUser": "SystemUserController.updateSystemUser",
  "POST /systemuser/deleteSystemUser": "SystemUserController.deleteSystemUser",
  "POST /systemuser/updatePasswordSystemUser":
    "SystemUserController.updatePasswordSystemUser",
  "POST /systemuser/getAllSystemUserDeleted":
    "SystemUserController.getAllSystemUserDeleted",
  "/POST /systemuser/login": "SystemUserController.login",

  // CylinderGas
  "POST /cylindergas/searchCylinders": "CylinderGasController.searchCylinders",
  "POST /cylindergas/create": "CylinderGasController.create",
  "POST /cylindergas/getInfomation": "CylinderGasController.getInfomation",
  "POST /cylindergas/updateCylinder": "CylinderGasController.updateCylinder",
  "GET /cylindergas/searchCylinder": "CylinderGasController.searchCylinder",
  "GET /cylindergas/getAllCylinders": "CylinderGasController.getAllCylinders",
  "GET /cylindergas/removeCylinder": "CylinderGasController.removeCylinder",
  "GET /cylindergas/getCylinder": "CylinderGasController.getCylinder",

  //SendNotification
  "POST /SendNotification": "SendNotificationController.SendNotification",
  "POST /SendNotificationForEachDevice":
    "SendNotificationController.SendNotificationForEachDevice",
  "GET /getNotificationsByAppName":
    "SendNotificationController.getNotificationsByAppName",

  // ShippingOrder
  "POST /shippingorder/create": "ShippingOrderController.createShippingOrder",
  "POST /shippingorder/getShippingOrderById":
    "ShippingOrderController.getShippingOrderById",
  "GET /shippingorder/getAllShippingOrder":
    "ShippingOrderController.getAllShippingOrder",
  "POST /shippingorder/getShippingOrderByDriver":
    "ShippingOrderController.getShippingOrderByDriver",
  "POST /shippingorder/updateShippingOrder":
    "ShippingOrderController.updateShippingOrder",
  "POST /shippingorder/updateNote": "ShippingOrderController.updateNote",
  "GET /shippingorder/getAllShippingOrderINIT":
    "ShippingOrderController.getAllShippingOrderINIT",

  // ShippingOrderDetail
  "POST /shippingorderdetail/updateShippingOrderDetail":
    "ShippingOrderDetailController.updateShippingOrderDetail",
  "POST /shippingorderdetail/getShippingOrderDetailOfShippingOrder":
    "ShippingOrderDetailController.getShippingOrderDetailOfShippingOrder",
  "POST /shippingorderdetail/cancelShippingOrderDetail":
    "ShippingOrderDetailController.cancelShippingOrderDetail",
  "POST /shippingorderdetail/updateProvince":
    "ShippingOrderDetailController.updateProvince",
  "GET /shippingorderdetail/getOrderByShippingOrderID":
    "ShippingOrderDetailController.getOrderByShippingOrderID",
  "GET /shippingorderdetail/getDetailOfShippingOrder":
    "ShippingOrderDetailController.getDetailOfShippingOrder",
  "GET /shippingorderdetail/getDetail":
    "ShippingOrderDetailController.getDetail",
  // 'GET /shippingorderdetail/getOrderDeliveringOfCustomer': 'ShippingOrderDetailController.getOrderDeliveringOfCustomer',

  // ShippingCustomerDetail
  "POST /shippingcustomerdetail/updateShippingCustomerDetail":
    "ShippingCustomerDetailController.updateShippingCustomerDetail",
  "POST /shippingcustomerdetail/getShippingCustomerDetailOfShippingOrder":
    "ShippingCustomerDetailController.getShippingCustomerDetailOfShippingOrder",
  "POST /shippingcustomerdetail/cancelShippingCustomerDetail":
    "ShippingCustomerDetailController.cancelShippingCustomerDetail",
  "POST /shippingcustomerdetail/updateNumberCylinders":
    "ShippingCustomerDetailController.updateNumberCylinders",

  // ShippingTextDetail
  "POST /shippingtextdetail/updateShippingTextDetail":
    "ShippingTextDetailController.updateShippingTextDetail",
  "POST /shippingtextdetail/getShippingTextDetailOfShippingOrder":
    "ShippingTextDetailController.getShippingTextDetailOfShippingOrder",
  "POST /shippingtextdetail/cancelShippingTextDetail":
    "ShippingTextDetailController.cancelShippingTextDetail",

  // ShippinngOrderTurnback
  "POST /shippingOrder/return":
    "ShippingOrderTurnbackController.returnCylinders",

  // OrderShipping
  "GET /order/getOrderDetailById": "OrderShippingController.getOrderDetailById",
  "POST /order/setOrder": "OrderShippingController.setOrder",
  "POST /order/getOrders": "OrderShippingController.getOrders",

  "POST /order/getOrdersOfFactory":
    "OrderShippingController.getOrdersOfFactory",
  "POST /order/getOrdersRelateToUser":
    "OrderShippingController.getOrdersRelateToUser",
  "POST /order/changeOrderStatus": "OrderShippingController.changeOrderStatus",
  "POST /order/getCylinderInformationForOrder":
    "OrderShippingController.getCylinderInformationForOrder",
  "POST /order/getOrderHistories": "OrderShippingController.getOrderHistories",
  "POST /order/getDetailExportOrder":
    "OrderShippingController.getDetailExportOrder",
  "GET /order/getCompletedOrderAndCylinders":
    "OrderShippingController.getCompletedOrderAndCylinders",
  "GET /order/findOrder": "OrderShippingController.findOrder",
  "GET /data/getActionData": "OrderShippingController.getActionData",
  "GET /print/getTurnbacktDataPrint":
    "OrderShippingController.getTurnbacktDataPrint",
  "POST /print/getExportDataPrint":
    "OrderShippingController.getExportDataPrint",
  "GET /order/getOrderShippingOfFactory":
    "OrderShippingController.getOrderShippingOfFactory",
  "POST /order/changeStatus": "OrderShippingController.changeStatus",
  "GET /order/getHistoryNote": "OrderShippingController.getHistoryNote",
  "POST /order/getOrdersOfGasTank":
    "OrderShippingController.getOrdersOfGasTank",

  //FeedBack
  "POST /feedback/SendFeedback": "FeedBackController.SendFeedback",
  "GET /feedback/getAllFeedBack": "FeedBackController.getAllFeedBack",

  // Order Scan
  "POST /orderscan/createOrderScan":
    "OrderGasDetailSerialController.createOrderScan",
  "GET /orderscan/getOrderScanedOfOrderGasDetail":
    "OrderGasDetailSerialController.getOrderScanedOfOrderGasDetail",

  //SystemApp
  "POST /systemapp/createSystemApp": "SystemAppController.createSystemApp",

  //Review
  "POST /review/createReview": "ReviewController.createReview",
  "GET /review/getAllReviewOfCarrier": "ReviewController.getAllReviewOfCarrier",

  // CylinderInvoice
  "POST /cylinderinvoice/createCylinderInvoice":
    "CylinderInvoiceController.createCylinderInvoice",
  "GET /cylinderinvoice/getAllCylinderInvoice":
    "CylinderInvoiceController.getAllCylinderInvoice",
  "GET /cylinderinvoice/getAllInvoiceOfCustomer":
    "CylinderInvoiceController.getAllInvoiceOfCustomer",

  //WareHouse
  "POST /warehouse/createWareHouse": "WareHouseController.createWareHouse",
  "GET /warehouse/getAllWareHouse": "WareHouseController.getAllWareHouse",
  "POST /warehouse/getWareHouseById": "WareHouseController.getWareHouseById",
  "POST /warehouse/updateWareHouse": "WareHouseController.updateWareHouse",
  "POST /warehouse/deleteWareHouse": "WareHouseController.deleteWareHouse",
  "POST /warehouse/getWareHouseByUserId":
    "WareHouseController.getWareHouseByUserId",

  //OrderTank
  "POST /ordertank/createOrderTank": "OrderTankController.createOrderTank",
  "GET /ordertank/getAllOrderTank": "OrderTankController.getAllOrderTank",
  "POST /ordertank/getOrderTankByOrderCode":
    "OrderTankController.getOrderTankByOrderCode",
  "POST /ordertank/getOrderTankByCustomerGasName":
    "OrderTankController.getOrderTankByCustomerGasName",
  "POST /ordertank/updateOrderTank": "OrderTankController.updateOrderTank",
  "POST /ordertank/deleteOrderTank": "OrderTankController.deleteOrderTank",
  "POST /ordertank/changeOrderTankStatus":
    "OrderTankController.changeOrderTankStatus",
  "GET /ordertank/getAllOrder": "OrderTankController.getAllOrder",
  "POST /ordertank/changeStatus": "OrderTankController.changeStatus",
  "GET /ordertank/getHistoryNote": "OrderTankController.getHistoryNote",

  //ShippingOrderLocation
  "POST /shippingorderlocation/createShippingOrderLocation":
    "ShippingOrderLocationController.createShippingOrderLocation",
  "GET /shippingorderlocation/getLocationByShippingOrderDetailID":
    "ShippingOrderLocationController.getLocationByShippingOrderDetailID",
  "GET /shippingorderlocation/getLocationByOrderShippingID":
    "ShippingOrderLocationController.getLocationByOrderShippingID",

  //WareHousePlan
  "POST /warehouseplan/createWareHousePlan":
    "WareHousePlanController.createWareHousePlan",
  "GET /warehouseplan/getAllWareHousePlanByWareHouseId":
    "WareHousePlanController.getAllWareHousePlanByWareHouseId",
  "POST /warehouseplan/updateWareHousePlan":
    "WareHousePlanController.updateWareHousePlan",
  "POST /warehouseplan/deleteWareHousePlan":
    "WareHousePlanController.deleteWareHousePlan",

  //ImportExportWareHouse
  "POST /importexport/ManageImportExportWareHouse":
    "ManageImportExportController.ManageImportExportWareHouse",
  "POST /importexport/manageWareHouse":
    "ManageImportExportController.manageWareHouse",

  //ExportOrderLocation
  "POST /exportorderlocation/createExportOrderLocation":
    "ExportOrderLocationController.createExportOrderLocation",
  "GET /exportorderlocation/getLocationByExportOrderDetailID":
    "ExportOrderLocationController.getLocationByExportOrderDetailID",
  "GET /exportorderlocation/getLocationByOrderTankID":
    "ExportOrderLocationController.getLocationByOrderTankID",

  //Support
  "POST /support/create": "SupportController.create",
  "POST /support/update": "SupportController.update",
  "POST /support/deleted": "SupportController.deleted",
  "POST /support/getSupportById": "SupportController.getSupportById",
  "POST /support/getAllSupport": "SupportController.getAllSupport",
  "POST /support/uploadImage": "SupportController.uploadImage",
  "POST /support/removeImage": "SupportController.removeImage",
  "POST /support/updateContent": "SupportController.updateContent",
  "POST /support/deletedContent": "SupportController.deletedContent",

  // Area
  "POST /area": "AreaController.create",
  "GET /area": "AreaController.list",
  "PUT /area": "AreaController.update",
  "DELETE /area": "AreaController.delete",

  // Test
  // 'GET /download' : 'AssetController.loadFile',
  // 'GET /getName' : 'AssetController.getName'
};
