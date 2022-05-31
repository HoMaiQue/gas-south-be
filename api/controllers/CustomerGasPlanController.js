module.exports = {
  create: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }
    try {
      const customerGasPlan = ({ year, month, quantity, note, customerGasId } =
        req.body);

      const chkCustomerGas = await CustomerGas.findOne({
        isDeleted: { "!=": true },
        _id: customerGasId,
      });
      if (!chkCustomerGas) {
        return res.json({
          success: false,
          message: "id CustomerGas không tồn tại!",
        });
      }

      let chkMonth = await CustomerGasPlan.findOne({
        isDeleted: { "!=": true },
        customerGasId: customerGasPlan.customerGasId,
        month: customerGasPlan.month,
        year: customerGasPlan.year,
        isDeleted: false,
        // year: customerGasPlan.year
      });

      if (chkMonth) {
        return res.json({
          status: false,
          message: "Tháng trong năm đã bị trùng!",
        });
      }

      let created = await CustomerGasPlan.create(customerGasPlan).fetch();

      if (!created || created == "" || created == null) {
        return res.json({
          status: false,
          message: "Lỗi...tạo mới không thành công!",
        });
      } else {
        return res.json({
          status: true,
          CustomerGasPlan: created,
        });
      }
    } catch (err) {
      return res.json({
        success: false,
        message: err.message,
      });
    }
  },

  update: async function (req, res) {
    try {
      const update = ({ id, year, month, quantity, note, customerGasId } =
        req.body);

      if (update.id) {
        let chkCustomerGasPlan = await CustomerGasPlan.findOne({
          isDeleted: { "!=": true },
          _id: update.id,
          isDeleted: false,
        });
        if (!chkCustomerGasPlan) {
          res.json({
            success: false,
            message: "CustomerGasPlan không tồn tại!",
          });
        }
      }

      if (update.customerGasId) {
        let chkCustomerGas = await CustomerGas.findOne({
          isDeleted: { "!=": true },
          _id: update.customerGasId,
        });
        if (!chkCustomerGas) {
          res.json({
            success: false,
            message: "id CustomerGas không tồn tại!",
          });
        }
      }

      let chkMonth = await CustomerGasPlan.findOne({
        isDeleted: { "!=": true },
        customerGasId: update.customerGasId,
        month: update.month,
        isDeleted: false,
        year: update.year,
      });

      if (chkMonth) {
        let updateCustomerGasPlan = await CustomerGasPlan.updateOne({
          isDeleted: { "!=": true },
          id: update.id,
          month: update.month,
          isDeleted: false,
          year: update.year,
        }).set({
          year: update.year,
          quantity: update.quantity,
          note: update.note,
          customerGasId: update.customerGasId,
        });

        if (updateCustomerGasPlan) {
          return res.json({
            status: true,
            CustomerGasPlan: updateCustomerGasPlan,
          });
        } else {
          return res.json({ status: false, message: "Lỗi update!" });
        }
      } else {
        let updateCustomerGasPlan = await CustomerGasPlan.updateOne({
          isDeleted: { "!=": true },
          id: update.id,
          isDeleted: false,
        }).set({
          month: update.month,
          year: update.year,
          quantity: update.quantity,
          note: update.note,
          customerGasId: update.customerGasId,
        });

        if (updateCustomerGasPlan) {
          return res.json({
            status: true,
            CustomerGasPlan: updateCustomerGasPlan,
          });
        } else {
          return res.json({ status: false, message: "Lỗi update!" });
        }
      }
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  },

  delete: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }
    if (!req.query.userid) {
      console.log("Empty req.query.userid");
      return res.badRequest(Utils.jsonErr("Empty userid"));
    }

    try {
      const { id } = req.body;

      let chkCustomerGasPlan = await CustomerGasPlan.findOne({
        isDeleted: { "!=": true },
        _id: id,
        isDeleted: false,
      });
      if (!chkCustomerGasPlan) {
        return res.json({
          success: false,
          message: "CustomerGasPlan không tồn tại!",
        });
      }

      let customerGasPlan = await CustomerGasPlan.updateOne({
        isDeleted: { "!=": true },
        _id: id,
      }).set({
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: req.query.userid,
      });

      if (customerGasPlan) {
        return res.json({ success: true, message: "Xóa thành công!" });
      } else {
        return res.json({ success: false, message: "Xóa thất bại!" });
      }
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  },

  getAll: async function (req, res) {
    try {
      const customerGasPlan = await CustomerGasPlan.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      });
      return res.json(customerGasPlan);
    } catch (err) {
      return res.json({ success: false, message: err.message });
    }
  },

  getById: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body!"));
    }
    try {
      const { id } = req.body;
      let getById = await CustomerGasPlan.findOne({
        isDeleted: { "!=": true },
        _id: id,
        isDeleted: false,
      });
      if (getById) {
        return res.json({ success: true, CustomerGasPlan: getById });
      } else {
        return res.json({
          success: false,
          message: "CustomerGasPlan không tồn tại!",
        });
      }
    } catch (err) {
      return res.json({ success: false, message: err.messag });
    }
  },
};
