import { appendSection, getElementsBySelectorMap } from '../../../utils/utils.js';
import ioportUISchema from '../data/ui-schema_default.json' with { type: 'json' };

/**
 * Load pin data from HTML based on pin schema metadata
 * Handles the nested structure: port -> pins array -> pin fields
 * 
 * @param {HTMLElement} container - Parent element containing the port
 * @param {Array} pinsSchema - Array of pin field schemas
 * @returns {Array} Array of resolved pin data objects
 */
function loadPinsFromHtml(container, pinsSchema) {
    const resolvedPins = [];
    
    for (const pinSchema of pinsSchema) {
        // Build selector map for this pin's fields
        const selectorMap = {};
        for (const [fieldName, fieldMeta] of Object.entries(pinSchema)) {
            if (fieldMeta.selector) {
                selectorMap[fieldName] = fieldMeta.selector;
            }
        }
        
        // Get elements for this pin
        const elements = getElementsBySelectorMap(container, selectorMap);
        if (!elements) {
            // Skip this pin if elements not found
            continue;
        }
        
        // Resolve field values for this pin
        const resolvedPin = {};
        for (const [fieldName, fieldMeta] of Object.entries(pinSchema)) {
            
            const element = elements[fieldName];
            if (!element) {
                continue;
            }
            
            // Handle checkbox/checkedValue
            if (fieldMeta.type === 'checkbox' || fieldMeta.valueType === 'checkedValue') {
                resolvedPin[fieldName] = { value: element.checked ? fieldMeta.value : false };
                continue;
            }
            
            // Handle rawValue (select, input)
            if (fieldMeta.valueType === 'rawValue') {
                resolvedPin[fieldName] = { value: element.value };
                continue;
            }
            
            // Default fallback
            resolvedPin[fieldName] = { value: element.value };
        }
        
        resolvedPins.push(resolvedPin);
    }
    
    return resolvedPins;
}

/**
 * Load all port data from HTML based on ioport schema
 * Handles nested structure: block -> ports -> pins
 * 
 * @param {Object} ioportSchema - The ioport section from ui-schema
 * @returns {Object} Object with portName -> { pins: [...] } structure
 */
function loadIoportDataFromHtml(ioportSchema) {
    const blockId = ioportSchema.blockId;
    const fields = ioportSchema.fields;
    
    const container = document.getElementById(blockId);
    if (!container) {
        return null;
    }
    
    const result = {};
    
    // Load simple fields (like 'generate' checkbox)
    if (fields.generate && fields.generate.selector) {
        const generateElem = container.querySelector(fields.generate.selector);
        if (generateElem) {
            result.generate = generateElem.checked;
        }
    }
    
    // Load each port (portA, portB, etc.)
    for (const [portName, portSchema] of Object.entries(fields)) {
        // Skip non-port fields
        if (portName === 'generate' || !portSchema.pins) {
            continue;
        }
        
        // Find the port container in HTML
        const portContainerId = `${portName.toLowerCase()}-container`;

        const portContainer = container.querySelector('#' + portContainerId);
        
        if (!portContainer) {
            console.warn(`Port container not found: #${portContainerId}`);
            continue;
        }
        
        // Load pins for this port
        const pinsData = loadPinsFromHtml(portContainer, portSchema.pins);
        if (pinsData.length > 0) {
            result[portName] = { pins: pinsData };
        }
    }
    
    return result;
}

class ioPin {
    constructor(pinNum, mode, pull, otype, speed, alternate, isGen) {
        this.pinNum = pinNum;
        this.mode = mode;
        this.pull = pull;
        this.otype = otype;
        this.speed = speed;
        this.alternate = alternate;
        this.isGen = isGen;
    }

    updateMode(mode){
        this.mode = mode;
    }
    getMode(){
        return this.mode;
    }

    updatePull(pull){
        this.pull = pull;
    }
    getPull(){
        return this.pull;
    }

    updateOtype(otype){
        this.otype = otype;
    }
    getOtype(){
        return this.otype;
    }

    updateSpeed(speed){
        this.speed = speed;
    }
    getSpeed(){
        return this.speed;
    }

    updateAlternate(alternate) {
        if (this.mode !== "IOPORT_MODE_ALTERNATE" ) return;
        this.alternate = alternate;
    }

    getAlternate(){
        if (this.mode !== "IOPORT_MODE_ALTERNATE" ) return "IOPORT_ALTERNATE_0";
        return this.alternate;
    }

    updateIsGen(isGen){
        this.isGen = isGen;
    }
    getIsGen(){
        return this.isGen;
    }


    GetCodeArray() {
        if (!this.isGen){
            return null;
        } 
        return [
            `[${this.pinNum}] = {`,
            `    .mode      = ${this.mode},`,
            `    .pull      = ${this.pull},`,
            `    .otype     = ${this.otype},`,
            `    .speed     = ${this.speed},`,
            `    .alternate = ${this.alternate},`,
            '},',
        ];
    }
}

class ioport {
    constructor(portName) {
        this.portName = portName;
        this.pins = [];
    }

    getPinNum(pinNum) {
        if (pinNum >= this.pins.length)
        {
            return null;
        }
        return this.pins[pinNum]
    }

    getPortName() {
        return this.portName;
    }

    updatePins(pinsInfor){
        this.pins = [];
        for (const pinInfor of pinsInfor) {
            this.pins.push(new ioPin(
                pinInfor.pinnum.value,
                pinInfor.mode.value,
                pinInfor.pull.value,
                pinInfor.otype.value,
                pinInfor.speed.value,
                pinInfor.alternate.value,
                pinInfor.generate.value,
            ));
        }
    }

    GetCodeArray() {
        const portCfgName = `g_ioport_port${this.portName}_pinscfg`;
        
        let pinsCodeArray = [];
        for (const pin of this.pins) {
            const pinCode = pin.GetCodeArray();
            if (pinCode) {
                pinsCodeArray.push(...pinCode);
            }
        }
    
        if (pinsCodeArray.length === 0) {
            return [];
        }
    
        return [
            `ioport_pincfg_t ${portCfgName} = {`,
            '    .pins = {',
            ...pinsCodeArray.map(line => '        ' + line),
            '    }',
            '};',
        ];
    }

    getInforVar() {
        const portCfgName = `g_ioport_port${this.portName}_pinscfg`;
        return {
            struct: 'ioport_pincfg_t',
            varName: portCfgName
        };
    }
}

class IoportModule {
    constructor() {
        if (IoportModule.instance) {
            return IoportModule.instance;
        }
        IoportModule.instance = this;
        this.ports = {};
        this.generate = true;
    }

    UpdatePortConfigGenerate(generate){
        this.generate = generate;
    }

    IsPortConfigGenerate(){
        return this.generate;
    }

    AddPort(port) {
        if (port.name in this.ports){
             throw new Error(`${port.name} is availabled`);
             return;
        }

        this.ports[port.name] = new ioport(port.name);
        this.ports[port.name].updatePins(port.pins);
    }

    updatePins(portName, pins){
        if (!(portName in this.ports)){
            throw new Error(`${portName} is not available`);
        }

        this.ports[portName].updatePins(pins);
    }

    updatePin(portName, pinnum, pinscfg){
        if (!(portName in this.ports)){
            throw new Error(`${portName} is not available`);
        }

        const port = this.ports[portName];
        const pin = port.getPinNum(pinnum);
        if (!pin) {
            throw new Error(`Pin ${pinnum} is not available on port ${portName}`);
        }

        pin.updateMode(pinscfg.mode);
        pin.updatePull(pinscfg.pull);
        pin.updateOtype(pinscfg.otype);
        pin.updateSpeed(pinscfg.speed);
        pin.updateAlternate(pinscfg.alternate);
        pin.updateIsGen(pinscfg.isGen);
    }

    GetCodeArray() {
        const codeLines = [];

        // Generate the main ioport_cfg_t structure
        const portVarNames = [];
        for (const [portName, port] of Object.entries(this.ports)) {
            const portCode = port.GetCodeArray();
            if (portCode && portCode.length > 0) {
                codeLines.push(...portCode);
                codeLines.push(''); // Empty line between ports
                const portInfo = port.getInforVar();
                if (portInfo) {
                    portVarNames.push(`&${portInfo.varName}`);
                }
            }
        }
        codeLines.push('ioport_cfg_t g_ioport_config = {');
        codeLines.push('    .pinscfg = {');
        // console.log(this.generate);
        if (this.generate) {
            if (portVarNames.length > 0) {
                
                for (let i = 0; i < portVarNames.length; i++) {
                    const trailingComma = i < portVarNames.length - 1 ? ',' : '';
                    codeLines.push(`        ${portVarNames[i]}${trailingComma}`);
                }
            }
        }

        codeLines.push('    },');
        codeLines.push('};');

        return codeLines;
    }

    GetConfigArray() {
        const configLines = [];

        return configLines;
    }

    getInforVar() {
        const allVars = [];
        for (const [portName, port] of Object.entries(this.ports)) {
            allVars.push(port.getInforVar());
        }
        return allVars;
    }
}

export function IoportInitial() {
    const ioportModule = new IoportModule();

    // Load data from HTML using custom handler for nested structure
    const ioportData = loadIoportDataFromHtml(ioportUISchema.ioport);
    
    if (!ioportData) {
        return ioportModule;
    }

    // Process each port (portA, portB, etc.)
    for (const [portName, portFields] of Object.entries(ioportData)) {
        // Skip non-port fields like 'generate'
        if (portName === 'generate') {
            ioportModule.UpdatePortConfigGenerate(portFields);
            continue;
        }
        
        const portData = {
            name: portName,
            pins: portFields.pins
        };
        
        try {
            ioportModule.AddPort(portData);
        } catch (e) {
            console.warn(`Failed to add port ${portName}:`, e.message);
        }
    }
    return ioportModule;
}

export function InitialiseIoportCodeSections(ioportModule) {
    const codeSections = [];
    
    if (!ioportModule || !(ioportModule instanceof IoportModule)) {
        return codeSections;
    }

    const codeArray = ioportModule.GetCodeArray();
    if (codeArray && codeArray.length > 0) {
        appendSection(codeSections, codeArray);
    }

    return codeSections;
}

export function InitialiseIoportConfigSections(ioportModule) {
    const configSections = [];
    
    if (!ioportModule || !(ioportModule instanceof IoportModule)) {
        return configSections;
    }

    const configArray = ioportModule.GetConfigArray();
    if (configArray && configArray.length > 0) {
        appendSection(configSections, configArray);
    }

    return configSections;
}
