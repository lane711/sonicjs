var dataService = require('./data.service');
var helperService = require('./helper.service');
var eventBusService = require('./event-bus.service');

var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;
var path = require("path");

module.exports = fileService = {


    sendEmail: async function (from, to, subject, body) {
       
        var helper = require('sendgrid').mail;
                var from_email = new helper.Email(from);
                var to_email = new helper.Email(to);;
                var content = new helper.Content('text/plain', body);
                var mail = new helper.Mail(from_email, subject, to_email, content);

                if(!process.env.SENDGRID_API_KEY){
                    throw ('SENDGRID_API_KEY not set!');
                }

                var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
                var request = sg.emptyRequest({
                    method: 'POST',
                    path: '/v3/mail/send',
                    body: mail.toJSON(),
                });

                sg.API(request, function (error, response) {
                    if(error){
                        console.log(error);
                    }
                    console.log(response.statusCode);
                    console.log(response.body);
                    console.log(response.headers);
                });

    },


}