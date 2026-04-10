import { getInstance, addSelectorEventListeners, addMoreAvailableEventListener } from '../../../event_handler/event_handler.js';

function UpdateCKContent(id, value) {
    const el = document.getElementById(id);
    if (el !== null) {
        el.textContent = value;
    }
}

function getDivNumber(divValue) {
    const match = String(divValue).match(/(\d+)$/);
    return match ? parseInt(match[1]) : 1;
}

function getMco1SourceHz(srcValue) {
    const osc = getInstance("osc");
    const pll = getInstance("pll");

    switch (srcValue) {
        case "MCO1_SELECT_SRC_HSI":    return osc?.get("hsi")?.getFrequency()    ?? 0;
        case "MCO1_SELECT_SRC_LSE":    return osc?.get("lse")?.getFrequency()    ?? 0;
        case "MCO1_SELECT_SRC_HSE":    return osc?.get("hse")?.getFrequency()    ?? 0;
        case "MCO1_SELECT_SRC_PLL1_Q": return pll?.getPllConfig(1)?.pllGetQck()  ?? 0;
        case "MCO1_SELECT_SRC_HSI48":  return osc?.get("hsi48")?.getFrequency()  ?? 0;
        default: return 0;
    }
}

function getMco2SourceHz(srcValue) {
    const osc    = getInstance("osc");
    const pll    = getInstance("pll");
    const system = getInstance("system");

    switch (srcValue) {
        case "MCO2_SELECT_SRC_SYS":    return system?.getSystemClock()?.getSysclkHz() ?? 0;
        case "MCO2_SELECT_SRC_PLL2_P": return pll?.getPllConfig(2)?.pllGetPck()        ?? 0;
        case "MCO2_SELECT_SRC_HSE":    return osc?.get("hse")?.getFrequency()           ?? 0;
        case "MCO2_SELECT_SRC_PLL1_P": return pll?.getPllConfig(1)?.pllGetPck()         ?? 0;
        case "MCO2_SELECT_SRC_CSI":    return osc?.get("csi")?.getFrequency()            ?? 0;
        case "MCO2_SELECT_SRC_LSI":    return osc?.get("lsi")?.getFrequency()            ?? 0;
        default: return 0;
    }
}

function updateMco1Frequency() {
    const srcEl = document.getElementById("mco1-src-select");
    const divEl = document.getElementById("mco1-div-select");
    if (!srcEl || !divEl) return;

    const srcHz = getMco1SourceHz(srcEl.value);
    const div   = getDivNumber(divEl.value);
    const outHz = div > 0 ? Math.round((srcHz / div) * 100) / 100 : 0;

    const clockOutput = getInstance("clockoutput");
    if (clockOutput) {
        const cfg = clockOutput.getClockOutputCfg();
        cfg.updateMco1(srcEl.value, divEl.value);
        cfg.updateMco1Hz(outHz);
    }

    UpdateCKContent("mco1-src-ck", outHz);
}

function updateMco2Frequency() {
    const srcEl = document.getElementById("mco2-src-select");
    const divEl = document.getElementById("mco2-div-select");
    if (!srcEl || !divEl) return;

    const srcHz = getMco2SourceHz(srcEl.value);
    const div   = getDivNumber(divEl.value);
    const outHz = div > 0 ? Math.round((srcHz / div) * 100) / 100 : 0;

    const clockOutput = getInstance("clockoutput");
    if (clockOutput) {
        const cfg = clockOutput.getClockOutputCfg();
        cfg.updateMco2(srcEl.value, divEl.value);
        cfg.updateMco2Hz(outHz);
    }

    UpdateCKContent("mco2-src-ck", outHz);
}

function updateAllMcoFrequencies() {
    updateMco1Frequency();
    updateMco2Frequency();
}

export function clockOutputEventInitialise() {
    addSelectorEventListeners("clockoutput", "mco1-src-select",
        () => updateMco1Frequency(), "mco1SrcChange");
    addSelectorEventListeners("clockoutput", "mco1-div-select",
        () => updateMco1Frequency(), "mco1DivChange");

    addSelectorEventListeners("clockoutput", "mco2-src-select",
        () => updateMco2Frequency(), "mco2SrcChange");
    addSelectorEventListeners("clockoutput", "mco2-div-select",
        () => updateMco2Frequency(), "mco2DivChange");

    /* React to upstream clock changes */
    addMoreAvailableEventListener("hsi",    () => updateAllMcoFrequencies(), "mcoSrcChange");
    addMoreAvailableEventListener("hse",    () => updateAllMcoFrequencies(), "mcoSrcChange");
    addMoreAvailableEventListener("csi",    () => updateAllMcoFrequencies(), "mcoSrcChange");
    addMoreAvailableEventListener("lsi",    () => updateAllMcoFrequencies(), "mcoSrcChange");
    addMoreAvailableEventListener("lse",    () => updateAllMcoFrequencies(), "mcoSrcChange");
    addMoreAvailableEventListener("hsi48",  () => updateAllMcoFrequencies(), "mcoSrcChange");
    addMoreAvailableEventListener("pll",    () => updateAllMcoFrequencies(), "mcoSrcChange");
    addMoreAvailableEventListener("system", () => updateAllMcoFrequencies(), "mcoSrcChange");
}
