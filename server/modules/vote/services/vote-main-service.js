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

    emitterService.on("formComponentsLoaded", async function (contentType) {
      const voteContentTypes = await dataService.getContentTopOne(
        "vote-site-settings"
      );

      if (
        voteContentTypes.data.applyToContentTypes.includes(contentType.systemId)
      ) {
        const voteContentType = await dataService.contentTypeGet("vote");
        const voteComponentsToAdd = voteContentType.data.components.filter(
          (c) => c.type !== "button"
        );

        contentType.data.components.splice(-1, 0, ...voteComponentsToAdd);
      }
    });

    emitterService.on("postModuleGetData2", async function (options) {
      if (options.shortcode.name === "PROPOSAL") {
        //talley votes
        if (options.viewModel.items) {
          options.viewModel.items.map((i) => {
            let voteCount = 0;
            if (i.data.votes) {
                voteCount = i.data.votes.reduce((s, f) => {
                    return s + f.vote;               // return the sum of the accumulator and the current time, as the the new accumulator
                }, 0);  
            }
            i.voteCount = voteCount;
          });
        }
      }
    });

    if (app) {
      app.post("/vote-api", async function (req, res) {
        const { id, vote } = req.body;
        const sessionID = req.sessionID;
        let user = req.session.passport.user.id;
        console.log("voting in user", req.body);

        const now = new Date().getTime();
        let item = await dataService.getContentById(id);
        let existingVote = item.data.votes?.find((v) => v.userId === user);
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
        let results = await dataService.editInstance(item, sessionID);

        res.send(200);
      });
    }
  },
};

// app.post("/form-submission", async function (req, res) {
//     let payload = req.body.data ? req.body.data : req.body.data.data ;

//     if (payload) {
//       let options = { data: payload, sessionID: req.sessionID };

//       await emitterService.emit("afterFormSubmit", options);
//       res.sendStatus(200);
//     }
//   });
