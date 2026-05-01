/**
 * Append a section (array of lines) into a section list
 * Skips empty or null sections
 * 
 * @param {Array} sectionList - The list to append into
 * @param {Array} section - Array of code lines to append
 * 
 * Example:
 *   sectionList = []
 *   section = [".hse_osc_cfg = {", ".hse_osc_enable = ON,", "}"]
 *   -> sectionList = [[".hse_osc_cfg = {", ".hse_osc_enable = ON,", "}"]]
 */
export function appendSection(sectionList, section) {
    if (!section || section.length === 0) {
        return;
    }
    sectionList.push([...section]);
}

/**
 * Append a trailing comma to the last line of a section
 * Used to separate struct members in generated C code
 * 
 * @param {Array} section - Array of code lines
 * 
 * Example:
 *   section = [".hse_osc_cfg = {", "  .enable = ON,", "}"]
 *   -> section = [".hse_osc_cfg = {", "  .enable = ON,", "},"]
 */
export function addCommaToSection(section) {
    const lastIndex = section.length - 1;
    section[lastIndex] = section[lastIndex] + ",";
}

/**
 * Flatten a list of sections into a single array of lines
 * Optionally add trailing comma to each section (for C struct members)
 * 
 * @param {Array} sectionList - List of sections (each section is an array of lines)
 * @param {boolean} comma - If true, append "," to the last line of each section
 * @returns {Array} Flat array of all lines
 * 
 * Example (comma = true):
 *   sectionList = [
 *     [".hse_osc_cfg = {", ".enable = ON", "}"],
 *     [".hsi_osc_cfg = {", ".enable = OFF", "}"]
 *   ]
 *   -> [".hse_osc_cfg = {", ".enable = ON", "},", ".hsi_osc_cfg = {", ".enable = OFF", "}"]
 */
export function flattenSections(sectionList, comma = false) {
    const lines = [];

    for (let i = 0; i < sectionList.length; i++) {
        const section = sectionList[i];
        if (comma){
            addCommaToSection(section);
        }

        lines.push(...section);
    }

    return lines;
}

/**
 * Get the value of the currently checked radio button inside a container
 * 
 * @param {HTMLElement} container - Parent element to search within
 * @param {string} radioName - The `name` attribute of the radio group
 * @returns {string|null} The value of the checked radio, or null if none checked
 * 
 * Example:
 *   HTML: <input type="radio" name="hseonoff" value="ENABLE_ON" checked />
 *   getCheckedRadioValue(container, "hseonoff") -> "ENABLE_ON"
 */
export function getCheckedRadioValue(container, radioName) {
    const radio = container.querySelector(`input[name="${radioName}"]:checked`);
    if (!radio) {
        return null;
    }
    return radio.value;
}

/**
 * Query multiple DOM elements at once using a map of key -> CSS selector
 * Returns null if any element is not found
 * 
 * @param {HTMLElement} container - Parent element to search within
 * @param {Object} selectorMap - Map of field name to CSS selector
 * @returns {Object|null} Map of field name to DOM element, or null if any not found
 * 
 * Example:
 *   selectorMap = { inputValue: "#hse-input-value-id", bypass: "#hse-bypass-select" }
 *   -> { inputValue: <input#hse-input-value-id>, bypass: <select#hse-bypass-select> }
 */
export function getElementsBySelectorMap(container, selectorMap) {
    const elements = {};

    for (const [key, selector] of Object.entries(selectorMap)) {
        const element = container.querySelector(selector);
        if (!element) {
            return null;
        }
        elements[key] = element;
    }

    return elements;
}

/**
 * Get text content of an element, with an enable guard
 * If validate is false (e.g., oscillator is disabled), returns "0" instead of the actual value
 * 
 * @param {HTMLElement} element - The DOM element to read from
 * @param {boolean} validate - If false, return "0" regardless of content
 * @returns {string|null} Text content or "0", or null if element is missing
 * 
 * Example:
 *   element.textContent = "25000000"
 *   getElementTextValue(element, true)  -> "25000000"  (oscillator enabled)
 *   getElementTextValue(element, false) -> "0"         (oscillator disabled)
 */
export function getElementTextValue(element, validate) {
    if (!element) {
        return null;
    }

    if (!validate)
    {
        return "0";
    }

    return element.textContent.trim();
}

export function ToggleContainer(tabId) {
    const element = document.getElementById(tabId);
    if (element.style.display === "block") {
        element.style.display = "none";
    } else {
        element.style.display = "block";
    }
}

/**
 * Create a new HTML element with a CSS class and text content, then append it to a block
 * 
 * @param {HTMLElement} codeBlock - Parent element to append to
 * @param {string} code - Text content for the new element
 * @param {string} id - CSS class name to apply
 * @param {string} e - HTML tag name (e.g., "span", "div")
 * 
 * Example:
 *   addLine(codeBlock, "  .enable = ON,", "code-line", "span")
 *   -> <span class="code-line">  .enable = ON,</span> appended to codeBlock
 */
export function addLine(codeBlock, code, id, e) {
    const element = document.createElement(e);
    element.classList.add(id);
    element.textContent = code;

    codeBlock.appendChild(element);
}


export function handleCodeBlock(content)
{
    if (content === null)
    {
        // handle something
        return;
    }
    const codeBlock = document.getElementById("code-block");
    codeBlock.replaceChildren();

    addLine(codeBlock, content["header"], "code-line", "span");

    for (const lineCode of content["code"]) {
        addLine(codeBlock, lineCode, "code-line", "span");
    }
}


export function handleConfigBlock(content)
{
    if (content === null || content["config"] === null)
    {
        // handle something
        return;
    }
    const configBlock = document.getElementById("config-block");
    configBlock.replaceChildren();

    /*
        const content = {
            config: [
                { a: 1, b: 2 },
                { c: 3 }
            ]
        };

        flatmap
        [
            ["a", 1],
            ["b", 2],
            ["c", 3]
        ]
    */
    const entries = content["config"].flatMap((config) => Object.entries(config));
    const maxLength = entries.reduce((max, [macro]) => Math.max(max, macro.length), 0);

    for (const [macro, value] of entries) {
        const lineContent = macro.padEnd(maxLength + 5) + value;
        addLine(configBlock, lineContent, "config-line", "span");
    }

}

/**
 * Load and resolve all field data from HTML based on unified schema metadata
 * 
 * Handles mixed field types (radio, input, select) in a single pass:
 * 1. Separates radio fields (use getCheckedRadioValue) from element fields (use getElementsBySelectorMap)
 * 2. Resolves radio values first (needed for dependencies)
 * 3. Resolves other field values using resolveFieldValue (can depend on radio values)
 * 
 * @param {string} blockId - Container element ID (e.g., "hse-block-id")
 * @param {Object} fieldsMeta - Field metadata from schema
 * @returns {Object} Resolved fields object or null if any field is invalid
 * 
 * Example schema:
 * {
 *   "onState": { "type": "radio", "name": "hseonoff" },
 *   "inputValue": { "type": "input", "selector": "#hse-input-value-id", "valueType": "rawValue" },
 *   "bypassSelect": { "type": "select", "selector": "#hse-bypass-select", "valueType": "rawValue" }
 * }
 * 
 * Example output:
 * {
 *   "onState": "ENABLE_ON",
 *   "inputValue": "25000000",
 *   "bypassSelect": "BYPASS_DISABLE"
 * }
 */
function loadDataFromHtml(blockId, fieldsMeta) {
    const container = document.getElementById(blockId);
    if (!container) {
        return null;
    }

    // Step 1: Build selector map for non-radio, non-fixedValue fields
    const selectorMap = {};
    for (const [fieldName, meta] of Object.entries(fieldsMeta)) {
        if (meta.type !== "radio" && meta.valueType !== "fixedValue") {
            selectorMap[fieldName] = meta.selector;
        }
    }

    // Step 2: Fetch element references for selectors
    const elementFields = Object.keys(selectorMap).length > 0 ? getElementsBySelectorMap(container, selectorMap) : {};
    if (Object.keys(selectorMap).length > 0 && !elementFields) {
        return null;
    }

    const resolvedFields = {};

    // Step 3a: Resolve radio fields first — other fields may depend on their values
    for (const [fieldName, meta] of Object.entries(fieldsMeta)) {
        if (meta.type !== "radio") {
            continue;
        }
        const radioValue = getCheckedRadioValue(container, meta.name);
        if (!radioValue) {
            return null;
        }
        resolvedFields[fieldName] = radioValue;
    }


    // Step 3b: Resolve non-radio fields (with or without dependencies)
    for (const [fieldName, meta] of Object.entries(fieldsMeta)) {
        if (meta.type === "radio") {
            continue;
        }

        if (meta.valueType === "fixedValue") {
            resolvedFields[fieldName] = meta.value;
            continue;
        }

        const fieldElement = elementFields[fieldName];
        if (!fieldElement) {
            return null;
        }
        resolvedFields[fieldName] = resolveFieldValue(fieldElement, meta, resolvedFields);
    }

    return resolvedFields;
}

/**
 * Get field value from HTML element using schema rules
 * 
 * @param {HTMLElement} field - DOM element to extract value from
 * @param {Object} fieldMeta - Field configuration (type, valueType, enabledBy)
 * @param {Object} resolvedFields - Already resolved field values (for dependencies)
 * @returns {string} The resolved field value
 * 
 * Handles 2 types:
 * - "rawValue": Use element.value directly (e.g., input/select)
 * - "textValueWhenEnabled": Use element.textContent only if dependency field is enabled
 *   - If dependency = "ENABLE_OFF", returns "0"
 *   - If dependency != "ENABLE_OFF", returns element.textContent
 */
function isFieldEnabled(fieldMeta, resolvedFields) {
    if (!fieldMeta?.enabledBy) {
        return true;
    }

    return resolvedFields[fieldMeta.enabledBy] === fieldMeta.enabledValue;
}

function resolveFieldValue(field, fieldMeta, resolvedFields) {
    if (!fieldMeta) {
        return field.value;
    }

    const isEnabled = isFieldEnabled(fieldMeta, resolvedFields);

    if (fieldMeta.type === "checkbox" || fieldMeta.valueType === "checkedValue") {
        return isEnabled && field.checked ? field.value : null;
    }

    if (fieldMeta.valueType === "rawValue") {
        return isEnabled ? field.value : "0";
    }

    if (fieldMeta.valueType === "textValueWhenEnabled") {
        return getElementTextValue(field, isEnabled);
    }

    // Unknown valueType: return raw element value
    return field.value;
}

/**
 * Load oscillator data by reading schema and delegating to loadDataFromHtml
 * 
 * @param {string} blockName - Oscillator name ("hse", "hsi", "csi", "lsi", "hsi48", "lse")
 * @param {Object} schema - Oscillator UI schema (contains blockId and fields metadata)
 * @returns {Object} Resolved field values or null if oscillator not found
 * 
 * Example:
 * loadData("hse", clockUISchema) reads clockUISchema["hse"]:
 * {
 *   "blockId": "hse-block-id",
 *   "fields": { ... schema ... }
 * }
 * Then calls loadDataFromHtml("hse-block-id", fieldsMeta)
 */
export function loadBlockData(blockName, schema) {
    const meta = schema[blockName];
    if (!meta || !meta.fields) {
        return null;
    }

    return loadDataFromHtml(
        meta.blockId,
        meta.fields
    );
}

