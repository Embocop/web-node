const http = require("./http.js"),
    cards = require("./cards.js"),
    autosize = require("autosize");

const textTypes = ["background", "experimental-problem", "hypothesis", "conclusion"],
    variableTypes = ["independent-variable", "dependent-variable", "controlled-variable"];

function createExperimentEntry(name, id, image) {
    let image_path = image || '/images/placeholder.png';
    
    entry = document.createElement("span");
    entry.className = "option experiment-entry";
    entry.innerHTML = "<span>" + name + "</span><img src='" + image_path + "'>";
    entry.setAttribute("data-exid", id);

    return entry
}

function createExpCard(datacard) {
    if (datacard.type) 
    const card = cards.createCard(datacard.name.replace("-", " ").toTitleCase(), ["delete", "edit"], datacard.contents);
    card.className += " " + datacard.name.replace(" ", "-");
    card.setToolCallback("edit", () => {
        card.hideTool("edit").showTool("save");
    });
    return card;
}

function createNewCardButton(page, parent, id) {
    const options = {
        problem: ["Background", "Experimental Problem", "Independent Variable", "Dependent Variable"],
        hypothesis: ["Hypothesis", "Mathematic Correlation", "Qualitative Causality"],
        materials: ["Material"],
        procedure: ["Trials", "Groups", "Procedure", "Controlled Variable"], 
        dataanalysis: ["Line Chart", "Scatter Plot", "Column Chart", "Statistical Test"],
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
                card = cards.createCard(options[page][i], ["delete", "save", "edit"], textarea);

            textarea.placeholder = "Write something";
            textarea.rows = "1";
            autosize(textarea);

            card.setToolCallback("save", (card, tool) => {
                card.hideTool("save").showTool("edit");
                module.exports.saveCard(card, page);
            });

            card.setToolCallback("edit", (card, tool) => {
                card.showTool("save").hideTool("edit");
            });

            card.hideTool("edit");

            card.className += " " + options[page][i].toLowerCase().replace(" ", "-");
            card.setAttribute("data-exid", id);

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

module.exports.saveCard = function (card, page) {
    const classes = card.className.split(" "),
        type = classes[classes.length - 1];

    if (textTypes.inArray(type)) {
        const content = card.getElementsByTagName("textarea")[0].value,
            id = card.getAttribute("data-exid");

        const data = {
            name: type,
            contents: content,
            category: page,
            exid: id
        };
        
        http.post("experiment/card/", data,
            (response) => {
                card.body.removeAllChildren();
                card.body.innerHTML = "<p>" + content.replace("\n", "</p><p>"); + "</p>";
            },
            (err) => {
                if (err) console.error(err);
            });
    }
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
        const container = document.createElement("div");
        const pages = {
            problem: document.createElement("div"),
            hypothesis: document.createElement("div"),
            materials: document.createElement("div"),
            procedure: document.createElement("div"),
            dataanalysis: document.createElement("div"),
            conclusion: document.createElement("div")
        };

        for (key in pages) {
            if (pages.hasOwnProperty(key)) {
                const page = pages[key];
                page.className = "experiment-container-sub";

                for (let i = 0; i < experiment.cards[key].length; i++) {
                    page.appendChild(createExpCard(experiment.cards[key][i]));
                }
                page.appendChild(createNewCardButton(key, page, id));
                container.appendChild(page);
            }
        }

        container.className = "experiment-container";
        container.setAttribute("id", "exp");
        
        callback(container);
    });
}