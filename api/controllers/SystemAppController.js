/**
 * SystemAppController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    createSystemApp: async function(req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('Empty body'));
        }

        try {

            const systemapp = {
                appname: req.body.appname,
                appid: req.body.appid,
                restkey: req.body.restkey
            }

            if (!systemapp.appname) {
                return res.json({
                    status: false,
                    message: "Appname is required"
                });
            }

            if (!systemapp.appid) {
                return res.json({
                    status: false,
                    message: "Appname is required"
                });
            }

            if (!systemapp.restkey) {
                return res.json({
                    status: false,
                    message: "Appname is required"
                });
            }

            const newSystemApp = await SystemApp.create(systemapp).fetch();

            if (!newSystemApp || newSystemApp == '' || newSystemApp == null) {
                return res.json({
                    status: false, 
                    message: 'Lỗi...Tạo system app không thành công.'
                });
            } else {
                return res.json({
                    status: true,
                    SystemApp: newSystemApp
                })
            }

        } catch(err) {
            return res.json({
                status: false,
                message: err.message
            })
        }
    }

};

