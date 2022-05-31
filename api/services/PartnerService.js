module.exports = {
  getListPartner: async function (userId) {
    let listPartner = [];
    try {
      const listHost = await Partner.find({host : userId});
      listHost.map(item => {
        listPartner.push(item.guest);
      });

      const listGuest = await Partner.find({guest : userId});
      listGuest.map(item => {
        listPartner.push(item.host);
      });

      return listPartner;
    } catch (error) {
      throw error;
    }
  }
};

