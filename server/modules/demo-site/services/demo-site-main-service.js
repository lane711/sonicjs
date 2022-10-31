var userService = require("../../../services/user.service");
var dalService = require("../../../services/dal.service");
var adminService = require("../../../services/admin.service");
var emitterService = require("../../../services/emitter.service");

module.exports = demoSiteMainService = {
  startup: async function (app) {
    emitterService.on("processUrl", async function (options) {
      //smart look demo site only
      options.page.isDemoSite = false;
      let demoHostname = "demo.sonicjs.com";
      if (options.req.hostname === demoHostname) {
        options.page.isDemoSite = true;
        options.page.smartlookClientId = process.env.SMARTLOOK_CLEINTID;
      }
    });

    app.on("modulesLoaded", demoSiteMainService.setupDemoSite);
    app.on("pagePreRender", demoSiteMainService.addDemoSiteHeader);
  },

  setupDemoSite: async function () {
    // console.log("demo site moduleLoaded");
    //check that demo user admin account is available
    demoSiteMainService.checkDemoAdminAccount();
  },

  checkDemoAdminAccount: async function () {
    // console.log("checkDemoAdminAccount");

    let session = { user: { id: "69413190-833b-4318-ae46-219d690260a9" } };

    let demoAdminUser = await dalService.userGetByLogin(
      "demo@demo.com",
      "demo123"
    );

    // console.log("demoAdminUser", demoAdminUser);

    if (!demoAdminUser || demoAdminUser.length === 0) {
      let newDemoUser = await userService.registerUser(
        "demo@demo.com",
        "demo123",
        true
      );

      console.log("created newDemoUser:", newDemoUser);

      adminService.checkIfAdminAccountIsCreated();
    }
  },

  addDemoSiteHeader: async function (options) {
    // console.log('postProcessPage', options.page);
    if (options.page.data) {
      options.page.data.preHeader = `  <div class="alert alert-danger demo-alert fixed-top text-center" >
        <strong>SonicJs Demo Site</strong></i><a class="btn btn-success btn-sm text-white ms-3" href="/admin">Click Here to Login as Admin</a>
      </div>`;
    }

    if (options.page && options.req.path.includes('/login')) {
      options.page.preHeader = `  <div class="alert alert-danger demo-alert fixed-top text-center" >
        <h3>SonicJs Demo Site</h3> Email: <strong>demo@demo.com</strong> , Password: <strong>demo123</strong>
      </div>`;
    }
  },
};
