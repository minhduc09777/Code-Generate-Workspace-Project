import { loadBlockData, appendSection } from '../../../utils/utils.js';
import clockUISchema from '../data/ui-schema_default.json' with { type: 'json' };
import { OSCInitial } from './osc.js';

class pll_div{
    constructor(div) {
        this.div = div;
    }

    getValue(frequency) {
        return Math.round((frequency / this.div) * 100) / 100;
    }

    getDiv(){
        return this.div;
    }
    updateDiv(div) {
        this.div = div;
    }
}

class pll_common{
    constructor(srcName, prescaler_numbers = 3)
    {
        if (pll_common.instance) {
            return pll_common.instance;
        }
        this.OSCs = OSCInitial();
        this.src = this.OSCs.get(srcName);
        this.prescaler = [];
        for (let num = 0; num < prescaler_numbers; num++)
        {
            this.prescaler.push(new pll_div(1));
        }

        pll_common.instance = this;
    }

    getFreqvalue(prescaler_num)
    {
        if (prescaler_num >= this.prescaler.length || this.src === null)
        {
            return 0;
        }
        if(this.prescaler[prescaler_num].getDiv() == 0)
        {
            return 0;
        }
        return this.prescaler[prescaler_num].getValue(this.src.getFrequency());
    }

    updateSrc(srcName)
    {
        this.src = this.OSCs.get(srcName);
        return this.src;
    }

    updateDiv(prescaler_num, divValue)
    {
        if (prescaler_num >= this.prescaler.length)
        {
            return null;
        }
        this.prescaler[prescaler_num].updateDiv(divValue);
    }

    getPrescaler()
    {
        return this.prescaler;
    }

    getCodeData()
    {
        const lines = [];
        const sourceName = this.src !== null ? this.src.getName() : "NO_CLK";

        lines.push(`/* pll common config */`);
        lines.push(`    .pllx_src_select = STM32_CLOCK_PLLCLK_SELECT_SRC_${sourceName},`);

        return lines;
    }
}

class pll_config{
    constructor(refFreq = 48000000, 
                pllEnable="PLL_ENABLE_OFF", 
                pllFracEnable="PLL_FRAC_ENABLE_OFF", 
                pllDivPEnable="PLL_DIVP_ENABLE_OFF",
                pllDivQEnable="PLL_DIVQ_ENABLE_OFF", 
                pllDivREnable="PLL_DIVR_ENABLE_OFF",
                pllDivN=4,
                pllDivP=4,
                pllDivQ=4,
                pLLDivR=4,
                pllfrac_value = 0)
    {
        this.refFreq = refFreq;
        this.pllEnable = pllEnable;
        this.pllFracEnable = pllFracEnable;
        this.pllDivPEnable = pllDivPEnable;
        this.pllDivQEnable = pllDivQEnable;
        this.pllDivREnable = pllDivREnable;

        this.pllDivN = pllDivN;
        this.pllDivP = pllDivP;
        this.pllDivQ = pllDivQ;
        this.pllDivR = pLLDivR;
        this.pllfrac_value = pllfrac_value;
        this.vcoCK = this.refFreq * this.pllDivN + this.refFreq * this.pllfrac_value / (2**13);
    }

    pllUpdateEnableOnOff(pllEnable)
    {
        this.pllEnable=pllEnable;
    }

    pllUpdateRefFreg(refFreq)
    {
        this.refFreq = refFreq;
    }

    pllUpdateFracEnable(pllFracEnable)
    {
        this.pllFracEnable = pllFracEnable;
    }

    pllUpdateDivPEnable(pllDivPEnable)
    {
        this.pllDivPEnable = pllDivPEnable;
    }

    pllUpdateDivQEnable(pllDivQEnable)
    {
        this.pllDivQEnable = pllDivQEnable;
    }

    pllUpdateDivREnable(pllDivREnable)
    {
        this.pllDivREnable = pllDivREnable;
    }

    pllUpdateDivN(pllDivN)
    {
        this.pllDivN = pllDivN;
        this.vcoCK = this.refFreq * this.pllDivN + this.refFreq * this.pllfrac_value / (2**13);
    }

    pllUpdateDivP(pllDivP)
    {
        this.pllDivP = pllDivP;
    }

    pllUpdateDivQ(pllDivQ)
    {
        this.pllDivQ = pllDivQ;
    }

    pllUpdateDivR(pllDivR)
    {
        this.pllDivR = pllDivR;
    }

    pllUpdateFracValue(pllfrac_value)
    {
        this.pllfrac_value = pllfrac_value;
        this.vcoCK = this.refFreq * this.pllDivN + this.refFreq * this.pllfrac_value / (2**13);
    }

    pllGetVCOck()
    {
        if (this.pllEnable==="PLL_ENABLE_OFF")
        {
            return 0;
        }
        this.vcoCK = this.refFreq * this.pllDivN + this.refFreq * this.pllfrac_value / (2**13);
        return this.vcoCK;
    }

    pllGetPck()
    {
        if (this.pllDivPEnable==="PLL_DIVP_ENABLE_OFF" || this.pllEnable==="PLL_ENABLE_OFF")
        {
            return 0;
        }
        return Math.round((this.vcoCK / this.pllDivP) * 100) / 100;
    }

    pllGetQck()
    {
        if (this.pllDivQEnable==="PLL_DIVQ_ENABLE_OFF" || this.pllEnable==="PLL_ENABLE_OFF")
        {
            return 0;
        }
        return Math.round((this.vcoCK / this.pllDivQ) * 100) / 100;
    }

    pllGetRck()
    {
        if (this.pllDivREnable==="PLL_DIVR_ENABLE_OFF" || this.pllEnable==="PLL_ENABLE_OFF")
        {
            return 0;
        }
        return Math.round((this.vcoCK / this.pllDivR) * 100) / 100;
    }

    getCodeData(pllIndex, prescaler = 1)
    {
        const pllNum = Number(pllIndex);
        if (!Number.isInteger(pllNum) || pllNum <= 0)
        {
            return null;
        }

        const pllArrayIndex = pllNum - 1;
        const lines = [];

        lines.push(`/* pll${pllIndex} config */`);
        lines.push(`    .pll[${pllArrayIndex}] = {`);
        lines.push(`        .prescaler = ${prescaler},`);
        lines.push(`        .fractional_latch_enable = STM32_CLOCK_${this.pllFracEnable},`);
        lines.push(`        .frac_value = ${this.pllfrac_value},`);
        lines.push(`        .enable = STM32_CLOCK_${this.pllEnable},`);
        lines.push(`        .divp_enable = STM32_CLOCK_${this.pllDivPEnable},`);
        lines.push(`        .divq_enable = STM32_CLOCK_${this.pllDivQEnable},`);
        lines.push(`        .divr_enable = STM32_CLOCK_${this.pllDivREnable},`);
        lines.push(`        .divp = ${this.pllDivP},`);
        lines.push(`        .divq = ${this.pllDivQ},`);
        lines.push(`        .divr = ${this.pllDivR},`);
        lines.push(`        .divn = ${this.pllDivN},`);

        return lines;
    }
    getConfigData(pllIndex)
    {
        const pllNum = Number(pllIndex);
        if (!Number.isInteger(pllNum) || pllNum <= 0)
        {
            return null;
        }

        return [
            {[`#define STM32_CLOCK_PLL${pllNum}_DIVP_FREG_CONFIG`]: this.pllGetPck()},
            {[`#define STM32_CLOCK_PLL${pllNum}_DIVQ_FREG_CONFIG`]: this.pllGetQck()},
            {[`#define STM32_CLOCK_PLL${pllNum}_DIVR_FREG_CONFIG`]: this.pllGetRck()},
        ];
    }
}

class pll_clock_managment
{
    constructor(srcName = "hsi", prescaler_numbers = 3, commonConfig = null, pllConfigs = null)
    {
        if (pll_clock_managment.instance) {
            if (commonConfig !== null) {
                pll_clock_managment.instance.pllCommon = commonConfig;
            }
            if (Array.isArray(pllConfigs)) {
                pll_clock_managment.instance.pllConfig = pllConfigs;
            }
            return pll_clock_managment.instance;
        }

        this.pllCommon = commonConfig ?? new pll_common(srcName, prescaler_numbers);
        this.pllConfig = [];

        if (Array.isArray(pllConfigs)) {
            this.pllConfig = pllConfigs;
        } else {
            const pllCount = Number.isInteger(prescaler_numbers) && prescaler_numbers > 0 ? prescaler_numbers : 3;
            for (let num = 0; num < pllCount; num++)
            {
                this.pllConfig.push(new pll_config());
            }
        }

        pll_clock_managment.instance = this;
    }

    getInforVar()
    {
        return {"varName": "g_pllCfg", "struct": "stm32_clock_pll_cfg_t"};
    }

    getPllCommon()
    {
        return this.pllCommon;
    }

    getPllConfigs()
    {
        return this.pllConfig;
    }

    getPllConfig(pllIndex)
    {
        const index = Number(pllIndex) - 1;
        if (index < 0 || index >= this.pllConfig.length)
        {
            return null;
        }
        return this.pllConfig[index];
    }

    getCodeData()
    {
        const prescalers = this.pllCommon.getPrescaler();

        return [
            ...this.pllCommon.getCodeData(),
            ...this.pllConfig.flatMap((config, index) => {
                const prescaler = prescalers[index]?.getDiv() ?? 1;
                let data = config.getCodeData(index + 1, prescaler) ?? [];

                if ((data !== null) && (index < this.pllConfig.length - 1)){
                    data.push("    },");
                }
                else{
                    data.push("    }");
                }
                return data;
            }),
        ];
    }

    getConfigData(pllIndex = null)
    {
        if (pllIndex === null)
        {
            return this.pllConfig.flatMap((config, index) => config.getConfigData(index + 1) ?? []);
        }

        const config = this.getPllConfig(pllIndex);
        if (config === null)
        {
            return null;
        }

        return config.getConfigData(pllIndex);
    }
}

function parsePllSource(sourceSelect)
{
    const sourceMap = {
        "PLLCLK_SELECT_SRC_HSI": "hsi",
        "PLLCLK_SELECT_SRC_HSE": "hse",
        "PLLCLK_SELECT_SRC_CSI": "csi",
    };

    return sourceMap[sourceSelect] ?? "hsi";
}

function parseNumberOrDefault(value, defaultValue)
{
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : defaultValue;
}

function getPllSectionNames(pllSections)
{
    return Object.keys(pllSections)
        .filter((name) => /^pll\d+$/i.test(name))
        .sort((a, b) => {
            const aNum = Number(a.replace(/\D/g, ""));
            const bNum = Number(b.replace(/\D/g, ""));
            return aNum - bNum;
        });
}

function createPllConfigFromFields(refFreq, fields)
{
    return new pll_config(
        refFreq,
        fields?.enableSelect ?? "PLL_ENABLE_OFF",
        fields?.fracEnableSelect ?? "PLL_FRAC_ENABLE_OFF",
        fields?.divpEnableSelect ?? "PLL_DIVP_ENABLE_OFF",
        fields?.divqEnableSelect ?? "PLL_DIVQ_ENABLE_OFF",
        fields?.divrEnableSelect ?? "PLL_DIVR_ENABLE_OFF",
        parseNumberOrDefault(fields?.divn, 4),
        parseNumberOrDefault(fields?.divp, 4),
        parseNumberOrDefault(fields?.divq, 4),
        parseNumberOrDefault(fields?.divr, 4),
        parseNumberOrDefault(fields?.fracValue, 0)
    );
}

export function PLLInitial()
{
    const pllSections = clockUISchema?.pll?.sections;
    if (!pllSections) {
        return new pll_clock_managment();
    }

    const pllNames = getPllSectionNames(pllSections);
    const pllCount = pllNames.length > 0 ? pllNames.length : 3;

    const commonFields = loadBlockData("common", pllSections) ?? {};
    const srcName = parsePllSource(commonFields.sourceSelect);

    const pllCommon = new pll_common(srcName, pllCount);
    for (let index = 0; index < pllCount; index++)
    {
        const prescalerField = commonFields[`prescalerPll${index + 1}`];
        pllCommon.updateDiv(index, parseNumberOrDefault(prescalerField, 1));
    }

    const pllConfigs = pllNames.map((pllName, index) => {
        const fields = loadBlockData(pllName, pllSections) ?? {};
        const refFreq = pllCommon.getFreqvalue(index);
        return createPllConfigFromFields(refFreq, fields);
    });

    return new pll_clock_managment(srcName, pllCount, pllCommon, pllConfigs);
}

export function InitialisePLLCodeSections(PLLblock)
{
    const sections = [];
    const codeData = PLLblock.getCodeData();

    if (codeData !== null) {
        appendSection(sections, codeData);
    }

    return sections;
}

export function InitialisePLLConfigSections(PLLblock)
{
    const sections = [];

    for (let index = 1; index <= PLLblock.getPllConfigs().length; index++)
    {
        appendSection(sections, PLLblock.getConfigData(index));
    }

    return sections;
}

