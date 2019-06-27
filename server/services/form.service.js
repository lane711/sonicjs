var fs = require('fs');
const cheerio = require('cheerio')
const axios = require('axios');
const ShortcodeTree = require('shortcode-tree').ShortcodeTree;
const chalk = require('chalk');
const log = console.log;

const apiUrl = 'http://localhost:3000/api/';
const Formio = {};
const document = { getElementById: {} };

module.exports = {

    getForm: async function () {
        let form = "<script type='text/javascript'> const components = ";
        form += this.getFormDefinition();;
        form += "</script>";
        form += await this.getFormTemplate();
        return form;
    },

    getFormTemplate: function () {
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



    getFormDefinition: function () {

        let components = [
            {
                type: 'textfield',
                key: 'firstName',
                label: 'First Name',
                placeholder: 'Enter your first name.',
                input: true
            },
            {
                type: 'textfield',
                key: 'lastName',
                label: 'Last Name',
                placeholder: 'Enter your last name',
                input: true
            },
            {
                type: 'currency',
                key: 'cost',
                label: 'Cost',
                placeholder: 'Enter $ cost',
                input: true
            },
            {
                type: 'button',
                action: 'submit',
                label: 'Submit',
                theme: 'primary'
            }
        ];

        return components;

    },
}