module.exports.init = function () {
    bindElementsByClass("close-popover", "click", destroyPopover);
    bindElementsByClass("delete-card", "click", deleteCard);
};

module.exports.createCard = function (title, tools, contents, image) {
    const card = document.createElement("div"),
        heading = document.createElement("div"),
        body = document.createElement("div"),
        allow = tools.length > 0,
        options = document.createElement("span"),
        headingText = document.createElement("span"),
        footer = document.createElement("div");

    const tooling = {
        delete : document.createElement("i"),
        edit : document.createElement("i"),
        info: document.createElement("i"),
        save: document.createElement("i")
    };

    tooling.delete.className = "fa fa-minus-square-o delete-card";
    tooling.delete.addEventListener("click", deleteCard);
    tooling.edit.className = "fa fa-pencil edit-card";
    tooling.info.className = "fa fa-info info-card";
    tooling.save.className = "fa fa-check info-card";
    tooling.save.style.fontWeight = "200";

    card.className = "card";
    heading.className = "card-header";
    body.className = "card-body";
    headingText.className = "card-header-name";
    headingText.innerHTML = title;
    options.className = "card-header-tools";
    options.setAttribute("aria-hidden", "true");

    if (allow) {
        for (var i = 0; i < tools.length; i++) {
            let property = tools[i];
            if (tooling.hasOwnProperty(property)) {
                options.appendChild(tooling[property]);
            }
        }
    }

    heading.appendChild(headingText);
    heading.appendChild(options);

    if (typeof contents === "string" || contents instanceof String) {
        body.innerHTML = contents;
    } else {
        body.appendChild(contents);
    }

    card.appendChild(heading);
    card.appendChild(body);

    card.body = body;
    card.heading = heading;
    card.title = headingText;

    card.setToolCallback = function (t, callback) {
        tooling[t].addEventListener("click", () => {
            callback(card, tooling[t]);
        });
    };

    card.hideTool = function (t) {
        tooling[t].style.display = "none";
        return card;
    };

    card.showTool = function (t) {
        tooling[t].style.display = "initial";
        return card;
    };

    card["setTitle"] = function (t) {
        headingText.title = t;
    };

    card["removeTitle"] = function () {
        card.removeChild(heading);
    };

    card["setBodyHTML"] = function (html) {
        body.innerHTML = html;
    };

    card["setFooterHTML"] = function (t) {
        footer.innerHTML = t;
        footer.className = "card-footer";
        card.appendChild(footer);
    };

    return card;
}

const createPopover = function (title, text) {
    const filter = document.getElementById("filter");
    filter.style.display = 'block';
    filter.style.opacity = '1.0';
    document.getElementById("popup-name").innerHTML = title;
    document.getElementById("popup-body").innerHTML = text;
}

const destroyPopover = function () {
    const filter = document.getElementById("filter");
    filter.style.opacity = '0';
    filter.style.display = 'none';
}

const deleteCard = function (e) {
    const el = e.target,
        parent = el.findAncestorByClassName("card"),
        ancestor = parent.parentNode,
        second = function () {
            parent.animate("height", 1, 300, "easeOut", () => {
                ancestor.removeChild(parent);
            });
        };

    parent.fadeOut(500, second, false);
}

const infoCard = function (el) {
    var text = el.childNodes[0].value
    var title = el.childNodes[0].className
    createPopover(title, text);
}

const editCard = function (el) {
    var parent = el;
    while (parent.className != "card") {
        parent = parent.parentNode;
    }
    var body = parent.getElementsByClassName("card-body")[0];
    var content = body.innerHTML.replaceAll("\n", "").replaceAll("<p>", "").replaceAll("</p>", "\n");
    body.innerHTML = "<textarea>" + content + "</textarea>";
    body.childNodes[0].style.height = body.childNodes[0].scrollHeight + "px";
    el.className = "fa fa-floppy-o";
    el.onclick = () => { sC(el) };
}

const saveCard = function (el) {
    var parent = el;
    while (parent.className != "card") {
        parent = parent.parentNode;
    }
    var body = parent.getElementsByClassName("card-body")[0];
    var content = "<p>" + body.childNodes[0].value.replaceAll("\n", "</p><p>");
    content = content.substring(0, content.length - 3);
    body.innerHTML = content
    el.className = "fa fa-pencil";
    el.onclick = () => { editCard(el) };
}

function bindElementsByClass(classname, event, callback) {
    const elements = document.getElementsByClassName(classname);
    for (let i = 0; i < elements.length; i++) {
        const item = elements[i];
        item.addEventListener(event, callback);
    };
}