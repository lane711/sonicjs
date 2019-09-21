var pageBuilderService = require('.//page-builder.service');
var formService = require('.//form.service');
var listService = require('.//list.service');
var menuService = require('.//menu.service');
var helperService = require('.//helper.service');


var dataService = require('.//data.service');

var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;
var eventBusService = require('./event-bus.service');


const apiUrl = 'http://localhost:3000/api/';
var pageContent = '';
var page;
var id;

module.exports = {

    getContent: async function () {
        let url = `${apiUrl}contents`;
        let content = await axios.get(url);
        return content.data;
    },

  

}