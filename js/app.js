function handleModeChange() {
    const mode = document.getElementById('mode').value;
    const targetEl = document.getElementById('targetAmount');
    let targetVal = Number(targetEl.value) || 0;
    
    if (prevMode === 'units' && mode === 'stacks') targetEl.value = (targetVal / 10000).toFixed(4);
    else if (prevMode === 'stacks' && mode === 'units') targetEl.value = Math.round(targetVal * 10000);

    const convert = (id) => {
        const el = document.getElementById(id);
        if(el) {
            let val = Number(el.value) || 0;
            if (prevMode === 'units' && mode === 'stacks') el.value = (val / 10000).toFixed(4);
            else if (prevMode === 'stacks' && mode === 'units') el.value = Math.round(val * 10000);
        }
    };

    Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => convert('b_' + k));
    
    Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => {
        if(marketData[k]) {
            marketData[k].forEach(tier => {
                if (prevMode === 'units' && mode === 'stacks') tier.q = parseFloat((tier.q / 10000).toFixed(4));
                else if (prevMode === 'stacks' && mode === 'units') tier.q = Math.round(tier.q * 10000);
            });
        }
    });

    prevMode = mode; 
    renderBankTable();
    renderMarketTable();
    handlePipelineChange();
}

function targetMetalChanged() {
    handlePipelineChange();
}

function run() { clearTimeout(timer); timer = setTimeout(calculate, 150); }

function calculate() {
    const mode = document.getElementById('mode').value;
    const t = i18n[currentLang] || i18n['en'];
    const targetRaw = Number(document.getElementById('targetAmount').value) || 0;
    const crafters = Math.max(1, Number(document.getElementById('crafters').value));
    const targetMetal = document.getElementById('targetMetal').value;
    const mult = mode === 'stacks' ? 10000 : 1;
    
    if (targetRaw <= 0) {
        document.getElementById('gatherOutput').innerHTML = `<div class="empty-msg">${t.noTarget || 'No target set.'}</div>`;
        document.getElementById('stepsOutput').innerHTML = "";
        document.getElementById('statStacks').innerText = "0.00";
        if(document.getElementById('cartTotalGold')) document.getElementById('cartTotalGold').innerText = "0.00 g";
        pipelineStepsRaw = []; byproductsRaw = {}; pureDeficits = {};
        document.getElementById('btnBp').style.display = 'none';
        document.getElementById('bpContainer').style.display = 'none';
        document.getElementById('btnBp').classList.remove('active');
        Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => {
            if(document.getElementById('cost_'+k)) document.getElementById('cost_'+k).innerText = "0.00";
            if(document.getElementById('stash_'+k)) document.getElementById('stash_'+k).innerText = "0";
        });
        updateVisibility(targetMetal);
        save(); return;
    }

    const mR = document.getElementById('modRef').checked ? 1.03 : 1;
    const mE = document.getElementById('modExt').checked ? 1.03 : 1;
    const mM = document.getElementById('modMast').checked ? 1.06 : 1;

    const bank = {}; 
    const purchased = {};
    let totalGold = 0;

    Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => {
        bank[k] = (Number(document.getElementById('b_' + k)?.value) || 0) * mult;
        
        let buyQtyUnits = 0;
        if(marketData[k]) {
            marketData[k].forEach(tier => {
                const tierUnits = tier.q * mult;
                buyQtyUnits += tierUnits;
                totalGold += (tierUnits / 10000) * tier.p;
            });
        }
        purchased[k] = buyQtyUnits;

        const costEl = document.getElementById('cost_' + k);
        const stashEl = document.getElementById('stash_' + k);
        
        if (costEl) {
            let totalCostThisItem = 0;
            if(marketData[k]) {
                marketData[k].forEach(tier => { totalCostThisItem += (tier.q * (mode === 'stacks' ? 1 : 0.0001)) * tier.p; });
            }
            costEl.innerText = totalCostThisItem.toFixed(2);
        }
        if (stashEl) {
            const stashRaw = (bank[k] + purchased[k]) / mult;
            stashEl.innerText = mode === 'stacks' ? stashRaw.toFixed(2) + " Stk" : stashRaw.toLocaleString();
        }
    });

    if(document.getElementById('cartTotalGold')) document.getElementById('cartTotalGold').innerText = totalGold.toFixed(2) + " g";

    const baseTree = resolveTree(targetMetal, targetRaw * mult, bank, mR);
    const baseExtractions = resolveExtractions(baseTree.deficits, mE, mM, bank);
    pureDeficits = baseExtractions.raw;

    const virtualBank = {};
    Object.keys(bank).forEach(k => virtualBank[k] = bank[k] + purchased[k]);

    const actualTree = resolveTree(targetMetal, targetRaw * mult, virtualBank, mR);
    const actualExtractions = resolveExtractions(actualTree.deficits, mE, mM, virtualBank);
    
    const finalDeficits = actualExtractions.raw;
    byproductsRaw = actualExtractions.bp;
    
    let gHTML = '';
    let totalGatherUnits = 0;

    Object.keys(finalDeficits).forEach(k => {
        if (finalDeficits[k] > 0 && GATHERABLE_STONES.includes(k)) {
            totalGatherUnits += finalDeficits[k];
            const fmtVal = mode === 'stacks' ? (finalDeficits[k]/10000).toFixed(2) + " Stk" : finalDeficits[k].toLocaleString();
            
            let totalNeeded = baseExtractions.grossRaw[k] || finalDeficits[k];
            let amountAcquired = totalNeeded - finalDeficits[k];
            let progressPct = totalNeeded > 0 ? Math.min(100, Math.max(0, (amountAcquired / totalNeeded) * 100)) : 0;

            let itemName = (t.items && t.items[k]) ? t.items[k] : (k.charAt(0).toUpperCase() + k.slice(1));
            gHTML += `<div class="logistics-item ${finalDeficits[k] < 10000 ? 'hm-low' : 'hm-high'}" style="--prog: ${progressPct}%;"><span>${itemName}</span><span>${fmtVal}</span></div>`;
        }
    });

    document.getElementById('gatherOutput').innerHTML = totalGatherUnits > 0 ? gHTML : `<div class="empty-msg">${t.allCovered || 'All covered!'}</div>`;
    document.getElementById('statStacks').innerText = (totalGatherUnits / 10000).toFixed(2);

    let newPipeline = [...actualExtractions.extSteps, ...actualTree.steps];
    
    if (JSON.stringify(newPipeline) !== JSON.stringify(pipelineStepsRaw)) {
        completedSteps = [];
        focusIndex = 0;
    }
    pipelineStepsRaw = newPipeline;

    const perCr = crafters > 1 ? ` <span style="color:var(--warning); font-size:0.8em;">${t.perCrafter || '(Per Crafter)'}</span>` : "";

    let outputHTML = pipelineStepsRaw.map((stepObj, index) => {
        let isCompleted = completedSteps.includes(index);
        let completedClass = isCompleted ? 'completed' : '';
        let checkIcon = isCompleted ? '✅' : '⬜';
        
        let modAction = stepObj.htmlAction.replace(/<span class="highlight">([\d,]+)/g, (match, p1) => {
            let num = parseInt(p1.replace(/,/g, ''));
            return `<span class="highlight">${Math.ceil(num / crafters).toLocaleString()}`;
        });

        let mainYieldsStr = (stepObj.mainYields && stepObj.mainYields.length > 0) ? stepObj.mainYields.map(y => {
            let yName = (t.items && t.items[y.item]) ? t.items[y.item] : (y.item.charAt(0).toUpperCase() + y.item.slice(1));
            return `<span class="highlight">${y.amount.toLocaleString()} ${yName}</span>`;
        }).join(', ') : "";
        
        let bpYieldsStr = (stepObj.byproducts && stepObj.byproducts.length > 0) ? stepObj.byproducts.map(y => {
            let yName = (t.items && t.items[y.item]) ? t.items[y.item] : (y.item.charAt(0).toUpperCase() + y.item.slice(1));
            return `${y.amount.toLocaleString()} ${yName}`;
        }).join(', ') : "None";

        let routeHtml = '';
        if (stepObj.routeStats && stepObj.routeStats.length > 1) {
            let btns = stepObj.routeStats.map(rs => {
                let isActive = rs.name === stepObj.selectedRoute ? 'active' : '';
                let badges = '';
                if (rs.isBestYield) badges += `<span title="${t.tooltipBestYield || 'Most Efficient'}" style="margin-left:4px; font-size:11px;">⭐</span>`;
                if (rs.isMaxYield) badges += `<span title="${t.tooltipMaxYield || 'Max Byproducts Generated'}" style="margin-left:4px; font-size:11px;">💎</span>`;
                if (rs.isRegionLocked) badges += `<span title="${t.tooltipRegionLocked || 'Region Locked Machine'}" style="margin-left:4px; font-size:11px;">🌍</span>`;
                let safeStepKey = stepObj.stepKey.replace(/'/g, "\\'");
                let safeRouteName = rs.name.replace(/'/g, "\\'");
                return `<button class="btn-route ${isActive}" onclick="updatePathChoice(event, '${safeStepKey}', '${safeRouteName}')">${rs.name}${badges}</button>`;
            }).join('');
            routeHtml = `<div class="route-choices">${btns}</div>`;
        }

        return `<div class="step-card ${completedClass}" id="step_${index}" onclick="toggleStep(${index})">
            <div>
                <span style="cursor:pointer; margin-right:8px; font-size: 1.1em;">${checkIcon}</span>
                <span style="color:var(--text-dim); font-weight:bold; margin-right:5px;">${t.stepPrefix || 'Step'} ${index + 1}.</span>${modAction}${perCr}
            </div>
            
            <div style="margin-top: 6px; font-size: 11px; padding-left: 28px;">
                <span style="color:var(--success); font-weight:bold;">${t.stepYieldsMain || 'Yields:'}</span> ${mainYieldsStr}<br>
                <span style="color:var(--text-dim); font-weight:bold;">${t.stepByproducts || 'Byproducts:'}</span> <span style="color:var(--text-dim);">${bpYieldsStr}</span>
            </div>

            <div style="padding-left: 28px;">${routeHtml}</div>
        </div>`;
    }).join('');

    let byproductsString = "";
    Object.keys(byproductsRaw).forEach(k => {
        if (byproductsRaw[k] > 0) {
            let itemName = (t.items && t.items[k]) ? t.items[k] : (k.charAt(0).toUpperCase() + k.slice(1));
            byproductsString += `<div style="display:flex; justify-content:space-between; margin-bottom: 2px; font-size: 13px;">
                <span>${itemName}</span>
                <span style="color: var(--accent); font-weight: bold;">${byproductsRaw[k].toLocaleString()}</span>
            </div>`;
        }
    });

    if (byproductsString !== "") {
        document.getElementById('btnBp').style.display = 'inline-flex';
        document.getElementById('bpOutput').innerHTML = byproductsString;
    } else {
        document.getElementById('btnBp').style.display = 'none';
        document.getElementById('bpContainer').style.display = 'none';
        document.getElementById('btnBp').classList.remove('active');
    }

    document.getElementById('stepsOutput').innerHTML = outputHTML;
    
    updatePipelineVisuals();
    if(pipelineViewMode === 'focus') updateFocusView();

    updateVisibility(targetMetal);
    save();
}

function exportToCSV() {
    const t = i18n[currentLang] || i18n['en'];
    const mode = document.getElementById('mode').value;
    const targetMetal = document.getElementById('targetMetal').value;
    const targetVal = document.getElementById('targetAmount').value;
    
    let csv = `Quartermaster Command Logistics Order\nTarget:,${t.items[targetMetal] || targetMetal},Amount:,${targetVal} ${mode === 'stacks' ? 'Stacks' : 'Units'}\n\n`;
    csv += "Item,Inventory Stock,Market Cart Buy,Deficit to Gather\n";
    
    const relevant = getRelevantItems(targetMetal);

    Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => {
        if(relevant.has(k) || pureDeficits[k]) {
            let b = Number(document.getElementById('b_'+k)?.value) || 0;
            let cQty = 0;
            if(marketData[k]) marketData[k].forEach(tier => cQty += tier.q);
            let d = pureDeficits[k] || 0;

            if(b > 0 || cQty > 0 || d > 0) {
                let itemName = (t.items && t.items[k]) ? t.items[k] : k;
                let fmtB = mode === 'stacks' ? b : b;
                let fmtC = mode === 'stacks' ? cQty : cQty;
                let fmtD = mode === 'stacks' ? (d/10000).toFixed(2) : d;
                csv += `"${itemName}",${fmtB},${fmtC},${fmtD}\n`;
            }
        }
    });

    csv += "\nPipeline Steps\n";
    pipelineStepsRaw.forEach((stepObj, index) => {
        let textAction = stepObj.htmlAction.replace(/<[^>]*>?/gm, '');
        csv += `${index + 1},"${textAction}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "quartermaster_order.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(t.exportSuccess || "Exported to CSV!");
}

function toggleBpTab() {
    const el = document.getElementById('bpContainer');
    const btn = document.getElementById('btnBp');
    if (el.style.display === 'none') {
        el.style.display = 'block';
        btn.classList.add('active');
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    } else {
        el.style.display = 'none';
        btn.classList.remove('active');
    }
}

window.onload = () => {
    initMarketData();
    renderBankTable(); 
    renderMarketTable(); 
    load(); 
    document.getElementById('lang').value = currentLang; 
    changeLang(); 
    targetMetalChanged(); 
};