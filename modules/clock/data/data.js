
import clockUISchema from './ui-schema_default.json' with { type: 'json' };

function initialiseBlockFromSchema(meta) {
    if (!meta || !meta.blockId || !meta.fields) {
        return;
    }

    const blockElement = document.getElementById(meta.blockId);
    if (blockElement === null) {
        return;
    }

    const resolvedFields = {};

    for (const [fieldName, fieldMeta] of Object.entries(meta.fields)) {
        if (fieldMeta?.type !== "radio") {
            continue;
        }

        const radios = blockElement.querySelectorAll(`input[name="${fieldMeta.name}"]`);
        if (radios.length === 0) {
            continue;
        }

        radios.forEach(radio => {
            if (String(radio.value) === String(fieldMeta.value)) {
                radio.checked = true;
            }
            if (radio.checked) {
                resolvedFields[fieldName] = radio.value;
            }
        });
    }

    for (const [fieldName, fieldMeta] of Object.entries(meta.fields)) {
        if (fieldMeta?.type === "radio") {
            continue;
        }

        if (!fieldMeta?.selector) {
            continue;
        }

        const element = blockElement.querySelector(fieldMeta.selector);
        if (element === null) {
            continue;
        }

        const isEnabled = !fieldMeta.enabledBy || resolvedFields[fieldMeta.enabledBy] !== "ENABLE_OFF";
        let value = fieldMeta.value;

        if (fieldMeta.valueType === "fixedValue" && !isEnabled) {
            value = 0;
        }

        if (element instanceof HTMLInputElement && element.type === "checkbox") {
            element.checked = Boolean(value);
            element.disabled = Boolean(fieldMeta.enabledBy) && !isEnabled;
            continue;
        }

        if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
            element.value = String(value);
        } else {
            element.textContent = String(value);
        }

        if ((element instanceof HTMLInputElement || element instanceof HTMLSelectElement) && fieldMeta.enabledBy) {
            element.disabled = !isEnabled;
        }
    }
}

export function clockDataInitialPage()
{
    const schema = clockUISchema;
    for (const sectionMeta of Object.values(schema)) {
        if (sectionMeta?.sections) {
            for (const groupedMeta of Object.values(sectionMeta.sections)) {
                initialiseBlockFromSchema(groupedMeta);
            }
            continue;
        }
        initialiseBlockFromSchema(sectionMeta);
    }
}