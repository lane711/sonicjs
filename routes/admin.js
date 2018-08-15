module.exports = function (app) {
    var systemSchema = require('../field-types/field-types');
    var formUtility = require('../modules/form');
    var uuidv1 = require('uuid/v1');
    const mongoDAL = require('./mongo-dal');
    require('./content-types')(app);
    require('./field-types')(app);
    require('./content')(app);


    app.get('/admin', function (req, res) {
        res.render('admin/index', {
            layout: 'admin-layout.hbs'
        });
    });

/*
   

    app.post('/admin/content-type-fields/:id', function (req, res) {

        var fieldTypeId = req.body.fieldTypeId;
        console.log('adding field: ' + fieldTypeId + ' for: ' + req.params.id);

        getDocument("contentTypes", req.params.id).then(function (contentType) {
            contentType.fields = contentType.fields || [];
            contentType.fields.push({
                id: fieldTypeId,
                instanceId: uuidv1(),
                label: 'My Label'
            });
            console.log(contentType);
            updateDocument("contentTypes", req.params.id, contentType).then(function (data) {
                // console.log(data);
                res.send(data);
            });
        });
    });

    app.get('/admin/field-instance/:contentTypeId/:fieldInstanceId', function (req, res) {
        getDocument("contentTypes", req.params.contentTypeId).then(function (contentType) {
            let fieldInstance = contentType.fields.find(x => x.id = instanceId);

            // data.fields.forEach(field => {
            //     field.html = systemSchema.getTypes().find(x => x.id == field.id).generateHtml(field.instanceId);
            //     field.name = field.instanceId;
            // });
            res.render('admin/field-instance-edit', {
                contentType: contentType,
                fieldInstance: fieldInstance,
                layout: 'admin-layout.hbs'
            });
        });
    });

    app.post('/admin/content/add', function (req, res) {
        let formElements = req.body.formElements;
        let doc = formUtility.convertFormElementsToDocument(formElements);
    });



    app.get('/admin/pages', function (req, res) {
        var menuLinks = getMenuLinks().then(menuLinks => {
            PageData.find({}, function (err, pages) {
                res.render('admin/pages', {
                    pages: pages,
                    menuLinks: menuLinks,
                    layout: 'admin-layout.hbs'
                });
            });
        });
    });

    app.get('/admin/pages/edit/:id', function (req, res) {
        // console.log(PageData.schema.tree);
        PageData.findOne({
            _id: req.params.id
        }, function (err, page) {
            res.render('admin/pages-edit', {
                page: page,
                layout: 'admin-layout.hbs',
                schema: PageData.schema.tree
            });
        });
    });

    app.get('/admin/menus', function (req, res) {
        var menuLinks = getMenuLinks().then(menuLinks => {
            PageData.find({}, function (err, pages) {
                res.render('admin/menus', {
                    pages: pages,
                    menuLinks: menuLinks,
                    layout: 'admin-layout.hbs'
                });
            });
        });
    });

    app.get('/admin/blocks', function (req, res) {
        BlockData.find({}, function (err, blocks) {
            res.render('admin/blocks', {
                blocks: blocks,
                layout: 'admin-layout.hbs'
            });
        });
    });

    app.get('/admin/blocks/add', function (req, res) {
        res.render('admin/blocks-add', {
            layout: 'admin-layout.hbs'
        });
    });

    function getMenuLinks() {
        return new Promise(function (resolve, reject) {
            MenuLinkData.find({}, function (err, menuLinks) {
                resolve(menuLinks);
            });
        });
    }
*/
};