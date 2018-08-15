module.exports = function (app) {
    var systemSchema = require('../field-types/field-types');
    var formUtility = require('../modules/form');
    var uuidv1 = require('uuid/v1');
    const mongoDAL = require('./mongo-dal');


    app.get('/admin/field-types', function (req, res) {
        res.render('admin/field-types/field-types', {
            fieldTypes: systemSchema.getTypes(),
            layout: 'admin-layout.hbs'
        });
    });

    // app.get('/admin/content-types', function (req, res) {
    //     mongoDAL.getCollection("contentTypes", null).then(function (data) {
    //         res.render('admin/content-types', {
    //             contentTypes: data,
    //             layout: 'admin-layout.hbs'
    //         });
    //     });
    // });

    // app.get('/admin/content-types/add', function (req, res) {
    //     res.render('admin/content-types-add', {
    //         layout: 'admin-layout.hbs'
    //     });
    // });

    app.post('/admin/field-types/add/:contentTypeId', function (req, res) {
        let contentTypeId = req.params.contentTypeId;
        var fieldType = {
            label: 'My Label',
            isRequired: false,
            fieldTypeId: req.body.fieldTypeId
        };
        mongoDAL.addDocument("fieldTypes", fieldType).then(function (newFieldType) {
            //now add to contentType
            this.addFieldToContentType(contentTypeId, newFieldType);
            res.send(contentTypeId);
        });
    });

    addFieldToContentType = function(contentTypeId, fieldInstanceId){
        mongoDAL.getDocument("contentTypes", contentTypeId).then(function (contentType) {
            contentType.fields.push({fieldInstanceId: fieldInstanceId});
            mongoDAL.updateDocument("contentTypes", contentType._id, contentType).then(function (data) {
                res.send(data);
            });
        })
    }

    app.get('/admin/field-instance/:id', function (req, res) {

        mongoDAL.getDocument("fieldTypes", req.params.id).then(function (fieldInstance) {

            res.render('admin/field-types/field-instance-edit', {
                fieldInstance: fieldInstance,
                fieldTypes: systemSchema.getTypes(),
                layout: 'admin-layout.hbs'
            });
        });
    });

    app.post('/admin/field-instance/:id', function (req, res) {
        console.log('updating for: ' + req.params.id);
        var doc = {
            label: req.body.label,
            required: req.body.required,
            helpText: req.body.helpText
        };
        mongoDAL.updateDocument("fieldTypes", req.params.id, doc).then(function (data) {
            res.send(data);
        });
    });
    
};