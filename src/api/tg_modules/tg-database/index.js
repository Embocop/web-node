const knex = require('knex');

const dbinfo = require('../../../../settings_xs2jiks3d.json').database;

const connection = {
    host: dbinfo.dbhost,
    user: dbinfo.dbuser,
    password: dbinfo.dbpassword,
    database: dbinfo.dbdatabase,
};

exports.connection = knex({
    client: 'mysql',
    connection: connection,
});
