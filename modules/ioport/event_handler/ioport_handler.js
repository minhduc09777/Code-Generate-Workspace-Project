import { getInstance, addSelectorEventListeners } from '../../../event_handler/event_handler.js';
import ioportUISchema from '../data/ui-schema_default.json' with { type: 'json' };

/**
 * Get element value by ID
 * Handles checkbox, select, and input elements
 */
function getElementValueById(id) {
    const element = document.getElementById(id);
    if (!element) {
        return null;
    }

    if (element instanceof HTMLInputElement) {
        if (element.type === 'checkbox') {
            return element.checked;
        }
        return element.value;
    }

    if (element instanceof HTMLSelectElement) {
        return element.value;
    }

    return element.textContent;
}

/**
 * Update a single pin's configuration in the IoportModule
 */
function updatePinConfiguration(portName, pinNum, modeId, pullId, otypeId, speedId, alternateId, generateId) {
    const ioportModule = getInstance('ioport');
    if (!ioportModule) {
        return;
    }

    const pinscfg = {
        mode: getElementValueById(modeId),
        pull: getElementValueById(pullId),
        otype: getElementValueById(otypeId),
        speed: getElementValueById(speedId),
        alternate: getElementValueById(alternateId),
        isGen: getElementValueById(generateId),
    };

    try {
        ioportModule.updatePin(portName, pinNum, pinscfg);
    } catch (e) {
        console.warn(`Failed to update pin ${portName}[${pinNum}]:`, e.message);
    }
}

/**
 * Register event listeners for a single pin's configuration selectors
 */
function EventRegister(portName, pinNum, modeId, pullId, otypeId, speedId, alternateId, generateId) {
    const updateHandler = () => updatePinConfiguration(portName, pinNum, modeId, pullId, otypeId, speedId, alternateId, generateId);

    // Register listeners for each selector
    addSelectorEventListeners(`ioport-pin-${portName}-${pinNum}`, modeId, updateHandler, 'ioportPinModeChange');
    addSelectorEventListeners(`ioport-pin-${portName}-${pinNum}`, pullId, updateHandler, 'ioportPinPullChange');
    addSelectorEventListeners(`ioport-pin-${portName}-${pinNum}`, otypeId, updateHandler, 'ioportPinOtypeChange');
    addSelectorEventListeners(`ioport-pin-${portName}-${pinNum}`, speedId, updateHandler, 'ioportPinSpeedChange');
    addSelectorEventListeners(`ioport-pin-${portName}-${pinNum}`, alternateId, updateHandler, 'ioportPinAlternateChange');

    // Register listener for generate checkbox
    const generateEl = document.getElementById(generateId);
    if (generateEl instanceof HTMLInputElement && generateEl.type === 'checkbox') {
        generateEl.addEventListener('change', updateHandler);
    }
}

/**
 * Initialize all ioport event listeners based on the UI schema
 */
export function ioportEventInitialise() {
    const schema = ioportUISchema?.ioport;
    if (!schema || !schema.fields) {
        return;
    }

    // Iterate through all ports (portA, portB, etc.)
    for (const [portKey, portSchema] of Object.entries(schema.fields)) {
        // Skip non-port fields
        if (portKey === 'generate' || !portSchema.pins) {
            if (portKey === 'generate')
            {
                    // Register listener for generate checkbox
                const generatePortConfId = portSchema.selector?.replace(/^#/, '');
                const generateEl = document.getElementById(generatePortConfId);
                if (generateEl instanceof HTMLInputElement && generateEl.type === 'checkbox') {
                    generateEl.addEventListener('change', ()=>{
                        const ioportModule = getInstance('ioport');
                        ioportModule.UpdatePortConfigGenerate(getElementValueById(generatePortConfId));
                    });
                }

            }

            continue;
        }

        // Extract port letter (portA -> A, portB -> B, etc.)
        // const portName = portKey.charAt(0).toUpperCase() + portKey.slice(1);
         const portName = portKey;

        // Iterate through pins in this port
        for (const [pinIndex, pinSchema] of Object.entries(portSchema.pins)) {
            const pinNum = pinSchema.pinnum?.value ?? pinIndex;

            // Extract selector IDs from schema
            const modeId = pinSchema.mode?.selector?.replace(/^#/, '');
            const pullId = pinSchema.pull?.selector?.replace(/^#/, '');
            const otypeId = pinSchema.otype?.selector?.replace(/^#/, '');
            const speedId = pinSchema.speed?.selector?.replace(/^#/, '');
            const alternateId = pinSchema.alternate?.selector?.replace(/^#/, '');
            const generateId = pinSchema.generate?.selector?.replace(/^#/, '');

            // Only register if all required selectors exist
            if (modeId && pullId && otypeId && speedId && alternateId && generateId) {
                EventRegister(portName, pinNum, modeId, pullId, otypeId, speedId, alternateId, generateId);
            }
        }
    }
}
