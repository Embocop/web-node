'use strict';
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
module.exports = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'teddy@embi.io',
        pass: 'embo1234'
    }
});
