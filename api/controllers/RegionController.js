/**
 * RegionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    createRegion: async function (req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('Empty body'));
        } 
        
        try {
            const region = {
                name: req.body.name.trim(),
                lat: req.body.lat,
                long: req.body.long,
            };
    
            const newRegion = await Region.create(region).fetch();
    
            return res.json({
                success: true,
                Region: newRegion
            });
        } catch (error) {
            return res.json({
                success: false,
                message: error.message
            });
        }
    },

    getAllRegion: async function(req, res) {
        try {
            const region = await Region.find();

            return res.json({region});
        } catch (error) {
            return res.json({
                success: false,
                message: error.message
            })
        }
    },
  

};

