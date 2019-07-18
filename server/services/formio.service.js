var dataService = require('./data.service');

var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;

// import FormioForm from 'formiojs/form';

// import { Form } from 'formiojs';

// const {f} = require('formiojs');
var formio = require('formio-service')();
var Form = formio.Form;

// const utils = require('formiojs/utils');


module.exports = {

    getComponents: async function (contentType) {
        // console.log('getting components');
        let form = new Form('https://examples.form.io/example');
        // Form.components
        // console.log(form);
        // formio.loadForm().then((form) => {
          FormioUtils.eachComponent(form.components, (component) => {
            console.log(component);
        //   });
        })

        // var comps = utils.findComponents(form.components, {
        //     'type': 'textfield',
        //     'properties.objectId': '2345'
        //   });
    },

   
}