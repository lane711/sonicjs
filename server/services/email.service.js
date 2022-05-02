var dataService = require("./data.service");
var helperService = require("./helper.service");
var emitterService = require("./emitter.service");

var fs = require("fs");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
const log = console.log;
var path = require("path");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
var sendEmail = process.env.SEND_EMAIL;

module.exports = emailService = {
  sendEmail: async function (from, fromName, replyTo, to, subject, body) {
    if (sendEmail !== "TRUE") {
      return;
    }

    //convert to html
    body = body.replace(/(?:\r\n|\r|\n)/g, "<br>");

    // const msg = {
    // to: 'Some One <someone@example.org>',
    //   to: 'recipient@example.org',
    //   cc: 'someone@example.org',
    //   bcc: ['me@example.org', 'you@example.org'],
    //   from: 'sender@example.org',
    //   replyTo: 'othersender@example.org',
    //   subject: 'Hello world',
    //   text: 'Hello plain world!',
    //   html: '<p>Hello HTML world!</p>',
    // };

    const msg = {
      to: to,
      from: `${fromName} <${from}>`, // Use the email address or domain you verified above
      replyTo: replyTo,
      subject: subject,
      html: body,
    };

    sgMail.send(msg).then(
      () => {},
      (error) => {
        console.error(error);

        if (error.response) {
          console.error(error.response.body);
        }
      }
    );
  },
};
