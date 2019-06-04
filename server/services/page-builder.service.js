var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;

const apiUrl = 'http://localhost:3000/api/';
var pageContent = '';
var page;
var id;

module.exports = {

    foo: function () {
        return 'bar';
    },

}