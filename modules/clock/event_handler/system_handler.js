import { getInstance, addSelectorEventListeners, addMoreAvailableEventListener, addCheckboxGroupEventListeners } from '../../../event_handler/event_handler.js';

function gatherCheckboxFields(idPrefixes)
{
    const fields = {};
    for (const prefix of idPrefixes) {
        document.querySelectorAll(`input[type="checkbox"][id^="${prefix}"]`).forEach(cb => {
            const key = cb.id.replace(/-([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
            fields[key] = cb.checked ? cb.value : null;
        });
    }
    return fields;
}

function updateHzDisplaybyID(id, hz)
{
    const el = document.getElementById(id);
    if (el !== null) {
        el.textContent = hz;
    }
}

function getSysclkSourceFrequency(srcValue)
{
    const srcMap = {
        'SYSCLK_SELECT_SRC_HSI':   'hsi',
        'SYSCLK_SELECT_SRC_CSI':   'csi',
        'SYSCLK_SELECT_SRC_HSE':   'hse',
        'SYSCLK_SELECT_SRC_PLL1_P':  'pll1',
    };

    const srcName = srcMap[srcValue];
    if (!srcName) return 0;

    if (srcName === 'pll1') {
        const pll = getInstance('pll');
        if (!pll) return 0;
        const pllConfigs = pll.getPllConfigs();
        return pllConfigs?.[0]?.pllGetPck() ?? 0;
    }

    const osc = getInstance('osc');
    if (!osc) return 0;
    const oscSrc = osc.get(srcName);
    return oscSrc?.getFrequency() ?? 0;
}

function updateSystemClock()
{
    const srcEl = document.getElementById('sysclk-src-select');
    if (!srcEl) return;

    const hz = getSysclkSourceFrequency(srcEl.value);

    const system = getInstance('system')?.getSystemClock() ?? null;
    if (!system) return;
    system.updateSysclkHz(hz);
    system.updateSysclkSrc(srcEl.value);

    updateHzDisplaybyID('sysclk-src-ck', hz);

    const domainPrediv = document.getElementById('domains-prediv-select')
    if (!domainPrediv) return;
    system.updateDomainsPrediv(domainPrediv.value);

    updateHzDisplaybyID('domains-prediv-ck', system.getDomainPredivHz());

    const domainAhbPrediv = document.getElementById('domains-ahb-prediv-select')
    if (!domainAhbPrediv) return;
    system.updateDomainsAhbPrediv(domainAhbPrediv.value);

    updateHzDisplaybyID('domains-ahb-prediv-ck', system.getAHBPredivHz());
}

function updateDomain1Clock()
{
    const system = getInstance('system')?.getSystemClock() ?? null;
    if (!system) return;

    const d1 = system.getDomainConfig(0);
    if (!d1) return;

    const pclk3DivSelect = document.getElementById('d1-pclk3-div-select');
    if (pclk3DivSelect) d1.updatePclk3Div(pclk3DivSelect.value);

    const perCkSrcSelect = document.getElementById('d1-per-ck-src-select');
    if (perCkSrcSelect) d1.updatePerCkSrc(perCkSrcSelect.value);

    const sdmmcKerSelect = document.getElementById('d1-sdmmc-ker-select');
    if (sdmmcKerSelect) d1.updateSdmmcKerSrc(sdmmcKerSelect.value);

    const qspiKerSelect = document.getElementById('d1-qspi-ker-select');
    if (qspiKerSelect) d1.updateQuadspiKerSrc(qspiKerSelect.value);

    const fmcKerSelect = document.getElementById('d1-fmc-ker-select');
    if (fmcKerSelect) d1.updateFmcKerSrc(fmcKerSelect.value);

    const d1Fields = gatherCheckboxFields(['d1-ahb3', 'd1-apb3']);
    d1.updateAhb3Modules(d1Fields);
    d1.updateApb3Modules(d1Fields);

    updateHzDisplaybyID('cpu-ck',                 system.getCpuHz());
    updateHzDisplaybyID('cpu-systick-ck',         system.getCpuSystickHz());
    updateHzDisplaybyID('axi-peripheral-ck',      system.getAXIHz());
    updateHzDisplaybyID('ahb3-peripheral-ck',     system.getHclk3Hz());
    updateHzDisplaybyID('d1-pclk3-div-select-ck', system.getPclk3Hz());
}

function updateSystemSysclkHz()
{
    updateSystemClock();
    updateDomain1Clock();
    updateDomain2Clock();
    updateDomain3Clock();
}

function updateDomain2Clock()
{
    const system = getInstance('system')?.getSystemClock() ?? null;
    if (!system) return;

    const d2 = system.getDomainConfig(1);
    if (!d2) return;

    const pclk1DivSelect = document.getElementById('d2-pclk1-div-select');
    if (pclk1DivSelect) d2.updatePclk1Div(pclk1DivSelect.value);

    const pclk2DivSelect = document.getElementById('d2-pclk2-div-select');
    if (pclk2DivSelect) d2.updatePclk2Div(pclk2DivSelect.value);

    const timersTypeSelect = document.getElementById('d2-timers-type-select');
    if (timersTypeSelect) d2.updateAlltimersPclkxType(timersTypeSelect.value);

    const hrtimerSrcSelect = document.getElementById('d2-hrtimer-src-select');
    if (hrtimerSrcSelect) d2.updateHrtimerSelectSrc(hrtimerSrcSelect.value);

    const sai1DfsdmKerSelect = document.getElementById('d2-sai1-dfsdm-ker-select');
    if (sai1DfsdmKerSelect) d2.updateSai1DfsdmKerSrc(sai1DfsdmKerSelect.value);

    const sai23KerSelect = document.getElementById('d2-sai23-ker-select');
    if (sai23KerSelect) d2.updateSai23KerSrc(sai23KerSelect.value);

    const spi123KerSelect = document.getElementById('d2-spi123-ker-select');
    if (spi123KerSelect) d2.updateSpi123KerSrc(spi123KerSelect.value);

    const spi45KerSelect = document.getElementById('d2-spi45-ker-select');
    if (spi45KerSelect) d2.updateSpi45KerSrc(spi45KerSelect.value);

    const spdifrxKerSelect = document.getElementById('d2-spdifrx-ker-select');
    if (spdifrxKerSelect) d2.updateSpdifrxKerSrc(spdifrxKerSelect.value);

    const dfsdm1KerSelect = document.getElementById('d2-dfsdm1-ker-select');
    if (dfsdm1KerSelect) d2.updateDfsdm1KerSrc(dfsdm1KerSelect.value);

    const fdcanKerSelect = document.getElementById('d2-fdcan-ker-select');
    if (fdcanKerSelect) d2.updateFdcanselKerSrc(fdcanKerSelect.value);

    const swpmiKerSelect = document.getElementById('d2-swpmi-ker-select');
    if (swpmiKerSelect) d2.updateSwpselKerSrc(swpmiKerSelect.value);

    const usart234578KerSelect = document.getElementById('d2-usart234578-ker-select');
    if (usart234578KerSelect) d2.updateUsart234578KerSrc(usart234578KerSelect.value);

    const usart16KerSelect = document.getElementById('d2-usart16-ker-select');
    if (usart16KerSelect) d2.updateUsart16KerSrc(usart16KerSelect.value);

    const rngKerSelect = document.getElementById('d2-rng-ker-select');
    if (rngKerSelect) d2.updateRngKerSrc(rngKerSelect.value);

    const i2c123KerSelect = document.getElementById('d2-i2c123-ker-select');
    if (i2c123KerSelect) d2.updateI2c123KerSrc(i2c123KerSelect.value);

    const usbotg12KerSelect = document.getElementById('d2-usbotg12-ker-select');
    if (usbotg12KerSelect) d2.updateUsbotg12KerSrc(usbotg12KerSelect.value);

    const hdmicecKerSelect = document.getElementById('d2-hdmicec-ker-select');
    if (hdmicecKerSelect) d2.updateHdmicecKerSrc(hdmicecKerSelect.value);

    const lptim1KerSelect = document.getElementById('d2-lptim1-ker-select');
    if (lptim1KerSelect) d2.updateLptim1KerSrc(lptim1KerSelect.value);

    const d2Fields = gatherCheckboxFields(['d2-ahb1', 'd2-ahb2', 'd2-apb1l', 'd2-apb1h', 'd2-apb2']);
    d2.updateAhb1Modules(d2Fields);
    d2.updateAhb2Modules(d2Fields);
    d2.updateApb1lModules(d2Fields);
    d2.updateApb1hModules(d2Fields);
    d2.updateApb2Modules(d2Fields);

    updateHzDisplaybyID('hclk1-hclk2-ck',         system.getHclkHz());
    updateHzDisplaybyID('d2-pclk1-div-select-ck',  system.getPclk1Hz());
    updateHzDisplaybyID('d2-pclk2-div-select-ck',  system.getPclk2Hz());
    updateHzDisplaybyID('d2-timerx-type-select-ck', system.getTimerxHz());
    updateHzDisplaybyID('d2-timery-type-select-ck', system.getTimeryHz());
}

function updateDomain3Clock()
{
    const system = getInstance('system')?.getSystemClock() ?? null;
    if (!system) return;

    const d3 = system.getDomainConfig(2);
    if (!d3) return;

    const pclk4DivSelect = document.getElementById('d3-pclk4-div-select');
    if (pclk4DivSelect) d3.updatePclk4Div(pclk4DivSelect.value);

    const lpuart1KerSelect = document.getElementById('d3-lpuart1-ker-select');
    if (lpuart1KerSelect) d3.updateLpuart1KerSrc(lpuart1KerSelect.value);

    const i2c4KerSelect = document.getElementById('d3-i2c4-ker-select');
    if (i2c4KerSelect) d3.updateI2c4KerSrc(i2c4KerSelect.value);

    const lptim2KerSelect = document.getElementById('d3-lptim2-ker-select');
    if (lptim2KerSelect) d3.updateLptim2KerSrc(lptim2KerSelect.value);

    const lptim345KerSelect = document.getElementById('d3-lptim345-ker-select');
    if (lptim345KerSelect) d3.updateLptim345KerSrc(lptim345KerSelect.value);

    const adcKerSelect = document.getElementById('d3-adc-ker-select');
    if (adcKerSelect) d3.updateAdcKerSrc(adcKerSelect.value);

    const sai4aKerSelect = document.getElementById('d3-sai4a-ker-select');
    if (sai4aKerSelect) d3.updateSai4aKerSrc(sai4aKerSelect.value);

    const sai4bKerSelect = document.getElementById('d3-sai4b-ker-select');
    if (sai4bKerSelect) d3.updateSai4bKerSrc(sai4bKerSelect.value);

    const spi6KerSelect = document.getElementById('d3-spi6-ker-select');
    if (spi6KerSelect) d3.updateSpi6KerSrc(spi6KerSelect.value);

    const d3Fields = gatherCheckboxFields(['d3-ahb4', 'd3-apb4']);
    d3.updateAhb4Modules(d3Fields);
    d3.updateApb4Modules(d3Fields);

    updateHzDisplaybyID('hclk4-ck',               system.getHclk4Hz());
    updateHzDisplaybyID('d3-pclk4-div-select-ck', system.getPclk4Hz());
}

function systemEventRegister()
{
    addSelectorEventListeners('system', 'sysclk-src-select',
        (event) => updateSystemSysclkHz(event), 'systemSysclkSrcChange');

    addSelectorEventListeners('system', 'domains-prediv-select',
        (event) => updateSystemSysclkHz(event), 'systemSysclkSrcChange');

    addSelectorEventListeners('system', 'domains-ahb-prediv-select',
        (event) => updateSystemSysclkHz(event), 'systemSysclkSrcChange');

    addMoreAvailableEventListener('hsi',  () => updateSystemSysclkHz(), 'systemSysclkSrcChange');
    addMoreAvailableEventListener('hse',  () => updateSystemSysclkHz(), 'systemSysclkSrcChange');
    addMoreAvailableEventListener('csi',  () => updateSystemSysclkHz(), 'systemSysclkSrcChange');
    addMoreAvailableEventListener('pll',  () => updateSystemSysclkHz(), 'systemSysclkSrcChange');
}

function systemDomain1EventRegister()
{
    addSelectorEventListeners('system', 'd1-pclk3-div-select',
        (event) => updateDomain1Clock(event), 'systemDomain1PClk3Change');

    addSelectorEventListeners('system', 'd1-per-ck-src-select',
        (event) => updateDomain1Clock(event), 'systemDomain1PerCkSrcChange');

    addSelectorEventListeners('system', 'd1-sdmmc-ker-select',
        (event) => updateDomain1Clock(event), 'systemDomain1SdmmcKerChange');

    addSelectorEventListeners('system', 'd1-qspi-ker-select',
        (event) => updateDomain1Clock(event), 'systemDomain1QspiKerChange');

    addSelectorEventListeners('system', 'd1-fmc-ker-select',
        (event) => updateDomain1Clock(event), 'systemDomain1FmcKerChange');

    addCheckboxGroupEventListeners('system', 'd1-ahb3',
        (event) => updateDomain1Clock(event), 'systemDomain1Ahb3ModuleChange');

    addCheckboxGroupEventListeners('system', 'd1-apb3',
        (event) => updateDomain1Clock(event), 'systemDomain1Apb3ModuleChange');
}

function systemDomain2EventRegister()
{
    addSelectorEventListeners('system', 'd2-pclk1-div-select',
        (event) => updateDomain2Clock(event), 'systemDomain2Pclk1Change');

    addSelectorEventListeners('system', 'd2-pclk2-div-select',
        (event) => updateDomain2Clock(event), 'systemDomain2Pclk2Change');

    addSelectorEventListeners('system', 'd2-timers-type-select',
        (event) => updateDomain2Clock(event), 'systemDomain2TimersTypeChange');

    addSelectorEventListeners('system', 'd2-hrtimer-src-select',
        (event) => updateDomain2Clock(event), 'systemDomain2HrtimerSrcChange');

    addSelectorEventListeners('system', 'd2-sai1-dfsdm-ker-select',
        (event) => updateDomain2Clock(event), 'systemDomain2Sai1DfsdmKerChange');

    addSelectorEventListeners('system', 'd2-sai23-ker-select',
        (event) => updateDomain2Clock(event), 'systemDomain2Sai23KerChange');

    addSelectorEventListeners('system', 'd2-spi123-ker-select',
        (event) => updateDomain2Clock(event), 'systemDomain2Spi123KerChange');

    addSelectorEventListeners('system', 'd2-spi45-ker-select',
        (event) => updateDomain2Clock(event), 'systemDomain2Spi45KerChange');

    addSelectorEventListeners('system', 'd2-spdifrx-ker-select',
        (event) => updateDomain2Clock(event), 'systemDomain2SpdifrxKerChange');

    addSelectorEventListeners('system', 'd2-dfsdm1-ker-select',
        (event) => updateDomain2Clock(event), 'systemDomain2Dfsdm1KerChange');

    addSelectorEventListeners('system', 'd2-fdcan-ker-select',
        (event) => updateDomain2Clock(event), 'systemDomain2FdcanKerChange');

    addSelectorEventListeners('system', 'd2-swpmi-ker-select',
        (event) => updateDomain2Clock(event), 'systemDomain2SwpmiKerChange');

    addSelectorEventListeners('system', 'd2-usart234578-ker-select',
        (event) => updateDomain2Clock(event), 'systemDomain2Usart234578KerChange');

    addSelectorEventListeners('system', 'd2-usart16-ker-select',
        (event) => updateDomain2Clock(event), 'systemDomain2Usart16KerChange');

    addSelectorEventListeners('system', 'd2-rng-ker-select',
        (event) => updateDomain2Clock(event), 'systemDomain2RngKerChange');

    addSelectorEventListeners('system', 'd2-i2c123-ker-select',
        (event) => updateDomain2Clock(event), 'systemDomain2I2c123KerChange');

    addSelectorEventListeners('system', 'd2-usbotg12-ker-select',
        (event) => updateDomain2Clock(event), 'systemDomain2Usbotg12KerChange');

    addSelectorEventListeners('system', 'd2-hdmicec-ker-select',
        (event) => updateDomain2Clock(event), 'systemDomain2HdmicecKerChange');

    addSelectorEventListeners('system', 'd2-lptim1-ker-select',
        (event) => updateDomain2Clock(event), 'systemDomain2Lptim1KerChange');

    addCheckboxGroupEventListeners('system', 'd2-ahb1',
        (event) => updateDomain2Clock(event), 'systemDomain2Ahb1ModuleChange');

    addCheckboxGroupEventListeners('system', 'd2-ahb2',
        (event) => updateDomain2Clock(event), 'systemDomain2Ahb2ModuleChange');

    addCheckboxGroupEventListeners('system', 'd2-apb1l',
        (event) => updateDomain2Clock(event), 'systemDomain2Apb1lModuleChange');

    addCheckboxGroupEventListeners('system', 'd2-apb1h',
        (event) => updateDomain2Clock(event), 'systemDomain2Apb1hModuleChange');

    addCheckboxGroupEventListeners('system', 'd2-apb2',
        (event) => updateDomain2Clock(event), 'systemDomain2Apb2ModuleChange');
}

function systemDomain3EventRegister()
{
    addSelectorEventListeners('system', 'd3-pclk4-div-select',
        (event) => updateDomain3Clock(event), 'systemDomain3Pclk4Change');

    addSelectorEventListeners('system', 'd3-lpuart1-ker-select',
        (event) => updateDomain3Clock(event), 'systemDomain3Lpuart1KerChange');

    addSelectorEventListeners('system', 'd3-i2c4-ker-select',
        (event) => updateDomain3Clock(event), 'systemDomain3I2c4KerChange');

    addSelectorEventListeners('system', 'd3-lptim2-ker-select',
        (event) => updateDomain3Clock(event), 'systemDomain3Lptim2KerChange');

    addSelectorEventListeners('system', 'd3-lptim345-ker-select',
        (event) => updateDomain3Clock(event), 'systemDomain3Lptim345KerChange');

    addSelectorEventListeners('system', 'd3-adc-ker-select',
        (event) => updateDomain3Clock(event), 'systemDomain3AdcKerChange');

    addSelectorEventListeners('system', 'd3-sai4a-ker-select',
        (event) => updateDomain3Clock(event), 'systemDomain3Sai4aKerChange');

    addSelectorEventListeners('system', 'd3-sai4b-ker-select',
        (event) => updateDomain3Clock(event), 'systemDomain3Sai4bKerChange');

    addSelectorEventListeners('system', 'd3-spi6-ker-select',
        (event) => updateDomain3Clock(event), 'systemDomain3Spi6KerChange');

    addCheckboxGroupEventListeners('system', 'd3-ahb4',
        (event) => updateDomain3Clock(event), 'systemDomain3Ahb4ModuleChange');

    addCheckboxGroupEventListeners('system', 'd3-apb4',
        (event) => updateDomain3Clock(event), 'systemDomain3Apb4ModuleChange');
}

function systemEventProcess()
{
    systemEventRegister();
    systemDomain1EventRegister();
    systemDomain2EventRegister();
    systemDomain3EventRegister();
}

export function systemEventInitialise()
{
    systemEventProcess();
}
