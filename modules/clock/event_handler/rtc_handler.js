import { getInstance, addSelectorEventListeners, addMoreAvailableEventListener } from '../../../event_handler/event_handler.js';

function UpdateCKContent(id, value) {
    const el = document.getElementById(id);
    if (el !== null) {
        el.textContent = value;
    }
}

function getRtcSourceHz(srcValue) {
    const osc = getInstance("osc");

    switch (srcValue) {
        case "RTC_SELECT_SRC_LSE":     return osc?.get("lse")?.getFrequency() ?? 0;
        case "RTC_SELECT_SRC_LSI":     return osc?.get("lsi")?.getFrequency() ?? 0;
        case "RTC_SELECT_SRC_HSE_1MHZ": return osc?.get("hse")?.getFreQHSESupplyRTC() ?? 0;
        default: return 0;  /* RTC_SELECT_NONE */
    }
}

function updateRtcFrequency() {
    const enableEl = document.getElementById("rtc-enable-select");
    const srcEl    = document.getElementById("rtc-src-select");
    if (!enableEl || !srcEl) return;

    const isEnabled = enableEl.value === "RTC_ENABLE_ON";
    const srcHz     = isEnabled ? getRtcSourceHz(srcEl.value) : 0;

    const rtc = getInstance("rtc");
    if (rtc) {
        const cfg = rtc.getRtcCfg();
        cfg.updateEnable(enableEl.value);
        cfg.updateSrcClk(srcEl.value);
        cfg.updateHz(srcHz);
    }

    UpdateCKContent("rtc-src-ck", srcHz);
}

export function rtcEventInitialise() {
    addSelectorEventListeners("rtc", "rtc-enable-select",
        () => updateRtcFrequency(), "rtcEnableChange");
    addSelectorEventListeners("rtc", "rtc-src-select",
        () => updateRtcFrequency(), "rtcSrcChange");

    /* Re-calculate when LSE/LSI oscillator state changes */
    addMoreAvailableEventListener("lse", () => updateRtcFrequency(), "rtcSrcChange");
    addMoreAvailableEventListener("lsi", () => updateRtcFrequency(), "rtcSrcChange");
    addMoreAvailableEventListener("hse", () => updateRtcFrequency(), "rtcSrcChange");
}
