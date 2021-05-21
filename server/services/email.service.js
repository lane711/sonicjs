var dataService = require("./data.service");
var helperService = require("./helper.service");
var emitterService = require("./emitter.service");

var fs = require("fs");
const axios = require("axios");
const ShortcodeTree = require("shortcode-tree").ShortcodeTree;
const chalk = require("chalk");
const log = console.log;
var path = require("path");
var sendgrid = require("sendgrid").mail;

module.exports = emailService = {
  sendEmail: async function (from, fromName, to, subject, body) {
    //convert to html
    body = body.replace(/(?:\r\n|\r|\n)/g, "<br>");

    var from_email = new sendgrid.Email(from);
    from_email.name = fromName;
    var to_email = new sendgrid.Email(to);
    var content = new sendgrid.Content("text/html", body);
    var mail = new sendgrid.Mail(from_email, subject, to_email, content);

    if (!process.env.SENDGRID_API_KEY) {
      throw "SENDGRID_API_KEY not set!";
    }

    var sg = require("sendgrid")(process.env.SENDGRID_API_KEY);
    var request = sg.emptyRequest({
      method: "POST",
      path: "/v3/mail/send",
      body: mail.toJSON(),
    });

    sg.API(request, function (error, response) {
      if (error) {
        console.log(error);
      }
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
    });
  },
};
