import { loadBlockData, appendSection } from '../../../utils/utils.js';
import clockUISchema from '../data/ui-schema_default.json' with { type: 'json' };

function withPrefix(value, prefix, fallback) {
	if (value === null || value === undefined || value === '') {
		return fallback;
	}

	return `${prefix}${value}`;
}

function withClockPrefix(value, fallbackSuffix) {
	return withPrefix(value, 'STM32_CLOCK_', `STM32_CLOCK_${fallbackSuffix}`);
}

function withDomainPrefix(value, fallbackSuffix) {
	return withPrefix(value, 'STM32_', `STM32_${fallbackSuffix}`);
}

function buildModuleEnableExpression(fields, keyPrefix, noneSuffix) {
	const selected = Object.entries(fields)
		.filter(([fieldName, value]) => fieldName.startsWith(keyPrefix) && value)
		.map(([, value]) => `STM32_CLOCK_${value}`);

	if (selected.length === 0) {
		return `STM32_CLOCK_${noneSuffix}`;
	}

	return selected.join(' | ');
}

function buildCompoundLiteral(typeName, values, trailingComma) {
	const lines = [`        &(${typeName}){`];

	for (const [fieldName, fieldValue] of Object.entries(values)) {
		lines.push(`            .${fieldName} = ${fieldValue},`);
	}

	lines.push(trailingComma ? '        },' : '        }');
	return lines;
}

function getSystemSections() {
	return clockUISchema?.systemconfig?.sections ?? {};
}

class system_domain1_cfg {
	constructor() {
		this.values = {};
	}

	updateValues(fields = {}) {
		this.values = {
			pclk3_div: withClockPrefix(fields.d1Pclk3DivSelect, 'PCLK3_SELECT_DIV_1'),
			per_ck_src: withClockPrefix(fields.d1PerCkSrcSelect, 'PER_CK_SELECT_SRC_HSI_KER'),
			sdmmc_ker_src: withClockPrefix(fields.d1SdmmcKerSelect, 'SDMMC_KER_SELECT_SRC_PLL1_Q_CK'),
			quadspi_ker_src: withClockPrefix(fields.d1QspiKerSelect, 'SQUADSPI_KER_SELECT_SRC_RCC_HCLK3'),
			fmc_ker_src: withClockPrefix(fields.d1FmcKerSelect, 'FMC_KER_SELECT_SRC_RCC_HCLK3'),
			ahb3_modules_enable: buildModuleEnableExpression(fields, 'd1Ahb3', 'AHB3_MODULE_NONE'),
			apb3_modules_enable: buildModuleEnableExpression(fields, 'd1Apb3', 'APB3_MODULE_NONE'),
		};
	}

	updatePclk3Div(value)      { this.values.pclk3_div      = withClockPrefix(value, 'PCLK3_SELECT_DIV_1'); }
	updatePerCkSrc(value)      { this.values.per_ck_src      = withClockPrefix(value, 'PER_CK_SELECT_SRC_HSI_KER'); }
	updateSdmmcKerSrc(value)   { this.values.sdmmc_ker_src   = withClockPrefix(value, 'SDMMC_KER_SELECT_SRC_PLL1_Q_CK'); }
	updateQuadspiKerSrc(value) { this.values.quadspi_ker_src = withClockPrefix(value, 'SQUADSPI_KER_SELECT_SRC_RCC_HCLK3'); }
	updateFmcKerSrc(value)     { this.values.fmc_ker_src     = withClockPrefix(value, 'FMC_KER_SELECT_SRC_RCC_HCLK3'); }
	updateAhb3Modules(fields)  { this.values.ahb3_modules_enable = buildModuleEnableExpression(fields, 'd1Ahb3', 'AHB3_MODULE_NONE'); }
	updateApb3Modules(fields)  { this.values.apb3_modules_enable = buildModuleEnableExpression(fields, 'd1Apb3', 'APB3_MODULE_NONE'); }

	getPclk3Div()      { return this.values.pclk3_div; }
	getPerCkSrc()      { return this.values.per_ck_src; }
	getSdmmcKerSrc()   { return this.values.sdmmc_ker_src; }
	getQuadspiKerSrc() { return this.values.quadspi_ker_src; }
	getFmcKerSrc()     { return this.values.fmc_ker_src; }

	getCpuSystickHz(freqHz) {
		return freqHz / 8;
	}

	getCpuHz(freqHz) {
		return freqHz;
	}

	getAXIHz(ahbHz) {
		return ahbHz;
	}

	getHclk3Hz(ahbHz) {
		return ahbHz;
	}

	getPclk3Hz(ahbHz) {
		const div = parseInt(this.values.pclk3_div?.split('_').pop()) || 1;
		return ahbHz / div;
	}

	getCodeData(trailingComma = false) {
		return buildCompoundLiteral('stm32_clock_domain1_cfg_t', this.values, trailingComma);
	}
}

class system_domain2_cfg {
	constructor() {
		this.values = {};
	}

	updateValues(fields = {}) {
		this.values = {
			pclk1_div: withClockPrefix(fields.d2Pclk1DivSelect, 'PCLK1_SELECT_DIV_1'),
			pclk2_div: withClockPrefix(fields.d2Pclk2DivSelect, 'PCLK2_SELECT_DIV_1'),
			alltimers_pclkx_type: withClockPrefix(fields.d2TimersTypeSelect, 'TIMERS_KER_PCLKX_TYPE_X2'),
			hrtimer_select_src: withClockPrefix(fields.d2HrtimerSrcSelect, 'HRTIMER_SELECT_SRC_PLCK2'),
			sai1_dfsdm_ker_src: withClockPrefix(fields.d2Sai1DfsdmKerSelect, 'SAI1_DFSDM1_KER_SELECT_SRC_PLL1_Q_CK'),
			sai23_ker_src: withClockPrefix(fields.d2Sai23KerSelect, 'SAI23_KER_SELECT_SRC_PLL1_Q_CK'),
			spi123_ker_src: withClockPrefix(fields.d2Spi123KerSelect, 'SPI123_KER_SELECT_SRC_PLL1_Q_CK'),
			spi45_ker_src: withClockPrefix(fields.d2Spi45KerSelect, 'SPI45_KER_SELECT_SRC_APBCLK'),
			spdifrx_ker_src: withClockPrefix(fields.d2SpdifrxKerSelect, 'SPDIFRX_KER_SELECT_SRC_PLL1_Q_CK'),
			dfsdm1_ker_src: withClockPrefix(fields.d2Dfsdm1KerSelect, 'DFSDM1_KER_SELECT_SRC_RCC_PCLK2'),
			fdcansel_ker_src: withClockPrefix(fields.d2FdcanKerSelect, 'FDCAN_KER_SELECT_SRC_HSE_CK'),
			swpsel_ker_src: withClockPrefix(fields.d2SwpmiKerSelect, 'SWPSEL_KER_SELECT_SRC_PCLK1'),
			usart234578_ker_src: withClockPrefix(fields.d2Usart234578KerSelect, 'USART234578_KER_SELECT_SRC_RCC_PCLK1'),
			usart16_ker_src: withClockPrefix(fields.d2Usart16KerSelect, 'USART16_KER_SELECT_SRC_RCC_PCLK2'),
			rng_ker_src: withClockPrefix(fields.d2RngKerSelect, 'RNG_KER_SELECT_SRC_HSI8_CK'),
			i2c123_ker_src: withClockPrefix(fields.d2I2c123KerSelect, 'I2C123_KER_SELECT_SRC_RCC_PCLK1'),
			usbotg12_ker_src: withClockPrefix(fields.d2Usbotg12KerSelect, 'USBOTG12_KER_SELECT_SRC_DISABLED'),
			hdmicec_ker_src: withClockPrefix(fields.d2HdmicecKerSelect, 'HDMICEC_KER_SELECT_SRC_LSE_CK'),
			lptim1_ker_src: withClockPrefix(fields.d2Lptim1KerSelect, 'LPTIM1_KER_SELECT_SRC_RCC_PCLK1'),
			ahb1_modules_enable: buildModuleEnableExpression(fields, 'd2Ahb1', 'AHB1_MODULE_NONE'),
			ahb2_modules_enable: buildModuleEnableExpression(fields, 'd2Ahb2', 'AHB2_MODULE_NONE'),
			apb1l_modules_enable: buildModuleEnableExpression(fields, 'd2Apb1l', 'APB1L_MODULE_NONE'),
			apb1h_modules_enable: buildModuleEnableExpression(fields, 'd2Apb1h', 'APB1H_MODULE_NONE'),
			apb2_modules_enable: buildModuleEnableExpression(fields, 'd2Apb2', 'APB2_MODULE_NONE'),
		};
	}

	updatePclk1Div(value)           { this.values.pclk1_div           = withClockPrefix(value, 'PCLK1_SELECT_DIV_1'); }
	updatePclk2Div(value)           { this.values.pclk2_div           = withClockPrefix(value, 'PCLK2_SELECT_DIV_1'); }
	updateAlltimersPclkxType(value) { this.values.alltimers_pclkx_type = withClockPrefix(value, 'TIMERS_KER_PCLKX_TYPE_X2'); }
	updateHrtimerSelectSrc(value)   { this.values.hrtimer_select_src  = withClockPrefix(value, 'HRTIMER_SELECT_SRC_PLCK2'); }
	updateSai1DfsdmKerSrc(value)    { this.values.sai1_dfsdm_ker_src  = withClockPrefix(value, 'SAI1_DFSDM1_KER_SELECT_SRC_PLL1_Q_CK'); }
	updateSai23KerSrc(value)        { this.values.sai23_ker_src       = withClockPrefix(value, 'SAI23_KER_SELECT_SRC_PLL1_Q_CK'); }
	updateSpi123KerSrc(value)       { this.values.spi123_ker_src      = withClockPrefix(value, 'SPI123_KER_SELECT_SRC_PLL1_Q_CK'); }
	updateSpi45KerSrc(value)        { this.values.spi45_ker_src       = withClockPrefix(value, 'SPI45_KER_SELECT_SRC_APBCLK'); }
	updateSpdifrxKerSrc(value)      { this.values.spdifrx_ker_src     = withClockPrefix(value, 'SPDIFRX_KER_SELECT_SRC_PLL1_Q_CK'); }
	updateDfsdm1KerSrc(value)       { this.values.dfsdm1_ker_src      = withClockPrefix(value, 'DFSDM1_KER_SELECT_SRC_RCC_PCLK2'); }
	updateFdcanselKerSrc(value)     { this.values.fdcansel_ker_src    = withClockPrefix(value, 'FDCAN_KER_SELECT_SRC_HSE_CK'); }
	updateSwpselKerSrc(value)       { this.values.swpsel_ker_src      = withClockPrefix(value, 'SWPSEL_KER_SELECT_SRC_PCLK1'); }
	updateUsart234578KerSrc(value)  { this.values.usart234578_ker_src = withClockPrefix(value, 'USART234578_KER_SELECT_SRC_RCC_PCLK1'); }
	updateUsart16KerSrc(value)      { this.values.usart16_ker_src     = withClockPrefix(value, 'USART16_KER_SELECT_SRC_RCC_PCLK2'); }
	updateRngKerSrc(value)          { this.values.rng_ker_src         = withClockPrefix(value, 'RNG_KER_SELECT_SRC_HSI8_CK'); }
	updateI2c123KerSrc(value)       { this.values.i2c123_ker_src      = withClockPrefix(value, 'I2C123_KER_SELECT_SRC_RCC_PCLK1'); }
	updateUsbotg12KerSrc(value)     { this.values.usbotg12_ker_src    = withClockPrefix(value, 'USBOTG12_KER_SELECT_SRC_DISABLED'); }
	updateHdmicecKerSrc(value)      { this.values.hdmicec_ker_src     = withClockPrefix(value, 'HDMICEC_KER_SELECT_SRC_LSE_CK'); }
	updateLptim1KerSrc(value)       { this.values.lptim1_ker_src      = withClockPrefix(value, 'LPTIM1_KER_SELECT_SRC_RCC_PCLK1'); }
	updateAhb1Modules(fields)       { this.values.ahb1_modules_enable  = buildModuleEnableExpression(fields, 'd2Ahb1',  'AHB1_MODULE_NONE'); }
	updateAhb2Modules(fields)       { this.values.ahb2_modules_enable  = buildModuleEnableExpression(fields, 'd2Ahb2',  'AHB2_MODULE_NONE'); }
	updateApb1lModules(fields)      { this.values.apb1l_modules_enable = buildModuleEnableExpression(fields, 'd2Apb1l', 'APB1L_MODULE_NONE'); }
	updateApb1hModules(fields)      { this.values.apb1h_modules_enable = buildModuleEnableExpression(fields, 'd2Apb1h', 'APB1H_MODULE_NONE'); }
	updateApb2Modules(fields)       { this.values.apb2_modules_enable  = buildModuleEnableExpression(fields, 'd2Apb2',  'APB2_MODULE_NONE'); }

	getPclk1Div()           { return this.values.pclk1_div; }
	getPclk2Div()           { return this.values.pclk2_div; }
	getAlltimersPclkxType() { return this.values.alltimers_pclkx_type; }
	getHrtimerSelectSrc()   { return this.values.hrtimer_select_src; }
	getSai1DfsdmKerSrc()    { return this.values.sai1_dfsdm_ker_src; }
	getSai23KerSrc()        { return this.values.sai23_ker_src; }
	getSpi123KerSrc()       { return this.values.spi123_ker_src; }
	getSpi45KerSrc()        { return this.values.spi45_ker_src; }
	getSpdifrxKerSrc()      { return this.values.spdifrx_ker_src; }
	getDfsdm1KerSrc()       { return this.values.dfsdm1_ker_src; }
	getFdcanselKerSrc()     { return this.values.fdcansel_ker_src; }
	getSwpselKerSrc()       { return this.values.swpsel_ker_src; }
	getUsart234578KerSrc()  { return this.values.usart234578_ker_src; }
	getUsart16KerSrc()      { return this.values.usart16_ker_src; }
	getRngKerSrc()          { return this.values.rng_ker_src; }
	getI2c123KerSrc()       { return this.values.i2c123_ker_src; }
	getUsbotg12KerSrc()     { return this.values.usbotg12_ker_src; }
	getHdmicecKerSrc()      { return this.values.hdmicec_ker_src; }
	getLptim1KerSrc()       { return this.values.lptim1_ker_src; }

	getCodeData(trailingComma = false) {
		return buildCompoundLiteral('stm32_clock_domain2_cfg_t', this.values, trailingComma);
	}

	getHclkHz(ahbHz) {
		return ahbHz;
	}

	getPclk1Hz(ahbHz) {
		const div = parseInt(this.values.pclk1_div?.split('_').pop()) || 1;
		return ahbHz / div;
	}

	getPclk2Hz(ahbHz) {
		const div = parseInt(this.values.pclk2_div?.split('_').pop()) || 1;
		return ahbHz / div;
	}

	getTimerxHz(ahbHz) {
		const mult = parseInt(this.values.alltimers_pclkx_type?.split('_').pop()?.replace('X', '')) || 2;
		return this.getPclk1Hz(ahbHz) * mult;
	}

	getTimeryHz(ahbHz) {
		const mult = parseInt(this.values.alltimers_pclkx_type?.split('_').pop()?.replace('X', '')) || 2;
		return this.getPclk2Hz(ahbHz) * mult;
	}
}

class system_domain3_cfg {
	constructor() {
		this.values = {};
	}

	updateValues(fields = {}) {
		this.values = {
			pclk4_div: withClockPrefix(fields.d3Pclk4DivSelect, 'PCLK4_SELECT_DIV_1'),
			lpuart1_ker_src: withClockPrefix(fields.d3Lpuart1KerSelect, 'LPUART1_KER_SELECT_SRC_RCC_PCLK4'),
			i2c4_ker_src: withClockPrefix(fields.d3I2c4KerSelect, 'I2C4_KER_SELECT_SRC_RCC_PCLK4'),
			lptim2_ker_src: withClockPrefix(fields.d3Lptim2KerSelect, 'LPTIM2_KER_SELECT_SRC_RCC_PCLK4'),
			lptim345_ker_src: withClockPrefix(fields.d3Lptim345KerSelect, 'LPTIM345_KER_SELECT_SRC_RCC_PCLK4'),
			adc_ker_src: withClockPrefix(fields.d3AdcKerSelect, 'ADC_KER_SELECT_SRC_PLL2_P_CK'),
			sai4a_ker_src: withClockPrefix(fields.d3Sai4aKerSelect, 'SAI4A_KER_SELECT_SRC_PLL1_Q_CK'),
			sai4b_ker_src: withClockPrefix(fields.d3Sai4bKerSelect, 'SAI4B_KER_SELECT_SRC_PLL1_Q_CK'),
			spi6_ker_src: withClockPrefix(fields.d3Spi6KerSelect, 'SPI6_KER_SELECT_SRC_RCC_PCLK4'),
			ahb4_modules_enable: buildModuleEnableExpression(fields, 'd3Ahb4', 'AHB4_MODULE_NONE'),
			apb4_modules_enable: buildModuleEnableExpression(fields, 'd3Apb4', 'APB4_MODULE_NONE'),
		};
	}

	updatePclk4Div(value)      { this.values.pclk4_div      = withClockPrefix(value, 'PCLK4_SELECT_DIV_1'); }
	updateLpuart1KerSrc(value) { this.values.lpuart1_ker_src = withClockPrefix(value, 'LPUART1_KER_SELECT_SRC_RCC_PCLK4'); }
	updateI2c4KerSrc(value)    { this.values.i2c4_ker_src    = withClockPrefix(value, 'I2C4_KER_SELECT_SRC_RCC_PCLK4'); }
	updateLptim2KerSrc(value)  { this.values.lptim2_ker_src  = withClockPrefix(value, 'LPTIM2_KER_SELECT_SRC_RCC_PCLK4'); }
	updateLptim345KerSrc(value){ this.values.lptim345_ker_src = withClockPrefix(value, 'LPTIM345_KER_SELECT_SRC_RCC_PCLK4'); }
	updateAdcKerSrc(value)     { this.values.adc_ker_src     = withClockPrefix(value, 'ADC_KER_SELECT_SRC_PLL2_P_CK'); }
	updateSai4aKerSrc(value)   { this.values.sai4a_ker_src   = withClockPrefix(value, 'SAI4A_KER_SELECT_SRC_PLL1_Q_CK'); }
	updateSai4bKerSrc(value)   { this.values.sai4b_ker_src   = withClockPrefix(value, 'SAI4B_KER_SELECT_SRC_PLL1_Q_CK'); }
	updateSpi6KerSrc(value)    { this.values.spi6_ker_src    = withClockPrefix(value, 'SPI6_KER_SELECT_SRC_RCC_PCLK4'); }
	updateAhb4Modules(fields)  { this.values.ahb4_modules_enable = buildModuleEnableExpression(fields, 'd3Ahb4', 'AHB4_MODULE_NONE'); }
	updateApb4Modules(fields)  { this.values.apb4_modules_enable = buildModuleEnableExpression(fields, 'd3Apb4', 'APB4_MODULE_NONE'); }

	getPclk4Div()       { return this.values.pclk4_div; }
	getLpuart1KerSrc()  { return this.values.lpuart1_ker_src; }
	getI2c4KerSrc()     { return this.values.i2c4_ker_src; }
	getLptim2KerSrc()   { return this.values.lptim2_ker_src; }
	getLptim345KerSrc() { return this.values.lptim345_ker_src; }
	getAdcKerSrc()      { return this.values.adc_ker_src; }
	getSai4aKerSrc()    { return this.values.sai4a_ker_src; }
	getSai4bKerSrc()    { return this.values.sai4b_ker_src; }
	getSpi6KerSrc()     { return this.values.spi6_ker_src; }

	getCodeData(trailingComma = false) {
		return buildCompoundLiteral('stm32_clock_domain3_cfg_t', this.values, trailingComma);
	}

	getHclk4Hz(ahbHz) {
		return ahbHz;
	}

	getPclk4Hz(ahbHz) {
		const div = parseInt(this.values.pclk4_div?.split('_').pop()) || 1;
		return ahbHz / div;
	}
}

class system_clock {
	constructor() {
		this.sysclk_src = null;
		this.sysclk_hz  = 64000000;
		this.domains_select_prediv = null;
		this.domains_ahb_select_prediv = null;
		this.domainConfigs = [];
	}

	updateDomainConfigs(domainConfigs) {
		this.domainConfigs = Array.isArray(domainConfigs) ? domainConfigs : [];
	}

	updateDomainConfig(domainConfig) {
		this.domainConfigs.push(domainConfig);
	}

	getDomainConfig(index) {
		return this.domainConfigs[index] ?? null;
	}


	getSysclkHz()
	{
		return this.sysclk_hz;
	}

	getDomainPredivHz()
	{
		if (this.domains_select_prediv == null)
		{
			return this.sysclk_hz;
		}
		const divArr = this.domains_select_prediv.split("_");
		return this.sysclk_hz / divArr[divArr.length - 1];
	}

	getAHBPredivHz()
	{
		if (this.domains_ahb_select_prediv == null)
		{
			return this.getDomainPredivHz();
		}
		const divArr = this.domains_ahb_select_prediv.split("_");
		return this.getDomainPredivHz() / divArr[divArr.length - 1];
	}

	updateSysclkSrc(sysclk_src) {
		this.sysclk_src = sysclk_src;
	}

	updateSysclkHz(sysclk_hz) {
		this.sysclk_hz = sysclk_hz;
	}

	updateDomainsPrediv(domains_select_prediv) {
		this.domains_select_prediv = domains_select_prediv;
	}

	updateDomainsAhbPrediv(domains_ahb_select_prediv) {
		this.domains_ahb_select_prediv = domains_ahb_select_prediv;
	}


	getCpuSystickHz() {
		return this.domainConfigs[0]?.getCpuSystickHz(this.getDomainPredivHz()) ?? 0;
	}

	getCpuHz() {
		return this.domainConfigs[0]?.getCpuHz(this.getDomainPredivHz()) ?? 0;
	}

	getAXIHz() {
		return this.domainConfigs[0]?.getAXIHz(this.getAHBPredivHz()) ?? 0;
	}

	getHclk3Hz() {
		return this.domainConfigs[0]?.getHclk3Hz(this.getAHBPredivHz()) ?? 0;
	}

	getPclk3Hz() {
		return this.domainConfigs[0]?.getPclk3Hz(this.getAHBPredivHz()) ?? 0;
	}


	getHclkHz() {
		return this.domainConfigs[1]?.getHclkHz(this.getAHBPredivHz()) ?? 0;
	}

	getPclk1Hz() {
		return this.domainConfigs[1]?.getPclk1Hz(this.getAHBPredivHz()) ?? 0;
	}

	getPclk2Hz() {
		return this.domainConfigs[1]?.getPclk2Hz(this.getAHBPredivHz()) ?? 0;
	}

	getTimerxHz() {
		return this.domainConfigs[1]?.getTimerxHz(this.getAHBPredivHz()) ?? 0;
	}

	getTimeryHz() {
		return this.domainConfigs[1]?.getTimeryHz(this.getAHBPredivHz()) ?? 0;
	}

	getHclk4Hz() {
		return this.domainConfigs[2]?.getHclk4Hz(this.getAHBPredivHz()) ?? 0;
	}

	getPclk4Hz() {
		return this.domainConfigs[2]?.getPclk4Hz(this.getAHBPredivHz()) ?? 0;
	}

	getCodeData() {
		const lines = [
			'/* system config */',
			`    .sysclk_src = ${this.sysclk_src},`,
			`    .domains_select_prediv = ${this.domains_select_prediv},`,
			`    .domains_ahb_select_prediv = ${this.domains_ahb_select_prediv},`,
			'    .p_domain_cfg = {',
		];

		this.domainConfigs.forEach((config, index) => {
			const isLast = index === this.domainConfigs.length - 1;
			if (config === null) {
				lines.push(isLast ? '        (void *)0' : '        (void *)0,');
				return;
			}

			lines.push(...config.getCodeData(!isLast));
		});

		lines.push('    }');
		return lines;
	}
}

class system_clock_managment {
	constructor(systemFields = {}, domainFieldsList = []) {
		if (system_clock_managment.instance) {
			return system_clock_managment.instance;
		}

		this.structName = 'stm32_clock_system_cfg_t';
		this.varName = 'g_systemCfg';
		this.systemClock = new system_clock();
		this._applyFields(systemFields, domainFieldsList);

		system_clock_managment.instance = this;
	}

	_applyFields(systemFields, domainFieldsList) {
		if (!(this.systemClock instanceof system_clock)) return;
		this.systemClock.updateSysclkSrc(withClockPrefix(systemFields.sysclkSourceSelect, 'SYSCLK_SELECT_SRC_HSI'));
		this.systemClock.updateSysclkHz(systemFields.sysclkHz ?? 64000000);
		this.systemClock.updateDomainsPrediv(withDomainPrefix(systemFields.domainsPredivSelect, 'DOMAINS_SELECT_PREDIV_1'));
		this.systemClock.updateDomainsAhbPrediv(withDomainPrefix(systemFields.domainsAhbPredivSelect, 'DOMAINS_SELECT_AHB_PREDIV_1'));

		const d1 = new system_domain1_cfg();
		d1.updateValues(domainFieldsList[0]);
		const d2 = new system_domain2_cfg();
		d2.updateValues(domainFieldsList[1]);
		const d3 = new system_domain3_cfg();
		d3.updateValues(domainFieldsList[2]);
		this.systemClock.updateDomainConfigs([d1, d2, d3]);
	}

	getSystemClock(){
		return this.systemClock;
	}

	getInforVar() {
		return { varName: this.varName, struct: this.structName };
	}

	getCodeData() {
		const lines = [];

		if (this.systemClock) {
			lines.push(...this.systemClock.getCodeData());
		}

		return lines;
	}

	getConfigData() {
		if (!this.systemClock) return null;
		return [
			{ '#define STM32_CLOCK_SYSCLK_HZ_CONFIG':       this.systemClock.getSysclkHz() },
			{ '#define STM32_CLOCK_CPU_SYSTICK_HZ_CONFIG':  this.systemClock.getCpuSystickHz() },
			{ '#define STM32_CLOCK_CPU_HZ_CONFIG':           this.systemClock.getCpuHz() },
			{ '#define STM32_CLOCK_AXI_HZ_CONFIG':           this.systemClock.getAXIHz() },
			{ '#define STM32_CLOCK_HCLK3_HZ_CONFIG':         this.systemClock.getHclk3Hz() },
			{ '#define STM32_CLOCK_PCLK3_HZ_CONFIG':         this.systemClock.getPclk3Hz() },
			{ '#define STM32_CLOCK_HCLK_HZ_CONFIG':          this.systemClock.getHclkHz() },
			{ '#define STM32_CLOCK_PCLK1_HZ_CONFIG':        this.systemClock.getPclk1Hz() },
			{ '#define STM32_CLOCK_PCLK2_HZ_CONFIG':        this.systemClock.getPclk2Hz() },
			{ '#define STM32_CLOCK_TIMERX_HZ_CONFIG':       this.systemClock.getTimerxHz() },
			{ '#define STM32_CLOCK_TIMERY_HZ_CONFIG':       this.systemClock.getTimeryHz() },
			{ '#define STM32_CLOCK_HCLK4_HZ_CONFIG':        this.systemClock.getHclk4Hz() },
			{ '#define STM32_CLOCK_PCLK4_HZ_CONFIG':        this.systemClock.getPclk4Hz() },
		];
	}
}

function loadSystemSection(sectionName) {
	return loadBlockData(sectionName, getSystemSections()) ?? {};
}

export function SystemInitial() {
	return new system_clock_managment(
		loadSystemSection('system'),
		[
			loadSystemSection('domain1'),
			loadSystemSection('domain2'),
			loadSystemSection('domain3'),
		]
	);
}

export function InitialiseSystemCodeSections(systemBlock) {
	const sections = [];
	const codeData = systemBlock.getCodeData();

	if (codeData !== null) {
		appendSection(sections, codeData);
	}

	return sections;
}

export function InitialiseSystemConfigSections(systemBlock) {
	const sections = [];
	const configData = systemBlock.getConfigData();

	if (configData !== null) {
		appendSection(sections, configData);
	}

	return sections;
}
