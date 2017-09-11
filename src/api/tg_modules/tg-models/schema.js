const _ = require('underscore');

const Collection = require('./collection.js');
const WeakSchema = require('./weak-schema.js');

const typeReference = {
    string: {
        type: 'string',
        Construct: String,
    },
    number: {
        type: 'number',
        Construct: Number,
    },
    object: {
        type: 'object',
        Construct: Object,
    },
    boolean: {
        type: 'object',
        Construct: Boolean,
    },
    date: {
        type: 'object',
        Construct: Date,
    },
};
const defaultDefinition = {
    relationship: null,
    primary: false,
    required: false,
    secure: false,
    unique: false,
    by: null,
    model: null,
    limit: 10,
    query: null,
};

class Schema extends WeakSchema {
    constructor(object) {
        super(object);

        this.definitions = {};

        let i = 0;

        let field;
        let relationship;
        let value;

        for(i in this.fields) {
            if(this.fields[i]) {
                field = this.fields[i];
                value = object[field];
                this.defineField(field, value);
            }
        }

        for(i in this.relationships) {
            if(this.relationships[i]) {
                relationship = this.relationships[i];
                value = object[relationship];
                this.defineRelationship(relationship, value);
            }
        }
    }

    defineField(field, value) {
        let definition;
        let defaulted;
        if(typeof value === 'string') {
            if(!_.contains(_.keys(typeReference), value)) {
                throw new Error('String definitions must define a type');
            }
            definition = _.extend(_.clone(defaultDefinition), _.clone(typeReference[value]));
            this.definitions[field] = definition;
        }
        else if(typeof value === 'object') {
            if(!value.type) throw Error('Your schema definition must include a type');
            else {
                defaulted = _.defaults(value, defaultDefinition);
                definition = _.defaults(_.clone(typeReference[value.type]), defaulted);
                if(definition.query !== null) {
                    if(!definition.params) {
                        throw new Error('You must define a parameter names for this query');
                    }
                    definition.query += ' AS ' + field;
                }
                this.definitions[field] = definition;
            }
        }
        else throw new Error('Illegal schema definition type');
    }

    defineRelationship(field, value) {
        let by;
        let validation = !value.relationship ||
            (value.relationship !== 'one' && value.relationship !== 'many') ||
            !value.by || !value.model || typeof value.model !== 'function' ||
            typeof value.by !== 'object' || !value.by.self || !value.by.relation;

        if(validation) throw new Error('Invalid relationship format:' + value.relationship);

        const definition = _.defaults(value, defaultDefinition);

        by = definition.by;
        definition.type = 'object';
        definition.Construct = value.model;

        if(typeof by.relation === 'string') {
            by.self = {
                table: definition.Construct.getTableName(),
                property: by.self,
            };
        }
        else if(typeof by.relation === 'object') {
            if(!by.relation.table || !by.relation.property) {
                throw new Error('Invalid relationship parameter');
            }
        }
        else throw new TypeError('Relationship parameter must be an object or string');

        if(typeof by.self === 'object' && !(by.self.table && by.self.property)) {
            throw new Error('Missing relationship param properties');
        }
        else if(typeof by.self !== 'object') {
            throw new TypeError('Relationship parameter must be an object or string');
        }

        if(definition.relationship === 'many') {
            definition.Subconstruct = definition.Construct;
            definition.Construct = Collection;
        }
        this.definitions[field] = definition;
    }

    isSecure(key) {
        return this.definitions[key].secure;
    }

    isUnique(key) {
        return this.definitions[key].unique;
    }

    isPrimary(key) {
        return this.primary === key;
    }

    isRaw(key) {
        return this.definitions[key].query !== null;
    }

    isRelationship(key) {
        return _.contains(this.relationships, key);
    }

    typeRelationship(key) {
        if(this.isRelationship(key)) return this.definitions[key].relationship;
        else return null;
    }

    isField(key) {
        return _.contains(this.fields, key);
    }

    has(key) {
        return this.isField(key) || this.isRelationship(key);
    }

    evaluate(key, value) {
        let definition = this.definitions[key];
        if(this.has(key)) {
            if(typeof value === definition.type || value.constructor === definition.type) {
                if(typeof value === 'object') {
                    if(this.isRelationship(key) && this.definitions[key].relationship === 'many') {
                        if(value.constructor !== this.definitions[key].Subconstruct) return false;
                    }
                }
                return true;
            }
            return false;
        }
        return false;
    }

    construct(key, value) {
        if(this.has(key)) {
            if(this.isRelationship(key) && this.definitions[key].relationship === 'many') {
                return new Collection(this.definitions[key].subrelationship);
            }
            return new this.definitions[key].Construct();
        }
        return {};
    }
}

module.exports = Schema;
