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