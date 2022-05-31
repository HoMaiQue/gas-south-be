/**
 * PriceCategoryCylinderController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  // Tạo mới giá
  createPrice: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const price = {
        regionId: req.body.regionId,
        categorycylinderId: req.body.categorycylinderId,
        price: req.body.price,
        dateApply: req.body.dateApply,
        code: null,
        regionName: null,
      };

      if (!price.regionId) {
        return res.json({
          success: false,
          message: "regionId is not defined. Please check out again.",
        });
      }

      if (!price.categorycylinderId) {
        return res.json({
          success: false,
          message: "categorycylinderId is not defined. Please check out again.",
        });
      }

      if (!price.price) {
        return res.json({
          success: false,
          message: "price is not defined. Please check out again.",
        });
      }

      if (!price.dateApply) {
        return res.json({
          success: false,
          message: "dateApply is not defined. Please check out again.",
        });
      }

      // kiểm tra khu vực có tồn tại không
      const isExist = await Region.findOne({
        isDeleted: { "!=": true },
        _id: price.regionId,
      });

      if (!isExist) {
        return res.json({
          success: false,
          message:
            "Error...regionId does not already exist. Please check out again.",
        });
      }

      // kiểm tra loại sản phẩm có tồn tại không
      const isExist_ = await CategoryCylinder.findOne({
        isDeleted: { "!=": true },
        _id: price.categorycylinderId,
      });

      if (!isExist_) {
        return res.json({
          success: false,
          message:
            "Error...categorycylinderId does not already exist. Please check out again.",
        });
      }

      // lấy mã sản phẩm và khu vực
      price.code = isExist_.code;
      price.regionName = isExist.name;

      // kiểm tra giá trị các thuộc tính có bị trùng không
      const check = await PriceCategoryCylinder.findOne({
        isDeleted: { "!=": true },
        regionId: price.regionId,
        categorycylinderId: price.categorycylinderId,
        dateApply: price.dateApply,
        isDeleted: false,
      });

      if (check) {
        return res.json({
          success: false,
          message:
            "The Price of Cylinder Category already exist. Please check out the regionId or categorycylinderId again.",
        });
      }

      // Kiểm tra ngày cập nhật mới nhất
      const checkLastest = await PriceCategoryCylinder.findOne({
        isDeleted: { "!=": true },
        regionId: price.regionId,
        categorycylinderId: price.categorycylinderId,
        isLastest: true,
        isDeleted: false,
      });

      if (checkLastest) {
        const date_1 = new Date(checkLastest.dateApply).valueOf();
        const date_2 = new Date(price.dateApply).valueOf();

        if (date_1 >= date_2) {
          return res.json({
            success: false,
            message:
              "dateApply smaller than day apply before that. Please check out again.",
          });
        }

        await PriceCategoryCylinder.updateOne({
          isDeleted: { "!=": true },
          regionId: price.regionId,
          categorycylinderId: price.categorycylinderId,
          isLastest: true,
          isDeleted: false,
        }).set({
          isLastest: false,
        });
      }

      const newPrice = await PriceCategoryCylinder.create(price).fetch();

      return res.json({
        success: true,
        Price: newPrice,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Lấy giá sản phẩm theo _id
  getPriceByID: async function (req, res) {
    try {
      if (!req.body) {
        return res.badRequest(Utils.jsonErr("Empty body"));
      }

      const priceId = req.body.priceId;

      if (!priceId) {
        return res.json({
          success: false,
          message: "priceId is not defined. Please check out again.",
        });
      }

      const price = await PriceCategoryCylinder.findOne({
        isDeleted: { "!=": true },
        _id: priceId,
        isDeleted: false,
      });

      if (!price || price == "" || price == null) {
        return res.json({
          success: false,
          message:
            "Error...Price does not already exist. Please check out again.",
        });
      }

      return res.json({ Price: price });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Lấy giá sản phẩm theo khu vực
  getPriceByRegionID: async function (req, res) {
    try {
      if (!req.body) {
        return res.badRequest(Utils.jsonErr("Empty body"));
      }

      const regionId = req.body.regionId;

      if (!regionId) {
        return res.json({
          success: false,
          message: "regionId is not defined. Please check out again.",
        });
      }

      // kiểm tra khu vực có tồn tại không
      const isExist_ = await Region.findOne({
        isDeleted: { "!=": true },
        _id: regionId,
      });

      if (!isExist_) {
        return res.json({
          success: false,
          message:
            "Error...regionId does not already exist. Please check out again.",
        });
      }

      const price = await PriceCategoryCylinder.find({
        isDeleted: { "!=": true },
        regionId: regionId,
        isLastest: true,
        isDeleted: false,
      }).sort("code ASC");

      // lấy danh sách sản phẩm thuộc thuộc từng loại
      const _cylinders = await Promise.all(
        price.map(async (element) => {
          return await CategoryCylinder.find({
            isDeleted: { "!=": true },
            id: element.categorycylinderId,
          })
            .populate("cylindersGas")
            .populate("price", {
              where: {
                regionId: element.regionId,
                isLastest: true,
              },
            });
        })
      );

      if (!price || price == "" || price == null) {
        return res.json({
          success: false,
          message:
            "Error...Price does not already exist. Please check out again.",
        });
      }

      return res.json({
        categorys: _cylinders,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Lấy giá sản phẩm theo id loại sản phẩm
  getPriceByCategoryCylinderID: async function (req, res) {
    try {
      if (!req.body) {
        return res.badRequest(Utils.jsonErr("Empty body"));
      }

      const categorycylinderId = req.body.categorycylinderId;

      if (!categorycylinderId) {
        return res.json({
          success: false,
          message: "categorycylinderId is not defined. Please check out again.",
        });
      }

      // kiểm tra loại sản phẩm có tồn tại không
      const isExist_ = await CategoryCylinder.findOne({
        isDeleted: { "!=": true },
        _id: categorycylinderId,
      });

      if (!isExist_) {
        return res.json({
          success: false,
          message:
            "Error...categorycylinderId does not already exist. Please check out again.",
        });
      }

      const price = await PriceCategoryCylinder.find({
        isDeleted: { "!=": true },
        categorycylinderId: categorycylinderId,
        isLastest: true,
        isDeleted: false,
      }).sort("regionName ASC");

      if (!price || price == "" || price == null) {
        return res.json({
          success: false,
          message:
            "Error...Price does not already exist. Please check out again.",
        });
      }

      return res.json({ Price: price });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // lấy tất cả giá mới nhất
  getAllPrice: async function (req, res) {
    try {
      const price = await PriceCategoryCylinder.find({
        isDeleted: { "!=": true },
        isLastest: true,
        isDeleted: false,
      }).sort("code ASC");

      return res.json({ Price: price });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // cập nhật giá
  updatePrice: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const priceUpdate = {
        priceId: req.body.priceId,
        price: req.body.price,
      };

      if (!priceUpdate.priceId) {
        return res.json({
          success: false,
          message: "priceId is not defined. Please check out again.",
        });
      }

      if (!priceUpdate.price) {
        return res.json({
          success: false,
          message: "price is not defined. Please check out again.",
        });
      }

      const newPrice = await PriceCategoryCylinder.updateOne({
        isDeleted: { "!=": true },
        _id: priceUpdate.priceId,
        isDeleted: false,
      }).set({
        price: priceUpdate.price,
      });

      if (!newPrice || newPrice == "" || newPrice == null) {
        return res.json({
          success: false,
          message:
            "Error...Price does not already exist. Please check out again.",
        });
      }

      return res.json({
        success: true,
        Price: newPrice,
      });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Lấy giá mới nhất của sản phẩm theo khu vực và loại
  getPriceLatest: async function (req, res) {
    try {
      if (!req.body) {
        return res.badRequest(Utils.jsonErr("Empty body"));
      }

      const regionId = req.body.regionId;
      const categorycylinderId = req.body.categorycylinderId;

      if (!categorycylinderId && !regionId) {
        return res.json({
          success: false,
          message:
            "categorycylinderId or regionId is not defined. Please check out again.",
        });
      }

      const isExist = await Region.findOne({
        isDeleted: { "!=": true },
        _id: regionId,
      });

      if (!isExist) {
        return res.json({
          success: false,
          message:
            "Error...regionId does not already exist. Please check out again.",
        });
      }

      const isExist_ = await CategoryCylinder.findOne({
        isDeleted: { "!=": true },
        _id: categorycylinderId,
      });

      if (!isExist_) {
        return res.json({
          success: false,
          message:
            "Error...categorycylinderId does not already exist. Please check out again.",
        });
      }

      const price = await PriceCategoryCylinder.find({
        isDeleted: { "!=": true },
        regionId: regionId,
        categorycylinderId: categorycylinderId,
        isLastest: true,
        isDeleted: false,
      });

      if (!price || price == "" || price == null) {
        return res.json({
          success: false,
          message:
            "Error...Price does not already exist. Please check out again.",
        });
      }

      return res.json({ Price: price });
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  // Hủy giá
  cancelPrice: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const priceID = req.body.priceID;

      if (!priceID) {
        return res.json({
          success: false,
          message: "priceID không xác định.",
        });
      }

      const checkPrice = await PriceCategoryCylinder.findOne({
        isDeleted: { "!=": true },
        _id: priceID,
        isDeleted: false,
      });

      if (!checkPrice || checkPrice == "" || checkPrice == null) {
        return res.json({
          success: false,
          message: "Không tìm thấy bản ghi.",
        });
      } else {
        const cancelPrice = await PriceCategoryCylinder.updateOne({
          isDeleted: { "!=": true },
          _id: priceID,
          isDeleted: false,
        }).set({
          isDeleted: true,
        });

        return res.json({
          success: true,
          message: "Bản ghi đã được hủy.",
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },
};
