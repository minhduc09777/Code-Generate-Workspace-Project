import { loadBlockData } from '../../utils/utils.js';
import clockUISchema from './data/ui-schema_default.json' with { type: 'json' };

/* Maps clockManage block name -> stm32_clock_cfg_t field name */
const BLOCK_POINTER_MAP = [
    { block: "osc",         field: "p_clock_oscillator_cfg" },
    { block: "pll",         field: "p_pll_cfg"              },
    { block: "system",      field: "p_system_cfg"           },
    { block: "clockoutput", field: "p_clockout_cfg"         },
    { block: "rtc",         field: "p_rtc_clk_cfg"         },
];

function getClockCfgSections() {
    return clockUISchema?.clockcfg?.sections ?? {};
}

function readIsrFlags() {
    const block = document.getElementById("clockcfg-block-id");
    if (!block) return [];
    const checked = [...block.querySelectorAll('input[name="clockcfg-isr"]:checked')];
    return checked.map(cb => cb.value);
}

function readClockCfgFields() {
    const sections = getClockCfgSections();
    const fields   = loadBlockData("clockcfg", sections) ?? {};

    return {
        isrPriority: fields.isrPriority ?? "0",
        isrRequest:  fields.isrRequest  ?? "RCC_IRQn",
        callback:    fields.callback    ?? "NULL",
        context:     fields.context     ?? "NULL",
    };
}

/**
 * Generate the top-level stm32_clock_cfg_t code lines.
 * @param {object} clockManage - clockManage instance from clock.js
 * @returns {string[]}
 */
export function generateClockCfgCode(clockManage) {
    const fields = readClockCfgFields();

    const lines = ["/* clock top-level config */"];

    for (const { block, field } of BLOCK_POINTER_MAP) {
        const blockObj = clockManage.getBlock(block);
        if (!blockObj) {
            lines.push(`    .${field} = NULL,`);
            continue;
        }
        const varName = blockObj.getInforVar().varName;
        lines.push(`    .${field} = &${varName},`);
    }

    const isrFlags = readIsrFlags();
    const isrExpr  = isrFlags.length > 0
        ? isrFlags.join(" | ")
        : "STM32_CLOCK_ISR_SELECT_NONE";
    lines.push(`    .clock_isr_select = ${isrExpr},`);
    lines.push(`    .isr_priority     = ${fields.isrPriority},`);
    lines.push(`    .isr_request      = ${fields.isrRequest},`);
    lines.push(`    .p_callback       = ${fields.callback},`);
    lines.push(`    .p_context        = ${fields.context},`);
    lines.push(`    .p_cfg_extend     = NULL,`);

    return lines;
}

export function ClockCfgInitialPage() {
    const sections = getClockCfgSections();
    const meta     = sections["clockcfg"];
    if (!meta || !meta.blockId || !meta.fields) return;

    const block = document.getElementById(meta.blockId);
    if (!block) return;

    for (const [, fieldMeta] of Object.entries(meta.fields)) {
        if (!fieldMeta?.selector) continue;
        const el = block.querySelector(fieldMeta.selector);
        if (!el) continue;

        if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
            el.value = String(fieldMeta.value ?? "");
        }
    }
}
