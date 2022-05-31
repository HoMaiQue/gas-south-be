module.exports = {
  getAllHistoryOfCylinder: async function (req, res) {
    const { serialCylinder } = req.body;

    let data = await Cylinder.find({
      isDeleted: { "!=": true },
      where: { serial: serialCylinder },
      select: ["serial", "checkedDate"],
    }).populate("histories");
    console.log(data);
    // if(data != undefined || data != null || data != ""){
    return res.json({ data: data });
    // }else{
    //   return res.json({err: true, message: "loi lay chu ky tai xe"});
    // }
  },

  getHistoryByID: async function (req, res) {
    const { idHistory } = req.body;

    let data = await History.find({
      isDeleted: { "!=": true },
      id: idHistory,
    }).populate("toArray");
    console.log(data);
    // if(data != undefined || data != null || data != ""){
    return res.json({ data: data });
    // }else{
    //   return res.json({err: true, message: "loi lay chu ky tai xe"});
    // }
  },

  testBugExcel: async function (req, res) {
    const {
      id, // 5f5de672e683e2278847160b
    } = req.body;

    const currentPlace = await User.findOne({
      isDeleted: { "!=": true },
      _id: id,
    });
    // let data = await User.find({isDeleted: {"!=": true}, id: idHistory }).populate('toArray');
    console.log(currentPlace);
    // if(data != undefined || data != null || data != ""){
    return res.json({ data: currentPlace });
    // }else{
    //   return res.json({err: true, message: "loi lay chu ky tai xe"});
    // }
  },
  test123: async function (req, res) {
    let arr = ["abcdef"];
    for (let i = 0; i < arr.length; i++) {
      res.json({ data: i });
    }
    console.log(data);
  },
};
