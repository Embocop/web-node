var router = require("express").Router();

//api specific routes 
router.get('/', function (req, res) {
    res.send('Welcome to our API!');
});

module.exports = router;