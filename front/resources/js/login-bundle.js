(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

    card["setToolCallback"] = function (t, callback) {
        tooling[t].addEventListener("click", () => {
            callback(card, tooling[t]);
        });
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
},{}],2:[function(require,module,exports){
const http = require("./http.js");
const cards = require("./cards.js");
const autosize = require("autosize");

function createExperimentEntry(name, id, image) {
    let image_path = image || '/images/placeholder.png';
    
    entry = document.createElement("span");
    entry.className = "option experiment-entry";
    entry.innerHTML = "<span>" + name + "</span><img src='" + image_path + "'>";
    entry.setAttribute("data-exid", id);

    return entry
}

function createExpCard(datacard) {
    const card = cards.createCard(data.type, ["delete"], card.contents);
    return card;
}

function createNewCardButton(page, parent) {
    const options = {
        problem: ["Background", "Experimental Problem", "Independent Variable", "Dependent Variable"],
        hypothesis: ["Hypothesis", "Mathematic Correlation", "Qualitative Causality"],
        materials: ["Material"],
        procedure: ["Trials", "Groups", "Procedure"], 
        analysis: ["Line Chart", "Scatter Plot", "Column Chart", "Statistical Test"],
        conclusion: ["Conclusion"]
    };


    const container = document.createElement("div");
    container.style.display = "inline-block";

    const menu = document.createElement("ul");
    for (let i = 0; i < options[page].length; i++) {
        const item = document.createElement("li");
        item.innerHTML = options[page][i];
        item.addEventListener("mousedown", () => {
            const textarea = document.createElement("textarea"),
                card = cards.createCard(options[page][i], ["delete", "save"], textarea);

            textarea.placeholder = "Write something";
            textarea.rows = "1";
            autosize(textarea);

            card.setToolCallback("save", (card, tool) => {
                tool.className = "fa fa-pencil";
            });

            parent.insertBefore(card, container);
        });
        menu.appendChild(item);
    }

    menu.style.display = "none";

    const button = document.createElement("button");
    button.className = "new-card-button";
    button.innerHTML = "<i class='fa fa-plus-square-o' ></i> New Card";
    button.addEventListener("click", () => {
        menu.style.display = "inline-block";
        menu.style.transform = "scaleY(1)"
    });

    button.addEventListener("blur", () => {
        menu.style.display = "none";
        menu.style.transform = "scaleY(0)";
    });

    container.style.marginLeft = "auto";
    container.style.marginRight = "auto";

    container.appendChild(button);
    container.appendChild(menu);

    return container;
}

module.exports.createExperiment = function (name, description, card) {
    http.post("experiment/", { name: name, description: description }, (response) => {
        const message = "<div>You created a new experiment, <b>" + name + "</b>." +
            "<br><span class = 'sub'>You added a summary:</span> <blockquote>" +
            description + "</blockquote></div>";

        card.setBodyHTML(message);
        card.removeTitle();
        card.setFooterHTML(globals.currentDateTime());

        subtoolbar.appendChild(createExperimentEntry(name, response.data[0]));

    }, (err) => {
        alert(err);
        console.log(err);
    });
};

module.exports.getExperiments = function (callback) {
    http.get("experiment", {}, (response) => {
        const data = response.data;
        for (let i = 0; i < data.length; i++) {
            const entry = createExperimentEntry(data[i].name, data[i].exid);
            callback(entry);
        }
    },
        (err) => {
            console.log(err);
            alert("Error");
        }
    );
}

module.exports.getExperimentById = function (id, callback) {
    http.get("experiment/" + id, {}, (response) => {
        if (response.code != 204) {
            console.log(response.data);
            callback(response.data);
        }
    },
        (err) => {
            console.error(err);
            alert("error");
        }
    );
}

module.exports.loadExperiment = function (id, callback) {
    module.exports.getExperimentById(id, (experiment) => {
        const container = document.createElement("div"),
            problem = document.createElement("div"),
            hypothesis = document.createElement("div"),
            materials = document.createElement("div"),
            procedure = document.createElement("div"),
            analysis = document.createElement("div"),
            conclusion = document.createElement("div");

        problem.className = "experiment-container-sub";
        
        for (let i = 0; i < experiment.cards.problem.length; i++) {
            createExpCard(experiment.cards.problem[i]);
        }
        problem.appendChild(createNewCardButton("problem", problem));
        container.appendChild(problem);

        hypothesis.className = "experiment-container-sub";
        for (let i = 0; i < experiment.cards.hypothesis.length; i++) {
            createExpCard(experiment.cards.hypothesis[i]);
        }
        hypothesis.appendChild(createNewCardButton("hypothesis", hypothesis));
        container.appendChild(hypothesis);

        materials.className = "experiment-container-sub";
        for (let i = 0; i < experiment.cards.materials.length; i++) {
            createExpCard(experiment.cards.materials[i]);
        }
        materials.appendChild(createNewCardButton("materials", materials));
        container.appendChild(materials);

        procedure.className = "experiment-container-sub";
        for (let i = 0; i < experiment.cards.procedure.length; i++) {
            createExpCard(experiment.cards.procedure[i]);
        }
        procedure.appendChild(createNewCardButton("procedure", procedure));
        container.appendChild(procedure);

        analysis.className = "experiment-container-sub";
        for (let i = 0; i < experiment.cards.dataanalysis.length; i++) {
            createExpCard(experiment.cards.dataanalysis[i]);
        }
        analysis.appendChild(createNewCardButton("analysis", analysis));
        container.appendChild(analysis);

        conclusion.className = "experiment-container-sub";
        for (let i = 0; i < experiment.cards.conclusion.length; i++) {
            createExpCard(experiment.cards.conclusion[i]);
        }
        conclusion.appendChild(createNewCardButton("conclusion", conclusion));
        container.appendChild(conclusion);

        container.className = "experiment-container";
        container.setAttribute("id", "exp");
        
        callback(container);
    });
}
},{"./cards.js":1,"./http.js":4,"autosize":7}],3:[function(require,module,exports){
"use strict";

module.exports.configure = function (modules) {
    const timing = modules.timing;

    String.prototype.replaceAll = function (search, replacement) {
        const target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

    HTMLElement.prototype.getChildByClass = function (classname) {
        let output = [];
        for (let i = 0; i < this.childNodes.length; i++) {
            if (this.childNodes[i].className != null && this.childNodes[i].className.includes(classname)) {
                let names = this.childNodes[i].className.split(" ");
                for (let j = 0; j < names.length; j++) {
                    if (names[j] == classname) output.push(this.childNodes[i]); 
                }
            }
        }
        return output;
    }

    HTMLElement.prototype.removeAllChildren = function () {
        while (this.children.length > 0) {
            this.removeChild(this.children[0]);
        }
    }

    HTMLElement.prototype.hasClass = function (target) {
        const classList = this.className.split(" ");
        var flag = false;
        classList.forEach((item, index) => {
            if (item == target) flag = true;
        });
        return flag;
    }

    HTMLElement.prototype.findAncestorByClassName = function (target) {
        if (this.hasClass(target)) return this;
        else {
            if (this.parentNode != null) return this.parentNode.findAncestorByClassName(target);
            else return null;
        }
    }

    HTMLElement.prototype.animate = function (property, target, duration, type, callback) {
        const current = parseFloat(window.getComputedStyle(this, null).getPropertyValue(property).replace("px", "")),
            diff = target - current,
            inc = diff / (duration / 10);
        var unit = "";

        if (property.includes("-")) {
            property = property.split("-")[0] + property.split("-")[1].capitalize();
        }
        
        if (property != "opacity") {
            unit = "px";
        }

        this.style[property] = current + unit;
        timing.timedLoop((t) => {
            this.style[property] = timing[type](duration - t, current, diff, duration) + unit;
        }, duration, 10, callback);
    }

    HTMLElement.prototype.fadeOut = function (duration, callback, remove) {
        const current = parseFloat(window.getComputedStyle(this, null).getPropertyValue("opacity")),
            diff = 0 - current,
            inc = diff / (duration / 10);

        this.style.opacity = current;
        timing.timedLoop((t) => {
            this.style.opacity = timing.easeInQuartic(duration - t, current, diff, duration);
        }, duration, 10, () => {
            if (remove != false) {
                this.style.display = "none";
            }
            callback();
        });
    }

    HTMLElement.prototype.fadeIn = function (duration, callback) {
        this.style.display = "initial";
        const current = parseFloat(window.getComputedStyle(this, null).getPropertyValue("opacity"));
        const diff = 1 - current;
        const inc = diff / (duration / 10);

        this.style.opacity = current;
        timing.timedLoop((t) => {
            this.style.opacity = timing.easeInQuartic(duration - t, current, diff, duration);
        }, duration, 10, callback);
    }

    var smoothScroll = function (anchor, duration) {
        // Calculate how far and how fast to scroll
        const resolution = 16;

        const startLocation = window.pageYOffset;
        const endLocation = module.exports.getElementCoords(anchor).top - 65;
        const distance = endLocation - startLocation;
        const increments = distance / (duration / resolution);
        var counter = 0;
        let stopAnimation;

        // Scroll the page by an increment, and check if it's time to stop
        const animateScroll = function () {
            counter += resolution
            const next = timing.easeOutCubic(counter, startLocation, distance, duration);
            window.scrollTo(0, next);
            stopAnimation();
        };

        // If scrolling down
        if (increments >= 0) {
            // Stop animation when you reach the anchor OR the bottom of the page
            stopAnimation = function () {
                const travelled = window.pageYOffset;
                if ((travelled >= (endLocation - increments)) || ((window.innerHeight + travelled) >= document.body.offsetHeight)) {
                    clearInterval(runAnimation);
                }
            };
        }
        // If scrolling up
        else {
            // Stop animation when you reach the anchor OR the top of the page
            stopAnimation = function () {
                const travelled = window.pageYOffset;
                if (travelled <= (endLocation || 0)) {
                    clearInterval(runAnimation);
                }
            };
        }

        // Loop the animation function
        const runAnimation = setInterval(animateScroll, resolution);

    };

    // Define smooth scroll links
    var scrollToggle = document.querySelectorAll('.smooth');

    // For each smooth scroll link
    [].forEach.call(scrollToggle, function (toggle) {

        // When the smooth scroll link is clicked
        toggle.addEventListener('click', function (e) {

            // Prevent the default link behavior
            e.preventDefault();

            // Get anchor link and calculate distance from the top
            var dataID = toggle.getAttribute('href');
            var dataTarget = document.querySelector(dataID);
            var dataSpeed = 1000;

            // If the anchor exists
            if (dataTarget) {
                // Scroll to the anchor
                smoothScroll(dataTarget, dataSpeed || 500);
            }

        }, false);

    });
}

module.exports.getPosition = function (element) {
    let xPosition = 0;
    let yPosition = 0;

    while (element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }

    return { x: xPosition, y: yPosition };
}

module.exports.getElementCoords = function (elem) {
    var root = document.documentElement,
        body = document.body,
        sTop = window.pageYOffset || root.scrollTop || body.scrollTop,
        sLeft = window.pageXOffset || root.scrollLeft || body.scrollLeft,
        cTop = root.clientTop || body.clientTop || 0,
        cLeft = root.clientLeft || body.clientLeft || 0,
        rect = elem.getBoundingClientRect(),
        top = Math.round(rect.top + sTop - cTop),
        left = Math.round(rect.left + sLeft - cLeft);

    return {
        top: top,
        left: left
    };
}


module.exports.formatDate = function(date) {
    var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];

    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return monthNames[monthIndex] + ' ' + day + ', ' + year + '&nbsp;&nbsp;' + date.getHours() + ":" + date.getMinutes();
}

module.exports.currentDateTime = function () {
    return module.exports.formatDate(new Date());  // show current date-time in console
}
},{}],4:[function(require,module,exports){
module.exports.post = function (url, body, success, error) {
    const request = new XMLHttpRequest();
    request.open('POST', '/api/' + url);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200 || request.status === 201) {
                success(JSON.parse(request.responseText));
            } else {
                error(request);
            }
        }
    }
    request.send(JSON.stringify(body));
};

module.exports.get = function (url, body, success, error) {
    const request = new XMLHttpRequest(),
        params = Object.keys(body).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(body[key]);
        }).join('&');
    request.open('GET', '/api/' + url + "?" + params);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200 || request.status === 204) {
                success(JSON.parse(request.responseText));
            } else {
                error(request);
            }
        }
    }
    request.send();
}

module.exports.delete_cookie = function (name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT; Path=/;';
};
},{}],5:[function(require,module,exports){
const globals = require("./global.js"),
    timing = require("./timing.js"),
    http = require("./http.js"),
    cards = require("./cards.js"),
    autosize = require("autosize"),
    experiments = require("./experiments.js");

globals.configure({ timing: timing });
cards.init();

const loader = document.getElementById("loader"),
    login = document.getElementById("login"),
    username = document.getElementById("username-container"),
    usernameInput = document.getElementById("username"),
    password = document.getElementById("password-container"),
    passwordInput = document.getElementById("password"),
    loginButton = document.getElementById("login-button"),
    curtain = document.getElementById("curtain"),
    message = document.getElementById("message-container"),
    toolbar = document.getElementById("primary"),
    subtoolbar = document.getElementById("secondary"),
    logout = document.getElementById("logout"),
    appbody = document.getElementById("appbody"),
    newExperiment = document.getElementById("new-experiment"),
    minor = document.getElementById("minor"),
    myExperiments = document.getElementById("my-experiments"),
    myFeed = document.getElementById("my-feed");

function removeExperiments() {
    const entries = document.getElementsByClassName("experiment-entry"),
        len = entries.length;
    let counter = 0;

    while (entries.length > 0 && counter < len) {
        subtoolbar.removeChild(entries[0]);
        counter++;
    }
}

const revealApp = function() {
    const width = parseInt(window.getComputedStyle(curtain, null).getPropertyValue("width").replace("px", ""));
    login.fadeOut(500, () => { });

    usernameInput.innerHTML = "";
    username.className = "hover";
    passwordInput.value = "";
    password.className = "hover";

    curtain.animate("margin-left", width * -1, 1000, "easeOutCubic", () => {
        curtain.style.display = "none";
        getUserFeed();
    });
}

const hideApp = function () {
    prev = toolbar.getChildByClass("selected");
    if (prev.length > 0) prev[0].className = "option";
    myFeed.className += " selected";
    subtoolbar.style.marginLeft = "-80px";
    subtoolbar.className = "toolbar";
    minor.style.marginLeft = "-250px";
    removeExperiments();
    curtain.style.display = "block";
    toolbar.className = "toolbar wait";
    curtain.animate("margin-left", 0, 1000, "easeOutCubic", () => {
        loader.fadeIn(500, () => {
            checkLogin();
        });
    });
}

const checkLogin = function () {
    setTimeout(() => {
        loader.fadeOut(500, () => {
            http.post("auth/verify", {}, () => {
                revealApp();
            },
                (err) => {
                    loader.style.display = "none";
                    login.style.display = "block";
                    login.style.opacity = 0;
                    login.fadeIn(500, () => { });
                });
        });
    }, 2000);
}

const createFeedCard = function (entry) {
    if (entry.method == "insert") {
        const card = cards.createCard("null", {}, "");
        let message;

        message = "<div>You created a new " + entry.table.substring(0, entry.table.length - 1) + ", <b>" +
            entry.changes.name.new + "</b>.";

        for (let prop in entry.changes) {
            if (entry.changes.hasOwnProperty(prop) && prop != "name") {
                message += "<br /><span class = 'sub'>You added a " + prop + ":</span>" + "<blockquote>" +
                    entry.changes[prop].new + "</blockquote>";
            }
        }

        message += "</div>";

        card.setBodyHTML(message);
        card.removeTitle();
        card.setFooterHTML(globals.formatDate(new Date(entry.timestamp)));
        card.className += " col-md-8"

        appbody.insertBefore(card, appbody.children[0]);
    }
}

const getUserFeed = function () {
    console.log("Feed");
    http.get("user/feed", {}, (response) => {
        if (Object.keys(response).length > 0) {
            for (var key in response.data) {
                if (response.data.hasOwnProperty(key)) {
                    createFeedCard(response.data[key]);
                }
            }
        }
    }, (err) => {
        console.log(err);
    });
}

usernameInput.addEventListener("focusin", () => {
    username.className = "active";
});

usernameInput.addEventListener("focusout", () => {
    if (usernameInput.innerHTML.trim() === "") {
        username.className = "hover";
    }
});

passwordInput.addEventListener("focusin", () => {
    password.className = "active";
});

passwordInput.addEventListener("focusout", () => {
    if (passwordInput.value === "") {
        password.className = "hover";
    }
});

loginButton.addEventListener("click", () => {
    const username_value = usernameInput.innerHTML,
        password_value = passwordInput.value,
        credentials = {
            username: username_value,
            password: password_value,
            remember: true
        }

    const failure = function (err) {
            // For Development
            console.log(err);

            message.style.display = "block";
            message.style.opacity = 0;
            message.style.color = "red";
            message.style.fontSize = "20px";
            message.fadeIn(500, () => {
                setTimeout(() => {
                    message.fadeOut(500, () => { });
                }, 3500);
            });
        }

    http.post("auth/login", credentials, revealApp, failure);
});

logout.addEventListener("click", () => {
    http.post("auth/logout", {}, hideApp, () => {
        alert("Could not log out");
    });
});

newExperiment.addEventListener("click", () => {
    const body = document.createElement("div"),
        name = document.createElement("input"),
        nameLabel = document.createElement("div"),
        description = document.createElement("textarea"),
        descriptionLabel = document.createElement("div");

    nameLabel.innerHTML = "Experiment Name";
    name.setAttribute("type", "text");
    name.style.fontSize = "22px";

    body.appendChild(name);
    body.appendChild(nameLabel);

    descriptionLabel.innerHTML = "Experiment Description";
    description.rows = "1";
    body.appendChild(description);
    body.appendChild(descriptionLabel);

    autosize(description);

    const card = cards.createCard("Start an Experiment", ["delete", "save"], body);

    card.className += " col-md-8";

    card.setToolCallback("save", () => {
        experiments.createExperiment(name.value, description.value, card);
    });

    appbody.insertBefore(card, appbody.children[0]);
});

myExperiments.addEventListener("click", () => {
    appbody.removeAllChildren();
    prev = toolbar.getChildByClass("selected");
    if (prev.length > 0) prev[0].className = "option";
    myExperiments.className += " selected";
    toolbar.className = "toolbar peek";
    subtoolbar.style.marginLeft = "0px";
    appbody.style.width = "calc(50% - 325px)";
    experiments.getExperiments((entry) => {
        entry.addEventListener('click', () => {
            subtoolbar.style.marginLeft = "-170px";
            subtoolbar.className += " peek";
            minor.style.marginLeft = "0px";
            appbody.style.width = "calc(50% - 405px)";
            prev = subtoolbar.getChildByClass("selected experiment-entry");
            if (prev.length > 0) prev[0].className = "option";
            entry.className += " selected";
            experiments.loadExperiment(entry.getAttribute("data-exid"), (experiment) => {
                appbody.appendChild(experiment);
            });
        });
        subtoolbar.insertBefore(entry, newExperiment);
    });
});

myFeed.addEventListener("click", () => {
    const prev = toolbar.getChildByClass("selected");
    if (prev.length > 0) prev[0].className = "option";
    myFeed.className += " selected";
    appbody.removeAllChildren();
    toolbar.className = "toolbar wait";
    subtoolbar.className = "toolbar";
    subtoolbar.style.marginLeft = "-80px";
    minor.style.marginLeft = "-250px";
    appbody.style.width = "calc(50% - 245px)";
    removeExperiments();
    getUserFeed();
});

////  ON WINDOW LOAD!

checkLogin();
const collection = document.getElementsByClassName("part-selector");
for (let i = 0; i < collection.length; i++) {
    collection[i].addEventListener("click", () => {
        const prev = minor.getChildByClass("selected");
        if (prev.length > 0) prev[0].className = "option part-selector";
        collection[i].className += " selected";
        const offset = collection[i].getAttribute("data-target");
        document.getElementById("exp").style.left = "-" + offset + "00%";
    });
}
},{"./cards.js":1,"./experiments.js":2,"./global.js":3,"./http.js":4,"./timing.js":6,"autosize":7}],6:[function(require,module,exports){
var animation;


module.exports.easeIn = function (t, b, c, d) {
    t /= d;
    return c * t * t + b;
};

module.exports.easeOut = function (t, b, c, d) {
    t /= d;
    return -c * t * (t - 2) + b;
};

module.exports.easeInOut = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
};

module.exports.easeOutCubic = function (t, b, c, d) {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
};

module.exports.easeInCubic = function (t, b, c, d) {
    t /= d;
    return c * t * t * t + b;
};

module.exports.easeInQuartic = function (t, start, interval, duration) {
    t = t / duration;
    return interval * t * t * t * t + start;
};

module.exports.timedLoop = function (callback, duration, increment, done) {
    if (duration >= 0) {
        animation = setTimeout(() => {
            callback(duration);
            module.exports.timedLoop(callback, duration - increment, increment, done);
        }, increment);
    }
    else {
        if (done != null) {
            done();
        }
    }
}

module.exports.animation = animation;
},{}],7:[function(require,module,exports){
/*!
	Autosize 3.0.21
	license: MIT
	http://www.jacklmoore.com/autosize
*/
(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define(['exports', 'module'], factory);
	} else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
		factory(exports, module);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports, mod);
		global.autosize = mod.exports;
	}
})(this, function (exports, module) {
	'use strict';

	var map = typeof Map === "function" ? new Map() : (function () {
		var keys = [];
		var values = [];

		return {
			has: function has(key) {
				return keys.indexOf(key) > -1;
			},
			get: function get(key) {
				return values[keys.indexOf(key)];
			},
			set: function set(key, value) {
				if (keys.indexOf(key) === -1) {
					keys.push(key);
					values.push(value);
				}
			},
			'delete': function _delete(key) {
				var index = keys.indexOf(key);
				if (index > -1) {
					keys.splice(index, 1);
					values.splice(index, 1);
				}
			}
		};
	})();

	var createEvent = function createEvent(name) {
		return new Event(name, { bubbles: true });
	};
	try {
		new Event('test');
	} catch (e) {
		// IE does not support `new Event()`
		createEvent = function (name) {
			var evt = document.createEvent('Event');
			evt.initEvent(name, true, false);
			return evt;
		};
	}

	function assign(ta) {
		if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || map.has(ta)) return;

		var heightOffset = null;
		var clientWidth = ta.clientWidth;
		var cachedHeight = null;

		function init() {
			var style = window.getComputedStyle(ta, null);

			if (style.resize === 'vertical') {
				ta.style.resize = 'none';
			} else if (style.resize === 'both') {
				ta.style.resize = 'horizontal';
			}

			if (style.boxSizing === 'content-box') {
				heightOffset = -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
			} else {
				heightOffset = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
			}
			// Fix when a textarea is not on document body and heightOffset is Not a Number
			if (isNaN(heightOffset)) {
				heightOffset = 0;
			}

			update();
		}

		function changeOverflow(value) {
			{
				// Chrome/Safari-specific fix:
				// When the textarea y-overflow is hidden, Chrome/Safari do not reflow the text to account for the space
				// made available by removing the scrollbar. The following forces the necessary text reflow.
				var width = ta.style.width;
				ta.style.width = '0px';
				// Force reflow:
				/* jshint ignore:start */
				ta.offsetWidth;
				/* jshint ignore:end */
				ta.style.width = width;
			}

			ta.style.overflowY = value;
		}

		function getParentOverflows(el) {
			var arr = [];

			while (el && el.parentNode && el.parentNode instanceof Element) {
				if (el.parentNode.scrollTop) {
					arr.push({
						node: el.parentNode,
						scrollTop: el.parentNode.scrollTop
					});
				}
				el = el.parentNode;
			}

			return arr;
		}

		function resize() {
			var originalHeight = ta.style.height;
			var overflows = getParentOverflows(ta);
			var docTop = document.documentElement && document.documentElement.scrollTop; // Needed for Mobile IE (ticket #240)

			ta.style.height = 'auto';

			var endHeight = ta.scrollHeight + heightOffset;

			if (ta.scrollHeight === 0) {
				// If the scrollHeight is 0, then the element probably has display:none or is detached from the DOM.
				ta.style.height = originalHeight;
				return;
			}

			ta.style.height = endHeight + 'px';

			// used to check if an update is actually necessary on window.resize
			clientWidth = ta.clientWidth;

			// prevents scroll-position jumping
			overflows.forEach(function (el) {
				el.node.scrollTop = el.scrollTop;
			});

			if (docTop) {
				document.documentElement.scrollTop = docTop;
			}
		}

		function update() {
			resize();

			var styleHeight = Math.round(parseFloat(ta.style.height));
			var computed = window.getComputedStyle(ta, null);

			// Using offsetHeight as a replacement for computed.height in IE, because IE does not account use of border-box
			var actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(computed.height)) : ta.offsetHeight;

			// The actual height not matching the style height (set via the resize method) indicates that
			// the max-height has been exceeded, in which case the overflow should be allowed.
			if (actualHeight !== styleHeight) {
				if (computed.overflowY === 'hidden') {
					changeOverflow('scroll');
					resize();
					actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
				}
			} else {
				// Normally keep overflow set to hidden, to avoid flash of scrollbar as the textarea expands.
				if (computed.overflowY !== 'hidden') {
					changeOverflow('hidden');
					resize();
					actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
				}
			}

			if (cachedHeight !== actualHeight) {
				cachedHeight = actualHeight;
				var evt = createEvent('autosize:resized');
				try {
					ta.dispatchEvent(evt);
				} catch (err) {
					// Firefox will throw an error on dispatchEvent for a detached element
					// https://bugzilla.mozilla.org/show_bug.cgi?id=889376
				}
			}
		}

		var pageResize = function pageResize() {
			if (ta.clientWidth !== clientWidth) {
				update();
			}
		};

		var destroy = (function (style) {
			window.removeEventListener('resize', pageResize, false);
			ta.removeEventListener('input', update, false);
			ta.removeEventListener('keyup', update, false);
			ta.removeEventListener('autosize:destroy', destroy, false);
			ta.removeEventListener('autosize:update', update, false);

			Object.keys(style).forEach(function (key) {
				ta.style[key] = style[key];
			});

			map['delete'](ta);
		}).bind(ta, {
			height: ta.style.height,
			resize: ta.style.resize,
			overflowY: ta.style.overflowY,
			overflowX: ta.style.overflowX,
			wordWrap: ta.style.wordWrap
		});

		ta.addEventListener('autosize:destroy', destroy, false);

		// IE9 does not fire onpropertychange or oninput for deletions,
		// so binding to onkeyup to catch most of those events.
		// There is no way that I know of to detect something like 'cut' in IE9.
		if ('onpropertychange' in ta && 'oninput' in ta) {
			ta.addEventListener('keyup', update, false);
		}

		window.addEventListener('resize', pageResize, false);
		ta.addEventListener('input', update, false);
		ta.addEventListener('autosize:update', update, false);
		ta.style.overflowX = 'hidden';
		ta.style.wordWrap = 'break-word';

		map.set(ta, {
			destroy: destroy,
			update: update
		});

		init();
	}

	function destroy(ta) {
		var methods = map.get(ta);
		if (methods) {
			methods.destroy();
		}
	}

	function update(ta) {
		var methods = map.get(ta);
		if (methods) {
			methods.update();
		}
	}

	var autosize = null;

	// Do nothing in Node.js environment and IE8 (or lower)
	if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
		autosize = function (el) {
			return el;
		};
		autosize.destroy = function (el) {
			return el;
		};
		autosize.update = function (el) {
			return el;
		};
	} else {
		autosize = function (el, options) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], function (x) {
					return assign(x, options);
				});
			}
			return el;
		};
		autosize.destroy = function (el) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], destroy);
			}
			return el;
		};
		autosize.update = function (el) {
			if (el) {
				Array.prototype.forEach.call(el.length ? el : [el], update);
			}
			return el;
		};
	}

	module.exports = autosize;
});
},{}]},{},[5]);
