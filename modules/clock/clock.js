import { OSCInitial, InitialiseOSCCodeSections, InitialiseOSCConfigSections } from './component/osc.js';
import { PLLInitial, InitialisePLLCodeSections, InitialisePLLConfigSections } from './component/pll.js';
import { SystemInitial, InitialiseSystemCodeSections, InitialiseSystemConfigSections } from './component/system.js';
import { ClockOutputInitial, InitialiseClockOutputCodeSections, InitialiseClockOutputConfigSections } from './component/clockoutput.js';
import { RTCInitial, InitialiseRTCCodeSections, InitialiseRTCConfigSections } from './component/rtc.js';
import { I2SInitial, InitialiseI2SConfigSections } from './component/i2s.js';
import { generateClockCfgCode, ClockCfgInitialPage } from './clockcfg.js';
import { clockDataInitialPage } from './data/data.js';
import {oscEventInitialise} from './event_handler/osc_handler.js';
import {pllEventInitialise} from './event_handler/pll_handler.js';
import {systemEventInitialise} from './event_handler/system_handler.js';
import {clockOutputEventInitialise} from './event_handler/clockoutput_handler.js';
import {rtcEventInitialise} from './event_handler/rtc_handler.js';
import {pipelineGenerate } from '../../utils/pipelineGen.js';
import { addInstance } from '../../event_handler/event_handler.js';


class clockManage {
    constructor()
    {
        if (clockManage.instance) {
            return clockManage.instance;
        }

        this.initBlocks = {
            "osc": ()=>OSCInitial(),
            "pll": ()=>PLLInitial(),
            "system": ()=>SystemInitial(),
            "clockoutput": ()=>ClockOutputInitial(),
            "rtc": ()=>RTCInitial(),
            "i2s": ()=>I2SInitial(),
        }
        this.initCode = {
            "osc": (blockObj)=>InitialiseOSCCodeSections(blockObj),
            "pll": (blockObj)=>InitialisePLLCodeSections(blockObj),
            "system": (blockObj)=>InitialiseSystemCodeSections(blockObj),
            "clockoutput": (blockObj)=>InitialiseClockOutputCodeSections(blockObj),
            "rtc": (blockObj)=>InitialiseRTCCodeSections(blockObj),
            "i2s": ()=>null,
        }
        this.initConfigcode = {
            "osc": (blockObj)=>InitialiseOSCConfigSections(blockObj),
            "pll": (blockObj)=>InitialisePLLConfigSections(blockObj),
            "system": (blockObj)=>InitialiseSystemConfigSections(blockObj),
            "clockoutput": (blockObj)=>InitialiseClockOutputConfigSections(blockObj),
            "rtc": (blockObj)=>InitialiseRTCConfigSections(blockObj),
            "i2s": (blockObj)=>InitialiseI2SConfigSections(blockObj),
        }
        this.initBlocksObject = {
        }

        clockManage.instance = this;
    }

    initBlock(block)
    {
        if (!(block in this.initBlocks))
        {
            return null
        }
        this.initBlocksObject[block] = this.initBlocks[block]();
        return this.initBlocksObject[block];
    }

    getBlock(block)
    {
        if (!(block in this.initBlocks))
        {
            return null;
        }

        return this.initBlocksObject[block];
    }

    InitialiseCodeSections(block){
        if (!(block in this.initBlocks))
        {
            return null;
        }
        if (!this.initBlocksObject[block])
        {
            return null;
        }

        return this.initCode[block](this.initBlocksObject[block]);
    }
    InitialiseConfigSections(block){
        if (!(block in this.initBlocks))
        {
            return null;
        }
        if (!this.initBlocksObject[block])
        {
            return null;
        }

        return this.initConfigcode[block](this.initBlocksObject[block]);
    }
}


function blockClockGenerateProcess(clockManageMent, blockName)
{
    const BlockObj = clockManageMent.getBlock(blockName);
    if (BlockObj === null) return null;

    const inforObj = BlockObj.getInforVar();
    const sectionCode = clockManageMent.InitialiseCodeSections(blockName);
    const sectionConfig = clockManageMent.InitialiseConfigSections(blockName);
    
    const Blockcontent = pipelineGenerate(sectionCode, sectionConfig, inforObj["struct"], inforObj["varName"]);
    return Blockcontent;
}

function mergeBlockContent(...blockContents)
{
    const merged = {
        code: [],
        config: [],
    };

    for (const content of blockContents)
    {
        if (!content) {
            continue;
        }
        if (Array.isArray(content.code)) {
            merged.code.push(...content.code);
        }
        if (Array.isArray(content.config)) {
            merged.config.push(...content.config);
        }
    }

    return merged;
}

export function clockModuleGenerateProcess()
{
    const header = '#include "stm32_clock.h"';

    const clockManageMent = new clockManage();
    clockManageMent.getBlock("osc");
    clockManageMent.getBlock("pll");
    clockManageMent.getBlock("system");
    clockManageMent.getBlock("clockoutput");
    clockManageMent.getBlock("rtc");
    clockManageMent.getBlock("i2s");

    const OSCcontent    = blockClockGenerateProcess(clockManageMent, "osc");
    const PLLcontent    = blockClockGenerateProcess(clockManageMent, "pll");
    const SYSTEMcontent = blockClockGenerateProcess(clockManageMent, "system");
    const CLKOUTcontent = blockClockGenerateProcess(clockManageMent, "clockoutput");
    const RTCcontent    = blockClockGenerateProcess(clockManageMent, "rtc");
    const I2Scontent    = blockClockGenerateProcess(clockManageMent, "i2s");
    const mergedContent = mergeBlockContent(OSCcontent, PLLcontent, SYSTEMcontent, CLKOUTcontent, RTCcontent, I2Scontent);

    /* Append the top-level stm32_clock_cfg_t struct */

    const clockCfgLines = generateClockCfgCode(clockManageMent);
    if (clockCfgLines && clockCfgLines.length > 0) {
        mergedContent.code.push(
            'stm32_clock_cfg_t g_clockCfg = {',
            ...clockCfgLines,
            '};'
        );
    }

    return {
        "header": header,
        ...mergedContent
    }
}

export function ClockModuleInitialData() {
    const select = document.getElementById("hse-rtc-div-select");
    if (!select) {
        return;
    }

    // Prevent duplicate options when this function is called more than once.
    if (select.options.length > 1) {
        return;
    }

    for (let i = 2; i <= 64; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = "\u00f7" + i;
        select.appendChild(option);
    }

    const clockManageMent = new clockManage();
    const oscInstance           = clockManageMent.initBlock("osc");
    const pllInstance           = clockManageMent.initBlock("pll");
    const systemInstance        = clockManageMent.initBlock("system");
    const clockOutputInstance   = clockManageMent.initBlock("clockoutput");
    const rtcInstance           = clockManageMent.initBlock("rtc");
    clockManageMent.initBlock("i2s");
    addInstance("osc", oscInstance);
    addInstance("pll", pllInstance);
    addInstance("system", systemInstance);
    addInstance("clockoutput", clockOutputInstance);
    addInstance("rtc", rtcInstance);

    clockDataInitialPage();
    ClockCfgInitialPage();
}

export function ClockModuleInitialEvent(){
    oscEventInitialise();
    pllEventInitialise();
    systemEventInitialise();
    clockOutputEventInitialise();
    rtcEventInitialise();
}


