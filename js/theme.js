const defaultColors = {
    dark: { accent: '#d4af37', bg: '#1c1c21', text: '#e0e0e0' },
    light: { accent: '#8a6312', bg: '#ffffff', text: '#111111' }
};

function updateThemeIcon() {
    const btn = document.getElementById('btnThemeToggle');
    if (btn) {
        if (document.body.classList.contains('light-theme')) {
            btn.innerHTML = '🌙';
        } else {
            btn.innerHTML = '☀️';
        }
    }
}

function checkColorsChanged() {
    const isLight = document.body.classList.contains('light-theme');
    const theme = isLight ? defaultColors.light : defaultColors.dark;
    
    const currentAccent = document.getElementById('colorAccent').value.toLowerCase();
    const currentBg = document.getElementById('colorBg').value.toLowerCase();
    const currentText = document.getElementById('colorText').value.toLowerCase();
    
    const isChanged = (
        currentAccent !== theme.accent.toLowerCase() || 
        currentBg !== theme.bg.toLowerCase() || 
        currentText !== theme.text.toLowerCase()
    );
    
    const btn = document.getElementById('ui_btnResetColors');
    if(btn) btn.disabled = !isChanged;
}

function syncColorPickers() {
    const isLight = document.body.classList.contains('light-theme');
    const themeKey = isLight ? 'light' : 'dark';
    const themeDef = isLight ? defaultColors.light : defaultColors.dark;
    
    const raw = localStorage.getItem('qm_data');
    let savedColors = null;
    if (raw) {
        try { 
            const data = JSON.parse(raw);
            if (data.customColors && data.customColors[themeKey]) {
                savedColors = data.customColors[themeKey];
            }
        } catch(e) {}
    }

    const root = document.body;
    if (savedColors) {
        document.getElementById('colorAccent').value = savedColors.accent;
        document.getElementById('colorBg').value = savedColors.bg;
        document.getElementById('colorText').value = savedColors.text;
        root.style.setProperty('--accent', savedColors.accent);
        root.style.setProperty('--bg-card', savedColors.bg);
        root.style.setProperty('--text', savedColors.text);
    } else {
        document.getElementById('colorAccent').value = themeDef.accent;
        document.getElementById('colorBg').value = themeDef.bg;
        document.getElementById('colorText').value = themeDef.text;
        root.style.removeProperty('--accent');
        root.style.removeProperty('--bg-card');
        root.style.removeProperty('--text');
    }
    
    checkColorsChanged();
}

function applyColors() {
    const root = document.body;
    const accent = document.getElementById('colorAccent').value;
    const bg = document.getElementById('colorBg').value;
    const text = document.getElementById('colorText').value;
    
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--bg-card', bg);
    root.style.setProperty('--text', text);
    
    checkColorsChanged();
    save();
}

function resetColors() {
    const isLight = document.body.classList.contains('light-theme');
    const themeKey = isLight ? 'light' : 'dark';
    
    let existingData = {};
    try { existingData = JSON.parse(localStorage.getItem('qm_data') || '{}'); } catch(e) {}
    
    if (existingData.customColors) {
        delete existingData.customColors[themeKey];
        localStorage.setItem('qm_data', JSON.stringify(existingData));
    }
    
    const root = document.body;
    root.style.removeProperty('--accent');
    root.style.removeProperty('--bg-card');
    root.style.removeProperty('--text');
    
    syncColorPickers();
    save();
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    syncColorPickers();
    save();
    updateThemeIcon();
}