const PlaceStatus = require('../constants/PlaceStatus');
const UserTypes = require('../constants/UserTypes');
const excelToJson = require('convert-excel-to-json');

module.exports = {
  /**
     * Parse excel to cylinder json list
     * @param files
     * @returns {Promise}
     */
  excelToCylinder: async function (files,ownerId, fixerId, companyId, classification, manufacture) {
    //console.log(files);
    const excel = files[0];
    let result = {
      body: [],
      err:'non of error',
      status: false
    };

    const cylinders = excelToJson({
      sourceFile: excel.fd,
      header: {
        rows: 1
      },
      // columnToKey: {
      //   A: 'serial',
      //   B: 'img_url',
      //   C: 'color',
      //   D: 'checkedDate',
      //   E: 'weight',
      //   F: 'placeStatus',
      //   G: 'status',
      //   H: 'circleCount',
      //   I: 'currentImportPrice',
      //   J: 'manufacture'
      // }
      columnToKey: {
        A: 'serial',        
        B: 'color',
        C: 'valve',
        //E: 'classification',
        D: 'checkedDate',
        E: 'weight',        
        //F: 'manufacture'
      }
    });
    //return Cylinder.createEach(cylinders.Sheet1).fetch();
    let body = [];
    let errorLogs = [];
    const datas = cylinders.Sheet1;
    // console.log('REMOVE EXCEL::::', datas);
    if(datas.length > 0) {
      for(let i = 0; i < datas.length; i++){
        createdData = await createEach(datas[i], i+2, ownerId, fixerId, companyId, classification, manufacture);
        if(!createdData.status) {
          errorLogs.push(createdData.err);
          //break;
        } else {
          //console.log('Created data::::', createdData);
          body.push(createdData.data);
        }
      }
    } else {
      result.err = 'Data import is empty';
      result.status = false;
    }

    if(body.length === datas.length ){
      result.status = true;
      result.body = body;

    }

    if(errorLogs.length > 0) {
      result.err = errorLogs.join(';');
    }

    //console.log('RESULT IMPORT::::', result);
    return result;
  },

  excelReqToCylinder: async function (files, ownerId, id_ReqTo, classification, manufacture) {
    //console.log(files);
    const excel = files[0];
    let result = {
      body: [],
      err:'non of error',
      status: false
    };

    const cylinders = excelToJson({
      sourceFile: excel.fd,
      header: {
        rows: 1
      },
      // columnToKey: {
      //   A: 'serial',
      //   B: 'img_url',
      //   C: 'color',
      //   D: 'checkedDate',
      //   E: 'weight',
      //   F: 'placeStatus',
      //   G: 'status',
      //   H: 'circleCount',
      //   I: 'currentImportPrice',
      //   J: 'manufacture'
      // }
      columnToKey: {
        // A: 'serial',
        // B: 'img_url',
        // C: 'color',
        // D: 'checkedDate',
        // E: 'weight',
        // F: 'currentImportPrice',
        // G: 'manufacture'
        A: 'serial',        
        B: 'color',
        C: 'valve',
        //E: 'classification',
        D: 'checkedDate',
        E: 'weight',        
        // F: 'manufacture'
      }
    });
    //return Cylinder.createEach(cylinders.Sheet1).fetch();
    let body = [];
    let errorLogs = [];
    const datas = cylinders.Sheet1;
    // console.log('REMOVE EXCEL::::', datas);

    try {
      if (datas.length > 0) {
        const createReq = await ReqImport.create({
          id_ReqFrom: ownerId,
          id_ReqTo: id_ReqTo,
          createdBy: ownerId,
          status_Req: 'INIT'
        }).fetch()
        if (createReq.id) {
          for (let i = 0; i < datas.length; i++) {
            createdData = await createEachReqDetail(datas[i], i + 2, ownerId, id_ReqTo, createReq.id, classification, manufacture);
            if (!createdData.status) {
              errorLogs.push(createdData.err);
              //break;
            } else {
              //console.log('Created data::::', createdData);
              body.push(createdData.data);
            }

            // let createDetailReq = await DetailReqImport.create({
            //   request: createReq.id,
            //   serial: datas[i].serial,
            //   img_url: datas[i].img_url,
            //   color: datas[i].color,
            //   checkedDate: datas[i].checkedDate,
            //   weight: datas[i].weight,
            //   currentImportPrice: datas[i].currentImportPrice,
            //   manufacture: datas[i].manufacture
            // }).fetch()

            // if (createDetailReq) {
            //   body.push(createDetailReq)
            // }
            // else {
            //   errorLogs.push(datas[i].serial)
            // }
          }
        }

      } else {
        result.err = 'Data import is empty';
        result.status = false;
      }

      if (body.length === datas.length) {
        result.status = true;
        result.body = body;

      }

      if (errorLogs.length > 0) {
        result.err = errorLogs.join(';');
      }

      //console.log('RESULT IMPORT::::', result);
      return result;
    }
    catch (err) {
      result.status = false
      result.err = err.message
      return result
    }
    
  },

  //
  excelToCylinderFromSubsidiary: async function (files, ownerId, classification, manufacture, category,/* assetType, rentalPartner, */ isChildOf, userType) {
    //console.log(files);
    const excel = files[0];
    let result = {
      body: [],
      err:'không có lỗi',
      status: false,
      resCode: '',
      duplicateCylinders: [],
    };

    const cylinders = excelToJson({
      sourceFile: excel.fd,
      header: {
        rows: 1
      },
      // columnToKey: {
      //   A: 'serial',
      //   B: 'img_url',
      //   C: 'color',
      //   D: 'checkedDate',
      //   E: 'weight',
      //   F: 'placeStatus',
      //   G: 'status',
      //   H: 'circleCount',
      //   I: 'currentImportPrice',
      //   J: 'manufacture'
      // }
      // sheets: [{
      //   name: 'data',
      //   columnToKey: {
      //     A: 'serial',        
      //     B: 'color',
      //     C: 'valve',
      //     //E: 'classification',
      //     D: 'checkedDate',
      //     E: 'weight',        
      //     // F: 'manufacture'
      //   }
      // }],
      columnToKey: {
        A: 'serial',        
        B: 'color',
        C: 'valve',
        //E: 'classification',
        D: 'checkedDate',
        E: 'weight',        
        // F: 'manufacture'
      }
    });
    //return Cylinder.createEach(cylinders.Sheet1).fetch();
    let body = [];
    let errorLogs = [];

    // Kiểm tra nếu không có Sheet nào
    if (Object.keys(cylinders).length === 0) {
      result.status = false
      result.err = 'File excel rỗng, không có Sheet nào'
      return result
    }
    // Lấy tên của Sheet đầu tiên
    const firstSheet = Object.keys(cylinders)[0]
    // Lấy dữ liệu của Sheet đầu tiên
    const datas = cylinders[firstSheet];
     
    // let datas
    // if (Array.isArray(cylinders)) {
    //   datas = cylinders[0];
    // }
    // else {
    //   datas = cylinders
    // }
    
    // console.log('REMOVE EXCEL::::', datas);
    const idImex = Date.now()
    if(datas.length > 0) {
      // for(let i = 0; i < datas.length; i++){
        await Promise.all(datas.map(async data => {
          const createdData = await createEachFromSubsidiary(data, /* index + 2, */ ownerId, classification, manufacture, category, /* assetType, rentalPartner, */ isChildOf, userType, idImex);
          if (!createdData.status) {
            errorLogs.push(createdData.err);
            // Kiểm tra xem mã lỗi là trùng bình
            // Thêm vao danh sách riêng
            if (createdData.resCode === 'ERROR-00090') {
              result.duplicateCylinders.push(data)
            }
            //break;
          } else {
            //console.log('Created data::::', createdData);
            body.push(createdData.data);
          }
        }))
        
      // }
    } else {
      result.err = 'Dữ liệu nhập bị rỗng.';
      result.status = false;
    }

    if(body.length === datas.length ){
      result.status = true;
      result.body = body;

    }

    if(errorLogs.length > 0) {
      result.err = errorLogs.join(';');
      // Nếu có bình trùng thì đổi resCode === ERROR-00090
      // *** Chú ý:
      // Vẫn có thể xảy ra trường hợp lỗi
      // Bao gồm bình trùng + lỗi khác
      if (result.duplicateCylinders.length > 0) {
        result.resCode = 'ERROR-00090'
      }
    }

    //console.log('RESULT IMPORT::::', result);
    return result;
  },

  /**
     * Parse excel to cylinder json list
     * @param cylinder_id
     * @param user
     * @returns {Promise}
     */
  upPlaceStatus: async function (cylinder_id, user) {

    let cylinder = await Cylinder.findOne({id: cylinder_id});
    console.log(cylinder_id, cylinder, user);
    let newPlaceStatus = PlaceStatus.UN_KNOW;

    switch (cylinder.placeStatus) {
      case PlaceStatus.IN_FACTORY:
        if (user.userType !== UserTypes.Factory) {return false;}
        newPlaceStatus = PlaceStatus.DELIVERING;
        break;
        // case PlaceStatus.FACTORY2GENERAL:
        //     if (user.userType !== UserTypes.General) return false;
        //     newPlaceStatus = PlaceStatus.IN_GENERAL;
        //     break;
      case PlaceStatus.IN_GENERAL:
        if (user.userType !== UserTypes.General) {return false;}
        newPlaceStatus = PlaceStatus.DELIVERING;
        break;
        // case PlaceStatus.GENERAL2AGENCY:
        //     if (user.userType !== UserTypes.Agency) return false;
        //     newPlaceStatus = PlaceStatus.IN_AGENCY;
        //     break;
      case PlaceStatus.IN_AGENCY:
        if (user.userType !== UserTypes.Agency) {return false;}
        newPlaceStatus = PlaceStatus.DELIVERING;
        break;
        // case PlaceStatus.AGENCY2CUSTOMER:
        //     if(user.userType !== UserTypes.Factory) return null;
        //     break;
        // case PlaceStatus.IN_CUSTOMER:
        //     if(user.userType !== UserTypes.Factory) return null;
        //     break;
      default:
        return false;
    }

    return Cylinder.update({id: cylinder_id}).set({
      placeStatus: newPlaceStatus
    }).fetch();
  },

  // 
  createEachCylinders: async function (data, ownerId, parent, userType, idImex, prefix) {
    let createdData = {
      status: false,
      data: {},
      err: ''
    };
    try {
      const availableManufacture = await Manufacture.findOne({ where: { owner: parent, id: data.manufacture } });
      if (!availableManufacture) {
        createdData.err = `Manufacture ${data.manufacture} is not available on your system, please check data for ${data.serial}`;
        return createdData;
      }

      const isExistCategory = await CategoryCylinder.findOne({ id: data.category })
      if (!isExistCategory) {
        createdData.err = `Cannot find the cylinder type with id = ${data.category} in the system`;
        return createdData;
      }

      const exitsCylinder = await Cylinder.findOne({ serial: data.serial });
      if (exitsCylinder) {
        // if (prefix) {
        //   createdData.err = 'Đơn vị chưa khai báo mã tiền tố';
        //   return createdData;
        // }

        // Thêm tiền tố mã đơn vị vào serial
        data.serial = prefix + data.serial

        // Kiểm tra trùng mã trong cùng đơn vị
        const exitsDuplicateCylinder = await Cylinder.findOne({
            where: { serial: data.serial },
        });
        if (exitsDuplicateCylinder) {
          // Không được khai báo trùng mã trong cùng một đơn vị
          createdData.err = `The cylinder with serial ${data.serial} already exist`;
          return createdData;
        }

        // createdData.err = `The cylinder with serial ${data.serial} already exist`;
        // return createdData;
      }

      data.factory = parent;
      data.current = ownerId;
      data.placeStatus = userType === 'Factory' ? 'IN_FACTORY' : userType === 'Fixer' ? 'IN_REPAIR' : 'IN_' + userType.toUpperCase();
      // data.classification = classification;
      // data.manufacture = manufacture;
      data.manufacturedBy = ownerId;
      // data.category = category;
      data.createdBy = ownerId;

      const cylinder = await Cylinder.create(data).fetch();

      // Ghi tiếp vào bảng CylinderImex
      await CylinderImex.create({
        cylinder: cylinder.id,
        status: cylinder.status ? cylinder.status : 'EMPTY',
        condition: cylinder.classification ? cylinder.classification.toUpperCase() : 'NEW',
        idImex: idImex ? idImex : Date.now(),
        typeImex: 'IN',
        flow: 'CREATE',
        category: cylinder.category ? cylinder.category : null,
        manufacture: cylinder ? cylinder.manufacture: null,
        createdBy: ownerId,
        objectId: ownerId,
        // history: null,
      })
      
      //console.log('Created data::::', createdData);
      createdData.status = true;
      createdData.data = cylinder;

      return createdData;
    } catch (err) {
      createdData.err = err.message;
      return createdData;
    }
  }


};

/**
 * Action for /cylinder/create
 * @param req
 * @param res
 * @returns {*}
 */
async function createEach(data, index,ownerId, fixerId, companyId, classification, manufacture) {
  let createdData = {
    status: false,
    data: {},
    err: ''
  };
  try {
    const availableManufacture = await Manufacture.findOne({where: {owner: ownerId, id: manufacture}});

    if(!availableManufacture) {
      createdData.err = `Manufacture ${manufacture} is not available on your system, please check data at line ${index} of excel `;
      return createdData;
    }

    const exitsCylinder = await Cylinder.findOne({
      where: {serial: data.serial, manufacture: manufacture},
    });
    if(exitsCylinder) {
      createdData.err = `The cylinder with serial ${data.serial} with manufacture ${manufacture} already exist, please check data at line ${index} of excel `;
      return createdData;
    }
    if (!companyId) {
      data.factory = ownerId;
      data.current = fixerId ? fixerId : ownerId;
      data.placeStatus = fixerId ? 'IN_REPAIR' : 'IN_FACTORY';
      data.classification = classification;
      data.manufacture = manufacture;
      data.manufacturedBy = fixerId ? fixerId : ownerId;
    }
    else {
      data.factory = ownerId;
      data.current = companyId;
      data.placeStatus = 'IN_FACTORY';
      data.classification = classification;
      data.manufacture = manufacture;
      data.manufacturedBy = companyId;
    }
    // data.factory = ownerId;
    // data.current = fixerId ? fixerId : ownerId;
    // data.placeStatus =  fixerId ? 'IN_REPAIR' : 'IN_FACTORY';
    const cylinder = await Cylinder.create(data).fetch();
    //console.log('Created data::::', createdData);
    createdData.status = true;
    createdData.data = cylinder;
    return createdData;
  } catch (err) {
    createdData.err = err.message;
    return createdData;
  }
}

async function createEachReqDetail(data, index,ownerId, id_ReqTo, idRequest, classification, manufacture) {
  let createdData = {
    status: false,
    data:{},
    err: ''
  };
  try {
    const availableManufacture = await Manufacture.findOne({where: {owner: id_ReqTo, id: manufacture}});

    if(!availableManufacture) {
      createdData.err = `Manufacture ${manufacture} is not available on your system, please check data at line ${index} of excel `;
      return createdData;
    }

    const exitsCylinder = await Cylinder.findOne({
      //where: {serial: data.serial, manufacture: manufacture},
      serial: data.serial
    });
    if(exitsCylinder) {
      createdData.err = `The cylinder with serial ${data.serial} with manufacture ${manufacture} already exist, please check data at line ${index} of excel `;
      return createdData;
    }
    //data.factory = ownerId;
    //data.current = id_ReqTo ? id_ReqTo : ownerId;
    //data.placeStatus =  id_ReqTo ? 'IN_REPAIR' : 'IN_FACTORY';
    data.createdBy = ownerId;
    data.request = idRequest;
    data.classification = classification;
    data.manufacture = manufacture;
    const reqDetail = await DetailReqImport.create(data).fetch();
    //console.log('Created data::::', createdData);
    createdData.status = true;
    createdData.data = reqDetail;
    return createdData;
  } catch (err) {
    createdData.err = err.message;
    return createdData;
  }
}

async function createEachFromSubsidiary(data, /* index, */ ownerId, classification, manufacture, category, /* assetType, rentalPartner, */ isChildOf, userType, idImex) {
  let createdData = {
    status: false,
    data:{},
    err: '',
    resCode: '',
  };
  try {
    // const availableManufacture = await Manufacture.findOne({where: {owner: isChildOf, id: manufacture}});
    // if(!availableManufacture) {
    //   createdData.err = `Manufacture ${manufacture} is not available on your system, please check data at line ${index} of excel `;
    //   return createdData;
    // }

    // const isExistCategory = await CategoryCylinder.findOne({ id: category})
    // if (!isExistCategory) {
    //   createdData.err = `Không tìm thấy loại bình với id = ${category} trong hệ thống`;
    //   return createdData;
    // }

    const exitsCylinder = await Cylinder.findOne({
      // where: {serial: data.serial, manufacture: manufacture},
      serial: data.serial
    });
    if(exitsCylinder) {
      // createdData.err = `The cylinder with serial ${data.serial} with manufacture ${availableManufacture.name} already exist, please check data at line ${index} of excel `;
      createdData.err = `Bình có mã ${data.serial} đã tồn tại.`;
      createdData.resCode = 'ERROR-00090';
      return createdData;
    }
    // if (!companyId) {
    //   data.factory = ownerId;
    //   data.current = fixerId ? fixerId : ownerId;
    //   data.placeStatus = fixerId ? 'IN_REPAIR' : 'IN_FACTORY';
    //   data.cylinderType = cylinderType;
    //   data.manufacture = manufacture;
    //   data.manufacturedBy = fixerId ? fixerId : ownerId;
    //   data.assetType = assetType;
    //   if (rentalPartner) {
    //     data.rentalPartner = rentalPartner;
    //   }    
    // }
    // else {
    //   data.factory = ownerId;
    //   data.current = companyId;
    //   data.placeStatus = 'IN_FACTORY';
    //   data.cylinderType = cylinderType;
    //   data.manufacture = manufacture;
    //   data.manufacturedBy = companyId;
    //   data.assetType = assetType;
    //   if (rentalPartner) {
    //     data.rentalPartner = rentalPartner;
    //   }    
    // }

    data.factory = isChildOf;
    data.current = ownerId;
    data.placeStatus = userType==='Factory' ? 'IN_FACTORY' : userType==='Fixer' ? 'IN_REPAIR' : 'IN_' + userType.toUpperCase();
    data.classification = classification;
    data.manufacture = manufacture;
    data.manufacturedBy = ownerId;
    data.category = category;
    data.createdBy = ownerId;
    // data.assetType = assetType;
    // if (rentalPartner) {
    //   data.rentalPartner = rentalPartner;
    // }

    const cylinder = await Cylinder.create(data).fetch();
    //console.log('Created data::::', createdData);    

    // Ghi tiếp vào bảng CylinderImex
    // let condition = ''
    // if (!cylinder.classification) {
    //   const record = await CylinderImex.find({
    //     cylinder: cylinder.id
    //   }).sort('createdAt DESC')

    //   if (record.length > 0) {
    //     condition = record[0].condition
    //   }
    //   else {
    //     condition = 'NEW'
    //   }
    // }

    await CylinderImex.create({
      cylinder: cylinder.id,
      status: cylinder.status ? cylinder.status : 'FULL',
      condition: cylinder.classification ? cylinder.classification.toUpperCase() : 'NEW',
      idImex: idImex ? idImex : Date.now(),
      typeImex: 'IN',
      flow: 'CREATE',
      category: cylinder.category,
      manufacture: cylinder ? cylinder.manufacture: null,
      createdBy: ownerId,
      objectId: ownerId,
      // history: null,
    })

    createdData.status = true;
    createdData.data = cylinder;

    return createdData;
  } catch (err) {
    createdData.err = err.message;
    return createdData;
  }
}
