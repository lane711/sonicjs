const fs = require("fs");

module.exports = function (app) {
  return;
  // app.dataSources.primary.automigrate();
  let dataRaw = fs.readFileSync("server/data/data.json");
  let data = JSON.parse(dataRaw);

  app.dataSources.primary.automigrate("contentType", function (err) {
    if (err) throw err;

    let contentType = data.models.contentType;
    // app.models.contentType.create([data.models.contentType], function (
    //   err,
    //   coffeeShops
    // ) {
    //   if (err) throw err;
    //   console.log("Models created: \n", coffeeShops);
    // });
  });
};
