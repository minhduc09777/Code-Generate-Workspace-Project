import { loadBlockData, appendSection } from '../../../utils/utils.js';
import clockUISchema from '../data/ui-schema_default.json' with { type: 'json' };

class rtc_cfg {
    constructor(
        rtcEnable = "RTC_ENABLE_OFF",
        rtcSrcClk = "RTC_SELECT_NONE"
    ) {
        this.rtc_enable = rtcEnable;
        this.rtc_srcclk = rtcSrcClk;
        this.rtc_hz     = 0;
    }

    updateEnable(enable) {
        this.rtc_enable = enable;
    }

    updateSrcClk(srcclk) {
        this.rtc_srcclk = srcclk;
    }

    updateHz(hz) {
        this.rtc_hz = hz;
    }

    getHz() {
        return this.rtc_hz;
    }

    getCodeData() {
        return [
            '/* rtc clock config */',
            `    .rtc_enable = STM32_CLOCK_${this.rtc_enable},`,
            `    .rtc_srcclk = STM32_CLOCK_${this.rtc_srcclk},`,
        ];
    }

    getConfigData() {
        return [
            { '#define STM32_CLOCK_RTC_HZ_CONFIG': this.rtc_hz },
        ];
    }
}

class rtc_clock_managment {
    constructor(rtcEnable, rtcSrcClk) {
        if (rtc_clock_managment.instance) {
            return rtc_clock_managment.instance;
        }

        this.rtcCfg = new rtc_cfg(rtcEnable, rtcSrcClk);

        rtc_clock_managment.instance = this;
    }

    getInforVar() {
        return { varName: "g_rtcClkCfg", struct: "stm32_clock_rtc_cfg_t" };
    }

    getRtcCfg() {
        return this.rtcCfg;
    }

    getCodeData() {
        return this.rtcCfg.getCodeData();
    }

    getConfigData() {
        return this.rtcCfg.getConfigData();
    }
}

function getRtcSections() {
    return clockUISchema?.rtc?.sections ?? {};
}

export function RTCInitial() {
    const sections  = getRtcSections();
    const rtcFields = loadBlockData("rtc", sections) ?? {};

    const rtcEnable = rtcFields.rtcEnableSelect
        ?? sections.rtc?.fields?.rtcEnableSelect?.value
        ?? "RTC_ENABLE_OFF";
    const rtcSrcClk = rtcFields.rtcSrcSelect
        ?? sections.rtc?.fields?.rtcSrcSelect?.value
        ?? "RTC_SELECT_NONE";

    return new rtc_clock_managment(rtcEnable, rtcSrcClk);
}

export function InitialiseRTCCodeSections(rtcBlock) {
    const sections = [];
    const codeData = rtcBlock.getCodeData();

    if (codeData !== null) {
        appendSection(sections, codeData);
    }

    return sections;
}

export function InitialiseRTCConfigSections(rtcBlock) {
    const sections = [];
    appendSection(sections, rtcBlock.getConfigData());
    return sections;
}
