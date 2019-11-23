var dataService = require('./data.service');
var helperService = require('./helper.service');

var fs = require('fs');


var handlebars = require('handlebars');


module.exports = viewService = {

    getProccessedView: async function (contentType, viewModel, viewPath) {

        var source = await viewService.getHandlebarsTemplateForContentType(contentType, viewPath);
        var template = handlebars.compile(source);

        // var data = await dataService.getContentByType(contentType);

        // let viewModel = data.map(function (record) {
        //     return {
        //         title: record.data.title,
        //         body: helperService.truncateString(record.data.body, 400),
        //         image: dataService.getImage(record.data.image[0]),
        //         url: record.data.url
        //     };
        // });

        var result = template(viewModel);

        return result;
    },

    getHandlebarsTemplateForContentType: async function (contentType, viewPath) {
        let path = __dirname + `/../views/partials/${contentType}/list.handlebars`;

        if(viewPath){
            path = viewPath;
        }

        return await viewService.getHandlebarsTemplate(path);
    },

    getHandlebarsTemplate: async function (path) {

        return new Promise((resolve, reject) => {
            fs.readFile(path, "utf8", (err, data) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
}