const express = require("express");
const app = express();
var users = require('./users.js') 

app.get("/", (req, res) => {
  res.sendFile(__dirname+'/src/registration.html')
});

app.get("/registration.html", (req, res) => {
  res.sendFile(__dirname+'/src/registration.html')
});

app.post("/registration.html", (req, res) => {
  console.log(req.body)
  res.sendFile(__dirname+"/src/index.html")
})

app.get("/login.html", (req, res) => {
  res.sendFile(__dirname+'/src/login.html')
});

app.listen(3000, () => {
  console.log("Listening on Port http://localhost:3000");
});
