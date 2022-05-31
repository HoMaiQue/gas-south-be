/**
 * RentalPartnersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

//const RentalPartners = require("../models/RentalPartners");

module.exports = {
    createRentalPartners: async function (req, res) {

        if (!req.body) {
            return res.json({ status: false, message: "Empty body" });
        }

        const {
            name,
            email,
            phone,
            address,
            code
        } = req.body

        if (!name) return res.json({ status: false, message: 'Missing name' });
        if (!address) return res.json({ status: false, message: 'Missing address' });
        if (!code) return res.json({ status: false, message: 'Missing code of rental partners' });

        try {
            const result = await RentalPartners.create({
                name: name,
                email: email,
                phone: phone,
                address: address,
                code: code
            }).fetch();

            if (result.hasOwnProperty('name')) {
                return res.json({ status: true, data: result, message: 'Tạo đối tác thành công' });
            }
            else {
                return res.json({ status: false, message: 'Tạo đối tác thất bại' });
            }            
        } catch (error) {
            return res.json({ status: false, message: 'Gặp lỗi khi tạo đối tác' });
        }
    }
};

