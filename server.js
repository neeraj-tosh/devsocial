const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();
app.get("/", (req, res) => res.send("Hello!"));

// DB config
const db = require("./config/keys").mongoURI;

// connect to db
mongoose
  .connect(db)
  .then(() => console.log("connected to database"))
  .catch(err => console.log(err));

const port = process.env.port || 5000;

//use routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

app.listen(port, () =>
  console.log(`Server is up and running on ${port} port.`)
);
