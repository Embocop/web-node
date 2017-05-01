var router        = require("express").Router();
var db            = require(__app + "db");
const auth        = require(__app + "auth");

router.use(auth.userverification);

router.post('/', (req, res) => {
  var data = new db.Experiment(req.body);
  db.Experiment.update({'FileName' : experiment.FileName}, experiment, {upsert:true}, function(err, doc){
    if (err) {
     res.status(500).send({ success: false, message: err });
     throw err;
    }
    res.status(200).send({ success: true, message: "good" });
  });
})
.get("/", (req, res) => {
  db.Experiment.find({}).limit(10).exec(function (err, data) {
    if (err) res.status(500).send({error: err});
    res.status(200).send({ success: true, data: data });
  });
})
.get("/:name", (req, res) => {
  var name = req.params.name;
  db.Experiment.find({Name : name}, function (err, data) {
    if (err) res.status(500).send({error: err});
    else if (data.length == 0) res.status(204).send({error: "No Content"});
    res.status(200).send({success: true, data: data });
  });
})
.get("/:user", (req, res) => {
  var user = req.params.name;
});

module.exports = router;
