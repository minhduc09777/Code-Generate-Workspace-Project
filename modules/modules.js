import { clockModuleGenerateProcess, ClockModuleInitialData, ClockModuleInitialEvent } from './clock/clock.js';

var modulesProcessAPIData = {
    "clock": {
        "modulesProcessAPIData": {
            "generate": clockModuleGenerateProcess,
            "initData":  ClockModuleInitialData,
            "initEvent": ClockModuleInitialEvent,
        }
    },
    "ioport": {

    }
}

class modules {
    constructor(module="clock")
    {
        if (modules.instance) {
            return modules.instance;
        }

        this.isLoadhtml = false;
        this.moduleName = null;
        this.moduleProcessAPI = null;
        if (module in modulesProcessAPIData) {
            this.moduleName = module;
            this.moduleProcessAPI = modulesProcessAPIData[module]["modulesProcessAPIData"];
        }

        modules.instance = this;
    }

    getName() {
        return this.moduleName;
    }

    isSupportModule(moduleName)
    {
        if (moduleName in modulesProcessAPIData) return true;
        return false;
    }

    selectCurrentModule(module){
        if (module in modulesProcessAPIData) {
            this.moduleName = module;
            this.moduleProcessAPI = modulesProcessAPIData[module]["modulesProcessAPIData"];
        }
    }

    async initData(){
        if (!this.moduleName || !this.isLoadhtml){
            return null;
        }
        return this.moduleProcessAPI["initData"]();
    }

    async initEvent(){
        if (!this.moduleName || !this.isLoadhtml){
            return null;
        }

        return this.moduleProcessAPI["initEvent"]();
    }
    async generateCode() {
        if (!this.moduleName || !this.isLoadhtml){
            return null;
        } 

        return this.moduleProcessAPI["generate"]();
    }

    async LoadHtml() {
        this.isLoadhtml = true;

        if (!this.moduleName){
            return null;
        }
    
        const response = await fetch(`./modules/${this.moduleName}/${this.moduleName}.html`);
        const htmlData = await response.text();

        return htmlData;
    }

    async loadCSS() {
        if (!this.moduleName) return;

        const id = `css-${this.moduleName}`;

        if (document.getElementById(id)) return;

        const res = await fetch(`./modules/${this.moduleName}/${this.moduleName}.css`);
        const css = await res.text();

        const style = document.createElement("style");
        style.id = id;
        style.textContent = css;

        document.head.appendChild(style);
    }
}

export function getModuleInstance()
{
    return new modules();
}




