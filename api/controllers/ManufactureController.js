/**
 * ManufactureController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const API_ERRORS = require("../constants/APIErrors");
const USER_TYPE = require("../constants/UserTypes");
const USER_ROLE = require("../constants/UserRoles");

module.exports = {
  /**
   * Action for /manufacture/create
   * @param name, logo
   * @param res
   * @returns {*}
   */
  // cap nhat thong tin nhan hang
  updateBrandInformation: async function (req, res) {
    var {
      id,
      name,
      logo,
      address,
      phone,
      origin,
      mass,
      ingredient,
      preservation,
      appliedStandard,
      optionSafetyInstructions,
      safetyInstructions,
    } = req.body;

    var data = await Manufacture.findOne({ isDeleted: { "!=": true }, id: id });

    if (data == undefined || data == "" || data == null) {
      return res.json({ error: true, message: "loi !" });
    }

    if (!name) {
      name = data.name;
    }
    if (!logo) {
      logo = data.logo;
    }
    if (!address) {
      address = data.address;
    }
    if (!phone) {
      phone = data.phone;
    }
    if (!origin) {
      origin = data.origin;
    }
    if (!mass) {
      mass = data.mass;
    }
    if (!ingredient) {
      ingredient = data.ingredient;
    }
    if (!preservation) {
      preservation = data.preservation;
    }
    if (!appliedStandard) {
      appliedStandard = data.appliedStandard;
    }

    if (!optionSafetyInstructions) {
      optionSafetyInstructions = data.optionSafetyInstructions;
    }
    if (!safetyInstructions) {
      safetyInstructions = data.safetyInstructions;
    }

    console.log(data);
    let a = await Manufacture.updateOne({
      isDeleted: { "!=": true },
      id: data.id,
    }).set({
      name: name,
      logo: logo,
      address: address,
      phone: phone,
      origin: origin,
      mass: mass,
      ingredient: ingredient,
      preservation: preservation,
      appliedStandard: appliedStandard,
      optionSafetyInstructions,
      safetyInstructions,
      updatedBy: id,
    });

    if (a) {
      return res.json({ error: false, data: a });
    } else {
      return res.json({ error: true, message: "loi updata !" });
    }
  },

  create: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const user = req.userInfo;

    //const name = req.body.name;

    const address = req.body.address;
    const phone = req.body.phone;

    // if (!name) {
    //   return res.badRequest(Utils.jsonErr('Name is required'));
    // }

    // req.file('logo').upload({
    //   // don't allow the total upload size to exceed ~10MB
    //   maxBytes: 10000000,
    //   dirname: require('path').resolve(sails.config.appPath, 'assets/images')
    // }, async function whenDone(err, uploadedFiles) {
    //   if (err) {
    //     return res.serverError('Bi ngay day' + err);
    //   }

    //   // If no files were uploaded, respond with an error.
    //   if (uploadedFiles.length === 0){
    //     return res.badRequest('No file was uploaded');
    //   }

    //   // Get the base URL for our deployed application from our custom config
    //   // (e.g. this might be "http://foobar.example.com:1339" or "https://example.com")
    //   var baseUrl = sails.config.custom.baseUrl;

    //   const form = {
    //     name,
    //     logo: uploadedFiles[0].fd,
    //     owner: user.id
    //   }

    //   if(address) form.address = address;
    //   if form.phone = phone;

    //   try {
    //     let manufacture = await Manufacture.create(form).fetch();
    //     // if(!manufacture) {return res.badRequest({messge : API_ERRORS.SERVER_ERROR});}
    //     // let logo = require('util').format('%s/manufacture/logo/%s', baseUrl, manufacture.id);
    //     //sails.log("QUERY ISL:::::", uploadedFiles) ;

    //     //manufacture.logo = logo;
    //     sails.log("QUERY ISL:::::", manufacture)
    //     //manufacture = await Manufacture.update(manufacture).fetch();

    //     return res.created(manufacture);
    //   } catch (err){
    //     return res.badRequest({message: err.message});
    //   }
    // });
    const form = {
      name: req.body.name,
      logo: req.body.logo,
      owner: user.id,
      createBy: req.body.idUser,
      origin: req.body.origin,
      mass: req.body.mass,
      ingredient: req.body.ingredient,
      preservation: req.body.preservation,
      appliedStandard: req.body.appliedStandard,
      optionSafetyInstructions: req.body.optionSafetyInstructions,
      safetyInstructions: req.body.safetyInstructions,
    };

    if (address) {
      form.address = address;
    }
    if (phone) {
      form.phone = phone;
    }

    try {
      let manufacture = await Manufacture.create(form).fetch();

      return res.created(manufacture);
    } catch (err) {
      return res.badRequest({ message: err.message });
    }
  },

  /**
   * Action for /manufacture/find
   * @param manufactureId, cylinderSerial, type
   * @param res
   * @returns {*}
   */
  find: async function (req, res) {
    const query = req.query;
    if (!query) {
      return errorHandler(res, "1", "Empty query");
    }
    const manufactureId = query.manufacture_id;
    let cylinderSerial = query.cylinder_serial;
    const owner = query.owner_id;

    // type 1: Admin, 2: mobile
    const type = query.type;
    let credential = {};
    let authorize = true; // current not need
    let manuQuery = {
      owner,
    };
    let manufacture = [];

    if (!type) {
      return errorHandler(res, "1", "type is required 1: Admin, 2: Mobile");
    }
    // if (manufactureId) {
    //   credential.manufacture = manufactureId;
    //   manuQuery.id = manufactureId
    // }
    //return res.badRequest(Utils.jsonErr('manufacture_id is required'))
    // if (owner || owner !== '') {
    //     try {
    //       manufacture = await Manufacture.find(manuQuery);// get manufacture of this root
    //       //if(type === '1') credential.manufacture = manufacture.length > 0 ? manufacture[0].id : '#######'; // #### for empty search
    //     } catch (error) {
    //       return res.serverError(error);
    //     }
    //   credential.factory = owner
    // }

    if (cylinderSerial) {
      //return res.badRequest(Utils.jsonErr('cylinder_serail is required'))
      if (typeof cylinderSerial === "string") {
        cylinderSerial = JSON.parse(cylinderSerial);
      }
      credential.serial =
        type === "1" ? { contains: cylinderSerial[0] } : { in: cylinderSerial };
    }

    try {
      // let cylinders = []
      // if (type === '1') {
      //   cylinders = await Cylinder.find({isDeleted: {"!=": true},where: credential}).populate(['manufacture','current','histories', 'exportPlace']);
      // }
      // else {
      //   cylinders = await Cylinder.find({isDeleted: {"!=": true},where: credential}).populate('manufacture').populate('current').populate('histories');
      // }
      let cylinders = await Cylinder.find({
        isDeleted: { "!=": true },
        where: credential,
      })
        .populate("manufacture")
        .populate("current")
        .populate("category")
        .populate("histories")
        .populate("exportPlace");

      if (type === "3" && cylinders[0].hasDuplicate === true) {
        let Duplicate = [cylinders[0]];

        let cylindersDuplicate = await Cylinder.find({
          isDeleted: { "!=": true },
          where: credential,
        }).populate("duplicateCylinders");

        await Promise.all(
          cylindersDuplicate[0].duplicateCylinders.map(async (element) => {
            const elDuplicate = await Cylinder.findOne({
              isDeleted: { "!=": true },
              _id: element.copy,
              placeStatus: "IN_CUSTOMER",
            }).populate(["manufacture", "current", "histories", "exportPlace"]);

            if (elDuplicate) Duplicate.push(elDuplicate);
          })
        );

        let lasteddate = 0;
        for (let i = 0; i < Duplicate.length; i++) {
          let lastdate = 0;
          for (let j = 0; j < Duplicate[i].histories.length; j++) {
            if (Duplicate[i].histories[j].type === "SALE") {
              const date = new Date(
                Duplicate[i].histories[j].createdAt
              ).valueOf();
              date > lastdate ? (lastdate = date) : lastdate;
            }
          }
          if (lastdate > lasteddate) {
            lasteddate = lastdate;
            cylinders[0] = Duplicate[i];
          }
        }
      }

      cylinders = await Promise.all(
        cylinders.map(async (cylinder) => {
          cylinder.histories = await Promise.all(
            cylinder.histories.map(async (history) => {
              return await History.findOne({
                isDeleted: { "!=": true },
                id: history.id,
              }).populate(["to", "from", "toArray"]);
            })
          );
          return cylinder;
        })
      );

      // if(type === "2" && cylinders.length > 0) {
      //   for(let i = 0; i < manufacture.length; i++){
      //       if(manufacture[i].id === cylinders[0].manufacture.id) {
      //         authorize = true;
      //         break;
      //       }
      //   }
      // }

      return cylinders.length > 0
        ? type === "1"
          ? res.ok(cylinders)
          : res.ok({ authorize, ...cylinders[0] })
        : errorHandler(res, type, "Item not exist");
    } catch (err) {
      return errorHandler(res, type, err.message);
    }
  },

  /**
   * Action for /manufacture/list
   * @param manufactureId, cylinderSerial
   * @param res
   * @returns {*}
   */
  list: async function (req, res) {
    try {
      // const manufactures = await Manufacture.find({isDeleted: {"!=": true},where: {owner: req.userInfo.id}}).populate('cylinders');
      const manufactures = await Manufacture.find({
        isDeleted: { "!=": true },
        owner: req.userInfo.id,
      });
      return res.ok(manufactures);
    } catch (err) {
      return res.badRequest({ message: err.message });
    }
  },
  getAllList: async function (req, res) {
    try {
      // const manufactures = await Manufacture.find({isDeleted: {"!=": true},where: {owner: req.userInfo.id}}).populate('cylinders');
      const manufactures = await Manufacture.find({
        isDeleted: { "!=": true },
        isDeleted: false,
      });
      if (manufactures) {
        return res.json({
          status: true,
          data: manufactures,
          message: "Tìm thấy danh sách thương hiệu",
        });
      } else {
        return res.json({
          status: false,
          message: "Không tìm thấy thương hiệu nào",
        });
      }
    } catch (err) {
      return res.badRequest({ message: err.message });
    }
  },
  listManufacture: async function (req, res) {
    if (!req.body) {
      return res.json({ status: false, message: "Empty body" });
    }

    const { isChildOf } = req.body;

    if (!isChildOf) return res.json({ status: false, message: "Missing id" });

    try {
      const parent = await getRootParent(isChildOf);

      const manufactures = await Manufacture.find({
        isDeleted: { "!=": true },
        owner: parent,
      });

      if (manufactures) {
        return res.json({
          status: true,
          data: manufactures,
          message: "Tìm thấy danh sách thương hiệu",
        });
      } else {
        return res.json({
          status: false,
          message: "Không tìm thấy thương hiệu nào",
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        message: "Gặp lỗi khi tìm thương hiệu",
      });
    }
  },

  // Lấy thương hiệu cho GEO
  listManufactures: async function (req, res) {
    if (Object.keys(req.query).length === 0) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { email } = req.query;

    if (!email) return res.badRequest(Utils.jsonErr("Missing email"));

    try {
      const userInfo = await User.findOne({
        isDeleted: { "!=": true },
        email: email,
      });
      if (!userInfo) {
        return res.badRequest(Utils.jsonErr("User not found"));
      }

      const parent = await getRootParent(userInfo.id);

      const manufactures = await Manufacture.find({
        isDeleted: { "!=": true },
        owner: parent,
      });

      if (manufactures.length > 0) {
        let returnData = [];
        manufactures.forEach((manufacture) => {
          returnData.push({
            id: manufacture.id,
            name: manufacture.name,
          });
        });

        return res.json({
          status: true,
          data: returnData,
          message: "Tìm thấy danh sách thương hiệu",
        });
      } else {
        return res.json({
          status: false,
          data: [],
          message: "Không tìm thấy thương hiệu nào",
        });
      }
    } catch (err) {
      return res.json({
        status: false,
        data: [],
        message: "Gặp lỗi khi tìm thương hiệu",
      });
    }
  },
};

function errorHandler(res, type, error) {
  // type 1: web, 2: mobile
  return type === "1"
    ? res.ok(Utils.jsonErr(error))
    : res.badRequest(Utils.jsonErr(error));
}

// *************** Function to get root Parent of user tree
async function getRootParent(parentId) {
  try {
    if (
      parentId === null ||
      typeof parentId === "undefined" ||
      parentId === ""
    ) {
      return "";
    }
    let parent = await User.findOne({
      isDeleted: { "!=": true },
      id: parentId,
    });
    if (!parent) {
      return "";
    }
    if (
      parent.userType === USER_TYPE.Factory &&
      parent.userRole === USER_ROLE.SUPER_ADMIN
    ) {
      return parent.id;
    }
    return await getRootParent(parent.isChildOf);
  } catch (error) {
    console.log(error.message);
  }
}
