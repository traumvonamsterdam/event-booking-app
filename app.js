const express = require("express");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const graphql_schema = require("./graphql-schema");
const mongoose = require("mongoose");

const Event = require("./models/event");

const app = express();

app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(graphql_schema),
    rootValue: {
      events: () =>
        Event.find()
          .then(events =>
            events.map(event => ({
              ...event._doc,
              _id: event.id
            }))
          )
          .catch(err => {
            throw err;
          }),
      createEvent: args => {
        const { title, description, price, date } = args.eventInput;
        const event = new Event({
          title,
          description,
          price,
          date: new Date(date)
        });
        return event
          .save()
          .then(result => {
            console.log(result);
            return { ...result._doc, _id: result.id };
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      }
    },
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
