var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
const moralisApiKey = process.env.REACT_APP_MORALIS_API_KEY;
const axios = require("axios");
const dalService = require("../../../services/dal.service");
const helperService = require("../../../services/helper.service");

const serverUrl = process.env.MORALIS_SERVER_URL;
const appId = process.env.MORALIS_APP_ID;
const masterKey = process.env.MORALIS_MASTERKEY;

module.exports = moralisMainService = {
  startup: async function (app) {
    const Moralis = require("moralis/node");
    await Moralis.start({ serverUrl, appId, masterKey });

    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "MORALIS") {
        options.moduleName = "moralis";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("formComponentsLoaded", async function (contentType) {
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

    emitterService.on("getMyNFTs", async function (options) {
      if (options.req.user) {
        const moralisEthAddress = options.req.user.profile.moralisEthAddress;

        if (moralisEthAddress) {
          const mynfts = await Moralis.Web3API.account.getNFTs({
            chain: "polygon",
            address: moralisEthAddress,
          });

          let nfts = [];
          mynfts.result.map((n) => {
            if (n.metadata) {
              n.data = JSON.parse(n.metadata);
              n.imageUrl =
                "https://ipfs.io/ipfs/" + n.data.image.split("ipfs://")[1];
              n.data.descriptionPreview = helperService.truncateString(
                n.data.description,
                100
              );
              nfts.push(n);
            }else{
              console.error('error: could not parse metadata for ', n);
            }
          });

          options.viewModel.mynfts = nfts;
        }
      }
    });

    emitterService.on("getNFTs", async function (options) {
      let collections = process.env.MORALIS_NFT_COLLECTIONS.split(",");
      let nfts = [];

      await Promise.all(
        collections.map(async (c) => {
          let collectionNfts = await Moralis.Web3API.token.getAllTokenIds({
            address: c,
            chain: "polygon",
          });
          nfts.push(...collectionNfts.result);
        })
      );

      nfts.map((n) => {
        return (n.data = JSON.parse(n.metadata));
      });
      options.nfts = nfts;
    });

    emitterService.on("viewPostModuleGetData", async function (options) {
      let viewSettings = options.viewModel.data;
      if (
        viewSettings.limitToCurrentUser &&
        viewSettings.limitToCurrentGroup &&
        viewSettings.contentTypeToLoad === "nft"
      ) {
        options.viewModel.group = await dataService.getContentByUrl(
          options.req.originalUrl
        );
        options.viewModel.groups = await dataService.getContentByContentType(
          "group"
        );
        await emitterService.emit("getMyNFTs", options);
        await groupMainService.getMyGroups(options);

        //is nft in current group?
        options.viewModel.hasNFTInGroup = options.viewModel.myGroups.find(
          (g) => g.id === options.viewModel.group.id
        )
          ? true
          : false;
      }
    });

    if (app) {
      app.post("/api-admin/moralis-register", async function (req, res) {
        console.log("registering user", req.body);

        let moralisUserId = req.body.objectId;
        let moralisUsername = req.body.username;
        let moralisEthAddress = req.body.ethAddress;
        let moralisSessionToken = req.body.sessionToken;

        let user = await userService.registerUser(moralisUserId, moralisUserId);

        req.session.returnTo = "/clubs";

        res.send("ok");
      });

      app.post("/api-admin/moralis-login", async function (req, res) {
        console.log("registering user", req.body);

        res.send("ok");
      });

      app.post(
        "/api-admin/moralis-register-finalize",
        async function (req, res) {
          // user must be logged in  before this can update
          // update user props
          let moralisUser = req.body.moralisUser;
          let sonicUser = req.body.sonicUser.data;

          if (Object.keys(sonicUser.profile).length === 0) {
            sonicUser.profile = {
              roles: ["member"],
              moralisUserId: moralisUser.objectId,
              moralisEthAddress: moralisUser.ethAddress,
            };
            await dalService.userUpdate(sonicUser, req.sessionID);
          }

          req.session.returnTo = "/clubs";

          res.send("ok");
        }
      );

      app.get("/api/moralis-nfts", async function (req, res) {
        /* import moralis */

        const moralisEthAddress = req.user.profile.moralisEthAddress;

        /* Moralis init code */

        const userEthNFTs = await Moralis.Web3API.account.getNFTs({
          address: moralisEthAddress,
        });
        console.log(userEthNFTs);

        // get testnet NFTs for user
        const testnetNFTs = await Moralis.Web3API.account.getNFTs({
          chain: "ropsten",
          address: moralisEthAddress,
        });
        console.log(testnetNFTs);

        // get polygon NFTs for address
        const options = {
          chain: "polygon",
          address: moralisEthAddress,
        };
        const polygonNFTs = await Moralis.Web3API.account.getNFTs(options);
        console.log(polygonNFTs);

        res.send(polygonNFTs);
      });
    }
  },
};
