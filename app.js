const app = {
    state: {
        mode: 'units', target: 7000, crafters: 1, theme: 'dark',
        mods: { mast: true, ref: true, ext: true },
        bank: {}
    },
    timer: null,

    init: function() {
        CONFIG.items.forEach(i => this.state.bank[i.id] = 0);
        this.loadState();
        this.renderBank();
        this.run();

        // Register Service Worker for PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(err => console.log('SW setup failed', err));
        }
    },

    renderBank: function() {
        const table = document.getElementById('bankTable');
        table.innerHTML = "";
        CONFIG.items.forEach(item => {
            table.innerHTML += `<tr>
                <td style="font-weight:bold">${item.name}</td>
                <td style="text-align:right">
                    <input type="number" id="b_${item.id}" value="${this.state.bank[item.id]}" oninput="app.updateBank('${item.id}', this.value)">
                    <button class="btn-stack q-add" onclick="app.quickAdd('${item.id}')">${this.state.mode === 'stacks' ? '+1 Stk' : '+10k'}</button>
                </td>
            </tr>`;
        });
    },

    updateBank: function(id, val) {
        this.state.bank[id] = Number(val) || 0;
        this.debounceRun();
    },

    quickAdd: function(id) {
        let current = this.state.bank[id];
        this.state.bank[id] = this.state.mode === 'stacks' ? parseFloat((current + 1).toFixed(4)) : current + 10000;
        this.renderBank();
        this.run();
    },

    handleModeChange: function() {
        const newMode = document.getElementById('mode').value;
        const mult = newMode === 'stacks' ? 1/10000 : 10000;
        
        this.state.target = newMode === 'stacks' ? parseFloat((this.state.target * mult).toFixed(4)) : Math.round(this.state.target * mult);
        document.getElementById('targetSteel').value = this.state.target;

        Object.keys(this.state.bank).forEach(k => {
            this.state.bank[k] = newMode === 'stacks' ? parseFloat((this.state.bank[k] * mult).toFixed(4)) : Math.round(this.state.bank[k] * mult);
        });

        this.state.mode = newMode;
        this.renderBank();
        this.run();
    },

    toggleTheme: function() {
        document.body.classList.toggle('light-theme');
        this.state.theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        this.saveState();
    },

    clearAll: function() {
        if(confirm("Wipe local database?")) {
            Object.keys(this.state.bank).forEach(k => this.state.bank[k] = 0);
            this.state.target = 0;
            document.getElementById('targetSteel').value = 0;
            this.renderBank();
            this.run();
        }
    },

    calculateMax: function() {
        const mult = this.state.mode === 'stacks' ? 10000 : 1;
        // Convert bank to units for engine
        let unitBank = {};
        Object.keys(this.state.bank).forEach(k => unitBank[k] = this.state.bank[k] * mult);
        
        let maxTargetUnits = Engine.findMaxTarget(unitBank, this.state.mods);
        
        this.state.target = this.state.mode === 'stacks' ? parseFloat((maxTargetUnits / 10000).toFixed(4)) : maxTargetUnits;
        document.getElementById('targetSteel').value = this.state.target;
        this.run();
    },

    debounceRun: function() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.run(), 150);
    },

    run: function() {
        // Read current DOM values to state
        this.state.target = Number(document.getElementById('targetSteel').value) || 0;
        this.state.crafters = Math.max(1, Number(document.getElementById('crafters').value));
        this.state.mods.mast = document.getElementById('modMast').checked;
        this.state.mods.ref = document.getElementById('modRef').checked;
        this.state.mods.ext = document.getElementById('modExt').checked;

        const mult = this.state.mode === 'stacks' ? 10000 : 1;
        let unitBank = {};
        Object.keys(this.state.bank).forEach(k => unitBank[k] = this.state.bank[k] * mult);

        const result = Engine.run(this.state.target * mult, unitBank, this.state.mods);
        this.renderUI(result);
        this.saveState();
    },

    renderUI: function(result) {
        if (this.state.target <= 0) {
            document.getElementById('gatherOutput').innerHTML = `<div class="empty-msg">No target set.</div>`;
            document.getElementById('stepsOutput').innerHTML = "";
            document.getElementById('statStacks').innerText = "0.00";
            return;
        }

        let gHTML = ''; let hasDeficit = false; let totalUnits = 0;
        
        Object.keys(result.deficits).forEach(k => {
            let def = result.deficits[k];
            if (def > 0) {
                totalUnits += def;
                let fmtVal = this.state.mode === 'stacks' ? (def/10000).toFixed(2) + " Stk" : def.toLocaleString();
                let hm = def < 10000 ? 'hm-low' : 'hm-high';
                let name = CONFIG.items.find(i => i.id === k).name;
                gHTML += `<div class="logistics-item ${hm}"><span>${name}</span><span>${fmtVal}</span></div>`;
                hasDeficit = true;
            }
        });
        document.getElementById('gatherOutput').innerHTML = hasDeficit ? gHTML : `<div class="empty-msg">✅ Bank covers all raw materials!</div>`;
        document.getElementById('statStacks').innerText = (totalUnits / 10000).toFixed(2);

        // Steps Generation (FIXED: Variables match Engine output to prevent NaN)
        const d = result.details;
        const s = (v) => Math.ceil(v / this.state.crafters).toLocaleString();
        let steps = [];
        
        if (d.reqSaburra > 0) steps.push(`Grind <span class="highlight">${s(d.reqSaburra)} Saburra</span> + <span class="highlight">${s(d.waterForSaburra)} Water</span> yields <span class="highlight">${s(d.diffSP)} Sab Pwdr</span>`);
        if (d.calxToGrind > 0) steps.push(`Grind <span class="highlight">${s(d.calxToGrind)} Calx</span> + <span class="highlight">${s(d.waterForCalx)} Water</span> yields <span class="highlight">${s(d.diffCP)} Calx Pwdr</span> + <span class="highlight">${s(d.coalFromGrind)} Coal</span>`);
        if (d.calxToCrush > 0) steps.push(`Crush <span class="highlight">${s(d.calxToCrush)} Calx</span> yields <span class="highlight">${s(d.extraCoal)} Coal</span>`);
        if (d.reqGranum > 0) steps.push(`Attract: <span class="highlight">${s(d.reqGranum)} Granum</span> + <span class="highlight">${s(d.cpForBlood)} Calx Pwdr</span> yields <span class="highlight">${s(d.reqBlood)} Blood Ore</span>`);
        if (d.diffCoke > 0) steps.push(`Furnace: <span class="highlight">${s(d.coalForCoke)} Coal</span> + <span class="highlight">${s(d.cpForCoke)} Calx Pwdr</span> yields <span class="highlight">${s(d.diffCoke)} Coke</span>`);
        if (d.diffPI > 0) steps.push(`Furnace: <span class="highlight">${s(d.reqBlood)} Blood Ore</span> + <span class="highlight">${s(d.cokeForPI)} Coke</span> yields <span class="highlight">${s(d.diffPI)} Pig Iron</span>`);
        if (d.diffGS > 0) steps.push(`Oven: <span class="highlight">${s(d.diffPI)} Pig Iron</span> + <span class="highlight">${s(d.cokeForGS)} Coke</span> + <span class="highlight">${s(d.cpForGS)} Calx Pwdr</span> yields <span class="highlight">${s(d.diffGS)} Grain Steel</span>`);
        steps.push(`Final Oven: <span class="highlight">${s(d.reqGS)} Grain Steel</span> + <span class="highlight">${s(d.coalForSteel)} Coal</span> + <span class="highlight">${s(d.spForSteel)} Sab Pwdr</span> yields <span class="highlight">${(this.state.target * (this.state.mode === 'stacks'?10000:1)).toLocaleString()} Steel</span>`);
        
        document.getElementById('stepsOutput').innerHTML = steps.map(text => `<div class="step-card">${text}</div>`).join('');
    },

    exportState: function() {
        const encoded = btoa(JSON.stringify(this.state));
        navigator.clipboard.writeText(encoded);
        alert("Guild Data copied to clipboard! Paste this string to another Quartermaster.");
    },

    importState: function() {
        const data = prompt("Paste Guild Data string here:");
        if (data) {
            try {
                this.state = JSON.parse(atob(data));
                document.getElementById('mode').value = this.state.mode;
                document.getElementById('targetSteel').value = this.state.target;
                document.getElementById('crafters').value = this.state.crafters;
                document.getElementById('modMast').checked = this.state.mods.mast;
                document.getElementById('modRef').checked = this.state.mods.ref;
                document.getElementById('modExt').checked = this.state.mods.ext;
                if (this.state.theme === 'light') document.body.classList.add('light-theme');
                else document.body.classList.remove('light-theme');
                this.renderBank();
                this.run();
            } catch (e) { alert("Invalid Data String."); }
        }
    },

    saveState: function() {
        localStorage.setItem('QM_Steel_v5', JSON.stringify(this.state));
        document.getElementById('saveStatus').innerText = `Synced: ${new Date().toLocaleTimeString()}`;
    },

    loadState: function() {
        const d = JSON.parse(localStorage.getItem('QM_Steel_v5'));
        if (d) {
            this.state = d;
            document.getElementById('mode').value = this.state.mode;
            document.getElementById('targetSteel').value = this.state.target;
            document.getElementById('crafters').value = this.state.crafters;
            document.getElementById('modMast').checked = this.state.mods.mast;
            document.getElementById('modRef').checked = this.state.mods.ref;
            document.getElementById('modExt').checked = this.state.mods.ext;
            if (this.state.theme === 'light') document.body.classList.add('light-theme');
        }
    },

    copyDiscord: function() {
        const stacks = document.getElementById('statStacks').innerText;
        let msg = `**⚔️ LOGISTICS ORDER: STEEL ⚔️**\n**Total Load:** ${stacks} Stacks\n\n**REQUIRED MATERIALS:**\n\`\`\`\n`;
        const items = document.querySelectorAll('.logistics-item');
        if (items.length === 0) msg += `All materials in stock.\n`;
        items.forEach(el => msg += `- ${el.innerText.replace('\n', ': ')}\n`);
        msg += `\`\`\``;
        navigator.clipboard.writeText(msg);
        alert("Copied for Discord!");
    }
};

window.onload = () => app.init();
