function handleModeChange() {
    const mode = document.getElementById('mode').value;
    const targetEl = document.getElementById('targetAmount');
    let targetVal = Number(targetEl.value) || 0;

    if (prevMode === 'units' && mode === 'stacks') targetEl.value = (targetVal / 10000).toFixed(4);
    else if (prevMode === 'stacks' && mode === 'units') targetEl.value = Math.round(targetVal * 10000);

    const convert = (id) => {
        const el = document.getElementById(id);
        if (el) {
            let val = Number(el.value) || 0;
            if (prevMode === 'units' && mode === 'stacks') el.value = (val / 10000).toFixed(4);
            else if (prevMode === 'stacks' && mode === 'units') el.value = Math.round(val * 10000);
        }
    };

    Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => convert('b_' + k));

    Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => {
        if (marketData[k]) {
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

// NEW: Calculate the maximum amount you can craft using strictly your bank inventory
function calculateMax() {
    const t = i18n[currentLang] || i18n['en'];
    const targetMetal = document.getElementById('targetMetal').value;
    const mode = document.getElementById('mode').value;
    const mult = mode === 'stacks' ? 10000 : 1;
    let originalTarget = Number(document.getElementById('targetAmount').value) || 0;
    let targetUnits = originalTarget * mult;

    if (targetUnits <= 0) {
        if (typeof showToast === 'function') showToast(t.noTarget || "Please set a valid target amount first.");
        return;
    }

    const mR = document.getElementById('modRef').checked ? 1.03 : 1;
    const mE = document.getElementById('modExt').checked ? 1.03 : 1;
    const mM = document.getElementById('modMast').checked ? 1.06 : 1;

    let bank = {};
    Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => {
        bank[k] = (Number(document.getElementById('b_' + k)?.value) || 0) * mult;
    });

    // Determine what is currently missing for the desired target
    let origTree = resolveTree(targetMetal, targetUnits, bank, mR);
    let origExts = resolveExtractions(origTree.deficits, mE, mM, bank);
    let origMissing = origExts.raw;

    let missingList = [];
    Object.keys(origMissing).forEach(k => {
        if (origMissing[k] > 0) {
            let itemName = (t.items && t.items[k]) ? t.items[k] : (k.charAt(0).toUpperCase() + k.slice(1));
            let amt = mode === 'stacks' ? (origMissing[k] / 10000).toFixed(2) + " Stk" : origMissing[k].toLocaleString();
            missingList.push(`- ${itemName}: ${amt}`);
        }
    });

    let low = 0;
    let high = 10000000;
    let best = 0;

    // Binary search for maximum possible yield before encountering a deficit
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        let tree = resolveTree(targetMetal, mid, bank, mR);
        let exts = resolveExtractions(tree.deficits, mE, mM, bank);

        let hasDeficit = Object.values(exts.raw).some(v => v > 0);

        if (!hasDeficit) {
            best = mid;
            low = mid + 1; // Try to see if we can craft more
        } else {
            high = mid - 1; // We can't craft this much, try less
        }
    }

    let targetName = (t.items && t.items[targetMetal]) ? t.items[targetMetal] : targetMetal;
    let fmtOrig = mode === 'stacks' ? originalTarget + " Stk" : originalTarget.toLocaleString();

    if (best > 0) {
        document.getElementById('targetAmount').value = mode === 'stacks' ? (best / 10000).toFixed(4) : best;
        handlePipelineChange();

        if (best < targetUnits && missingList.length > 0) {
            alert(`Max craftable limit calculated!\n\nYou can only make ${mode === 'stacks' ? (best / 10000).toFixed(4) : best.toLocaleString()} ${targetName}.\n\nTo make your original target of ${fmtOrig}, you are missing:\n${missingList.join('\n')}`);
        } else {
            if (typeof showToast === 'function') showToast("Max craftable limit calculated! You have enough to meet or exceed your target.");
        }
    } else {
        alert(`Cannot craft any ${targetName} with your current bank.\n\nTo make your desired target of ${fmtOrig}, you are missing:\n${missingList.join('\n')}`);
    }
}

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
        if (document.getElementById('cartTotalGold')) document.getElementById('cartTotalGold').innerText = "0.00 g";
        pipelineStepsRaw = []; byproductsRaw = {}; pureDeficits = {};

        document.getElementById('row_chkBp').style.display = 'none';
        document.getElementById('bpContainer').style.display = 'none';

        Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => {
            if (document.getElementById('cost_' + k)) document.getElementById('cost_' + k).innerText = "0.00";
            if (document.getElementById('stash_' + k)) document.getElementById('stash_' + k).innerText = "0";
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
        if (marketData[k]) {
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
            if (marketData[k]) {
                marketData[k].forEach(tier => { totalCostThisItem += (tier.q * (mode === 'stacks' ? 1 : 0.0001)) * tier.p; });
            }
            costEl.innerText = totalCostThisItem.toFixed(2);
        }
        if (stashEl) {
            const stashRaw = (bank[k] + purchased[k]) / mult;
            stashEl.innerText = mode === 'stacks' ? stashRaw.toFixed(2) + " Stk" : stashRaw.toLocaleString();
        }
    });

    if (document.getElementById('cartTotalGold')) document.getElementById('cartTotalGold').innerText = totalGold.toFixed(2) + " g";

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

    CATEGORIES.forEach(cat => {
        let catHtml = '';
        cat.items.forEach(k => {
            if (finalDeficits[k] > 0) {
                totalGatherUnits += finalDeficits[k];
                const fmtVal = mode === 'stacks' ? (finalDeficits[k] / 10000).toFixed(2) + " Stk" : finalDeficits[k].toLocaleString();

                let totalNeeded = baseExtractions.grossRaw[k] || finalDeficits[k];
                let amountAcquired = totalNeeded - finalDeficits[k];
                let progressPct = totalNeeded > 0 ? Math.min(100, Math.max(0, (amountAcquired / totalNeeded) * 100)) : 0;

                let itemName = (t.items && t.items[k]) ? t.items[k] : (k.charAt(0).toUpperCase() + k.slice(1));
                catHtml += `<div class="logistics-item ${finalDeficits[k] < 10000 ? 'hm-low' : 'hm-high'}" style="--prog: ${progressPct}%;"><span>${itemName}</span><span>${fmtVal}</span></div>`;
            }
        });
        if (catHtml !== '') {
            let catName = (t.categories && t.categories[cat.id]) ? t.categories[cat.id] : cat.id;
            gHTML += `<div class="bank-category" style="margin-top:10px; margin-bottom:5px;">${catName}</div>` + catHtml;
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

    const chkBp = document.getElementById('chkBp');
    if (byproductsString !== "") {
        document.getElementById('row_chkBp').style.display = 'flex';
        // Always populate innerHTML regardless of check state so it's ready when clicked
        document.getElementById('bpOutput').innerHTML = byproductsString;

        if (chkBp && chkBp.checked) {
            document.getElementById('bpContainer').style.display = 'block';
        } else {
            document.getElementById('bpContainer').style.display = 'none';
        }
    } else {
        document.getElementById('row_chkBp').style.display = 'none';
        document.getElementById('bpContainer').style.display = 'none';
    }

    document.getElementById('stepsOutput').innerHTML = outputHTML;

    updatePipelineVisuals();
    if (pipelineViewMode === 'focus') updateFocusView();

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
        if (relevant.has(k) || pureDeficits[k]) {
            let b = Number(document.getElementById('b_' + k)?.value) || 0;
            let cQty = 0;
            if (marketData[k]) marketData[k].forEach(tier => cQty += tier.q);
            let d = pureDeficits[k] || 0;

            if (b > 0 || cQty > 0 || d > 0) {
                let itemName = (t.items && t.items[k]) ? t.items[k] : k;
                let fmtB = mode === 'stacks' ? b : b;
                let fmtC = mode === 'stacks' ? cQty : cQty;
                let fmtD = mode === 'stacks' ? (d / 10000).toFixed(2) : d;
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

function toggleBpTabBox() {
    const chkBp = document.getElementById('chkBp');
    const isChecked = chkBp ? chkBp.checked : false;
    const el = document.getElementById('bpContainer');
    if (isChecked) {
        el.style.display = 'block';
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    } else {
        el.style.display = 'none';
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