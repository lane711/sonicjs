const dalService = require("./dal.service");
const cypressTestCleanupTag = 'cypress-test-cleanup-tag'

module.exports = testService = {
  startup: async function (app) {


    app.get("/clear-test-data", async function (req, res) {
      let result = await testService.cleanTestData();
      res.send({deleteCount: result });
    });
  },

  cleanTestData: async function () {
   return dalService.contentDeleteTestData(cypressTestCleanupTag);
  },

};
