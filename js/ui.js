function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerText = message;
    toast.className = "show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

function openModal(modalId) {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    document.getElementById(modalId).style.display = 'block';
    if(modalId === 'settingsModal') switchTab('view');
    if(modalId === 'helpModal') switchHelpTab('guide');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) { 
    ['settingsModal', 'helpModal', 'bankModal', 'cartModal', 'prodModal'].forEach(id => {
        if (event.target == document.getElementById(id)) closeModal(id); 
    });
}

function switchTab(tabId) {
    document.querySelectorAll('#settingsModal .tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('#settingsModal .tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('tab_' + tabId).style.display = 'block';
    document.getElementById('tabBtn_' + tabId).classList.add('active');
}

function switchHelpTab(tabId) {
    document.querySelectorAll('#helpModal .tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('#helpModal .tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('tab_help_' + tabId).style.display = 'block';
    document.getElementById('tabBtn_help_' + tabId).classList.add('active');
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

function toggleMainModule(modId, isVisible = null) {
    const el = document.getElementById(modId);
    if (!el) return;

    if (isVisible === null) {
        isVisible = el.classList.contains('module-hidden');
    }

    if (isVisible) el.classList.remove('module-hidden');
    else el.classList.add('module-hidden');

    moduleVisibility[modId] = isVisible;
    
    const checkboxId = modId.replace('mod_', 'view_');
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) checkbox.checked = isVisible;

    save();
}

window.addEventListener('scroll', () => {
    const btn = document.getElementById('btnReturnTop');
    if (btn) {
        if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setLang(code) {
    document.getElementById('lang').value = code;
    changeLang();
    save();
}

function changeLang() {
    currentLang = document.getElementById('lang').value;
    const t = i18n[currentLang] || i18n['en'];
    
    document.getElementById('flag_en').classList.toggle('active', currentLang === 'en');
    document.getElementById('flag_fr').classList.toggle('active', currentLang === 'fr');
    
    const standardElements = [
        'tabPrefs', 'tabData', 'tabHelp', 'tabView', 'resetDesc', 'format', 
        'optUnits', 'optStacks', 'targetMetalLabel', 'target', 'crafters', 
        'yieldMods', 'mastery', 'refining', 'extraction', 'btnDiscord', 'btnSend', 
        'invBank', 'invBankTitle', 'showAllBank', 'btnReset', 'defGather', 'mfgPipe', 'marketCart', 'marketCartTitle', 'showAllCart', 'btnAutoFill', 
        'shareTitle', 'shareDesc', 'btnGenCode', 'btnLoadCode', 'helpFeatures', 'helpHowTo',
        'colorAccent', 'colorBg', 'colorText', 'btnResetColors', 'viewProd', 
        'viewGather', 'viewPipe', 'legCP', 'legSP',
        'legBO', 'legPI', 'legGS', 'legStk', 'btnBank', 'btnCart', 
        'btnSettings', 'btnHelp', 'btnClearCart', 'viewLang',
        'actDiscord', 'viewPers', 'viewVis', 'tabGuide', 'tabLegend',
        'btnProd', 'prodCmdTitle', 'btnExportCSV', 'bpTitle', 'btnBp', 'btnPrefEfficient', 'btnPrefYield', 'projectProgressText',
        'btnPipeReset'
    ];
    
    const htmlElements = [
        'helpSubtitle', 'helpFeat1', 'helpFeat3', 'helpFeat4', 'helpFeat5',
        'helpHow1', 'helpHow2', 'helpHow3', 'helpHow4',
        'legBestTxt', 'legMaxTxt', 'legRegionTxt'
    ];

    standardElements.forEach(id => {
        let el = document.getElementById('ui_' + id);
        if (el) el.innerText = t[id] || i18n.en[id];
    });

    htmlElements.forEach(id => {
        let el = document.getElementById('ui_' + id);
        if (el) el.innerHTML = t[id] || i18n.en[id];
    });

    // Update search placeholders dynamically
    const searchBank = document.getElementById('searchBank');
    if(searchBank) searchBank.placeholder = t.searchPlaceholder || "Search...";
    
    const searchCart = document.getElementById('searchCart');
    if(searchCart) searchCart.placeholder = t.searchPlaceholder || "Search...";

    renderBankTable(); 
    renderMarketTable(); 
    updatePipelineVisuals();
    run();
}