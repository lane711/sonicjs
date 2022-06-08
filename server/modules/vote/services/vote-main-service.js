var dataService = require("../../../services/data.service");
var emitterService = require("../../../services/emitter.service");
var globalService = require("../../../services/global.service");

module.exports = voteMainService = {
  startup: async function (app) {
    emitterService.on("beginProcessModuleShortCode", async function (options) {
      if (options.shortcode.name === "VOTE") {
        options.moduleName = "vote";
        await moduleService.processModuleInColumn(options);
      }
    });

    emitterService.on("formComponentsLoaded", async function (options) {
      const voteContentTypes = await dataService.getContentTopOne(
        "vote-site-settings"
      );

      if (
        voteContentTypes.data.applyToContentTypes.includes(options.contentType.systemId)
      ) {
        const voteContentType = await dataService.contentTypeGet("vote");
        const voteComponentsToAdd = voteContentType.data.components.filter(
          (c) => c.type !== "button"
        );

        options.contentType.data.components.splice(-1, 0, ...voteComponentsToAdd);
      }
    });

    emitterService.on("postModuleGetData2", async function (options) {
      if (options.shortcode.name === "PROPOSAL") {
        //talley votes
        if (options.viewModel.items) {
          options.viewModel.items.map((i) => {
            
            i.data.voteScore = i.data.voteScore ?? 0;
            i.data.voteUps = i.data.voteUps ?? 0;
            i.data.voteDowns = i.data.voteDowns ?? 0;
          });
        }
      }
    });

    if (app) {
      app.post("/vote-api", async function (req, res) {
        if(!req.session.passport){
          return;
        }
        const { id, vote } = req.body;
        const sessionID = req.sessionID;
        let user = req.session.passport.user.id;

        const now = new Date().getTime();
        let item = await dataService.getContentById(id);
        let existingVote = item.data.votes?.find((v) => v.user === user);
        if (existingVote) {
          //change user's existing vote
          existingVote.timeStamp = now;
          existingVote.vote = vote;
        } else {
          const newVote = {
            user,
            vote,
            timeStamp: now,
          };
          if (item.data.votes) {
            item.data.votes.push(newVote);
          } else {
            item.data.votes = [newVote];
          }
        }

        //talley votes
        let voteScore,
          voteUps,
          voteDowns = 0;
        if (item.data.votes) {
          voteScore = item.data.votes.reduce((s, f) => {
            return s + f.vote; 
          }, 0);
          voteUps = item.data.votes
            .filter((v) => v.vote === 1)
            .reduce((s, f) => {
              return s + f.vote;
            }, 0);
          voteDowns = item.data.votes
            .filter((v) => v.vote === -1)
            .reduce((s, f) => {
              return s + f.vote; 
            }, 0);
        }
        item.data.voteScore = voteScore;
        item.data.voteUps = voteUps;
        item.data.voteDowns = voteDowns;

        let results = await dataService.editInstance(item, sessionID);

        item.id = id;
        res.send(item);
      });
    }
  },
};

