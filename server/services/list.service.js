var dataService = require('./data.service');

var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;

const Formio = {};
const document = { getElementById: {} };

module.exports = {

    getList: async function (contentType) {
        let list = "list goes here";
        // let fieldsDef = await this.getFormDefinition(contentType);
        // form +=  JSON.stringify(fieldsDef);
        // form += "</script>";
        // form += await this.getFormTemplate();
        return list;
    }
}