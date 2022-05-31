module.exports = {
  createSchedule: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    let {
      tittle,
      idCheckingAt,
      idStaff,
      idInspector,
      location,
      maintenanceType,
      maintenanceDate,
      createdBy,
    } = req.body;

    // const checkMtnDate = await InspectionSchedule.find({isDeleted: {"!=": true},maintenanceType: maintenanceType})
    // if(checkMtnDate) return res.json({ success: false, message: "Ngày này đã có lịch bảo trì" });

    let arr_idInspector = [];
    //let arr_idStaff = []

    if (!idInspector)
      return res.json({ success: false, message: "Chưa chọn thanh tra" });
    // if(!idStaff) return res.json({ success: false, message: "Chưa nhập đại diện công ty được bảo trì" });

    while (idInspector.search(",") > 0) {
      arr_idInspector.push(idInspector.slice(0, idInspector.search(",")));
      idInspector = idInspector.slice(idInspector.search(",") + 1);
    }
    // while (idStaff.search(',')>0) {
    //     arr_idStaff.push(idStaff.slice(0, idStaff.search(',')))
    //     idStaff = idStaff.slice(idStaff.search(',')+1)
    // }

    arr_idInspector.push(idInspector);
    // arr_idStaff.push(idStaff)

    try {
      let arr_schedule_inspector = [];
      if (arr_idInspector.length > 0) {
        await Promise.all(
          arr_idInspector.map(async (element) => {
            const schedule = await InspectionSchedule.create({
              tittle,
              idCheckingAt,
              idStaff,
              idInspector: element,
              location,
              maintenanceType,
              maintenanceDate,
              createdBy,
            }).fetch();

            if (schedule) {
              arr_schedule_inspector.push(schedule);
            } else {
              return res.json({
                success: false,
                message:
                  "Thêm schedule cho thanh tra " +
                  element +
                  " không thành công",
              });
            }
          })
        );
      }

      // let arr_schedule_staff = []
      // if (arr_idStaff.length > 0) {
      //     arr_idStaff.forEach( async element => {
      //         const schedule = await InspectionSchedule.create({
      //             tittle,
      //             idCheckingAt,
      //             idStaff: element,
      //             //idInspector,
      //             location,
      //             maintenanceType,
      //             maintenanceDate
      //         }).fetch();

      //         if (schedule) {
      //             arr_schedule_staff.push(schedule)
      //         } else {
      //             return res.json({ success: false, message: "Thêm schedule cho nhân viên"+ element + " không thành công" });
      //         }
      //     });
      // }

      // const schedule = await InspectionSchedule.create({
      //     tittle,
      //     idCheckingAt,
      //     idStaff,
      //     idInspector,
      //     location,
      //     maintenanceType,
      //     maintenanceDate
      // }).fetch();

      if (arr_idInspector.length == arr_schedule_inspector.length) {
        return res.json({ success: true, message: "Thêm schedule thành công" });
      } else {
        return res.json({
          success: false,
          message: "Thêm schedule không thành công",
        });
      }
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  },

  getSchedule: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id, maintenanceType, userRole } = req.body;

    // try {
    //     const scheduleDate = await InspectionSchedule.find({isDeleted: {"!=": true},
    //         where: { idCheckingAt: id },
    //         select: ['maintenanceDate']
    //     });

    //     if (scheduleDate) {
    //         return res.json({ success: true, message: "Thêm schedule thành công" });
    //     }
    //     else {
    //         return res.json({ success: false, message: "Thêm schedule không thành công" });
    //     }
    // }
    // catch (err) {
    //     return res.json({ success: false, message: err.message });
    // }

    let obj = {};
    let arr = [];
    if (id) {
      // let data = await InspectionSchedule.find({isDeleted: {"!=": true}, idInspector: id });
      let data = "";
      if (userRole == "Inspector") {
        data = await InspectionSchedule.find({
          isDeleted: { "!=": true },
          idInspector: id,
          maintenanceType: maintenanceType,
        }).populate("idCheckingAt");
      } else {
        data = await InspectionSchedule.find({
          isDeleted: { "!=": true },
          idStaff: id,
          maintenanceType: maintenanceType,
        }).populate("idCheckingAt");
      }

      //console.log(data[0].maintenanceDate);
      let obj = {};
      let arr = [];
      for (let i = 0; i < data.length; i++) {
        obj = {
          idSchedule: data[i].id,
          maintenanceDate: data[i].maintenanceDate,
          nameCompChecked: data[i].idCheckingAt.name,
          location: data[i].location,
        };
        arr.push(obj);
      }

      if (arr.length > 0) {
        return res.json({ error: false, maintenanceDate: arr });
      } else {
        return res.json({ error: true, message: "không có lịch bảo trì" });
      }
    } else {
      return res.json({ error: true, data: arr });
    }
  },

  getListSchedule: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id } = req.body;

    let listSchedule = [];

    try {
      listSchedule = await InspectionSchedule.find({
        isDeleted: { "!=": true },
        createdBy: id,
      })
        .populate("idCheckingAt")
        .populate("idInspector");

      if (listSchedule.length > 0) {
        return res.json({
          success: true,
          data: listSchedule,
          message: "Tìm thấy lịch bảo trì",
        });
      }

      // if (scheduleDate) {
      //     return res.json({ success: true, message: "Thêm schedule thành công" });
      // }
      else {
        return res.json({
          success: false,
          message: "Không có lịch bảo trì nào",
        });
      }
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }

    // let obj = {};
    // let arr = [];
    // if (id) {
    //     // let data = await InspectionSchedule.find({isDeleted: {"!=": true}, idInspector: id });
    //     let data = ''
    //     if(userRole=='Inspector') {
    //         data = await InspectionSchedule.find({isDeleted: {"!=": true}, idInspector: id, maintenanceType: maintenanceType }).populate('idCheckingAt')
    //     }
    //     else {
    //         data = await InspectionSchedule.find({isDeleted: {"!=": true}, idStaff: id, maintenanceType: maintenanceType }).populate('idCheckingAt')
    //     }

    //     //console.log(data[0].maintenanceDate);
    //     let obj = {};
    //     let arr = [];
    //     for (let i = 0; i < data.length; i++) {
    //         obj = { idSchedule: data[i].id, maintenanceDate: data[i].maintenanceDate, nameCompChecked: data[i].idCheckingAt.name, location: data[i].location }
    //         arr.push(obj);
    //     }

    //     if (arr.length>0) {
    //         return res.json({ error: false, maintenanceDate: arr });
    //     }
    //     else {
    //         return res.json({ error: true, message: "không có lịch bảo trì" });
    //     }
    // }
    // else {
    //     return res.json({ error: true, data: arr });
    // }
  },
};
