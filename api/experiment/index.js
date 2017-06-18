var router        = require("express").Router();
var db            = require(__app + "db");
const auth        = require(__app + "auth");
const error       = require(__app + "response").error;


router.use(auth.userverification);
router.use(db.track(db.connection));

router.post('/', (req, res) => {
    const experiment = auth.requireFields(req.body, ["name"]);
    experiment.author = req.decoded.uid;
    if (req.body.description) experiment.summary = req.body.description;

    db.connection("experiments")
        .insert(experiment)
        .returning("exid")
        .then((data) => {
            res.status(201).send({ success: true, status: 201, message: "Experiment created successfully!", data: data});
        },
        (err) => {
            res.status(500).send(error.Database(err));
        });
})
    .get("/", (req, res) => {
        const limit = req.query.limit || 10,
            offset = req.query.offset || 0,
            temp = req.query.fields || ["exid", "name", "author"],
            user = req.decoded.uid;

        const fields = auth.verifyParams(temp, ["exid", "name", "firstname", "lastname", "author", "summary", "timestamp", "followers", "cards", "contributors"]);

        db.connection("experiments")
            .join('users', 'users.uid', '=', 'experiments.author')
            .select(fields)
            .where({ author: user })
            .limit(limit)
            .offset(offset)
            .then((data) => {
                if (data.length == 0) {
                    res.status(204).send(error.NoResults);
                } else {
                    res.status(200).send({ success: true, status: 200, message: "Experiments found", data: data });
                }
            },
            (err) => {
                if (err) res.status(500).send(error.Database(err));
            });
    })
    .get("/:id", (req, res) => {
        const id = req.params.id;
        const fields = ["experiments.exid", "experiments.name", "experiments.timestamp",
            "experiments.cards", "experiments.followers", "experiments.contributors", "experiments.summary",
            "users.username", "users.first", "users.last"];
        db.connection("experiments")
            .join("users", "users.uid", "experiments.author")
            .select(fields)
            .where({ exid: id })
            .then((experiment) => {
                if (experiment.length > 0) {
                    db.connection("cards")
                        .select()
                        .where({ exid: id })
                        .then((cards) => {
                            const output = experiment[0];
                            output.author = {
                                username: output.username,
                                firstname: output.first,
                                lastname: output.last
                            }
                            delete output.username;
                            delete output.last;
                            delete output.first;
                            output.cards = {
                                problem: [],
                                hypothesis: [],
                                materials: [],
                                procedure: [],
                                dataanalysis: [],
                                conclusion: []
                            };
                            for (let i = 0; i < cards.length; i++) {
                                output.cards[cards[i].category].push(cards[i]);
                            }
                            res.status(200).send({ success: true, status: 200, message: "Experiment found", data: output });
                        },
                        (err) => {
                            if (err) res.status(500).send(error.Database(err));
                        });
                } else {
                    res.status(204).send(error.NoResults);
                }
            }, (err) => {
                if (err) res.status(500).send(error.Database(err));
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
