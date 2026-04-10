
class event_handler {
    constructor()
    {
        if (event_handler.instance) {
            return event_handler.instance;
        }
        this.handlers = {};
        this.instances = {};
        event_handler.instance = this;
    }

    handlerExecute(name){
        if (!this.handlers[name] || this.handlers[name].length === 0) {
            return null;
        }

        for (const handler of this.handlers[name]) {
            handler.execute(handler.event);
        }
    }

    addHandler(name, event, handler)
    {
        if (!this.handlers[name]) {
            this.handlers[name] = [];
        }

        if (typeof handler !== "function") {
            return;
        }

        this.handlers[name].push({ "execute": handler, "event": event });
    }

    addInstance(name, instance)
    {
        this.instances[name] = instance;
    }

    getInstance(name)
    {
        if (!(name in this.instances)) return null;
        return this.instances[name];
    }
}

export function Event_handler_initialise()
{
    const events = new event_handler();
    return events;
}

export function addInstance(name, instance)
{
    const events = new event_handler();
    events.addInstance(name, instance);
}

export function getInstance(name)
{
    const events = new event_handler();
    return events.getInstance(name);
}


export function addRadioEventListeners(namehandler, radioName, handler) {

    if (!radioName) {
        return;
    }

    const events = new event_handler();

    const radios = document.querySelectorAll(`input[name="${radioName}"]`);
    radios.forEach(radio => {
        events.addHandler(namehandler, radio.value, handler);
    
        radio.addEventListener("change", function () {
            events.handlerExecute(namehandler);
        });
    });
}

export function addSelectorEventListeners(namehandler, selectElementId, handler, event) {
    if (!selectElementId)
    {
        return;
    }

    const selectElement = document.getElementById(selectElementId);
    if (selectElement == null){
        return;
    }

    const events = new event_handler();
    events.addHandler(namehandler, event, handler);

    selectElement.addEventListener("change", function () {
                events.handlerExecute(namehandler);
    });
}

export function addMoreAvailableEventListener(namehandler, handler, event){

    const events = new event_handler();
    events.addHandler(namehandler, event, handler); 
}

export function addCheckboxGroupEventListeners(namehandler, idPrefix, handler, event) {
    if (!idPrefix) return;

    const events = new event_handler();
    events.addHandler(namehandler, event, handler);

    const checkboxes = document.querySelectorAll(`input[type="checkbox"][id^="${idPrefix}"]`);
    checkboxes.forEach(cb => {
        cb.addEventListener('change', function () {
            events.handlerExecute(namehandler);
        });
    });
}