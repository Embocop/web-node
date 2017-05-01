module.exports.error = {};

module.exports.error.NoUsers = {
  success : false,
  status : 204,
  error : {
    type : "NoUser",
    message : "No user found with the supplied credentials"
  }
};

module.exports.error.Database = function (err) {
  var output = {
    success: false,
    status : 500,
    error: {
      type: "Database",
      message: "Database error",
      error: err
    }
  };
  return output;
}

module.exports.error.Hash = function (err) {
  var output = {
    success : false,
    status : 500,
    error : {
      type : "Hash",
      message : "Hashing function error",
      error: err
    }
  };
  return output;
}

module.exports.error.Password =  {
  success : false,
  status : 401,
  error : {
    type : "Password",
    message : "Incorrect password credential supplied"
  }
};

module.exports.error.IncompleteRequest = {
  success : false,
  status : 400,
  error : {
    type : "IncompleteRequest",
    message : "Your request did not contain all of the required fields"
  }
};
