import { getInstance, addRadioEventListeners, addSelectorEventListeners } from '../../../event_handler/event_handler.js';

function getSelectedRadioValue(radioName) {
    if (!radioName) {
        return null;
    }

    const selected = document.querySelector(`input[name="${radioName}"]:checked`);
    return selected ? selected.value : null;
}

function getElementValueById(id) {
    const element = document.getElementById(id);
    if (!element) {
        return null;
    }

    if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
        return element.value;
    }

    return element.textContent;
}

function parseNumberOrNull(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function updateOscillatorFromUI(oscName, oscillator) {
    switch (oscName) {
        case 'hse':
            oscillator.UpdateOsc(
                parseNumberOrNull(getElementValueById('hse-input-value-id')),
                getSelectedRadioValue('hseonoff'),
                getElementValueById('hse-bypass-select'),
                getElementValueById('hse-secure-select'),
                getElementValueById('hse-rtc-div-select')
            );
            break;
        case 'hsi':
            oscillator.UpdateOsc(
                oscillator.inputValue,
                getSelectedRadioValue('hsionoff'),
                getElementValueById('hsi-stop-mode-select'),
                getElementValueById('hsi-div-select')
            );
            break;
        case 'hsi48':
            oscillator.UpdateOsc(
                oscillator.inputValue,
                getSelectedRadioValue('hsi48onoff')
            );
            break;
        case 'csi':
            oscillator.UpdateOsc(
                oscillator.inputValue,
                getSelectedRadioValue('csionoff'),
                getElementValueById('csi-run-in-stopmode-select')
            );
            break;
        case 'lsi':
            oscillator.UpdateOsc(
                oscillator.inputValue,
                getSelectedRadioValue('lsionoff')
            );
            break;
        case 'lse':
            oscillator.UpdateOsc(
                oscillator.inputValue,
                getSelectedRadioValue('lseonoff'),
                getElementValueById('lse-bypass-select'),
                getElementValueById('lse-secure-select'),
                getElementValueById('lse-cap-select')
            );
            break;
        default:
            break;
    }
}

function isOscEnabled(oscName) {
    const radioMap = {
        'hse': 'hseonoff',
        'hsi': 'hsionoff',
        'hsi48': 'hsi48onoff',
        'csi': 'csionoff',
        'lsi': 'lsionoff',
        'lse': 'lseonoff',
    };

    const selected = getSelectedRadioValue(radioMap[oscName]);
    return selected === 'ENABLE_ON';
}

function updateOscFrequency(oscName, valueElementId) {
    if (oscName == null || valueElementId == null) {
        return;
    }

    const osc = getInstance("osc");

    const oscillator = osc.get(oscName);
    if (oscillator === null) {
        return;
    }

    updateOscillatorFromUI(oscName, oscillator);

    let frequency = 0;
    if (isOscEnabled(oscName) || oscName == "hse") {
        frequency = oscillator.getFrequency();
    }
    const valueElement = document.getElementById(valueElementId);
    if (!valueElement) {
        return;
    }

    if (valueElement instanceof HTMLInputElement) {
        valueElement.value = frequency;
    } else {
        valueElement.textContent = frequency;
    }
}

function EventRegister(oscName, radioName, valueElementId, selectElementIds = []) {
    for (const selectElementId of selectElementIds)
    {
        addSelectorEventListeners(oscName, selectElementId, () => updateOscFrequency(oscName, valueElementId), 'oscConfigChange');
    }

    addRadioEventListeners(oscName, radioName, () => updateOscFrequency(oscName, valueElementId));

    const inputElement = document.getElementById(valueElementId);
    if (inputElement instanceof HTMLInputElement) {
        inputElement.addEventListener('change', () => updateOscFrequency(oscName, valueElementId));
    }
}

export function oscEventInitialise() {
    EventRegister('hse', 'hseonoff', 'hse-input-value-id', ['hse-bypass-select', 'hse-secure-select', 'hse-rtc-div-select']);
    EventRegister('hsi', 'hsionoff', 'hsi-value-id', ['hsi-div-select', 'hsi-stop-mode-select']);
    EventRegister('hsi48', 'hsi48onoff', 'hsi48-value-id');
    EventRegister('csi', 'csionoff', 'csi-value-id', ['csi-run-in-stopmode-select']);
    EventRegister('lsi', 'lsionoff', 'lsi-value-id');
    EventRegister('lse', 'lseonoff', 'lse-value-id', ['lse-bypass-select', 'lse-secure-select', 'lse-cap-select']);
}
    
