var dataService = require('./data.service');

var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;

var handlebars = require('handlebars');


module.exports = {

    getList: async function (contentType) {

        // var hbs = exphbs.create({ /* config */ });

        // var source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have " +
        //      "{{kids.length}} kids:</p>" +
        //      "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";

        const hbs = handlebars.create({
            extname      :'hbs',
            layoutsDir   : 'path/to/layout/directory',
            defaultLayout: 'main',
            helpers      : 'path/to/helpers/directory',
            partialsDir  : [
                'path/to/partials/directory'
            ]
        });

        var source = "{{> page-builder }}"
var template = handlebars.compile(source);
 
var data = { "name": "Alan", "hometown": "Somewhere, TX",
             "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
var result = template(data);


        let list = "list goes here";
        // let fieldsDef = await this.getFormDefinition(contentType);
        // form +=  JSON.stringify(fieldsDef);
        // form += "</script>";
        // form += await this.getFormTemplate();
        return result;
    }
}