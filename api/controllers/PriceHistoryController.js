/**
 * PriceHistoryController
 *
 * @description :: Server-side logic for managing PriceHistory
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const API_ERRORS = require("../constants/APIErrors");

module.exports = {
  getHistoryPrice: async function (req, res) {
    const cylinderId = req.query.cylinder_id;
    if (!cylinderId) {
      return res.ok("Missing cylinder_id");
    }

    try {
      const priceHistories = await PriceHistory.find({
        isDeleted: { "!=": true },
        cylinders: cylinderId,
      })
        .populate("user")
        .limit(10);
      return res.ok(priceHistories);
    } catch (error) {
      return res.ok(Utils.jsonErr(error));
    }
  },
};
