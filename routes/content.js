module.exports = function (app) {
    var systemSchema = require('../field-types/field-types');
    var formUtility = require('../modules/form');
    var uuidv1 = require('uuid/v1');
    const mongoDAL = require('./mongo-dal');
    require('./content-types')(app);
    require('./field-types')(app);




    app.post('/admin/content/add', function (req, res) {
        let formElements = req.body.formData;
        let doc = formUtility.convertFormElementsToDocument(formElements);

        mongoDAL.addDocument("content", doc).then(function (newContentId) {
            res.send(newContentId);
        });
    });

    //load content by its custom url
    app.get('*', function (req, res, next) {

        if (req.originalUrl.includes('.')) {
            return;
        }

        mongoDAL.getDocumentByUrl("content", req.originalUrl).then(function (content) {
            console.log(content);
            // res.send(content.title);
            res.render('content/index', {
                content: content,
                layout: 'argon-theme-layout.hbs'
            });
        });

    });


};