'use strict';
var viewService = require('../services/view.service');

module.exports = function (View) {

    View.getProceedView = async function (contentType, viewModel, viewPath, cb) {

        let viewServerPath = __dirname + '/..' + viewPath;
        if(viewModel){
            viewModel = JSON.parse(viewModel);
        }
        let processedView = await viewService.getProccessedView(contentType, viewModel, viewServerPath)

        cb(null, processedView);
    };

    View.remoteMethod(
        'getProceedView', {
        http: {
            path: '/getProceedView',
            verb: 'get',
        },
        accepts: [{ arg: 'contentType', type: 'string', http: { source: 'query' } },
        { arg: 'viewModel', type: 'string', http: { source: 'query' } },
        { arg: 'viewPath', type: 'string', http: { source: 'query' } }],
        returns: {
            arg: 'data',
            type: 'object',
        }
    }
    );

};
