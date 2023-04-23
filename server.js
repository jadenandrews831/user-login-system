const express = require("express");
const bodyParser = require('body-parser')
var users = require('./users.js') 

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

db = users.

app.get("/", (req, res) => {
  res.sendFile(__dirname+'/src/registration.html')
});

app.get("/registration.html", (req, res) => {
  res.sendFile(__dirname+'/src/registration.html')
});

app.get("/style.css", (req, res) => {
  res.sendFile(__dirname+'/src/style.css')
})

app.post("/registration.html", (req, res) => {
  console.log()
  res.sendFile(__dirname+"/src/index.html")
})

app.get("/login.html", (req, res) => {
  res.sendFile(__dirname+'/src/login.html')
  console.log(req.body)
});

app.listen(3000, () => {
  console.log("Listening on Port http://localhost:3000");
});
