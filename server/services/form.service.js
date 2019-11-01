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
            if (options && options.page) {
                options.page.data.editForm = await formService.getForm(options.page.contentTypeId, options.page);
            }
        });
    },

    getForm: async function (contentTypeId, content) {
        let contentType;
        if (content) {
            contentType = await dataService.getContentType(content.data.contentType);
        } else if (contentTypeId) {
            contentType = await dataService.getContentType(contentTypeId);
        }

        let fieldsDef = await this.getFormDefinition(contentType, content);

        let form = "<script type='text/javascript'> const components = ";
        form += JSON.stringify(fieldsDef);
        form += "</script>";


        form += "<script type='text/javascript'> const formValuesToLoad = ";
        if (content) {
            form += JSON.stringify(content.data);
        }
        else {
            form += "{}";
        }
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

    getFormDefinition: async function (contentType, content) {

        // let contentTypeDef = await dataService.getContentType(content.data.contentType);
        // console.log('contentTypeDef', contentTypeDef);
        let components = contentType.components;

        if (content) {
            this.addBaseContentTypeFields(content.id, content.data.contentType, components);
        } else{
            components.push({
                type: 'textfield',
                key: 'contentType',
                label: 'contentType',
                defaultValue: contentType.systemid,
                input: true
            });
        }

        return components;
    },

    addBaseContentTypeFields: function (id, contentType, controls) {
        // console.log('addBaseContentTypeFields', contentType, controls);

        controls.push({
            type: 'textfield',
            key: 'id',
            label: 'id',
            defaultValue: id,
            hidden: true,
            input: true
        });

        //   controls.push({
        //     type: 'textfield',
        //     key: 'contentTypeId',
        //     label: 'contentTypeId',
        //     defaultValue: contentType,
        //     input: true
        //   });

        // if(isToBePopulatedWithExistingContent){
        //   let controlId = new HiddenQuestion({
        //     key: 'id',
        //     label: 'Id',
        //     value: contentType.id,
        //     required: true,
        //     order: 0
        //   });
        //   controls.push(controlId);

        //   let controlContentType = new HiddenQuestion({
        //     key: 'contentTypeId',
        //     label: 'Content Type',
        //     value: contentType.systemid,
        //     required: true,
        //     order: 1
        //   });
        //   controls.push(controlContentType);
        // }
    }
}