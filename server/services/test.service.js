const dalService = require("./dal.service");
const cypressTestCleanupTag = 'cypress-test-cleanup-tag'

module.exports = testService = {
  startup: async function (app) {


    app.get("/clear-test-data", async function (req, res) {
      let result = await testService.cleanTestData();
      res.send({deleteCount: result });
    });

    app.get("/set-e2e-test-mode", async function (req, res) {
      process.env.E2E_TEST_MODE = true;
      res.sendStatus(200);
    });
  },

  cleanTestData: async function () {
   return dalService.contentDeleteTestData(cypressTestCleanupTag);
  },

};
