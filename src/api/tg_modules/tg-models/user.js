const Schema = require('./schema.js');
const WeakSchema = require('./weak-schema.js');
const Model = require('./model.js');
const Errors = require('../tg-responses').error;
const auth = require('../tg-auth');
const db = require('../tg-database').connection;

const Post = require('./post.js');

// Model implementation
class User extends Model {
    constructor(object) {
        const schema = new Schema(User.getSchema().raw);
        const tablename = User.getTableName();
        super(tablename, schema, object);
    }

    login() {
        // Returns promise of successful login with usertoken

        if(!(this.email && this.password)) throw new Errors.MissingCredentials();

        const email = this.email;
        const password = this.password;

        // Retrieve password for the given email
        const passPromise = db.first('uid', 'email', 'password').from(this.tablename).where({
            email: email,
        });

        // Compare given password to hased password
        const checkPromise = passPromise
            .catch((err) => {
                return Promise.reject(new Errors.DatabaseError(err));
            })
            .then((result) => {
                if(!result) {
                    return Promise.reject(new Errors.InvalidEmail());
                }
                else {
                    return auth.verifyPassword(password, result.password);
                }
            })
            .catch((err) => {
                return Promise.reject(err);
            })
            .then((result) => {
                return Promise.resolve(result);
            });

        const promises = [passPromise, checkPromise];

        // Execute all of the promises
        return Promise.all(promises)
            .catch((err) => {
                return Promise.reject(err);
            })
            .then((fulfillments) => {
                const details = {
                    uid: fulfillments[0].uid,
                    email: fulfillments[0].email,
                };
                return auth.createToken(details);
            });
    }

    static getTableName() {
        return 'user';
    }

    static getSchema() {
        return new WeakSchema({
            uid: {
                type: 'number',
                required: true,
                unique: true,
                primary: true,
            },
            name: 'string',
            username: {
                type: 'string',
                required: true,
                unique: true,
            },
            password: {
                type: 'string',
                secure: true,
            },
            email: {
                type: 'string',
                required: true,
                unique: true,
            },
            bio: 'string',
            icon_ext: 'string',
            follower: 'number',
            post: 'number',
            coolness: 'number',
            vote: 'number',
            flagged: 'boolean',
            string: 'number',
            registered: 'date',
            posts: {
                model: Post.class,
                type: 'relationship',
                relationship: 'many',
                by: {
                    relation: {
                        table: 'post',
                        property: 'uid',
                    },
                    self: {
                        table: 'user',
                        property: 'uid',
                    },
                },
            },
            followers: {
                model: User,
                type: 'relationship',
                relationship: 'many',
                by: {
                    relation: {
                        table: 'following',
                        property: 'follower',
                    },
                    self: {
                        table: 'following',
                        property: 'followed',
                    },
                },
            },
            following: {
                model: User,
                type: 'relationship',
                relationship: 'many',
                by: {
                    relation: {
                        table: 'following',
                        property: 'followed',
                    },
                    self: {
                        table: 'following',
                        property: 'follower',
                    },
                },
            },
        });
    }
}

module.exports.class = User;
