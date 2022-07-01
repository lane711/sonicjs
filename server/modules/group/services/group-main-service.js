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
    emitterService.on("formComponentsLoaded", async function (options) {
      const groupContentTypes = await dataService.getContentTopOne(
        "group-site-settings"
      );

      if (
        groupContentTypes.data.applyToContentTypes.includes(
          options.contentType.systemId
        )
      ) {
        //get current group by url
        let groupId = "";
        if (options.req.user?.profile) {
          const group = await dataService.getContentByUrl(
            options.req.user.profile.currentPageUrl,
            options.req.sessionID
          );
          groupId = group.id;
        }

        //add hidden group field to content type, set current group id
        options.contentType.data.components.splice(-1, 0, {
          type: "textfield",
          inputType: "text",
          key: "groupId",
          label: "Group",
          hidden: false,
          input: true,
          defaultValue: groupId,
          customClass:'fe-hide'
        });
      }
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name === "GROUP") {
        let groups = await dataService.getContentByContentType("group");
        options.viewModel.groups = groups.filter((g) => g.data.active === true);

        await emitterService.emit("getNFTs", options.viewModel.data);

        await emitterService.emit("getMyNFTs", options);

        await groupMainService.getMyGroups(options);
      }
    });

    emitterService.on("postModuleGetData2", async function (options) {

      options.viewModel.canView = true;
      options.viewModel.canCreate = false;
      options.viewModel.canEdit = false;
      options.viewModel.canDelete = false;
      options.viewModel.canVote = true;

      // let userRole = options.req.user?.profile.roles[0];
      // //TODO: need to check that club admin is for the current club(not just has the role)
      // if (userRole === "communityAdmin" || userRole === "clubAdmin") {
      //   options.viewModel.canAdd = true;
      //   options.viewModel.canReview = true;
      //   options.viewModel.canEdit = true;
      //   options.viewModel.canVote = true;
      // }
  
      // if (userRole === "gm" || userRole === "member") {
      //   options.viewModel.canVote = true;

      //   //HACK: this should be soft coded
      //   if(options.viewModel.contentTypeId === 'proposal-settings'){
      //     options.viewModel.canAdd = true;
      //   }
      // }

    });
  },

  getMyGroups: async function (options) {
    options.viewModel.myGroups = [];

    options.viewModel.groups.map((g) => {
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
        options.viewModel.myGroups.push(g);
      }
    });
  },
};
