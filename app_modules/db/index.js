mysql = require("mysql");
Knex = require("knex");
process = require("process");

const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
};

if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
    if (process.env.SQL_CLIENT === 'mysql') {
        config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
    } else if (process.env.SQL_CLIENT === 'pg') {
        config.host = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
    }
}

// Connect to the database
const knex = Knex({
    client: process.env.SQL_CLIENT,
    connection: config
});
// [END connect]

module.exports.connection = knex;

module.exports.track = function (knex) {
    function recurseChange(fid, change, index) {
        change[index].fid = fid;
        module.exports.connection("changes").insert(change[index]).returning("fid")
            .then(
            () => {
                if (index + 1 < change.length) recurseChange(fid, change, index + 1);   
            }
            );
    }

    return function (req, res, next) {
        if (req.method != "GET") {
            var track = [];
            const trackChanges = function (builder) {
                builder.on('query-response', (response, obj, builder) => {
                    const entry = {
                        method: builder._method,
                        table: builder._single.table,
                        author: req.decoded.uid
                    };

                    if (entry.method == "insert" && entry.table != "feed" && entry.table != "changes") {
                        const changes = builder._single[entry.method];
                        let final = [];
                        for (var key in changes) {
                            if (changes.hasOwnProperty(key) && key != "author") {
                                const row = {
                                    property: key,
                                    old: null,
                                    new: changes[key] 
                                }
                                final.push(row);
                            }
                        }
                        module.exports.connection("feed").insert(entry).returning("fid")
                            .then((data) => {
                                recurseChange(data[0], final, 0);
                            }, (err) => {
                                console.log(err);
                            });
                    }
                });
            }
            if (knex.client._events.start.length < 2) {
                knex.client.on('start', trackChanges);
            }
        }
        next();
    };
}