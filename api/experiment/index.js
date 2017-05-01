var router        = require("express").Router();
var db            = require(__app + "db");

router.post('/', (req, res) => {
  var experiment = req.body;
  var data = new db.Experiment({
    Name: experiment.Name,
    Created: experiment.Created,
    Author: experiment.Author,
    FileName: experiment.FileName,
    Thumbnail: experiment.Thumbnail,
    Sharing: experiment.Sharing,
    Contributors: experiment.Contributors,
    Devices: experiment.Devices,
    Cards: experiment.Cards
  });
  db.Experiment.update({'FileName' : experiment.FileName}, experiment, {upsert:true}, function(err, doc){
    if (err) {
     res.status(500).send({error: err});
     throw err;
    }
    res.status(200).send({message: "good"});
  });
})
.get("/", (req, res) => {
  db.Experiment.find({}).limit(10).exec(function (err, data) {
    if (err) res.status(500).send({error: err});
    res.statis(200).send(data);
  });
})
.get("/:name", (req, res) => {
  var name = req.params.name;
  db.Experiment.find({Name : name}, function (err, data) {
    if (err) res.status(500).send({error: err});
    else if (data.length == 0) res.status(204).send({error: "No Content"});
    res.status(200).send(data);
  });
})
.get("/:user", (req, res) => {
  var user = req.params.name;
});

module.exports = router;
