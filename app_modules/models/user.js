const knex = require(__app + "db").connection;
const tablename = 'user'
const schema = {
    username: "string",
    uid: "number",
    email: "string",
    first: "string",
    last: "string",
    password: "string",
    role: "number",
    bio: "string",
    joined: "object",
}

const User = function (model) {
    for (key in model) {
        if (Object.prototype.hasOwnProperty.call(model, key) && schema.hasOwnProperty(key) && typeof model[key] === schema[key]) {
            this[key] = model[key]
        } else {
            throw new TypeError("Property: " + key + " in object is not of type: " + schema[key])
        }
    }
}

exports.User = User
exports.schema = schema