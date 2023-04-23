const express = require("express");
const bodyParser = require('body-parser');
var users = require('./users.js'); 

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const db = new users.Users('users.db');


app.get("/", (req, res) => {
  res.sendFile(__dirname+'/src/registration.html');
});

app.get("/registration.html", (req, res) => {
  res.sendFile(__dirname+'/src/registration.html');
});

app.post("/registration.html", (req, res) => {
  console.log(req.body);
  console.log(req.body['First Name']);
  console.log(req.body['Last Name'])
  console.log(req.body['password']);
  console.log(req.body['username']);
  db.addtoTables(req.body);
  res.sendFile(__dirname+"/src/index.html");
})

app.get("/login.html", (req, res) => {
  res.sendFile(__dirname+'/src/login.html');
  console.log(req.body);
});

app.post("/login.html", (req, res) => {
  console.log(req.body['username'])
})

app.get("/style.css", (req, res) => {
  res.sendFile(__dirname+'/src/style.css');
})

app.listen(3000, () => {
  console.log("Listening on Port http://localhost:3000");
});
