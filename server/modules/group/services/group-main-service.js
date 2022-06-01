var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var _ = require("underscore");

module.exports = groupMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "GROUP") {
        options.moduleName = "group";
        await moduleService.processModuleInColumn(options);
      }
    });

    //add group select list
    emitterService.on("formComponentsLoaded", async function (contentType) {
      const groupContentTypes = await dataService.getContentTopOne(
        "group-site-settings"
      );

      if (
        groupContentTypes.data.applyToContentTypes.includes(
          contentType.systemId
        )
      ) {
        contentType.data.components.splice(-1, 0, {
          type: "textfield",
          inputType: "text",
          key: "groupId",
          label: "Group",
          hidden: false,
          input: true,
        });
      }
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name === "GROUP") {
        let list = await dataService.getContentByContentType("group");
        options.viewModel.data.list = list;

        await emitterService.emit("getNFTs", options.viewModel.data);

        await emitterService.emit("getMyNFTs", options);

        await groupMainService.getMyGroups(options);
      }
    });
  },

  getMyGroups: async function (options) {
    var isInList = _.intersection([1, 2, 3], [4, 1]).length !== 0;
    let myGroups = [];

    options.viewModel.data.list.map((g) => {
      let groupNfts = g.data.nfTs.map((nft) => {
        return nft.nftTokenHash;
      });

      let myNfts = options.viewModel.mynfts
        ? options.viewModel.mynfts.map((nft) => {
            return nft.token_hash;
          })
        : [];

      userHasNftInGroup = _.intersection(groupNfts, myNfts).length !== 0;

      if (userHasNftInGroup) {
        myGroups.push(g);
      }
    });
    options.viewModel.data.myGroups = myGroups;
  },
};
