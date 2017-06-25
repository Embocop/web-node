const router = require("express").Router(),
    db = require(__app + "db"),
    auth = require(__app + "auth"),
    response = require(__app + "response"),
    model = require(__app + "models");

router.use(auth.userverification);
router.use(db.track(db.connection));

router
    .post('/', (req, res) => {
        let experiment
        try {
            experiment = new model.Experiment(req.body)
        }
        catch (exception) {
            console.error(exception)
            res.status(400).send(response.error.InvalidParameters(exception))
            return
        }
        experiment.author = req.decoded.uid;
        experiment.save()
            .then((rows) => res.status(201).send(response.success.ExperimentCreated()))
            .catch((err) => res.status(500).send(response.error.Database(err)))
    })
    .get("/user/:id", (req, res) => {
        const limit = parseInt(req.query.limit) || 10,
            offset = parseInt(req.query.offset) || 0,
            temp = (req.query.fields != null) ? req.query.fields.split(",") : ["exid", "name", "author"],
            user = req.params.id;

        model.experiment
            .fields(fields)
            .fill({ offset: offset, limit: limit, selector: { athor: user } })
            .then((experiments) => res.status(200).send(response.success.BindData(experiments)))
            .catch(function (err) {
                if (err == "empty") res.status(204).send(response.error.NoResults())
                else res.status(500).send(response.error.Database(err))
            });
    })
    .get("/:id", (req, res) => {
        const id = req.params.id,
            m = (req.query.fields != null) ? req.query.fields.split(",") : ["exid", "name", "author", "cards"]
        
        const experiment = model.schema.experiment.fields(m)

        experiment.fill({ limit: 1, offset: 0, selector: { exid: id } })
            .then((experiment) => res.status(200).send(response.success.BindData(experiment)))
            .catch(function (err) {
                if (err == "empty") res.status(204).send(response.error.NoResults())
                else res.status(500).send(response.error.Database(err))
            });
    })
    .post("/card", (req, res) => {
        const card = auth.requireFields(req.body, ["name", "category", "exid"]);
        card.contents = req.body.contents || "";
        db.connection("cards")
            .insert(card)
            .returning("cardid")
            .then(function (response) {
                if (response.length > 0) {
                    res.status(201).send({ success: true, status: 201, message: "Experiment card created" });
                }
            })
            .catch(function (err) {
                if (err) res.status(500).send(error.Database(err));
            });
    });

module.exports = router;
