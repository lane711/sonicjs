const graphql = require("graphql");
// const User = require("./models/user");
// const Content = require("./models/content");
// const Tag = require("./models/tag");

const { GraphQLJSONObject } = require("graphql-type-json");
const moduleService = require("../services/module.service");
const { data } = require("jquery");
const fileService = require("../services/file.service");
const medi = (ervice = require("../services/media.service"));
const viewService = require("../services/view.service");
const dalService = require("../services/dal.service");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLBoolean,
} = graphql;

const {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime,
} = require("graphql-iso-date");
const mediaService = require("../services/media.service");

//Schema defines data on the Graph like object types(book type), relation between
//these object types and describes how it can reach into the graph to interact with
//the data to retrieve or mutate the data

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    password: { type: GraphQLString },
    lastLoginOn: { type: GraphQLDateTime },
    profile: { type: GraphQLJSONObject },
    // book: {
    //   type: new GraphQLList(UserType),
    //   resolve(parent, args) {
    //     return User.find({ userId: parent.id });
    //   },
    // },
  }),
});

const TagType = new GraphQLObjectType({
  name: "Tag",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    url: { type: GraphQLString },
    createdOn: { type: GraphQLJSONObject },
    updatedOn: { type: GraphQLJSONObject },
    Contents: {
      type: new GraphQLList(ContentType),
      resolve(parent, args) {
        return Content.find({ tags: parent.id });
      },
    },
  }),
});

const TagRefType = new GraphQLObjectType({
  name: "TagRefType",
  fields: () => ({
    ContentId: { type: GraphQLString },
    tagId: { type: GraphQLString },
    status: { type: GraphQLString },
  }),
});

const ContentType = new GraphQLObjectType({
  name: "Content",
  //We are wrapping fields in the function as we dont want to execute this ultil
  //everything is inilized. For example below code will throw error UserType not
  //found if not wrapped in a function
  fields: () => ({
    id: { type: GraphQLID },
    contentTypeId: { type: GraphQLString },
    data: { type: GraphQLJSONObject },
    url: { type: GraphQLString },
    createdOn: { type: GraphQLJSONObject },
    updatedOn: { type: GraphQLJSONObject },
    createdByUserId: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.userId);
      },
    },
    lastUpdatedByUserId: {
      type: UserType,
      resolve(parent, args) {
        return User.findById(parent.userId);
      },
    },
  }),
});

const ContentTypeType = new GraphQLObjectType({
  name: "ContentType",
  fields: () => ({
    title: { type: GraphQLString },
    systemId: { type: GraphQLString },
    data: { type: GraphQLJSONObject },
    permissions: { type: GraphQLJSONObject },
    filePath: { type: GraphQLString },
    moduleSystemId: { type: GraphQLString },
  }),
});

const FileType = new GraphQLObjectType({
  name: "FileType",
  fields: () => ({
    filePath: { type: GraphQLString },
    fileContent: { type: GraphQLString },
  }),
});

const MediaType = new GraphQLObjectType({
  name: "MediaType",
  fields: () => ({
    id: { type: GraphQLString },
    data: { type: GraphQLJSONObject },
  }),
});

const ViewType = new GraphQLObjectType({
  name: "ViewType",
  fields: () => ({
    html: { type: GraphQLString },
  }),
});

const ModuleType = new GraphQLObjectType({
  name: "ModuleType",
  fields: () => ({
    title: { type: GraphQLString },
    systemId: { type: GraphQLString },
    enabled: { type: GraphQLBoolean },
    canBeAddedToColumn: { type: GraphQLString },
  }),
});

class FileData {
  constructor(filePath, fileContent) {
    this.filePath = filePath;
    this.fileContent = fileContent;
  }
}

//RootQuery describe how users can use the graph and grab data.
//E.g Root query to get all Users, get all books, get a particular
//book or get a particular User.
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    // book: {
    //   type: BookType,
    //   //argument passed by the user while making the query
    //   args: { id: { type: GraphQLID } },
    //   resolve(parent, args) {
    //     //Here we define how to get data from database source

    //     //this will return the book with id passed in argument
    //     //by the user
    //     return Book.findById(args.id);
    //   },
    // },
    // books: {
    //   type: new GraphQLList(BookType),
    //   resolve(parent, args) {
    //     return Book.find({});
    //   },
    // },
    user: {
      type: UserType,
      args: {
        id: { type: GraphQLID },
        username: { type: GraphQLString },
        password: { type: GraphQLString },
        sessionID: { type: GraphQLString },
      },
      async resolve(parent, args, req, res) {
        //create a direct api instead of user.find...
        // then use that api directly from the admin backend
        return dalService.userGet(
          args.id,
          await getUserSession(args.sessionID, req.sessionID),
          req
        );
        //user can always see their own profile
        if (args.id === req.session.passport.userId) {
          return User.findById(args.id);
        }

        //admins can see all users
        //TODO: get role by name
        if (req.session.passport.user.roles.includes("admin")) {
          return User.findById(args.id);
        }
      },
    },
    users: {
      type: new GraphQLList(UserType),
      args: {
        sessionID: { type: GraphQLString },
      },
      async resolve(parent, args, req) {
        return dalService.usersGet(
          await getUserSession(args.sessionID, req.sessionID),
          req
        );
      },
    },
    roles: {
      type: new GraphQLList(ContentType),
      args: {
        sessionID: { type: GraphQLString },
      },
      async resolve(parent, args, req) {
        return dalService.contentGet(
          "",
          "role",
          "",
          "",
          "",
          await getUserSession(args.sessionID, req.sessionID),
          req
        );

        // return Content.find({
        //   ContentTypeId: "role",
        // });
      },
    },
    content: {
      type: ContentType,
      //argument passed by the user while making the query
      args: {
        id: { type: GraphQLID },
        contentTypeId: { type: GraphQLString },
        url: { type: GraphQLString },
        data: { type: GraphQLString },
        sessionID: { type: GraphQLString },
      },
      async resolve(parent, args, req) {
        return dalService.contentGet(
          args.id,
          args.contentTypeId,
          args.url,
          args.data,
          args.tag,
          await getUserSession(args.sessionID, req.sessionID),
          req
        );
        // if (args.id) {
        //   return Content.findById(args.id);
        // } else if (args.url) {
        //   return Content.findOne({
        //     url: args.url,
        //   });
        // } else if (args.data) {
        //   return Content.find({
        //     data: { name: "my data 5" },
        //   });
        // }
      },
    },
    contents: {
      type: new GraphQLList(ContentType),
      args: {
        id: { type: GraphQLID },
        contentTypeId: { type: GraphQLString },
        url: { type: GraphQLString },
        data: { type: GraphQLJSONObject },
        tag: { type: GraphQLString },
        sessionID: { type: GraphQLString },
      },

      async resolve(parent, args, req, res) {
        return dalService.contentGet(
          args.id,
          args.contentTypeId,
          args.url,
          args.data,
          args.tag,
          await getUserSession(args.sessionID, req.sessionID),
          req,
          true
        );
        // if (args.ContentTypeId) {
        //   return Content.find({
        //     ContentTypeId: args.ContentTypeId,
        //   });
        // } else if (args.url) {
        //   return Content.find({
        //     url: args.url,
        //   });
        // } else if (args.data) {
        //   var query = {};
        //   query["data." + args.data.attr] = args.data.val;
        //   console.log("query", query);
        //   return Content.find(query);
        // } else if (args.tag) {
        //   let ContentsQuery = Tag.findById(args.tag); //.populate("Contents");
        //   let Contents = ContentsQuery.exec();
        //   console.log(Contents);
        //   return Contents;
        // } else {
        //   return Content.find({});
        // }
      },
    },

    contentTypes: {
      type: new GraphQLList(ContentTypeType),
      args: {
        sessionID: { type: GraphQLString },
      },
      async resolve(parent, args, req) {
        return moduleService.getModuleContentTypes(
          await getUserSession(args.sessionID, req.sessionID),
          req
        );
      },
    },

    contentType: {
      type: ContentTypeType,
      args: {
        systemId: { type: GraphQLString },
        sessionID: { type: GraphQLString },
      },
      async resolve(parent, args, req) {
        return moduleService.getModuleContentType(
          args.systemId,
          await getUserSession(args.sessionID, req.sessionID),
          req
        );
      },
    },

    tags: {
      type: new GraphQLList(TagType),
      resolve(parent, args, context) {
        return Tag.find({}).populate("Contents");
      },
    },

    tag: {
      type: TagType,
      args: {
        id: { type: GraphQLID },
      },
      resolve(parent, args) {
        return Tag.findById(args.id).populate("Contents");
      },
    },

    media: {
      type: new GraphQLList(MediaType),
      resolve(parent, args, req) {
        return mediaService.getMedia(req.sessionID);
      },
    },

    view: {
      type: ViewType,
      args: {
        contentType: { type: GraphQLString },
        viewModel: { type: GraphQLString },
        viewPath: { type: GraphQLString },
        sessionID: { type: GraphQLString },
      },
      resolve(parent, args) {
        let html = viewService.getProcessedView(
          args.ContentType,
          JSON.parse(args.viewModel),
          args.viewPath
        );
        return { html: html };
      },
    },
  },
});

//Very similar to RootQuery helps user to add/update to the database.
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    //user mutations
    userCreate: {
      type: UserType,
      args: {
        //GraphQLNonNull make these field required
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        sessionID: { type: GraphQLString },
      },
      resolve(parent, args) {
        // let now = new Date();
        // let user = new User({
        //   username: args.username,
        //   password: args.password,
        //   createdOn: now,
        //   updatedOn: now,
        //   realm: ["default"],
        //   profile: { firstName: "Lane" },
        // });
        // user.save();

        let newUser = User.register(
          { username: args.username, active: false },
          args.password
        ).then((user) => {
          // let userRecord = User.findById(user.id);
          // userRecord.profile = { prop: "ipsum" };
          // userRecord.save();
          // let userRecord = User.findByIdAndUpdate(
          //   args.tagId, {profile: {prop: "ipsum"}}
          // );
          // userRecord.exec();
        });

        return newUser;
        // return user.save();
      },
    },
    userUpdate: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        password: { type: GraphQLString },
        profile: {
          type: new GraphQLNonNull(GraphQLString),
        },
        sessionID: { type: GraphQLString },
      },
      resolve(parent, args, context) {
        let user = args;
        user.id = parseInt(user.id);
        return dalService.userUpdate(user, context.session.passport.user);
      },
    },

    userDelete: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        sessionID: { type: GraphQLString },
      },
      async resolve(parent, args, context) {
        return dalService.userDelete(
          args.id,
          await getUserSession(args.sessionID, undefined)
          );
      },
    },
    // addBook: {
    //   type: BookType,
    //   args: {
    //     name: { type: new GraphQLNonNull(GraphQLString) },
    //     pages: { type: new GraphQLNonNull(GraphQLInt) },
    //     userId: { type: new GraphQLNonNull(GraphQLID) },
    //   },
    //   resolve(parent, args) {
    //     let book = new Book({
    //       name: args.name,
    //       pages: args.pages,
    //       userId: args.userId,
    //     });
    //     return book.save();
    //   },
    // },

    //tag mutations
    tagCreate: {
      type: TagType,
      args: {
        //GraphQLNonNull make these field required
        title: { type: new GraphQLNonNull(GraphQLString) },
        url: { type: new GraphQLNonNull(GraphQLString) },
        createdByUserId: { type: new GraphQLNonNull(GraphQLID) },
        lastUpdatedByUserId: { type: new GraphQLNonNull(GraphQLID) },
        sessionID: { type: GraphQLString },
      },
      resolve(parent, args) {
        let now = new Date();
        let tag = new Tag({
          title: args.title,
          url: args.url,
          createdOn: now,
          updatedOn: now,
          realm: ["default"],
        });
        return tag.save();
      },
    },

    tagAddToContent: {
      type: TagRefType,
      args: {
        ContentId: { type: new GraphQLNonNull(GraphQLString) },
        tagId: { type: new GraphQLNonNull(GraphQLString) },
        sessionID: { type: GraphQLString },
      },
      resolve(parent, args) {
        //TODO: only add if not already exists
        let tagDoc = Tag.findByIdAndUpdate(
          args.tagId,
          { $push: { Contents: args.ContentId } },
          { new: true }
        );
        tagDoc.exec();

        let ContentDoc = Content.findByIdAndUpdate(
          args.ContentId,
          { $push: { tags: args.tagId } },
          { new: true }
        );
        ContentDoc.exec();

        let tagRef = {};
        tagRef.ContentId = args.ContentId;
        tagRef.tagId = args.tagId;
        tagRef.status = "success";
        return tagRef;
      },
    },

    //Content mutations
    contentCreate: {
      type: ContentType,
      args: {
        url: { type: new GraphQLNonNull(GraphQLString) },
        contentTypeId: { type: new GraphQLNonNull(GraphQLString) },
        data: {
          type: new GraphQLNonNull(GraphQLString),
        },
        sessionID: { type: GraphQLString },
      },
      async resolve(parent, args, req) {
        let dataObj = JSON.parse(args.data);
        let result = await dalService.contentUpdate(
          "",
          args.url,
          dataObj,
          await getUserSession(args.sessionID, req.sessionID)
        );

        return result;
        // let userId = (context.session.userSession && context.session.userSession.id)
        //   ? context.session.userSession.id
        //   : args.createdByUserId;
        // let now = new Date();
        // let dataObj = JSON.parse(args.data);
        // args.data = dataObj;
        // let Content = new Content({
        //   contentTypeId: args.contentTypeId,
        //   data: args.data,
        //   url: args.url,
        //   createdByUserId: userId,
        //   createdOn: now,
        //   lastUpdatedByUserId: userId,
        //   updatedOn: now,
        // });
        // return Content.save();
      },
    },

    //TODO: fix Content update
    contentUpdate: {
      type: ContentType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        url: { type: new GraphQLNonNull(GraphQLString) },
        data: {
          type: new GraphQLNonNull(GraphQLString),
        },
        sessionID: { type: GraphQLString },
        // createdByUserId: { type: new GraphQLNonNull(GraphQLID) },
        // lastUpdatedByUserId: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(parent, args, req) {
        let dataObj = JSON.parse(args.data);
        return dalService.contentUpdate(
          args.id,
          args.url,
          dataObj,
          await getUserSession(args.sessionID, req.sessionID)
        );
        // args.data = dataObj;
        // let ContentDoc = Content.findByIdAndUpdate(args.id, {
        //   url: args.url,
        //   data: args.data,
        // });
        // ContentDoc.exec();

        // return ContentDoc;
      },
    },

    contentDelete: {
      type: ContentType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        sessionID: { type: GraphQLString },
      },
      async resolve(parent, args) {
        return dalService.contentDelete(
          args.id, 
          await getUserSession(args.sessionID, undefined)
          )
        // return Content.findByIdAndDelete(args.id);
      },
    },

    // Content type mutations
    contentTypeCreate: {
      type: ContentTypeType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        systemId: { type: new GraphQLNonNull(GraphQLString) },
        moduleSystemId: { type: new GraphQLNonNull(GraphQLString) },
        sessionID: { type: GraphQLString },
      },
      resolve(parent, args) {
        return moduleService.createModuleContentType(args);
      },
    },

    contentTypeUpdate: {
      type: ContentTypeType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        systemId: { type: new GraphQLNonNull(GraphQLString) },
        moduleSystemId: { type: new GraphQLNonNull(GraphQLString) },
        filePath: { type: GraphQLString },
        permissions: { type: new GraphQLNonNull(GraphQLString) },
        data: { type: new GraphQLNonNull(GraphQLString) },
        sessionID: { type: GraphQLString },
        // data: {
        //   type: new GraphQLNonNull(GraphQLJSONObject),
        // },
        // lastUpdatedByUserId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args, req) {
        let dataObj = JSON.parse(args.data);
        let permissionsObj = JSON.parse(args.permissions);

        args.data = dataObj;
        args.permissions = permissionsObj;

        console.log("ContentTypeUpdate", args);
        moduleService.contentTypeUpdate(args, args.sessionID, req).then((data) => {
          return data;
        });
      },
    },

    contentTypeDelete: {
      type: ContentTypeType,
      args: {
        systemId: { type: new GraphQLNonNull(GraphQLString) },
        sessionID: { type: GraphQLString },
      },
      resolve(parent, args) {
        moduleService.deleteModuleContentType(args.systemId).then((data) => {
          return data;
        });
      },
    },

    //file mutations
    fileCreate: {
      type: FileType,
      args: {
        filePath: { type: new GraphQLNonNull(GraphQLString) },
        fileContent: { type: new GraphQLNonNull(GraphQLString) },
        sessionID: { type: GraphQLString },
      },
      resolve(parent, args) {
        fileService.writeFile(args.filePath, args.fileContent);
        let fileData = new FileData(args.filePath, args.fileContent);
        return fileData;
      },
    },

    fileUpdate: {
      type: FileType,
      args: {
        filePath: { type: new GraphQLNonNull(GraphQLString) },
        fileContent: { type: new GraphQLNonNull(GraphQLString) },
        sessionID: { type: GraphQLString },
      },
      resolve(parent, args) {
        fileService.writeFile(args.filePath, args.fileContent);
        let fileData = new FileData(args.filePath, args.fileContent);
        return fileData;
      },
    },

    // module type mutations
    moduleTypeCreate: {
      type: ModuleType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        enabled: { type: new GraphQLNonNull(GraphQLBoolean) },
        systemId: { type: new GraphQLNonNull(GraphQLString) },
        canBeAddedToColumn: { type: new GraphQLNonNull(GraphQLBoolean) },
        sessionID: { type: GraphQLString },
      },
      resolve(parent, args) {
        return moduleService.createModule(args);
      },
    },

    moduleTypeDelete: {
      type: ModuleType,
      args: {
        systemId: { type: new GraphQLNonNull(GraphQLString) },
        sessionID: { type: GraphQLString },
      },
      resolve(parent, args) {
        return moduleService.deleteModule(args.systemId);
      },
    },

    moduleTypeUpdate: {
      type: ModuleType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        enabled: { type: new GraphQLNonNull(GraphQLBoolean) },
        systemId: { type: new GraphQLNonNull(GraphQLString) },
        canBeAddedToColumn: { type: new GraphQLNonNull(GraphQLBoolean) },
        singleInstance: { type: new GraphQLNonNull(GraphQLBoolean) },
        version: { type: new GraphQLNonNull(GraphQLString) },
        sessionID: { type: GraphQLString },
      },
      resolve(parent, args) {
        return moduleService.updateModule(args);
      },
    },

    //media
    mediaDelete: {
      type: ContentType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        sessionID: { type: GraphQLString },
      },
      async resolve(parent, args) {
        return mediaService.mediaDelete(
          args.id, 
          await getUserSession(args.sessionID, undefined)
          )
        // return Content.findByIdAndDelete(args.id);
      },
    },
  },
});

async function getUserSession(sessionID, reqSessionID) {

  if(sessionID == 0){
    return {user : {id: 0}};
  }

  let id = sessionID;
  if (!id || id === "undefined") {
    id = reqSessionID;
  }
  let session = await dalService.sessionGet(id);

  if (!session || session === "undefined") {
    session = undefined;
    // throw new Error("Session not found");
  }

  return session;
}

//Creating a new GraphQL Schema, with options query which defines query
//we will allow users to use when they are making request.
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
