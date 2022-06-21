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
    try {
      await Moralis.start({ serverUrl, appId, masterKey });

      // Moralis.settings.setAPIRateLimit({
      //   anonymous:100, authenticated:200, windowMs:60000
      // })
    } catch (error) {
      console.error(
        error,
        "This happens if the moralis server is in sleep mode"
      );
    }

    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "MORALIS") {
        options.moduleName = "moralis";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("formComponentsLoaded", async function (options) {
      if (options.contentType.systemId === "user") {
        options.contentType.data.components.splice(-1, 0, {
          type: "textfield",
          inputType: "text",
          key: "moralisUserId",
          label: "Moralis User Id",
          hidden: false,
          input: true,
        });

        options.contentType.data.components.splice(-1, 0, {
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
      //HACK: since we can't fake begin logged into moralis, we have to send test objects
      if (process.env.E2E_TEST_MODE) {
        options.viewModel.mynfts = getFakeNFTsForTesting();
        return;
      }

      if (options.req.user) {
        const moralisEthAddress = options.req.user.profile.moralisEthAddress;

        if (moralisEthAddress) {
          const mynfts = await Moralis.Web3API.account.getNFTs({
            chain: "polygon",
            address: moralisEthAddress,
          });

          const testNfts = await Moralis.Web3API.account.getNFTs({
            chain: "mumbai",
            address: moralisEthAddress,
          });

          const allNfts = [...mynfts.result, ...testNfts.result];

          let nfts = [];
          allNfts.map((n) => {
            if (n.metadata) {
              n.data = JSON.parse(n.metadata);
              n.imageUrl =
                "https://ipfs.io/ipfs/" + n.data.image.split("ipfs://")[1];
              n.data.descriptionPreview = helperService.truncateString(
                n.data.description,
                100
              );
              nfts.push(n);
            } else {
              console.error("error: could not parse metadata for ", n);
            }
          });
          options.viewModel.mynfts = nfts;
        }
      }
    });

    function getFakeNFTsForTesting() {
      return [
        {
          token_address: "0x772770fa1ce3196a1c895fbe49a634dce758d87d",
          token_id: "2",
          amount: "1",
          owner_of: "0x265485b34a0c5de1bebdc303f470b1907e33b3b4",
          token_hash: "a26e7fe6b45ec85d6829e1dc55745dde",
          block_number_minted: "23073056",
          block_number: "28554646",
          contract_type: "ERC1155",
          name: null,
          symbol: null,
          token_uri:
            "https://ipfs.moralis.io:2053/ipfs/QmRHNF1FQvqpr737Qao6KWriouFpC42FSXnkxxvK7Mk1j7",
          metadata: `{"name":"Blake Corum","description":"Blake Corum is a Sophomore Running Back at the University of Michigan.  Prior to the 2021 season, Sports Illustrated predicted that Corum was \\"poised for a breakout year.\\" and that’s what he did rushing for 939 yards and 11 touchdowns. On September 18, Corum recorded his third straight 100-yard rushing game to start the season, becoming the first Michigan player to accomplish this feat since 2011.  Corum attended St. Frances Academy in Baltimore. As a senior, he rushed for 1,438 yards and 22 touchdowns and led his team to a No. 4 national ranking.\\n\\n* Class year - Sophomore\\n* Conference - Big Ten\\n* Player name - Blake Corum\\n* Position - RB\\n* Quantity - 500\\n* Rarity - Limited\\n* Sport - NCAA Men's Football\\n* Team - University of Michigan","image":"ipfs://Qmc79kfRBVypni4ZwcnqctY9ATeMc4dT9iKFRboktWqsg7"}`,
          synced_at: "2022-05-18T16:26:09.464Z",
          last_token_uri_sync: "2022-05-18T16:20:13.383Z",
          last_metadata_sync: "2022-05-18T16:26:09.464Z",
          data: {
            name: "Blake Corum",
            description:
              'Blake Corum is a Sophomore Running Back at the University of Michigan.  Prior to the 2021 season, Sports Illustrated predicted that Corum was "poised for a breakout year." and that’s what he did rushing for 939 yards and 11 touchdowns. On September 18, Corum recorded his third straight 100-yard rushing game to start the season, becoming the first Michigan player to accomplish this feat since 2011.  Corum attended St. Frances Academy in Baltimore. As a senior, he rushed for 1,438 yards and 22 touchdowns and led his team to a No. 4 national ranking.\n' +
              "\n" +
              "* Class year - Sophomore\n" +
              "* Conference - Big Ten\n" +
              "* Player name - Blake Corum\n" +
              "* Position - RB\n" +
              "* Quantity - 500\n" +
              "* Rarity - Limited\n" +
              "* Sport - NCAA Men's Football\n" +
              "* Team - University of Michigan",
            image: "ipfs://Qmc79kfRBVypni4ZwcnqctY9ATeMc4dT9iKFRboktWqsg7",
            descriptionPreview:
              "Blake Corum is a Sophomore Running Back at the University of Michigan.  Prior to the 2021 season, S...",
          },
          imageUrl:
            "https://ipfs.io/ipfs/Qmc79kfRBVypni4ZwcnqctY9ATeMc4dT9iKFRboktWqsg7",
        },
        {
          token_address: "0x22f239fac779be167755e7cf33cec5201b87ef95",
          token_id: "144",
          amount: "5",
          owner_of: "0x265485b34a0c5de1bebdc303f470b1907e33b3b4",
          token_hash: "97b8109c527cfbe71c8004aa21ae7253",
          block_number_minted: "26660704",
          block_number: "26667269",
          contract_type: "ERC1155",
          name: null,
          symbol: null,
          token_uri:
            "https://ipfs.moralis.io:2053/ipfs/QmPaig2T4FXNDEfko2pgPdpDNMGqQcS9QtTm7jTx5HYadN",
          metadata:
            '{"name":"clubhouse","description":"a house of club","image":"ipfs://QmYXmg7wueqaigAcXEK2BtZcm9PTR8vuxoySLkMJNxq4tt"}',
          synced_at: "2022-06-08T18:19:16.433Z",
          last_token_uri_sync: "2022-06-08T18:19:13.682Z",
          last_metadata_sync: "2022-06-08T18:19:16.433Z",
          data: {
            name: "clubhouse",
            description: "a house of club",
            image: "ipfs://QmYXmg7wueqaigAcXEK2BtZcm9PTR8vuxoySLkMJNxq4tt",
            descriptionPreview: "a house of club",
          },
          imageUrl:
            "https://ipfs.io/ipfs/QmYXmg7wueqaigAcXEK2BtZcm9PTR8vuxoySLkMJNxq4tt",
        },
      ];
    }

    emitterService.on("getNFTs", async function (options) {
      if (!Moralis) {
        return;
      }
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
