import ioportUISchema from './ui-schema_default.json' with { type: 'json' };

function initialiseBlockFromSchema() {

    // remove any existing static port containers added in the template
    const existingStatic = Array.from(document.querySelectorAll('.port-container'));
    existingStatic.forEach(el => el.remove());

    // find or create the dynamic ports holder
    let container = document.getElementById('ioport-ports');
    if (!container) {
        container = document.createElement('div');
        container.id = 'ioport-ports';
        const moduleEl = document.getElementById('ioport-module-id');
        if (moduleEl) {
            const genField = moduleEl.querySelector('.generate-field');
            if (genField && genField.nextSibling) moduleEl.insertBefore(container, genField.nextSibling);
            else moduleEl.appendChild(container);
        } else {
            document.body.appendChild(container);
        }
    } else {
        container.innerHTML = '';
    }

    const schema = ioportUISchema?.ioport;
    if (!schema || !schema.fields) return;

    const schemaOptions = (schema && schema.options) ? schema.options : {};
    const modes = schemaOptions.modes;
    const pulls = schemaOptions.pulls;
    const otypes = schemaOptions.otypes;
    const speeds = schemaOptions.speeds;
    const alternates = schemaOptions.alternates;

    const genEl = document.getElementById('ioport-generate-checkbox');
    genEl.checked = schema.fields.generate?.value ?? false;

    for (const [key, meta] of Object.entries(schema.fields)) {
        if (!/^port[A-Za-z]$/.test(key)) continue;
        const portLetter = key.slice(4);
        const portId = `port${portLetter.toLowerCase()}-container`;
        const portDiv = document.createElement('div');
        portDiv.className = 'port-container';
        portDiv.id = portId;

        const h3 = document.createElement('h3');
        h3.textContent = `PORT${portLetter.toUpperCase()}`;
        portDiv.appendChild(h3);

        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'ioport-field';

        const pins = Array.isArray(meta.pins) ? meta.pins : [];
        for (const pinMeta of pins) {
            const pinNum = pinMeta.pinnum?.value ?? '0';
            const pinDiv = document.createElement('div');
            pinDiv.className = 'iopin-field';

            const pinId = (pinMeta.pinnum && pinMeta.pinnum.selector) ? pinMeta.pinnum.selector.replace(/^#/, '') : `port${portLetter.toLowerCase()}-pin${pinNum}-num`;
            const pinNumEl = document.createElement('div');
            pinNumEl.className = 'pin-num';
            pinNumEl.id = pinId;
            pinNumEl.textContent = `Pin${pinNum}`;
            pinNumEl.value = pinNum;
            pinDiv.appendChild(pinNumEl);

            // per-pin generate checkbox if schema has a mapping
            const genField = schema.fields[key]?.pins[pinNum]["generate"];

            if (genField && genField.selector) {
                const genDiv = document.createElement('div');
                genDiv.className = 'generate-pin-field';
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.id = genField.selector.replace(/^#/, '');
                cb.checked = !!genField.value;
                const lab = document.createElement('label');
                lab.htmlFor = cb.id;
                lab.textContent = 'Generate';
                genDiv.appendChild(lab);
                genDiv.appendChild(cb);
                pinDiv.appendChild(genDiv);
            }

            const createSelect = (metaField, fieldClass, optionsArray, defaultValue) => {
                const selId = metaField?.selector ? metaField.selector.replace(/^#/, '') : `port${portLetter.toLowerCase()}-pin${pinNum}-${fieldClass}-select`;
                const wrap = document.createElement('div');
                wrap.className = `${fieldClass}-field`;
                const label = document.createElement('label');
                label.htmlFor = selId;
                label.textContent = metaField?.label || (fieldClass.charAt(0).toUpperCase() + fieldClass.slice(1));
                const sel = document.createElement('select');
                sel.id = selId;
                for (const optData of optionsArray) {
                    const o = document.createElement('option');
                    o.value = optData.value;
                    o.textContent = optData.label;
                    if (defaultValue && optData.value === defaultValue) o.selected = true;
                    sel.appendChild(o);
                }
                wrap.appendChild(label);
                wrap.appendChild(sel);
                pinDiv.appendChild(wrap);
            };

            createSelect(pinMeta.mode, 'mode', modes, pinMeta.mode.value);
            createSelect(pinMeta.pull, 'Pull', pulls,  pinMeta.pull.value);
            createSelect(pinMeta.otype, 'otype', otypes, pinMeta.otype.value);
            createSelect(pinMeta.speed, 'speed', speeds,  pinMeta.speed.value);
            if (pinMeta.mode.value === "IOPORT_MODE_ALTERNATE")
            {
                createSelect(pinMeta.alternate, 'alternate', alternates, pinMeta.alternate.value);
            }
            else {
                createSelect(pinMeta.alternate, 'alternate', 
                            [{"value": "IOPORT_ALTERNATE_0", "label": "None"},],
                             "IOPORT_ALTERNATE_0");
            }

            fieldDiv.appendChild(pinDiv);
        }

        portDiv.appendChild(fieldDiv);
        container.appendChild(portDiv);
    }
}

export function ioportDataInitialPage() {

    // Generate dynamic port UI from ui-schema_default.json before populating selects
    try {
        initialiseBlockFromSchema();
    } catch (e) {
        console.warn('buildPortsFromSchema failed', e);
    }
}
