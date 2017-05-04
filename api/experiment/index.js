var router        = require("express").Router();
var db            = require(__app + "db");
const auth        = require(__app + "auth");
const error       = require(__app + "response").error;

router.use(auth.userverification);

router.post('/', (req, res) => {
  var experiment = new db.Experiment(req.body.experiment);
  var username = req.decoded._doc.Username;
  experiment.save(function(err, doc){
    if (err) { console.error(err); res.status(500).send(error.Database(err)); }
    else res.status(201).send({ success: true, code: 201, message: "Experiment created successfully." });
  });
  console.log(req.decoded._doc.Username);
  db.User.findOneAndUpdate({Username : username}, {$inc: { Experiments: 1 }}).exec((err)=> {
    if (err) { console.log(err); res.status(500).send(error.Database(err)); }
  });
})
.put('/', (req, res) => {
  var experiment = req.body.experiment;
  db.Experiment.update({'FileName' : experiment.FileName}, experiment, {upsert:false}, function(err, doc){
    if (err) { console.error(err); res.status(500).send(error.Database(err)); }
    else res.status(200).send({ success: true, code: 201, message: "Experiment updated successfully." });
  });
})
.get("/", (req, res) => {
  var nonecallback = function() { res.status(400).send(error.NoResults); }
  var dbcallback = db.dbCallback(res, {none : nonecallback});
  db.Experiment.find({}).limit(10).exec(dbcallback);
})
.get("/:name", (req, res) => {
  var name = req.params.name;

  var limit = req.query.limit || 10;
  var sortdir = req.query.direction || -1;
  var sortfield = req.query.sort || Name;
  var sort = {};
  sort[sortfield] = sortdir;

  db.Experiment.find({Name : name}).limit(limit).sort(sort).exec((err, data) => {
    if (err) res.status(500).send(error.Database(err));
    else if (data.length == 0) res.status(400).send(error.NoResults);
    res.status(200).send({success: true, code: 200, data: data });
  });
})
.get("/user/:user", (req, res) => {
  if (req.params.name) {
    var username = req.params.name;

    var limit = req.query.limit || 10;
    var sortdir = req.query.direction || -1;
    var sortfield = req.query.sort || Name;
    var sort = {};
    sort[sortfield] = sortdir;

    db.Experiment.find({Author : username}).limit(limit).sort(sort).exec((err, data) => {
      if (err) res.status(500).send(error.Database(err));
      else if (data.length == 0) res.status(200).send(error.NoResults);
      res.status(200).send({success: true, code: 200, data: data });
    });
  } else {
    res.status(400).send(error.IncompleteRequest);
  }
});

module.exports = router;
