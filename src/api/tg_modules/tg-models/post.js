const WeakSchema = require('./weak-schema.js');
const Schema = require('./schema.js');
const Model = require('./model.js');

const User = require('./user.js');
const Com = require('./comment.js');

const distanceQuery = 'distanceXY(post.latitude, post.longitude, x, y)';

const trendQuery = 'trend(post_time, vote, view)';


// Model implementation
class Post extends Model {
    constructor(object) {
        // Model schema
        const schema = new Schema(Post.getSchema().raw);
        const tablename = Post.getTableName();
        super(tablename, schema, object);
    }

    static getTableName() {
        return 'post';
    }

    static getSchema() {
        return new WeakSchema({
            pid: {
                type: 'number',
                required: true,
                unique: true,
                primary: true,
            },
            uid: {
                type: 'number',
                required: true,
            },
            content: {
                type: 'string',
                required: true,
            },
            view: 'number',
            vote: 'number',
            flagged: 'boolean',
            ip_address: 'string',
            city: 'string',
            region: 'string',
            country: 'string',
            longitude: 'number',
            latitude: 'number',
            post_time: 'date',
            algo_value: 'number',
            category: 'string',
            scraped: 'boolean',
            distance: {
                type: 'number',
                query: distanceQuery,
                params: ['x', 'y'],
                raw: true,
            },
            trend: {
                type: 'number',
                query: trendQuery,
                params: [],
                raw: true,
            },
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
                        table: 'post',
                        property: 'uid',
                    },
                },
            },
            comments: {
                model: Com.class,
                type: 'relationship',
                relationship: 'many',
                by: {
                    relation: {
                        table: 'com',
                        property: 'pid',
                    },
                    self: {
                        table: 'post',
                        property: 'pid',
                    },
                },
            },
        });
    }
}

module.exports.class = Post;
