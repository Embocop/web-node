const _ = require('underscore');

const Schema = require('./schema.js');
const db = require('../tg-database').connection;
const Errors = require('../tg-responses').error;

class Model {
    constructor(tablename, schema, object) {
        if(!(schema instanceof Schema)) throw new TypeError('Schema type is incompatible');

        this.schema = schema;
        this.tablename = tablename;
        this.attributes = [];
        this.relationships = [];

        if(object && Object.keys(object).length > 0) {
            if(object.constructor === Array) this.arrayConstructor(object);
            else if(typeof object === 'object') this.objectConstructor(object);
        }
        else {
            object = this.schema.required;
            this.arrayConstructor(object);
        }
    }

    static createInstance(Construct, params) {
        function promise(resolve, reject) {
            try {
                const mod = new Construct(params);
                resolve(mod);
            }
            catch(e) {
                reject(e);
            }
        }
        return new Promise(promise);
    }

    arrayConstructor(array, one) {
        one = one || false;
        let field;
        let i;
        let member;
        if (!one && array.length === 0) array = _.union(array, this.schema.required);

        for(i in array) {
            if(array[i]) {
                field = array[i];
                if(this.schema.has(field)) {
                    if(this.schema.isRelationship(field)) {
                        if(this.schema.definitions[field].relationship === 'many') {
                            member = new this.schema.definitions[field].Subconstruct();
                            this[field] = new this.schema.definitions[field].Construct(member);
                        }
                        else {
                            this[field] = new this.schema.definitions[field].Construct();
                        }
                        this.relationships.push(field);
                    }
                    else {
                        this[field] = null;
                        this.attributes.push(field);
                    }
                }
            }
        }
    }

    objectConstructor(object) {
        const missing = _.difference(this.schema.required, _.keys(object));
        let field;
        let value;
        let i;
        for(i in missing) {
            if(missing[i]) object[missing[i]] = null;
        }

        for(field in object) {
            if(object[field]) {
                value = object[field];
                if(value === null || this.schema.evaluate(field, value)) {
                    this[field] = value;
                    if(this.schema.isRelationship(field)) this.relationships.push(field);
                    else this.attributes.push(field);
                }
            }
        }
    }

    getAttributes(unsecure = false, tablename = false) {
        let attribute;
        let i;
        let output = [];

        for(i in this.attributes) {
            if(this.attributes[i]) {
                attribute = this.attributes[i];
                if(!this.schema.isRaw(attribute)) {
                    if(!this.schema.isSecure(attribute)) {
                        if(tablename) output.push(this.tablename + '.' + attribute);
                        else output.push(attribute);
                    }
                    else if(unsecure === true) output.push(attribute);
                }
            }
        }

        if(output.length === 0) return null;
        return output;
    }

    getRawAttributes(o) {
        function getMatchIndices(regex, str) {
            let result = [];
            let match;
            regex = new RegExp(regex, 'g');
            while(match = regex.exec(str))
                result.push(match.index);
            return result;
        }

        function parseRawAttribute(query, params, obj) {
            let test = {};
            let totalLength = 0;
            let totalI = 0;
            let args = [];
            let output = [];
            let low;
            let lowKey;

            output.push(query);

            for(let j in params) {
                if(obj[params[j]] === undefined) {
                    throw new Error('You forgot to define the parameter ' + params[j]);
                }
                test[params[j]] = {};
                test[params[j]].array = getMatchIndices(params[j], query);
                test[params[j]].i = 0;
                totalLength = totalLength + test[params[j]].array.length;
                output[0] = output[0].split(params[j]).join('?');
            }

            while(totalI < totalLength) {
                low = query.length + 10;
                lowKey = '';
                for(let key in test) {
                    if(test[key].array[test[key].i] < low) {
                        lowKey = key;
                        low = test[key].array[test[key].i];
                    }
                }
                totalI += 1;
                test[lowKey].i += 1;
                args.push(obj[lowKey]);
            }

            output.push(args);

            return output;
        }

        let attribute;
        let i;
        let args;
        let query;
        let output = [];

        for(i in this.attributes) {
            if(this.attributes[i]) {
                attribute = this.attributes[i];
                if(this.schema.isRaw(attribute)) {
                    const r = this.schema.definitions[attribute];
                    args = parseRawAttribute(r.query, r.params, o);
                    query = db.raw(args[0], args[1]);
                    output.push(query);
                }
            }
        }

        if(output.length === 0) return null;
        return output;
    }

    getRelationships() {
        return this.relationships;
    }

    getValues() {
        const attributes = this.getAttributes(true);
        const schema = this.schema;
        let attribute;
        let value;
        let i;
        let output = {};

        for(i in attributes) {
            if(attributes[i]) {
                attribute = attributes[i];
                value = this[attribute];
                if(value !== schema.construct(attribute) && !schema.isPrimary(attribute)) {
                    output[attribute] = value;
                }
            }
        }

        if(output.length === 0) return null;
        return output;
    }

    getConditions(primary) {
        const attributes = this.getAttributes();
        const schema = this.schema;
        let attribute;
        let value;
        let i;
        let output = [];

        if(!primary) primary = false;

        for(i in attributes) {
            if(attributes[i]) {
                attribute = attributes[i];
                value = this[attribute];
                if(schema.isUnique(attribute) && value !== null &&
                    value !== schema.construct(attribute)) {
                    if(primary) {
                        if(this.schema.isPrimary(attribute)) {
                            const e = {};
                            e[attribute] = value;
                            output.push(e);
                        }
                    }
                    else {
                        const e = {};
                        e[attribute] = value;
                        output.push(e);
                    }
                }
            }
        }

        if(output.length === 0) return null;
        return output;
    }

    checkRequired(primary) {
        const schema = this.schema;
        let i;
        if(primary) {
            if(!this[schema.primary]) return false;
            return true;
        }
        else {
            for(i in schema.required) {
                if(schema.required[i] === schema.primary) continue;
                if(!this[schema.required[i]]) return false;
            }
            return true;
        }
    }

    getRelationshipLink(relationship) {
        const rschema = this.schema.definitions[relationship];
        const r = this[relationship];
        const by = rschema.by;
        const link = {};
        const filter = [];
        if(by.relation.table !== r.model.tablename) {
            link.self = {
                table: r.model.tablename,
                property: r.model.schema.primary,
            };
            link.relation = {
                table: by.relation.table,
                property: by.relation.property,
            };
        }
        else {
            if(by.relation.table !== by.self.table) {
                link.self = {
                    table: by.relation.table,
                    property: by.relation.property,
                };
                link.relation = {
                    table: by.self.table,
                    property: by.self.property,
                };
            }
            else {
                filter.push({
                    first: by.relation.property,
                    second: this[by.self.property],
                    table: by.self.table,
                    bool: 'and',
                    operator: '=',
                });
            }
        }
        if(filter.length === 0) {
            filter.push({
                first: by.self.property,
                second: this[this.schema.primary],
                table: by.self.table,
                bool: 'and',
                operator: '=',
            });
        }
        return [filter, link];
    }

    getRelatives(ec) {
        const self = this;
        if(!ec) ec = false;

        function promise(resolve, reject) {
            function recurse(relationships, i, len) {
                const type = self.schema.typeRelationship(relationships[i]);
                let prom;
                const rschema = self.schema.definitions[relationships[i]];
                const r = self[relationships[i]];
                if(type === 'many') {
                    const link = self.getRelationshipLink(relationships[i]);
                    r.applyFilter(link[0]);
                    if(Object.keys(link[1]).length > 0) r.applyLink(link[1]);
                    prom = r.populate();
                }
                else if(type === 'one') {
                    r[rschema.by.relation.property] = self[rschema.by.self.property];
                    prom = r.get();
                }
                prom.catch((err) => {
                    if(err.constructor.name === 'EmptyError' && ec !== true) {
                        i += 1;
                        if(i < len) recurse(relationships, i, len);
                        else resolve(self);
                    }
                    else reject(err);
                }).then((relative) => {
                    self[relationships[i]] = relative;
                    i += 1;
                    if(i < len) {
                        recurse(relationships, i, len);
                    }
                    else {
                        resolve(self);
                    }
                });
            }

            const r = self.getRelationships();
            const l = r.length;

            recurse(r, 0, l);
        }

        return new Promise(promise);
    }

    get(options) {
        const defaults = {
            dimensions: 1,
            relationships: true,
            knex: false,
            params: null,
        };

        let attributes;
        let rawAttributes;
        let conditions;
        let relationships;

        if(!options) options = {};
        options = _.defaults(options, defaults);

        try {
            attributes = this.getAttributes(false, true);
            rawAttributes = this.getRawAttributes(options.params);
            conditions = this.getConditions();
            relationships = this.getRelationships();
        }
        catch(e) {
            return Promise.reject(e);
        }

        const self = this;

        if(!(attributes && conditions)) {
            const correctFields = new Errors.CodeError('You must define a valid set of ' +
                'unique attributes and conditions');
            return Promise.reject(correctFields);
        }

        const promise = function(resolve, reject) {
            let i;
            let query = db.select(attributes);

            if(rawAttributes) {
                for(i in rawAttributes) {
                    if(rawAttributes[i]) query = query.select(rawAttributes[i]);
                }
            }

            query = query.from(self.tablename);

            if(conditions.length > 0) {
                query = query.where(conditions[0]);
                if(conditions.length > 1) {
                    for(let i = 1; i < conditions.length; i++) {
                        query = query.andWhere(conditions[i]);
                    }
                }
            }

            if(options.knex) return query.first();

            query.first()
                .catch((err) => {
                    reject(new Errors.DatabaseError(err));
                })
                .then((object) => {
                    if(object) {
                        for(let key in object) {
                            if(object[key]) self[key] = object[key];
                        }
                        if(relationships.length > 0 && options.relationships) {
                            return self.getRelatives();
                        }
                        else return Promise.resolve(self);
                    }
                    else reject(new Errors.NoResults());
                })
                .catch((err) => {
                    reject(err);
                })
                .then((teddy) => {
                    resolve(teddy);
                });
        };

        return new Promise(promise);
    }

    put() {
        const self = this;
        const values = this.getValues();
        const conditions = this.getConditions(true);
        if(!(values && conditions)) throw Error('You must define a primary key as an identifier');

        const promise = function(resolve, reject) {
            db.update(conditions)
                .from(self.tablename)
                .where(conditions)
                .then((updated) => {
                    if(updated !== 0) resolve(updated);
                    else(reject(new Errors.UpdateError()));
                })
                .catch((err) => {
                    reject(new Errors.DatabaseError(err));
                });
        };

        return new Promise(promise);
    }

    post() {
        const self = this;
        const values = this.getValues();
        if(!values) throw new Error('You must define values to be inserted');
        if(!this.checkRequired()) throw new Error('You must define all required values');
        const promise = function(resolve, reject) {
            db(self.tablename).insert(values, self.schema.primary)
                .then((returned) => {
                    if(returned.length !== 0) resolve(returned[0]);
                    else(reject(new Errors.InsertError()));
                })
                .catch((err) => {
                    reject(new Errors.DatabaseError(err));
                });
        };

        return new Promise(promise);
    }

    delete() {
        const self = this;
        const conditions = this.getConditions();
        if(!conditions) throw Error('You must define a valid set of unique attributes' +
            ' and conditions');

        const promise = function(resolve, reject) {
            db.del()
                .from(self.tablename)
                .where(conditions)
                .returning(self.schema.primary)
                .then((primary) => {
                    if(primary.length == 0) reject(new Errors.DeletionError());
                    else resolve(primary[0]);
                })
                .catch((err) => {
                    reject(new Errors.DatabaseError(err));
                });
        };

        return new Promise(promise);
    }
}

module.exports = Model;
