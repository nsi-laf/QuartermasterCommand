function clearPipelineProgress() {
    if (completedSteps.length === 0) return;

    const isStacks = document.getElementById('mode').value === 'stacks';

    completedSteps.forEach(index => {
        const stepObj = pipelineStepsRaw[index];
        if (!stepObj) return;

        let allYields = [];
        if (stepObj.mainYields) allYields.push(...stepObj.mainYields);
        if (stepObj.byproducts) allYields.push(...stepObj.byproducts);

        allYields.forEach(y => {
            const bankInput = document.getElementById('b_' + y.item);
            if (bankInput) {
                let current = Number(bankInput.value) || 0;
                let sub = isStacks ? y.amount / 10000 : y.amount;
                bankInput.value = Math.max(0, current - sub).toFixed(isStacks ? 4 : 0);
            }
        });
    });

    completedSteps = [];
    focusIndex = 0;
}

function handlePipelineChange() {
    clearPipelineProgress();
    save();
    run();
}

function updatePrefVisuals() {
    const chkEff = document.getElementById('chkEff');
    const chkYld = document.getElementById('chkYld');
    const lblEff = document.getElementById('ui_btnPrefEfficient');
    const lblYld = document.getElementById('ui_btnPrefYield');

    if (chkEff && chkYld) {
        if (chkEff.checked) {
            chkYld.disabled = true;
            if (lblYld) lblYld.style.opacity = '0.4';
        } else if (chkYld.checked) {
            chkEff.disabled = true;
            if (lblEff) lblEff.style.opacity = '0.4';
        } else {
            chkEff.disabled = false;
            chkYld.disabled = false;
            if (lblEff) lblEff.style.opacity = '1';
            if (lblYld) lblYld.style.opacity = '1';
        }
    }
}

function toggleGlobalPref(prefType, isChecked) {
    clearPipelineProgress();
    if (isChecked) {
        globalRoutePref = prefType;
        if (prefType === 'efficient') {
            const chkYld = document.getElementById('chkYld');
            if (chkYld) chkYld.checked = false;
        } else if (prefType === 'yield') {
            const chkEff = document.getElementById('chkEff');
            if (chkEff) chkEff.checked = false;
        }
    } else {
        if (globalRoutePref === prefType) {
            globalRoutePref = null;
        }
    }

    updatePrefVisuals();
    save();
    run();
}

function updatePathChoice(e, stepKey, selectedRoute) {
    if (e) e.stopPropagation();

    clearPipelineProgress();
    if (globalRoutePref !== null) {
        globalRoutePref = null;
        const chkEff = document.getElementById('chkEff');
        const chkYld = document.getElementById('chkYld');
        if (chkEff) chkEff.checked = false;
        if (chkYld) chkYld.checked = false;
        updatePrefVisuals();
    }

    userPathChoices[stepKey] = selectedRoute;
    save();
    run();
}

function setPipelineView(mode) {
    pipelineViewMode = mode;
    document.getElementById('btnOverview').classList.toggle('active', mode === 'overview');
    document.getElementById('btnFocus').classList.toggle('active', mode === 'focus');

    const container = document.getElementById('stepsOutput');
    const nav = document.getElementById('focusNav');

    if (mode === 'focus') {
        container.classList.add('focus-mode');
        if (nav) nav.style.display = 'flex';
        focusIndex = 0;
        for (let i = 0; i < pipelineStepsRaw.length; i++) {
            if (!completedSteps.includes(i)) { focusIndex = i; break; }
        }
        updateFocusView();
    } else {
        container.classList.remove('focus-mode');
        if (nav) nav.style.display = 'none';
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
    const t = i18n[currentLang] || i18n['en'];
    const cards = document.querySelectorAll('#stepsOutput .step-card');
    cards.forEach((card, index) => {
        if (index === focusIndex) card.classList.add('active-focus');
        else card.classList.remove('active-focus');
    });
    const navText = document.getElementById('focusProgressText');
    if (navText && pipelineStepsRaw.length > 0) {
        navText.innerText = `${t.stepPrefix || 'Step'} ${focusIndex + 1} / ${pipelineStepsRaw.length}`;
    }
}

function updatePipelineVisuals() {
    document.querySelectorAll('#stepsOutput .step-card').forEach((card, index) => {
        if (completedSteps.includes(index)) {
            card.classList.add('completed');
            const iconSpan = card.querySelector('span[style*="cursor:pointer"]');
            if (iconSpan) iconSpan.innerText = '✅';
        } else {
            card.classList.remove('completed');
            const iconSpan = card.querySelector('span[style*="cursor:pointer"]');
            if (iconSpan) iconSpan.innerText = '⬜';
        }
    });

    let percent = pipelineStepsRaw.length === 0 ? 100 : Math.round((completedSteps.length / pipelineStepsRaw.length) * 100);
    if (percent > 100) percent = 100;

    const progBar = document.getElementById('projectProgress');
    const progContainer = document.querySelector('.progress-container');
    const progText = document.getElementById('projectProgressText');
    const t = i18n[currentLang] || i18n['en'];

    if (progBar) progBar.style.width = percent + '%';
    if (progText) progText.innerText = `${percent}% ${t.pipeCompleted || 'Production Progress'}`;

    if (percent === 100 && pipelineStepsRaw.length > 0) {
        if (progBar) progBar.classList.add('complete-pulse');
        if (progContainer) progContainer.classList.add('complete-pulse');
    } else {
        if (progBar) progBar.classList.remove('complete-pulse');
        if (progContainer) progContainer.classList.remove('complete-pulse');
    }
}

function toggleStep(index) {
    const idx = completedSteps.indexOf(index);
    const stepObj = pipelineStepsRaw[index];
    const isStacks = document.getElementById('mode').value === 'stacks';

    if (idx > -1) {
        completedSteps.splice(idx, 1);

        let allYields = [];
        if (stepObj.mainYields) allYields.push(...stepObj.mainYields);
        if (stepObj.byproducts) allYields.push(...stepObj.byproducts);

        allYields.forEach(y => {
            const bankInput = document.getElementById('b_' + y.item);
            if (bankInput) {
                let current = Number(bankInput.value) || 0;
                let sub = isStacks ? y.amount / 10000 : y.amount;
                bankInput.value = Math.max(0, current - sub).toFixed(isStacks ? 4 : 0);
            }
        });

    } else {
        completedSteps.push(index);

        let allYields = [];
        if (stepObj.mainYields) allYields.push(...stepObj.mainYields);
        if (stepObj.byproducts) allYields.push(...stepObj.byproducts);

        allYields.forEach(y => {
            const bankInput = document.getElementById('b_' + y.item);
            if (bankInput) {
                let current = Number(bankInput.value) || 0;
                let add = isStacks ? y.amount / 10000 : y.amount;
                bankInput.value = (current + add).toFixed(isStacks ? 4 : 0);
            }
        });
        if (pipelineViewMode === 'focus') navFocus(1);
    }

    updatePipelineVisuals();
    save();
}

function restartPipeline() {
    const t = i18n[currentLang] || i18n['en'];
    if (!confirm(t.restartPrompt || "Restart the pipeline? This will un-check all steps and remove their yields from your inventory.")) return;
    clearPipelineProgress();
    updatePipelineVisuals();
    if (pipelineViewMode === 'focus') updateFocusView();
    save();
}