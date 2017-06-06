module.exports.init = function () {
    bindElementsByClass("close-popover", "click", destroyPopover);
    bindElementsByClass("delete-card", "click", deleteCard);
};

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
    const el = e.target;
    console.log(el);
    const parent = el.findAncestorByClassName("card");
    const ancestor = parent.parentNode;
    const second = function () {
        parent.animate("height", 1, 400, "easeInCubic", () => {
            ancestor.removeChild(parent);
        });
    }
    parent.animate("opacity", 0, 500, "easeInQuartic", second);
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