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

    getForm: function () {
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

    getForm2: function () {
        let form = "<script type='text/javascript'>";
        form += "window.onload = function () {";
        form += this.getFormDefinition();;
        form += "};";
        form += "</script>";
        form += "<div id='formio'></div>";

        return form;
    },

    getFormDefinition: function () {

        return Formio.createForm(document.getElementById('formio'), {
            components: [
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
            ]
        }).then((form) => {
            console.log('log form', form);

            form.on('submit', function (submission) {
                console.log('Submission was made!', submission);
            });

            // Everytime the form changes, this will fire.
            form.on('change', function (changed) {
                console.log('Form was changed', changed);
            });

        });

    },
}