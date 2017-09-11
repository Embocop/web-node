module.exports = class WeakSchema {
    constructor(object) {
        this.raw = object;
        this.fields = [];
        this.relationships = [];
        this.required = [];
        this.primary = null;
        this.organizeObject(object);
    }

    organizeObject(object) {
        let key;
        let curr;
        for(key in object) {
            if (object[key]) {
                curr = object[key];
                if(typeof curr === 'string') this.fields.push(key);
                else if(typeof curr === 'object') {
                    if(curr.required === true) this.required.push(key);
                    if(curr.primary === true && this.primary === null) this.primary = key;
                    else if(curr.primary === true && this.primary !== null) {
                        throw new Error('There can only be one primary key');
                    }
                    if(curr.type === 'relationship') this.relationships.push(key);
                    else this.fields.push(key);
                }
            }
        }
    }

    get defaults() {
        return this.fields.concat(this.attributes);
    }
};
