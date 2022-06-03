var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");
var helperService = require("../../../services/helper.service");

var moment = require("moment");
var _ = require("underscore");

module.exports = proposalMainService = {
  startup: async function () {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "PROPOSAL") {
        options.moduleName = "proposal";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("postModuleGetData", async function (options) {
      if (options.shortcode.name === "PROPOSAL") {
        await proposalMainService.getViewData(options);
      }
    });

    emitterService.on(
      "formComponentsLoaded",
      async function (contentType, content) {
        if (contentType.systemId === "proposal") {
          const groupContentTypes = await dataService.getContentTopOne(
            "group-site-settings"
          );
        }

        // if (
        //   groupContentTypes.data.applyToContentTypes.includes(
        //     contentType.systemId
        //   )
        // ) {
        //   contentType.data.components.splice(-1, 0, {
        //     type: "textfield",
        //     inputType: "text",
        //     key: "groupId",
        //     label: "Group",
        //     hidden: false,
        //     input: true,
        //   });
        // }
      }
    );
  },

  getViewData: async function (options) {
    let proposals = await dataService.getContentByContentType("proposal");

    const now = new Date().getTime();

    proposals.map((p) => {
      p.data.ticks = new Date(p.data.expires).getTime();
      p.data.remainingDays =
        moment(p.data.expires, "YYYYMMDD").fromNow(true) + " left to vote";
      p.data.preview = helperService.truncateString(p.data.body, 85);
      // proposalMainService.processItemPermissions(options, p);
    });

    proposals = _.sortBy(proposals, function (p) {
      return p.data.ticks;
    });

    options.viewModel.items = proposals;

    //emit so we can talley votes
    await emitterService.emit("postModuleGetData2", options);

    options.viewModel.openProposals = proposals.filter(
      (p) => p.data.approved && p.data.ticks > now
    );

    options.viewModel.closedProposals = proposals.filter(
      (p) => p.data.ticks < now
    );

    options.viewModel.pendingProposals = proposals.filter(
      (p) => p.data.approved === false
    );

    await proposalMainService.processPagePermissions(options);
  },

  processPagePermissions: async function (options) {
    //add new or review proposal permissions
    options.viewModel.canAdd = false;
    options.viewModel.canReview = false;
    options.viewModel.canEdit = false;
    options.viewModel.canVote = false;

    let userRole = options.req.user?.profile.roles[0];
    if (userRole === "communityAdmin" || userRole === "clubAdmin") {
      options.viewModel.canAdd = true;
      options.viewModel.canReview = true;
      options.viewModel.canEdit = true;
      options.viewModel.canVote = true;
    }

    if (userRole === "gm") {
      options.viewModel.canVote = true;
    }
  },

  // processItemPermissions: async function (options, item) {
  //   item.data.canEdit = false;
  //   item.data.canDelete = false;
  //   item.data.canVote = false;

  //   if (!options.req.user || !options.req.user?.profile.roles) {
  //     return;
  //   }

  //   let userRole = options.req.user?.profile.roles[0];
  //   let userId = options.req.user?.id;

  //   // member,
  //   // gm,
  //   // clubAdmin,
  //   // communityAdmin

  //   //     Draftly Admin - I am able to perform CRUD for any clubhouse in Draftly Ecosystem
  //   // Clubhouse Admin - I am able to perform CRUD only on proposals my clubhouse on Draftly; I am a more privileged Clubhouse gm
  //   // Clubhouse governance member (gm) - I am able to create and edit proposals ( that I have created) in the clubhouse I hold a governance token for
  //   // Clubhouse member - I am not able to perform any CRUD options on Proposals

  //   //member permissions
  //   if (userRole == "communityAdmin") {
  //     //applies to all clubs
  //     item.data.canEdit = true;
  //     item.data.canDelete = true;
  //     item.data.canVote = true;
  //   }

  //   if (userRole == "clubAdmin") {
  //     //applies only to assigned clubs
  //     item.data.canEdit = true;
  //     item.data.canDelete = true;
  //     item.data.canVote = true;
  //   }

  //   //create can always create/delete their own content
  //   if (item.createdByUserId == userId) {
  //     item.data.canEdit = true;
  //     item.data.canDelete = true;
  //   }
  // },
};
