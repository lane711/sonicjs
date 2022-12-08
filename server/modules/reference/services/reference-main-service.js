var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var helperService = require("../../../services/helper.service");

var _ = require("underscore");
const mediaService = require("../../../services/media.service");

module.exports = referenceMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "GROUP") {
        options.moduleName = "group";
        await moduleService.processModuleInColumn(options);
      }
    });

    //add reference select list
    emitterService.on("formComponentsLoaded", async function (options) {
      const referenceContentTypes = await dataService.getContentTopOne(
        "reference-site-settings"
      );

      const isAChild = referenceContentTypes.data.parentChildReferences.filter(
        (c) => c.children.includes(options.contentType.systemId)
      );

      if (isAChild.length) {
        //get current reference by url
        let referenceId = "";
        if (options.req.user?.profile) {
          const reference = await dataService.getContentByUrl(
            options.req.user.profile.currentPageUrl,
            options.req.sessionID
          );
          referenceId = reference.id;
        }



        const parentContentType = isAChild[0].parent;

        const parentContent = await dataService.getContentByType(
          parentContentType
        );

        //add hidden group field to content type, set current group id
        options.contentType.data.components.splice(-1, 0, {
          type: "textfield",
          inputType: "text",
          key: "referenceId",
          label: helperService.titleCase(parentContentType),
          hidden: false,
          input: true,
          defaultValue: referenceId,
          customClass: "fe-hide",
        });
      }
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name === "REFERENCE") {
        let references = await dataService.getContentByContentType("reference");
        options.viewModel.references = references.filter(
          (g) => g.data.active === true
        );

        options.viewModel.references.map((g) => {
          g.data.icon.src = mediaService.getMediaUrl(g.data.icon.file);
        });

        options.viewModel.contentType = await dataService.contentTypeGet(
          "reference",
          options.req
        );

        // await emitterService.emit("getNFTs", options.viewModel.data);

        // await emitterService.emit("getMyNFTs", options);

        await referenceMainService.getMyReferences(options);
      }
    });

    emitterService.on("postModuleGetData2", async function (options) {
      const groupContentTypes = await dataService.getContentTopOne(
        "reference-site-settings"
      );

      let baseContentType = options.viewModel.contentTypeId.replace(
        "-settings",
        ""
      );

      if (
        groupContentTypes.data.applyToContentTypes.includes(baseContentType)
      ) {
        // let contentType = await dataService.contentTypeGet(baseContentType);
        // let userRoles = options.req.user?.profile.roles;
        // await referenceMainService.processPermissions(
        //   options,
        //   contentType,
        //   userRoles,
        //   options.req.sessionID
        // );
      }

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

  processPermissions: async function (
    options,
    contentType,
    userRoles,
    sessionID
  ) {
    //set defaults
    // options.viewModel.canView = false;
    // options.viewModel.canCreate = false;
    // options.viewModel.canEdit = false;
    // options.viewModel.canDelete = false;
    // options.viewModel.canVote = false;
    // let settings = await dataService.getContentByType("site-settings", sessionID);
    // let acls = settings[0].data.permissionAccessControls.map((a) => a.title);
    // acls.map((a) => {
    //   let viewPermission = contentType.data.permissions.find(
    //     (p) => p.acl === a
    //   );
    //   options.viewModel[`can${helperService.capitalizeFirstLetter(a)}`] =
    //     _.intersection(viewPermission.roles, userRoles).length !== 0;
    // });
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
