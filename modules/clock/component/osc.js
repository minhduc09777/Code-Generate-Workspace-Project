import { loadBlockData, appendSection } from '../../../utils/utils.js';
import clockUISchema from '../data/ui-schema_default.json' with { type: 'json' };

class HSEoscillator {
    constructor(
        inputValue = 25000000,
        onState = "ENABLE_OFF",
        bypass = "BYPASS_DISABLE",
        secure = "SECURE_OFF",
        hseRTCDiv = "0 // no clock supply"
    ) {
        if (HSEoscillator.instance) {
            if (HSEoscillator.instance.isloadData) {
                return HSEoscillator.instance;
            }
            return HSEoscillator.instance;
        }

        this.isloadData = arguments.length > 0;
        this.inputValue = inputValue;
        this.hse_osc_enable = onState !== null ? "STM32_CLOCK_HSE_OSC_" + onState : null;
        this.hse_osc_bypass = bypass !== null ? "STM32_CLOCK_HSE_OSC_" + bypass : null;
        this.hse_osc_secure = secure !== null ? "STM32_CLOCK_HSE_OSC_" + secure : null;
        this.hse_osc_rtc_div = hseRTCDiv;

        HSEoscillator.instance = this;
    }

    UpdateOsc(inputValue, onState, bypass, secure, hseRTCDiv){
        this.isloadData = true;
        if (inputValue !== null) this.inputValue = inputValue;
        if (onState !== null) this.hse_osc_enable = "STM32_CLOCK_HSE_OSC_" + onState;
        if (bypass !== null) this.hse_osc_bypass = "STM32_CLOCK_HSE_OSC_" + bypass;
        if (secure !== null) this.hse_osc_secure = "STM32_CLOCK_HSE_OSC_" + secure;
        if (hseRTCDiv !== null) this.hse_osc_rtc_div = hseRTCDiv;
    }

    isDataLoad()
    {
        return this.isloadData;
    }

    GetCodeArray() {
        if (!this.isloadData) {
            return null;
        }

        const lines = ["    .hse_osc_cfg = {"];
        if (this.inputValue !== null) lines.push(`     /* HSE frequency: ${this.getFrequency()} */`);
        if (this.hse_osc_enable !== null) lines.push(`     .hse_osc_enable = ${this.hse_osc_enable},`);
        if (this.hse_osc_bypass !== null) lines.push(`     .hse_osc_bypass = ${this.hse_osc_bypass},`);
        if (this.hse_osc_secure !== null) lines.push(`     .hse_osc_secure = ${this.hse_osc_secure},`);
        if (this.hse_osc_rtc_div !== null) lines.push(`     .hse_osc_rtc_div = ${this.hse_osc_rtc_div},`);
        lines.push("    }");
        return lines;
    }
    GetConfigArray() {
        if (!this.isloadData) {
            return null;
        }

        return [
            {"#define STM32_CLOCK_HSE_OSC_FREQ_CONFIG": this.getFrequency()},
        ]
    }
    getFrequency() {
        if (this.hse_osc_enable?.endsWith('_OFF')) return 0;
        return this.inputValue;
    }

    getFreQHSESupplyRTC(){
        if (this.hse_osc_enable?.endsWith('_OFF') ||
            this.hse_osc_rtc_div[0] === '0') return 0;

        return this.inputValue / Number(this.hse_osc_rtc_div[0]);
    }

    getName(){
        return "HSE";
    }
}

class HSI48oscillator {
    constructor(inputValue = 48000000, onState = "ENABLE_OFF") {
        if (HSI48oscillator.instance) {
            if (HSI48oscillator.instance.isloadData) {
                return HSI48oscillator.instance;
            }
            return HSI48oscillator.instance;
        }

        this.isloadData = arguments.length > 0;
        this.inputValue = inputValue;
        this.hsi48_osc_enable = onState !== null ? "STM32_CLOCK_HSI48_OSC_" + onState : null;
        HSI48oscillator.instance = this;
    }

    UpdateOsc(inputValue, onState) {
        this.isloadData = true;
        if (inputValue !== null) this.inputValue = inputValue;
        if (onState !== null) this.hsi48_osc_enable = "STM32_CLOCK_HSI48_OSC_" + onState;
    }

    isDataLoad()
    {
        return this.isloadData;
    }

    GetCodeArray() {
        if (!this.isloadData) {
            return null;
        }

        const lines = ["    .hsi48_osc_cfg = {"];
        if (this.inputValue !== null) lines.push(`     /* HSI48 frequency: ${this.getFrequency()} */`);
        if (this.hsi48_osc_enable !== null) lines.push(`     .hsi48_osc_enable = ${this.hsi48_osc_enable},`);
        lines.push("    }");
        return lines;
    }

    GetConfigArray() {
        if (!this.isloadData) {
            return null;
        }

        return [
            {"#define STM32_CLOCK_HSI48_OSC_FREQ_CONFIG": this.getFrequency()},
        ];
    }
    getFrequency() {
        if (this.hsi48_osc_enable?.endsWith('_OFF')) return 0;
        return this.inputValue;
    }

    getName(){
        return "HSI48";
    }
}

class CSIoscillator {
    constructor(inputValue = 4000000, onState = "ENABLE_OFF", runInStopmode = "RUN_IN_STOPMODE_DISABLE") {
        if (CSIoscillator.instance) {
            if (CSIoscillator.instance.isloadData) {
                return CSIoscillator.instance;
            }
            return CSIoscillator.instance;
        }

        this.isloadData = arguments.length > 0;
        this.inputValue = inputValue;
        this.csi_osc_enable = onState !== null ? "STM32_CLOCK_CSI_OSC_" + onState : null;
        this.csi_run_in_stopmode = runInStopmode !== null ? "STM32_CLOCK_CSI_OSC_" + runInStopmode : null;
        CSIoscillator.instance = this;
    }

    UpdateOsc(inputValue, onState, runInStopmode) {
        this.isloadData = true;
        if (inputValue !== null) this.inputValue = inputValue;
        if (onState !== null) this.csi_osc_enable = "STM32_CLOCK_CSI_OSC_" + onState;
        if (runInStopmode !== null) this.csi_run_in_stopmode = "STM32_CLOCK_CSI_OSC_" + runInStopmode;
    }

    isDataLoad()
    {
        return this.isloadData;
    }

    GetCodeArray() {
        if (!this.isloadData) {
            return null;
        }

        const lines = ["    .csi_osc_cfg = {"];
        if (this.inputValue !== null) lines.push(`     /* CSI frequency: ${this.getFrequency()} */`);
        if (this.csi_osc_enable !== null) lines.push(`     .csi_osc_enable = ${this.csi_osc_enable},`);
        if (this.csi_run_in_stopmode !== null) lines.push(`     .csi_run_in_stopmode = ${this.csi_run_in_stopmode},`);
        lines.push("    }");
        return lines;
    }

    GetConfigArray() {
        if (!this.isloadData) {
            return null;
        }

        return [
            {"#define STM32_CLOCK_CSI_OSC_FREQ_CONFIG": this.getFrequency()},
        ];
    }
    getFrequency() {
        if (this.csi_osc_enable?.endsWith('_OFF')) return 0;
        return this.inputValue;
    }

    getName(){
        return "CSI";
    }
}

class HSIoscillator {
    constructor(inputValue = 64000000, onState = "ENABLE_OFF", runInStopmode = "RUN_IN_STOPMODE_DISABLE", divider = "DIV_1") {
        if (HSIoscillator.instance) {
            if (HSIoscillator.instance.isloadData) {
                return HSIoscillator.instance;
            }
            return HSIoscillator.instance;
        }
        this.isloadData = arguments.length > 0;
        this.inputValue = inputValue;
        this.hsi_osc_enable = onState !== null ? "STM32_CLOCK_HSI_OSC_" + onState : null;
        this.hsi_run_in_stopmode = runInStopmode !== null ? "STM32_CLOCK_HSI_OSC_" + runInStopmode : null;
        this.hsi_divider = divider !== null ? "STM32_CLOCK_HSI_OSC_" + divider : null;
        if (this.hsi_divider !== null)
        {
            this.divider = Number(divider.split("_")[1]);
            this.inputValue = Number(inputValue);
        }
        else
        {
            this.divider = 1;
        }
        HSIoscillator.instance = this;
    }

    UpdateOsc(inputValue, onState, runInStopmode, divider) {
        this.isloadData = true;
        if (onState !== null) this.hsi_osc_enable = "STM32_CLOCK_HSI_OSC_" + onState;
        if (runInStopmode !== null) this.hsi_run_in_stopmode = "STM32_CLOCK_HSI_OSC_" + runInStopmode;
        if (divider !== null) {
            this.hsi_divider = "STM32_CLOCK_HSI_OSC_" + divider;
            this.divider =  Number(divider.split("_")[1]);
            this.inputValue = Number(inputValue);
        } else {
            this.divider = 1;
            this.inputValue = inputValue;
        }
    }

    isDataLoad()
    {
        return this.isloadData;
    }

    GetCodeArray() {
        if (!this.isloadData) {
            return null;
        }

        const lines = ["    .hsi_osc_cfg = {"];
        if (this.inputValue !== null) lines.push(`     /* HSI frequency: ${this.getFrequency()} */`);
        if (this.hsi_osc_enable !== null) lines.push(`     .hsi_osc_enable = ${this.hsi_osc_enable},`);
        if (this.hsi_run_in_stopmode !== null) lines.push(`     .hsi_run_in_stopmode = ${this.hsi_run_in_stopmode},`);
        if (this.hsi_divider !== null) lines.push(`     .hsi_divider = ${this.hsi_divider},`);
        lines.push("    }");
        return lines;
    }

    GetConfigArray() {
        if (!this.isloadData) {
            return null;
        }

        return [
            {"#define STM32_CLOCK_HSI_OSC_FREQ_CONFIG": this.getFrequency()},
        ];
    }

    getFrequency() {
        if (this.hsi_osc_enable?.endsWith('_OFF')) return 0;
        return this.inputValue / this.divider;
    }

    getName(){
        return "HSI";
    }
}

class LSIoscillator {
    constructor(inputValue = 32000, onState = "ENABLE_OFF") {
        if (LSIoscillator.instance) {
            if (LSIoscillator.instance.isloadData) {
                return LSIoscillator.instance;
            }
            return LSIoscillator.instance;
        }

        this.isloadData = arguments.length > 0;
        this.inputValue = inputValue;
        this.lsi_osc_enable = onState !== null ? "STM32_CLOCK_LSI_OSC_" + onState : null;
        LSIoscillator.instance = this;
    }

    UpdateOsc(inputValue, onState) {
        this.isloadData = true;
        if (inputValue !== null) this.inputValue = inputValue;
        if (onState !== null) this.lsi_osc_enable = "STM32_CLOCK_LSI_OSC_" + onState;
    }

    isDataLoad()
    {
        return this.isloadData;
    }

    GetCodeArray() {
        if (!this.isloadData) {
            return null;
        }

        const lines = ["    .lsi_osc_cfg = {"];
        if (this.inputValue !== null) lines.push(`     /* LSI frequency: ${this.getFrequency()} */`);
        if (this.lsi_osc_enable !== null) lines.push(`     .lsi_osc_enable = ${this.lsi_osc_enable},`);
        lines.push("    }");
        return lines;
    }

    GetConfigArray() {
        if (!this.isloadData) {
            return null;
        }

        return [
            {"#define STM32_CLOCK_LSI_OSC_FREQ_CONFIG": this.getFrequency()},
        ];
    }
    getFrequency() {
        if (this.lsi_osc_enable?.endsWith('_OFF')) return 0;
        return this.inputValue;
    }

    getName(){
        return "LSI";
    }
}

class LSEoscillator {
    constructor(inputValue = 32768, onState = "ENABLE_OFF", bypass = "BYPASS_DISABLE", secure = "SECURE_OFF", capLevel = "CAPABILITY_LEVEL_LOWEST") {
        if (LSEoscillator.instance) {
            if (LSEoscillator.instance.isloadData) {
                return LSEoscillator.instance;
            }
            return LSEoscillator.instance;
        }

        this.isloadData = arguments.length > 0;
        this.inputValue = inputValue;
        this.lse_osc_enable = onState !== null ? "STM32_CLOCK_LSE_OSC_" + onState : null;
        this.lse_osc_bypass = bypass !== null ? "STM32_CLOCK_LSE_OSC_" + bypass : null;
        this.lse_osc_secure = secure !== null ? "STM32_CLOCK_LSE_OSC_" + secure : null;
        this.lse_cap_level = capLevel !== null ? "STM32_CLOCK_LSE_OSC_" + capLevel : null;
        LSEoscillator.instance = this;
    }

    UpdateOsc(inputValue, onState, bypass, secure, capLevel) {
        this.isloadData = true;
        if (inputValue !== null) this.inputValue = inputValue;
        if (onState !== null) this.lse_osc_enable = "STM32_CLOCK_LSE_OSC_" + onState;
        if (bypass !== null) this.lse_osc_bypass = "STM32_CLOCK_LSE_OSC_" + bypass;
        if (secure !== null) this.lse_osc_secure = "STM32_CLOCK_LSE_OSC_" + secure;
        if (capLevel !== null) this.lse_cap_level = "STM32_CLOCK_LSE_OSC_" + capLevel;
    }

    isDataLoad()
    {
        return this.isloadData;
    }

    GetCodeArray() {
        if (!this.isloadData) {
            return null;
        }

        const lines = ["    .lse_osc_cfg = {"];
        if (this.inputValue !== null) lines.push(`     /* LSE frequency: ${this.getFrequency()} */`);
        if (this.lse_osc_enable !== null) lines.push(`     .lse_osc_enable = ${this.lse_osc_enable},`);
        if (this.lse_osc_bypass !== null) lines.push(`     .lse_osc_bypass = ${this.lse_osc_bypass},`);
        if (this.lse_osc_secure !== null) lines.push(`     .lse_osc_secure = ${this.lse_osc_secure},`);
        if (this.lse_cap_level !== null) lines.push(`     .lse_cap_level = ${this.lse_cap_level},`);
        lines.push("    }");
        return lines;
    }

    GetConfigArray() {
        if (!this.isloadData) {
            return null;
        }

        return [
            {"#define STM32_CLOCK_LSE_OSC_FREQ_CONFIG": this.getFrequency()},
        ];
    }
    getFrequency() {
        if (this.lse_osc_enable?.endsWith('_OFF')) return 0;
        return this.inputValue;
    }

    getName(){
        return "LSE";
    }
}


function HSEoscillatorInitialise() {
    const fields = loadBlockData("hse", clockUISchema);
    if (!fields) {
        return null;
    }

    return new HSEoscillator(
        fields.inputValue   ?? null,
        fields.onState      ?? null,
        fields.bypassSelect ?? null,
        fields.secureSelect ?? null,
        fields.hseRTCDivSelect ?? null
    );
}

function HSI48oscillatorInitialise() {
    const fields = loadBlockData("hsi48", clockUISchema);
    if (!fields) {
        return null;
    }

    return new HSI48oscillator(fields.fixValue ?? null, fields.onState ?? null);
}

function CSIoscillatorInitialise() {
    const fields = loadBlockData("csi", clockUISchema);
    if (!fields) {
        return null;
    }

    return new CSIoscillator(fields.fixValue ?? null, fields.onState ?? null, fields.runInStopmode ?? null);
}

function HSIoscillatorInitialise() {
    const fields = loadBlockData("hsi", clockUISchema);
    if (!fields) {
        return null;
    }

    return new HSIoscillator(
        fields.fixValue      ?? null,
        fields.onState       ?? null,
        fields.runInStopmode ?? null,
        fields.divider       ?? null
    );
}

function LSIoscillatorInitialise() {
    const fields = loadBlockData("lsi", clockUISchema);
    if (!fields) {
        return null;
    }

    return new LSIoscillator(fields.fixValue ?? null, fields.onState ?? null);
}

function LSEoscillatorInitialise() {
    const fields = loadBlockData("lse", clockUISchema);
    if (!fields) {
        return null;
    }

    return new LSEoscillator(
        fields.fixValue     ?? null,
        fields.onState      ?? null,
        fields.bypassSelect ?? null,
        fields.secureSelect ?? null,
        fields.capSelect    ?? null
    );
}

// Registry maps each oscillator name to its initialiser function
// Keys must match the entries in osc-ui-schema.json
const oscInitialisers = {
    "hse":   () => HSEoscillatorInitialise(),
    "hsi48": () => HSI48oscillatorInitialise(),
    "csi":   () => CSIoscillatorInitialise(),
    "hsi":   () => HSIoscillatorInitialise(),
    "lsi":   () => LSIoscillatorInitialise(),
    "lse":   () => LSEoscillatorInitialise(),
};

class OscillatorManufacture
{
    constructor(varName = "oscillatorCfg") {
        if (OscillatorManufacture.instance) {
            if (varName !== null && varName !== OscillatorManufacture.instance.varName) {
                OscillatorManufacture.instance.varName = varName;
            }
            return OscillatorManufacture.instance;
        }

        // Build supported OSCs from schema keys so the list stays in sync with the schema.
        // If an osc exists in the schema but has no registered initialiser, it is skipped.
        this.supportedOSCs = Object.fromEntries(
            Object.keys(clockUISchema)
                .filter(osc => osc in oscInitialisers)
                .map(osc => [osc, oscInitialisers[osc]])
        );
        this.structName = "stm32_clock_oscillator_cfg_t";
        this.varName = varName;
        this.OSCs = {};

        OscillatorManufacture.instance = this;
    }
    getInforVar()
    {
        return {"varName": this.varName, "struct": this.structName};
    }

    get(osc) {
        if (!(osc in this.OSCs))
        {
            return null;
        }
        return this.OSCs[osc];
    }

    Initialise(osc)
    {
        const initialise = this.supportedOSCs[osc];
        if (!initialise) {
            return null;
        }

        const instance = initialise();
        if (!instance) {
            delete this.OSCs[osc];
            return null;
        }

        this.OSCs[osc] = instance;
        return instance;
    }

    GetCodeData(osc)
    {
        const oscillator = this.get(osc);
        if (!oscillator) {
            return null;
        }

        return oscillator.GetCodeArray();
    }

    GetConfigData(osc)
    {
        const oscillator = this.get(osc);
        if (!oscillator) {
            return null;
        }

        return oscillator.GetConfigArray();
    }
}

const supportedOSCs = ["hse", "hsi", "hsi48", "csi", "lse", "lsi"];

export function OSCInitial()
{
    const OSCblock = new OscillatorManufacture();
    for (const osc of supportedOSCs)
    {
        OSCblock.Initialise(osc);
    }
    return OSCblock;
}

export function InitialiseOSCCodeSections(OSCblock)
{
    const sections = [];

    for (const osc of supportedOSCs)
    {
        const codeData = OSCblock.GetCodeData(osc);
        if (codeData === null) {
            continue;
        }
        appendSection(sections, codeData);
    }
    return sections;
}

export function InitialiseOSCConfigSections(OSCblock)
{
    const sections = [];

    for (const osc of supportedOSCs)
    {
        appendSection(sections, OSCblock.GetConfigData(osc));
    }
    return sections;
}


