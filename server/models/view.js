'use strict';
var viewService = require('../services/view.service');

module.exports = function (View) {

    View.getProceedView = async function (body, cb) {

        let viewServerPath = __dirname + '/..' + body.data.viewPath;
        // if(body.data.viewModel){
        //     viewModel = JSON.parse(body.data.viewModel);
        // }
        body.data.viewModel.formJSON = JSON.stringify(body.data.viewModel.formJSON );
        body.data.viewModel.formValuesToLoad = JSON.stringify(body.data.viewModel.formValuesToLoad );

        let processedView = await viewService.getProccessedView(body.data.contentType, body.data.viewModel, viewServerPath)

        return processedView;
    };

    View.remoteMethod(
        'getProceedView', {
        http: {
            path: '/getProceedView',
            verb: 'post',
        },
        accepts: { arg: 'data', type: 'object', http: { source: 'body' }},
        returns: {
            arg: 'data',
            type: 'object',
        }
    }
    );

};
