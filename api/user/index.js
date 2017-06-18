var router        = require("express").Router();
var db            = require(__app + "db");
var auth          = require(__app + "auth");
var response      = require(__app + "response");
var error         = response.error;

//router.use(/^\/.+$/, auth.userverification);

router.post('/', (req, res) => {
    const required = ["username", "email", "first", "last", "password", "role"];
    var user = auth.requireFields(req.body, required);     

    const hashCallback = function (hash) {
        user.password = hash;
        
        db.connection("users")
            .insert(user)
            .returning("uid")
            .then(() => {
                res.status(201).send({ success: true, status: 201, message: "User created successfully!" });
            },
            (err) => {
                res.status(500).send(error.Database(err));
            });
    };
    if (user && user.password) {
        auth.createPasswordHash(user.password, hashCallback);
    } else {
        res.status(400).send(error.IncompleteRequest);
    }
})
    .get("/feed", (req, res) => {
        const limit = req.query.limit || 10,
            offset = req.query.offset || 0;
        db.connection("changes")
            .join('feed', 'feed.fid', '=', 'changes.fid')
            .select()
            .limit(limit)
            .offset(offset)
            .orderBy('timestamp', 'asc')
            .then((response) => {
                let data = {};
                for (let i = 0; i < response.length; i++) {
                    if (data[response[i].fid]) {
                        data[response[i].fid].changes[response[i].property] = {
                            old: response[i].old,
                            new: response[i].new,
                            property: response[i].property
                        };
                    } else {
                        data[response[i].fid] = {
                            author: response[i].author,
                            table: response[i].table,
                            timestamp: response[i].timestamp,
                            fid: response[i].fid,
                            method: response[i].method,
                            changes: {}
                        };
                        data[response[i].fid].changes[response[i].property] = {
                            old: response[i].old,
                            new: response[i].new,
                            property: response[i].property
                        }
                    }
                    //data[response[i].fid] = response[i];
                }
                res.status(200).send({ success: true, status: 200, message: "User feed", data: data });
            },
            (err) => {
                res.status(500).send(error.Database(err)); 
            });
    })
.get('/username/:username', (req, res) => {
  var username = req.params.username;
  var nonecallback = function() { res.status(400).send(error.NoUsers); }
  var successback = function(data) { res.status(200).send({success: true, status: 200, data: data[0]}); }
  var dbcallback = db.dbCallback(res, {none: nonecallback, success: successback});
  var query = {Username : username};
  db.User.find(query, {Password : 0, __v: 0}).exec(dbcallback);
})
.put( '/username/:username', (req, res) => {
  var username    = req.params.username;
  var changes     = req.body;

  db.User.update({Username : username}, changes, {upsert : false}, (err, doc) => {
    if (err) console.error(err);
    res.send("OK");
  });
})
.get('/feed/:username', (req, res) => {
  var username    = req.params.username,
      limit       = req.query.limit || 10,
      offset      = req.query.offset || 0;

  var response = [];

  var historyCallback = function (experiments, i, histories) {
    var obj = {};
    if (histories.length > 0) {
        obj[experiments[i].Name] = histories;
        obj["meta"] = experiments[i].Thumbnail;
    }
    response.push( obj );
    processRecursively(experiments, i + 1);
  }

  var processRecursively = function (experiments, i) {
    if (i == experiments.length) {
      res.status(200).send({success : true, status: 200, data: response});
    } else {
      var experiment = experiments[i];
      db.history.getHistories("Experiment", experiment._id, {}, limit, offset, (err, histories) => {
        //console.log(histories);
        if (err) throw error.HistoryError(err);
        else historyCallback(experiments, i, histories);
      });
    }
  }

  var processExperiments = function (experiments) {
    if (experiments.length > 0) {
      processRecursively(experiments, 0)
    } else {
      res.status(400).send(error.NoResults);
    }
  }

  try {
    db.getUserExperiments(username, 10, {createdAt : -1}, processExperiments);
  }
  catch (e) {
    res.status(500).send(e);
  }

});

module.exports = router;
