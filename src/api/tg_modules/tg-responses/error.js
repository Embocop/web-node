class ServerError extends Error {
    constructor() {
        super();
        this.status = 500;
    }
}

class DatabaseError extends ServerError {
    constructor(error) {
        super();
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#database-errors'
                + error.code,
        };
        if(error.code === 'ECONNREFUSED') {
            this.title = 'Connection Refused';
            this.details = 'The connection to the SQL server was refused.'+
                'Please check your server credentials';
            this.code = 501;
        }
        else if(error.code === 'ER_BAD_FIELD_ERROR') {
            this.title = 'Database Field Error';
            this.details = 'Please check the database column names for consistency';
            this.code = 502;
        }
        else if(error.code === 'ETIMEDOUT') {
            this.title = 'Database Timeout';
            this.details = 'Connection to the database timedout';
            this.code = 503;
        }
        else if(error.code === 'ER_NON_UNIQ_ERROR') {
            this.title = 'Non-unique Column Error';
            this.details = 'Column defined in filter is ambiguous';
            this.code = 504;
        }
        else if(error.code === 'ENOTFOUND') {
            this.title = 'Could not connect to the server';
            this.details = 'Could not establish a connection to the server';
            this.code = 505;
        }
        else if(error.code === 'ER_NONUNIQ_TABLE') {
            this.title = 'Non-unique Table Error';
            this.details = 'Table defined in query is ambiguous';
            this.code = 506;
        }
        this.source = error;
    }
}

class NoResults extends ServerError {
    constructor() {
        super();
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#database-errors',
        };
        this.code = 511;
        this.title = 'No Results';
        this.details = 'Your request returned no results';
        this.source = {};
    }
}

class DeletionError extends ServerError {
    constructor() {
        super();
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#database-errors',
        };
        this.code = 512;
        this.title = 'Deletion Error';
        this.details = 'The deletion of the resource failed';
        this.source = {};
    }
}

class UpdateError extends ServerError {
    constructor() {
        super();
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#database-errors',
        };
        this.code = 513;
        this.title = 'Update Error';
        this.details = 'The update of the resource failed';
        this.source = {};
    }
}

class InsertError extends ServerError {
    constructor() {
        super();
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#database-errors',
        };
        this.code = 514;
        this.title = 'Insert Error';
        this.details = 'The insertion of the resource failed';
        this.source = {};
    }
}

class CodeError extends ServerError {
    constructor(err) {
        super();
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#code-error',
        };
        this.code = 520;
        this.title = 'Code Error';
        this.details = 'There was an error with the server code implementation';
        this.source = {
            err: err,
            message: err.message,
            trace: err.stack,
        };
    }
}

class TokenError extends ServerError {
    constructor(err) {
        super();
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#token-signature-error',
        };
        this.code = 521;
        this.title = 'Token Signature Error';
        this.details = 'The creation of a user token using the given credentials failed';
        this.source = err;
    }
}

class HashingError extends ServerError {
    constructor(err) {
        super();
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#hashing-error',
        };
        this.code = 522;
        this.title = 'Hashing Error';
        this.details = 'The password hashing failed';
        this.source = err;
    }
}

class ClientError extends Error {
    constructor() {
        super();
        this.status = 400;
    }
}

class EmptyError extends ClientError {
    constructor() {
        super();
        this.code = 401;
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#empty-errors',
        };
        this.title = 'Empty Error';
        this.details = 'No results matched your criteria, refine your applied filters';
        this.source = {};
    }
}

class RequiredFields extends ClientError {
    constructor(field) {
        super();
        this.code = 402;
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#required-fields-error',
        };
        this.title = 'Required Fields Error';
        this.details = 'You are missing a required credential: ' + field;
        this.source = {};
    }
}

class AuthenticationError extends ClientError {
    constructor() {
        super();
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#authentication-errors',
        };
        this.code = 410;
        this.source = {};
    }
}

class MissingCredentials extends AuthenticationError {
    constructor() {
        super();
        this.code += 1;
        this.title = 'Missing Login Credentials';
        this.details = 'You are missing one or more of the required login' +
            'credentials, please ensure you have speciofied both an email and password';
    }
}

class InvalidEmail extends AuthenticationError {
    constructor() {
        super();
        this.code += 2;
        this.title = 'Invalid Email Credential';
        this.details = 'No user exists at the provided email.';
    }
}

class InvalidAuthentication extends AuthenticationError {
    constructor() {
        super();
        this.code += 3;
        this.title = 'Invalid Authentication';
        this.details = 'The provided password is incorrect';
    }
}

class RequestSyntaxError extends ClientError {
    constructor() {
        super();
        this.code = 420;
        this.title = 'Request Syntax Error';
        this.details = 'Your request syntax is incorrect';
        this.source = {};
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#request-syntax-error',
        };
    }
}

class FieldsSyntaxError extends RequestSyntaxError {
    constructor() {
        super();
        this.code += 1;
        this.title = 'Fields Syntax Error';
        this.details = 'The syntax of your request for the objects fields is incorrect.' +
            'It must be in format: <api-uri>?fields=a,b,c,d';
    }
}

class SortSyntaxError extends RequestSyntaxError {
    constructor() {
        super();
        this.code += 2;
        this.title = 'Sort Syntax Error';
        this.details = 'The syntax of your request for the sorting of the resource' +
            'collection is incorrect.  It must be in format' +
            '<api-uri>?sort=<attribute>_<direction>';
    }
}

class QueryError extends ClientError {
    constructor() {
        super();
        this.code = 430;
        this.title = 'Request Query Error';
        this.details = 'Your request query contained illegal definitions';
        this.source = {};
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#request-query-error',
        };
    }
}

class OutOfBounds extends QueryError {
    constructor() {
        super();
        this.code += 1;
        this.title = 'Out of Bounds Error';
        this.details = 'Your request included an out of bounds quantity.';
    }
}

class NotFound extends ClientError {
    constructor() {
        super();
        this.status += 4;
        this.code = 400;
        this.title = '404 Not Found';
        this.details = 'The API path you are requesting cannot be found';
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#not-found',
        };
    }
}

class LocationError extends ClientError {
    constructor() {
        super();
        this.code = 440;
        this.title = 'Location Syntax Error';
        this.details = 'The location that you are passing is incorrectly parsed';
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#location-syntax-error',
        };
    }
}


class AppDenied extends ClientError {
    constructor() {
        super();
        this.code = 451;
        this.title = 'App Credentials Error';
        this.details = 'The credentials provided by the client application were denied';
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#app-credentials-error',
        };
    }
}

class AppNotAuthenticated extends ClientError {
    constructor() {
        super();
        this.code = 452;
        this.title = 'Missing App Authentication Error';
        this.details = 'No credentials were provided to authenticate your application';
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/' +
                'Errors#missing-app-authentication-error',
        };
    }
}

class UserDenied extends ClientError {
    constructor() {
        super();
        this.code = 453;
        this.title = 'User Credentials Error';
        this.details = 'The credentials provided by the client applications user were denied';
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/Errors#user-credentials-error',
        };
    }
}

class UserNotAuthenticated extends ClientError {
    constructor() {
        super();
        this.code = 453;
        this.title = 'Missing User Authentication Error';
        this.details = 'No credentials were provided to authenticate the current user';
        this.links = {
            about: 'https://github.com/trendGit/web-test-nodejs/wiki/' +
                'Errors#missing-user-authentication-error',
        };
    }
}

const errors = {
    ServerError,
    NoResults,
    DatabaseError,
    InsertError,
    UpdateError,
    DeletionError,
    OutOfBounds,
    QueryError,
    FieldsSyntaxError,
    RequestSyntaxError,
    InvalidAuthentication,
    InvalidEmail,
    MissingCredentials,
    AuthenticationError,
    RequiredFields,
    EmptyError,
    ClientError,
    HashingError,
    TokenError,
    CodeError,
    NotFound,
    LocationError,
    AppDenied,
    AppNotAuthenticated,
    UserDenied,
    UserNotAuthenticated,
    SortSyntaxError,
};

module.exports = errors;
