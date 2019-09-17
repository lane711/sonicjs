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
        let fieldsDef = await this.getFormDefinition(contentType);

        let form = "<script type='text/javascript'> const components = ";
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
        let components = contentTypeDef.components.components;

        contentTypeDef.components.components.forEach(field => {
            return;
            // let fieldType = field.fieldType == 'textBox' ? 'textfield' : field.fieldType;
            let fieldDef = {
                type: field.type,
                key: field.key,
                label: field.label,
                // placeholder: 'Enter your first name.',
                required: field.validate.required,
                input: true
            }

            if(field.validate){
                fieldDef/re
            }



            if(field.type == 'imageList'){
                fieldDef.options = this.imageListForDropDown;
                }

            components.push(fieldDef);

            // if(field.fieldType == 'textBox'){
            //     let control = new TextboxQuestion({
            //       key: field.systemid,
            //       label: field.label,
            //       value: "",
            //       required: field.required,
            //       order: 1
            //     });
            //     controls.push(control);
            //   }
      
            //   if(field.fieldType == 'textarea'){
            //     let control = new TextareaQuestion({
            //       key: field.systemid,
            //       label: field.label,
            //       value: "",
            //       required: field.required,
            //       order: 1
            //     });
            //     controls.push(control);
            //   }
      
            //   if(field.fieldType == 'layout'){
            //     let control = new LayoutQuestion({
            //       key: field.systemid,
            //       label: field.label,
            //       value: "",
            //       required: field.required,
            //       order: 1
            //     });
            //     controls.push(control);
            //   }
      
            //   if(field.fieldType == 'wysiwyg'){
            //     let control = new WYSIWYGQuestion({
            //       key: field.systemid,
            //       label: field.label,
            //       value: "",
            //       required: field.required,
            //       order: 1
            //     });
            //     controls.push(control);
            //   }
      
            //   if(field.fieldType == 'imageList'){
            //     // console.log('this.imageListForDropDown', this.imageListForDropDown);
            //     let control = new DropdownQuestion({
            //       key: field.systemid,
            //       label: field.label,
            //       value: "",
            //       required: field.required,
            //       order: 1,
            //       options: this.imageListForDropDown,
            //     });
            //     controls.push(control);
            //   }
        });

        //add button
        // components.push({
        //     type: 'button',
        //     action: 'submit',
        //     label: 'Submit',
        //     theme: 'primary'
        // });

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

    addBaseContentTypeFields: function(contentType, controls){
        console.log('addBaseContentTypeFields', contentType, controls);
        // if(isToBePopulatedWithExistingContent){
          let controlId = new HiddenQuestion({
            key: 'id',
            label: 'Id',
            value: contentType.id,
            required: true,
            order: 0
          });
          controls.push(controlId);
    
          let controlContentType = new HiddenQuestion({
            key: 'contentTypeId',
            label: 'Content Type',
            value: contentType.systemid,
            required: true,
            order: 1
          });
          controls.push(controlContentType);
        // }
      }
}