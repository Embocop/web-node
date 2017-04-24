var router = require("express").Router();
var mailing = require(__app + "mailing");
var fs = require("fs");
var db = require(__app + "db");

router.post("/add_subscriber", (req, res) => {
  var email = req.body.email;
  if (email)
  console.log(email);
  fs.readFile(__data + "emaillist.html", (err, data) => {
    if (err) throw err;
    var mailOptions = {
      from: "Teddy Kim at Multicorder <teddy@embi.io>",
      to: email,
      subject: "Let's Make Science for Everyone!",
      text: "Thank you for joining our mailing list!",
      html : data
    }
    mailing.sendMail(mailOptions, (err, info) => {
      if (err) return console.error(err);
      console.log('Message %s sent: %s', info.messageId, info.response);
      var data = new db.Email({
        email: email
      });
      data.save((err)=>{
        if (err) {
          res.status(400).send({error: err});
          throw err;
        }
        res.status(200).send({message: "good"});
      })
    });
  });
});

module.exports = router;
