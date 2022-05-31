/**
 * ReviewController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  createReview: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    try {
      const review = {
        carrierID: req.body.carrierID,
        stars: req.body.stars,
        note: req.body.note,
      };

      if (!review.carrierID) {
        return res.json({
          success: false,
          message: "Param carrierID truyền lên không xác định!",
        });
      } else {
        const checkCarrier = await Carrier.findOne({
          isDeleted: { "!=": true },
          _id: review.carrierID,
          isDeleted: false,
        });

        if (!checkCarrier || checkCarrier == "" || checkCarrier == null) {
          return res.json({
            success: false,
            message: "Tài xế không tồn tại.",
          });
        }
      }

      if (!review.stars) {
        return res.json({
          success: false,
          message: "Param stars truyền lên không xác định!",
        });
      }

      const newReview = await Review.create(review).fetch();

      if (!newReview || newReview == "" || newReview == null) {
        return res.json({
          success: false,
          message: "Lỗi...Tạo đánh giá không thành công!. Vui lòng thử lại.",
        });
      } else {
        return res.json({
          success: true,
          Review: newReview,
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
  },

  getAllReviewOfCarrier: async function (req, res) {
    try {
      const reviews = await Review.find({
        isDeleted: { "!=": true },
        carrierID: req.query.carrierID,
        isDeleted: false,
      });

      if (!reviews || reviews == "" || reviews == null) {
        return res.json({
          success: false,
          message: "Không tìm thấy đánh giá nào về tài xế.",
        });
      } else {
        return res.json({
          success: true,
          Reviews: reviews,
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
