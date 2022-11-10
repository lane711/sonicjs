var userService = require("../../../services/user.service");
var dalService = require("../../../services/dal.service");
var adminService = require("../../../services/admin.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");

const axios = require("axios");
var axiosInstance;
const SibApiV3Sdk = require("sib-api-v3-sdk");
const sendInBlueApiKey = process.env.SENDINBLUE_API_KEY;
const demoOTP = process.env.DEMO_OTP;
const demoEmailFrom = process.env.DEMO_EMAIL_FROM;
const demoEmailFromName = process.env.DEMO_EMAIL_FROM_NAME;
const demoUsername = "demo@demo.com";
const demoPassword = "demo123";

module.exports = demoSiteMainService = {
  startup: async function (app) {
    app.get("/login-otp", async function (req, res) {
      let code = req.query.code;

      if (code === demoOTP) {
        const user = {
          username: demoUsername,
          password: demoPassword,
        };
        // let axoisLocal = await demoSiteMainService.getAxios()
        // await await axoisLocal.get("/logout");
        // let login = await axoisLocal.post("/login-user", user);
        // res.send(login.data.id);

        res.redirect(`/login-redirect?username=${user.username}&password=${user.password}`);
      } else {
        res.send("Bad Code");
      }
    });

    emitterService.on("processUrl", async function (options) {
      //smart look demo site only
      options.page.isDemoSite = false;
      let demoHostname = process.env.DEMO_HOSTNAME ?? "demo.sonicjs.com";
      if (options.req.hostname === demoHostname) {
        options.page.isDemoSite = true;
        options.page.smartlookClientId = process.env.SMARTLOOK_CLEINTID;
      }
    });

    emitterService.on("afterFormSubmit", async function (options) {
      if (options.data.contentType !== "emailotp") {
        return;
      }

      console.log("proccessing OTP");

      demoSiteMainService.sendToMarketingEmailList(options.data);

      let loginLink = `http://demo.sonicjs.com/login-otp?code=${demoOTP}`;
      let body = `Thanks for your interest in SonicJs, the free-forever open source Node CMS.\n\n
                  Please click on the link below to login to the demo as admin:\n${loginLink}`;

      // //to user - confirmation
      await emailService.sendEmail(
        demoEmailFrom,
        demoEmailFromName,
        demoEmailFrom,
        options.data.email,
        "SonicJS Demo One Time Password",
        body
      );

      // //admin notification
      // let adminBody = `${contact.name} (${contact.email}) wrote: <br/><br/>${contact.message}`;
      // await emailService.sendEmail(
      //   formSettings.data.adminEmail,
      //   contact.name,
      //   contact.email,
      //   formSettings.data.adminEmail,
      //   formSettings.data.emailMessageSubjectAdmin,
      //   adminBody
      // );
    });

    if (app) {
      app.on("modulesLoaded", demoSiteMainService.setupDemoSite);
      app.on("pagePreRender", demoSiteMainService.addDemoSiteHeader);
      app.on("pagePreRender", demoSiteMainService.addHeaderJs);
    }
  },

  sendToMarketingEmailList: async function (data) {
    if (data.emailOptin) {
      let defaultClient = SibApiV3Sdk.ApiClient.instance;

      let apiKey = defaultClient.authentications["api-key"];
      apiKey.apiKey = sendInBlueApiKey;

      let apiInstance = new SibApiV3Sdk.ContactsApi();

      let createContact = new SibApiV3Sdk.CreateContact();

      createContact.email = data.email;
      createContact.listIds = [6];

      apiInstance.createContact(createContact).then(
        function (data) {
          console.log(
            "Send in Blue API called successfully. Returned data: " +
              JSON.stringify(data)
          );
        },
        function (error) {
          console.error(error);
        }
      );
    }
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
      demoUsername,
      demoPassword
    );

    // console.log("demoAdminUser", demoAdminUser);

    if (!demoAdminUser || demoAdminUser.length === 0) {
      let newDemoUser = await userService.registerUser(
        demoUsername,
        demoPassword,
        true
      );

      console.log("created newDemoUser:", newDemoUser);

      adminService.checkIfAdminAccountIsCreated();
    }
  },

  addDemoSiteHeader: async function (options) {
    // console.log('postProcessPage', options.page);
    if (options.page.data) {
      //not needed if user already logged in
      if ((await userService.canEditPages(options.req)) === false) {
        options.page.data.pageCssClass = options.page.data.pageCssClass ?? "";
        options.page.data.pageCssClass += " demo";
        options.page.data.preHeader = `  <div class="alert alert-danger demo-alert fixed-top text-center" >
        <strong>SonicJs Demo Site</strong></i><a class="btn btn-success btn-sm text-white ms-3" href="javascript:void(0)" onclick="return openFormInModal('create', 'emailotp')">Click Here to Login as Admin</a>
      </div>`;
      }
    }

    if (options.page && options.req.path.includes("/login")) {
      options.page.preHeader = `  <div class="alert alert-danger demo-alert fixed-top text-center" >
        <h3>SonicJs Demo Site</h3> Email: <strong>demo@demo.com</strong> , Password: <strong>demo123</strong>
      </div>`;
    }
  },

  addHeaderJs: async function (options) {
    // let smartlookSettings = await dataService.getContentTopOne("smartlook", options.req.sessionID);
    if (process.env.SMARTLOOK_CLEINTID) {
      let data = options.page.data ?? options.page;
      data.headerJs = data.headerJs ?? "";
      data.headerJs += `<script type='text/javascript'>
          window.smartlook||(function(d) {
            var o=smartlook=function(){ o.api.push(arguments)},h=d.getElementsByTagName('head')[0];
            var c=d.createElement('script');o.api=new Array();c.async=true;c.type='text/javascript';
            c.charset='utf-8';c.src='https://rec.smartlook.com/recorder.js';h.appendChild(c);
            })(document);
            smartlook('init', '${process.env.SMARTLOOK_CLEINTID}');
        </script>`;
    }
  },

  getAxios: async function () {
    if (!demoSiteMainService.axiosInstance) {
      const defaultOptions = {
        headers: {},
        baseURL: globalService.baseUrl,
      };

      demoSiteMainService.axiosInstance = axios.create(defaultOptions);
    }
    return demoSiteMainService.axiosInstance;
  },
};
