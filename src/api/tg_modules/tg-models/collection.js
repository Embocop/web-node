const _ = require('underscore');
const Errors = require('../tg-responses').error;
const db = require('../tg-database').connection;

const legalOperators = ['>', '<', '=', '!=', '>=', '<='];
const legalBooleanOperators = ['and', 'or', 'not'];
const legalDirections = ['asc', 'desc'];

module.exports = class Collection {
    constructor(model, options) {
        const missingModel = new Error('You must define a model to the collection');
        const classModel = new TypeError('Collection models must be an instanced class object');
        const nonModel = new Error('You must provide a class of ancestor Model');
        if(!model) throw missingModel;
        if(typeof model !== 'object') throw classModel;
        if(model.__proto__.__proto__.constructor.name !== 'Model') throw nonModel;
        if(!options) options = {};
        this.model = model;
        this.Construct = model.constructor;
        this.type = 'collection';
        this.applyOptions(options);
    }

    static createInstance(model, params) {
        function promise(resolve, reject) {
            try {
                const col = new Collection(model, params);
                resolve(col);
            }
            catch(e) {
                reject(e);
            }
        }
        return new Promise(promise);
    }

    applyOptions(options) {
        let i;
        if(!options) options = {};
        const defaults = {
            limit: 10,
            offset: 0,
            sort: {
                attribute: this.model.schema.primary,
                direction: 'asc',
            },
            filter: [],
            unique: [],
            require: [],
        };
        options = _.defaults(options, defaults);

        this.data = [];

        try {
            if(options.link) this.link = this.applyLink(options.link);
            if(options.fields) this.model = new this.Construct(options.fields);
            this.sort = this.testSort(options.sort);
            this.length = this.testLength(options.limit);
            this.filters = this.testFilters(options.filter);
            this.offset = this.testOffset(options.offset);
            this.unique = this.testUnique(options.unique);
            this.require = this.testRequire(options.require);
        }
        catch(e) {
            throw e;
        }

        this.empty = true;

        for(i = 0; i < this.length; i++) {
            this.data.push(null);
        }
    }

    addMember(object) {
        const nonModel = new TypeError('Model must be an object');
        const modelType = new TypeError('The object must be of the specified model type');
        if(typeof object !== 'object') throw nonModel;
        if(object.constructor.name !== this.model.name) throw modelType;

        this.empty = false;
        this.data.push(object);
    }

    applyLink(link) {
        try {
            const newl = this.testLink(link);
            this.link = newl;
        }
        catch(e) {
            throw e;
        }
    }

    applyFilter(f) {
        try {
            const newf = this.testFilters(f);
            this.filters = this.filters.concat(newf);
        }
        catch(e) {
            throw e;
        }
    }

    setSorting(sort) {
        try {
            this.sort = this.testSort(sort);
        }
        catch(e) {
            throw e;
        }
    }

    testLink(o) {
        const nonArray = new Error('Links must be a non-array object');
        const missingAttribute = new Error('Links must contain members self and relation');
        const subMissing = new Error('Link members must contain properties table and property');
        if(typeof o !== 'object' || o.constructor === Array) throw nonArray;
        else if(!o.self || !o.relation) throw missingAttribute;
        else if(!(o.self.table && o.self.property && o.relation.table && o.relation.property)) {
            throw subMissing;
        }
        return o;
    }

    testFilters(object) {
        let output = [];
        let i;
        let key;
        let val;
        let op;
        let bool;
        const formatError = new Error('Filters must be presented in the form: ' +
            '{key: value, key: value,...}, ' +
            '[{first: key, second: value, operator: operator, bool: boolean-operator},...], or ' +
            '[key, operator, value, bool]');
        const opError = new Error('Illegal operator: operators must be' +
            'a comparison operator: <, <=, >, >=, =, !=');
        const boolError = new Error('Illegal boolean operator: ' +
            'operators must be a boolean operator: and, or, not');
        if(object.constructor === Array) {
            if(typeof object[0] === 'string') {
                if(object.length < 2 || object.length > 4) throw formatError;
                key = object[0];
                if(object.length === 2) {
                    val = object[1];
                    op = '=';
                    bool = 'and';
                }
                else if(object.length === 3) {
                    val = object[2];
                    op = object[1];
                    bool = 'and';
                }
                else {
                    val = object[2];
                    bool = object[3];
                    op = object[1];
                }
                let t;
                if(_.indexOf(legalOperators, op) === -1) throw opError;
                if(_.indexOf(legalBooleanOperators, bool) === -1) throw boolError;
                if (this.model.schema.isField(key) && this.model.schema.isRaw(key)) t = '';
                else t = this.model.tablename;
                output.push({
                    first: key,
                    second: val,
                    operator: op,
                    bool: bool,
                    table: t,
                });
            }
            else if(typeof object[0] === 'object') {
                for(i in object) {
                    if(object[i].first && object[i].second && object[i].operator) {
                        if(_.indexOf(legalOperators, object[i].operator) !== -1) {
                            if(object[i].bool) {
                                const bool = object[i].bool.toLowerCase();
                                if(_.indexOf(legalBooleanOperators, bool) !== -1) {
                                    object[i].bool = object[i].bool.toLowerCase();
                                    if (this.model.schema.isField(object[i].first) &&
                                        this.model.schema.isRaw(object[i].first)) {
                                        object[i].table = '';
                                    }
                                    else if(object[i].table === undefined) {
                                        object[i].table = this.model.tablename;
                                    }
                                    output.push(object[i]);
                                }
                                else {
                                    throw boolError;
                                }
                            }
                            else {
                                object[i].bool = 'and';
                                if (this.model.schema.isField(object[i].first) &&
                                    this.model.schema.isRaw(object[i].first)) {
                                    object[i].table = '';
                                }
                                else if(object[i].table === undefined) {
                                    object[i].table = this.model.tablename;
                                }
                                output.push(object[i]);
                            }
                        }
                        else {
                            throw opError;
                        }
                    }
                }
            }
        }
        else if(typeof object === 'object') {
            for(key in object) {
                if(this.model.schema.evaluate(key, object[key])) {
                    let t;
                    if (this.model.schema.isField(key) && this.model.schema.isRaw(key)) t = '';
                    else t = this.model.tablename;
                    output.push({
                        first: key,
                        second: object[key],
                        operator: '=',
                        bool: 'and',
                        table: t,
                    });
                }
            }
        }
        else {
            throw formatError;
        }
        return output;
    }

    testSort(sort) {
        let i;
        let output = [];
        const temp = {};
        if(sort === 'default') sort = this.model.schema.primary;
        if(typeof sort === 'object') {
            if(sort.constructor === Array) {
                for(i = 0; i < sort.length; i++) {
                    if(typeof sort[i] === 'string') {
                        if(this.model.schema.isField(sort[i])) {
                            temp.attribute = sort[i];
                            if(_.indexOf(legalDirections, sort[i + 1])) {
                                temp.direction = sort[i + 1];
                                i += 1;
                            }
                            else temp.direction = 'asc';
                            output.push(temp);
                        }
                        else {
                            throw new Error('Illegal sort keyword / format');
                        }
                    }
                    else if(typeof sort[i] === 'object') {
                        const a = sort[i].attribute;
                        const d = sort[i].direction;
                        if(d && (d === 'asc' || d === 'desc')) {
                            if(a && this.model.schema.isField(a)) {
                                output.push(sort[i]);
                            }
                            else {
                                output.push({
                                    attribute: sort[i].attribute,
                                    direction: 'asc',
                                });
                            }
                        }
                    }
                    else {
                        throw new Error('Illegal sort parameter type');
                    }
                }
            }
            else {
                output.push(this.sortObjectParse(sort));
            }
        }
        else if(typeof sort === 'string') {
            temp.direction = 'asc';
            if(this.model.schema.isField(sort)) temp.attribute = sort;
            else throw new Error('Sorting fields must be an attribute of the model');
            output.push(temp);
        }
        else {
            throw new Error('Illegal sorting query');
        }

        return output;
    }

    sortObjectParse(object) {
        const temp = {};
        if(object.direction) {
            if(_.indexOf(legalDirections, object.direction) !== -1) {
                temp.direction = object.direction;
            }
            else {
                throw new Error('Illegal sort direction');
            }
        }
        else {
            temp.direction = 'asc';
        }
        if(object.attribute) {
            if(this.model.schema.isField(object.attribute)) temp.attribute = object.attribute;
            else throw new Error('Sorting fields must be an attribute of the model');
        }
        else {
            throw new Error('You must include a sorting attribute');
        }
        return temp;
    }

    testLength(len) {
        const typeLen = new Error('Collection length must be am integer greater than 0');
        if(typeof len !== 'number') len = parseInt(len);
        if(typeof len !== 'number' || len < 1) throw typeLen;
        return len;
    }

    testOffset(len) {
        const typeLen = new Error('Collection length must be am integer greater than ' +
            'or equal to 0');
        if(typeof len !== 'number') len = parseInt(len);
        if(typeof len !== 'number' || len < 0) throw typeLen;
        return len;
    }
    testRequire(req) {
        let output = [];
        if (typeof req !== 'object') throw new Error('Require must be an array');
        for (let i = 0; i < req.length; i++) {
            if (this.model.schema.isField(req[i])) output.push(req[i]);
        }
        return output;
    }
    testUnique(uniq) {
        let output = [];
        if (typeof uniq !== 'object') throw new Error('Unique must be an array');
        for (let i = 0; i < uniq.length; i++) {
            if (this.model.schema.isField(uniq[i])) output.push(uniq[i]);
        }
        return output;
    }

    populate(options) {
        if(!options) options = {};
        const self = this;
        const promise = function(resolve, reject) {
            let i;
            let query;
            let curr;

            const attributes = self.model.getAttributes(false, true);
            const rawAttributes = self.model.getRawAttributes(options.params);
            const relationships = self.model.getRelationships();

            if(!self.empty) throw new Error('You cannot populate a non-empty collection');
            query = db.select(attributes);

            if(rawAttributes && rawAttributes.length > 0) {
                for(i in rawAttributes) {
                    if(rawAttributes[i]) query = query.select(rawAttributes[i]);
                }
            }

            if (self.unique.length > 0) {
                query = query.distinct(self.unique);
            }

            if (self.require.length > 0) {
                query = query.whereNotNull(self.require);
            }

            query = query.from(self.model.tablename);

            if(self.link) {
                let tablename;
                let selfProp;
                let relationProp;
                const link = self.link;
                tablename = link.relation.table;
                selfProp = self.link.self.table + '.' + self.link.self.property;
                relationProp = self.link.relation.table + '.' + self.link.relation.property;
                query = query.join(tablename, selfProp, relationProp);
                for(i in self.filters) {
                    if(self.filters[i] === self.link.relation.property) {
                        self.filters[i] = self.link.relation.property + '.' + self.filters[i];
                    }
                }
            }

            if(self.filters.length > 0) {
                try {
                    curr = self.filters[0];
                }
                catch(e) {
                    reject(e);
                }
                if (curr.table === '') {
                    query = query.having(curr.first,
                        curr.operator, curr.second);
                }
                else {
                    query = query.where(curr.table + '.' + curr.first,
                        curr.operator, curr.second);
                }
                if(self.filters.length > 1) {
                    for(i = 1; i < self.filters.length; i++) {
                        try {
                            curr = self.filters[i];
                        }
                        catch(e) {
                            throw e;
                        }
                        if(curr.bool === 'and') {
                            if (curr.table === '') {
                                query = query.having(curr.first,
                                    curr.operator, curr.second);
                            }
                            else {
                                query = query.andWhere(curr.table + '.' + curr.first,
                                    curr.operator, curr.second);
                            }
                        }
                        else if(curr.bool === 'or') {
                            query = query.orWhere(curr.table + '.' + curr.first,
                                curr.operator, curr.second);
                        }
                        else if(curr.bool === 'not') {
                            query = query.notWhere(curr.table + '.' + curr.first,
                                curr.operator, curr.second);
                        }
                    }
                }
            }

            try {
                if(self.sort && self.sort.length > 0) {
                    const sort = self.sort;
                    for(i in sort) {
                        if(sort[i]) query = query.orderBy(sort[i].attribute, sort[i].direction);
                    }
                }
                query = query.limit(self.testLength(self.length));
                query = query.offset(self.testOffset(self.offset));
            }
            catch(e) {
                reject(e);
            }
            query.catch((err) => {
                    reject(new Errors.DatabaseError(err));
                    return;
                })
                .then((results) => {
                    if(!results || results.length === 0) {
                        self.data = [];
                        reject(new Errors.EmptyError());
                    }
                    else {
                        let rPromises = [];
                        for(let i = 0; i < results.length; i++) {
                            try {
                                self.data[i] = new self.Construct(results[i]);
                                self.data[i].arrayConstructor(relationships, true);
                                if (relationships.length > 0) {
                                    rPromises.push(self.data[i].getRelatives());
                                }
                            }
                            catch(e) {
                                reject(new Errors.CodeError(e));
                            }
                        }
                        self.data = self.data.slice(0, results.length);
                        Promise.all(rPromises).then(function(values) {
                            resolve(self);
                        }).catch(reject);
                    }
                });
        };
        return new Promise(promise);
    }
};
