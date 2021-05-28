// const User = require("../schema/models/user");
// const Content = require("../schema/models/content");
const Tag = require("../schema/models/tag");

var dataService = require("./data.service");

const { getRepository } = require("typeorm");
const { Post } = require("../data/model/Post");
const { Content } = require("../data/model/Content");
const { User } = require("../data/model/User");

module.exports = dalService = {
  startup: async function (app) {
    app.get("/typeorm", async function (req, res) {
      // const users = await userRepository.find();
      res.json(await dalService.test());
    });
  },

  userGet: async function (id, user) {
    const userRepo = await getRepository(User);

    if (id === user.id) {
      let user = await userRepo.findOne(id);
      user.contentTypeId = 'user';
      dalService.processContent(user);
      user.profile.email = user.username;
      return user;
    }

    //admins can see all users
    //TODO: get role by name
    if (user.roles.includes("admin")) {
      return userRepo.find(id);
    }
  },

  usersGet: async function () {
    const userRepo = await getRepository(User);

    let users = await userRepo.find();

    if(users){
      users.forEach(user =>{
        user.contentTypeId = 'user';
      })
    }
    dalService.processContents(users)
    return users;

    //admins can see all users
    //TODO: get role by name
    // if (user.roles.includes("admin")) {
    //   return User.findById(id);
    // }
  },

  userGetByLogin: async function (email, password) {
    const userRepo = await getRepository(User);

    let user = await userRepo.findOne({
      where: [{ username: email }, { password: password }],
    });

    user.profile = JSON.parse(user.profile);

    return user;

    //admins can see all users
    //TODO: get role by name
    if (user.roles.includes("admin")) {
      return User.findById(id);
    }
  },

  userRegister: async function (email, password) {
    const userRepo = await getRepository(User);

    let user = await userRepo.findOne({
      where: { username: email },
    });

    if (!user) {
      let newUser = new User();
      newUser.username = email;
      newUser.password = password;
      newUser.profile = "{}";
      newUser.createdOn = new Date();
      newUser.updatedOn = new Date();

      let userRecord = await userRepo.save(newUser);
    }

    //admins can see all users
    //TODO: get role by name
    // if (user.roles.includes("admin")) {
    //   return User.findById(id);
    // }
  },

  userUpdate: async function(userArgs, userSession){

    const userRepo = await getRepository(User);

    let profileObj = JSON.parse(userArgs.profile);

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

  contentGet: async function (
    id,
    contentTypeId,
    url,
    data,
    tag,
    user,
    returnAsArray = false
  ) {
    let contents = [];
    const contentRepo = await getRepository(Content);

    if (id) {
      let content = await contentRepo.findOne({ where: { id: id } });
      dalService.processContent(content);

      if (returnAsArray) {
        contents.push(content);
        return contents;
      }
      return content;
    } else if (url) {
      let content = await contentRepo.findOne({ where: { url: url } });
      dalService.processContent(content);
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
      let contentsQuery = Tag.findById(tag); //.populate("contents");
      contents = contentsQuery.exec();
      console.log(contents);
      return contents;
    } else {
      contents = await contentRepo.find();
    }

    dalService.processContents(contents);
    return contents;
  },

  contentUpdate: async function (id, url, data) {
    const contentRepo = await getRepository(Content);
    let content = await contentRepo.findOne({ where: { id: id } });
    content.url = url;
    content.data = JSON.stringify(data);
    return contentRepo.save(content);
  },

  processContent: function (entity, user) {
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

    content = dalService.checkPermission(entity, user);
  },

  processContents: function (entities, user) {
    entities.forEach((entitiy) => {
      dalService.processContent(entitiy, user);
    });
  },

  //get content type so we can detect permissions
  checkPermission: async function (data, user) {
    let contentTypeId = data.contentTypeId ?? data[0].contentTypeId;
    let contentType = await moduleService.getModuleContentType(contentTypeId);

    if (user && user.roles.includes("admin")) {
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
};
