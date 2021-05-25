const User = require("../schema/models/user");
// const Content = require("../schema/models/content");
const Tag = require("../schema/models/tag");

var dataService = require("./data.service");

const { getRepository } = require("typeorm");
const { Post } = require("../data/model/Post");
const {  Content } = require("../data/model/Content");

module.exports = dalService = {
  startup: async function (app) {
    app.get("/typeorm", async function (req, res) {
      // const users = await userRepository.find();
      res.json(await dalService.test());
    });
  },

  test: async function () {
    const contentRepo = await getRepository(Content);

    let content = new Content();
    content.data = JSON.stringify({ data: "test" });
    content.contentTypeId = 'test';
    content.createdByUserId = '123'
    content.lastUpdatedByUserId = '123'
    content.createdOn = new Date();
    content.updatedOn = new Date();
    content.url = '/ipsum1'
    content.tags = [];
  
    contentRepo.save(content);


    const posts = await getRepository(Content).find();
    return posts;




    // const typeorm = require("typeorm");
    // const { Post } = require("../data/model/Post");

    // const databaseConnection = require("../data/database.connection.json");

    // typeorm.createConnection(databaseConnection).then((connection) => {
    //   const posts = getRepository(Post);

    //   console.log("SQL Lite DAL!");

    // let newPost = new Post();
    // newPost.title = "Control flow based type analysis";
    // newPost.text = "TypeScript 2.0 implements a control flow-based type analysis for local variables and parameters.";

    // let postRepository = connection.getRepository(Post);
    // postRepository.save(newPost);
    // });
  },

  getUser: async function (id, user) {
    if (id === user.id) {
      return User.findById(id);
    }

    //admins can see all users
    //TODO: get role by name
    if (user.roles.includes("admin")) {
      return User.findById(id);
    }
  },

  getContents: async function (id, contentTypeId, url, data, tag, user, returnAsArray = false) {
    let contents = [];
    const contentRepo = await getRepository(Content);

    if(id){
      let content = await contentRepo.findOne(
        { where:
            { id:  id}
        });
        dalService.processContent(content);

        if(returnAsArray){
          contents.push(content);
          return contents;
        }
        return content;
    }
    else if (contentTypeId) {
      contents = await contentRepo.find(
        { where:
            { contentTypeId:  contentTypeId}
        });
        
    } else if (url) {
      contents = await contentRepo.find(
        { where:
            { url:  url}
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

  processContent: function (content, user){
    content.data = JSON.parse(content.data);
    content = dalService.checkPermission(content, user);
  },

  processContents: function (contents, user){
    contents.forEach(content => {
      dalService.processContent(content, user);
    });
  },

  //get content type so we can detect permissions
  checkPermission: async function (data, user) {
    let contentTypeId = data[0].contentTypeId;
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
