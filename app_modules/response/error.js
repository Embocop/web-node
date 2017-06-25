const standard = {
    success: false,
    status: 500,
    error: { }
}
const error = {
    NoUsers() {
        standard.status = 204;
        standard.error = {
            type: "NoUsers",
            message: "No user found with the supplied credentials"
        }
        return standard
    },
    Database(err) {
        console.error(err);
        standard.error = {
            type: "Database",
            message: "Database error",
            error: err
        }
        return standard
    },
    Hash(err) {
        standard.error = {
            type: "Hash",
            message: "Hashing function error",
            error: err
        }
        return standard
    },
    Password(err) {
        standard.status = 401
        standard.error = {
            type: "Password",
            message: "Incorrect password credential supplied"
        }
        return standard
    },
    IncompleteRequest(err) {
        standard.status = 400
        standard.error = {
            type: "IncompleteRequest",
            message: "Your request did not contain all of the required fields"
        }
        return standard
    },
    NoResults(err) {
        standard.status = 204
        standard.error = {
            type: "NoResults",
            message: "There is no data available to match your request."
        }
        return standard
    },
    InvalidParameters(err) {
        standard.status = 400
        standard.error = {
            type: "InvalidParameters",
            message: "You included infvalid parameters with your request, please refer to the API documentation",
            error: err
        }
        return standard
    }
}

module.exports = error;