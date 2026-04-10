import { getInstance, addSelectorEventListeners, addMoreAvailableEventListener } from '../../../event_handler/event_handler.js';

function UpdateCKContent(id, value)
{
    let refxCK = document.getElementById(id);
    if (refxCK !== null)
    {
        refxCK.textContent = value;
    }
}

function UpdateSrcClockHandle(src)
{
    const pll = getInstance("pll");
    pll.getPllCommon().updateSrc(src);
    return pll;
}

function pllCommonDivHandle(pll)
{
    const pllCommon = pll.getPllCommon();
    const refDivLength = pllCommon.getPrescaler().length;

    for(let refCount = 0; refCount < refDivLength; refCount++)
    {
        const idNum = refCount+1;
        const pllxPrescaler = document.getElementById(`pll${idNum}-prescaler-id`);
        if (pllxPrescaler)
        {
            pllCommon.updateDiv(refCount, pllxPrescaler.value);
            const pllxCommonFreq = pllCommon.getFreqvalue(refCount);
            UpdateCKContent(`ref${idNum}Ck`, pllxCommonFreq);
        }
    }
}

function UpdatePLLConfigProperty(pll, PLLConfigs, pllConfigCount)
{
    const pllCommon = pll.getPllCommon();
    const pllConfig = PLLConfigs[pllConfigCount];
    if (!pllConfig || typeof pllConfig.pllUpdateEnableOnOff !== 'function') {
        return;
    }
    const idNum = pllConfigCount + 1;
    /* PLL enable */
    const pllxEnable = document.getElementById(`pll${idNum}-enable-select`);
    if (!pllxEnable) {
        return;
    }
    pllConfig.pllUpdateEnableOnOff(pllxEnable.value);

    /* PLL ref Freq */
    const Freqpll = pllCommon.getFreqvalue(pllConfigCount);
    pllConfig.pllUpdateRefFreg(Freqpll);

    /* PLL frac enable */
    const pllxFracEnable = document.getElementById(`pll${idNum}-frac-enable-select`);
    if (!pllxFracEnable) {
        return;
    }
    pllConfig.pllUpdateFracEnable(pllxFracEnable.value);

    /* PLL frac value */
    const pllxFracValue = document.getElementById(`pll${idNum}-frac-value-id`);
    if (!pllxFracValue) {
        return;
    }
    pllConfig.pllUpdateFracValue(pllxFracValue.value);

    /* PLL divN */
    const pllxDivN = document.getElementById(`pll${idNum}-divn-id`);
    if (!pllxDivN) {
        return;
    }
    pllConfig.pllUpdateDivN(pllxDivN.value);

    /* PLL divP enable */
    const pllxDivPEnable = document.getElementById(`pll${idNum}-divp-enable-select`);
    if (!pllxDivPEnable) {
        return;
    }
    pllConfig.pllUpdateDivPEnable(pllxDivPEnable.value);

    /* PLL divP */
    const pllxDivP = document.getElementById(`pll${idNum}-divp-id`);
    if (!pllxDivP) {
        return;
    }
    pllConfig.pllUpdateDivP(pllxDivP.value);

    /* PLL divQ enable */
    const pllxDivQEnable = document.getElementById(`pll${idNum}-divq-enable-select`);
    if (!pllxDivQEnable) {
        return;
    }
    pllConfig.pllUpdateDivQEnable(pllxDivQEnable.value);

    /* PLL divQ */
    const pllxDivQ = document.getElementById(`pll${idNum}-divq-id`);
    if (!pllxDivQ) {
        return;
    }
    pllConfig.pllUpdateDivQ(pllxDivQ.value);

    /* PLL divR enable */
    const pllxDivREnable = document.getElementById(`pll${idNum}-divr-enable-select`);
    if (!pllxDivREnable) {
        return;
    }
    pllConfig.pllUpdateDivREnable(pllxDivREnable.value);

    /* PLL divR */
    const pllxDivR = document.getElementById(`pll${idNum}-divr-id`);
    if (!pllxDivR) {
        return;
    }
    pllConfig.pllUpdateDivR(pllxDivR.value);
}

function updatePLLCommonFrequency(event)
{

    const pllsrc = document.getElementById("pll-src-select");
    if (!pllsrc) {
        return;
    }

    const handleSrcClk = {
        "PLLCLK_SELECT_SRC_NO_CLK": "noclock",
        "PLLCLK_SELECT_SRC_HSI": "hsi",
        "PLLCLK_SELECT_SRC_CSI": "csi",
        "PLLCLK_SELECT_SRC_HSE": "hse"
    }

    const pll = UpdateSrcClockHandle(handleSrcClk[pllsrc.value]);
    pllCommonDivHandle(pll);
}

function updatePLLConfigFrequency(event)
{
    const pll = getInstance("pll");
    const PLLConfigs = pll.getPllConfigs();

    for (let pllConfigCount = 0; pllConfigCount < PLLConfigs.length; pllConfigCount++)
    {
        const pllConfig = PLLConfigs[pllConfigCount];
        if (!pllConfig || typeof pllConfig.pllGetPck !== 'function') {
            continue;
        }

        const idNum = pllConfigCount + 1;
        UpdatePLLConfigProperty(pll, PLLConfigs, pllConfigCount);
        const pCK = pllConfig.pllGetPck();
        const qCK = pllConfig.pllGetQck();
        const rCK = pllConfig.pllGetRck();
        UpdateCKContent(`pll${idNum}-p-value`, pCK);
        UpdateCKContent(`pll${idNum}-q-value`, qCK);
        UpdateCKContent(`pll${idNum}-r-value`, rCK);
    }
}

function updatePLLFrequency(event)
{
    const pllPipline = [updatePLLCommonFrequency, updatePLLConfigFrequency];

    for (const pip of pllPipline)
    {
        pip(event);
    }
}

function pllCommonEventProcess()
{
    addSelectorEventListeners("pll", "pll-src-select", 
        (event)=>updatePLLFrequency(event), "pllSrcChange");
    addSelectorEventListeners("pll", "pll1-prescaler-id", 
        (event)=>updatePLLFrequency(event), "pllDivChange");
    addSelectorEventListeners("pll", "pll2-prescaler-id", 
        (event)=>updatePLLFrequency(event), "pllDivChange");
    addSelectorEventListeners("pll", "pll3-prescaler-id", 
        (event)=>updatePLLFrequency(event), "pllDivChange");

    addMoreAvailableEventListener("hsi", (event)=>updatePLLFrequency(event), "pllSrcChange");
    addMoreAvailableEventListener("hse", (event)=>updatePLLFrequency(event), "pllSrcChange");
    addMoreAvailableEventListener("csi", (event)=>updatePLLFrequency(event), "pllSrcChange");
}

function pllConfigEventProcess()
{
    const pllCount = getInstance("pll").getPllConfigs().length;
    const pllConfigIds = (n) => [
        `pll${n}-enable-select`,
        `pll${n}-frac-enable-select`,
        `pll${n}-frac-value-id`,
        `pll${n}-divn-id`,
        `pll${n}-divp-enable-select`,
        `pll${n}-divp-id`,
        `pll${n}-divq-enable-select`,
        `pll${n}-divq-id`,
        `pll${n}-divr-enable-select`,
        `pll${n}-divr-id`,
    ];

    for (let n = 1; n <= pllCount; n++)
    {
        for (const id of pllConfigIds(n))
        {
            addSelectorEventListeners("pll", id,
                (event) => updatePLLFrequency(event), "pllConfigChange");
        }
    }
}

export function pllEventInitialise() {
    pllCommonEventProcess();
    pllConfigEventProcess();
}