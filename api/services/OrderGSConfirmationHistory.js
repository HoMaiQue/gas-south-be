/**
 * Implementation for Email Service
 * It built for Mailgun.com
 *
 * TODO Tests for production. Stub functions?
 */

const { retry } = require("async");
const moment = require("moment");
const { nanoid } = require("nanoid");
const { obj } = require("pumpify");

module.exports = {
  async createOrderGSConfirmationHistory(userInfor, order, note, action) {
    try {
      await OrderGSConfirmationHistory.create({
        orderGSId: order.id,
        status: order.status,
        action,
        note,
        updatedBy: userInfor.id,
      });
    } catch (err) {
      console.error(err);
      return;
    }
  },
};
