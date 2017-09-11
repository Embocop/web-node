const WeakSchema = require('./weak-schema.js');
const Schema = require('./schema.js');
const Model = require('./model.js');

const User = require('./user.js');
const Post = require('./post.js');


// Model implementation
class Com extends Model {
    constructor(object) {
        // Model schema
        const schema = new Schema(Com.getSchema().raw);
        const tablename = Com.getTableName();
        super(tablename, schema, object);
    }

    static getTableName() {
        return 'com';
    }

    static getSchema() {
        return new WeakSchema({
            cid: {
                type: 'number',
                required: true,
                unique: true,
                primary: true,
            },
            pid: {
                type: 'number',
                required: true,
            },
            uid: {
                type: 'number',
                required: true,
            },
            content: {
                type: 'string',
                required: true,
            },
            tier: 'number',
            main_parent: 'number',
            parent: 'number',
            vote: 'number',
            flagged: 'boolean',
            ip_address: 'string',
            city: 'string',
            region: 'string',
            country: 'string',
            longitude: 'number',
            latitude: 'number',
            comment_time: 'date',
            author: {
                model: User.class,
                type: 'relationship',
                relationship: 'one',
                by: {
                    relation: {
                        table: 'user',
                        property: 'uid',
                    },
                    self: {
                        table: 'com',
                        property: 'uid',
                    },
                },
            },
            post: {
                model: Post.class,
                type: 'relationship',
                relationship: 'one',
                by: {
                    relation: {
                        table: 'post',
                        property: 'pid',
                    },
                    self: {
                        table: 'com',
                        property: 'pid',
                    },
                },
            },
            ancestor: {
                model: Com,
                type: 'relationship',
                relationship: 'one',
                by: {
                    relation: {
                        table: 'com',
                        property: 'cid',
                    },
                    self: {
                        table: 'com',
                        property: 'parent',
                    },
                },
            },
            children: {
                model: Com,
                type: 'relationship',
                relationship: 'many',
                by: {
                    relation: {
                        table: 'com',
                        property: 'parent',
                    },
                    self: {
                        table: 'com',
                        property: 'cid',
                    },
                },
            },
        });
    }
}

module.exports.class = Com;
