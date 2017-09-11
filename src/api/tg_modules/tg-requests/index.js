const {
    error: Errors,
    response: Response,
} = require('../tg-responses');

exports.parseRequest = function(req, res, next) {
    let errors = [];
    // GET Request filtering
    if(req.method === 'GET') {
        req.query.options = {};

        // Location fields
        if(req.query.l) {
            const temp = req.query.l.split(',');
            if(temp.length < 2) errors.push(new Errors.LocationError());
            req.query.location = {
                x: parseFloat(temp[0]),
                y: parseFloat(temp[1]),
            };
        }

        // Parse fields parameter
        if(!req.query.fields) req.query.options.fields = [];
        else req.query.options.fields = req.query.fields.split(',');

        // Parse limit parameter
        if(!req.query.limit) req.query.options.limit = 10;
        else if(req.query.limit < 1 || req.query.limit > 1000) {
            errors.push(new Errors.OutOfBounds());
        }
        else req.query.options.limit = req.query.limit;

        // Parse offset parameter
        if(!req.query.offset) req.query.options.offset = 0;
        else if(req.query.offset < 0 || req.query.offset > 1e10) {
            errors.push(new Errors.OutOfBounds());
        }
        else req.query.options.offset = req.query.offset;

        // Parse sort parameter
        if(!req.query.sort) req.query.options.sort = 'default';
        else {
            const s = req.query.sort.split(',');
            req.query.options.sort = [];
            for(let i in s) {
                if(s[i].includes('-')) {
                    req.query.options.sort.push({
                        attribute: s[i].replace('-', ''),
                        direction: 'desc',
                    });
                }
                else {
                    req.query.options.sort.push({
                        attribute: s[i],
                        direction: 'asc',
                    });
                }
            }
        }

        // Parse Filter Parameter
        const boolChars = ['>=', '<=', '>', '<', '='];
        if(!req.query.filter) req.query.options.filter = {};
        else if(Object.keys(req.query.filter).length > 1) {
            const keys = Object.keys(req.query.filter);
            req.query.options.filter = [];
            for (let i = 0; i < keys.length; i++) {
                let f = {};
                f.first = keys[i];
                for (let j = 0; j < boolChars.length; j++) {
                    if (req.query.filter[keys[i]].includes(boolChars[j])) {
                        f.operator = boolChars[j];
                        req.query.filter[keys[i]] =
                            req.query.filter[keys[i]].replace(f.operator, '');
                        break;
                    }
                }
                f.second = req.query.filter[keys[i]];
                f.bool = 'and';
                if (f.operator === undefined) f.operator = '=';
                req.query.options.filter.push(f);
            }
        }
        else if (Object.keys(req.query.filter).length === 1) {
            const keys = Object.keys(req.query.filter);
            let boolC;
            for (let i = 0; i < boolChars.length; i++) {
                if (req.query.filter[keys[0]].includes(boolChars[i])) {
                    boolC = boolChars[i];
                    req.query.filter[keys[0]] = req.query.filter[keys[0]].replace(boolC, '');
                    break;
                }
            }
            if (boolC === undefined) boolC = '=';
            req.query.options.filter = [
                keys[0],
                boolC,
                req.query.filter[keys[0]],
                'and',
            ];
        }

        // Parse unique requests
        if (req.query.unique) {
            if (typeof req.query.unique === 'string') {
                req.query.options.unique = [req.query.unique];
            }
            else req.query.options.unique = req.query.unique;
        }

        // Parse require requests
        if (req.query.require) {
            if (typeof req.query.require === 'string') {
                req.query.options.require = [req.query.require];
            }
            else req.query.options.require = req.query.require;
        }
    }

    if(errors.length === 0) next();
    else {
        res.status(400).send(Response.parse(errors[0], req));
        return;
    }
};
