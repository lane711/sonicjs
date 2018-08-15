module.exports = function (app) {
    var systemSchema = require('../field-types/field-types');
    var formUtility = require('../modules/form');
    var uuidv1 = require('uuid/v1');
    const mongoDAL = require('./mongo-dal');

    app.get('/admin', function (req, res) {
        res.render('admin/index', {
            layout: 'admin-layout.hbs'
        });
    });

    // app.get('/admin/field-types', function (req, res) {
    //     res.render('admin/field-types', {
    //         fieldTypes: systemSchema.getTypes(),
    //         layout: 'admin-layout.hbs'
    //     });
    // });

    app.get('/admin/content-types', function (req, res) {
        mongoDAL.getCollection("contentTypes", null).then(function (data) {
            res.render('admin/content-types/content-types', {
                contentTypes: data,
                layout: 'admin-layout.hbs'
            });
        });
    });

    app.get('/admin/content-types/add', function (req, res) {
        res.render('admin/content-types/content-types-add', {
            layout: 'admin-layout.hbs'
        });
    });

    app.post('/admin/content-types/add', function (req, res) {
        console.log('adding:' + req.body.title);
        var contentType = {
            title: req.body.title,
            description: req.body.description,
            fields: []
        };
        mongoDAL.addDocument("contentTypes", contentType).then(function (newContentTypeId) {
            res.send(newContentTypeId);
        });
    });

    app.get('/admin/content-types/:id', function (req, res) {

        mongoDAL.getCollection("fieldTypes", null).then(function (fieldTypes) {
            mongoDAL.getDocument("contentTypes", req.params.id).then(function (contentType) {
                contentType.fields.forEach(field => {
                    let fieldInstance = fieldTypes.find(x => x._id == field.fieldInstanceId);
                    field.html = systemSchema.getTypes().find(x => x.id == fieldInstance.fieldTypeId).generateHtml(field.fieldInstanceId);
                    field.label = fieldInstance.label;
                });

                res.render('admin/content-types/content-types-edit', {
                    contentType: contentType,
                    returnUrl: '/admin/content-types/' + req.params.id,
                    fieldTypes: systemSchema.getTypes(),
                    layout: 'admin-layout.hbs'
                });
            });
        });

    });

    app.post('/admin/content-types/:id', function (req, res) {
        console.log('updating for: ' + req.params.id);
        var doc = {
            title: req.body.title,
            description: req.body.description
        };
        mongoDAL.updateDocument("contentTypes", req.params.id, doc).then(function (data) {
            res.send(data);
        });
    });

};