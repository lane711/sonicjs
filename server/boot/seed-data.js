const fs = require("fs");

module.exports = function (app) {
  // return;
  // app.dataSources.primary.automigrate();
  let dataRaw = fs.readFileSync("server/data/data.json");
  let data = JSON.parse(dataRaw);

  app.dataSources.primary.automigrate("contentType", function (err) {
    if (err) throw err;

    let contentTypeObjs = data.models.contentType;

    var contentTypes = Object.keys(contentTypeObjs).map((key) => [
      Number(key),
      contentTypeObjs[key],
    ]);

    // let testObj = { title: "rest", systemid: "test" };
    // app.models.contentType.create(testObj, function (err, newInstance) {
    //   if (err) throw err;
    //   console.log("Models created: \n", newInstance);
    // });

    contentTypes.forEach((contentType) => {
      console.log(contentType);
      let objString = contentType[1];
      let obj = JSON.parse(objString);

      let newContentType = { title: obj.title, systemid: obj.systemid };

      delete obj.id;
      delete obj.__proto__;
      // let newO = Object.create(obj);
      app.models.contentType.create(newContentType, function (
        err,
        newInstance
      ) {
        if (err) throw err;
        console.log("Models created: \n", newInstance);
      });
    });

    // console.log(result);

    // let contentTypes = JSON.parse(contentTypeString);
    // console.log(contentType);
    // app.models.contentType.create([data.models.contentType], function (
    //   err,
    //   contentType
    // ) {
    //   if (err) throw err;
    //   console.log("Models created: \n", coffeeShops);
    // });

    // user.create(
    //   { email: req.body.email, password: req.body.password },
    //   function (err, userInstance) {
    //     console.log(userInstance);
    //     globalService.isAdminUserCreated = true;
    //     let message = encodeURI(`Account created successfully. Please login`);
    //     res.redirect(`/admin?message=${message}`); // /admin will show the login
    //     return;
    //   }
    // );
  });
};
