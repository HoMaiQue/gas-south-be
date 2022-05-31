module.exports = {
  createCustomerGas: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const create = {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        taxcode: req.body.taxcode,
        code: req.body.code,
        note: req.body.note,
        userID: req.body.userID,
        email: req.body.email,
        contactname: req.body.contactname,
        branchname: req.body.branchname,
        //updatedAt : Date.now(),
        LAT: req.body.LAT,
        LNG: req.body.LNG,
      };
      if (!create.name) {
        return res.json({
          success: false,
          message: "không tìm thấy name",
        });
      }
      // if(!create.contactname){
      //     return res.json({
      //         success:false,
      //         message:"không tìm thấy contacname"
      //     })
      // }

      // if(!create.phone){
      //     return res.json({
      //         success: false,
      //         message:"không tìm thấy phone"
      //     })
      // }
      if (!create.address) {
        return res.json({
          success: false,
          message: "không tìm thấy address",
        });
      }
      // if(!create.taxcode){
      //     return res.json({
      //         success: false,
      //         message:"không tìm thấy taxcode"
      //     })
      // }
      if (!create.code) {
        return res.json({
          success: false,
          message: "không tìm thấy code",
        });
      }
      // if(!create.node){
      //     return res.json({
      //         success: false,
      //         message:"không tìm thấy node"
      //     })
      // }
      if (!create.branchname) {
        return res.json({
          success: false,
          message: "không tìm thấy branchname",
        });
      }

      const checkUserID = await User.findOne({
        isDeleted: { "!=": true },
        _id: create.userID,
      });
      if (!checkUserID) {
        return res.json({
          success: false,
          message: "không tìm thấy user",
        });
      }
      // const checkExist = await CustomerGas.findOne({isDeleted: {"!=": true},
      //     phone: create.phone
      // })
      const chkcode = await CustomerGas.findOne({
        isDeleted: { "!=": true },
        code: create.code,
        isDeleted: false,
      });
      if (chkcode) {
        return res.json({
          success: false,
          message: "code đã tồn tại . Vui lòng lựa chọn code khác",
        });
      }

      // if (checkExist) {
      //     return res.json({
      //         success: false,
      //         message: 'Số điện thoại đã tồn tại. Vui lòng sử dụng số điện thoại khác.'
      //     });
      // }
      const newCustomerGas = await CustomerGas.create(create).fetch();
      if (!newCustomerGas || newCustomerGas == "" || newCustomerGas == null) {
        return res.json({
          success: false,
          message: "tạo customerGas không thành công",
        });
      } else {
        return res.json({
          success: true,
          CustomerGas: newCustomerGas,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  updateCustomerGas: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const update = {
        customerGasID: req.body.customerGasID,
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        taxcode: req.body.taxcode,
        code: req.body.code,
        note: req.body.note,
        userID: req.body.userID,
        email: req.body.email,
        contactname: req.body.contactname,
        branchname: req.body.branchname,
        LAT: req.body.LAT,
        LNG: req.body.LNG,
      };
      const chkCustomerGas = await CustomerGas.findOne({
        isDeleted: { "!=": true },
        _id: update.customerGasID,
      });
      if (!chkCustomerGas) {
        return res.json({
          success: false,
          message: "không tìm thấy customerGas",
        });
      }

      if (update.userID) {
        const checkUser = await User.findOne({
          isDeleted: { "!=": true },
          _id: update.userID,
        });
        if (!checkUser) {
          return res.json({
            success: false,
            message: "id User không tồn tại!",
          });
        }
      }

      if (update.code) {
        const chkcode = await CustomerGas.findOne({
          isDeleted: { "!=": true },
          code: update.code,
          _id: {
            "!=": update.customerGasID,
          },
        });
        if (chkcode) {
          return res.json({
            success: false,
            message: "code đã tồn tại . Vui lòng lựa chọn code khác",
          });
        }
      }
      const updateCustomerGas = await CustomerGas.updateOne({
        isDeleted: { "!=": true },
        _id: update.customerGasID,
      }).set({
        name: update.name,
        phone: update.phone,
        address: update.address,
        taxcode: update.taxcode,
        code: update.code,
        note: update.note,
        email: update.email,
        contactname: update.contactname,
        branchname: update.branchname,
        userID: update.userID,
        LAT: req.body.LAT,
        LNG: req.body.LNG,
        updatedAt: Date.now(),
      });
      if (
        !updateCustomerGas ||
        updateCustomerGas == null ||
        updateCustomerGas == ""
      ) {
        return res.json({
          success: false,
          message: "cập nhât không thành công",
        });
      } else {
        return res.json({
          success: true,
          CustomerGas: updateCustomerGas,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  deletedCustomerGas: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const delCustomerGas = {
        CustomerGasID: req.body.CustomerGas,
      };
      if (delCustomerGas.CustomerGasID) {
        const chkCustomerGas = await CustomerGas.findOne({
          isDeleted: { "!=": true },
          _id: delCustomerGas.CustomerGasID,
        });
        if (!chkCustomerGas) {
          return res.json({
            success: false,
            message: "không tồn tại Customergas",
          });
        }
      }

      const cancelCustomerGas = await CustomerGas.updateOne({
        isDeleted: { "!=": true },
        _id: delCustomerGas.CustomerGasID,
        isDeleted: false,
      }).set({
        isDeleted: true,
        //deletedAt: Date.now()
      });
      if (
        !cancelCustomerGas ||
        cancelCustomerGas == null ||
        cancelCustomerGas == ""
      ) {
        return res.json({
          success: false,
          message: "xóa CustomerGas không thành công",
        });
      } else
        return res.json({
          success: true,
          CustomerGas: cancelCustomerGas,
        });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  getCustomerGasById: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const CustomerGasID = req.body.CustomerGasID;
      if (!CustomerGasID) {
        return res.json({
          success: false,
          message: "không tìm thấy customerGas",
        });
      }
      const chkCustomerGasId = await CustomerGas.findOne({
        isDeleted: { "!=": true },
        _id: CustomerGasID,
      });
      if (
        !chkCustomerGasId ||
        chkCustomerGasId == "" ||
        chkCustomerGasId == null
      ) {
        return res.json({
          success: false,
          message: "CustomerGas không tồn tại",
        });
      } else {
        return res.json({
          success: true,
          CustomerGas: chkCustomerGasId,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  getCustomerGasByCode: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }
    try {
      const CustomerGasCode = req.body.CustomerGasCode;
      if (!CustomerGasCode) {
        return res.json({
          success: false,
          message: "không tìm thấy customerGas",
        });
      }
      const chkCustomerGasId = await CustomerGas.findOne({
        isDeleted: { "!=": true },
        code: CustomerGasCode,
      });
      if (
        !chkCustomerGasId ||
        chkCustomerGasId == "" ||
        chkCustomerGasId == null
      ) {
        return res.json({
          success: false,
          message: "CustomerGas không tồn tại",
        });
      } else {
        return res.json({
          success: true,
          CustomerGas: chkCustomerGasId,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
  getAllCustomer: async function (req, res) {
    try {
      const GetCustomer = await CustomerGas.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      }).sort([{ createdAt: "DESC" }]);
      return res.json({ GetCustomer });
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },
};
