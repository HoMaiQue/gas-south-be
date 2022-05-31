/**
 * PartnerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const PartnerServices = require("../services/PartnerService");
const USER_TYPES = require("../constants/UserTypes");
const USER_ROLE = require("../constants/UserRoles");

module.exports = {
  /**
   * Action POST for /relationship/create
   * @param partner_ids
   * @param res
   * @returns {partner}
   */
  createRelationship: async function (req, res) {
    const partnerIds = req.body.partner_ids;
    if (!partnerIds) {
      return res.ok("Missing partner_ids");
    }
    const user = req.userInfo;
    try {
      // Get old ids of current relationship
      const currentRelationship = await getRelationship(user.id);
      if (!currentRelationship.status) {
        return res.serverError(currentRelationship.message);
      }
      // Delete old ids of current relationship
      const deletedResult = await deleteRelationship(
        user.id,
        currentRelationship.data
      );
      if (!deletedResult.status) {
        return res.serverError(deletedResult.message);
      }
      // Create new relationship
      let relationship = await Promise.all(
        partnerIds.map(async (item) => {
          let param = {
            host: user.id,
            guest: item,
            //createdBy: idUser
          };
          // return await Partner.create(param).fetch();
          const rela = Partner.create(param).fetch();
          return rela;
        })
      );
      return res.created(relationship);
    } catch (error) {
      return res.serverError(error);
    }
  },

  /**
   * Action GET for /relationship/getRelationship
   * @param guest_id
   * @param res
   * @returns {partner}
   */
  getListRelationship: async function (req, res) {
    const user = req.userInfo;
    const isHasYourself = req.query.isHasYourself;
    //const isPublic = req.query.isPublic;
    const userId = req.query.parentRoot;
    const isHasChild = req.query.isHasChild;
    if (!userId) {
      res.ok(Utils.jsonErr("Missing parentRoot"));
    }
    let listPartner = [];

    let creterialHost = {
      host: userId,
    };

    let creterialGuest = {
      guest: userId,
    };

    // if(isPublic && isPublic === 'true') {
    //   creterialHost.isPublic = true;
    //   creterialGuest.isPublic = true;
    // }

    try {
      const listHost = await Partner.find(creterialHost).populate("guest");
      listHost.map((item) => {
        listPartner.push(item.guest);
      });

      const listGuest = await Partner.find(creterialGuest).populate("host");
      listGuest.map((item) => {
        listPartner.push(item.host);
      });

      if (isHasYourself && isHasYourself === "true") {
        const yourSelf = await User.findOne({
          isDeleted: { "!=": true },
          id: userId,
        });
        if (yourSelf) {
          listPartner.push(yourSelf);
        }
      }

      //get factory childs.
      if (
        !(
          typeof isHasChild === "undefined" ||
          isHasChild === null ||
          isHasChild === false
        )
      ) {
        const listFactoryChild = await User.find({
          isDeleted: { "!=": true },
          isChildOf: userId,
          userType: "Factory",
          userRole: "Owner",
        });
        //listPartner = listPartner.concat(listFactoryChild);
        listPartner = _.union(listPartner, listFactoryChild);
      }

      if (
        user.userType === USER_TYPES.Factory &&
        user.userRole === USER_ROLE.OWNER
      ) {
        const parent = await User.findOne({
          isDeleted: { "!=": true },
          id: user.isChildOf,
        });
        //listPartner = listPartner.concat(parent);
        listPartner = _.union(listPartner, parent);
      }

      return res.ok(listPartner);
    } catch (error) {
      return res.serverError(error);
    }
  },

  /**
   * Action GET for /relationship/getRelationshipFixer
   * @param guest_id
   * @param res
   * @returns {partner}
   */
  getAllFixerInRelationship: async function (req, res) {
    //const user = req.userInfo;
    const userId = req.query.parentRoot;
    if (!userId) {
      res.ok(Utils.jsonErr("Mising parentRoot"));
    }
    let listPartner = [];
    try {
      const listHost = await Partner.find({
        isDeleted: { "!=": true },
        host: userId,
      });
      listHost.map((item) => {
        listPartner.push(item.guest);
      });

      const listGuest = await Partner.find({
        isDeleted: { "!=": true },
        guest: userId,
      });
      listGuest.map((item) => {
        listPartner.push(item.host);
      });

      listPartner.push(userId);
      let listFixer = [];
      for (let i = 0; i < listPartner.length; i++) {
        const results = await User.find({
          isDeleted: { "!=": true },
          userType: "Fixer",
          isChildOf: listPartner[i],
        });
        if (results && results.length > 0) {
          listFixer = [...listFixer, ...results];
        }
      }

      return res.ok(listFixer);
    } catch (error) {
      return res.serverError(error);
    }
  },

  getAllFixerM: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr("Empty body"));
    }

    const { id } = req.body;

    let listFixer = [];
    try {
      listFixer = await User.find({
        isDeleted: { "!=": true },
        isChildOf: id,
        userType: "Fixer",
        userRole: "SuperAdmin",
      });

      if (listFixer.length > 0) {
        return res.json({
          status: true,
          listFixer: listFixer,
          message: "Lay thong tin nha may sua chua thanh cong",
        });
      } else {
        return res.json({
          status: false,
          message: "Lay thong tin nha may sua chua that bai",
        });
      }

      return res.ok(listFixer);
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },
};

/**
 * Action for delete old relationship
 */
async function deleteRelationship(userId, partnerIds) {
  try {
    let deletedGuest = await Partner.destroy({
      host: userId,
      guest: { in: partnerIds },
    }).fetch();
    let deletedHost = await Partner.destroy({
      guest: userId,
      host: { in: partnerIds },
    }).fetch();
    let deletedRelationship = [...deletedGuest, ...deletedHost];
    return { status: true, data: deletedRelationship };
  } catch (error) {
    return { status: false, message: error };
  }
}
/**
 * Action for get old relationship
 */

async function getRelationship(userId) {
  let listPartner = [];
  try {
    const listHost = await Partner.find({
      isDeleted: { "!=": true },
      host: userId,
    });
    listHost.map((item) => {
      listPartner.push(item.guest);
    });

    const listGuest = await Partner.find({
      isDeleted: { "!=": true },
      guest: userId,
    });
    listGuest.map((item) => {
      listPartner.push(item.guest);
    });

    return { data: listPartner, status: true };
  } catch (error) {
    return { message: error, status: false };
  }
}
