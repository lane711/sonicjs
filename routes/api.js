module.exports = function (app, mongoose) {
    require('../models/page');
    require('../models/menuLink');
    require('../models/block');
    require('../models/contentType');
    
    var slug = require('slug');
    var shortid = require('shortid');
 
    mongoose.connect('mongodb://localhost:27017/test');
    var PageData = mongoose.model('PageData');
    var MenuLinkData = mongoose.model('MenuLinkData');
    var BlockData = mongoose.model('BlockData');
    var ContentTypeData = mongoose.model('ContentTypeData');


    app.get('/test', function (req, res, next) {
        res.send({
            "title": "success"
        });
    });

    app.post('/admin/addpage', function (req, res, next) {
        var page = {
            title: req.body.title,
            slug: '/' + slug(req.body.title.toLowerCase()),
            rows: [{
                "columns": [{
                    "id": shortid.generate(),
                    "class": "col-6"
                }, {
                    "id": shortid.generate(),
                    "class": "col-6"
                }],
                "id": shortid.generate()
            }],
        };

        var data = new PageData(page);
        data.save();

        this.addMenuLink(page.title, page.slug);
        res.send(page);
    });

    app.post('/admin/deletepage', function (req, res, next) {
        var id = req.body.id;
        PageData.findByIdAndRemove(id).exec();
        res.send("ok");
    });

    app.post('/admin/deletemenu', function (req, res, next) {
        var id = req.body.id;
        MenuLinkData.findByIdAndRemove(id).exec();
        res.send("ok");
    });

    app.post('/admin/block/add', function (req, res, next) {
        var block = {
            title: req.body.title,
            content: req.body.content
        };

        var data = new BlockData(block);
        data.save();
        res.send("ok");
    });

    // app.post('/admin/content-types/add', function (req, res, next) {
    //     var contentType = {
    //         title: req.body.title,
    //         description: req.body.description
    //     };

    //     var data = new ContentTypeData(contentType);
    //     data.save();
    //     debugger;    
    //     res.send(data);
    // });


    addMenuLink = function (title, slug) {
        var menuLink = {
            title: title,
            slug: slug
        };

        var data = new MenuLinkData(menuLink);
        data.save(menuLink);

    }

};