let timer = null;
let prevMode = 'units';
let currentLang = 'en';
let collapsedState = {};
let completedSteps = [];
let pureDeficits = {}; 
let pipelineStepsRaw = []; 
let byproductsRaw = {}; 

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

function toggleStep(index) {
    const stepStr = pipelineStepsRaw[index];
    const el = document.getElementById('step_' + index);
    const idx = completedSteps.indexOf(stepStr);
    
    if (idx > -1) {
        completedSteps.splice(idx, 1);
        el.classList.remove('completed');
    } else {
        completedSteps.push(stepStr);
        el.classList.add('completed');
    }
    save();
}

function changeLang() {
    currentLang = document.getElementById('lang').value;
    const t = i18n[currentLang];
    
    // Arrays of elements to update.
    const standardElements = [
        'tabPrefs', 'tabInteg', 'tabData', 'tabHelp', 'resetDesc', 'themeToggle', 'format', 
        'optUnits', 'optStacks', 'webhook', 'prodCmd', 'targetMetalLabel', 'boSource', 
        'optAttractor', 'optCrusher', 'target', 'crafters', 'yieldMods', 'mastery', 
        'refining', 'extraction', 'btnMaxText', 'btnDiscord', 'btnSend', 'invBank', 
        'showAllBank', 'btnReset', 'defGather', 'mfgPipe', 'marketCart', 'btnAutoFill', 
        'shareTitle', 'shareDesc', 'btnGenCode', 'btnLoadCode', 'helpFeatures', 'helpHowTo'
    ];
    
    const htmlElements = [
        'helpSubtitle', 'helpFeat1', 'helpFeat2', 'helpFeat3', 'helpFeat4', 'helpFeat5',
        'helpHow1', 'helpHow2', 'helpHow3', 'helpHow4'
    ];

    // Standard text replacements
    standardElements.forEach(id => {
        let el = document.getElementById('ui_' + id);
        if (el) {
            el.innerText = t[id] || i18n.en[id];
        }
    });

    // InnerHTML replacements for the formatted Help guide text
    htmlElements.forEach(id => {
        let el = document.getElementById('ui_' + id);
        if (el) {
            el.innerHTML = t[id] || i18n.en[id];
        }
    });

    renderBankTable(); 
    renderMarketTable(); 
    run();
}

function renderBankTable() {
    const table = document.getElementById('bankTable');
    const t = i18n[currentLang];
    const label = document.getElementById('mode').value === 'stacks' ? t.qAddStk : t.qAdd;
    
    let html = ""; 
    CATEGORIES.forEach(cat => {
        html += `<tbody id="cat_${cat.id}">`;
        html += `<tr><td colspan="2" class="bank-category">${t.categories[cat.id] || cat.id}</td></tr>`;
        cat.items.forEach(k => {
            const val = Number(document.getElementById('b_'+k)?.value) || 0;
            html += `<tr id="row_b_${k}"><td style="width:35%; font-weight:bold; padding-left:10px;">${t.items[k] || k}</td>
                <td style="text-align:right; white-space: nowrap;">
                    <input type="number" id="b_${k}" value="${val}" oninput="run()">
                    <button class="btn-stack q-add" onclick="quickAdd('b_${k}')">${label}</button>
                    <button class="btn-clear" onclick="clearItem('b_${k}')" title="Clear">✖</button>
                </td></tr>`;
        });
        html += `</tbody>`;
    });
    table.innerHTML = html;
}

function renderMarketTable() {
    const container = document.getElementById('marketContainer');
    const t = i18n[currentLang];
    
    let html = `<div class="market-row market-header desktop-only"><div></div><div style="text-align:center">${t.tblPrice}</div><div style="text-align:center">${t.tblBuy}</div><div style="text-align:right">${t.tblCost}</div><div style="text-align:right">${t.tblStash}</div></div>`; 

    rawKeys.forEach(k => {
        const pVal = Number(document.getElementById('p_'+k)?.value) || defaultPrices[k];
        const buyVal = Number(document.getElementById('buy_'+k)?.value) || 0;
        
        html += `<div class="market-row" id="row_m_${k}">
            <div style="font-weight:bold; color:var(--accent);">${t.items[k] || k}</div>
            <div style="text-align:center"><span class="mobile-label">${t.tblPrice}</span><input type="number" id="p_${k}" value="${pVal}" oninput="run()"></div>
            <div style="text-align:center"><span class="mobile-label">${t.tblBuy}</span>
                <div class="buy-group">
                    <input type="number" id="buy_${k}" value="${buyVal}" oninput="run()">
                    <button class="btn-cart btn-mini" title="Fill" onclick="autoFillRow('${k}')">Fill</button>
                    <button class="btn-clear btn-mini" title="Clear" onclick="clearMarketRow('${k}')">✖</button>
                </div>
            </div>
            <div style="text-align:right"><span class="mobile-label">${t.tblCost}</span><span style="font-weight:bold; color:var(--accent); font-size: 1.1em;" id="cost_${k}">0.00</span></div>
            <div style="text-align:right"><span class="mobile-label">${t.tblStash}</span><span style="color:var(--text-dim);" id="stash_${k}">0</span></div>
        </div>`;
    });
    
    html += `<div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; padding-top:15px; border-top:1px solid var(--border);"><div style="font-weight:bold; text-transform:uppercase; color:var(--text-dim);">${t.cartTotal}</div><div id="cartTotalGold" style="font-weight:bold; color:var(--accent); font-size:1.3em;">0.00 g</div></div>`;
    container.innerHTML = html;
}

function updateVisibility(targetMetal) {
    const relevant = getRelevantItems(targetMetal);
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
    renderBankTable(); renderMarketTable(); load(); 
    document.getElementById('lang').value = currentLang; changeLang(); 
}

function toggleTheme() { document.body.classList.toggle('light-theme'); save(); }

function quickAdd(id) {
    const el = document.getElementById(id);
    const isStacks = document.getElementById('mode').value === 'stacks';
    let current = Number(el.value) || 0;
    el.value = isStacks ? parseFloat((current + 1).toFixed(4)) : current + 10000;
    run();
}

function clearItem(id) {
    const el = document.getElementById(id);
    if (el) { el.value = 0; run(); }
}

function clearMarketRow(k) {
    const el = document.getElementById('buy_' + k);
    if (el) { el.value = 0; run(); }
}

function clearAll() {
    if(confirm(i18n[currentLang].resetPrompt)) {
        document.querySelectorAll('input[id^="b_"], input[id^="buy_"]').forEach(el => el.value = 0);
        const mode = document.getElementById('mode').value;
        document.getElementById('targetAmount').value = mode === 'stacks' ? 1 : 10000;
        completedSteps = [];
        closeSettings();
        run();
    }
}

function autoFillCart() { rawKeys.forEach(k => autoFillRow(k, false)); run(); }

function autoFillRow(k, triggerRun = true) {
    const mode = document.getElementById('mode').value;
    let needed = pureDeficits[k] || 0;
    document.getElementById('buy_' + k).value = mode === 'stacks' ? (needed / 10000).toFixed(4) : needed;
    if (triggerRun) run();
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
    rawKeys.forEach(k => convert('buy_' + k));

    const label = mode === 'stacks' ? i18n[currentLang].qAddStk : i18n[currentLang].qAdd;
    document.querySelectorAll('.q-add').forEach(btn => btn.innerText = label);
    prevMode = mode; run();
}

// Generate an encoded string of the user's setup to share
function generateShareCode() {
    let state = { b: {}, m: {}, s: {} };
    Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => {
        let v = Number(document.getElementById('b_'+k)?.value);
        if (v) state.b[k] = v;
    });
    rawKeys.forEach(k => {
        let v = Number(document.getElementById('buy_'+k)?.value);
        if (v) state.m[k] = v;
    });
    
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

// Decode and apply a shared setup code
function loadShareCode() {
    try {
        const code = document.getElementById('shareCode').value.trim();
        if (!code) return;
        const state = JSON.parse(atob(code));
        
        // Wipe slate clean before applying the loadout
        document.querySelectorAll('input[id^="b_"], input[id^="buy_"]').forEach(el => el.value = 0);
        
        if (state.b) Object.keys(state.b).forEach(k => { const el = document.getElementById('b_'+k); if(el) el.value = state.b[k]; });
        if (state.m) Object.keys(state.m).forEach(k => { const el = document.getElementById('buy_'+k); if(el) el.value = state.m[k]; });
        
        if (state.s) {
            if(state.s.t) document.getElementById('targetMetal').value = state.s.t;
            if(state.s.a) document.getElementById('targetAmount').value = state.s.a;
            if(state.s.c) document.getElementById('crafters').value = state.s.c;
            if(state.s.e) document.getElementById('extStrategy').value = state.s.e;
            if(state.s.m) {
                document.getElementById('mode').value = state.s.m;
                prevMode = state.s.m; // align memory to avoid bad format scaling
                const label = state.s.m === 'stacks' ? i18n[currentLang].qAddStk : i18n[currentLang].qAdd;
                document.querySelectorAll('.q-add').forEach(btn => btn.innerText = label);
            }
        }
        
        save();
        run();
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
        
        const tree = resolveTree(targetMetal, mid, bank, mR);
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
    
    if (maxPossible === 0) {
        maxPossible = mode === 'stacks' ? 10000 : 1;
    }
    
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

    const tree = resolveTree(targetMetal, targetRaw * mult, bank, mR);
    const extractions = resolveExtractions(tree.deficits, extStrategy, mE, mM, bank);
    pureDeficits = extractions.raw;
    byproductsRaw = extractions.bp;
    
    let totalGold = 0; let totalUnits = 0; let purchased = {}; let gHTML = '';
    
    rawKeys.forEach(k => {
        const costEl = document.getElementById('cost_' + k);
        const stashEl = document.getElementById('stash_' + k);
        const price = Number(document.getElementById('p_' + k)?.value) || 0;
        const buyQtyRaw = Number(document.getElementById('buy_' + k)?.value) || 0;
        const bankQtyRaw = Number(document.getElementById('b_' + k)?.value) || 0;
        
        const buyQtyUnits = buyQtyRaw * mult;
        purchased[k] = buyQtyUnits;
        totalGold += (buyQtyUnits / 10000) * price;
        
        if (costEl) costEl.innerText = (buyQtyUnits > 0) ? ((buyQtyUnits / 10000) * price).toFixed(2) : "0.00";
        if (stashEl) {
            const stashRaw = bankQtyRaw + buyQtyRaw;
            stashEl.innerText = mode === 'stacks' ? stashRaw.toFixed(2) + " Stk" : stashRaw.toLocaleString();
        }
    });

    if(document.getElementById('cartTotalGold')) document.getElementById('cartTotalGold').innerText = totalGold.toFixed(2) + " g";

    Object.keys(pureDeficits).forEach(k => {
        const remainingToGather = Math.max(0, pureDeficits[k] - (purchased[k] || 0));
        if (remainingToGather > 0) {
            totalUnits += remainingToGather;
            const fmtVal = mode === 'stacks' ? (remainingToGather/10000).toFixed(2) + " Stk" : remainingToGather.toLocaleString();
            gHTML += `<div class="logistics-item ${remainingToGather < 10000 ? 'hm-low' : 'hm-high'}"><span>${t.items[k]||k}</span><span>${fmtVal}</span></div>`;
        }
    });

    document.getElementById('gatherOutput').innerHTML = totalUnits > 0 ? gHTML : `<div class="empty-msg">${t.allCovered}</div>`;
    document.getElementById('statStacks').innerText = (totalUnits / 10000).toFixed(2);

    pipelineStepsRaw = [...extractions.extSteps, ...tree.steps];
    const perCr = crafters > 1 ? ` <span style="color:var(--warning); font-size:0.8em;">${t.perCrafter}</span>` : "";
    
    let outputHTML = pipelineStepsRaw.map((step, index) => {
        let modStep = step.replace(/<span class="highlight">([\d,]+)/g, (match, p1) => {
            let num = parseInt(p1.replace(/,/g, ''));
            return `<span class="highlight">${Math.ceil(num / crafters).toLocaleString()}`;
        });
        let isCompleted = completedSteps.includes(step) ? 'completed' : '';
        return `<div class="step-card ${isCompleted}" id="step_${index}" onclick="toggleStep(${index})">
            <span style="color:var(--text-dim); font-weight:bold; margin-right:5px;">${t.stepPrefix} ${index + 1}.</span>${modStep}${perCr}
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
    updateVisibility(targetMetal);
    save();
}

function save() {
    const data = { collapsed: collapsedState, completedSteps: completedSteps };
    document.querySelectorAll('input:not([type="checkbox"]):not([type="password"]), select').forEach(el => data[el.id] = el.value);
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
        if (el && el.id !== 'webhookUrl' && id !== 'collapsed' && id !== 'completedSteps') {
            if(el.type === 'checkbox') el.checked = d[id];
            else el.value = d[id];
        }
    });
    if (d.webhookUrl) document.getElementById('webhookUrl').value = d.webhookUrl;
    if (d.theme === 'light') document.body.classList.add('light-theme');
    if (d.lang) currentLang = d.lang;
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
    
    prevMode = document.getElementById('mode').value || 'units';
}

function buildDiscordMessage() {
    const t = i18n[currentLang];
    const mode = document.getElementById('mode').value;
    const targetVal = document.getElementById('targetAmount').value;
    const targetMetal = document.getElementById('targetMetal').value;
    const relevant = getRelevantItems(targetMetal);
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
        let buyRaw = Number(document.getElementById('buy_'+k)?.value) || 0;
        if (buyRaw > 0 && relevant.has(k)) {
            let fmtAmt = mode === 'stacks' ? buyRaw.toFixed(2) + " Stacks" : buyRaw.toLocaleString();
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
        pipelineStepsRaw.forEach((step, index) => {
            let checkmark = completedSteps.includes(step) ? '[x] ' : '[ ] ';
            msg += `${index + 1}. ${checkmark}${step.replace(/<[^>]*>?/gm, '')}\n`;
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

window.onload = () => {
    init();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(err => console.log('SW setup failed', err));
};