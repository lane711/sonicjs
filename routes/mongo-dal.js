var systemSchema = require('../field-types/field-types');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var mongoUrl = "mongodb://localhost:27017/";
var dbName = "test";
var formUtility = require('../modules/form');
var uuidv1 = require('uuid/v1');

module.exports = {

    getCollection: function (collection, query) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(mongoUrl, function (err, db) {
                if (err) throw err;
                var dbo = db.db(dbName);
                dbo.collection(collection).find(query).toArray(function (err, result) {
                    if (err) {
                        // reject(err);
                        throw err;
                    }
                    db.close();
                    // console.log(result);
                    resolve(result);
                });
            });
        });
    },

    getDocument: function (collection, id) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(mongoUrl, function (err, db) {
                if (err) throw err;
                var dbo = db.db(dbName);
                var objectId = ObjectId(id);
                dbo.collection(collection).find({
                    "_id": objectId
                }).toArray(function (err, result) {
                    if (err) {
                        // reject(err);
                        throw err;
                    }
                    db.close();
                    // console.log(result);
                    resolve(result[0]);
                });
            });
        });
    },

    getDocumentByUrl: function (collection, url) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(mongoUrl, function (err, db) {
                if (err) throw err;
                var dbo = db.db(dbName);
                dbo.collection(collection).find({
                    "url": url //url field need to lookup first
                }).toArray(function (err, result) {
                    if (err) {
                        // reject(err);
                        throw err;
                    }
                    db.close();
                    // console.log(result);
                    resolve(result[0]);
                });
            });
        });
    },

    updateDocument: function (collection, id, doc) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(mongoUrl, function (err, db) {
                if (err) throw err;
                var dbo = db.db(dbName);

                dbo.collection(collection).updateOne({"_id": ObjectId(id)}, {$set:doc} , function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                });

                    db.close();
                    resolve(doc);
                // });
            });
        });
    },

    addDocument: function (collection, doc) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(mongoUrl, function (err, db) {
                if (err) throw err;
                var dbo = db.db(dbName);
                dbo.collection(collection).insertOne(doc, function (err, res) {
                    if (err) throw err;
                    var id = ObjectId(res.ops[0]._id).toString();
                    db.close();
                    resolve(id);
                });
            });
        });
    },

    getContentType: function (collection, query) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(mongoUrl, function (err, db) {
                if (err) throw err;
                var dbo = db.db(dbName);
                dbo.collection(collection).aggregate([{
                    $lookup: {
                        from: 'fieldTypes',
                        localField: 'fields',
                        foreignField: '_id',
                        as: 'orderdetails'
                    }
                }]).toArray(function (err, res) {
                    if (err) throw err;
                    console.log(JSON.stringify(res));
                    db.close();
                });
            });
        });
    },

    getContent: function (collection, query) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(mongoUrl, function (err, db) {
                if (err) throw err;
                var dbo = db.db(dbName);
                let result = [];
                dbo.collection(collection).find()
                .forEach(
                    function(newContent){
                        newContent.test = 'test123';
                        result.push(newContent);
                    }
                )
                // .toArray(function (err, result) {
                //     if (err) {
                //         // reject(err);
                //         throw err;
                //     }
                //     db.close();
                //     // console.log(result);
                    resolve(result);
                // });
            });
        });
    },

    // getContent: function (collection, query) {
    //     return new Promise(function (resolve, reject) {
    //         MongoClient.connect(mongoUrl, function (err, db) {
    //             if (err) throw err;
    //             var dbo = db.db(dbName);
    //             let result = dbo.collection(collection).aggregate([{
    //                 $lookup: {
    //                     from: 'contentTypes',
    //                     localField: 'contentTypeId',
    //                     foreignField: '_id',
    //                     as: 'contentType'
    //                 }
    //             }]).toArray(function (err, res) {
    //                 if (err) throw err;
    //                 console.log(JSON.stringify(res));
    //                 resolve(res);
    //                 db.close();
    //             });
    //         });
    //     });
    // },

};