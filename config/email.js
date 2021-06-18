const nodemailer = require('nodemailer');
var { MAIL_EMAIL, MAIL_PASSWORD } = require('../config.json')

const smtpTransport = nodemailer.createTransport({
    service: "Daum",
    host: 'smtp.daum.net',
        port: 465,
        auth: {
          user: MAIL_EMAIL,
          pass: MAIL_PASSWORD
        },
    tls: {
        rejectUnauthorized: true
    }
  });

module.exports={ smtpTransport }