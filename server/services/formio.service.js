var dataService = require('./data.service');

var fs = require('fs');
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;


// var formio = require('formio-service')();
var Form = formio.Form;



module.exports = {

    getComponents: async function (contentType) {
        // console.log('getting components');
        let form = new Form('https://examples.form.io/example');

          FormioUtils.eachComponent(form.components, (component) => {
            console.log(component);
        //   });
        })

    },


}
