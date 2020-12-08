const express = require("express");
const graphqlHTTP = require("express-graphql");
const schema = require("./server/schema/schema");
const app = express();
const { request, gql } = require("graphql-request");

const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/graphQL", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.once("open", () => {
  console.log("conneted to database");
});

//This route will be used as an endpoint to interact with Graphql,
//All queries will go through this route.
app.use(
  "/graphql",
  graphqlHTTP({
    //Directing express-graphql to use this schema to map out the graph
    schema,
    //Directing express-graphql to use graphiql when goto '/graphql' address in the browser
    //which provides an interface to make GraphQl queries
    graphiql: true,
  })
);

app.get("/", async function (req, res) {
  const query = gql`
  {
    authors{
      id
      name
      book{
        name
        pages
      }
    }
    }
  `;
  request("http://localhost:3000/graphql", query).then((data) =>{
    console.log(data);
  res.send(data);
  }
  );

});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
