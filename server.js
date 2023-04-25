const express = require("express");
const bodyParser = require('body-parser');
var users = require('./users.js'); 

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const db = new users.Users('users.db');
// var username = req.body.username;
// var password = req.body.password;

// if(req.body.username && req.body.password) {
//   console.log('Checking username:' + username + 'password' + password);
//   var database = new sqlite3.database('usersdatabase');
//   database.all("Verify tables where (username == ?) AND (password == ?") , function(err,rows){
//     if(err) {

//     }
//   }
// }

app.get("/", (req, res) => {
  res.sendFile(__dirname+'/src/registration.html');
});

app.get("/registration.html", (req, res) => {
  res.sendFile(__dirname+'/src/registration.html');
});

app.post("/registration.html", (req, res) => {
  if (users.check_pass(req.body['password'])){
    db.addtoTables(req.body);
    res.sendFile(__dirname+"/src/login.html");
  }
  else{
    res.sendFile(__dirname+"/src/registration.html");
  }
});

app.get("/login.html", (req, res) => {
  res.sendFile(__dirname+'/src/login.html');
  console.log(req.body);
});

app.post("/login.html", (req, res) => {
  login(req, res);
})

app.get("/style.css", (req, res) => {
  res.sendFile(__dirname+'/src/style.css');
});

app.listen(3000, () => {
  console.log("Listening on Port http://localhost:3000");
});

async function login(req, res) {
  bool = await db.checkForUser(req.body);
  console.log(bool);
  if (bool) {
    res.sendFile(__dirname+"/src/index.html");
  } else 
  {
    console.log("Login Failed")
    res.sendFile(__dirname+"/src/login.html");
  }
}