let currentLang = 'en';
let marketData = {};
let pipelineStepsRaw = [];
let completedSteps = [];
let focusIndex = 0;
let byproductsRaw = {};
let pureDeficits = {};
let userPathChoices = {};
let collapsedState = {};
let moduleVisibility = {};
let pipelineViewMode = 'overview';
let globalRoutePref = null;
let timer;
let prevMode = 'units';

function save() {
    const isLight = document.body.classList.contains('light-theme');
    const themeKey = isLight ? 'light' : 'dark';
    const themeDef = isLight ? defaultColors.light : defaultColors.dark;
    
    const cAccent = document.getElementById('colorAccent')?.value || themeDef.accent;
    const cBg = document.getElementById('colorBg')?.value || themeDef.bg;
    const cText = document.getElementById('colorText')?.value || themeDef.text;

    const colorsChanged = cAccent.toLowerCase() !== themeDef.accent.toLowerCase() || 
                          cBg.toLowerCase() !== themeDef.bg.toLowerCase() || 
                          cText.toLowerCase() !== themeDef.text.toLowerCase();

    let existingData = {};
    try { existingData = JSON.parse(localStorage.getItem('qm_data') || '{}'); } catch(e) {}

    let customColors = existingData.customColors || {};
    if (colorsChanged) {
        customColors[themeKey] = { accent: cAccent, bg: cBg, text: cText };
    } else {
        delete customColors[themeKey];
    }

    const data = {
        lang: currentLang,
        market: marketData,
        bank: {},
        target: document.getElementById('targetAmount')?.value || 10000,
        metal: document.getElementById('targetMetal')?.value || 'bleck',
        crafters: document.getElementById('crafters')?.value || 1,
        mode: document.getElementById('mode')?.value || 'units',
        mods: {
            mast: document.getElementById('modMast')?.checked,
            ref: document.getElementById('modRef')?.checked,
            ext: document.getElementById('modExt')?.checked
        },
        choices: userPathChoices,
        collapsed: collapsedState,
        visibility: moduleVisibility,
        theme: isLight ? 'light' : 'dark',
        webhook: document.getElementById('webhookUrl')?.value || '',
        customColors: customColors
    };
    
    Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => {
        let el = document.getElementById('b_' + k);
        if (el) data.bank[k] = el.value;
    });

    localStorage.setItem('qm_data', JSON.stringify(data));
    const status = document.getElementById('saveStatus');
    if(status) {
        status.innerText = "Saved";
        setTimeout(() => status.innerText = "Ready", 2000);
    }
}

function load() {
    try {
        const raw = localStorage.getItem('qm_data');
        let isLight = false;
        
        if (!raw) {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                isLight = true;
            }
        } else {
            const data = JSON.parse(raw);
            
            if (data.lang) currentLang = data.lang;
            if (data.market) marketData = data.market;
            if (data.choices) userPathChoices = data.choices;
            if (data.collapsed) collapsedState = data.collapsed;
            if (data.visibility) moduleVisibility = data.visibility;
            if (data.webhook && document.getElementById('webhookUrl')) document.getElementById('webhookUrl').value = data.webhook;
            
            if (data.mode) {
                document.getElementById('mode').value = data.mode;
                prevMode = data.mode;
            }
            
            if (data.metal) document.getElementById('targetMetal').value = data.metal;
            if (data.target) document.getElementById('targetAmount').value = data.target;
            if (data.crafters) document.getElementById('crafters').value = data.crafters;
            
            if (data.mods) {
                document.getElementById('modMast').checked = data.mods.mast;
                document.getElementById('modRef').checked = data.mods.ref;
                document.getElementById('modExt').checked = data.mods.ext;
            }

            if (data.bank) {
                Object.keys(data.bank).forEach(k => {
                    let el = document.getElementById('b_' + k);
                    if (el) el.value = data.bank[k];
                });
            }

            if (data.theme) {
                isLight = data.theme === 'light';
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                isLight = true;
            }

            Object.keys(collapsedState).forEach(id => {
                if (collapsedState[id]) {
                    const el = document.getElementById(id);
                    if (el) el.classList.add('collapsed');
                }
            });

            Object.keys(moduleVisibility).forEach(id => {
                toggleMainModule(id, moduleVisibility[id]);
            });
        }
        
        if (isLight) document.body.classList.add('light-theme');
        syncColorPickers();
        if (typeof updateThemeIcon === 'function') updateThemeIcon();

    } catch (e) {
        console.error("Save load failed", e);
    }
}

function clearAll() {
    const t = i18n[currentLang] || i18n['en'];
    if (!confirm(t.resetPrompt || "Reset all inventory values and shopping cart to zero?")) return;
    
    Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => {
        let el = document.getElementById('b_' + k);
        if (el) el.value = 0;
        
        let p = defaultPrices[k];
        if (!p) p = (k === 'tephra') ? 40 : 15;
        marketData[k] = [{ p: p, q: 0 }];
    });
    
    document.getElementById('targetAmount').value = 10000;
    userPathChoices = {};
    completedSteps = [];
    
    renderBankTable();
    renderMarketTable();
    targetMetalChanged();
}

function generateShareCode() {
    const t = i18n[currentLang] || i18n['en'];
    const data = {
        m: document.getElementById('targetMetal').value,
        t: document.getElementById('targetAmount').value,
        b: {},
        mk: {}
    };
    
    Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => {
        const bVal = Number(document.getElementById('b_' + k)?.value) || 0;
        if (bVal > 0) data.b[k] = bVal;
        
        if (marketData[k]) {
            let activeTiers = marketData[k].filter(tier => tier.q > 0);
            if (activeTiers.length > 0) data.mk[k] = activeTiers;
        }
    });

    const str = btoa(JSON.stringify(data));
    document.getElementById('shareCode').value = str;
    navigator.clipboard.writeText(str);
    showToast(t.exportSuccess || "Copied!");
}

function loadShareCode() {
    const t = i18n[currentLang] || i18n['en'];
    try {
        const str = document.getElementById('shareCode').value;
        if (!str) return;
        
        const data = JSON.parse(atob(str));
        
        if (data.m) document.getElementById('targetMetal').value = data.m;
        if (data.t) document.getElementById('targetAmount').value = data.t;
        
        Object.values(CATEGORIES).flatMap(c => c.items).forEach(k => {
            let el = document.getElementById('b_' + k);
            if (el) el.value = data.b[k] || 0;
            
            if (data.mk && data.mk[k]) {
                marketData[k] = data.mk[k];
            } else {
                let p = defaultPrices[k] || 15;
                marketData[k] = [{ p: p, q: 0 }];
            }
        });
        
        renderBankTable();
        renderMarketTable();
        targetMetalChanged();
        showToast(t.importSuccess || "Loaded!");
        document.getElementById('shareCode').value = '';
        closeModal('settingsModal');
    } catch (e) {
        showToast(t.importError || "Invalid code!");
    }
}