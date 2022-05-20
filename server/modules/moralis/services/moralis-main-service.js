var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
const moralisApiKey = process.env.REACT_APP_MORALIS_API_KEY;
const axios = require("axios");
const dalService = require("../../../services/dal.service");

module.exports = moralisMainService = {
  startup: async function (app) {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "MORALIS") {
        options.moduleName = "moralis";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("formComponentsLoaded", async function (contentType) {
      console.log("adding group id: ", contentType.systemId);
      if (contentType.systemId === "user") {
        contentType.data.components.splice(-1, 0, {
          type: "textfield",
          inputType: "text",
          key: "moralisUserId",
          label: "Moralis User Id",
          hidden: false,
          input: true,
        });

        contentType.data.components.splice(-1, 0, {
          type: "textfield",
          inputType: "text",
          key: "moralisEthAddress",
          label: "Moralis ETH Address",
          hidden: false,
          input: true,
        });
      }
    });

    if (app) {
      app.post("/api-admin/moralis-login", async function (req, res) {
        console.log("logging in user", req.body);

        let moralisUserId = req.body.objectId;
        let moralisUsername = req.body.username;
        let moralisEthAddress = req.body.ethAddress;
        let moralisSessionToken = req.body.sessionToken;

        let user = await userService.registerUser(
          moralisUsername,
          moralisEthAddress
        );

        //update user props
        if (user.profile.length < 3) {
          user.profile = {
            roles: ["member"],
            moralisUserId: moralisUserId,
            moralisEthAddress: moralisEthAddress,
          };
          await dalService.userUpdate(user, req.sessionID);
        }

        res.send("ok");
        return;
      });
    }
  },
};
