var express = require('express');
var router = express.Router();
const dateModule = require(global.appRootPath + '/modules/date');
const menuModule = require(global.appRootPath + '/modules/menu');
const pageModule = require(global.appRootPath + '/modules/pages');

if (typeof define !== 'function') {
  var define = require('amdefine')(module);
  var mongoose = require('mongoose')(module);
}

define(function(require) {
  var routes = {};
  
  routes.index = function(req, res) {
    res.render('index', { title: 'Express' });
  };
  
  return routes;
});


mongoose.connect('mongodb://localhost:27017/test');
var Schema = mongoose.Schema;

var userDataSchema = new Schema({
  title: {type: String, required: true},
  content: String,
  author: String
}, {collection: 'user-data'});

var UserData = mongoose.model('UserData', userDataSchema);




// router.use('/reload/reload.js', express.static('node_modules/reload/lib/reload.js'));
router.use('/js/jquery.js', express.static('node_modules/jquery/jquery.min.js'));
router.use('/js/bootstrap.js', express.static('node_modules/bootstrap/dist/js/bootstrap.min.js'));
router.use('/js/popper.js', express.static('node_modules/popper.js/dist/umd/popper.js'));
router.use('/js/vue.js', express.static('node_modules/vue/dist/vue.min.js'));
router.use('/js/require.js', express.static('node_modules/requirejs/require.js'));

router.use('/css/bootstrap.css', express.static('node_modules/bootstrap/dist/css/bootstrap.min.css'));

router.get('/mongodb-test', function (req, res, next) {
  res.render('mongodb-test');
  return;
});

let menuData = menuModule.getMainMenuData();
menuData.forEach(element => {
  if (element.cmsPage) {
    router.get(element.link, function (req, res, next) {
      res.render('index', {
        url: req.url,
        menuData: menuData,
        pageData: pageModule.getPageData(element.id)
      });
      return;
    });
  }
});

router.get('/', function (req, res, next) {
  res.render('index', {
    url: req.url,
    menuData: menuModule.getMainMenuData(),
    adminMenuData: menuModule.getAdminMenuData(),
    date: dateModule.myDateTime()
  });
  return;
});

router.get('/admin', function (req, res, next) {
  res.render('index', {
    url: req.url,
    menuData: menuModule.getMainMenuData(),
    adminMenuData: menuModule.getAdminMenuData(),
    date: dateModule.myDateTime()
  });
  return;
});



let arr = [1, 2, 3]

arr.forEach(element => {
  router.get('/admin' + element, function (req, res, next) {
    res.render('index', {
      url: req.url,
      menuData: menuModule.getMainMenuData(),
      
      adminMenuData: menuModule.getAdminMenuData(),
      date: dateModule.myDateTime()
    });
    return;
  });
});

// router.get('*', function(req, res, next) {
//   res.render('index', { url: req.url, menuData: menuModule.getMainMenuData(), 
//     adminMenuData: menuModule.getAdminMenuData(),
//     date: dateModule.myDateTime()});
//   return;  
// });

router.get('/get-data', function(req, res, next) {
  UserData.find()
      .then(function(doc) {
        res.send(doc);
      });
});

router.post('/insert', function(req, res, next) {
  console.log('inserting data-->');
  console.log(req.body);
  var item = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  };

  var data = new UserData(item);
  data.save();

  res.redirect('/mongodb-test');
});

router.post('/update', function(req, res, next) {
  var id = req.body.id;

  UserData.findById(id, function(err, doc) {
    if (err) {
      console.error('error, no entry found');
    }
    doc.title = req.body.title;
    doc.content = req.body.content;
    doc.author = req.body.author;
    doc.save();
  })
  res.redirect('/mongodb-test');
});

router.post('/delete', function(req, res, next) {
  var id = req.body.id;
  UserData.findByIdAndRemove(id).exec();
  res.redirect('/mongodb-test');
});

module.exports = router;