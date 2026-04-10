import { loadBlockData, appendSection } from '../../../utils/utils.js';
import clockUISchema from '../data/ui-schema_default.json' with { type: 'json' };

function parseDivNumber(divValue) {
    const match = String(divValue).match(/(\d+)$/);
    return match ? parseInt(match[1]) : 1;
}

class clock_output_cfg {
    constructor(
        mco1SrcClk = "MCO1_SELECT_SRC_HSI",
        mco1Div    = "MCO_DIV_1",
        mco2SrcClk = "MCO2_SELECT_SRC_SYS",
        mco2Div    = "MCO_DIV_1"
    ) {
        this.mco1_srcclk = mco1SrcClk;
        this.mco1_div    = mco1Div;
        this.mco2_srcclk = mco2SrcClk;
        this.mco2_div    = mco2Div;
        this.mco1_hz     = 0;
        this.mco2_hz     = 0;
    }

    updateMco1(srcclk, div) {
        this.mco1_srcclk = srcclk;
        this.mco1_div    = div;
    }

    updateMco2(srcclk, div) {
        this.mco2_srcclk = srcclk;
        this.mco2_div    = div;
    }

    updateMco1Hz(hz) { this.mco1_hz = hz; }
    updateMco2Hz(hz) { this.mco2_hz = hz; }

    getMco1Hz() { return this.mco1_hz; }
    getMco2Hz() { return this.mco2_hz; }

    getMco1Div() { return parseDivNumber(this.mco1_div); }
    getMco2Div() { return parseDivNumber(this.mco2_div); }

    getCodeData() {
        return [
            '/* clock output config */',
            `    .mco1_srcclk = STM32_CLOCK_${this.mco1_srcclk},`,
            `    .mco1_div    = STM32_CLOCK_${this.mco1_div},`,
            `    .mco2_srcclk = STM32_CLOCK_${this.mco2_srcclk},`,
            `    .mco2_div    = STM32_CLOCK_${this.mco2_div},`,
        ];
    }

    getConfigData() {
        return [
            { '#define STM32_CLOCK_MCO1_OUT_HZ_CONFIG': this.mco1_hz },
            { '#define STM32_CLOCK_MCO2_OUT_HZ_CONFIG': this.mco2_hz },
        ];
    }
}

class clock_output_managment {
    constructor(mco1SrcClk, mco1Div, mco2SrcClk, mco2Div) {
        if (clock_output_managment.instance) {
            return clock_output_managment.instance;
        }

        this.clockOutputCfg = new clock_output_cfg(mco1SrcClk, mco1Div, mco2SrcClk, mco2Div);

        clock_output_managment.instance = this;
    }

    getInforVar() {
        return { varName: "g_clockOutputCfg", struct: "stm32_clock_output_cfg_t" };
    }

    getClockOutputCfg() {
        return this.clockOutputCfg;
    }

    getCodeData() {
        return this.clockOutputCfg.getCodeData();
    }

    getConfigData() {
        return this.clockOutputCfg.getConfigData();
    }
}

function getClockOutputSections() {
    return clockUISchema?.clockoutput?.sections ?? {};
}

function parseSelectSchemaDefault(sectionSchema, fieldName, fallback) {
    return sectionSchema?.fields?.[fieldName]?.value ?? fallback;
}

export function ClockOutputInitial() {
    const sections   = getClockOutputSections();
    const mco1Fields = loadBlockData("mco1", sections) ?? {};
    const mco2Fields = loadBlockData("mco2", sections) ?? {};

    const mco1SrcClk = mco1Fields.mco1SrcSelect
        ?? parseSelectSchemaDefault(sections.mco1, "mco1SrcSelect", "MCO1_SELECT_SRC_HSI");
    const mco1Div    = mco1Fields.mco1DivSelect
        ?? parseSelectSchemaDefault(sections.mco1, "mco1DivSelect", "MCO_DIV_1");
    const mco2SrcClk = mco2Fields.mco2SrcSelect
        ?? parseSelectSchemaDefault(sections.mco2, "mco2SrcSelect", "MCO2_SELECT_SRC_SYS");
    const mco2Div    = mco2Fields.mco2DivSelect
        ?? parseSelectSchemaDefault(sections.mco2, "mco2DivSelect", "MCO_DIV_1");

    return new clock_output_managment(mco1SrcClk, mco1Div, mco2SrcClk, mco2Div);
}

export function InitialiseClockOutputCodeSections(clockOutputBlock) {
    const sections = [];
    const codeData = clockOutputBlock.getCodeData();

    if (codeData !== null) {
        appendSection(sections, codeData);
    }

    return sections;
}

export function InitialiseClockOutputConfigSections(clockOutputBlock) {
    const sections = [];
    appendSection(sections, clockOutputBlock.getConfigData());
    return sections;
}
