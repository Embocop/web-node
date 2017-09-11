/*
Response structure REFERENCE

REQUIRED TOP LEVEL MEMBERS:
- 1 RESOURCE MEMBER: data OR errors
- meta

OPTIONAL TOP LEVEL MEMBERS:
- included (ONLY IF THE data MEMBER IS DEFINED)
- links

RESOURCE MEMBER FORMAT:
- REQUIRED: id AND type
- attributes: DESCRIBED RESOURCE DATA
- relationships: DESCRIBES RELATIONSHIPS WITH OTHER RESOURCES
- links: LINKS RELATING TO THE RESOURCE
- meta: NON STANDARD INFORMATION ABOUT THE RESOURCE

*/

const Success = exports.success = require('./success.js');
const Errors = exports.error = require('./error.js');
exports.response = {};

const defaultMeta = {
    copyright: 'Copyright 2017 trendGit.com LLC.',
    responseType: 'json',
};

exports.response.parse = function(object, req) {
    let response = {};
    let i;
    response.meta = defaultMeta;
    if(req) {
        response.links = {
            self: req.protocol + '://' + req.get('host') + req.originalUrl,
        };
        response.meta.request = {
            method: req.method,
            protocol: req.protocol,
        };
    }
    if(object instanceof Error) {
        response.meta.type = 'failure';
        response.errors = [];
        if(object instanceof Errors.ServerError || object instanceof Errors.ClientError) {
            response.errors.push(object);
            response.meta.status = object.status;
        }
        else {
            response.errors.push(new Errors.CodeError(object));
            response.meta.status = 500;
        }
    }
    else if(object instanceof Success.Success) {
        response.meta.type = 'success';
        response.data = object;
        response.meta.status = object.status;
    }
    else if(object.__proto__.__proto__.constructor.name === 'Model') {
        response.meta.attributes = object.attributes;
        response.meta.relationships = object.relationships;
        object = serializeModel(object);
        response.data = object;
        response.meta.length = 1;
    }
    else if(object.type === 'collection') {
        response.data = [];
        for(i in object.data) {
            if (object.data[i]) response.data[i] = serializeModel(object.data[i]);
        }
        response.meta.length = response.data.length;
    }
    return response;
};

function serializeModel(object) {
    try {
        let j;
        let i;
        const attributes = object.attributes;
        const relationships = object.relationships;
        object.attributes = {};
        object.relationships = {};
        object.type = object.tablename;
        object.id = object[object.schema.primary];

        if(relationships && relationships.length > 0) {
            for(i in relationships) {
                if(object[relationships[i]].constructor.name === 'Collection') {
                    object.relationships[relationships[i]] = [];
                    for(j in object[relationships[i]].data) {
                        if (object[relationships[i]].data[j]) {
                            object.relationships[relationships[i]]
                                .push(serializeModel(object[relationships[i]].data[j]));
                        }
                    }
                }
                else {
                    object.relationships[relationships[i]] =
                        serializeModel(object[relationships[i]]);
                }
                delete object[relationships[i]];
            }
        }

        for(i in attributes) {
            if (attributes[i]) {
                object.attributes[attributes[i]] = object[attributes[i]];
                delete object[attributes[i]];
            }
        }

        delete object.schema;
        delete object.tablename;

        return object;
    }
    catch(e) {
        throw e;
    }
}
