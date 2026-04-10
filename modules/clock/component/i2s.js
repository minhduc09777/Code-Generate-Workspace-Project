import { loadBlockData, appendSection } from '../../../utils/utils.js';
import clockUISchema from '../data/ui-schema_default.json' with { type: 'json' };

class i2s_cfg {
    constructor(i2sHz = 0) {
        this.i2s_hz = i2sHz;
    }

    updateHz(hz) {
        this.i2s_hz = hz;
    }

    getHz() {
        return this.i2s_hz;
    }

    getConfigData() {
        return [
            { '#define STM32_CLOCK_I2S_CKIN_FREQ_CONFIG': `${this.i2s_hz}UL` },
        ];
    }
}

class i2s_managment {
    constructor(i2sHz) {
        if (i2s_managment.instance) {
            return i2s_managment.instance;
        }

        this.i2sCfg = new i2s_cfg(i2sHz);

        i2s_managment.instance = this;
    }

    getInforVar() {
        return { varName: null, struct: null };
    }

    getI2sCfg() {
        return this.i2sCfg;
    }

    getConfigData() {
        return this.i2sCfg.getConfigData();
    }
}

function getI2sSections() {
    return clockUISchema?.i2s?.sections ?? {};
}

export function I2SInitial() {
    const sections  = getI2sSections();
    const i2sFields = loadBlockData("i2s", sections) ?? {};

    const i2sHz = parseInt(i2sFields.i2sHz ?? sections.i2s?.fields?.i2sHz?.value ?? 0) || 0;

    return new i2s_managment(i2sHz);
}

export function InitialiseI2SConfigSections(i2sBlock) {
    const sections = [];
    appendSection(sections, i2sBlock.getConfigData());
    return sections;
}
