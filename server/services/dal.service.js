const { getRepository } = require("typeorm");
const { Content } = require("../data/model/Content");
const { User } = require("../data/model/User");
const { Session } = require("../data/model/Session");
const emitterService = require("../services/emitter.service");

const crypto = require("crypto");
const { contentDelete } = require("./data.service");
const { v4: uuidv4 } = require("uuid");
const verboseLogging = process.env.APP_LOGGING === "verbose";

module.exports = dalService = {
  startup: async function (app) {
    app.get("/typeorm", async function (req, res) {
      // const users = await userRepository.find();
      res.json(await dalService.test());
    });
  },

  userGet: async function (id, sessionID, req) {
    const userRepo = await getRepository(User);
    let session = await dalService.sessionGet(sessionID);
    // let user = session.user;

    let user = await userRepo.findOne(id);
    dalService.processContent(user, user, req);
    user.contentTypeId = "user";
    user.profile.email = user.username;

    if (id === session.user.id) {
      return user;
    }

    //admins can see all users
    //TODO: get role by name
    let sessionUser = await userRepo.findOne(session.user.id);
    dalService.processContent(sessionUser, sessionUser, req);

    if (sessionUser.profile.roles.includes("admin")) {
      return user;
    }
  },

  usersGet: async function (user, req, bypassProcessContent = false) {
    const userRepo = await getRepository(User);

    let users = await userRepo.find();

    if (users) {
      users.forEach((user) => {
        user.contentTypeId = "user";
      });
    }
    if (!bypassProcessContent) {
      dalService.processContents(users, user, req);
    }
    return users;

    //admins can see all users
    //TODO: get role by name
    // if (user.roles.includes("admin")) {
    //   return User.findById(id);
    // }
  },

  usersGetCount: async function () {
    const userRepo = await getRepository(User);

    let users = await userRepo.find();

    return users.length;
  },

  userGetByLogin: async function (email, password) {
    const userRepo = await getRepository(User);

    let userByEmail = await userRepo.findOne({
      where: [{ username: email }],
    });

    if (userByEmail) {
      let passwordHash = await dalService.hashPassword(
        password,
        userByEmail.salt
      );
      if (passwordHash.hash === userByEmail.hash) {
        userByEmail.profile = JSON.parse(userByEmail.profile);
        //no longer need salt and hash on object
        delete userByEmail.hash;
        delete userByEmail.salt;
        return userByEmail;
      }
    }

    //admins can see all users
    //TODO: get role by name
    // if (user.roles.includes("admin")) {
    //   return User.findById(id);
    // }
  },

  userRegister: async function (email, passwordHash, isAdmin) {
    const userRepo = await getRepository(User);

    let user = await userRepo.findOne({
      where: { username: email },
    });

    if (!user) {
      let newUser = new User();
      newUser.id = uuidv4();
      newUser.username = email;
      newUser.salt = passwordHash.salt;
      newUser.hash = passwordHash.hash;
      newUser.profile = "{}";
      newUser.createdOn = new Date();
      newUser.updatedOn = new Date();

      if (isAdmin) {
        newUser.profile = '{"roles":["admin"]}';
      }

      let userRecord = await userRepo.save(newUser);
    }

    //admins can see all users
    //TODO: get role by name
    // if (user.roles.includes("admin")) {
    //   return User.findById(id);
    // }
  },

  userUpdate: async function (userArgs, userSession) {
    const userRepo = await getRepository(User);

    let profileObj = {};
    try {
      profileObj = JSON.parse(userArgs.profile);
    } catch (error) {
      profileObj = userArgs.profile;
      delete profileObj.contentType;
    }

    //update password
    if (profileObj.password !== "_temp_password") {
      //password has been updated
      User.findByUsername(profileObj.email).then(
        function (user) {
          if (user) {
            user.setPassword(profileObj.password, function () {
              user.save();
              console.log("password reset successful");
            });
          } else {
            console.log("This user does not exist");
          }
        },
        function (err) {
          console.error(err);
        }
      );
    }

    let userRecord = await dalService.userGet(userArgs.id, userSession);
    userRecord.updatedOn = new Date();
    userRecord.profile = JSON.stringify(profileObj);
    userRepo.save(userRecord);
  },

  userDelete: async function (id, userSession) {
    const userRepo = await getRepository(User);
    if (userSession.user.profile.roles.includes("admin")) {
      return userRepo.delete(id);
    }
  },

  contentGet: async function (
    id,
    contentTypeId,
    url,
    data,
    tag,
    user,
    req,
    returnAsArray = false,
    bypassProcessContent = false
  ) {
    let contents = [];
    const contentRepo = await getRepository(Content);

    if (id) {
      let content = await contentRepo.findOne({ where: { id: id } });
      dalService.processContent(content, user, req);

      if (returnAsArray) {
        contents.push(content);
        return contents;
      }
      return content;
    } else if (url) {
      let content = await contentRepo.findOne({ where: { url: url } });
      dalService.processContent(content, user, req);
      return content;
    } else if (contentTypeId) {
      contents = await contentRepo.find({
        where: { contentTypeId: contentTypeId },
      });
    } else if (data) {
      var query = {};
      query["data." + data.attr] = data.val;
      console.log("query", query);
      return Content.find(query);
    } else if (tag) {
      // let contentsQuery = Tag.findById(tag); //.populate("contents");
      // contents = contentsQuery.exec();
      // console.log(contents);
      // return contents;
    } else {
      contents = await contentRepo.find();
    }

    if (!bypassProcessContent) {
      dalService.processContents(contents, user, req);
    }

    return contents;
  },

  contentUpdate: async function (id, url, data, userSession) {
    if (verboseLogging) {
      console.log(
        "dal contentUpdate ==>",
        `id:${id}`,
        `url:${url}`,
        data,
        userSession
      );
    }

    const contentRepo = await getRepository(Content);
    let content = {};
    if (id) {
      if (verboseLogging) {
        console.log(
          "dal contentUpdate existing content for ==>",
          `id:${id}`,
          `id length:${id.length}`
        );
      }
      content = await contentRepo.findOne({ where: { id: id } });
      if (!content) {
        content = {};
      }
    }

    content.url = url;
    let isExisting = false;
    let userId =
      userSession.user && userSession.user.id ? userSession.user.id : '00000000-0000-0000-0000-000000000000';

    if (!id || id.length === 0) {
      //upsert
      content.id = uuidv4();
      content.contentTypeId = data.contentType;
      content.createdByUserId = userId;
      content.createdOn = new Date();
    } else {
      isExisting = true;
    }
    content.lastUpdatedByUserId = userId;
    content.updatedOn = new Date();
    content.tags = ""; //[];
    content.data = JSON.stringify(data);
    if (verboseLogging) {
      console.log("dal contentUpdate repo save ==>", JSON.stringify(content));
    }
    let result = await contentRepo.save(content);

    if (isExisting) {
      await emitterService.emit("contentUpdated", result);
    } else {
      await emitterService.emit("contentCreated", result);
    }

    await emitterService.emit("contentCreatedOrUpdated", result);

    return result;
  },

  contentUpdateByUrl: async function (id, url, data, userSession) {

    const contentRepo = await getRepository(Content);
    let content = {};
    if (url) {

      content = await contentRepo.findOne({ where: { url: url } });
      if (!content) {
        content = {};
      }
    }

    content.url = url;
    let isExisting = false;
    let userId =
      userSession.user && userSession.user.id ? userSession.user.id : '00000000-0000-0000-0000-000000000000';

    if (!content.id) {
      //upsert
      content.id = uuidv4();
      content.contentTypeId = data.contentType;
      content.createdByUserId = userId;
      content.createdOn = new Date();
    } else {
      isExisting = true;
    }
    content.lastUpdatedByUserId = userId;
    content.updatedOn = new Date();
    content.tags = ""; //[];
    content.data = JSON.stringify(data);
    if (verboseLogging) {
      console.log("dal contentUpdate repo save ==>", JSON.stringify(content));
    }
    let result = await contentRepo.save(content);

    if (isExisting) {
      await emitterService.emit("contentUpdated", result);
    } else {
      await emitterService.emit("contentCreated", result);
    }

    await emitterService.emit("contentCreatedOrUpdated", result);

    return result;
  },

  contentDelete: async function (id, userSession) {
    const contentRepo = await getRepository(Content);
    if (userSession.user.profile.roles.includes("admin")) {
      return contentRepo.delete(id);
    }
  },

  contentDeleteAll: async function (userSession) {
    const contentRepo = await getRepository(Content);
    contents = await contentRepo.find();
    for (const content of contents) {
      await contentRepo.delete(content.id);
    }
  },

  tagsGet: async function () {
    const tagRepo = await getRepository(Tag);
    return tagRepo.find();
  },

  sessionGet: async function (sessionID) {
    const sessionRepo = await getRepository(Session);

    if (sessionID) {
      let session = await sessionRepo.findOne(sessionID);
      if (session) {
        session.user = JSON.parse(session.json);
        let userSession = {};

        if (session.user.passport) {
          userSession = session.user.passport;
          userSession.isAuthenticated = true;
        } else {
          userSession.isAuthenticated = false;
        }
        userSession.sessionID = sessionID;

        return userSession;
      }
    }
  },

  contentRestore: async function (payload, userSession) {
    const contentRepo = await getRepository(Content);
    //     let payload = {};
    //     payload.lastUpdatedByUserId = "anonymous" ? 1 : data.lastUpdatedByUserId;
    //     payload.createdByUserId = "anonymous" ? 1 : data.lastUpdatedByUserId;
    // paylod.createdOn =
    // payload.updatedOn =
    //     payload.id = id;
    //     payload.url = url;
    //     payload.data = data;
    let result = await contentRepo.save(payload);
    // console.log(result);
  },

  userRestore: async function (id, url, data, userSession) {
    const contentRepo = await getRepository(User);
    data.data = JSON.stringify(data.data);
    let result = await contentRepo.save(data);
    console.log(result);
  },

  processContent: function (entity, user, req) {
    if (entity.data) {
      try {
        entity.data = JSON.parse(entity.data);
      } catch (err) {
        console.log(
          `JSON parsing error, id: ${entity.id}, ${entity.contentTypeId}`,
          err
        );
      }
    }

    if (entity.profile) {
      try {
        entity.profile = JSON.parse(entity.profile);
      } catch (err) {
        console.log(
          `JSON parsing error, id: ${entity.id}, ${entity.contentTypeId}`,
          err
        );
      }
    }

    content = dalService.checkPermission(entity, user, req);
  },

  processContents: function (entities, user, req) {
    entities.forEach((entitiy) => {
      dalService.processContent(entitiy, user, req);
    });
  },

  //get content type so we can detect permissions
  checkPermission: async function (data, user, req) {
    let contentTypeId = data.contentTypeId
      ? data.contentTypeId
      : data[0].contentTypeId;
    let contentType = await moduleService.getModuleContentType(
      contentTypeId,
      user,
      req
    );

    if (user && user.roles && user.roles.includes("admin")) {
      return data;
    }

    if (contentType.permissions) {
      let view = contentType.permissions.mappings.find(
        (x) => (x = "view")
      ).view;
      if (view === "admin") {
        data = [];
      }
      if (view === "filtered") {
        //remove sensative fields like email, address
        data.forEach((entity) => {
          delete entity.data.email;
        });
      }
    }

    return data;
  },

  hashPassword: async function (password, salt = undefined) {
    if (!salt) {
      var salt = crypto.randomBytes(128).toString("base64");
    }

    // Implementing pbkdf2Sync
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 100, "sha512")
      .toString("hex");

    return {
      salt: salt,
      hash: hash,
    };
  },
};
