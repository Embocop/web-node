const db = require(__app + "db"),
    knex = db.connection,
    _ = require("underscore"),
    tablename = 'experiments'

// Create a list of Experiment objects from an array of objects
function genExperiments(raw) {
    let experiments = []
    for (let i = 0; i < raw.length; i++) {
        experiments.push(new Experiment(raw[i]))
    }
    return experiments
}

// Get cards associated with a set of experiments
function getCards(rows, index, length) {
    return new Promise((resolve, reject) => {
        if (index == length) resolve(genExperiments(rows))
        else {
            knex.select().from("cards").where({ exid: rows[index].exid })
                .then(function (cards) {
                    rows[index].cards = {
                        problem: [],
                        hypothesis: [],
                        materials: [],
                        procedure: [],
                        dataanalysis: [],
                        conclusion: []
                    }
                    for (let i = 0; i < cards.length; i++) {
                        rows[index].cards[cards[i].category].push(cards[i]);
                    }
                    getCards(rows, index + 1, length)
                        .then((experiments) => resolve(experiments))
                        .catch((err) => reject(err))
                })
                .catch(err => reject(err))
        }
    })
}

// Experiment schema for building Experiment objects
const schema = {
    exid: "number",
    name: "string",
    author: "number",
    summary: "string",
    timestamp: "object",
    followers: "number",
    nocards: "number",
    cards: "object",
    contributors: "number",
    fill(options) {
        const defaults = {
            offset: 0,
            limit: 10,
            selector: {}
        }
        let flag = false
        _.defaults(options, defaults)
        if (this.cards) {
            flag = true
            delete this.cards
        }
        return new Promise((resolve, reject) => {
            knex.select(this.fields()).from(tablename).where(options.selector).limit(options.limit).offset(options.offset)
                .then((rows) => {
                    if (rows.length == 0) reject("empty")
                    else {
                        if (flag) {
                            getCards(rows, 0, rows.length)
                                .then((experiments) => resolve(experiments))
                                .catch((err) => reject(err))
                        } else {
                            if (rows.length == 1) resolve(new Experiment(rows[0]))
                            else {
                                resolve(genExperiments(rows))
                            }
                        }
                    }
                })
                .catch((err) => reject(err))
        })
    },
    fields(model) {
        if (model) {
            const discard = _.difference(this.fields(), model)
            delete discard.exid
            return _.omit(this, discard)
        } else {
            let output = []
            for (key in this) {
                if (this.hasOwnProperty(key) && typeof this[key] !== "function") {
                    output.push(key)
                }
            }
            return output
        }
    }
}

// Constructor function for experiment
const Experiment = function (model) {
    for (key in model) {
        if (Object.prototype.hasOwnProperty.call(model, key) && schema.hasOwnProperty(key) && (typeof model[key] === schema[key] || model[key] === null)) {
            this[key] = model[key]
        } else {
            throw new TypeError("Property: " + key + " in object is not of type: " + schema[key])
        }
    }

    this.save = function () {
        return new Promise((resolve, reject) => {
            db.upsert(tablename, _.omit(this, _.functions(this)))
                .returning("exid")
                .then((rows) => resolve(rows))
                .catch((err) => reject(err))
        })
    }
}

exports.experiment = Experiment
exports.schema = schema