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
            appbody.removeAllChildren();
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