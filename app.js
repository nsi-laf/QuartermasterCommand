const i18n = {
    en: {
        interface: "Interface & Integrations", themeToggle: "☀️ / 🌙 Toggle Day/Night Mode", format: "Display Format", optUnits: "Units", optStacks: "Stacks (10k)", webhook: "Discord Webhook URL",
        prodCmd: "Production Command", target: "Target Steel", btnMax: "⚡ Max", crafters: "Crafters",
        yieldMods: "Yield Modifiers", mastery: "Mastery (+6%)", refining: "Refining (+3%)", extraction: "Extraction (+3%)",
        logStats: "Logistics Stats", totalStacksLabel: "Manual Gather Stacks:", totalGoldLabel: "Total Purchase Cost:", btnDiscord: "📋 Copy to Clipboard", btnSend: "🚀 Send Order to Discord",
        invBank: "Inventory Bank", btnReset: "🧹 Reset All Bank & Cart", defGather: "Deficit to Gather Manually", mfgPipe: "Manufacturing Pipeline", marketCart: "Market Cart", btnAutoFill: "🛒 Auto-Fill All",
        tblPrice: "Price/10k", tblBuy: "Amount to Buy", tblCost: "Cost (g)", tblStash: "Bank + Buy", cartTotal: "Cart Total:",
        noTarget: "No target set.", allCovered: "✅ Bank & Cart cover all raw materials!",
        items: { granum: "Granum", calx: "Calx", saburra: "Saburra", water: "Water", sp: "Saburra Pwdr", cp: "Calx Pwdr", coal: "Coal", coke: "Coke", pi: "Pig Iron", gs: "Grain Steel", steel: "Steel", bo: "Blood Ore" },
        stepGrind: "Grind", stepCrush: "Crush", stepAttract: "Attract", stepFurnace: "Furnace", stepOven: "Oven", stepFinal: "Final Oven:",
        stepTo: "to", stepYields: "yields", stepPlus: "+", perCrafter: "(Per Crafter)",
        resetPrompt: "Reset all bank values and shopping cart to zero?", discHeader: "⚔️ LOGISTICS ORDER: STEEL ⚔️", discLoad: "Gather Stacks:", discReq: "MANUAL GATHER REQUIRED:", discStock: "All gathering covered.", discCopied: "Copied to clipboard!",
        discMarket: "MARKET PURCHASES:", errWebhook: "Please enter a valid Discord Webhook URL in the Interface settings.", errSend: "Failed to send to Discord. Check URL.", sucSend: "Order dispatched to Discord!",
        qAdd: "+10k", qAddStk: "+1 Stk"
    }
};

// Fallback to English for languages not fully defined yet
['fr', 'es', 'pt', 'de'].forEach(l => i18n[l] = i18n.en);

let timer = null;
let prevMode = 'units';
let currentLang = 'en';

const itemKeys = ['granum', 'calx', 'saburra', 'water', 'sp', 'cp', 'coal', 'coke', 'pi', 'gs'];
const rawKeys = ['granum', 'calx', 'saburra', 'water'];
const defaultPrices = { granum: 15, calx: 35, saburra: 15, water: 1 };

let pureDeficits = { granum: 0, calx: 0, saburra: 0, water: 0 }; 

function changeLang() {
    currentLang = document.getElementById('lang').value;
    const t = i18n[currentLang];
    
    ['interface', 'themeToggle', 'format', 'optUnits', 'optStacks', 'webhook', 'prodCmd', 'target', 'btnMax', 'crafters', 'yieldMods', 'mastery', 'refining', 'extraction', 'logStats', 'totalStacksLabel', 'totalGoldLabel', 'btnDiscord', 'btnSend', 'invBank', 'btnReset', 'defGather', 'mfgPipe', 'marketCart', 'btnAutoFill'].forEach(id => {
        let el = document.getElementById('ui_' + id);
        if(el) el.innerText = t[id];
    });
    
    renderBankTable();
    renderMarketTable();
    updateButtonLabels();
    run();
}

function renderBankTable() {
    const table = document.getElementById('bankTable');
    const t = i18n[currentLang];
    const mode = document.getElementById('mode').value;
    const label = mode === 'stacks' ? t.qAddStk : t.qAdd;
    
    const currentVals = {};
    itemKeys.forEach(k => {
        const el = document.getElementById('b_' + k);
        if (el) currentVals[k] = el.value;
    });

    table.innerHTML = ""; 
    itemKeys.forEach(k => {
        const val = currentVals[k] || 0;
        table.innerHTML += `<tr>
            <td style="width:25%; font-weight:bold;">${t.items[k]}</td>
            <td style="text-align:right">
                <input type="number" id="b_${k}" value="${val}" oninput="run()">
                <button class="btn-stack q-add" id="btn_${k}" onclick="quickAdd('b_${k}')">${label}</button>
            </td>
        </tr>`;
    });
}

function renderMarketTable() {
    const container = document.getElementById('marketContainer');
    const t = i18n[currentLang];
    
    const currentVals = {};
    rawKeys.forEach(k => {
        const pEl = document.getElementById('p_' + k);
        const cEl = document.getElementById('buy_' + k);
        currentVals['p_'+k] = pEl ? pEl.value : defaultPrices[k];
        currentVals['buy_'+k] = cEl ? cEl.value : 0;
    });

    let html = `
    <div class="market-row market-header desktop-only">
        <div></div>
        <div style="text-align:center">${t.tblPrice}</div>
        <div style="text-align:center">${t.tblBuy}</div>
        <div style="text-align:right">${t.tblCost}</div>
        <div style="text-align:right">${t.tblStash}</div>
    </div>`; 

    rawKeys.forEach(k => {
        html += `
        <div class="market-row">
            <div style="font-weight:bold; color:var(--accent);">${t.items[k]}</div>
            <div style="text-align:center">
                <span class="mobile-label">${t.tblPrice}</span>
                <input type="number" id="p_${k}" value="${currentVals['p_'+k]}" oninput="run()">
            </div>
            <div style="text-align:center">
                <span class="mobile-label">${t.tblBuy}</span>
                <div class="buy-group">
                    <input type="number" id="buy_${k}" value="${currentVals['buy_'+k]}" oninput="run()">
                    <button class="btn-stack" onclick="autoFillRow('${k}')" title="Fill Missing">🛒</button>
                </div>
            </div>
            <div style="text-align:right">
                <span class="mobile-label">${t.tblCost}</span>
                <span style="font-weight:bold; color:var(--accent); font-size: 1.1em;" id="cost_${k}">0.00</span>
            </div>
            <div style="text-align:right">
                <span class="mobile-label">${t.tblStash}</span>
                <span style="color:var(--text-dim);" id="stash_${k}">0</span>
            </div>
        </div>`;
    });
    
    html += `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; padding-top:15px; border-top:1px solid var(--border);">
        <div style="font-weight:bold; text-transform:uppercase; color:var(--text-dim);">${t.cartTotal}</div>
        <div id="cartTotalGold" style="font-weight:bold; color:var(--accent); font-size:1.3em;">0.00 g</div>
    </div>`;
    
    container.innerHTML = html;
}

function init() {
    renderBankTable();
    renderMarketTable();
    load(); 
    document.getElementById('lang').value = currentLang;
    changeLang(); 
}

function toggleTheme() { document.body.classList.toggle('light-theme'); save(); }

function updateButtonLabels() {
    const mode = document.getElementById('mode').value;
    const t = i18n[currentLang];
    const label = mode === 'stacks' ? t.qAddStk : t.qAdd;
    document.querySelectorAll('.q-add').forEach(btn => btn.innerText = label);
}

function quickAdd(id) {
    const el = document.getElementById(id);
    const mode = document.getElementById('mode').value;
    let current = Number(el.value) || 0;
    el.value = mode === 'stacks' ? parseFloat((current + 1).toFixed(4)) : current + 10000;
    run();
}

function clearAll() {
    const t = i18n[currentLang];
    if(confirm(t.resetPrompt)) {
        itemKeys.forEach(k => { const el = document.getElementById('b_' + k); if(el) el.value = 0; });
        rawKeys.forEach(k => { const el = document.getElementById('buy_' + k); if(el) el.value = 0; });
        document.getElementById('targetSteel').value = 0;
        run();
    }
}

function autoFillCart() {
    const mode = document.getElementById('mode').value;
    rawKeys.forEach(k => {
        let needed = pureDeficits[k] || 0;
        let val = mode === 'stacks' ? (needed / 10000).toFixed(4) : needed;
        document.getElementById('buy_' + k).value = val;
    });
    run();
}

function autoFillRow(k) {
    const mode = document.getElementById('mode').value;
    let needed = pureDeficits[k] || 0;
    let val = mode === 'stacks' ? (needed / 10000).toFixed(4) : needed;
    document.getElementById('buy_' + k).value = val;
    run();
}

function handleModeChange() {
    const mode = document.getElementById('mode').value;
    const targetEl = document.getElementById('targetSteel');
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

    itemKeys.forEach(k => convert('b_' + k));
    rawKeys.forEach(k => convert('buy_' + k));

    updateButtonLabels();
    prevMode = mode;
    run();
}

function run() { clearTimeout(timer); timer = setTimeout(calculate, 150); }

function runEngine(targetRaw, bankData, mode) {
    const mult = mode === 'stacks' ? 10000 : 1;
    const target = targetRaw * mult;
    
    const mR = document.getElementById('modRef').checked ? 1.03 : 1;
    const mE = document.getElementById('modExt').checked ? 1.03 : 1;
    const mM = document.getElementById('modMast').checked ? 1.06 : 1;

    const rGS = Math.ceil(target / (0.7 * mR));
    const diffGS = Math.max(0, rGS - bankData.gs);
    const rPI = Math.ceil(diffGS / (0.7 * mR));
    const diffPI = Math.max(0, rPI - bankData.pi);
    const rBlood = Math.ceil(diffPI / (0.4 * mR));
    
    const cokeForGS = Math.ceil(rPI * 0.5);
    const cokeForPI = Math.ceil(rBlood * 0.0385);
    const diffCoke = Math.max(0, (cokeForGS + cokeForPI) - bankData.coke);

    const coalForSteel = Math.ceil(rGS * 0.5);
    const coalForCoke = Math.ceil(diffCoke / (0.72 * mR));
    const diffCoal = Math.max(0, (coalForSteel + coalForCoke) - bankData.coal);

    const rGranum = Math.ceil(rBlood / (0.198 * mE * mM));
    
    const cpForGS = Math.ceil(rPI * 0.5);
    const cpForCoke = Math.ceil(coalForCoke * 0.0715);
    const cpForBlood = Math.ceil(rGranum * 0.0715);
    const diffCP = Math.max(0, (cpForGS + cpForCoke + cpForBlood) - bankData.cp);

    const spForSteel = Math.ceil(rGS * 0.5);
    const diffSP = Math.max(0, spForSteel - bankData.sp);

    const rSaburra = Math.ceil(diffSP / (0.4275 * mE));
    const calxToGrind = Math.ceil(diffCP / (0.2058 * mE));
    const coalFromGrind = Math.ceil(calxToGrind * 0.1140 * mE);
    const calxToCrush = Math.ceil(Math.max(0, diffCoal - coalFromGrind) / (0.2160 * mE));

    return {
        granum: Math.max(0, rGranum - bankData.granum),
        calx: Math.max(0, (calxToGrind + calxToCrush) - bankData.calx),
        saburra: Math.max(0, rSaburra - bankData.saburra),
        water: Math.max(0, (Math.ceil(rSaburra * 0.1) + Math.ceil(calxToGrind * 0.1)) - bankData.water),
        reqGS: rGS, coalForSteel, spForSteel, diffGS, rPI, cokeForGS, cpForGS, diffPI, rBlood, cokeForPI, diffCoke, coalForCoke, cpForCoke, diffCoal, rGranum, cpForBlood, diffCP, diffSP, rSaburra, waterForSaburra: Math.ceil(rSaburra * 0.1), calxToGrind, waterForCalx: Math.ceil(calxToGrind * 0.1), coalFromGrind, extraCoal: Math.max(0, diffCoal - coalFromGrind), calxToCrush, target
    };
}

function calculateMax() {
    const mode = document.getElementById('mode').value;
    const mult = mode === 'stacks' ? 10000 : 1;
    const getB = (id) => (Number(document.getElementById('b_' + id).value) || 0) * mult;
    const bank = {}; itemKeys.forEach(k => bank[k] = getB(k));

    let low = 0, high = 1000000 * mult, maxPossible = 0;
    while(low <= high) {
        let mid = Math.floor((low + high) / 2);
        let res = runEngine(mid / mult, bank, mode);
        if (res.granum <= 0) { maxPossible = mid; low = mid + 1; } 
        else { high = mid - 1; }
    }
    document.getElementById('targetSteel').value = mode === 'stacks' ? parseFloat((maxPossible / 10000).toFixed(4)) : maxPossible;
    run();
}

function calculate() {
    const mode = document.getElementById('mode').value;
    const t = i18n[currentLang];
    const targetRaw = Number(document.getElementById('targetSteel').value) || 0;
    const crafters = Math.max(1, Number(document.getElementById('crafters').value));
    const mult = mode === 'stacks' ? 10000 : 1;
    const getB = (id) => (Number(document.getElementById('b_' + id).value) || 0) * mult;
    const bank = {}; itemKeys.forEach(k => bank[k] = getB(k));

    if (targetRaw <= 0) {
        document.getElementById('gatherOutput').innerHTML = `<div class="empty-msg">${t.noTarget}</div>`;
        document.getElementById('stepsOutput').innerHTML = "";
        document.getElementById('statStacks').innerText = "0.00";
        document.getElementById('statGold').innerText = "0.00 g";
        if(document.getElementById('cartTotalGold')) document.getElementById('cartTotalGold').innerText = "0.00 g";
        rawKeys.forEach(k => {
            if(document.getElementById('cost_' + k)) document.getElementById('cost_' + k).innerText = "0.00";
            if(document.getElementById('stash_' + k)) document.getElementById('stash_' + k).innerText = "0";
        });
        save(); return;
    }

    const res = runEngine(targetRaw, bank, mode);
    pureDeficits = { granum: res.granum, calx: res.calx, saburra: res.saburra, water: res.water };
    
    let totalGold = 0;
    let purchased = {};
    
    rawKeys.forEach(k => {
        // Cache the elements so you aren't searching the document repeatedly
        const costEl = document.getElementById('cost_' + k);
        const stashEl = document.getElementById('stash_' + k);
        
        const price = Number(document.getElementById('p_' + k).value) || 0;
        const buyQtyRaw = Number(document.getElementById('buy_' + k).value) || 0;
        const bankQtyRaw = Number(document.getElementById('b_' + k).value) || 0;
        
        const buyQtyUnits = buyQtyRaw * mult;
        purchased[k] = buyQtyUnits;
        
        const cost = (buyQtyUnits / 10000) * price;
        totalGold += cost;
        
        // Only update the DOM if the element actually exists to prevent errors
        if (costEl) costEl.innerText = cost > 0 ? cost.toFixed(2) : "0.00";
        if (stashEl) {
            const totalStashRaw = bankQtyRaw + buyQtyRaw;
            stashEl.innerText = mode === 'stacks' ? totalStashRaw.toFixed(2) + " Stk" : totalStashRaw.toLocaleString();
        }
    });

    document.getElementById('statGold').innerText = totalGold.toFixed(2) + " g";
    if(document.getElementById('cartTotalGold')) document.getElementById('cartTotalGold').innerText = totalGold.toFixed(2) + " g";

    const gather = { 
        granum: Math.max(0, res.granum - purchased.granum), 
        calx: Math.max(0, res.calx - purchased.calx), 
        saburra: Math.max(0, res.saburra - purchased.saburra), 
        water: Math.max(0, res.water - purchased.water) 
    };

    let gHTML = '';
    let hasDeficit = false;
    let totalUnits = 0;

    Object.keys(gather).forEach(k => {
        if (gather[k] > 0) {
            totalUnits += gather[k];
            const fmtVal = mode === 'stacks' ? (gather[k]/10000).toFixed(2) + " Stk" : gather[k].toLocaleString();
            const hm = gather[k] < 10000 ? 'hm-low' : 'hm-high';
            gHTML += `<div class="logistics-item ${hm}"><span>${t.items[k]}</span><span>${fmtVal}</span></div>`;
            hasDeficit = true;
        }
    });
    document.getElementById('gatherOutput').innerHTML = hasDeficit ? gHTML : `<div class="empty-msg">${t.allCovered}</div>`;

    const totalStacks = (totalUnits / 10000).toFixed(2);
    document.getElementById('statStacks').innerText = totalStacks;

    const s = (v) => Math.ceil(v / crafters).toLocaleString();
    let steps = [];
    const perCr = crafters > 1 ? ` <span style="color:var(--warning); font-size:0.8em;">${t.perCrafter}</span>` : "";

    if (res.rSaburra > 0) steps.push(`${t.stepGrind} <span class="highlight">${s(res.rSaburra)} ${t.items.saburra}</span> ${t.stepPlus} <span class="highlight">${s(res.waterForSaburra)} ${t.items.water}</span> ${t.stepTo} ${t.items.sp}`);
    if (res.calxToGrind > 0) steps.push(`${t.stepGrind} <span class="highlight">${s(res.calxToGrind)} ${t.items.calx}</span> ${t.stepPlus} <span class="highlight">${s(res.waterForCalx)} ${t.items.water}</span> ${t.stepYields} <span class="highlight">${s(res.diffCP)} ${t.items.cp}</span> ${t.stepPlus} <span class="highlight">${s(res.coalFromGrind)} ${t.items.coal}</span>`);
    if (res.calxToCrush > 0) steps.push(`${t.stepCrush} <span class="highlight">${s(res.calxToCrush)} ${t.items.calx}</span> ${t.stepYields} <span class="highlight">${s(res.extraCoal)} ${t.items.coal}</span>`);
    if (res.rGranum > 0) steps.push(`${t.stepAttract}: <span class="highlight">${s(res.rGranum)} ${t.items.granum}</span> ${t.stepPlus} <span class="highlight">${s(res.cpForBlood)} ${t.items.cp}</span> ${t.stepYields} <span class="highlight">${s(res.rBlood)} ${t.items.bo}</span>`);
    if (res.diffCoke > 0) steps.push(`${t.stepFurnace}: <span class="highlight">${s(res.coalForCoke)} ${t.items.coal}</span> ${t.stepPlus} <span class="highlight">${s(res.cpForCoke)} ${t.items.cp}</span> ${t.stepYields} <span class="highlight">${s(res.diffCoke)} ${t.items.coke}</span>`);
    if (res.diffPI > 0) steps.push(`${t.stepFurnace}: <span class="highlight">${s(res.rBlood)} ${t.items.bo}</span> ${t.stepPlus} <span class="highlight">${s(res.cokeForPI)} ${t.items.coke}</span> ${t.stepYields} <span class="highlight">${s(res.diffPI)} ${t.items.pi}</span>`);
    if (res.diffGS > 0) steps.push(`${t.stepOven}: <span class="highlight">${s(res.diffPI)} ${t.items.pi}</span> ${t.stepPlus} <span class="highlight">${s(res.cokeForGS)} ${t.items.coke}</span> ${t.stepPlus} <span class="highlight">${s(res.cpForGS)} ${t.items.cp}</span> ${t.stepYields} <span class="highlight">${s(res.diffGS)} ${t.items.gs}</span>`);
    steps.push(`${t.stepFinal} <span class="highlight">${s(res.reqGS)} ${t.items.gs}</span> ${t.stepPlus} <span class="highlight">${s(res.coalForSteel)} ${t.items.coal}</span> ${t.stepPlus} <span class="highlight">${s(res.spForSteel)} ${t.items.sp}</span> ${t.stepYields} <span class="highlight">${(targetRaw * mult).toLocaleString()} ${t.items.steel}</span>`);
    
    document.getElementById('stepsOutput').innerHTML = steps.map(text => `<div class="step-card">${text}${perCr}</div>`).join('');
    save();
}

function save() {
    const data = {};
    document.querySelectorAll('input:not([type="checkbox"]):not([type="password"]), select').forEach(el => data[el.id] = el.value);
    document.querySelectorAll('input[type="checkbox"]').forEach(el => data[el.id] = el.checked);
    data.webhookUrl = document.getElementById('webhookUrl').value;
    data.theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    data.lang = currentLang;
    localStorage.setItem('QM_Steel_v4.5', JSON.stringify(data));
    if(document.getElementById('saveStatus')) document.getElementById('saveStatus').innerText = `Saved: ${new Date().toLocaleTimeString()}`;
}

function load() {
    const d = JSON.parse(localStorage.getItem('QM_Steel_v4.5'));
    if (!d) return;
    Object.keys(d).forEach(id => {
        const el = document.getElementById(id);
        if (el && el.id !== 'webhookUrl') {
            if(el.type === 'checkbox') el.checked = d[id];
            else el.value = d[id];
        }
    });
    if (d.webhookUrl) document.getElementById('webhookUrl').value = d.webhookUrl;
    if (d.theme === 'light') document.body.classList.add('light-theme');
    if (d.lang) currentLang = d.lang;
    prevMode = document.getElementById('mode').value || 'units';
}

function buildDiscordMessage() {
    const t = i18n[currentLang];
    const mode = document.getElementById('mode').value;
    let msg = `**${t.discHeader}**\n\n`;
    
    let marketString = "";
    let hasMarket = false;
    rawKeys.forEach(k => {
        let buyRaw = Number(document.getElementById('buy_'+k).value) || 0;
        if (buyRaw > 0) {
            let fmtAmt = mode === 'stacks' ? buyRaw.toFixed(2) + " Stacks" : (buyRaw).toLocaleString();
            marketString += `- ${t.items[k]}: ${fmtAmt}\n`;
            hasMarket = true;
        }
    });

    if (hasMarket) {
        msg += `**${t.discMarket}**\n\`\`\`\n${marketString}\nTotal Budget: ${document.getElementById('statGold').innerText}\n\`\`\`\n`;
    }

    const stacks = document.getElementById('statStacks').innerText;
    msg += `**${t.discReq}**\n\`\`\`\n`;
    const items = document.querySelectorAll('.logistics-item');
    if (items.length === 0) msg += `${t.discStock}\n`;
    items.forEach(el => msg += `- ${el.innerText.replace('\n', ': ')}\n`);
    msg += `\nTotal: ${stacks} Stacks to Gather\`\`\``;
    return msg;
}

function copyDiscord() {
    const msg = buildDiscordMessage();
    navigator.clipboard.writeText(msg);
    alert(i18n[currentLang].discCopied);
}

async function sendToDiscord() {
    const t = i18n[currentLang];
    const webhookUrl = document.getElementById('webhookUrl').value;
    
    if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
        alert(t.errWebhook);
        return;
    }

    const msg = buildDiscordMessage();
    
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                content: msg, 
                username: "Quartermaster Command",
                avatar_url: "https://i.imgur.com/B1pE1H7.png" 
            })
        });
        
        if (response.ok) {
            alert(t.sucSend);
        } else {
            alert(t.errSend);
        }
    } catch (error) {
        alert(t.errSend);
    }
}

// Window init and Service Worker registration
window.onload = () => {
    init();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.log('SW setup failed', err));
    }
};
