module.exports = function (app) {
  app.dataSources.db.automigrate();

  // app.dataSources.mongo.automigrate("contentType", function (err) {
  //   if (err) throw err;

  //   app.models.contentType.create(
  //     [
  //       {
  //         systemid: "news6",
  //         title: "News Article 6",
  //         submit: "true",
  //         testAttr: "ipsum de lor 6",
  //       },
  //       {
  //         systemid: "news9",
  //         title: "News Article 9",
  //         submit: "true",
  //         testAttr: "ipsum de lor 9",
  //       },
  //     ],
  //     function (err, coffeeShops) {
  //       if (err) throw err;

  //       console.log("Models created: \n", coffeeShops);
  //     }
  //   );
  // });
};
