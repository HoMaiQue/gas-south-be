/**
 * ChecklistController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
//dsdsdsds
module.exports = {   

    setChecklist: async function (req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('Empty body'));
        }

        // const number = req.body.number;
        // const name_Checklist = req.body.name_Checklist;
        // const checking_at = req.body.checking_at;
        // const location = req.body.location;
        // const date = req.body.date;
        // const person_in_charge = req.body.person_in_charge;
        // const phone = req.body.phone;  
        // const signature_CheckedBy = req.body.signature_CheckedBy;
        // const signature_VerifiedBy = req.body.signature_VerifiedBy; 

        const {
            checkingAt,
            checkingDate,
            checkedBy,
            location,

            // 1
            combustiveMaterial,
            warningSigns,
            fireExtinguisher,

            // 2
            appearance,
            // appearance_normal,
            // appearance_weirdo,
            // appearance_other,
            // appearance_other_text,
            cylindersOthers,

            // 3
            pigTails_Type,
            pigTails_Appearance,

            // 4
            pipingBefore_1stRegulator_Leakage,
            pipingBefore_1stRegulator_Others,

            // 5
            pipingAfter_1stRegulator_Leakage,
            pipingAfter_1stRegulator_Others,

            // 6
            valesOnPiping_Leakage,
            valesOnPiping_Others,

            // 7
            hoseConnect_Type,
            // hoseConnect_Type_SoftRubber,
            // hoseConnect_Type_CopperPipe,
            // hoseConnect_Type_Other,
            // hoseConnect_Type_Other_Text,
            hoseConnect_Appearance,

            // 8
            periodicalInspection_Devices,

            //
            notes,

            // signature
            signature_CheckedBy,
            save_Signature_CheckedBy,

            signature_VerifiedBy,
            save_Signature_VerifiedBy,

            selectedMtnDate,
            createdBy
        } = req.body.checklist

        // let appearance = ''
        // if (appearance_normal) {
        //     appearance = 'Bình thường'
        // }
        // if (appearance_weirdo) {
        //     appearance = 'Bất thường'
        // }
        // if (appearance_other) {
        //     appearance = appearance_other_text
        // }

        // let hoseConnect_Type = ''
        // if (hoseConnect_Type_SoftRubber) {
        //     hoseConnect_Type = 'Dây cao su mềm'
        // }
        // if (hoseConnect_Type_CopperPipe) {
        //     hoseConnect_Type = 'Ống đồng'
        // }
        // if (hoseConnect_Type_Other) {
        //     hoseConnect_Type = hoseConnect_Type_Other_Text
        // }

        try {
            const checklist = await Checklist.create({
                number: 'number',
                name_Checklist: 'name_Checklist',
                checking_at: checkingAt,
                location: location,
                checkingDate: checkingDate,
                person_in_charge: checkedBy,
                phone: 'phone',
                signature_CheckedBy: signature_CheckedBy,
                signature_VerifiedBy: signature_VerifiedBy,
                note: notes,
                createdBy: createdBy,
                schedule: selectedMtnDate
            }).fetch();           

            if (checklist) {
                const checklistDetail = await ChecklistDetail.create({
                    checklist: checklist.id,
                    combustiveMaterial: combustiveMaterial,        
                    warningSigns: warningSigns,        
                    fireExtinguisher: fireExtinguisher,        
                    appearance: appearance,        
                    cylindersOthers: cylindersOthers,        
                    pigTails_Type: pigTails_Type,        
                    pigTails_Appearance: pigTails_Appearance,        
                    pipingBefore_1stRegulator_Leakage: pipingBefore_1stRegulator_Leakage,    
                    pipingBefore_1stRegulator_Others: pipingBefore_1stRegulator_Others,
                    pipingAfter_1stRegulator_Leakage: pipingAfter_1stRegulator_Leakage,
                    pipingAfter_1stRegulator_Others: pipingAfter_1stRegulator_Others,
                    valesOnPiping_Leakage: valesOnPiping_Leakage,
                    valesOnPiping_Others: valesOnPiping_Others,
                    hoseConnect_Type: hoseConnect_Type,
                    hoseConnect_Appearance: hoseConnect_Appearance,
                    periodicalInspection_Devices: periodicalInspection_Devices
                }).fetch();

                //const users = await Checklist.find().populate('checklistdetail');

                if (checklistDetail) {
                    return res.json({success: true, message: "Thêm checklist thành công"});
                }
                return res.json({success: false, message: 'Không thêm được checklist'});                
            }
            else {
                return res.json({success: false, message: 'Không thêm được checklist'});
            }
        }
        catch (err) {
            return res.json({success: false, message: err.message});
        }

    },

    setMonthlyChecklist: async function (req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('Empty body'));
        }        

        const {
            checkingAt,
            checkingDate,
            checkedBy,
            location,
            phone,
            
            //
            checkingRecord,
            valveFlangeRecord,
            vaporizerRecord,
            earthSysRecord,
            firefgtRecord,

            //
            notes,

            // signature
            signature_CheckedBy,
            save_Signature_CheckedBy,

            signature_VerifiedBy,
            save_Signature_VerifiedBy,

            selectedMtnDate,
            createdBy
        } = req.body.mthChecklist

        

        try {
            const checklist = await Checklist.create({
                number: 'number',
                name_Checklist: 'name_MthlChecklist',
                checking_at: checkingAt,
                location: location,
                checkingDate: checkingDate,
                person_in_charge: checkedBy,
                phone: phone,
                signature_CheckedBy: signature_CheckedBy,
                signature_VerifiedBy: signature_VerifiedBy,
                note: notes,
                createdBy: createdBy,
                schedule: selectedMtnDate
            }).fetch();           

            if (checklist) {
                const tankCheckingRecord = await TankCheckingRecord.create({
                    checklist: checklist.id,

                    // 1
                    visualChecking_BeforeMaintenance: checkingRecord.visualChecking_BeforeMaintenance,
                    visualChecking_AfterMaintenance: checkingRecord.checkingRecord,
                    visualChecking_Results: checkingRecord.visualChecking_Results,

                    // 2
                    corrosionTank_BeforeMaintenance: checkingRecord.corrosionTank_BeforeMaintenance,
                    corrosionTank_AfterMaintenance: checkingRecord.corrosionTank_AfterMaintenance,
                    corrosionTank_Results: checkingRecord.corrosionTank_Results,

                    // 3
                    combustiveMaterials_BeforeMaintenance: checkingRecord.combustiveMaterials_BeforeMaintenance,
                    combustiveMaterials_AfterMaintenance: checkingRecord.combustiveMaterials_AfterMaintenance,
                    combustiveMaterials_Results: checkingRecord.combustiveMaterials_Results,

                    // 4
                    warningSigns_BeforeMaintenance: checkingRecord.warningSigns_BeforeMaintenance,
                    warningSigns_AfterMaintenance: checkingRecord.warningSigns_AfterMaintenance,
                    warningSigns_Results: checkingRecord.warningSigns_Results,

                    // 5
                    leakingTest_BeforeMaintenance: checkingRecord.leakingTest_BeforeMaintenance,
                    leakingTest_AfterMaintenance: checkingRecord.leakingTest_AfterMaintenance,
                    leakingTest_Results: checkingRecord.leakingTest_Results,
                }).fetch();

                const valveFlangeRec = await ValveFlangeRecord.create({
                    checklist: checklist.id,

                    // 1
                    emergencyShutValve_BeforeMaintenance: valveFlangeRecord.emergencyShutValve_BeforeMaintenance,
                    emergencyShutValve_AfterMaintenance: valveFlangeRecord.emergencyShutValve_AfterMaintenance,
                    emergencyShutValve_Results: valveFlangeRecord.emergencyShutValve_Results,

                    // 2
                    globeValve_BeforeMaintenance: valveFlangeRecord.globeValve_BeforeMaintenance,
                    globeValve_AfterMaintenance: valveFlangeRecord.globeValve_AfterMaintenance,
                    globeValve_Results: valveFlangeRecord.globeValve_Results,

                    // 3
                    ballValve_BeforeMaintenance: valveFlangeRecord.ballValve_BeforeMaintenance,
                    ballValve_AfterMaintenance: valveFlangeRecord.ballValve_AfterMaintenance,
                    ballValve_Results: valveFlangeRecord.ballValve_Results,

                    // 4
                    drainValve_BeforeMaintenance: valveFlangeRecord.drainValve_BeforeMaintenance,
                    drainValve_AfterMaintenance: valveFlangeRecord.drainValve_AfterMaintenance,
                    drainValve_Results: valveFlangeRecord.drainValve_Results,

                    // 5
                    electricalValve_BeforeMaintenance: valveFlangeRecord.electricalValve_BeforeMaintenance,
                    electricalValve_AfterMaintenance: valveFlangeRecord.electricalValve_AfterMaintenance,
                    electricalValve_Results: valveFlangeRecord.electricalValve_Results,

                    // 6
                    stStageRegulator_BeforeMaintenance: valveFlangeRecord.stStageRegulator_BeforeMaintenance,
                    stStageRegulator_AfterMaintenance: valveFlangeRecord.stStageRegulator_AfterMaintenance,
                    stStageRegulator_Results: valveFlangeRecord.stStageRegulator_Results,

                    // 7
                    pipeCorrosion_BeforeMaintenance: valveFlangeRecord.pipeCorrosion_BeforeMaintenance,
                    pipeCorrosion_AfterMaintenance: valveFlangeRecord.pipeCorrosion_AfterMaintenance,
                    pipeCorrosion_Results: valveFlangeRecord.pipeCorrosion_Results,

                    // 8
                    drainInsidePipeline_BeforeMaintenance: valveFlangeRecord.drainInsidePipeline_BeforeMaintenance,
                    drainInsidePipeline_AfterMaintenance: valveFlangeRecord.drainInsidePipeline_AfterMaintenance,
                    drainInsidePipeline_Results: valveFlangeRecord.drainInsidePipeline_Results,

                    // 9
                    checkGasLeakage_BeforeMaintenance: valveFlangeRecord.checkGasLeakage_BeforeMaintenance,
                    checkGasLeakage_AfterMaintenance: valveFlangeRecord.checkGasLeakage_AfterMaintenance,
                    checkGasLeakage_Results: valveFlangeRecord.checkGasLeakage_Results,
                }).fetch();

                const vaporizerCheckingRec = await VaporizerCheckingRecord.create({
                    checklist: checklist.id,
                    
                    // 1
                    chkCtrlSystem_BeforeMaintenance: vaporizerRecord.chkCtrlSystem_BeforeMaintenance,
                    chkCtrlSystem_AfterMaintenance: vaporizerRecord.chkCtrlSystem_AfterMaintenance,
                    chkCtrlSystem_Results: vaporizerRecord.chkCtrlSystem_Results,

                    // 2
                    chkVapoArea_BeforeMaintenance: vaporizerRecord.chkVapoArea_BeforeMaintenance,
                    chkVapoArea_AfterMaintenance: vaporizerRecord.chkVapoArea_AfterMaintenance,
                    chkVapoArea_Results: vaporizerRecord.chkVapoArea_Results,

                    // 3
                    drainVapo_BeforeMaintenance: vaporizerRecord.drainVapo_BeforeMaintenance,
                    drainVapo_AfterMaintenance: vaporizerRecord.drainVapo_AfterMaintenance,
                    drainVapo_Results: vaporizerRecord.drainVapo_Results,

                    // 4
                    topUpWater_BeforeMaintenance: vaporizerRecord.topUpWater_BeforeMaintenance,
                    topUpWater_AfterMaintenance: vaporizerRecord.topUpWater_AfterMaintenance,
                    topUpWater_Results: vaporizerRecord.topUpWater_Results,

                    // 5
                    chkWaterLev_BeforeMaintenance: vaporizerRecord.chkWaterLev_BeforeMaintenance,
                    chkWaterLev_AfterMaintenance: vaporizerRecord.chkWaterLev_AfterMaintenance,
                    chkWaterLev_Results: vaporizerRecord.chkWaterLev_Results,

                    // 6
                    leakTest_BeforeMaintenance: vaporizerRecord.leakTest_BeforeMaintenance,
                    leakTest_AfterMaintenance: vaporizerRecord.leakTest_AfterMaintenance,
                    leakTest_Results: vaporizerRecord.leakTest_Results,

                    // 7
                    chkPower_BeforeMaintenance: vaporizerRecord.chkPower_BeforeMaintenance,
                    chkPower_AfterMaintenance: vaporizerRecord.chkPower_AfterMaintenance,
                    chkPower_Results: vaporizerRecord.chkPower_Results,

                    // 8
                    chkVapoComp_BeforeMaintenance: vaporizerRecord.chkVapoComp_BeforeMaintenance,
                    chkVapoComp_AfterMaintenance: vaporizerRecord.chkVapoComp_AfterMaintenance,
                    chkVapoComp_Results: vaporizerRecord.chkVapoComp_Results,
                }).fetch();

                // 
                const earthSysRec = await EarthSysRecord.create({
                    checklist: checklist.id,

                    // 1
                    earthResisTest_BeforeMaintenance: earthSysRecord.earthResisTest_BeforeMaintenance,
                    earthResisTest_AfterMaintenance: earthSysRecord.earthResisTest_AfterMaintenance,
                    earthResisTest_Results: earthSysRecord.earthResisTest_Results,

                    // 2
                    chkConnEarthPoint_BeforeMaintenance: earthSysRecord.chkConnEarthPoint_BeforeMaintenance,
                    chkConnEarthPoint_AfterMaintenance: earthSysRecord.chkConnEarthPoint_AfterMaintenance,
                    chkConnEarthPoint_Results: earthSysRecord.chkConnEarthPoint_Results,
                }).fetch();

                // 
                const firefgtRec = await FireFightingRecord.create({
                    checklist: checklist.id,

                    // 1
                    testCoolingSys_BeforeMaintenance: firefgtRecord.testCoolingSys_BeforeMaintenance,
                    testCoolingSys_AfterMaintenance: firefgtRecord.testCoolingSys_AfterMaintenance,
                    testCoolingSys_Results: firefgtRecord.testCoolingSys_Results,

                    // 2
                    chkWaterSupl_BeforeMaintenance: firefgtRecord.chkWaterSupl_BeforeMaintenance,
                    chkWaterSupl_AfterMaintenance: firefgtRecord.chkWaterSupl_AfterMaintenance,
                    chkWaterSupl_Results: firefgtRecord.chkWaterSupl_Results,

                    // 3
                    chkPortableEqm_BeforeMaintenance: firefgtRecord.chkPortableEqm_BeforeMaintenance,
                    chkPortableEqm_AfterMaintenance: firefgtRecord.chkPortableEqm_AfterMaintenance,
                    chkPortableEqm_Results: firefgtRecord.chkPortableEqm_Results,
                }).fetch();

                //const users = await Checklist.find().populate('checklistdetail');
                const users11 = await Checklist.find().populate('tankCheckingRecord');
                const users22 = await Checklist.find().populate('valveFlangeRecord');
                const users33 = await Checklist.find().populate('vaporizerCheckingRecord');
                const users44 = await Checklist.find().populate('earthSysRecord');
                const users55 = await Checklist.find().populate('fireFightingRecord');

                if (tankCheckingRecord && valveFlangeRec && vaporizerCheckingRec && earthSysRec && firefgtRec) {
                    return res.json({success: true, message: "Thêm monthly checklist thành công"});
                }
                return res.json({success: false, message: 'Không thêm được monthly tank'});                
            }
            else {
                return res.json({success: false, message: 'Không thêm được monthly checklist'});
            }
        }
        catch (err) {
            return res.json({success: false, message: err.message});
        }
    }

};

