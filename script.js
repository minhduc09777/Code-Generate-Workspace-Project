
import { handleCodeBlock, handleConfigBlock, ToggleContainer} from './utils/utils.js';
import {getModuleInstance} from './modules/modules.js'
import { Event_handler_initialise } from './event_handler/event_handler.js';

var module = getModuleInstance();
var oldModule = null;

module.selectCurrentModule("clock");

async function copyCode() {

    const CodeArray = await module.generateCode();

    if (!CodeArray) {
        alert("No Data");
        return;
    }

    navigator.clipboard.writeText(CodeArray["code"].join("\n"));
    alert("Copied!");
}

async function generateCodes() {

    const Content = await module.generateCode();
    if (!Content) {
        return;
    }

    handleCodeBlock(Content);
    handleConfigBlock(Content);
}

async function InitialisePage() {
    const html = await module.LoadHtml();
    document.getElementById("module-container-id").innerHTML = html;
    document.getElementById(module.getName()).classList.toggle('pressed-btn');
    oldModule = module.getName();

    await module.loadCSS();
    await module.initData();
}


function InitialiseEvent()
{
    Event_handler_initialise();

    module.initEvent();

    InitialiseBottomScrollbar();

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const targetId = btn.id;
            if (!module.isSupportModule(targetId))
            {
                ToggleContainer('generate-container-id');
                btn.classList.toggle('pressed-btn');
                return;
            }
            if (targetId === module.getName()) return;
            document.getElementById(oldModule).classList.toggle('pressed-btn');
            module.selectCurrentModule(targetId);
            btn.classList.toggle('pressed-btn');
            oldModule = module.getName();

            const html = await module.LoadHtml();
            document.getElementById("module-container-id").innerHTML = html;
            await module.loadCSS();
            await module.initData();
            await module.initEvent();
        });
    });

    document.querySelector(".copy-btn").addEventListener("click", copyCode);
    document.querySelector(".generate-btn").addEventListener("click", generateCodes);
}

function InitialiseBottomScrollbar() {
    const moduleContainer = document.querySelector(".containerModule");
    const bottomScrollbar = document.getElementById("bottom-scrollbar-id");
    const bottomScrollbarInner = document.getElementById("bottom-scrollbar-inner-id");

    if (!moduleContainer || !bottomScrollbar || !bottomScrollbarInner) {
        return;
    }

    let syncingFromBottom = false;
    let syncingFromClock = false;

    const updateBottomScrollbarVisibility = () => {
        const maxScrollLeft = Math.max(0, moduleContainer.scrollWidth - moduleContainer.clientWidth);
        const hasHorizontalOverflow = maxScrollLeft > 1;
        const scrollRoot = document.documentElement;
        const isAtPageBottom = window.scrollY + window.innerHeight >= scrollRoot.scrollHeight - 1;

        if (!hasHorizontalOverflow || isAtPageBottom) {
            bottomScrollbar.classList.add("is-hidden");
            return;
        }
        bottomScrollbar.classList.remove("is-hidden");
    };

    const updateBottomScrollbarWidth = () => {
        const targetWidth = Math.max(moduleContainer.scrollWidth, moduleContainer.clientWidth);
        bottomScrollbarInner.style.width = `${targetWidth}px`;
        updateBottomScrollbarVisibility();
    };

    bottomScrollbar.addEventListener("scroll", () => {
        if (syncingFromClock) {
            return;
        }

        syncingFromBottom = true;
        moduleContainer.scrollLeft = bottomScrollbar.scrollLeft;
        syncingFromBottom = false;
        updateBottomScrollbarVisibility();
    });

    moduleContainer.addEventListener("scroll", () => {
        if (syncingFromBottom) {
            return;
        }

        syncingFromClock = true;
        bottomScrollbar.scrollLeft = moduleContainer.scrollLeft;
        syncingFromClock = false;
        updateBottomScrollbarVisibility();
    });

    window.addEventListener("resize", updateBottomScrollbarWidth);
    window.addEventListener("scroll", updateBottomScrollbarVisibility, { passive: true });
    updateBottomScrollbarWidth();
}

async function main() {
    await InitialisePage();
    InitialiseEvent();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
} else {
    main();
}

