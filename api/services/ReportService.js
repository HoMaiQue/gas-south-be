const USER_TYPE = require('../constants/UserTypes');
const USER_ROLE= require('../constants/UserRoles');
const PartnerServices = require('../services/PartnerService');
const _ = require('lodash');
const moment = require('moment');
const e = require('express');
// const User = require('../models/User');

module.exports = {
  /**
 * Action for getChartData
 * @param req
 * @param res
 * @returns {*}
 */
  getChartData: async function(user, req, res) {
    let data = {
      pieChartData: {},
      barChartData: []
    };
    const year = req.body.year;
    if(!year) { res.ok(Utils.jsonErr(error));}

    const daysOfYear = getFirstAndLastDayOfMonth(year);

    try {
      let allChildSales = await getAllAgencyChild(user.id);
      let childIds = await allChildSales.map(child => {
        return child.id;
      });
      data.barChartData = await Promise.all(daysOfYear.map(async item => {
        let numberSale = 0;
        await Promise.all(childIds.map(async id => {
          const credential = {
            from: id,
            type: 'SALE',
            createdAt: {'>=': item.start, '<': item.end}
          };
          const reportMonth = await History.find({where: credential});
          await reportMonth.map(history => {
            numberSale += history.numberOfCylinder;
          });
        }));

        return numberSale;
      }));
    } catch (error) {
      res.ok(Utils.jsonErr(error));
    }

    const dataChilds = await this.getReportForFactory(user, req, res);
    data.pieChartData = {
      generals: dataChilds.totalGeneral,
      agencies: dataChilds.totalAgency,
    };
    return data;
  },

  getReportForFactory: async function(user, req, res) {
    const userType = user.userType;
    let data = {
      totalExportToStation: 0,
      totalExportToGeneral: 0,
      totalExportToAgency: 0,
      totalExportToCustomer: 0,
      totalStation: 0,
      totalGeneral: 0,
      totalAgency:0,
      totalCreatedCylinder:0,
      totalImportCylinder:0,
      totalImportFromStation:0,
      totalTurnBack:0,
      totalExports:0,
      totalSales:0,
      totalExportSale: 0,
      totalExportRent: 0,
      totalImportSale: 0,
      totalImportRent: 0,
      totalImportFixer: 0,
      totalExportFixer:0,
      reveneu:0
    };

    let begin = !req.body.begin ? moment.utc() : moment.utc(req.body.begin);
    let end = !req.body.end ? moment.utc().add(1, 'days') : moment.utc(req.body.end).add(1, 'days');
    //let begin = !req.body.begin ? moment.utc() : new Date(req.body.begin);
    //let end = !req.body.end ? moment.utc().add(1, 'days') : new Date(req.body.end);
    // Check if user not send begin and end, we get all data
    let credential = {
      //allowReport: true
    };
    if(!(!req.body.begin && !req.body.end)) {
      //If same time we add 1 days to end
      if(begin.diff(end) === 0) {end = end.add(1, 'days');}
      credential.createdAt = {'>=': begin.toISOString(), '<': end.toISOString()};
    }

    let page = parseInt(req.body.page);
    if(!page) {page = 1;}

    let limit =  parseInt(req.body.limit);
    if(!limit) {limit = 10;}

    const skip = limit * (page - 1);

    try {
      //Count number record export of user with role
      //if(historyType === 'EXPORT') {
      let exportCredential =  Object.assign({
        from: user.id,
        type: 'EXPORT'
      }, credential);
      const histories = await History.find({where: exportCredential}).populate('to').populate('cylinders').populate('toArray');
      histories.map(item => {
        const numberOfCylinder = item.cylinders.length;
        const totalExport = parseInt(numberOfCylinder);
        data.totalExports+=totalExport;
        if(item.typeForPartner) {
          switch(item.typeForPartner) {
            case 'BUY':
              data.totalExportSale +=  totalExport;
              break;
            case 'RENT':
              data.totalExportRent +=  totalExport;
              break;
            case 'TO_FIX':
              data.totalExportFixer += totalExport;
              break;
          }
        }
        if(!item.toArray || item.toArray.length === 0) {
          if(item.customer) {
            data.totalExportToCustomer = ++data.totalExportToCustomer;
          } else {
            if(item.to!==null){data = calculateExport(userType, item.to.userType, numberOfCylinder, data, item.typeForPartner);}
          }
        } else {
          const arrayDestinationExport = item.toArray;
          const arrayCylinderExport = item.numberArray;
          if(!arrayCylinderExport) {
            console.log('HEADER');
          }
          if(!!arrayCylinderExport && !!arrayCylinderExport) {
            for(let i = 0; i < arrayDestinationExport.length; i++) {
              data = calculateExport(userType, arrayDestinationExport[i].userType, arrayCylinderExport[i], data, item.typeForPartner);
            }
          }
        }
      });

      //}

      //if(historyType === 'IMPORT') {
      data.totalCreatedCylinder= await Cylinder.count({manufacturedBy: user.id});

      let importCredential = Object.assign({
        to: user.id,
        type: 'IMPORT'
      }, credential);
      // const totalImportFromStations = await History.find({where: importCredential});
      // for(let i=0; i<totalImportFromStations.length; i++)
      // {
      //   data.totalImportFromStation+=parseInt(totalImportFromStations[i].numberOfCylinder);
      // }
      const totalImport = await History.find({where: importCredential});
      totalImport.map(history => {
        const numberOfCylinder = history.numberOfCylinder;
        const totalImport = parseInt(numberOfCylinder);
        if(history.typeForPartner) {
          switch(history.typeForPartner) {
            case 'BUY':
              data.totalImportSale +=  totalImport;
              break;
            case 'RENT':
              data.totalImportRent += totalImport;
              break;
            case 'TO_FIX':
              data.totalImportFixer += totalImport;
              break;
          }
        }
        data.totalImportCylinder += totalImport;
      });

      let turnbackCredential = Object.assign({
        to: user.id,
        type: 'TURN_BACK'
      }, credential);
      const totalTurnbacks = await History.find({where: turnbackCredential});
      for(let i=0; i<totalTurnbacks.length; i++)
      {
        data.totalTurnBack+=parseInt(totalTurnbacks[i].numberOfCylinder);
      }

      console.log(user);
      if(user.userType=== USER_TYPE.Agency && user.userRole !== 'SuperAdmin')
      {
        if(user.userType=== USER_TYPE.Agency && user.userRole === 'Owner')
        {
          let saleCredential = Object.assign({
            from: user.isChildOf,
            type: 'SALE'
          }, credential);
          const totalSalesForOwner = await History.find({where: saleCredential});

          for(let i=0; i<totalSalesForOwner.length; i++)
          {
            data.reveneu+=Number(totalSalesForOwner[i].amount);
            data.totalSales+=Number(totalSalesForOwner[i].numberOfCylinder);
          }
        }
        else{
          let saleCredential = Object.assign({
            from: user.isChildOf,
            saler:user.id,
            type: 'SALE'
          }, credential);
          const totalSaleForSale = await History.find({where: saleCredential});
          for(let i=0; i<totalSaleForSale.length; i++)
          {
            data.reveneu+=Number(totalSaleForSale[i].amount);
            data.totalSales+=Number(totalSaleForSale[i].numberOfCylinder);
          }
        }
      }

      else {
        let saleCredential = Object.assign({
          from: user.id,
          type: 'SALE'
        }, credential);
        const totalSale = await History.find({where: saleCredential});
        for(let i=0; i<totalSale.length; i++)
        {
          data.reveneu+=Number(totalSale[i].amount);
          data.totalSales+=Number(totalSale[i].numberOfCylinder);
        }
      }


      //data.totalTurnBack=await History.count({type: 'TURN_BACK',to:user.id});

      // const historiesArray = await History.find({type: 'IMPORT'}).populate('toArray');
      // historiesArray.map(item => {
      //   if(item.to === user.id || (item.toArray.length > 0 && _.includes(historiesArray.toArray, user.id))) {
      //     data.totalImportCylinder = ++data.totalImportCylinder;
      //   }
      // });
      // }




      //Get all user in databse and take relationship with user id is their parent
      if(user.userType=== USER_TYPE.Agency && user.userRole!=='SuperAdmin')
      {
        const relativeUsers = await User.find({isChildOf: user.isChildOf});
        data = calculateChilds(relativeUsers, data);
      }
      else{
        const relativeUsers = await User.find({isChildOf: user.id});
        data = calculateChilds(relativeUsers, data);
      }


      sails.log('GET REPORT::: ', data);
      return data;
    } catch (err) {
      console.log('123123123',err);
      return res.badRequest({message: err.message});
    }

  },

  getReportFilter: async function (req, res) {
    const user = req.userInfo;
    const type =  req.body.type;
    const typeForPartner = req.body.typeForPartner;
    let credential = {
      from: user.id
    };
    if(type) {
      credential.type = type;
    }
    if(typeForPartner) {
      credential.typeForPartner = typeForPartner;
    }
    // Get begin and end time if not put it in current.
    let begin = !req.body.begin ? moment.utc() : moment.utc(req.body.begin);
    let end = !req.body.end ? moment.utc().add(1, 'days') : moment.utc(req.body.end).add(1, 'days');
    // Check if user not send begin and end, we get all data
    if(!(!req.body.begin && !req.body.end)) {
      //If same time we add 1 days to end
      if(begin.diff(end) === 0) {end = end.add(1, 'days');}
      credential.createdAt = {'>=': begin, '<': end};
    }

    let page = parseInt(req.body.page);
    if(!page) {page = 1;}

    let limit =  parseInt(req.body.limit);
    if(!limit) {limit = 10;}

    const skip = limit * (page - 1);

    try {
      let report = History.find({where: credential, limit, skip});
      const count = await History.count({where: credential});
      const totalItem = (page - 1) * limit + customers.length;
      const response = {
        data: report,
        isHasNext: totalItem < count
      };
      return res.ok(response);
    } catch (error) {
      return res.ok(Utils.jsonErr(error));
    }
  },

  getChildAndNumberImportByDateTime : async function (userInfo,startDate,endDate)
  {
    var startDate = moment(startDate).utcOffset(0);
    startDate.set({hour:0,minute:0,second:0,millisecond:0});
    startDate = startDate.toISOString();

    var endDate = moment(endDate).utcOffset(0);
    endDate.set({hour:23,minute:59,second:59,millisecond:0});
    endDate = endDate.toISOString();
    let barChartInfo = {
      totalFixer:0,
      totalGeneral:0,
      totalAgency:0,
      totalCompanyChild:0,
      totalBuyPartner:0,
      totalRentPartner:0
    };
    let isRelatedIds=[];

    try{
      let isChilds= await User.find({isChildOf: userInfo.id});

      await Promise.all(isChilds.map(async item => {
        //console.log(item);
        if(item.userType === USER_TYPE.Fixer)
        {
          //console.log(item.id);
          let currentList = await History.find({type:'IMPORT',to: item.id, createdAt: {'>=': startDate, '<': endDate}});
          //console.log('co',currentList);
          await Promise.all(currentList.map(async item =>{
            barChartInfo.totalFixer+= Number(item.numberOfCylinder);
          }));

        }
        else if(item.userType === USER_TYPE.General)
        {
          //console.log(item.id);
          let currentList = await History.find({type:'IMPORT',to: item.id, createdAt: {'>=': startDate, '<': endDate}});
          //console.log('co',currentList);
          await Promise.all(currentList.map(async item =>{
            barChartInfo.totalGeneral+= Number(item.numberOfCylinder);
          }));

        }
        else if(item.userType === USER_TYPE.Agency)
        {
          //console.log(item.id);
          let currentList = await History.find({type:'IMPORT',to: item.id, createdAt: {'>=': startDate, '<': endDate}});
          //console.log('co',currentList);
          await Promise.all(currentList.map(async item =>{
            barChartInfo.totalAgency+= Number(item.numberOfCylinder);
          }));
          //barChartInfo.totalAgency+=await History.sum('numberOfCylinder').where({type:'IMPORT',to: item.id, createdAt: {'>=': startDate, '<': endDate}})
        }
        else if(item.userType === USER_TYPE.Factory && item.userRole === USER_ROLE.OWNER)
        {
          //console.log(item.id);
          let currentList = await History.find({type:'IMPORT',to: item.id, typeForPartner:{'!=': 'TO_FIX'}, createdAt: {'>=': startDate, '<': endDate}}).populate('cylinders');
          //console.log('co',currentList);
          await Promise.all(currentList.map(async item =>{
            if(item.cylinders[0].factory && item.cylinders[0].factory === userInfo.id) {
              barChartInfo.totalCompanyChild+= item.numberOfCylinder;
            }
          }));
          //barChartInfo.totalCompanyChild+=await History.sum('numberOfCylinder').where({type:'IMPORT',to: item.id, createdAt: {'>=': startDate, '<': endDate}})
        }
      }));
      //get parner
      const listPartnerIds = await PartnerServices.getListPartner(userInfo.id);
      console.log('listPartnerIds',listPartnerIds);
      await Promise.all(listPartnerIds.map(async item =>{
        let currentList = await History.find({type:'IMPORT',to: item,typeForPartner:'RENT', createdAt: {'>=': startDate, '<': endDate}}).populate('cylinders');
        //console.log('co rent:',currentList);
        await Promise.all(currentList.map(async item =>{
          if(item.cylinders[0].factory && item.cylinders[0].factory === userInfo.id) {barChartInfo.totalRentPartner+= Number(item.numberOfCylinder);}
        }));
      }));
      await Promise.all(listPartnerIds.map(async item =>{
        let currentList = await History.find({type:'IMPORT',to: item,typeForPartner:'BUY', createdAt: {'>=': startDate, '<': endDate}}).populate('cylinders');
        //console.log('co buy:',currentList);
        await Promise.all(currentList.map(async item =>{
          //console.log('number buy:',barChartInfo.totalBuyPartner, item.numberOfCylinder, item.cylinders[0]);
          if(item.cylinders[0].factory && item.cylinders[0].factory === userInfo.id) {barChartInfo.totalBuyPartner+= Number(item.numberOfCylinder);}
        }));
      }));
      console.log('number result buy:',barChartInfo.totalBuyPartner);
      //barChartInfo.totalRentPartner+= await History.sum('numberOfCylinder').where({numberOfCylinder: {'!': null },type:'IMPORT',typeForPartner:'RENT', createdAt: {'>=': startDate, '<': endDate}})
      //barChartInfo.totalBuyPartner+= await History.sum('numberOfCylinder').where({numberOfCylinder: {'!': null },type:'IMPORT',typeForPartner:'BUY', createdAt: {'>=': startDate, '<': endDate}})
      switch(userInfo.userType) {
        case USER_TYPE.Factory:
          if(userInfo.userRole === USER_ROLE.SUPER_ADMIN) {

            //get general - fixer - company child - agency.

          }
          else{
            delete barChartInfo.totalCompanyChild;
            //delete barChartInfo.totalBuyPartner;
            //delete barChartInfo.totalRentPartner;
          }
          break;
        case USER_TYPE.Fixer:

          break;
        case USER_TYPE.General:
          delete barChartInfo.totalCompanyChild;
          delete barChartInfo.totalBuyPartner;
          delete barChartInfo.totalRentPartner;
          delete barChartInfo.totalFixer;
          delete barChartInfo.totalGeneral;
          break;
        case USER_TYPE.Agency:
          delete barChartInfo.totalCompanyChild;
          delete barChartInfo.totalBuyPartner;
          delete barChartInfo.totalRentPartner;
          delete barChartInfo.totalFixer;
          delete barChartInfo.totalGeneral;
          delete barChartInfo.totalAgency;
          break;
      }
      return barChartInfo;
    }
    catch(error)
    {
      throw error;
    }
  },

  getInventoryOfBranch: async function (userInfo, factoryId) {
    let inventoryInfo = {
      inventoryAtMySelf: 0,
      atResident: 0,
      else: 0
    };

    let totalImportCylinder = 0;

    try {
      switch(userInfo.userType) {
        case USER_TYPE.Factory:
          if(userInfo.userRole === USER_ROLE.SUPER_ADMIN) {
            //count inventory at my self
            inventoryInfo.inventoryAtMySelf = await Cylinder.count({factory: factoryId, current: userInfo.id, placeStatus: 'IN_FACTORY'});
            //count inventory at people
            inventoryInfo.atResident = await Cylinder.count({factory: factoryId, placeStatus: 'IN_CUSTOMER'});
            //count inventory at Fixer
            inventoryInfo.atFixer = await Cylinder.count({factory: factoryId, placeStatus: 'IN_REPAIR'});
            //total cylinder created
            totalImportCylinder = await Cylinder.count({factory: factoryId});
            inventoryInfo.atPartners = await getAllInventoryAtPartner(userInfo.id, factoryId);
          } else {
            //count inventory at my self
            inventoryInfo.inventoryAtMySelf = await Cylinder.count({factory: factoryId, current: userInfo.id, placeStatus: 'IN_FACTORY'});
            await getCylinderSaled(userInfo.id, inventoryInfo);
            await getAllInventoryAtFixerChildsFactory(userInfo.id, factoryId, inventoryInfo);
            totalImportCylinder = await getTotalImportCylinder(userInfo, factoryId);
          }
          await getInventoryAtChilds(userInfo, factoryId, inventoryInfo);
          break;
        case USER_TYPE.General:
          inventoryInfo.inventoryAtMySelf = await Cylinder.count({factory: factoryId, current: userInfo.id, placeStatus: 'IN_GENERAL'});
          await getCylinderSaled(userInfo.id, inventoryInfo);
          totalImportCylinder = await getTotalImportCylinder(userInfo, factoryId);
          await getInventoryAtChilds(userInfo, factoryId, inventoryInfo);
          break;
        case USER_TYPE.Agency:
          inventoryInfo.inventoryAtMySelf = await Cylinder.count({factory: factoryId, current: userInfo.id, placeStatus: 'IN_AGENCY'});
          inventoryInfo.atResident = await Cylinder.count({factory: factoryId, current: userInfo.id, placeStatus: 'IN_CUSTOMER'});
          totalImportCylinder = await getTotalImportCylinder(userInfo, factoryId);
          break;
        case USER_TYPE.Fixer:
          inventoryInfo.inventoryAtMySelf = await Cylinder.count({factory: factoryId, current: userInfo.id, placeStatus: 'IN_REPAIR'});
          totalImportCylinder = await getTotalImportCylinder(userInfo, factoryId);
          break;
      }

      let totalKnewInventory = 0;
      for (var prop in inventoryInfo) {
        if (Object.prototype.hasOwnProperty.call(inventoryInfo, prop)) {
          totalKnewInventory = totalKnewInventory + Number(inventoryInfo[prop]);
        }
      }
      // Get imported Cylinder or created cylinder and device for inventory number to get else
      inventoryInfo.else = totalImportCylinder - totalKnewInventory;
      delete inventoryInfo.else;
    } catch (error) {
      throw error;
    }
    return inventoryInfo;

  },

  /**
   * Action for getDataSetForReport
   * @param targets
   * @param actionType
   * @param parentRoot
   * @param beginTime
   * @param endTime
   * @param actionType
   * @returns {*}
   */
  getDataForReport: async function (targets, actionType, parentRoot, beginTime, endTime) {
    // Get begin and end time if not put it in current.
    let dataSet = [];
    //let begin = !beginTime ? moment.utc() : moment.utc(beginTime);
    //let end = !endTime ? moment.utc().add(1, 'days') : moment.utc(endTime).add(1, 'days');
    try {
      // // Tìm parentRoot
      // const parent = await getRootParent(target.id)
      // if (!parent) {
      //     return res.badRequest(Utils.jsonErr('parentRoot not found'));
      // }

      // Tìm danh sách loại bình
      const cylinderCategory = await CategoryCylinder.find({ createdBy: parentRoot, isDeleted: false })

      // Tìm danh sách thương hiệu
      const cylinderManufacture = await Manufacture.find({owner: parentRoot, isDeleted: false })

      dataSet = await Promise.all(targets.map(async target => {
        let returnData = {
          targetId: target.id,
          targetName: target.name,
          targetUserType: target.userType,
          targetUserRole: target.userRole,
          targetData: [],
        }

        if (target.userType === 'Region') {
          // Tìm trạm của các chi nhánh
          const listStation = await User.find({
            isChildOf: target.id,
            userType: 'Factory',
            userRole: 'Owner',
          })

          // Lấy thông tin thống kê excel từng trạm
          await Promise.all(listStation.map(async station => {
            let credential = {
              createdAt: { '>=': beginTime, '<=': endTime }
            };

            switch (actionType) {
              case 'EXPORT':
                credential = Object.assign({
                  type: 'EXPORT',
                  typeForPartner: '',
                  from: station.id
                }, credential);
                break;
              case 'IMPORT':
                credential = Object.assign({
                  type: 'IMPORT',
                  to: station.id
                }, credential);
                if (station.userRole !== USER_ROLE.Fixer) { credential.typeForPartner = ''; }
                break;
              case 'EXPORT_CELL':
                credential = Object.assign({
                  type: 'EXPORT',
                  typeForPartner: { in: ['BUY', 'TO_FIX'] },
                  from: station.id
                }, credential);
                break;
              case 'IMPORT_CELL':
                credential = Object.assign({
                  type: 'IMPORT',
                  typeForPartner: { in: ['BUY', 'TO_FIX'] },
                  to: station.id
                }, credential);
                break;
              case 'TURN_BACK':
                credential = Object.assign({
                  type: 'TURN_BACK',
                  to: station.id
                }, credential);
                break;
              case 'FIX':
                credential = Object.assign({
                  type: 'EXPORT',
                  typeForPartner: 'TO_FIX',
                  from: station.id
                }, credential);
                break;
              case 'CREATE':
                credential = Object.assign({
                  factory: station.id
                }, credential);
                break;
            }

            //
            if (actionType === 'TURN_BACK') {
              const recoredHistory = await History.find(credential).populate('cylinders');

              await Promise.all(recoredHistory.map(async history => {
                return await Promise.all(history.cylinders.map(async cylinder => {
                  if (cylinder.factory === parentRoot) {
                    const cylinderRecord = await Cylinder.findOne({ id: cylinder.id })
                      .populate('category')
                      .populate('manufacture')
                      .populate('histories', {
                        where: {
                          type: 'IMPORT',
                          createdAt: { '<=': history.createdAt }
                        },
                        limit: 1,
                        sort: 'createdAt DESC'
                      });

                    let set = {
                      serial: cylinder.serial,
                      color: cylinder.color,
                      checkedDate: moment(cylinder.checkedDate, moment.ISO_8601, true).isValid()
                        ? moment(cylinder.checkedDate).format("DD/MM/YYYY")
                        : cylinder.checkedDate,
                      valve: cylinder.valve,
                      cylinderType: cylinderRecord.category ? cylinderRecord.category.name : '',
                      manufacture: cylinderRecord.manufacture ? cylinderRecord.manufacture.name : '',
                      weight: cylinder.weight,
                      dynamicDate: moment(history.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                      nameDriver: history.driver,
                      license_plate: history.license_plate,
                      stationName: station.name,
                    };

                    if (cylinderRecord.histories && cylinderRecord.histories.length > 0) {
                      // Tìm thông tin khách hàng nhập
                      const customer = await User.findOne({ id: cylinderRecord.histories[0].to })

                      set.dynamicPlace = customer ? customer.name : ''
                    }

                    returnData.targetData.push(set);
                  }
                }));
              }));
            }

            //
            else if (actionType === 'EXPORT') {
              // Tìm bản ghi xuất hàng từ station
              const recoredHistory = await History.find(credential)
                .populate('cylinders')
                .populate('toArray');

              await Promise.all(recoredHistory.map(async history => {
                // Lấy thông tin tên khách hang(điểm đến) của đơn xuất
                let _customerName = ''

                if (history.toArray.length >= 2) {
                  _customerName = history.toArray[0].name

                  for (let i = 1; i < history.toArray.length; i++) {
                    _customerName = _customerName + ", " + history.toArray[i].name
                  }
                }
                else if (history.toArray.length >= 1) {
                  _customerName = history.toArray[0].name
                }

                return await Promise.all(history.cylinders.map(async (cylinder, index) => {
                  if (cylinder.factory === parentRoot) {

                    const categoryInfo = cylinderCategory.find(_category => _category.id === cylinder.category)
                    const manufactureInfo = cylinderManufacture.find(_manufacture => _manufacture.id === cylinder.manufacture)

                    let set = {
                      serial: cylinder.serial,
                      color: cylinder.color,
                      checkedDate: moment(cylinder.checkedDate, moment.ISO_8601, true).isValid()
                        ? moment(cylinder.checkedDate).format("DD/MM/YYYY")
                        : cylinder.checkedDate,
                      valve: cylinder.valve,
                      cylinderType: categoryInfo ? categoryInfo.name : '',
                      manufacture: manufactureInfo ? manufactureInfo.name : '',
                      weight: cylinder.weight,
                      dynamicDate: moment(history.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                      customerName: _customerName,
                      nameDriver: history.driver,
                      license_plate: history.license_plate,
                      stationName: station.name,
                    };

                    returnData.targetData.push(set);
                  }
                }));
              }));
            }

            //
            else if (actionType === 'IMPORT') {
              const recoredHistory = await History.find(credential)
                .populate('cylinders')
                .populate('from');

              await Promise.all(recoredHistory.map(async history => {
                return await Promise.all(history.cylinders.map(async (cylinder, index) => {
                  if (cylinder.factory === parentRoot) {
                    const categoryInfo = cylinderCategory.find(_category => _category.id === cylinder.category)
                    const manufactureInfo = cylinderManufacture.find(_manufacture => _manufacture.id === cylinder.manufacture)

                    let set = {
                      serial: cylinder.serial,
                      cylinderType: categoryInfo ? categoryInfo.name : '',
                      color: cylinder.color,
                      valve: cylinder.valve,
                      checkedDate: moment(cylinder.checkedDate, moment.ISO_8601, true).isValid()
                        ? moment(cylinder.checkedDate).format("DD/MM/YYYY")
                        : cylinder.checkedDate,
                      manufacture: manufactureInfo ? manufactureInfo.name : '',
                      weight: cylinder.weight,
                      dynamicDate: moment(history.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                      exportPlace: history.from.name,
                      stationName: station.name,
                    };
                    returnData.targetData.push(set);
                  }
                }));
              }));
            }

            //
            else if (actionType === 'EXPORT_CELL') {
              const recoredHistory = await History.find(credential)
                .populate('cylinders')
              // .populate('toArray');

              await Promise.all(recoredHistory.map(async history => {
                return await Promise.all(history.cylinders.map(async (cylinder, index) => {
                  if (cylinder.factory === parentRoot) {
                    const categoryInfo = cylinderCategory.find(_category => _category.id === cylinder.category)
                    const manufactureInfo = cylinderManufacture.find(_manufacture => _manufacture.id === cylinder.manufacture)

                    let set = {
                      serial: cylinder.serial,
                      cylinderType: categoryInfo ? categoryInfo.name : '',
                      color: cylinder.color,
                      valve: cylinder.valve,
                      checkedDate: moment(cylinder.checkedDate, moment.ISO_8601, true).isValid()
                        ? moment(cylinder.checkedDate).format("DD/MM/YYYY")
                        : cylinder.checkedDate,
                      manufacture: manufactureInfo ? manufactureInfo.name : '',
                      weight: cylinder.weight,
                      classification: cylinder.classification === 'New'
                        ? 'Bình mới'
                        : 'Bình cũ',
                      dynamicDate: moment(history.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                      stationName: station.name,
                    };
                    returnData.targetData.push(set);
                  }
                }));
              }));
            }

            //
            else if (actionType === 'IMPORT_CELL') {
              const recoredHistory = await History.find(credential).populate('cylinders').populate('from');

              await Promise.all(recoredHistory.map(async history => {
                return await Promise.all(history.cylinders.map(async (cylinder, index) => {
                  if (cylinder.factory === parentRoot) {
                    const categoryInfo = cylinderCategory.find(_category => _category.id === cylinder.category)
                    const manufactureInfo = cylinderManufacture.find(_manufacture => _manufacture.id === cylinder.manufacture)

                    let set = {
                      serial: cylinder.serial,
                      cylinderType: categoryInfo ? categoryInfo.name : '',
                      color: cylinder.color,
                      valve: cylinder.valve,
                      checkedDate: moment(cylinder.checkedDate, moment.ISO_8601, true).isValid()
                        ? moment(cylinder.checkedDate).format("DD/MM/YYYY")
                        : cylinder.checkedDate,
                      manufacture: manufactureInfo ? manufactureInfo.name : '',
                      weight: cylinder.weight,
                      classification: cylinder.classification === 'New'
                        ? 'Bình mới'
                        : 'Bình cũ',
                      dynamicDate: moment(history.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                      exportPlace: history.from.name,
                      stationName: station.name,
                    };
                    returnData.targetData.push(set);
                  }
                }));
              }));
            }

            //
            else if (actionType === 'FIX') {
              const recoredHistory = await History.find(credential).populate('cylinders').populate('toArray');
              await Promise.all(recoredHistory.map(async history => {
                return await Promise.all(history.cylinders.map(async (cylinder, index) => {
                  if (cylinder.factory === parentRoot) {
                    let set = {
                      serial: cylinder.serial,
                      color: cylinder.color,
                      checkedDate: cylinder.checkedDate,
                      weight: cylinder.weight,
                      dynamicDate: moment(history.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                      stationName: station.name,
                    };
                    const cylinderRecord = await Cylinder.findOne({ id: cylinder.id }).populate('histories', {
                      where: {
                        type: 'IMPORT',
                        typeForPartner: 'TO_FIX',
                        createdAt: { '>=': history.createdAt },
                      },
                      sort: 'createdAt ASC'
                    });
                    if (cylinderRecord.histories && cylinderRecord.histories.length > 0) {
                      const targetImport = await User.findOne({ id: cylinderRecord.histories[0].to })
                      set.dynamicPlace = targetImport.name;
                      set.classification = cylinderRecord.classification ? cylinderRecord.classification : '';

                      returnData.targetData.push(set);
                    }
                  }
                }));
              }));
            }

            //
            else if (actionType === 'CREATE') {
              const createdCylinders = await Cylinder.find({
                manufacturedBy: station.id,
                createdAt: { '>=': beginTime, '<=': endTime }
              })
                .populate('category')
                .populate('manufacture');

              if (createdCylinders.length > 0) {
                await Promise.all(createdCylinders.map(
                  async cylinder => {
                    let set = {
                      serial: cylinder.serial,
                      cylinderType: cylinder.category.name,
                      color: cylinder.color,
                      valve: cylinder.valve,
                      checkedDate: moment(cylinder.checkedDate, moment.ISO_8601).isValid()
                        ? moment(cylinder.checkedDate).format('DD/MM/YYYY')
                        : cylinder.checkedDate,
                      manufacture: cylinder.manufacture.name,
                      weight: cylinder.weight,
                      classification: cylinder.classification === 'New'
                        ? 'Bình mới'
                        : 'Bình cũ',
                      createdAt: moment(cylinder.createdAt, moment.ISO_8601).isValid()
                        ? moment(cylinder.createdAt).format('DD/MM/YYYY')
                        : cylinder.createdAt,
                      stationName: station.name,
                    }
                    returnData.targetData.push(set);
                  }
                ))
              }
            }

            //
            else if (actionType !== 'CREATE') {
              const recoredHistory = await History.find(credential).populate('cylinders');
              await Promise.all(recoredHistory.map(async history => {
                return await Promise.all(history.cylinders.map(async cylinder => {
                  if (cylinder.factory === parentRoot) {
                    let set = {
                      serial: cylinder.serial,
                      color: cylinder.color,
                      checkedDate: cylinder.checkedDate,
                      weight: cylinder.weight,
                      dynamicDate: moment(history.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                      stationName: station.name,
                    };
                    const cylinderRecord = await Cylinder.findOne({ id: cylinder.id }).populate('histories');
                    if (cylinderRecord.histories && cylinderRecord.histories.length > 0) {
                      switch (actionType) {
                        case 'FIX':
                        case 'EXPORT_CELL':
                        case 'EXPORT':
                          set.dynamicPlace = station.name;
                          break;
                        case 'IMPORT':
                          const lastRecord = cylinderRecord.histories[cylinderRecord.histories.length - 1];
                          const currentPlace = await User.findOne({ id: lastRecord.from });
                          set.dynamicPlace = currentPlace ? currentPlace.name : 'Không xác định';
                          break;
                      }
                      set.classification = cylinderRecord.classification ? cylinderRecord.classification : '';
                    }
                    returnData.targetData.push(set);
                  }
                }));
              }));
            } else {
              const recordCreatedCylinder = Cylinder.find(credential);
              dataSet = Object.assign(dataSet, await Promise.all(recordCreatedCylinder.filter(cylinder => cylinder.factory === parentRoot).map(async cylinder => {
                return {
                  serial: cylinder.serial,
                  classification: cylinder.classification ? cylinder.classification : '',
                  color: cylinder.color,
                  checkedDate: cylinder.checkedDate,
                  weight: cylinder.weight,
                  dynamicDate: moment(cylinder.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                  dynamicPlace: station.name
                };
              })));
            }
          }))
        }
        else {
          let credential = {
            // createdAt: {'>=': begin.toISOString(), '<': end.toISOString()}
            createdAt: {'>=': beginTime, '<=': endTime}
          };
  
          switch(actionType) {
            case 'EXPORT':
              credential = Object.assign({
                type: 'EXPORT',
                typeForPartner: '',
                from: target.id
              }, credential);
              break;
            case 'IMPORT':
              credential = Object.assign({
                type: 'IMPORT',
                to: target.id
              }, credential);
              if(target.userRole !== USER_ROLE.Fixer) {credential.typeForPartner = ''; }
              break;
            case 'EXPORT_CELL':
              credential = Object.assign({
                type: 'EXPORT',
                typeForPartner: {in: [ 'BUY', 'TO_FIX']},
                from: target.id
              }, credential);
              break;
            case 'IMPORT_CELL':
              credential = Object.assign({
                type: 'IMPORT',
                typeForPartner: {in: [ 'BUY', 'TO_FIX']},
                to: target.id
              }, credential);
              break;
            case 'TURN_BACK':
              credential = Object.assign({
                type: 'TURN_BACK',
                to: target.id
              }, credential);
              break;
            case 'FIX':
              credential = Object.assign({
                type: 'EXPORT',
                typeForPartner: 'TO_FIX',
                from: target.id
              }, credential);
              break;
            case 'CREATE':
              credential = Object.assign({
                factory: target.id
              }, credential);
              break;
            case 'SALE':
              credential = Object.assign({
                type: 'SALE',
                from: target.id
              }, credential);
              break;
          }
  
          //
          if (actionType === 'TURN_BACK') {
            const recoredHistory = await History.find(credential).populate('cylinders');
  
            // // Tìm parentRoot
            // const parent = await getRootParent(target)
            // if (!parent) {
            //     return res.badRequest(Utils.jsonErr('parentRoot not found'));
            // }
  
            // // Tìm danh sách loại bình
            // const cylinderCategory = await CategoryCylinder.find({ createdBy: parent.id, isDeleted: false })
            // // const _numberCategory = cylinderCategory.length
  
            await Promise.all(recoredHistory.map(async history => {
              return await Promise.all(history.cylinders.map(async cylinder => {
                if(cylinder.factory === parentRoot) {
                  // hieu
                  // const weightReturn = await returnGas.find({serialCylinder : cylinder.serial}).limit(1);
                  
                  // const categoryInfo = cylinderCategory.find(_category => _category.id === cylinder.category)
  
                  const cylinderRecord = await Cylinder.findOne({id : cylinder.id})
                    .populate('category')
                    .populate('manufacture')
                    .populate('histories', {
                      where: {
                        type: 'IMPORT',
                        createdAt: {'<=': history.createdAt}
                      },
                      limit: 1,
                      sort: 'createdAt DESC'
                    });
  
                  let set = {
                    serial: cylinder.serial,
                    color: cylinder.color,
                    checkedDate: moment(cylinder.checkedDate, moment.ISO_8601, true).isValid()
                      ? moment(cylinder.checkedDate).format("DD/MM/YYYY")
                      : cylinder.checkedDate,
                    valve: cylinder.valve,
                    cylinderType: cylinderRecord.category ? cylinderRecord.category.name : '',
                    manufacture: cylinderRecord.manufacture ? cylinderRecord.manufacture.name : '',
                    weight: cylinder.weight,
                    dynamicDate: moment(history.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                    // dynamicPlace
                    nameDriver: history.driver,
                    license_plate: history.license_plate,
                  };
  
                  // const cylinderRecord = await Cylinder.findOne({id : cylinder.id})
                  //   .populate('histories', {
                  //     where: {
                  //       type: 'IMPORT',
                  //       createdAt: {'<=': history.createdAt}
                  //     },
                  //     limit: 1,
                  //     sort: 'createdAt DESC'
                  //   });
  
                  if(cylinderRecord.histories && cylinderRecord.histories.length > 0) {
                    // Tìm thông tin khách hàng nhập
                    const customer = await User.findOne({id: cylinderRecord.histories[0].to})
  
                    set.dynamicPlace = customer ? customer.name : ''
                  }
                  // dataSet.push(set);
                  returnData.targetData.push(set);
                }
              }));
            }));
          }
  
          //
          else if (actionType === 'EXPORT') {
            // Tìm bản ghi xuất hàng từ target
            const recoredHistory = await History.find(credential)
              .populate('cylinders')
              .populate('toArray');
  
            await Promise.all(recoredHistory.map(async history => {
              // Lấy thông tin tên khách hang(điểm đến) của đơn xuất
              let _customerName = ''
  
              if (history.toArray.length >= 2) {
                _customerName = history.toArray[0].name
  
                for (let i = 1; i < history.toArray.length; i++) {
                  _customerName = _customerName + ", " + history.toArray[i].name
                }
              }
              else if (history.toArray.length >= 1) {
                _customerName = history.toArray[0].name
              }
  
              return await Promise.all(history.cylinders.map(async (cylinder, index) => {
                if(cylinder.factory === parentRoot) {
                  
                  const categoryInfo = cylinderCategory.find(_category => _category.id === cylinder.category)                  
                  const manufactureInfo = cylinderManufacture.find(_manufacture => _manufacture.id === cylinder.manufacture)
                    
                  let set = {
                    serial: cylinder.serial,
                    color: cylinder.color,
                    checkedDate: moment(cylinder.checkedDate, moment.ISO_8601, true).isValid()
                      ? moment(cylinder.checkedDate).format("DD/MM/YYYY")
                      : cylinder.checkedDate,
                    valve: cylinder.valve,
                    cylinderType: categoryInfo ? categoryInfo.name : '',
                    manufacture: manufactureInfo ? manufactureInfo.name : '',
                    weight: cylinder.weight,
                    // weightReturn : (!weightReturn || weightReturn=='' ||  weightReturn==undefined) ? 0 : weightReturn[0].weight,
                    // weightTexcess : (!weightReturn || weightReturn=='' ||  weightReturn==undefined) ? 0 : ( weightReturn[0].weight - cylinder.weight ),
                    dynamicDate: moment(history.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                    customerName: _customerName,
                    nameDriver: history.driver,
                    license_plate: history.license_plate,
                  };
                  
                  // const cylinderRecord = await Cylinder.findOne({ id: cylinder.id }).populate('histories', {
                  //   where: {
                  //     type: 'IMPORT',
                  //     // createdAt: { '>=': begin.toISOString() },
                  //     createdAt: { '>=': history.createdAt },
                  //   },
                  //   sort: 'createdAt ASC'
                  // });
                  // if(cylinderRecord.histories && cylinderRecord.histories.length > 0) {
                  //   // switch(actionType) {
                  //   //   case 'FIX':
                  //   //   case 'EXPORT_CELL':
                  //   //   case 'EXPORT':
                  //       //const lastExportRecord = cylinderRecord.histories[cylinderRecord.histories.findIndex(item =>  item.id === history.id ) + 1];
                  //       //if(lastExportRecord) {
                  //       //const currentPlace = await User.findOne({id : lastExportRecord.to});
                  //       // set.dynamicPlace = history.toArray[index].name;
                  //       const targetImport = await User.findOne({id: cylinderRecord.histories[0].to})
                  //       set.dynamicPlace = targetImport.name;
                  //       // } else {
                  //       //   set.dynamicPlace = 'Không xác định';
                  //       // }
                  //       // break;
                  //       set.classification = cylinderRecord.classification ? cylinderRecord.classification : '';
                        
                  //       dataSet.push(set);
  
                  //   //   case 'IMPORT':
                  //   //     const lastRecord = cylinderRecord.histories[cylinderRecord.histories.length - 1];
                  //   //     const currentPlace = await User.findOne({id : lastRecord.from});
                  //   //     set.dynamicPlace = currentPlace ? currentPlace.name : 'Không xác định';
                  //   //     break;
                  //   //   case 'TURN_BACK':
                  //   // let lastTurnbackRecord 
                  //   //     if (cylinderRecord.histories.length > 2) {
                  //   //       lastTurnbackRecord = cylinderRecord.histories[cylinderRecord.histories.length - 2];
                  //   //     }
                  //   //     else {
                  //   //       lastTurnbackRecord = cylinderRecord.histories[cylinderRecord.histories.length-1]; 
                  //   //     }
                        
                  //   //     if(lastTurnbackRecord.type === 'SALE') {
                  //   //       set.dynamicPlace = 'Người dân';
                  //   //     } else {
                  //   //       const currentPlace = await User.findOne({id : lastTurnbackRecord.to});
                  //   //       set.dynamicPlace = currentPlace ? currentPlace.name : 'Không xác định';
                  //   //     }
                  //   //     break;
                  //   // }
                  // }
                  // dataSet.push(set);
                  returnData.targetData.push(set);
                }
              }));
            }));
          }
  
          //
          else if (actionType === 'IMPORT') {
            const recoredHistory = await History.find(credential)
              .populate('cylinders')
              .populate('from');
              
            await Promise.all(recoredHistory.map(async history => {
              return await Promise.all(history.cylinders.map(async (cylinder, index) => {
                if(cylinder.factory === parentRoot) {
                  // hieu
                  //const weightReturn = await returnGas.find({serialCylinder : cylinder.serial}).limit(1);
  
                  const categoryInfo = cylinderCategory.find(_category => _category.id === cylinder.category)
                  const manufactureInfo = cylinderManufacture.find(_manufacture => _manufacture.id === cylinder.manufacture)
  
                  let set = {
                    serial: cylinder.serial,
                    cylinderType: categoryInfo ? categoryInfo.name : '',
                    color: cylinder.color,
                    valve: cylinder.valve,
                    checkedDate: moment(cylinder.checkedDate, moment.ISO_8601, true).isValid()
                      ? moment(cylinder.checkedDate).format("DD/MM/YYYY")
                      : cylinder.checkedDate,
                    manufacture: manufactureInfo ? manufactureInfo.name : '',
                    weight: cylinder.weight,
                    // weightReturn : (!weightReturn || weightReturn=='' ||  weightReturn==undefined) ? 0 : weightReturn[0].weight,
                    // weightTexcess : (!weightReturn || weightReturn=='' ||  weightReturn==undefined) ? 0 : ( weightReturn[0].weight - cylinder.weight ),
                    dynamicDate: moment(history.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                    exportPlace: history.from.name
                  };
                  
                  // dataSet.push(set);
                  returnData.targetData.push(set);
                }
              }));
            }));
          }
  
          //
          else if (actionType === 'EXPORT_CELL') {
            const recoredHistory = await History.find(credential)
              .populate('cylinders')
              // .populate('toArray');
  
            await Promise.all(recoredHistory.map(async history => {
              return await Promise.all(history.cylinders.map(async (cylinder, index) => {
                if(cylinder.factory === parentRoot) {
                  // hieu
                  //const weightReturn = await returnGas.find({serialCylinder : cylinder.serial}).limit(1);
                  const categoryInfo = cylinderCategory.find(_category => _category.id === cylinder.category)
                  const manufactureInfo = cylinderManufacture.find(_manufacture => _manufacture.id === cylinder.manufacture)
  
                  let set = {
                    serial: cylinder.serial,
                    cylinderType: categoryInfo ? categoryInfo.name : '',
                    color: cylinder.color,
                    valve: cylinder.valve,
                    // checkedDate: moment(cylinder.checkedDate).format('DD/MM/YYYY'),
                    checkedDate: moment(cylinder.checkedDate, moment.ISO_8601, true).isValid()
                      ? moment(cylinder.checkedDate).format("DD/MM/YYYY")
                      : cylinder.checkedDate,
                    manufacture: manufactureInfo ? manufactureInfo.name : '',
                    weight: cylinder.weight,
                    classification: cylinder.classification === 'New'
                      ? 'Bình mới'
                      : 'Bình cũ',
                    dynamicDate: moment(history.createdAt).format('DD/MM/YYYY HH:mm:ss')
                  };
                  // const cylinderRecord = await Cylinder.findOne({ id: cylinder.id }).populate('histories', {
                  //   where: {
                  //     type: 'IMPORT',
                  //     typeForPartner: {in: [ 'BUY', 'TO_FIX']},
                  //     createdAt: { '>=': history.createdAt },
                  //   },
                  //   sort: 'createdAt ASC'
                  // });
                  // if(cylinderRecord.histories && cylinderRecord.histories.length > 0) {
                  //   // switch(actionType) {
                  //   //   case 'FIX':
                  //   //   case 'EXPORT_CELL':
                  //   //   case 'EXPORT':
                  //       //const lastExportRecord = cylinderRecord.histories[cylinderRecord.histories.findIndex(item =>  item.id === history.id ) + 1];
                  //       //if(lastExportRecord) {
                  //       //const currentPlace = await User.findOne({id : lastExportRecord.to});
                  //       // set.dynamicPlace = history.toArray[index].name;
                  //       const targetImport = await User.findOne({id: cylinderRecord.histories[0].to})
                  //       set.dynamicPlace = targetImport.name;
                  //       // } else {
                  //       //   set.dynamicPlace = 'Không xác định';
                  //       // }
                  //       // break;
                  //       set.classification = cylinderRecord.classification ? cylinderRecord.classification : '';
  
                        // dataSet.push(set);
                        returnData.targetData.push(set);
  
                    //   case 'IMPORT':
                    //     const lastRecord = cylinderRecord.histories[cylinderRecord.histories.length - 1];
                    //     const currentPlace = await User.findOne({id : lastRecord.from});
                    //     set.dynamicPlace = currentPlace ? currentPlace.name : 'Không xác định';
                    //     break;
                    //   case 'TURN_BACK':
                    // let lastTurnbackRecord 
                    //     if (cylinderRecord.histories.length > 2) {
                    //       lastTurnbackRecord = cylinderRecord.histories[cylinderRecord.histories.length - 2];
                    //     }
                    //     else {
                    //       lastTurnbackRecord = cylinderRecord.histories[cylinderRecord.histories.length-1]; 
                    //     }
                        
                    //     if(lastTurnbackRecord.type === 'SALE') {
                    //       set.dynamicPlace = 'Người dân';
                    //     } else {
                    //       const currentPlace = await User.findOne({id : lastTurnbackRecord.to});
                    //       set.dynamicPlace = currentPlace ? currentPlace.name : 'Không xác định';
                    //     }
                    //     break;
                    // }
                  // }
                  // dataSet.push(set);
                }
              }));
            }));
          }
  
          //
          else if (actionType === 'IMPORT_CELL') {
            const recoredHistory = await History.find(credential).populate('cylinders').populate('from');
            
            await Promise.all(recoredHistory.map(async history => {
              return await Promise.all(history.cylinders.map(async (cylinder, index) => {
                if(cylinder.factory === parentRoot) {
                  // hieu
                  //const weightReturn = await returnGas.find({serialCylinder : cylinder.serial}).limit(1);
                  const categoryInfo = cylinderCategory.find(_category => _category.id === cylinder.category)                  
                  const manufactureInfo = cylinderManufacture.find(_manufacture => _manufacture.id === cylinder.manufacture)
  
                  let set = {
                    serial: cylinder.serial,
                    cylinderType: categoryInfo ? categoryInfo.name : '',
                    color: cylinder.color,
                    valve: cylinder.valve,
                    checkedDate: moment(cylinder.checkedDate, moment.ISO_8601, true).isValid()
                      ? moment(cylinder.checkedDate).format("DD/MM/YYYY")
                      : cylinder.checkedDate,
                    manufacture: manufactureInfo ? manufactureInfo.name : '',
                    weight: cylinder.weight,
                    classification: cylinder.classification === 'New'
                      ? 'Bình mới'
                      : 'Bình cũ',
                    dynamicDate: moment(history.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                    exportPlace: history.from.name
                  };
  
                  // set.classification = cylinder.classification ? cylinder.classification : '';
                  
                  // dataSet.push(set);
                  returnData.targetData.push(set);
                }
              }));
            }));
          }
  
          //
          else if (actionType === 'FIX') {
            const recoredHistory = await History.find(credential).populate('cylinders').populate('toArray');
            await Promise.all(recoredHistory.map(async history => {
              return await Promise.all(history.cylinders.map(async (cylinder, index) => {
                if(cylinder.factory === parentRoot) {
                  // hieu
                  //const weightReturn = await returnGas.find({serialCylinder : cylinder.serial}).limit(1);
                  let set = {
                    serial: cylinder.serial,
                    color: cylinder.color,
                    checkedDate: cylinder.checkedDate,
                    weight: cylinder.weight,
                    // weightReturn : (!weightReturn || weightReturn=='' ||  weightReturn==undefined) ? 0 : weightReturn[0].weight,
                    // weightTexcess : (!weightReturn || weightReturn=='' ||  weightReturn==undefined) ? 0 : ( weightReturn[0].weight - cylinder.weight ),
                    dynamicDate: moment(history.createdAt).format('DD/MM/YYYY HH:mm:ss')
                  };
                  const cylinderRecord = await Cylinder.findOne({ id: cylinder.id }).populate('histories', {
                    where: {
                      type: 'IMPORT',
                      typeForPartner: 'TO_FIX',
                      createdAt: { '>=': history.createdAt },
                    },
                    sort: 'createdAt ASC'
                  });
                  if(cylinderRecord.histories && cylinderRecord.histories.length > 0) {
                    // switch(actionType) {
                    //   case 'FIX':
                    //   case 'EXPORT_CELL':
                    //   case 'EXPORT':
                        //const lastExportRecord = cylinderRecord.histories[cylinderRecord.histories.findIndex(item =>  item.id === history.id ) + 1];
                        //if(lastExportRecord) {
                        //const currentPlace = await User.findOne({id : lastExportRecord.to});
                        // set.dynamicPlace = history.toArray[index].name;
                        const targetImport = await User.findOne({id: cylinderRecord.histories[0].to})
                        set.dynamicPlace = targetImport.name;
                        // } else {
                        //   set.dynamicPlace = 'Không xác định';
                        // }
                        // break;
                        set.classification = cylinderRecord.classification ? cylinderRecord.classification : '';
                        
                        // dataSet.push(set);
                        returnData.targetData.push(set);
  
                    //   case 'IMPORT':
                    //     const lastRecord = cylinderRecord.histories[cylinderRecord.histories.length - 1];
                    //     const currentPlace = await User.findOne({id : lastRecord.from});
                    //     set.dynamicPlace = currentPlace ? currentPlace.name : 'Không xác định';
                    //     break;
                    //   case 'TURN_BACK':
                    // let lastTurnbackRecord 
                    //     if (cylinderRecord.histories.length > 2) {
                    //       lastTurnbackRecord = cylinderRecord.histories[cylinderRecord.histories.length - 2];
                    //     }
                    //     else {
                    //       lastTurnbackRecord = cylinderRecord.histories[cylinderRecord.histories.length-1]; 
                    //     }
                        
                    //     if(lastTurnbackRecord.type === 'SALE') {
                    //       set.dynamicPlace = 'Người dân';
                    //     } else {
                    //       const currentPlace = await User.findOne({id : lastTurnbackRecord.to});
                    //       set.dynamicPlace = currentPlace ? currentPlace.name : 'Không xác định';
                    //     }
                    //     break;
                    // }
                  }
                  // dataSet.push(set);
                }
              }));
            }));
          }
  
          //
          else if (actionType === 'CREATE') {
              const createdCylinders = await Cylinder.find({
                manufacturedBy: target.id,
                createdAt: { '>=': beginTime, '<=': endTime }
              })
                .populate('category')
                .populate('manufacture');
  
              if (createdCylinders.length > 0) {
                await Promise.all(createdCylinders.map(
                  async cylinder => {
                    // const listAgency = await User.find({ isChildOf: customer.id, userType: 'Agency', userRole: 'SuperAdmin' })
                    // if (listAgency && listAgency.length>0) {                 
                    // await Promise.all(listAgency.map( async agency => {
                    let set = {
                      serial: cylinder.serial,
                      // cylinderType: cylinder.category ? cylinder.category.name : '',
                      cylinderType: cylinder.category.name,
                      color: cylinder.color,
                      valve: cylinder.valve,
                      checkedDate: moment(cylinder.checkedDate, moment.ISO_8601).isValid()
                        ? moment(cylinder.checkedDate).format('DD/MM/YYYY')
                        : cylinder.checkedDate,
                      manufacture: cylinder.manufacture.name,
                      weight: cylinder.weight,
                      classification: cylinder.classification === 'New'
                        ? 'Bình mới'
                        : 'Bình cũ',
                      createdAt: moment(cylinder.createdAt, moment.ISO_8601).isValid()
                        ? moment(cylinder.createdAt).format('DD/MM/YYYY')
                        : cylinder.createdAt,
                    }
  
                    // dataSet.push(set)
                    returnData.targetData.push(set);
                    //   }))         
                    // }
                  }
                ))
              }
            // }
          }

          else if (actionType === 'SALE') {
            // Tìm bản ghi bán hàng từ target
            const recoredHistory = await History.find(credential)
              .populate('cylinders')
              .populate('customer');

            await Promise.all(recoredHistory.map(async history => {   
              return await Promise.all(history.cylinders.map(async (cylinder) => {
                if (cylinder.factory === parentRoot) {

                  const categoryInfo = cylinderCategory.find(_category => _category.id === cylinder.category)
                  const manufactureInfo = cylinderManufacture.find(_manufacture => _manufacture.id === cylinder.manufacture)

                  let set = {
                    serial: cylinder.serial,
                    color: cylinder.color,
                    valve: cylinder.valve,
                    weight: cylinder.weight,
                    checkedDate: moment(cylinder.checkedDate, moment.ISO_8601, true).isValid()
                      ? moment(cylinder.checkedDate).format("DD/MM/YYYY")
                      : cylinder.checkedDate,
                    manufacture: manufactureInfo ? manufactureInfo.name : '',
                    cylinderType: categoryInfo ? categoryInfo.name : '',
                    customerName: history.customer ? history.customer.name : '',
                    dynamicDate: moment(history.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                  };
                  returnData.targetData.push(set);
                }
              }));
            }));
        }
  
          //
          else if(actionType !== 'CREATE') {
            const recoredHistory = await History.find(credential).populate('cylinders');
            await Promise.all(recoredHistory.map(async history => {
              return await Promise.all(history.cylinders.map(async cylinder => {
                if(cylinder.factory === parentRoot) {
                  // hieu
                  //const weightReturn = await returnGas.findOne({serialCylinder : cylinder.serial});
                  let set = {
                    serial: cylinder.serial,
                    color: cylinder.color,
                    checkedDate: cylinder.checkedDate,
                    weight: cylinder.weight,
                    //weightReturn : weightReturn.weight,
                    //eightTexcess : weightReturn.weight - cylinder.weight,
                    dynamicDate: moment(history.createdAt).format('DD/MM/YYYY HH:mm:ss')
                  };
                  const cylinderRecord = await Cylinder.findOne({id : cylinder.id}).populate('histories');
                  if(cylinderRecord.histories && cylinderRecord.histories.length > 0) {
                    switch(actionType) {
                      case 'FIX':
                      case 'EXPORT_CELL':
                      case 'EXPORT':
                        //const lastExportRecord = cylinderRecord.histories[cylinderRecord.histories.findIndex(item =>  item.id === history.id ) + 1];
                        //if(lastExportRecord) {
                        //const currentPlace = await User.findOne({id : lastExportRecord.to});
                        set.dynamicPlace = target.name;
                        // } else {
                        //   set.dynamicPlace = 'Không xác định';
                        // }
                        break;
                      case 'IMPORT':
                        const lastRecord = cylinderRecord.histories[cylinderRecord.histories.length - 1];
                        const currentPlace = await User.findOne({id : lastRecord.from});
                        set.dynamicPlace = currentPlace ? currentPlace.name : 'Không xác định';
                        break;
                      // case 'TURN_BACK':
                      //   const lastTurnbackRecord = cylinderRecord.histories[cylinderRecord.histories.length - 2];
                      //   if(lastTurnbackRecord.type === 'SALE') {
                      //     set.dynamicPlace = 'Người dân';
                      //   } else {
                      //     const currentPlace = await User.findOne({id : lastTurnbackRecord.to});
                      //     set.dynamicPlace = currentPlace ? currentPlace.name : 'Không xác định';
                      //   }
                      //   break;
                    }
                    set.classification = cylinderRecord.classification ? cylinderRecord.classification : '';
                  }
                  // dataSet.push(set);
                  returnData.targetData.push(set);
                }
              }));
            }));
          } else {
            const recordCreatedCylinder = Cylinder.find(credential);
            dataSet = Object.assign(dataSet, await Promise.all(recordCreatedCylinder.filter(cylinder => cylinder.factory === parentRoot).map(async cylinder => {
              return {
                serial: cylinder.serial,
                classification: cylinder.classification ? cylinder.classification : '',
                color: cylinder.color,
                checkedDate: cylinder.checkedDate,
                weight: cylinder.weight,
                dynamicDate: moment(cylinder.createdAt).format('DD/MM/YYYY HH:mm:ss'),
                dynamicPlace: target.name
              };
            })));
          }
        }


        return returnData
      }));
      //Unique all duplicate unit
      // dataSet = await _.uniqWith(dataSet, _.isEqual);
      return dataSet;
    } catch (error) {
      throw error;
    }
  },

  getTurnBackInfo: async function(userInfo, factoryId, beginTime, endTime) {
    // Get begin and end time if not put it in current.
    let begin = !beginTime ? moment.utc() : moment.utc(beginTime);
    let end = !endTime ? moment.utc().add(1, 'days') : moment.utc(endTime).add(1, 'days');

    let credential = {
      createdAt: {'>=': begin.toISOString(), '<': end.toISOString()},
      to: userInfo.id
    };

    try {
      // for turnback from customer
      const customerTurnbackCredential = Object.assign({
        type: 'TURN_BACK'
      }, credential);
      const historyTurnBack = await History.find(customerTurnbackCredential).populate('cylinders');
      let listCylindersFromCustomer = await getCylindersId(historyTurnBack, factoryId);

      // for turnback from sale
      const saleTurnbackCredential = Object.assign({
        type: 'IMPORT',
        typeForPartner: 'BUY'
      }, credential);
      const historySale = await History.find(saleTurnbackCredential).populate('cylinders');
      let listCylindersFromSale = await getCylindersId(historySale, factoryId);

      // for turnback from rent
      const rentTurnbackCredential = Object.assign({
        type: 'IMPORT',
        typeForPartner: 'RENT'
      }, credential);
      const historyRent = await History.find(rentTurnbackCredential).populate('cylinders');
      let listCylindersFromRent =  await getCylindersId(historyRent, factoryId);

      // for turnback from sale
      const fixTurnbackCredential = Object.assign({
        type: 'IMPORT',
        typeForPartner: 'TO_FIX'
      }, credential);
      const historyFix = await History.find(fixTurnbackCredential).populate('cylinders');
      let listCylindersFromFixer = await getCylindersId(historyFix, factoryId);

      data = {
        listCylindersFromCustomer,
        listCylindersFromSale,
        listCylindersFromRent,
        listCylindersFromFixer
      };
      return data;
    } catch (error) {
      throw error;
    }
  },
  getDataForTruck : async function (id) {
    
    let dataSet = [];
    
    try {
      
      const listTruck = await Truck.find({ owner: id, isDeleted : false })
  
      if (listTruck && listTruck.length>0) {
        await Promise.all(listTruck.map(
          async truck => {            
           
                let set = {
                  licensePlate: truck.license_plate,
                  loadCapacity: truck.load_capacity,
                }
  
                dataSet.push(set)
            //   }))         
            // }
          }
        ))
      }
        
      //Unique all duplicate unit
      dataSet = await _.uniqWith(dataSet, _.isEqual);
      return dataSet;
    } catch (error) {
      throw error;
    }
  },
  getDataForDuplicate : async function (serial) {
    
    let dataSet = [];
    
    try {
      
      const listDuclicate = await Truck.find({ serial: serial })
  
      if (listDuclicate && listDuclicate.length>0) {
        await Promise.all(listDuclicate.map(
          async DuclicateCylinder => {            
           
                let set = {
                  serial: DuclicateCylinder.serial,
                }
  
                dataSet.push(set)
            //   }))         
            // }
          }
        ))
      }
        
      //Unique all duplicate unit
      dataSet = await _.uniqWith(dataSet, _.isEqual);
      return dataSet;
    } catch (error) {
      throw error;
    }
  },
  getDataForCylinder : async function (serial) {
    
    let dataSet = [];
    
    try {
      
      const listDuclicate = await Truck.find({ serial: serial })
  
      if (listDuclicate && listDuclicate.length>0) {
        await Promise.all(listDuclicate.map(
          async DuclicateCylinder => {            
           
                let set = {
                  serial: DuclicateCylinder.serial,
                }
  
                dataSet.push(set)
            //   }))         
            // }
          }
        ))
      }
        
      //Unique all duplicate unit
      dataSet = await _.uniqWith(dataSet, _.isEqual);
      return dataSet;
    } catch (error) {
      throw error;
    }
  }
};

// *************** Function to get root Parent of user tree
async function getRootParent(parentId) {
  try {
      if (parentId === null || typeof parentId === 'undefined' || parentId === '') { return ''; }
      let parent = await User.findOne({ id: parentId });
      if (!parent) { return ''; }
      if (parent.userType === USER_TYPE.Factory && parent.userRole === USER_ROLE.SUPER_ADMIN) { return parent; }
      return await getRootParent(parent.isChildOf);
  }
  catch (error) {
      console.log(error.message)
  }
};

// ************* Get list cylinder Id from history ************
getCylindersId = async function(histories, factoryId) {
  let result = [];
  await Promise.all(histories.map(async history => {
    const isRightPath = await _.takeWhile(history.cylinders, cylinder => { return cylinder.factory === factoryId;});
    if(isRightPath.length > 0) {
      const listCylindersId = await history.cylinders.map(cylinder => {return cylinder.id;});
      result = result.concat(listCylindersId);
    }
  }));
  return result;
};

// ******** This private function for Calculate Inventory of User  **************
getTotalImportCylinder = async function(userInfo, factoryId) {
  let totalImportCylinder = 0;
  let credential = {
    to: userInfo.id,
    type: 'IMPORT'
  };
  if(userInfo.userType === USER_TYPE.Factory){
    credential.typeForPartner = {'!=' : 'TO_FIX'};
  }
  const importHistories = await History.find(credential).populate('cylinders');
  importHistories.map( history => {
    history.cylinders.map(cylinder => {
      if(cylinder.factory && cylinder.factory === factoryId) {totalImportCylinder ++;}
    });
  });
  return totalImportCylinder;
};

// *********************** Get Cylinder saled for customer ***********************
getCylinderSaled = async function(userId, inventoryInfo) {
  // Agency
  let allChildSales = await getAllAgencyChild(userId, true);
  await Promise.all(allChildSales.map(async agency => {
    const numberSaled = await Cylinder.count({current: agency.id, placeStatus: 'IN_CUSTOMER'});
    inventoryInfo.atResident = inventoryInfo.atResident + numberSaled;
  }));

  // Self
  
    const numberSaledByGeneral = await Cylinder.count({current: userId, placeStatus: 'IN_CUSTOMER'});
    inventoryInfo.atResident = inventoryInfo.atResident + numberSaledByGeneral;

};

getInventoryAtChilds = async function (userInfo, factoryId, inventoryInfo, levels, inventoryRootData = null) {
  //Only query child allow report
  const childs = await User.find({isChildOf: userInfo.id, allowReport: true});
  let level = levels ? levels + 1 : 1;
  await Promise.all(childs.map(async child => {
    await getInventory(child, factoryId, inventoryInfo, level, inventoryRootData);
  }));
};

getInventory = async function (userInfo, factoryId, inventoryInfo, level, inventoryRootData) {
  const currentInventory = await Cylinder.count({current: userInfo.id, placeStatus: {'!=': 'IN_CUSTOMER'}});
  if(level === 1) {
    switch(userInfo.userType) {
      case USER_TYPE.Factory:
        if(!inventoryInfo.atFactoryChilds) {inventoryInfo.atFactoryChilds = 0;}
        inventoryInfo.atFactoryChilds = inventoryInfo.atFactoryChilds + currentInventory;
        getInventoryAtChilds(userInfo, factoryId, inventoryInfo, level, inventoryInfo.atFactoryChilds);
        break;
      case USER_TYPE.General:
        if(!inventoryInfo.atGeneralChilds) {inventoryInfo.atGeneralChilds = 0;}
        inventoryInfo.atGeneralChilds = inventoryInfo.atGeneralChilds + currentInventory;
        getInventoryAtChilds(userInfo, factoryId, inventoryInfo, level, inventoryInfo.atGeneralChilds);
        break;
      case USER_TYPE.Agency:
        if(!inventoryInfo.atAgencyChilds) {inventoryInfo.atAgencyChilds = 0;}
        inventoryInfo.atAgencyChilds = inventoryInfo.atAgencyChilds + currentInventory;
        break;
    }
  } else {
    inventoryRootData = inventoryRootData + currentInventory;
  }
};
// ******** Get inventory at Fixer of childs Factory **************
getAllInventoryAtFixerChildsFactory = async function(userId, factoryId , inventoryInfo) {
  const fixers = await User.find({isChildOf: userId, allowReport: true, userType: USER_TYPE.Fixer});
  await Promise.all(fixers.map(async fixer => {
    const inventory = await Cylinder.count({factory: factoryId, placeStatus: 'IN_REPAIR', current: fixer.id});
    if(inventory !== 0) {
      if(!inventoryInfo.atFixer) {inventoryInfo.atFixer = 0;}
      inventoryInfo.atFixer = inventoryInfo.atFixer + inventory;
    }
  }));
};

// ******** Get inventory at partner **************
getAllInventoryAtPartner = async function(userId, factoryId) {
  const listPartnerIds = await PartnerServices.getListPartner(userId);
  let totalInventoryPartners = 0;
  await Promise.all(listPartnerIds.map(async partnerId => {
    const userInfo = {
      id: partnerId,
      userType: USER_TYPE.Factory
    };
    const totalImportPartner = await getTotalImportCylinder(userInfo, factoryId);
    let resident = {};
    await getCylinderSaled(partnerId, resident);
    const totalSaledAtPartner = resident.atResident ? resident.atResident : 0;
    totalInventoryPartners = totalInventoryPartners + (totalImportPartner - totalSaledAtPartner);
  }));
  return totalInventoryPartners;
};

// ******** This private function for calculate total Export Cylinder of User **************
calculateExport = function(userType, destinationType, numberOfCylinder, data, typeForPartner = null) {
  const valueToAdd = Number(numberOfCylinder);
  switch(destinationType) {
    case USER_TYPE.Factory:
      // if(userType === USER_TYPE.Factory && typeForPartner) {
      //   if(typeForPartner === 'RENT') {
      //     data.totalExportRent = data.totalExportRent + valueToAdd;
      //   }
      //   if(typeForPartner === 'BUY') {
      //     data.totalExportSale = data.totalExportSale + valueToAdd;
      //   }
      // }
      break;
    case USER_TYPE.Station://Tram chiet
      if(userType === USER_TYPE.Factory) {
        data.totalExportToStation = data.totalExportToStation + valueToAdd;
      }
      break;
    case USER_TYPE.General://TNMB - Thuong Nhan Mua Ban
      if(userType === USER_TYPE.Factory || userType === USER_TYPE.Station) {data.totalExportToGeneral = data.totalExportToGeneral + valueToAdd;}
      break;
    case USER_TYPE.Agency://CHBL - Cua Hang Ban Le
      if(userType === USER_TYPE.Factory || userType === USER_TYPE.Station|| userType === USER_TYPE.General) {data.totalExportToAgency = data.totalExportToAgency + valueToAdd;}
      break;
    case USER_TYPE.Normal://ND - Khach hang
      if(userType === USER_TYPE.Agency|| userType === USER_TYPE.General) {data.totalExportToCustomer = data.totalExportToCustomer + valueToAdd;}
      break;
    default :
      break;
  }
  return data;
};

// ******** This private function for calculate total Relationship with current user **************
calculateChilds = function(relativeUsers, data) {
  relativeUsers.map(item => {
    switch(item.userType) {
      case USER_TYPE.Station://Tram chiet
        data.totalStation = ++data.totalStation;
        break;
      case USER_TYPE.General://TNMB - Thuong Nhan Mua Ban
        data.totalGeneral = ++data.totalGeneral;
        break;
      case USER_TYPE.Agency://CHBL - Cua Hang Ban Le
        data.totalAgency = ++data.totalAgency;
        break;
      default :
        break;
    }
  });
  return data;
};

// **** Utils for date *****
getFirstAndLastDayOfMonth = function(year) {
  // month in moment is 0 based, so 9 is actually october, subtract 1 to compensate
  // array is 'year', 'month', 'day', etc
  let result = [];
  for(let month = 1; month <= 12; month++) {
    var startDate = moment([year, month - 1]);
    // Clone the value before .endOf()
    var endDate = moment(startDate).endOf('month');
    result.push({ start: startDate.toISOString(), end: endDate.toISOString() });
  }

  // make sure to call toDate() for plain JavaScript date type
  return result;
};

// ********** Get All Agency Child*********
getAllAgencyChild =  async function(userRootId, isHasAllowReport = false) {
  let allChildAgency = [];
  const levels = [USER_TYPE.Factory, USER_TYPE.General, USER_TYPE.Agency];
  try {
    await Promise.all(levels.map(async type => {
      let credential = {
        userType: type,
        isChildOf: userRootId
      };
      if(isHasAllowReport){credential.allowReport = true;}
      const users = await User.find(credential);
      if(users.length > 0 ) {
        await Promise.all(users.map(async user => {
          if(user.userType === USER_TYPE.Agency) {allChildAgency.push(user);}
          const agencies = await getAgency(user.id);
          if(agencies.length > 0) {allChildAgency = allChildAgency.concat(agencies);}
        }));
      }
    }));
  } catch (error) {
    console.log('Error when get all AgencyChild::', error);
  }
  return allChildAgency;
};

getAgency = async function(userId, isHasAllowReport = false) {
  let finalAgencies = [];
  try {
    let credential = {
      userType: USER_TYPE.Agency,
      isChildOf: userId
    };
    if(isHasAllowReport){credential.allowReport = true;}
    const agencies = await User.find(credential);
    await Promise.all(agencies.map(async agency => {
      let agencies = [];
      if(agency.userRole === 'owner' || agency.userRole === 'superAdmin') {
        agencies = await getAgency(agency.id);
      }
      finalAgencies.push(agency);
      finalAgencies = finalAgencies.concat(agencies);
    } ));
  } catch (error) {
    console.log('Error when get agency Child:', error);
  }
  return finalAgencies;
};



