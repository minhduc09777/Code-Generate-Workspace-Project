import { IoportInitial, InitialiseIoportCodeSections, InitialiseIoportConfigSections } from './component/IoportModule.js';
import { ioportDataInitialPage } from './data/data.js';
import { ioportEventInitialise } from './event_handler/ioport_handler.js';
import { addInstance } from '../../event_handler/event_handler.js';
import { flattenSections } from '../../utils/utils.js';

class ioportManage {
    constructor() {
        if (ioportManage.instance) {
            return ioportManage.instance;
        }

        this.initBlocks = {
            "ioport": () => IoportInitial(),
        };

        this.initCode = {
            "ioport": (blockObj) => InitialiseIoportCodeSections(blockObj),
        };

        this.initConfigcode = {
            "ioport": (blockObj) => InitialiseIoportConfigSections(blockObj),
        };

        this.initBlocksObject = {};
        ioportManage.instance = this;
    }

    initBlock(block) {
        if (!(block in this.initBlocks)) {
            return null;
        }

        this.initBlocksObject[block] = this.initBlocks[block]();
        return this.initBlocksObject[block];
    }

    getBlock(block) {
        if (!(block in this.initBlocks)) {
            return null;
        }
        return this.initBlocksObject[block];
    }

    InitialiseCodeSections(block) {
        if (!(block in this.initBlocks)) {
            return null;
        }
        if (!this.initBlocksObject[block]) {
            return null;
        }
        return this.initCode[block](this.initBlocksObject[block]);
    }

    InitialiseConfigSections(block) {
        if (!(block in this.initBlocks)) {
            return null;
        }
        if (!this.initBlocksObject[block]) {
            return null;
        }

        return this.initConfigcode[block](this.initBlocksObject[block]);
    }
}

function blockIoportGenerateProcess(ioportManageMent, blockName) {

    // Fallback to single-block generation (existing behavior)
    const BlockObj = ioportManageMent.getBlock(blockName);
    if (BlockObj === null) return null;

    // // Check simple generate checkbox before generating code
    // try {
    //     const genEl = document.getElementById('ioport-generate-checkbox');
    //     if (genEl instanceof HTMLInputElement && genEl.type === 'checkbox' && !genEl.checked) {
    //         // Generation disabled by user
    //         return {
    //             code: ["ioport_instance_ctrl_t g_ioport_instance;",
    //                  "ioport_cfg_t g_ioport_cfg {",
    //                  ".pinscfg = NULL",
    //                  "};"
    //                 ]
    //             ,
    //             config: null
    //         };
    //     }
    // } catch (e) {
    //     console.warn('Could not access generate checkbox', e);
    // }

    const sectionCode = ioportManageMent.InitialiseCodeSections(blockName);
    const sectionConfig = ioportManageMent.InitialiseConfigSections(blockName) || [];

    return {
        code: flattenSections(sectionCode, false),
        config: flattenSections(sectionConfig, false),
    };
}


export function ioportModuleGenerateProcess() {
    const header = '#include "stm32_ioport.h"';
    const ioportManageMent = new ioportManage();
    const content = blockIoportGenerateProcess(ioportManageMent, 'ioport');
    if (content === null) return null;
    return {
        header,
        ...content,
    };
}

export function IoportModuleInitialData() {
    const ioportManageMent = new ioportManage();
    // Create HTML elements from schema FIRST, before IoportInitial() tries to read from them
    ioportDataInitialPage();
    const ioportInstance = ioportManageMent.initBlock('ioport');
    addInstance('ioport', ioportInstance);
}

export function IoportModuleInitialEvent() {
    ioportEventInitialise();
}
