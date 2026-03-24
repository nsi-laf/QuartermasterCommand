const Engine = {
    run: function(targetUnits, bankData, mods) {
        const y = CONFIG.yields;
        
        // Dynamic Modifiers
        const mR = mods.ref ? 1.03 : 1;
        const mE = mods.ext ? 1.03 : 1;
        const mM = mods.mast ? 1.06 : 1;

        // Tree Math
        const reqGS = Math.ceil(targetUnits / (y.ovenRefining * mR));
        const coalForSteel = Math.ceil(reqGS * 0.5);
        const spForSteel = Math.ceil(reqGS * 0.5);
        const diffGS = Math.max(0, reqGS - bankData.gs);

        const reqPI = Math.ceil(diffGS / (y.pigIronSmelt * mR));
        const cokeForGS = Math.ceil(reqPI * 0.5);
        const cpForGS = Math.ceil(reqPI * 0.5);
        const diffPI = Math.max(0, reqPI - bankData.pi);

        const reqBlood = Math.ceil(diffPI / (y.bloodOreAttract * mR));
        const cokeForPI = Math.ceil(reqBlood * y.cokePigIronRatio);
        
        const totalCoke = cokeForGS + cokeForPI;
        const diffCoke = Math.max(0, totalCoke - bankData.coke);

        const coalForCoke = Math.ceil(diffCoke / (y.coalPerCoke * mR));
        const cpForCoke = Math.ceil(coalForCoke * y.calxCokeRatio);
        const totalCoal = coalForSteel + coalForCoke;
        const diffCoal = Math.max(0, totalCoal - bankData.coal);

        const reqGranum = Math.ceil(reqBlood / (y.granumExtraction * mE * mM));
        const cpForBlood = Math.ceil(reqGranum * y.calxBloodRatio);

        const totalCP = cpForGS + cpForCoke + cpForBlood;
        const diffCP = Math.max(0, totalCP - bankData.cp);
        const diffSP = Math.max(0, spForSteel - bankData.sp);

        const reqSaburra = Math.ceil(diffSP / (y.saburraExtraction * mE));
        const waterForSaburra = Math.ceil(reqSaburra * 0.1);

        const calxToGrind = Math.ceil(diffCP / (y.calxGrind * mE));
        const waterForCalx = Math.ceil(calxToGrind * 0.1);
        const coalFromGrind = Math.ceil(calxToGrind * y.coalFromCalx * mE);

        const extraCoal = Math.max(0, diffCoal - coalFromGrind);
        const calxToCrush = Math.ceil(extraCoal / (y.calxCrush * mE));

        return {
            reqs: {
                granum: reqGranum,
                calx: calxToGrind + calxToCrush,
                saburra: reqSaburra,
                water: waterForSaburra + waterForCalx
            },
            deficits: {
                granum: Math.max(0, reqGranum - bankData.granum),
                calx: Math.max(0, (calxToGrind + calxToCrush) - bankData.calx),
                saburra: Math.max(0, reqSaburra - bankData.saburra),
                water: Math.max(0, (waterForSaburra + waterForCalx) - bankData.water)
            },
            // FIXED: Explicitly exporting reqSaburra, reqGranum, reqBlood, and reqPI
            details: { 
                reqGS, reqPI, reqBlood, reqGranum, reqSaburra, 
                diffGS, diffPI, diffCoke, diffCP, diffSP, 
                calxToGrind, calxToCrush, extraCoal, coalFromGrind, 
                coalForCoke, cpForCoke, cpForBlood, cokeForPI, cokeForGS, 
                cpForGS, coalForSteel, spForSteel, waterForSaburra, waterForCalx 
            }
        };
    },

    // Calculates max possible target bounded by the LARGEST potential yield in the bank
    findMaxTarget: function(bankData, mods) {
        let absoluteMax = 0;
        
        // Test every item in the bank to see how much steel it could theoretically make
        CONFIG.items.forEach(item => {
            if (bankData[item.id] > 0) {
                let low = 0, high = 20000000, localMax = 0;
                while (low <= high) {
                    let mid = Math.floor((low + high) / 2);
                    let requiredAmount = this.run(mid, bankData, mods).reqs[item.id] || 0;
                    
                    if (requiredAmount <= bankData[item.id]) {
                        localMax = mid;
                        low = mid + 1;
                    } else {
                        high = mid - 1;
                    }
                }
                if (localMax > absoluteMax) absoluteMax = localMax;
            }
        });
        return absoluteMax;
    }
};
