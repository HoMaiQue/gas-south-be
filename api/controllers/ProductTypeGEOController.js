/**
 * ProductTypeGEOController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  createProductTypeGEO: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const product = {
        Id: req.body.Id,
        ProductName: req.body.ProductName.trim(),
        Code: req.body.Code.trim(),
        CRUDBy: req.body.CRUDBy.trim(),
        CRUDDate: req.body.CRUDDate.trim(),
        Type: req.body.Type,
        WeightType: req.body.WeightType.trim(),
        ServiceType: req.body.ServiceType.trim(),
        ProductionType: req.body.ProductionType.trim(),
        BrandNametId: req.body.BrandNametId,
      };

      if (!product.Id) {
        return res.json({
          success: false,
          message: "Id is not defined. Please check out again.",
        });
      }

      if (!product.ProductName) {
        return res.json({
          success: false,
          message: "title is not defined. Please check out again.",
        });
      }

      if (!product.CRUDBy) {
        return res.json({
          success: false,
          message: "content is not defined. Please check out again.",
        });
      }

      const checkProduct = await TestGEO.findOne({
        isDeleted: { "!=": true },
        Id: product.Id,
      });

      if (checkProduct) {
        return res.json({
          success: false,
          message: "Khách hàng đã tồn tại.",
        });
      }

      const products = await TestGEO.create(product).fetch();

      if (!products || products == "" || products == null) {
        return res.json({
          success: false,
          message: "Lỗi...Không thể tạo sản phẩm.",
        });
      } else {
        return res.json({
          success: true,
          Products: products,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getAllProductTypeGEO: async function (req, res) {
    try {
      const products = await TestGEO.find({
        isDeleted: { "!=": true },
        //select: ['Id', 'ProductName', 'Code', 'Type', 'WeightType', 'ColorId']
      });

      if (!products || products == "" || products == null) {
        return res.json({
          success: false,
          message: "Sản phẩm không tồn tại.",
        });
      } else {
        return res.json({
          success: true,
          Products: products,
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
