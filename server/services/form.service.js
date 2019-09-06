var dataService = require('./data.service');
var eventBusService = require('./event-bus.service');

var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;

const Formio = {};
const document = { getElementById: {} };

module.exports = formService = {

    // startup: function () {
    //     console.log('>>=== form service startup');

    //     eventBusService.on('getRenderedPagePostDataFetch', async function (options) {
    //                 // options.page.data.editForm = getForm('page');
    //     });
    // },

    startup: async function () {
        eventBusService.on('getRenderedPagePostDataFetch', async function (options) {
            if (options) {
                options.page.data.editForm = await formService.getForm('page');
            }
        });
    },

    getForm: async function (contentType) {
        let form = "<script type='text/javascript'> const components = ";
        let fieldsDef = await this.getFormDefinition(contentType);
        form += JSON.stringify(fieldsDef);
        form += "</script>";
        form += await this.getFormTemplate();
        return form;
    },

    getFormTemplate: async function () {
        let themePath = __dirname + '/../assets/html/form.html';

        return new Promise((resolve, reject) => {
            fs.readFile(themePath, "utf8", (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    },

    getFormDefinition: async function (contentType) {

        let contentTypeDef = await dataService.getContentType(contentType);
        // console.log('contentTypeDef', contentTypeDef);
        let components = [];

        contentTypeDef.fieldList.forEach(field => {
            let fieldType = field.fieldType == 'textBox' ? 'textfield' : field.fieldType;
            let fieldDef = {
                type: fieldType,
                key: field.systeid,
                label: field.label,
                // placeholder: 'Enter your first name.',
                input: true
            }
            components.push(fieldDef);
        });

        //add button
        components.push({
            type: 'button',
            action: 'submit',
            label: 'Submit',
            theme: 'primary'
        });

        //     {
        //         type: 'textfield',
        //         key: 'firstName',
        //         label: 'First Name',
        //         placeholder: 'Enter your first name.',
        //         input: true
        //     },
        //     {
        //         type: 'textfield',
        //         key: 'lastName',
        //         label: 'Last Name',
        //         placeholder: 'Enter your last name',
        //         input: true
        //     },
        //     {
        //         type: 'currency',
        //         key: 'cost',
        //         label: 'Cost',
        //         placeholder: 'Enter $ cost',
        //         input: true
        //     },
        //     {
        //         type: 'button',
        //         action: 'submit',
        //         label: 'Submit',
        //         theme: 'primary'
        //     }
        // ];

        return components;

    },
}