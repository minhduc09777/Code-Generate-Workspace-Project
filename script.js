
import { handleCodeBlock, handleConfigBlock, ToggleContainer} from './utils/utils.js';

import { clockModuleGenerateProcess, ClockModuleInitialPage, ClockModuleInitialEvent } from './modules/clock/clock.js';

import { Event_handler_initialise } from './event_handler/event_handler.js';

var moduleConfig = "clock"

var modulesSupport = {
    "clock": {
        "generate": clockModuleGenerateProcess,
        "initPage": ClockModuleInitialPage,
        "initEvent": ClockModuleInitialEvent,
    },
}

function copyCode() {
    const CodeArray = modulesSupport[moduleConfig]["generate"]();

    if (!CodeArray) {
        alert("No Data");
        return;
    }

    navigator.clipboard.writeText(CodeArray["code"].join("\n"));
    alert("Copied!");
}

function generateCodes() {

    const Content = modulesSupport[moduleConfig]["generate"]();
    if (!Content) {
        return;
    }

    handleCodeBlock(Content);
    handleConfigBlock(Content);
}

function InitialisePage()
{
    modulesSupport[moduleConfig]["initPage"]();
}

function InitialiseEvent()
{
    Event_handler_initialise();

    modulesSupport[moduleConfig]["initEvent"]();
    InitialiseBottomScrollbar();
    document.querySelector(".tab-btn").addEventListener("click", () => {
        ToggleContainer('generate-container-id');
        const element = document.querySelector(".tab-btn");
        element.classList.toggle('pressed-btn');
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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", InitialisePage);
    document.addEventListener("DOMContentLoaded", InitialiseEvent);
} else {
    InitialisePage();
    InitialiseEvent();
}

