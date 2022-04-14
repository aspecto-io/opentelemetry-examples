const tracer = require("./tracing.aspecto")("todo-service");
const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());
const port = 3000;
let db;

app.get("/todo", async (req, res) => {
  const todos = await db.collection("todos").find({}).toArray();
  res.send(todos);
});

app.get("/todo/:id", async (req, res) => {
  const todo = await db.collection("todos").findOne({ id: req.params.id });
  res.send(todo);
});

const startServer = () => {
  tracer.startSpan("startServer").end();
  MongoClient.connect("mongodb://localhost:27017", (err, client) => {
    db = client.db("todo");
    db.collection("todos").insertMany([
      { id: "1", title: "Buy groceries" },
      { id: "2", title: "Install Aspecto" },
      { id: "3", title: "buy dogz.io domain" },
    ]);
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};
startServer();
