let timer = null;
let prevMode = 'units';
let currentLang = 'en';
let collapsedState = {};
let completedSteps = [];
let pureDeficits = {}; 
let pipelineStepsRaw = []; 
let byproductsRaw = {}; 
let pipelineViewMode = 'overview';
let marketData = {}; 
let focusIndex = 0;

let moduleVisibility = {
    'mod_prodCmd': true, 'mod_yieldMods': true, 'mod_constraints_wrapper': true,
    'mod_invBank': true, 'mod_marketCart': true, 'mod_defGather': true, 'mod_mfgPipe': true
};
let customColors = { accent: null, bg: null, text: null };

function initMarketData() {
    rawKeys.forEach(k => {
        if (!marketData[k]) marketData[k] = [{ p: defaultPrices[k], q: 0 }];
    });
}

function openSettings(tabId = 'prefs') { 
    document.getElementById('settingsModal').style.display = 'block'; 
    switchTab(tabId);
}
function closeSettings() { document.getElementById('settingsModal').style.display = 'none'; }
window.onclick = function(event) { if (event.target == document.getElementById('settingsModal')) closeSettings(); }

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('tab_' + tabId).style.display = 'block';
    document.getElementById('tabBtn_' + tabId).classList.add('active');
}

function toggleCollapse(id) {
    const el = document.getElementById(id);
    if (el.classList.contains('collapsed')) {
        el.classList.remove('collapsed');
        collapsedState[id] = false;
    } else {
        el.classList.add('collapsed');
        collapsedState[id] = true;
    }
    save();
}

function toggleModule(modId, isVisible) {
    moduleVisibility[modId] = isVisible;
    const el = document.getElementById(modId);
    if(el) {
        if(isVisible) el.classList.remove('module-hidden');
        else el.classList.add('module-hidden');
    }
    save();
}

function applyColors() {
    const acc = document.getElementById('colorAccent').value;
    const bg = document.getElementById('colorBg').value;
    const txt = document.getElementById('colorText').value;
    customColors.accent = acc;
    customColors.bg = bg;
    customColors.text = txt;
    document.documentElement.style.setProperty('--accent', acc);
    document.documentElement.style.setProperty('--bg-card', bg);
    document.documentElement.style.setProperty('--text', txt);
    save();
}

function resetColors() {
    customColors = { accent: null, bg: null, text: null };
    document.documentElement.style.removeProperty('--accent');
    document.documentElement.style.removeProperty('--bg-card');
    document.documentElement.style.removeProperty('--text');
    
    const isLight = document.body.classList.contains('light-theme');
    document.getElementById('colorAccent').value = isLight ? '#8a6312' : '#d4af37';
    document.getElementById('colorBg').value = isLight ? '#ffffff' : '#1c1c21';
    document.getElementById('colorText').value = isLight ? '#111111' : '#e0e0e0';
    save();
}

function toggleTheme() { 
    document.body.classList.toggle('light-theme'); 
    resetColors(); // Instantly overwrite user-set custom colors when toggling themes
}

function updateConstraintUI() {
    const furnace = document.getElementById('pref_furnace');
    const blast = document.getElementById('pref_blast');
    if(!furnace || !blast) return;

    if(furnace.checked) {
        blast.disabled = true;
        blast.parentElement.style.opacity = '0.5';
    } else if(blast.checked) {
        furnace.disabled = true;
        furnace.parentElement.style.opacity = '0.5';
    } else {
        furnace.disabled = false;
        furnace.parentElement.style.opacity = '1';
        blast.disabled = false;
        blast.parentElement.style.opacity = '1';
    }
}

function handleFurnaceToggle(el) {
    if(el.checked) document.getElementById('pref_blast').checked = false;
    updateConstraintUI();
    run();
}

function handleBlastToggle(el) {
    if(el.checked) document.getElementById('pref_furnace').checked = false;
    updateConstraintUI();
    run();
}

function getActivePrefs() {
    let prefs = new Set();
    if(document.getElementById('pref_bor')?.checked) prefs.add('bor');
    if(document.getElementById('pref_furnace')?.checked) prefs.add('furnace');
    if(document.getElementById('pref_blast')?.checked) prefs.add('blast_furnace');
    return prefs;
}

function setPipelineView(mode) {
    pipelineViewMode = mode;
    document.getElementById('btnOverview').classList.toggle('active', mode === 'overview');
    document.getElementById('btnFocus').classList.toggle('active', mode === 'focus');
    
    const container = document.getElementById('stepsOutput');
    const nav = document.getElementById('focusNav');
    
    if (mode === 'focus') {
        container.classList.add('focus-mode');
        if(nav) nav.style.display = 'flex';
        focusIndex = 0;
        for(let i=0; i<pipelineStepsRaw.length; i++) {
            if(!completedSteps.includes(i)) { focusIndex = i; break; }
        }
        updateFocusView();
    } else {
        container.classList.remove('focus-mode');
        if(nav) nav.style.display = 'none';
        document.querySelectorAll('#stepsOutput .step-card').forEach(c => c.classList.remove('active-focus'));
    }
}

function navFocus(dir) {
    focusIndex += dir;
    if (focusIndex < 0) focusIndex = 0;
    if (focusIndex >= pipelineStepsRaw.length) focusIndex = pipelineStepsRaw.length - 1;
    updateFocusView();
}

function updateFocusView() {
    if (pipelineViewMode !== 'focus') return;
    const cards = document.querySelectorAll('#stepsOutput .step-card');
    cards.forEach((card, index) => {
        if (index === focusIndex) card.classList.add('active-focus');
        else card.classList.remove('active-focus');
    });
    const navText = document.getElementById('focusProgressText');
    if (navText && pipelineStepsRaw.length > 0) {
        navText.innerText = `Step ${focusIndex + 1} of ${pipelineStepsRaw.length}`;
    }
}

function updatePipelineVisuals() {
    document.querySelectorAll('#stepsOutput .step-card').forEach((card, index) => {
        if (completedSteps.includes(index)) card.classList.add('completed');
        else card.classList.remove('completed');
    });
    
    let percent = pipelineStepsRaw.length === 0 ? 100 : Math.round((completedSteps.length / pipelineStepsRaw.length) * 100);
    if(percent > 100) percent = 100;
    
    const progBar = document.getElementById('projectProgress');
    const progText = document.getElementById('projectProgressText');
    if(progBar) progBar.style.width = percent + '%';
    if(progText) progText.innerText = percent + '% Pipeline Completed';
}

function toggleStep(index) {
    const idx = completedSteps.indexOf(index);
    const stepObj = pipelineStepsRaw[index];
    const isStacks = document.getElementById('mode').value === 'stacks';
    
    if (idx > -1) {
        completedSteps.splice(idx, 1);
        if (stepObj && stepObj.yields) {
            stepObj.yields.forEach(y => {
                const bankInput = document.getElementById('b_' + y.item);
                if (bankInput) {
                    let current = Number(bankInput.value) || 0;
                    let sub = isStacks ? y.amount / 10000 : y.amount;
                    bankInput.value = Math.max(0, current - sub).toFixed(isStacks ? 4 : 0);
                }
            });
        }
    } else {
        completedSteps.push(index);
        if (stepObj && stepObj.yields) {
            stepObj.yields.forEach(y => {
                const bankInput = document.getElementById('b_' + y.item);
                if (bankInput) {
                    let current = Number(bankInput.value) || 0;
                    let add = isStacks ? y.amount / 10000 : y.amount;
                    bankInput.value = (current + add).toFixed(isStacks ? 4 : 0);
                }
            });
        }
        if (pipelineViewMode === 'focus') navFocus(1);
    }
    
    updatePipelineVisuals();
    save();
}

function restartPipeline() {
    if (!confirm(i18n[currentLang].restartPrompt || "Restart the pipeline? This will un-check all steps and remove their yields from your bank.")) return;
    
    const isStacks = document.getElementById('mode').value === 'stacks';
    completedSteps.forEach(index => {
        const stepObj = pipelineStepsRaw[index];
        if (stepObj && stepObj.yields) {
            stepObj.yields.forEach(y => {
                const bankInput = document.getElementById('b_' + y.item);
                if (bankInput) {
                    let current = Number(bankInput.value) || 0;
                    let sub = isStacks ? y.amount / 10000 : y.amount;
                    bankInput.value = Math.max(0, current - sub).toFixed(isStacks ? 4 : 0);
                }
            });
        }
    });
    
    completedSteps = [];
    focusIndex = 0;
    updatePipelineVisuals();
    if(pipelineViewMode === 'focus') updateFocusView();
    save();
}

function addMarketTier(k) {
    marketData[k].push({ p: defaultPrices[k], q: 0 });
    renderMarketTable();
}

function removeMarketTier(k, idx) {
    marketData[k].splice(idx, 1);
    renderMarketTable();
    run();
}

function clearMarketTier(k, idx) {
    marketData[k][idx].q = 0;
    renderMarketTable();
    run();
}

function clearCart() {
    rawKeys.forEach(k => marketData[k] = [{ p: defaultPrices[k], q: 0 }]);
    renderMarketTable();
    run();
}

function updateMarketTier(k, idx, field, val) {
    marketData[k][idx][field] = Number(val) || 0;
    run();
}

function quickAddMarket(k, idx) {
    const isStacks = document.getElementById('mode').value === 'stacks';
    let current = Number(marketData[k][idx].q) || 0;
    marketData[k][idx].q = isStacks ? parseFloat((current + 1).toFixed(4)) : current + 10000;
    renderMarketTable();
    run();
}

function quickSubMarket(k, idx) {
    const isStacks = document.getElementById('mode').value === 'stacks';
    let current = Number(marketData[k][idx].q) || 0;
    marketData[k][idx].q = Math.max(0, isStacks ? parseFloat((current - 1).toFixed(4)) : current - 10000);
    renderMarketTable();
    run();
}

function autoFillCart() { 
    rawKeys.forEach(k => {
        const mode = document.getElementById('mode').value;
        let needed = pureDeficits[k] || 0;
        marketData[k] = [{ 
            p: marketData[k][0].p || defaultPrices[k], 
            q: mode === 'stacks' ? parseFloat((needed / 10000).toFixed(4)) : needed 
        }];
    });
    renderMarketTable();
    run(); 
}

function renderMarketTable() {
    const container = document.getElementById('marketContainer');
    const t = i18n[currentLang];
    const addLabel = document.getElementById('mode').value === 'stacks' ? t.qAddStk : t.qAdd;
    const subLabel = document.getElementById('mode').value === 'stacks' ? t.qSubStk : t.qSub;
    
    let html = `<div class="market-row market-header desktop-only"><div></div><div style="text-align:center">${t.tblPrice}</div><div style="text-align:center">${t.tblBuy}</div><div style="text-align:right">${t.tblCost}</div><div style="text-align:right">${t.tblStash}</div></div>`; 

    rawKeys.forEach(k => {
        const tiers = marketData[k];
        let totalBuy = 0;
        let totalCost = 0;

        let priceHtml = '';
        let buyHtml = '';

        tiers.forEach((tier, idx) => {
            totalBuy += tier.q;
            totalCost += (tier.q * (document.getElementById('mode').value === 'stacks' ? 1 : 0.0001)) * tier.p;
            
            priceHtml += `<div style="margin-bottom: 4px; display: flex; align-items: center; justify-content: center;">
                <input type="number" style="width: 70px;" value="${tier.p}" title="Price" oninput="updateMarketTier('${k}', ${idx}, 'p', this.value)">
            </div>`;
            
            buyHtml += `<div style="display:flex; gap: 4px; margin-bottom: 4px; justify-content: center; align-items: center;">
                <button class="btn-stack q-sub" style="min-width:30px; padding:0 4px;" onclick="quickSubMarket('${k}', ${idx})">${subLabel}</button>
                <input type="number" style="width: 75px;" value="${tier.q}" title="Qty" oninput="updateMarketTier('${k}', ${idx}, 'q', this.value)">
                <button class="btn-stack q-add" style="min-width:30px; padding:0 4px;" onclick="quickAddMarket('${k}', ${idx})">${addLabel}</button>
                <button class="btn-clear btn-sq" title="Clear Qty" onclick="clearMarketTier('${k}', ${idx})">✖</button>
                ${idx > 0 ? `<button class="btn-clear btn-sq" style="background:var(--border);" title="Remove Tier" onclick="removeMarketTier('${k}', ${idx})">➖</button>` : `<button class="btn-cart btn-sq" title="Add Tier" onclick="addMarketTier('${k}')">➕</button>`}
            </div>`;
        });

        html += `<div class="market-row" id="row_m_${k}" style="border-bottom: 1px dashed var(--border); padding-bottom: 10px;">
            <div style="font-weight:bold; color:var(--accent); align-self: start; margin-top: 5px;">${t.items[k] || k}</div>
            <div style="text-align:center; align-self: start;">${priceHtml}</div>
            <div style="text-align:center; align-self: start;">${buyHtml}</div>
            <div style="text-align:right; align-self: start; margin-top: 5px;"><span class="mobile-label">${t.tblCost}</span><span style="font-weight:bold; color:var(--accent); font-size: 1.1em;" id="cost_${k}">0.00</span></div>
            <div style="text-align:right; align-self: start; margin-top: 5px;"><span class="mobile-label">${t.tblStash}</span><span style="color:var(--text-dim);" id="stash_${k}">0</span></div>
        </div>`;
    });
    
    html += `<div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; padding-top:15px; border-top:1px solid var(--border);"><div style="font-weight:bold; text-transform:uppercase; color:var(--text-dim);">${t.cartTotal}</div><div id="cartTotalGold" style="font-weight:bold; color:var(--accent); font-size:1.3em;">0.00 g</div></div>`;
    container.innerHTML = html;
    
    if(document.getElementById('targetMetal')) {
        updateVisibility(document.getElementById('targetMetal').value);
    }
}

function renderBankTable() {
    const table = document.getElementById('bankTable');
    const t = i18n[currentLang];
    const addLabel = document.getElementById('mode').value === 'stacks' ? t.qAddStk : t.qAdd;
    const subLabel = document.getElementById('mode').value === 'stacks' ? t.qSubStk : t.qSub;
    
    let html = ""; 
    CATEGORIES.forEach(cat => {
        html += `<tbody id="cat_${cat.id}">`;
        html += `<tr><td colspan="2" class="bank-category">${t.categories[cat.id] || cat.id}</td></tr>`;
        cat.items.forEach(k => {
            const val = Number(document.getElementById('b_'+k)?.value) || 0;
            
            // Adjusted exact visual order using uniform flex gap: [-10k] [Input] [+10k] [Clear]
            html += `<tr id="row_b_${k}"><td style="width:35%; font-weight:bold; padding-left:10px;">${t.items[k] || k}</td>
                <td style="text-align:right; white-space: nowrap;">
                    <div style="display:flex; gap: 4px; justify-content: flex-end; align-items:center;">
                        <button class="btn-stack q-sub" style="min-width:30px; padding:0 4px;" onclick="quickSub('b_${k}')">${subLabel}</button>
                        <input type="number" id="b_${k}" value="${val}" oninput="run()" style="width: 75px;">
                        <button class="btn-stack q-add" style="min-width:30px; padding:0 4px;" onclick="quickAdd('b_${k}')">${addLabel}</button>
                        <button class="btn-clear btn-clear-bank" onclick="clearItem('b_${k}')">Clear</button>
                    </div>
                </td></tr>`;
        });
        html += `</tbody>`;
    });
    table.innerHTML = html;
}

function updateVisibility(targetMetal) {
    const relevant = getRelevantItems(targetMetal, getActivePrefs());
    const showAll = document.getElementById('showAllBank')?.checked;
    
    CATEGORIES.forEach(cat => {
        let catHasVisibleItem = false;
        cat.items.forEach(k => {
            const row = document.getElementById('row_b_' + k);
            if (row) {
                if (k === targetMetal) {
                    row.style.display = 'none';
                } else if (showAll || relevant.has(k)) {
                    row.style.display = '';
                    catHasVisibleItem = true;
                } else {
                    row.style.display = 'none';
                }
            }
        });
        const catTbody = document.getElementById('cat_' + cat.id);
        if (catTbody) catTbody.style.display = catHasVisibleItem ? '' : 'none';
    });

    rawKeys.forEach(k => {
        const row = document.getElementById('row_m_' + k);
        if (row) row.style.display = relevant.has(k) ? 'grid' : 'none';
    });
}

function init() {
    initMarketData();
    renderBankTable(); 
    renderMarketTable(); 
    load(); 
    updateConstraintUI();
    document.getElementById('lang').value = currentLang; 
    changeLang(); 
}

function quickAdd(id) {
    const el = document.getElementById(id);
    const isStacks = document.getElementById('mode').value === 'stacks';
    let current = Number(el.value) || 0;
    el.value = isStacks ? parseFloat((current + 1).toFixed(4)) : current + 10000;
    run();
}

function quickSub(id) {
    const el = document.getElementById(id);
    const isStacks = document.getElementById('mode').value === 'stacks';
    let current = Number(el.value) || 0;
    el.value = Math.max(0, isStacks ? parseFloat((current - 1).toFixed(4)) : current - 10000);
    run();
}

function clearItem(id) {
    const el = document.getElementById(id);
    if (el) { el.value = 0; run(); }
}

function clearAll() {
    if(confirm(i18n[currentLang].resetPrompt)) {
        document.querySelectorAll('input[id^="b_"]').forEach(el => el.value = 0);
        rawKeys.forEach(k => marketData[k] = [{ p: defaultPrices[k], q: 0 }]);
        const mode = document.getElementById('mode').value;
        document.getElementById('targetAmount').value = mode === 'stacks' ? 1 : 10000;
        completedSteps = [];
        
        if(document.getElementById('pref_bor')) document.getElementById('pref_bor').checked = false;
        if(document.getElementById('pref_furnace')) document.getElementById('pref_furnace').checked = false;
        if(document.getElementById('pref_blast')) document.getElementById('pref_blast').checked = false;
        updateConstraintUI();

        closeSettings();
        renderMarketTable();
        run();
    }
}

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
    
    rawKeys.forEach(k => {
        marketData[k].forEach(tier => {
            if (prevMode === 'units' && mode === 'stacks') tier.q = parseFloat((tier.q / 10000).toFixed(4));
            else if (prevMode === 'stacks' && mode === 'units') tier.q = Math.round(tier.q * 10000);
        });
    });

    prevMode = mode; 
    renderBankTable();
    renderMarketTable();
    run();
}

function generateShareCode() {
    let state = { b: {}, m: {}, s: {}, p: Array.from(getActivePrefs()) };
    Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => {
        let v = Number(document.getElementById('b_'+k)?.value);
        if (v) state.b[k] = v;
    });
    
    state.m = marketData;
    state.s.t = document.getElementById('targetMetal').value;
    state.s.a = document.getElementById('targetAmount').value;
    state.s.c = document.getElementById('crafters').value;
    state.s.e = document.getElementById('extStrategy').value;
    state.s.m = document.getElementById('mode').value;
    
    const code = btoa(JSON.stringify(state));
    const codeEl = document.getElementById('shareCode');
    codeEl.value = code;
    
    navigator.clipboard.writeText(code);
    alert(i18n[currentLang].exportSuccess || "Code copied to clipboard!");
}

function loadShareCode() {
    try {
        const code = document.getElementById('shareCode').value.trim();
        if (!code) return;
        const state = JSON.parse(atob(code));
        
        document.querySelectorAll('input[id^="b_"]').forEach(el => el.value = 0);
        if (state.b) Object.keys(state.b).forEach(k => { const el = document.getElementById('b_'+k); if(el) el.value = state.b[k]; });
        if (state.m) marketData = state.m;
        
        if (state.p) {
            let pSet = new Set(state.p);
            if(document.getElementById('pref_bor')) document.getElementById('pref_bor').checked = pSet.has('bor');
            if(document.getElementById('pref_furnace')) document.getElementById('pref_furnace').checked = pSet.has('furnace');
            if(document.getElementById('pref_blast')) document.getElementById('pref_blast').checked = pSet.has('blast_furnace');
            updateConstraintUI();
        }
        
        if (state.s) {
            if(state.s.t) document.getElementById('targetMetal').value = state.s.t;
            if(state.s.a) document.getElementById('targetAmount').value = state.s.a;
            if(state.s.c) document.getElementById('crafters').value = state.s.c;
            if(state.s.e) document.getElementById('extStrategy').value = state.s.e;
            if(state.s.m) {
                document.getElementById('mode').value = state.s.m;
                prevMode = state.s.m;
            }
        }
        save(); renderBankTable(); renderMarketTable(); run();
        alert(i18n[currentLang].importSuccess || "Setup loaded successfully!");
    } catch(e) {
        alert(i18n[currentLang].importError || "Invalid code provided.");
    }
}

function run() { clearTimeout(timer); timer = setTimeout(calculate, 150); }

function calculateMax() {
    const mode = document.getElementById('mode').value;
    const targetMetal = document.getElementById('targetMetal').value;
    const extStrategy = document.getElementById('extStrategy').value;
    const prefs = getActivePrefs();
    const mult = mode === 'stacks' ? 10000 : 1;
    
    const mR = document.getElementById('modRef').checked ? 1.03 : 1;
    const mE = document.getElementById('modExt').checked ? 1.03 : 1;
    const mM = document.getElementById('modMast').checked ? 1.06 : 1;

    const bank = {}; 
    Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => bank[k] = (Number(document.getElementById('b_' + k)?.value) || 0) * mult);

    const primaryChain = getPrimaryChain(targetMetal);

    let low = 0, high = 1000000 * mult, maxPossible = 0;
    while(low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (mid === 0) { low = mid + 1; continue; }
        
        const tree = resolveTree(targetMetal, mid, bank, mR, prefs);
        const extractions = resolveExtractions(tree.deficits, extStrategy, mE, mM, bank);
        
        let hasPrimaryDeficit = false;
        Object.keys(extractions.raw).forEach(k => {
            if (extractions.raw[k] > 0 && primaryChain.includes(k)) {
                hasPrimaryDeficit = true; 
            }
        });

        if (!hasPrimaryDeficit) {
            maxPossible = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    
    if (maxPossible === 0) maxPossible = mode === 'stacks' ? 10000 : 1;
    document.getElementById('targetAmount').value = mode === 'stacks' ? parseFloat((maxPossible / 10000).toFixed(4)) : maxPossible;
    
    calculate();
}

function calculate() {
    const mode = document.getElementById('mode').value;
    const t = i18n[currentLang];
    const targetRaw = Number(document.getElementById('targetAmount').value) || 0;
    const crafters = Math.max(1, Number(document.getElementById('crafters').value));
    const targetMetal = document.getElementById('targetMetal').value;
    const extStrategy = document.getElementById('extStrategy').value;
    const prefs = getActivePrefs();
    const mult = mode === 'stacks' ? 10000 : 1;
    
    const bank = {}; 
    Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => bank[k] = (Number(document.getElementById('b_' + k)?.value) || 0) * mult);

    if (targetRaw <= 0) {
        document.getElementById('gatherOutput').innerHTML = `<div class="empty-msg">${t.noTarget}</div>`;
        document.getElementById('stepsOutput').innerHTML = "";
        document.getElementById('statStacks').innerText = "0.00";
        if(document.getElementById('cartTotalGold')) document.getElementById('cartTotalGold').innerText = "0.00 g";
        pipelineStepsRaw = []; byproductsRaw = {}; pureDeficits = {};
        rawKeys.forEach(k => {
            if(document.getElementById('cost_'+k)) document.getElementById('cost_'+k).innerText = "0.00";
            if(document.getElementById('stash_'+k)) document.getElementById('stash_'+k).innerText = "0";
        });
        updateVisibility(targetMetal);
        save(); return;
    }

    const mR = document.getElementById('modRef').checked ? 1.03 : 1;
    const mE = document.getElementById('modExt').checked ? 1.03 : 1;
    const mM = document.getElementById('modMast').checked ? 1.06 : 1;

    const tree = resolveTree(targetMetal, targetRaw * mult, bank, mR, prefs);
    const extractions = resolveExtractions(tree.deficits, extStrategy, mE, mM, bank);
    pureDeficits = extractions.raw;
    const grossRaw = extractions.grossRaw; 
    byproductsRaw = extractions.bp;
    
    let totalGold = 0; let totalUnits = 0; let purchased = {}; let gHTML = '';
    
    rawKeys.forEach(k => {
        const costEl = document.getElementById('cost_' + k);
        const stashEl = document.getElementById('stash_' + k);
        
        let buyQtyUnits = 0;
        let bankQtyRaw = Number(document.getElementById('b_' + k)?.value) || 0;
        
        marketData[k].forEach(tier => {
            const tierUnits = tier.q * mult;
            buyQtyUnits += tierUnits;
            totalGold += (tierUnits / 10000) * tier.p;
        });

        purchased[k] = buyQtyUnits;
        let buyQtyRaw = buyQtyUnits / mult;
        
        if (costEl) {
            let totalCostThisItem = 0;
            marketData[k].forEach(tier => { totalCostThisItem += (tier.q * (mode === 'stacks' ? 1 : 0.0001)) * tier.p; });
            costEl.innerText = totalCostThisItem.toFixed(2);
        }
        if (stashEl) {
            const stashRaw = bankQtyRaw + buyQtyRaw;
            stashEl.innerText = mode === 'stacks' ? stashRaw.toFixed(2) + " Stk" : stashRaw.toLocaleString();
        }
    });

    if(document.getElementById('cartTotalGold')) document.getElementById('cartTotalGold').innerText = totalGold.toFixed(2) + " g";

    Object.keys(pureDeficits).forEach(k => {
        const remainingToGather = Math.max(0, pureDeficits[k] - (purchased[k] || 0));
        let totalNeeded = grossRaw[k] || pureDeficits[k];
        let amountAcquired = totalNeeded - remainingToGather;
        let progressPct = totalNeeded > 0 ? Math.min(100, Math.max(0, (amountAcquired / totalNeeded) * 100)) : 0;

        if (remainingToGather > 0) {
            totalUnits += remainingToGather;
            const fmtVal = mode === 'stacks' ? (remainingToGather/10000).toFixed(2) + " Stk" : remainingToGather.toLocaleString();
            gHTML += `<div class="logistics-item ${remainingToGather < 10000 ? 'hm-low' : 'hm-high'}" style="--prog: ${progressPct}%;"><span>${t.items[k]||k}</span><span>${fmtVal}</span></div>`;
        }
    });

    document.getElementById('gatherOutput').innerHTML = totalUnits > 0 ? gHTML : `<div class="empty-msg">${t.allCovered}</div>`;
    document.getElementById('statStacks').innerText = (totalUnits / 10000).toFixed(2);

    let newPipeline = [...extractions.extSteps, ...tree.steps];
    
    if (JSON.stringify(newPipeline) !== JSON.stringify(pipelineStepsRaw)) {
        completedSteps = [];
        focusIndex = 0;
    }
    pipelineStepsRaw = newPipeline;

    const perCr = crafters > 1 ? ` <span style="color:var(--warning); font-size:0.8em;">${t.perCrafter}</span>` : "";

    let outputHTML = pipelineStepsRaw.map((stepObj, index) => {
        let isCompleted = completedSteps.includes(index) ? 'completed' : '';
        
        let modStep = stepObj.html.replace(/<span class="highlight">([\d,]+)/g, (match, p1) => {
            let num = parseInt(p1.replace(/,/g, ''));
            return `<span class="highlight">${Math.ceil(num / crafters).toLocaleString()}`;
        });

        return `<div class="step-card ${isCompleted}" id="step_${index}" onclick="toggleStep(${index})">
            <div><span style="color:var(--text-dim); font-weight:bold; margin-right:5px;">${t.stepPrefix} ${index + 1}.</span>${modStep}${perCr}</div>
        </div>`;
    }).join('');

    let byproductsString = "";
    Object.keys(byproductsRaw).forEach(k => {
        if (byproductsRaw[k] > 0) {
            byproductsString += `<div style="display:flex; justify-content:space-between; margin-bottom: 2px;">
                <span>${t.items[k] || k}</span>
                <span style="color: var(--accent); font-weight: bold;">${byproductsRaw[k].toLocaleString()}</span>
            </div>`;
        }
    });

    if (byproductsString !== "") {
        outputHTML += `<div style="margin-top: 15px; padding: 10px; border-top: 1px dashed var(--border); color: var(--text-dim); font-size: 12px;">
            <div style="font-weight: bold; margin-bottom: 5px; text-transform: uppercase;">${t.byproductsTitle}</div>
            ${byproductsString}
        </div>`;
    }

    document.getElementById('stepsOutput').innerHTML = outputHTML;
    
    updatePipelineVisuals();
    if(pipelineViewMode === 'focus') updateFocusView();

    updateVisibility(targetMetal);
    save();
}

function save() {
    const data = { collapsed: collapsedState, completedSteps: completedSteps, market: marketData, moduleVisibility: moduleVisibility, customColors: customColors };
    document.querySelectorAll('input:not([type="checkbox"]):not([type="password"]):not([type="color"]), select').forEach(el => data[el.id] = el.value);
    document.querySelectorAll('input[type="checkbox"]').forEach(el => data[el.id] = el.checked);
    data.webhookUrl = document.getElementById('webhookUrl').value;
    data.theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    data.lang = currentLang;
    localStorage.setItem('QM_Steel_v5', JSON.stringify(data));
}

function load() {
    const d = JSON.parse(localStorage.getItem('QM_Steel_v5'));
    if (!d) return;
    Object.keys(d).forEach(id => {
        const el = document.getElementById(id);
        if (el && el.id !== 'webhookUrl' && id !== 'collapsed' && id !== 'completedSteps' && id !== 'prefs' && id !== 'market' && id !== 'moduleVisibility' && id !== 'customColors') {
            if(el.type === 'checkbox') el.checked = d[id];
            else el.value = d[id];
        }
    });
    
    if (d.market) marketData = d.market;
    if (d.webhookUrl) document.getElementById('webhookUrl').value = d.webhookUrl;
    if (d.theme === 'light') document.body.classList.add('light-theme');
    
    if (d.lang) {
        currentLang = (d.lang === 'en' || d.lang === 'fr') ? d.lang : 'en';
    }

    if (d.completedSteps) completedSteps = d.completedSteps;
    
    if (d.collapsed) {
        collapsedState = d.collapsed;
        Object.keys(collapsedState).forEach(id => {
            if (collapsedState[id]) {
                const el = document.getElementById(id);
                if (el) el.classList.add('collapsed');
            }
        });
    }

    if (d.moduleVisibility) {
        moduleVisibility = d.moduleVisibility;
        Object.keys(moduleVisibility).forEach(modId => {
            const isVisible = moduleVisibility[modId];
            const checkboxId = modId.replace('mod_', 'view_');
            const checkbox = document.getElementById(checkboxId); 
            if(checkbox) checkbox.checked = isVisible;
            toggleModule(modId, isVisible);
        });
    }
    
    if (d.customColors) {
        customColors = d.customColors;
        if(customColors.accent) {
            document.getElementById('colorAccent').value = customColors.accent;
            document.documentElement.style.setProperty('--accent', customColors.accent);
        }
        if(customColors.bg) {
            document.getElementById('colorBg').value = customColors.bg;
            document.documentElement.style.setProperty('--bg-card', customColors.bg);
        }
        if(customColors.text) {
            document.getElementById('colorText').value = customColors.text;
            document.documentElement.style.setProperty('--text', customColors.text);
        }
    }
    
    // Ensure pickers have default values if null in local storage
    if (!customColors.accent || !customColors.bg || !customColors.text) {
        const isLight = document.body.classList.contains('light-theme');
        if(!customColors.accent) document.getElementById('colorAccent').value = isLight ? '#8a6312' : '#d4af37';
        if(!customColors.bg) document.getElementById('colorBg').value = isLight ? '#ffffff' : '#1c1c21';
        if(!customColors.text) document.getElementById('colorText').value = isLight ? '#111111' : '#e0e0e0';
    }
    
    prevMode = document.getElementById('mode').value || 'units';
}

function buildDiscordMessage() {
    const t = i18n[currentLang];
    const mode = document.getElementById('mode').value;
    const targetVal = document.getElementById('targetAmount').value;
    const targetMetal = document.getElementById('targetMetal').value;
    const relevant = getRelevantItems(targetMetal, getActivePrefs());
    let msg = `**${t.discHeader}: ${t.items[targetMetal].toUpperCase()}**\n*Targeting ${targetVal} ${mode === 'stacks' ? 'Stacks' : 'Units'} of ${t.items[targetMetal]}*\n\n`;
    
    let bankString = "";
    Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => {
        let bankRaw = Number(document.getElementById('b_'+k)?.value) || 0;
        if (bankRaw > 0 && relevant.has(k)) {
            let fmtAmt = mode === 'stacks' ? bankRaw.toFixed(2) + " Stacks" : bankRaw.toLocaleString();
            bankString += `- ${t.items[k]||k}: ${fmtAmt}\n`;
        }
    });
    if (bankString !== "") msg += `**CURRENT BANK STOCK:**\n\`\`\`\n${bankString}\`\`\`\n`;

    let marketString = ""; let hasMarket = false;
    rawKeys.forEach(k => {
        let totalQty = 0;
        marketData[k].forEach(tier => totalQty += tier.q);
        if (totalQty > 0 && relevant.has(k)) {
            let fmtAmt = mode === 'stacks' ? totalQty.toFixed(2) + " Stacks" : totalQty.toLocaleString();
            marketString += `- ${t.items[k]||k}: ${fmtAmt}\n`;
            hasMarket = true;
        }
    });

    if (hasMarket) msg += `**${t.discMarket}**\n\`\`\`\n${marketString}\nTotal Budget: ${document.getElementById('cartTotalGold').innerText}\n\`\`\`\n`;

    const stacks = document.getElementById('statStacks').innerText;
    msg += `**${t.discReq}**\n\`\`\`\n`;
    const items = document.querySelectorAll('.logistics-item');
    if (items.length === 0) msg += `${t.discStock}\n`;
    items.forEach(el => msg += `- ${el.innerText.replace('\n', ': ')}\n`);
    msg += `\nTotal: ${stacks} Stacks to Gather\`\`\`\n`;

    if (pipelineStepsRaw.length > 0) {
        msg += `**MANUFACTURING PIPELINE:**\n\`\`\`\n`;
        pipelineStepsRaw.forEach((stepObj, index) => {
            let checkmark = completedSteps.includes(index) ? '[x] ' : '[ ] ';
            msg += `${index + 1}. ${checkmark}${stepObj.html.replace(/<[^>]*>?/gm, '')}\n`;
        });
        msg += `\`\`\`\n`;
    }
    
    let hasByproducts = false;
    let bpString = `**${t.byproductsTitle}**\n\`\`\`\n`;
    Object.keys(byproductsRaw).forEach(k => {
        if (byproductsRaw[k] > 0) {
            let fmtAmt = mode === 'stacks' ? (byproductsRaw[k]/10000).toFixed(2) + " Stacks" : byproductsRaw[k].toLocaleString();
            bpString += `- ${t.items[k]||k}: ${fmtAmt}\n`;
            hasByproducts = true;
        }
    });
    if (hasByproducts) msg += bpString + `\`\`\``;
    return msg;
}

function copyDiscord() { navigator.clipboard.writeText(buildDiscordMessage()); alert(i18n[currentLang].discCopied); }

async function sendToDiscord() {
    const t = i18n[currentLang];
    const webhookUrl = document.getElementById('webhookUrl').value;
    if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) { alert(t.errWebhook); openSettings('integ'); return; }

    try {
        const response = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: buildDiscordMessage(), username: "Quartermaster Command", avatar_url: "https://i.imgur.com/B1pE1H7.png" }) });
        if (response.ok) alert(t.sucSend); else alert(t.errSend);
    } catch (error) { alert(t.errSend); }
}

function changeLang() {
    currentLang = document.getElementById('lang').value;
    const t = i18n[currentLang];
    
    const standardElements = [
        'tabPrefs', 'tabInteg', 'tabData', 'tabHelp', 'tabView', 'resetDesc', 'themeToggle', 'format', 
        'optUnits', 'optStacks', 'webhook', 'prodCmd', 'targetMetalLabel', 'boSource', 
        'optAttractor', 'optCrusher', 'target', 'crafters', 'yieldMods', 'mastery', 
        'refining', 'extraction', 'btnMaxText', 'btnDiscord', 'btnSend', 'invBank', 
        'showAllBank', 'btnReset', 'defGather', 'mfgPipe', 'marketCart', 'btnAutoFill', 
        'shareTitle', 'shareDesc', 'btnGenCode', 'btnLoadCode', 'helpFeatures', 'helpHowTo',
        'colorAccent', 'colorBg', 'colorText', 'btnResetColors', 'viewProd', 'viewYield', 'viewRoute',
        'viewBank', 'viewCart', 'viewGather', 'viewPipe', 'btnRestart'
    ];
    
    const htmlElements = [
        'helpSubtitle', 'helpFeat1', 'helpFeat2', 'helpFeat3', 'helpFeat4', 'helpFeat5',
        'helpHow1', 'helpHow2', 'helpHow3', 'helpHow4'
    ];

    standardElements.forEach(id => {
        let el = document.getElementById('ui_' + id);
        if (el) el.innerText = t[id] || i18n.en[id];
    });

    htmlElements.forEach(id => {
        let el = document.getElementById('ui_' + id);
        if (el) el.innerHTML = t[id] || i18n.en[id];
    });

    renderBankTable(); 
    renderMarketTable(); 
    run();
}

window.onload = () => {
    init();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(err => console.log('SW setup failed', err));
};