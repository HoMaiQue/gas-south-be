const PlaceStatus = require('../constants/PlaceStatus');
const UserTypes = require('../constants/UserTypes');
const excelToJson = require('convert-excel-to-json');

module.exports = {
    //
    createDuplicateCylinderFromSubsidiary: async function (
        listCylinders,
        ownerId,
        classification,
        manufacture,
        category,
        isChildOf,
        userType,
        userPrefix,
    ) {
        let result = {
            body: [],
            err: 'không có lỗi',
            status: false,
            resCode: '',
            duplicateCylinders: [],
        };

        let body = [];
        let errorLogs = [];

        // // Kiểm tra nếu không có Sheet nào
        // if (Object.keys(cylinders).length === 0) {
        //     result.status = false
        //     result.err = 'File excel rỗng, không có Sheet nào'
        //     return result
        // }
        // // Lấy tên của Sheet đầu tiên
        // const firstSheet = Object.keys(cylinders)[0]
        // // Lấy dữ liệu của Sheet đầu tiên
        // const datas = cylinders[firstSheet];

        // Kiểm tra xem có dữ liệu bình hay không
        if (listCylinders.length === 0) {
            result.status = false
            result.err = 'Dữ liệu gửi lên không có bình nào'
            return result
        }

        try {
            const idImex = Date.now()
            // if (datas.length > 0) {
            await Promise.all(listCylinders.map(async dataCylinder => {
                const createdData = await createEachDuplicateFromSubsidiary(
                    dataCylinder,
                    ownerId,
                    classification,
                    manufacture,
                    category,
                    isChildOf,
                    userType,
                    userPrefix,
                    idImex
                );
                if (!createdData.status) {
                    errorLogs.push(createdData.err);
                    // Kiểm tra xem mã lỗi là trùng bình
                    // Thêm vao danh sách riêng
                    if (createdData.resCode === 'ERROR-00091') {
                        result.duplicateCylinders.push(dataCylinder)
                    }
                    //break;
                } else {
                    //console.log('Created data::::', createdData);
                    body.push(createdData.data);
                }
            }))
            // } else {
            //     result.status = false;
            //     result.err = 'Data import is empty';            
            // }

            if (body.length === listCylinders.length) {
                result.status = true;
                result.body = body;

            }

            if (errorLogs.length > 0) {
                result.err = errorLogs.join(';');
                // Nếu có bình trùng thì đổi resCode === ERROR-00090
                // *** Chú ý:
                // Vẫn có thể xảy ra trường hợp lỗi
                // Bao gồm bình trùng + lỗi khác
                if (result.duplicateCylinders.length > 0) {
                    result.resCode = 'ERROR-00091'
                }
            }

            //console.log('RESULT IMPORT::::', result);
            return result;
        }
        catch (error) {
            result.status = false
            result.err = error.message

            return result
        }

    },
}

async function createEachDuplicateFromSubsidiary(
    dataCylinder,
    ownerId,
    classification,
    manufacture,
    category,
    isChildOf,
    userType,
    userPrefix,
    idImex
) {
    let createdData = {
        status: false,
        data: {},
        err: '',
        resCode: '',
    };
    try {
        const exitsCylinder = await Cylinder.findOne({
            serial: dataCylinder.serial
        });
        if (exitsCylinder) {
            // createdData.err = `The cylinder with serial ${data.serial} already exist`;
            // createdData.resCode = 'ERROR-00091';
            // return createdData;

            // Thêm tiền tố mã đơn vị vào serial
            const _serial = userPrefix + dataCylinder.serial

            // Kiểm tra trùng mã trong cùng đơn vị
            const exitsDuplicateCylinder = await Cylinder.findOne({
                where: { serial: _serial },
            });
            if (exitsDuplicateCylinder) {
                // return res.badRequest(Utils.jsonErr('Không được khai báo trùng mã trong cùng một đơn vị'));
                createdData.err = `Bình có mã ${exitsDuplicateCylinder.serial} đã tồn tại`;
                createdData.resCode = 'ERROR-00091';
                return createdData;
            }

            dataCylinder.serial = _serial
            dataCylinder.prefix = userPrefix
            dataCylinder.isDuplicate = true
        }

        dataCylinder.factory = isChildOf;
        dataCylinder.current = ownerId;
        dataCylinder.placeStatus = userType === 'Factory' ? 'IN_FACTORY' : userType === 'Fixer' ? 'IN_REPAIR' : 'IN_' + userType.toUpperCase();
        dataCylinder.classification = classification;
        dataCylinder.manufacture = manufacture;
        dataCylinder.manufacturedBy = ownerId;
        dataCylinder.category = category;
        dataCylinder.createdBy = ownerId;

        const cylinder = await Cylinder.create(dataCylinder).fetch();
        //console.log('Created data::::', createdData);    

        if (cylinder && exitsCylinder) {
            // Cập nhật lại thông tin bình bị trùng
            await Cylinder.updateOne({ id: exitsCylinder.id })
                .set({ hasDuplicate: true })

            // Tạo thêm bản ghi bình trùng, bên collection DuplicateCylinder
            await DuplicateCylinder.create({
                serial: cylinder.serial,
                duplicate: exitsCylinder.id,
                copy: cylinder.id,
            })
        }

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
            flowDescription: 'DECLARE',
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
