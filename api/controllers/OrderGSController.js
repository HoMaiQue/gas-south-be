/**
 * OrderGSController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { retry } = require("async");
const moment = require("moment");
const { nanoid } = require("nanoid");
const { obj } = require("pumpify");
const OrderDetailController = require("./OrderDetailController");

const {
  createOrderGSConfirmationHistory,
} = require("../services/OrderGSConfirmationHistory");

module.exports = {
  getStatus: async function (req, res) {
    // if (!req.query?.orderCode)
    //   return res.json({
    //     success: false,
    //     message: "Không có code order - vui lòng nhập code order",
    //   });
    try {
      if (!req.query.status || req.query.status === "") {
        let order = await OrderGS.find({ isDeleted: { "!=": true } })
          .sort("createdAt DESC")
          .populate("orderDetail", { isDeleted: { "!=": true } })
          .populate("supplier")
          .populate("customers");
        if (!order || order.length <= 0) {
          return res.json({
            success: false,

            message: "Không tìm thấy đơn hàng",
          });
        }
        return res.json({
          success: true,
          data: order,
          message: "Lấy đơn hàng theo tất cả trạng thái thành công",
        });
      }
      let order = await OrderGS.find({
        isDeleted: { "!=": true },
        status: req.query.status,
      })
        .sort("createdAt DESC")
        .populate("orderDetail", { isDeleted: { "!=": true } })
        .populate("supplier")
        .populate("customers");
      if (!order || order.length <= 0) {
        return res.json({
          success: false,
          message: `Không tìm thấy đơn hàng ở trạng thái ${req.query.status}`,
        });
      }
      return res.json({
        success: true,
        data: order,
        message: `Lấy đơn hàng theo trạng thái ${req.query.status} thành công`,
      });
    } catch (error) {
      return res.json({
        success: false,

        message: "Gặp lỗi khi lấy đơn hàng theo trạng thái",
      });
    }
  },
  getOrderByCode: async function (req, res) {
    if (!req.query?.orderCode)
      return res.json({
        success: false,
        message: "Không có code order - vui lòng nhập code order",
      });
    try {
      let order = await OrderGS.find({
        isDeleted: { "!=": true },
        orderCode: req.query.orderCode,
        customers: req.query.objectId,
      })
        .sort("createdAt DESC")
        .populate("orderDetail", { isDeleted: { "!=": true } })
        .populate("delivery", { isDeleted: { "!=": true } })
        .populate("reasonForCancellatic");
      if (!order || order.length <= 0) {
        return res.json({
          success: false,

          message: "Không tìm thấy đơn hàng",
        });
      }
      return res.json({
        success: true,
        data: order,
        message: "Lấy đơn hàng theo mã code thành công",
      });
    } catch (error) {
      return res.json({
        success: false,

        message: "Gặp lỗi khi lấy đơn hàng",
      });
    }
  },
  getListScheduleOfCustomers: async function (req, res) {
    const objectId = req.query.objectId;
    // const userInfor = await User.findOne({isDeleted: {"!=": true}, id: userId });
    if (!req.query.To && !req.query.From && !req.query.orderCode) {
      return res.json({
        success: false,
        message: "Vui lòng chọn ngày tháng hoặc nhập mã đơn hàng !!",
      });
    }
    if (req.query.orderCode) {
      try {
        let order = await OrderGS.find({
          isDeleted: { "!=": true },
          orderCode: req.query.orderCode,
          customers: req.query.objectId,
        })
          .sort("createdAt DESC")
          .populate("orderDetail", { isDeleted: { "!=": true } })
          .populate("supplier")
          .populate("customers")
          .populate("delivery", { isDeleted: { "!=": true } });
        if (!order || order.length <= 0) {
          return res.json({
            success: false,
            message: "Không tìm thấy đơn hàng",
          });
        }
        return res.json({
          success: true,
          data: order,
          message: "Lấy đơn hàng theo mã code thành công",
        });
      } catch (error) {
        return res.json({
          success: false,

          message: "Gặp lỗi khi lấy đơn hàng",
        });
      }
    }
    try {
      let order = await OrderGS.find({
        isDeleted: { "!=": true },
        createdAt: {
          ">=": req.query.From,
          "<=": req.query.To,
        },
        // supplier: req.query.supplier,
        // area: req.query.area,
        customers: req.query.objectId,
        // status: req.query.status,
      })
        .sort("createdAt DESC")
        .populate("orderDetail", { isDeleted: { "!=": true } })
        .populate("supplier")
        .populate("customers")
        .populate("delivery", { isDeleted: { "!=": true } });
      if (!order || order.length <= 0) {
        return res.json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      return res.json({
        success: true,
        data: order,
        message: "Lấy đơn hàng theo ngày tháng và code thành công",
      });
    } catch (error) {
      return res.json({
        success: false,

        message: "Gặp lỗi khi lấy đơn hàng",
      });
    }
  },
  getListScheduleOfSuppliers: async function (req, res) {
    const objectId = req.query.objectId;
    // const userInfor = await User.findOne({isDeleted: {"!=": true}, id: userId });
    // if (!req.query.To && !req.query.From && !req.query.orderCode) {
    //   return res.json({
    //     success: false,
    //     message: "Vui lòng chọn ngày tháng hoặc nhập mã đơn hàng !!",
    //   });
    // }
    if (req.query.orderCode) {
      try {
        let order = await OrderGS.find({
          isDeleted: { "!=": true },
          orderCode: req.query.orderCode,
          supplier: req.query.objectId,
        })
          .sort("createdAt DESC")
          .populate("orderDetail", { isDeleted: { "!=": true } })
          .populate("supplier")
          .populate("customers");
        // .populate("delivery",{isDeleted: { "!=": true }});
        if (!order || order.length <= 0) {
          return res.json({
            success: false,

            message: "Không tìm thấy đơn hàng",
          });
        }
        return res.json({
          success: true,
          data: order,
          message: "Lấy đơn hàng theo mã code thành công",
        });
      } catch (error) {
        return res.json({
          success: false,

          message: "Gặp lỗi khi lấy đơn hàng",
        });
      }
    }
    try {
      let order = await OrderGS.find({
        isDeleted: { "!=": true },
        createdAt: {
          ">=": req.query.From,
          "<=": req.query.To,
        },
        // orderCode: req.query.orderCode,
        customers: req.query.objectId,
        area: req.query.area,
        supplier: req.query.station,
        // status: req.query.status,
        // createdBy: req.query.objectId,
        // createdAt: new Date(req.query.createdAt),
      })
        .sort("createdAt DESC")
        .populate("orderDetail", { isDeleted: { "!=": true } })
        .populate("supplier")
        .populate("customers");
      // .populate("delivery",{isDeleted: { "!=": true }});
      if (!order || order.length <= 0) {
        return res.json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      return res.json({
        success: true,
        data: order,
        message: "Lấy đơn hàng theo ngày tháng và code thành công",
      });
    } catch (error) {
      return res.json({
        success: false,

        message: "Gặp lỗi khi lấy đơn hàng",
      });
    }
  },
  // getFilter
  delete: async function (req, res) {
    if (!req.query.userid) {
      console.log("Empty req.query.userid");
      return res.badRequest(Utils.jsonErr("Empty userid"));
    }
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty query"));
    }

    const { id } = req.query;

    try {
      const deleteOrder = await OrderGS.updateOne({
        isDeleted: { "!=": true },
        id,
      }).set({
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: req.query.userid,
      });

      if (!deleteOrder) {
        return res.json({
          success: false,

          message: "Không tìm thấy đơn để xóa",
        });
      }

      return res.json({
        success: true,
        message: "Xóa thành công.",
      });
    } catch (error) {
      console.log(error);
      return res.json({
        success: false,
        message: "Gặp lỗi khi xóa đơn",
      });
    }
  },
  acpOrder: async function (req, res) {
    let note = req.body.note;
    if (!req.query?.id)
      return res.json({
        success: false,
        message: "Không có id order",
      });
    try {
      const orderGS = await OrderGS.findOne({
        isDeleted: { "!=": true },
        id: req.query.id,
      });
      if (!orderGS) {
        return res.json({ success: false, message: "Không tìm thấy đơn hàng" });
      }
      const reason1 = null;
      // console.log("datane", taodata);
      const userInfor = await User.findOne({
        isDeleted: { "!=": true },
        id: req.query.userid,
      });
      // console.log(userInfor.id);
      var updatedOrderGS = null;
      if (!userInfor || userInfor.length <= 0) {
        return res.json({ success: false, message: "Không tìm thấy user" });
      }
      if (userInfor.userRole === "To_nhan_lenh") {
        updatedOrderGS = await OrderGS.updateOne({
          isDeleted: { "!=": true },
          _id: req.query.id,
        }).set({
          status: "TO_NHAN_LENH_DA_DUYET",
        });
        createOrderGSConfirmationHistory(
          userInfor,
          orderGS,
          note,
          "TO_NHAN_LENH_DA_DUYET"
        );
      }
      if (
        userInfor.userRole === "Truong_phongKD" &&
        orderGS.status === "TU_CHOI_LAN_1"
      ) {
        updatedOrderGS = await OrderGS.updateOne({
          isDeleted: { "!=": true },
          _id: req.query.id,
        }).set({
          status: "GUI_DUYET_LAI",
        });
        createOrderGSConfirmationHistory(
          userInfor,
          orderGS,
          note,
          "GUI_DUYET_LAI"
        );
      }
      if (
        userInfor.userRole === "Pho_giam_docKD" &&
        orderGS.status === "TU_CHOI_LAN_2"
      ) {
        updatedOrderGS = await OrderGS.updateOne({
          isDeleted: { "!=": true },
          _id: req.query.id,
        }).set({
          status: "GUI_DUYET_LAI",
        });
        createOrderGSConfirmationHistory(
          userInfor,
          orderGS,
          note,
          "GUI_DUYET_LAI"
        );
      }
      if (userInfor.userRole === "Ke_toan") {
        updatedOrderGS = await OrderGS.updateOne({
          isDeleted: { "!=": true },
          _id: req.query.id,
        }).set({
          status: "DA_DUYET",
        });
        createOrderGSConfirmationHistory(userInfor, orderGS, note, "DA_DUYET");
      }
      if (!updatedOrderGS) {
        return res.json({
          success: false,
          message: "Cập nhật đơn hàng thất bại",
        });
      }
      return res.json({
        success: true,
        data: updatedOrderGS,
        message: "Cập nhật đơn hàng thành công",
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  notacpOrder: async function (req, res) {
    let note = req.body.note;
    if (!req.query?.id)
      return res.json({
        success: false,
        message: "Không có id order",
      });
    if (!note)
      return res.json({
        success: false,
        message: "phải có lý do KHONG DUYET",
      });
    try {
      const { reasonForCancellatic } = req.body;
      const orderGS = await OrderGS.findOne({
        isDeleted: { "!=": true },
        id: req.query.id,
      });
      if (!orderGS) {
        return res.json({ success: false, message: "Không tìm thấy đơn hàng" });
      }
      const reason1 = null;
      // console.log("datane", taodata);
      const userInfor = await User.findOne({
        isDeleted: { "!=": true },
        id: req.query.userid,
      });
      // console.log(userInfor.id);
      if (!userInfor || userInfor.length <= 0) {
        return res.json({ success: false, message: "Không tìm thấy user" });
      }
      var updatedOrderGS = null;
      if (
        userInfor.userRole === "To_nhan_lenh" ||
        userInfor.userRole === "Truong_phongKD" ||
        userInfor.userRole === "Pho_giam_docKD"
      ) {
        updatedOrderGS = await OrderGS.updateOne({
          isDeleted: { "!=": true },
          _id: req.query.id,
        }).set({
          status: "KHONG_DUYET",
          status2: "KHONG_DUYET",
        });
        createOrderGSConfirmationHistory(
          userInfor,
          orderGS,
          note,
          "KHONG_DUYET"
        );
      }
      if (userInfor.userRole === "Ke_toan") {
        if (orderGS.status2 == "DON_HANG_MOI") {
          updatedOrderGS = await OrderGS.updateOne({
            isDeleted: { "!=": true },
            _id: req.query.id,
          }).set({
            status: "TU_CHOI_LAN_1",
            status2: "TU_CHOI_LAN_1",
          });
          createOrderGSConfirmationHistory(
            userInfor,
            orderGS,
            note,
            "TU_CHOI_LAN_1"
          );
        }
        if (
          userInfor.userRole === "Ke_toan" &&
          orderGS.status2 == "TU_CHOI_LAN_1"
        ) {
          updatedOrderGS = await OrderGS.updateOne({
            isDeleted: { "!=": true },
            _id: req.query.id,
          }).set({
            status: "TU_CHOI_LAN_2",
            status2: "TU_CHOI_LAN_2",
          });
          createOrderGSConfirmationHistory(
            userInfor,
            orderGS,
            note,
            "TU_CHOI_LAN_2"
          );
        }
      }
      // await Promise.all(
      //   reasonForCancellatic.map(async (cancel) => {
      //     const orderGSID = req.query.id;
      //     const cancelBy = userInfor.id;
      //     const { reason } = cancel;
      //     await CancelHistory.create({ orderGSID, reason, cancelBy });
      //   })
      // );
      if (!updatedOrderGS || updatedOrderGS.length == 0) {
        return res.json({
          success: false,
          message: "Cập nhật đơn hàng thất bại",
        });
      }
      return res.json({
        success: true,
        data: updatedOrderGS,
        message: "Cập nhật đơn hàng thành công",
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  /**
   * "PUT /categoryCylinder/updateById"
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  updateById: async function (req, res) {
    let updateData = req.body;

    if (!req.query?.id || req.body == null)
      return res.json({
        success: false,
        message: "Không có id order hoặc không có body",
      });
    try {
      let orderGS = await OrderGS.findOne({
        isDeleted: { "!=": true },
        id: req.query.id,
      });
      if (!orderGS) {
        return res.json({ success: false, message: "Không tìm thấy đơn hàng" });
      }
      // ------------------
      // update order Details
      if (updateData.orderDetail) {
        const result = OrderDetailController.updateMany(updateData.orderDetail);
        console.log("result", result);
        result.then((result) => {
          if (result.success === false) {
            return res.json({
              success: false,
              message: result.message,
            });
          }
        });
        delete updateData.orderDetail;
      }
      // ---------------------
      let updatedOrderGS = await OrderGS.updateOne({
        isDeleted: { "!=": true },
        _id: req.query.id,
      }).set(updateData);

      // khi status DA_HOAN_THANH thi ngày hoàn thành sẽ được tạo
      if (updateData.status === "DA_HOAN_THANH") {
        updatedOrderGS = await OrderGS.updateOne({
          isDeleted: { "!=": true },
          _id: req.query.id,
        }).set({
          dateDone: new Date().toISOString(), //"2011-12-19T15:28:46.493Z",
        });
      }

      if (!updatedOrderGS) {
        return res.json({
          success: false,
          message: "Cập nhật đơn hàng thất bại",
        });
      }

      return res.json({
        success: true,
        data: updatedOrderGS,
        message: "Cập nhật đơn hàng thành công",
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getAllIfIdIsSupplier: async function (req, res) {
    // const { userId } = req.body;
    const objectId = req.query.objectId;
    // const userInfor = await User.findOne({isDeleted: {"!=": true}, id: userId });
    if (!req.query?.userid) {
      return res.json({
        success: false,
        message: "không có userid",
      });
    }
    try {
      const userInfor = await User.findOne({
        isDeleted: { "!=": true },
        id: req.query.userid,
      });
      // console.log(userInfor.id);
      if (!userInfor) {
        return res.json({ success: false, message: "Không tìm thấy user" });
      }
      console.log(userInfor.userType, userInfor.userRole);
      let orders = null;
      if (
        userInfor.userType == "Tong_cong_ty" &&
        (userInfor.userRole == "Ke_toan" ||
          userInfor.userRole == "Truong_phongKD" ||
          userInfor.userRole == "Pho_giam_docKD" ||
          userInfor.userRole == "SuperAdmin")
      ) {
        orders = await OrderGS.find({
          isDeleted: { "!=": true },
          supplier: req.query.objectId,
          status: { "!=": "DON_HANG_MOI" },
        })
          .sort("createdAt DESC")
          .populate("orderDetail", { isDeleted: { "!=": true } })
          .populate("supplier")
          .populate("delivery", { isDeleted: { "!=": true } })
          .populate("customers");
      }
      if (userInfor.userType == "Tram") {
        orders = await OrderGS.find({
          isDeleted: { "!=": true },
          supplier: req.query.objectId,
          // or: [
          //   { status: "DA_DUYET" },
          //   { status: "DA_HOAN_THANH" },
          //   { status: "DANG_GIAO" },
          // ],
          status: ["DA_DUYET", "DA_HOAN_THANH", "DANG_GIAO"],
        })
          .sort("createdAt DESC")
          .populate("orderDetail", { isDeleted: { "!=": true } })
          .populate("supplier")
          .populate("delivery", { isDeleted: { "!=": true } })
          .populate("customers");
      }
      if (
        userInfor.userType == "Tong_cong_ty" &&
        userInfor.userRole == "To_nhan_lenh"
      ) {
        orders = await OrderGS.find({
          isDeleted: { "!=": true },
          supplier: req.query.objectId,
        })
          .sort("createdAt DESC")
          .populate("orderDetail", { isDeleted: { "!=": true } })
          .populate("supplier")
          .populate("delivery", { isDeleted: { "!=": true } })
          .populate("customers");
      }
      if (orders.length === 0) {
        return res.json({ success: false, message: "Không có đơn hàng nào" });
      }
      return res.json({
        success: true,
        data: orders,
        message: "Đã tìm thấy đơn hàng",
      });
    } catch (error) {
      return res.serverError(error);
    }
  },
  getStation: async function (req, res) {
    try {
      const Tram = await User.find({
        isDeleted: { "!=": true },
        userType: "Tram",
      })
        .sort("createdAt DESC")
        .populate("area");
      if (Tram.length === 0) {
        return res.json({ success: false, message: "Không tìm thấy" });
      } else {
        return res.json({
          success: true,
          data: Tram,
          message: "Đã tìm thấy",
        });
      }
    } catch (error) {
      return res.serverError(error);
    }
  },
  getArea: async function (req, res) {
    try {
      const getArea = await Area.find({
        isDeleted: { "!=": true },
        _id: req.query.area,
        isDeleted: { "!=": true },
      }).sort("createdAt DESC");
      if (getArea.length === 0) {
        return res.json({ success: false, message: "Không tìm thấy" });
      } else {
        return res.json({
          success: true,
          data: getArea,
          message: "Đã tìm thấy",
        });
      }
    } catch (error) {
      return res.serverError(error);
    }
  },
  layCuaHangTrucThuocTram: async function (req, res) {
    try {
      const store = await User.find({
        isDeleted: { "!=": true },
        userType: "Khach_hang",
        userRole: "Cua_hang_thuoc_tram",
        isDeleted: { "!=": true },
      }).sort("createdAt DESC");
      if (store.length === 0) {
        return res.json({ success: false, message: "Không tìm thấy" });
      } else {
        return res.json({
          success: true,
          data: store,
          message: "Đã tìm thấy",
        });
      }
    } catch (error) {
      return res.serverError(error);
    }
  },
  layTongDaiLy: async function (req, res) {
    try {
      const store = await User.find({
        isDeleted: { "!=": true },
        userType: "Khach_hang",
        userRole: "Tong_dai_ly",
        isDeleted: { "!=": true },
      }).sort("createdAt DESC");
      if (store.length === 0) {
        return res.json({ success: false, message: "Không tìm thấy" });
      } else {
        return res.json({
          success: true,
          data: store,
          message: "Đã tìm thấy",
        });
      }
    } catch (error) {
      return res.serverError(error);
    }
  },
  layCongTy: async function (req, res) {
    try {
      const store = await User.find({
        isDeleted: { "!=": true },
        userType: "Khach_hang",
        userRole: "Cong_ty",
      }).sort("createdAt DESC");
      if (!store) {
        return res.json({ success: false, message: "Không tìm thấy" });
      } else {
        return res.json({
          success: true,
          data: store,
          message: "Đã tìm thấy",
        });
      }
    } catch (error) {
      return res.serverError(error);
    }
  },
  getTypeCustomer: async function (req, res) {
    try {
      // if (!req.query.type || !req.query.objectId || !req.query.area) {
      //   return res.json({
      //     success: false,
      //     data: [],
      //     message: "Vui lòng chọn trạm , khu vực ( vùng ) và đối tượng",
      //   });

      let store = null;
      store = await User.find({
        isDeleted: { "!=": true },
        userType: "Khach_hang",
        userRole: req.query.type,
        OfStation: req.query.objectId,
        area: req.query.area,
      }).sort("createdAt DESC");
      if (store === null || store.length === 0) {
        return res.json({
          success: false,

          message: "Không tìm thấy",
        });
      } else {
        return res.json({
          success: true,
          data: store,
          message: "Đã tìm thấy",
        });
      }
    } catch (error) {
      return res.serverError(error);
    }
  },
  showAddressUser: async function (req, res) {
    try {
      const userInfor = await User.find({
        isDeleted: { "!=": true },
        id: req.query.objectId,
      })
        .sort("createdAt DESC")
        .populate("isChildOf")
        .populate("area");
      if (!userInfor) {
        return res.json({ success: false, message: "Không tìm thấy" });
      } else {
        return res.json({
          success: true,
          data: userInfor,
          message: "Đã tìm thấy",
        });
      }
    } catch (error) {
      return res.serverError(error);
    }
  },
  getAllIfIdIsCustomer: async function (req, res) {
    const objectId = req.query.objectId;
    // const userInfor = await User.findOne({isDeleted: {"!=": true}, id: userId });
    try {
      if (!req.query.status || req.query.status === "") {
        let orders = await OrderGS.find({
          isDeleted: { "!=": true },
          customers: objectId,
        })
          .sort("createdAt DESC")
          .populate("orderDetail", { isDeleted: { "!=": true } })
          .populate("supplier")
          .populate("delivery", { isDeleted: { "!=": true } })
          .populate("customers");
        if (orders.length === 0) {
          return res.json({ success: false, message: "Không có đơn hàng nào" });
        }
        return res.json({
          success: true,
          data: orders,
          message: "Đã tìm thấy đơn hàng",
        });
      }

      let orders = await OrderGS.find({
        isDeleted: { "!=": true },
        customers: objectId,
        // status: req.query.status,
      })
        .sort("createdAt DESC")
        .populate("orderDetail", { isDeleted: { "!=": true } })
        .populate("supplier")
        .populate("delivery", { isDeleted: { "!=": true } })
        .populate("customers");
      if (orders.length === 0) {
        return res.json({ success: false, message: "Không có đơn hàng nào" });
      }
      return res.json({
        success: true,
        data: orders,
        message: "Đã tìm thấy đơn hàng",
      });
    } catch (error) {
      return res.serverError(error);
    }
  },
  create: async function (req, res) {
    //status default is INIT
    const {
      delivery,
      note,
      // statusforPGD,
      status,
      // statusforCTM,
      // statusforTRAM,
      supplier,
      area,
      customers,
      // orderType,
      orderDetails,
    } = req.body;
    if (!req.body.customers) {
      return res.json({ success: false, message: "Buộc phải nhập khách hàng" });
    }
    if (!req.body.area) {
      return res.json({
        success: false,
        message: "Buộc phải nhập khu vực , địa chỉ",
      });
    }
    if (!req.body.delivery) {
      return res.json({
        success: false,
        message: "Buộc phải nhập địa chỉ , ngày giao hàng ",
      });
    }
    if (!req.body.orderDetails) {
      return res.json({
        success: false,
        message: "Buộc phải nhập đầy đủ thông tin đơn hàng ",
      });
    }
    const orderCode = nanoid();
    try {
      const checkOrder = await OrderGS.findOne({
        isDeleted: { "!=": true },
        orderCode: orderCode,
      });
      if (checkOrder) {
        return res.json({ success: false, message: "Trùng mã đơn hàng" });
      }

      //================//

      var order = null;
      order = await OrderGS.create({
        orderCode,
        note,
        // statusforPGD,
        status,
        // statusforCTM,
        // statusforTRAM,
        createdBy: req.query.objectId,
        supplier,
        customers,
        area,
        // orderType,
      }).fetch();
      // console.log(order);

      var checkdelivery = 0;
      delivery.map((shippingGS1) => {
        const { deliveryAddress, deliveryDate } = shippingGS1;
        if (
          deliveryAddress &&
          deliveryDate &&
          Object.keys(shippingGS1).length > 0
        ) {
          checkdelivery++;
        }
      });

      if (checkdelivery == delivery.length) {
        await Promise.all(
          delivery.map(async (shippingGS) => {
            const orderID = order.id;
            const { deliveryAddress, deliveryDate } = shippingGS;
            await ShippingGS.create({
              orderID,
              deliveryAddress,
              deliveryDate,
            });
          })
        );
      }

      var checkordeDetail = 0;
      orderDetails.map((orderDetail) => {
        const { manufacture, categoryCylinder, colorGas, valve, quantity } =
          orderDetail;
        if (
          valve &&
          manufacture &&
          categoryCylinder &&
          colorGas &&
          quantity &&
          Object.keys(orderDetail).length > 0
        ) {
          checkordeDetail++;
        }
      });

      if (checkordeDetail == orderDetails.length) {
        await Promise.all(
          orderDetails.map(async (orderDetail) => {
            const orderGSId = order.id;
            const { manufacture, categoryCylinder, colorGas, valve, quantity } =
              orderDetail;
            await OrderDetail.create({
              orderGSId,
              manufacture,
              categoryCylinder,
              colorGas,
              valve,
              quantity,
            });
          })
        );
      }

      if (
        checkdelivery != delivery.length ||
        checkordeDetail != orderDetails.length
      ) {
        if (checkordeDetail == orderDetails.length) {
          await OrderDetail.destroy({
            orderGSId: order.id,
          });
        }
        if (checkdelivery == delivery.length) {
          await ShippingGS.destroy({
            orderID: order.id,
          });
        }
        await OrderGS.destroy({
          id: order.id,
        });
        return res.json({ success: false, message: "Tạo đơn hàng thất bại" });
      }
      return res.json({
        success: true,
        data: order,
        message: "Tạo đơn hàng thành công",
      });
    } catch (error) {}
  },
};
