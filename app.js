const express = require("express");
const graphqlHttp = require("express-graphql");
const mongoose = require("mongoose");

const gqlSchema = require("./graphql/schema/index");
const gqlResolvers = require("./graphql/resolvers/index");

const app = express();

app.use(
  "/graphql",
  graphqlHttp({
    schema: gqlSchema,
    rootValue: gqlResolvers,
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@cluster0-ds9go.mongodb.net/${
      process.env.MONGO_DB
    }?retryWrites=true&w=majority`,
    { useNewUrlParser: true }
  )
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
