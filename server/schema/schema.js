const graphql = require("graphql");
const User = require("../models/user");
const Content = require("../models/content");
const { GraphQLJSONObject } = require("graphql-type-json");
const moduleService = require("../services/module.service");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
} = graphql;

//Schema defines data on the Graph like object types(book type), relation between
//these object types and describes how it can reach into the graph to interact with
//the data to retrieve or mutate the data

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    password: { type: GraphQLString },
    book: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return User.find({ userId: parent.id });
      },
    },
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
    filePath: { type: GraphQLString },
    moduleSystemId: { type: GraphQLString },
  }),
});

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
      },
      resolve(parent, args) {
        return User.findById(args.id);
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return User.find({});
      },
    },
    content: {
      type: ContentType,
      //argument passed by the user while making the query
      args: {
        id: { type: GraphQLID },
        contentTypeId: { type: GraphQLString },
        url: { type: GraphQLString },
      },

      // args: {
      //   id: { type: GraphQLID },
      //   url: { type: GraphQLString },
      // },

      resolve(parent, args) {
        //Here we define how to get data from database source

        //this will return the book with id passed in argument
        //by the user
        if (args.id) {
          return Content.findById(args.id);
        } else if (args.url) {
          return Content.findOne({
            url: args.url,
          });
        }
      },
    },
    contents: {
      type: new GraphQLList(ContentType),
      args: {
        contentTypeId: { type: GraphQLString },
        url: { type: GraphQLString },
      },

      resolve(parent, args) {
        return Content.find({
          contentTypeId: args.contentTypeId,
          url: args.url,
        });
      },
    },

    contentTypes: {
      type: new GraphQLList(ContentTypeType),
      resolve(parent, args) {
        console.log('getting mdules');
        return moduleService.getModuleContentTypes();
      },
    },
  },
});

//Very similar to RootQuery helps user to add/update to the database.
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        //GraphQLNonNull make these field required
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        let now = new Date();
        let user = new User({
          username: args.username,
          password: args.password,
          createdOn: now,
          updatedOn: now,
          realm: ["default"],
        });
        return user.save();
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

    addContent: {
      type: ContentType,
      args: {
        contentTypeId: { type: new GraphQLNonNull(GraphQLString) },
        data: {
          type: new GraphQLNonNull(GraphQLJSONObject),
        },
        createdByUserId: { type: new GraphQLNonNull(GraphQLID) },
        lastUpdatedByUserId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        let content = new Content({
          contentTypeId: args.contentTypeId,
          data: args.data,
          createdByUserId: args.createdByUserId,
          lastUpdatedByUserId: args.lastUpdatedByUserId,
        });
        return content.save();
      },
    },
  },
});

//Creating a new GraphQL Schema, with options query which defines query
//we will allow users to use when they are making request.
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
