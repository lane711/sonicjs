var dataService = require('./data.service');
var helperService = require('./helper.service');
var fileService = require('./file.service');

// var fs = require('fs');


var handlebars = require('handlebars');


module.exports = viewService = {

    getProcessedView: function (contentType, viewModel, viewPath) {
        var source = viewService.getHandlebarsTemplateForContentType(contentType, viewPath);
        
        var result = viewService.processTemplateString(source, viewModel)

        return result;
    },

    processTemplateString: function (template, viewModel) {

        var templateView = handlebars.compile(template);

        var result = templateView(viewModel);

        return result;
    },

    getHandlebarsTemplateForContentType: function (contentType, viewPath) {

        let file = fileService.getFileSync(viewPath);
        return file;

    },

}
