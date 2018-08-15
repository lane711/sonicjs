module.exports = function (app, mongoose) {

    require('../models/page');
    require('../models/menuLink');

    mongoose.connect('mongodb://localhost:27017/test');
    var PageData = mongoose.model('PageData');
    var MenuLinkData = mongoose.model('MenuLinkData');


    mongoose.connect('mongodb://localhost:27017/test');

    app.get('/partial', function (req, res, next) {
        res.send('ok');
    });

    app.get('*', function (req, res, next) {

        if (req.originalUrl.includes('.map') || req.originalUrl.includes('.css')) {
            return;
        }

        // console.log('looking for ' +  req.originalUrl.toLowerCase());

        var menuLinks = getMenuLinks().then(menuLinks => {
            PageData.findOne({
                'slug': req.originalUrl.toLowerCase()
            }, function (err, page) {
                res.render('index', {
                    page: page,
                    menuLinks: menuLinks
                });
            });
        });
    });

    function getMenuLinks() {
        return new Promise(function (resolve, reject) {
            MenuLinkData.find({}, function (err, menuLinks) {
                resolve(menuLinks);
            });
        });
    }

    //catch all error handler
    // function errorHandler (err, req, res, next) {
    //     res.status(500)
    //     res.render('error', { error: err })
    //   }

    app.get('/get-data', function (req, res, next) {
        UserData.find()
            .then(function (doc) {
                res.render('index', {
                    items: doc
                });
            });
    });

};