// Active WOW js
new WOW().init();

// btn theme ripple effect
"use strict";
[].map.call(document.querySelectorAll('.btn-theme'), el => {
    el.addEventListener('click', e => {
        e = e.touches ? e.touches[0] : e;
        const r = el.getBoundingClientRect(),
            d = Math.sqrt(Math.pow(r.width, 2) + Math.pow(r.height, 2)) * 2;
        el.style.cssText = `--s: 0; --o: 1;`;
        el.offsetTop;
        el.style.cssText = `--t: 1; --o: 0; --d: ${d}; --x:${e.clientX - r.left}; --y:${e.clientY - r.top};`;
    });
});



// searchable dropdown JS

(function (element) {
    element.matches = element.matches || element.mozMatchesSelector || element.msMatchesSelector || element.oMatchesSelector || element.webkitMatchesSelector;
    element.closest = element.closest || function closest(selector) {
        if (!this || !this.parentElement && !this.matches(selector)) return null;
        else if (this.matches(selector)) return this;
        else return this.parentElement.closest(selector);
    };
}(Element.prototype));

function setthemeDropdown() {
    var list = document.querySelectorAll(".themedropdown-select:not(.themecreated)");
    for (var sel in list)
        if (list.hasOwnProperty(sel))
            createDropdown(list[sel]);

    function createDropdown(select) {
        var searchDisable = select.dataset["searchdisable"];
        var placeholder = select.dataset["placeholder"];
        var opened = select.dataset["opened"];
        var div = createthemeElement("div", "themediv", select.parentNode, null);
        var dropdown = createthemeElement("div", "themedropdown" + (opened != null && opened == "true" ? " open" : ""), div,
            opened == null || opened != "true" ? {
                "click": openSelect,
                "blur": openSelect
            } : null);
        dropdown.select = select;
        dropdown.setAttribute("tabindex", "0");
        if (opened == null || opened != "true")
            createthemeElement("div", "themeselected", dropdown, null);
        if (searchDisable == null || searchDisable != "true") {
            var search = createthemeElement("div", "themesearch", dropdown, null);
            var e = {
                "keyup": getSearch,
                "paste": getSearch
            };
            if (opened == null || opened != "true") e["blur"] = openSelect;
            createthemeElement("input", "themesearchinput", search, e).placeholder = placeholder != undefined ? placeholder : "Search";
        }
        if (select.multiple) {
            var selectAll = createthemeElement("button", "themeAll", dropdown, {
                "click": selectAllOptions
            });
            selectAll.textContent = "Select All";
            selectAll.type = "button";
            selectAll.selected = false;
        }
        createthemeElement("div", "themelist", dropdown, null);
        select.themedropdown = {
            dd: dropdown,
            rebind: function () {
                rebindDropdown(select);
            },
            setValue: function (value) {
                setValue(dropdown, value)
            }
        };
        rebindDropdown(select);
        select.classList.add("themecreated");
    }

    function setValue(dd, value) {
        if (Array.isArray(value))
            for (var v in value) {
                if (value.hasOwnProperty(v)) {
                    var val = dd.querySelector(".themelist div[data-value='" + value[v] + "']");
                    if (val != null)
                        val.dispatchEvent(new Event('click', {
                            'bubbles': true
                        }));
                }
            }
        else {
            var val = dd.querySelector(".themelist div[data-value='" + value + "']");
            if (val != null)
                val.dispatchEvent(new Event('click', {
                    'bubbles': true
                }));
        }
    }

    function openSelect(event, open, force) {
        var select = event.target.classList.contains("themedropdown") ? event.target.select : event.target.closest(".themedropdown").select;
        open = open == null ? event.type != "blur" : open;
        var el = select.themedropdown.dd;
        if (checkEvent(event, force)) return;
        if (!open || el.classList.contains("open")) {
            el.classList.remove("open");
            el.parentNode.classList.remove("open");
            return;
        }
        el.classList.add("open");
        el.parentNode.classList.add("open");
        if (select.dataset["searchdisable"] == null && select.dataset["searchdisable"] != "true")
            el.querySelector(".themesearchinput").focus();
    }

    function checkEvent(event, force) {
        return event.relatedTarget != null && (event.relatedTarget.tagName == "INPUT" || (event.relatedTarget.tagName == "BUTTON" && force == undefined)) ||
            event.target.tagName == "INPUT" && event.type != "blur" ||
            event.target.tagName == "INPUT" && (event.relatedTarget != null && event.relatedTarget.className == "themedropdown open") ||
            event.target.classList.contains("themeselected") && event.type == "blur" && document.activeElement.classList.contains("themesearchinput") ||
            event.type == "blur" && (document.activeElement.className == "themelist" || document.activeElement.className == "themeAll") ||
            event.target.tagName == "BUTTON" && force == undefined;
    }

    function changeSelect(event) {
        var select = event.target.closest(".themedropdown").select;
        var dd = select.themedropdown.dd;
        var selectAll = dd.querySelector(".themeAll");
        var opened = select.dataset["opened"] == null || select.dataset["opened"] != "true";
        if (select.value != event.target.dataset["value"] && !select.multiple) {
            select.value = event.target.dataset["value"];
            if (dd.querySelector(".themelist>.selected") != null)
                dd.querySelector(".themelist>.selected").classList.remove("selected");
            event.target.classList.add("selected");
            if (opened)
                dd.querySelector(".themeselected").textContent = event.target.textContent;
            initNewEvent("change", select);
        }
        if (select.multiple) {
            changeMultipleSelect(select, event, dd, selectAll, opened);
        }
        if (opened)
            openSelect(event, false);
    }

    function changeMultipleSelect(select, event, dd, selectAll, opened) {
        select.querySelector("[value='" + event.target.dataset["value"] + "']").selected = !event.target.classList.contains("selected");
        if (event.target.classList.contains("selected"))
            event.target.classList.remove("selected");
        else
            event.target.classList.add("selected");
        initNewEvent("change", select);
        var length = dd.querySelectorAll(".themelist>.selected").length;
        selectAll.selected = length > 0;
        if (opened)
            dd.querySelector(".themeselected").textContent = length == 1 ? event.target.textContent : length + " options selected";
        selectAll.textContent = selectAll.selected ? "Deselect All" : "Select All";
    }

    function rebindDropdown(select) {
        var optList = select.querySelectorAll("option");
        var ddList = select.themedropdown.dd.querySelector(".themelist");
        while (ddList.lastChild)
            ddList.removeChild(ddList.lastChild);
        for (var opt in optList) {
            if (optList.hasOwnProperty(opt)) {
                var listEl = document.createElement("div");
                listEl.textContent = optList[opt].textContent;
                listEl.dataset["value"] = optList[opt].value;
                if (optList[opt].selected)
                    listEl.classList.add("selected");
                listEl.addEventListener("click", changeSelect);
                ddList.appendChild(listEl);
            }
        }
        setHeader(select, null);
    }

    function initNewEvent(eventName, target) {
        var event;
        if (typeof (Event) === "function")
            event = new Event(eventName, {
                bubbles: true
            });
        else {
            event = document.createEvent("Event");
            event.initEvent(eventName, true, true);
        }
        target.dispatchEvent(event);
    }

    function getSearch(event) {
        var pasteText = event.type != "paste" ? "" : typeof event.clipboardData === "undefined" ?
            window.clipboardData.getData("Text") : event.clipboardData.getData("text/plain");
        var val = event.type != "paste" ? event.target.value : pasteText;
        var dd = event.target.closest(".themedropdown");
        var ddList = dd.querySelectorAll(".themelist>div");
        for (var div in ddList)
            if (ddList.hasOwnProperty(div))
                if (ddList[div].textContent.trim().toLowerCase().indexOf(val.trim().toLowerCase()) != -1)
                    ddList[div].classList.remove("hidetheme");
                else
                    ddList[div].classList.add("hidetheme");
    }

    function createthemeElement(type, className, parent, eventListener) {
        var element = document.createElement(type);
        if (className != null)
            for (var c in className.split(" "))
                if (!isNaN(c))
                    element.classList.add(className.split(" ")[c]);
        if (eventListener != null)
            for (var ev in eventListener)
                if (eventListener.hasOwnProperty(ev))
                    element.addEventListener(ev, eventListener[ev], true);
        parent.appendChild(element);
        return element;
    }

    function selectAllOptions(event) {
        var select = event.target.closest(".themedropdown").select;
        var dd = select.themedropdown.dd;
        var selected = !event.target.selected;
        event.target.selected = selected;
        var list = !selected ? dd.querySelectorAll(".selected") : dd.querySelectorAll(".themelist>div:not(.hidetheme)");
        for (var l in list)
            if (list.hasOwnProperty(l)) {
                select.querySelector("[value='" + list[l].dataset["value"] + "']").selected = selected;
                if (selected)
                    list[l].classList.add("selected");
                else
                    list[l].classList.remove("selected");
            }
        initNewEvent("change", select);
        event.target.textContent = !selected ? "Select All" : "Deselect All";
        setHeader(select, event);
    }

    function setHeader(select, event) {
        if (select.dataset["opened"] == null || select.dataset["opened"] != "true") {
            var text = "";
            var sOption = select.options[select.selectedIndex];
            if (select.multiple) {
                var count = 0;
                for (var s in select.options)
                    if (select.options.hasOwnProperty(s) && select.options[s].selected == true)
                        count++;
                text = count == 1 ? sOption.textContent : count + " options selected";
            }
            select.themedropdown.dd.querySelector(".themeselected").textContent = select.multiple ? text : sOption != undefined ? sOption.textContent : "";
            if (event != null)
                openSelect(event, false, true);
        }
    }
}

document.addEventListener("DOMContentLoaded", setthemeDropdown);