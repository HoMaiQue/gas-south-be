var cron = require('node-cron');

const statistic = async function () {
    // console.log('CronJob', Date())
    try {
        const _dateNow = new Date();
        const startDate = new Date(
            _dateNow.getFullYear(),
            _dateNow.getMonth(),
            _dateNow.getDate() - 1
        )
        const endDate = new Date(
            _dateNow.getFullYear(),
            _dateNow.getMonth(),
            _dateNow.getDate() - 1,
            startDate.getHours() + 23, 59, 59, 999
        )

        const total = await Statistic.find({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        })

        if (total.length > 0) {
            await Log.create({
                inputData: JSON.stringify({
                    dateNow: _dateNow,
                    startDate: startDate,
                    endDate: endDate,
                }),
                type: 'CRON_ERROR_0001',
                content: 'Số liệu đã được thống kê trước đó',
                status: false
            });
            // console.log('Số liệu đã được thống kê trước đó.');
            return 1;
        }

        // // Khoảng thời gian cần thống kê
        // let startDate = '2021-06-14T17:00:00.000Z'
        // let endDate = '2021-06-15T16:59:59.999Z'

        // --- Tìm toàn bộ trạm của GasSouth --- //
        // Tìm thông tin công ty mẹ
        const userRoot = await User.findOne({ email: 'gassouth@pgs.com.vn' })
        // const userRoot = await User.findOne({ email: '1911gassouth@gmail.com' })

        // Tìm các chi nhánh của công ty mẹ
        const userRegion = await User.find({
            isChildOf: userRoot.id,
            userType: { in: ['Region', 'Fixer'] },
            userRole: 'SuperAdmin',
        })
        // Lấy danh sách id của các chi nhánh
        const idsUserRegion = await getUsersId(userRegion)

        // Tìm các trạm của chi nhánh
        const userStation = await User.find({
            isChildOf: { in: idsUserRegion },
            // ==> [TEST] chi nhánh Nam Trung Bộ
            // isChildOf: '5f5eee9aa80d000828c25c70',
            // <== [TEST]
            userType: 'Factory',
            userRole: 'Owner',
            isDeleted: false,
        })

        // Trường hợp đặc biệt thêm NMSC vào danh sách các trạm cần tính
        // ==> [TEST]
        // const userStation = [userRegion.find(region => region.userType === 'Fixer')]
        // <== [TEST]
        const userFixer = userRegion.find(region => region.userType === 'Fixer')
        if (userFixer) {
            userStation.push(userFixer)
        }


        // Tìm danh sách loại bình
        const cylinderCategory = await CategoryCylinder.find({
            createdBy: userRoot.id,
            isDeleted: false
        })
        const _numberCategory = cylinderCategory.length

        // // Tìm danh sách thương hiệu
        // const cylinderManufacture = await Manufacture.find({
        //     owner: userRoot.id,
        //     isDeleted: false,
        // })

        // // Tình trạng bình
        // const cylinderCondition = ['NEW', 'OLD']

        const data = await Promise.all(userStation.map(async station => {
            // Tạo cấu trúc dữ liệu trả về
            // let returnData = []
            let returnData = await Promise.all(cylinderCategory.map(category => {
                // await Promise.all(cylinderManufacture.map(async eachManufacture => {
                //     await Promise.all(cylinderCondition.map(async eachCondition => {
                        // returnData.push({
                        return {
                            // --- Thời gian thống kê --- //
                            startDate,
                            endDate,

                            // --- Thông tin trạm --- //
                            idStation: station.id,
                            nameStation: station.name,

                            // --- Thông tin loại bình --- //
                            idCylinderType: category.id,
                            codeCylinderType: category.code,
                            nameCylinderType: category.name,
                            massCylinderType: category.mass,

                            // // --- Thông tin thương hiệu --- //
                            // idManufacture: eachManufacture.id,
                            // nameManufacture: eachManufacture.name,

                            // // --- Thông tin tình trạng bình --- //
                            // conditionCylinder: eachCondition,

                            // --- Thông tin thống kê --- //
                            // Tạo mới
                            create: 0,
                            // Nhập vỏ
                            importShellFromFixer: 0,
                            importShellFromElsewhere: 0,
                            turnback: 0,
                            returnFullCylinder: 0,  // hồi lưu bình đầy
                            // Xuất vỏ:
                            exportShellToFixer: 0,
                            exportShellToElsewhere: 0,
                            // Xuất hàng:
                            numberExport: 0,
                            massExport: 0,
                            // Thanh lý  
                            cancel: 0,  /* Tạm thời chưa tính */
                            // Tồn kho
                            inventory: 0,
                        }
                //     }))
                // }))
            }))

            // BEGIN === Code tạm ===
            // Coi nhà máy được tạo bởi công ty mẹ là Chi nhánh Bình Khí
            // const fixers = await User.find({
            //     isChildOf: userRoot.id,
            //     userType: 'Fixer',
            //     userRole: 'SuperAdmin',
            //     isDeleted: false,
            // })
            // const infoBinhKhi = fixers[0]

            const infoBinhKhi = userRegion.find(user => user.userType === 'Fixer')
            // END === Code tạm ===

            // *** BEGIN Tính số lượng khai báo bình ***
            // Tính số lượng bình được khai báo trong khoảng thời gian
            // Và lọc danh sách bình theo từng loại
            await Promise.all(returnData.map(async (cylinderType, index) => {
                const count = await CylinderImex.count({
                    createdAt: { '>=': startDate, '<=': endDate },
                    objectId: station.id,
                    category: cylinderType.idCylinderType,
                    flow: 'CREATE',
                })

                returnData[index].create = count
            }))
            // *** END Tính số lượng khai báo bình ***


            // *** BEGIN Tính nhập bình ***
            // Tìm bản ghi nhập bình trong khoảng thời gian
            let importHistoryRecord = await History.find({
                createdAt: { '>=': startDate, '<=': endDate },
                to: station.id,
                type: { in: ['IMPORT', 'TURN_BACK', 'RETURN'] },
            }).populate('cylinders')

            // Trường hợp có nhà máy (Bình Khí)
            if (infoBinhKhi) {
                // Tìm bản ghi nhập vỏ từ Chi nhánh Bình Khí
                let importHR_fromFixer = _.remove(importHistoryRecord, o => {
                    return o.from === infoBinhKhi.id
                        && o.type === 'IMPORT'
                        && o.typeForPartner !== '';
                });
                if (importHR_fromFixer.length > 0) {
                    await Promise.all(importHR_fromFixer.map(async history => {
                        // Lọc danh sách bình theo từng loại
                        for (let i = 0; i < _numberCategory; i++) {
                            const count = _.remove(history.cylinders, o => { return o.category === returnData[i].idCylinderType; });
                            returnData[i].importShellFromFixer += count.length
                        }
                    }))
                }
            }

            // Tìm bản ghi nhập vỏ từ nơi khác
            let importHR_fromElsewhere = _.remove(importHistoryRecord, o => {
                return o.type === 'IMPORT'
                    && o.typeForPartner !== '';
            });
            if (importHR_fromElsewhere.length > 0) {
                await Promise.all(importHR_fromElsewhere.map(async history => {
                    // Lọc danh sách bình theo từng loại
                    for (let i = 0; i < _numberCategory; i++) {
                        const count = _.remove(history.cylinders, o => { return o.category === returnData[i].idCylinderType; });
                        returnData[i].importShellFromElsewhere += count.length
                    }
                }))
            }

            // Tìm bản ghi hồi lưu bình đầy
            let return_fullCylinders = _.remove(importHistoryRecord, o => {
                return /* o.from !== infoBinhKhi.id && */ o.type === 'RETURN';
            });
            if (return_fullCylinders.length > 0) {
                await Promise.all(return_fullCylinders.map(async history => {
                    // Lọc danh sách bình theo từng loại
                    for (let i = 0; i < _numberCategory; i++) {
                        const count = _.remove(history.cylinders, o => { return o.category === returnData[i].idCylinderType; });
                        returnData[i].returnFullCylinder += count.length
                    }
                }))
            }

            // Tìm bản ghi hồi lưu trong importHistoryRecord
            let turnbackHR = _.remove(importHistoryRecord, o => {
                return o.type === 'TURN_BACK';
            });
            if (turnbackHR.length > 0) {
                await Promise.all(turnbackHR.map(async history => {
                    // Lọc danh sách bình theo từng loại
                    for (let i = 0; i < _numberCategory; i++) {
                        const count = _.remove(history.cylinders, o => { return o.category === returnData[i].idCylinderType; });
                        returnData[i].turnback += count.length
                    }
                }))
            }
            // *** END Tính nhập bình ***


            // *** BEGIN Tính xuất vỏ ***
            // Tìm bản ghi xuất vỏ trong khoảng thời gian
            // OLD-VERSION: Chỉ tính xuất vỏ có bản ghi nhập tương ứng
            // NEW-VERSION: Có thể phát sinh lỗi khi xuất vỏ cho trạm và Bình Khí cùng 1 lúc
            let exportShellHistoryRecord = await History.find({
                createdAt: { '>=': startDate, '<=': endDate },
                from: station.id,
                // type: 'IMPORT', // OLD-VERSION
                type: 'EXPORT', // NEW-VERSION
                typeForPartner: { '!=': '' },
            })
                .populate('toArray')
                .populate('cylinders')

            // Trường hợp có nhà máy (Bình Khí)
            if (infoBinhKhi) {
                // Tìm bản ghi xuất vỏ tới Chi nhánh Bình Khí
                let exportHR_toFixer = _.remove(exportShellHistoryRecord, o => {
                    // return o.to === infoBinhKhi.id;
                    return o.typeForPartner === 'TO_FIX' && o.toArray.find(_to => _to.id === infoBinhKhi.id);
                });
                if (exportHR_toFixer.length > 0) {
                    await Promise.all(exportHR_toFixer.map(async history => {
                        // Lọc danh sách bình theo từng loại
                        for (let i = 0; i < _numberCategory; i++) {
                            const count = _.remove(history.cylinders, o => { return o.category === returnData[i].idCylinderType; });
                            returnData[i].exportShellToFixer += count.length
                        }
                    }))
                }
            }

            // Còn lại là bản ghi xuất vỏ tới nơi khác trong importHistoryRecord;
            if (exportShellHistoryRecord.length > 0) {
                await Promise.all(exportShellHistoryRecord.map(async history => {
                    // Lọc danh sách bình theo từng loại
                    for (let i = 0; i < _numberCategory; i++) {
                        const count = _.remove(history.cylinders, o => { return o.category === returnData[i].idCylinderType; });
                        returnData[i].exportShellToElsewhere += count.length
                    }
                }))
            }
            // *** END Tính xuất vỏ ***


            // *** BEGIN Tính xuất hàng ***
            // Tìm bản ghi xuất hàng trong khoảng thời gian
            let exportHistoryRecord = await History.find({
                createdAt: { '>=': startDate, '<=': endDate },
                from: station.id,
                type: 'EXPORT',
                typeForPartner: '',
            })
                .populate('cylinders')

            if (exportHistoryRecord.length > 0) {
                await Promise.all(exportHistoryRecord.map(async history => {
                    // Lọc danh sách bình theo từng loại
                    await Promise.all(returnData.map(async (cylinderType, index) => {
                        const count = _.remove(history.cylinders, o => { return o.category === cylinderType.idCylinderType; });
                        returnData[index].numberExport += count.length
                        returnData[index].massExport += (count.length * cylinderType.massCylinderType)
                    }))
                    // for (let i = 0; i < _numberCategory; i++) {
                    //     const count = _.remove(history.cylinders, o => { return o.category === returnData[i].idCylinderType; });
                    //     returnData[i].numberExport += count.length
                    // }
                }))
            }
            // *** END Tính xuất hàng ***


            // *** BEGIN Tính vỏ thanh lý ***
            // Lọc danh sách bình theo từng loại                
            await Promise.all(returnData.map(async (cylinderType, index) => {
                // Tìm bản ghi thánh lý trong khoảng thời gian
                const count = await CylinderImex.count({
                    createdAt: { '>=': startDate, '<=': endDate },
                    objectId: station.id,
                    category: cylinderType.idCylinderType,
                    flow: 'CANCEL',
                })
                returnData[index].cancel += count
            }))
            // *** END Tính vỏ thanh lý ***
           
            
            // *** BEGIN Tính tồn kho ***
            //
            //                        [dataStatistic]
            //                               6  7       7  8
            // -------------------------------||---------||---------------------------> Time
            //                             end  start end  start
            //      ^                    ^                      ^                    ^
            //      |                    |                      |                    |
            //      ----------------------                      ----------------------
            //      start                 end                   start                 end

            // Tìm bản ghi Statistic ngay sau endDate
            const lastDayStatistic = await Statistic.find({
                // startDate: { '>=': startDate },
                endDate: { '<=': endDate },
                idStation: station.id,
            })
                .sort('endDate DESC')
                .limit(1)

            // Trường hợp tìm thấy ngày có bản ghi Statistic
            if (lastDayStatistic.length !== 0) {
                // Tìm các bản ghi trong ngày đó
                const lastDataStatistic = await Statistic.find({
                    endDate: lastDayStatistic[0].endDate,
                    idStation: station.id,
                })

                // Lấy tồn kho của ngày gần nhất trong Statistic cho từng loại bình
                await Promise.all(returnData.map(async (cylinderType, index) => {
                    const foundIndex = lastDataStatistic.findIndex(
                        _dataStatistic => _dataStatistic.idCylinderType === cylinderType.idCylinderType
                    )

                    if (foundIndex !== -1) {
                        returnData[index].inventory = lastDataStatistic[foundIndex].inventory
                    }
                }))

                for (let i = 0; i < _numberCategory; i++) {
                    // Tìm bản ghi nhập kho tính từ bản ghi Statistic của ngày gần nhất đến endDate
                    const count_importHistoryRecord = await CylinderImex.count({
                        createdAt: { '>': lastDayStatistic[0].endDate, '<=': endDate },
                        objectId: station.id,
                        category: returnData[i].idCylinderType,
                        typeImex: 'IN',
                    })

                    // Tìm bản ghi xuất kho tính từ bản ghi Statistic của ngày gần nhất đến endDate
                    const count_exportHistoryRecord = await CylinderImex.count({
                        createdAt: { '>': lastDayStatistic[0].endDate, '<=': endDate },
                        objectId: station.id,
                        category: returnData[i].idCylinderType,
                        typeImex: 'OUT',
                    })

                    returnData[i].inventory += (count_importHistoryRecord - count_exportHistoryRecord)
                }

            }
            // Trường hợp không tìm thấy bản ghi Statistic nào
            else {
                for (let i = 0; i < _numberCategory; i++) {
                    // Tìm bản ghi nhập kho tính đến endDate
                    const count_importHistoryRecord = await CylinderImex.count({
                        createdAt: { '<=': endDate },
                        objectId: station.id,
                        category: returnData[i].idCylinderType,
                        typeImex: 'IN',
                    })

                    // Tìm bản ghi xuất kho tính đến endDate
                    const count_exportHistoryRecord = await CylinderImex.count({
                        createdAt: { '<=': endDate },
                        objectId: station.id,
                        category: returnData[i].idCylinderType,
                        typeImex: 'OUT',
                    })

                    returnData[i].inventory = count_importHistoryRecord - count_exportHistoryRecord
                }
            }
            // *** END Tính tồn kho ***

            // // *** BEGIN Tính tồn kho ***
            // for (let i = 0; i < _numberCategory; i++) {
            //     // Tìm bản ghi nhập kho tính đến endDate
            //     const count_importHistoryRecord = await CylinderImex.count({
            //         createdAt: { '<=': endDate },
            //         objectId: station.id,
            //         category: returnData[i].idCylinderType,
            //         typeImex: 'IN',
            //     })

            //     // Tìm bản ghi xuất kho tính đến endDate
            //     const count_exportHistoryRecord = await CylinderImex.count({
            //         createdAt: { '<=': endDate },
            //         objectId: station.id,
            //         category: returnData[i].idCylinderType,
            //         typeImex: 'OUT',
            //     })

            //     returnData[i].inventory = count_importHistoryRecord - count_exportHistoryRecord
            // }
            // // *** END Tính tồn kho ***


            // *** Ghi thông tin thống kê vào collection Statistic
            await Promise.all(returnData.map(async _dataStatistic => {
                await Statistic.create(_dataStatistic)
            }))

            return returnData
        }))

        // console.log(data)
    } catch (error) {
        // console.log('ERROR', error.message);

        await Log.create({
            inputData: '',
            type: 'CRON_ERROR_0002',
            content: error.message,
            status: false
        });
    }
}

const getUsersId = async function (users) {
    const result = await Promise.all(users.map(async user => {
        return user.id
    }));
    return result;
};

// cron.schedule('1 14 * * * *', async () => {
//     console.log('running a task every minute');

//     statistic()
// });

cron.schedule(
    // ┌────────────── second (optional)
    // │ ┌──────────── minute
    // │ │ ┌────────── hour
    // │ │ │ ┌──────── day of month
    // │ │ │ │ ┌────── month
    // │ │ │ │ │ ┌──── day of week
    // │ │ │ │ │ │
    // │ │ │ │ │ │
    // * * * * * *
    '0 2 * * *',
    async () => {
        // console.log('running a task every minute');

        statistic()
    },
    // {
    //     scheduled: true,
    //     timezone: "Asia/Ho_Chi_Minh"
    // }
);