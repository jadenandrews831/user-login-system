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
  check_login(req, res);
});

app.post("/", (req, res) => {
  login(req, res);
});

app.get("/registration", (req, res) => {
  res.sendFile(__dirname+'/src/registration.html');
});

app.get("/logout", (req, res) => {
  logout(req, res)
})

app.post("/registration", (req, res) => {
  if (!users.check_pass(req.body['password'])
  ){
    console.log('Password: '+req.body['password'])
    console.log(users.check_pass(req.body['password']));
    res.sendFile(__dirname+"/src/registration-chg-pass.html");
  } else {
    check_username(req, res);
  }
});

app.get("/login", (req, res) => {
  res.redirect(301, '/')
});

app.get("/groups", (req, res) => {
  getGroups(req, res)
});

app.get("/groups/group", (req, res) => {
  const hash = req.headers.cookie.split('=')[1];  // assumes login cookie is the only cookie
  const email = db.getCurrentUserEmail(hash);
})

app.get("/style.css", (req, res) => {
  res.sendFile(__dirname+'/src/style.css');
});

app.get('/groups.js', (req, res) => {
  res.sendFile(__dirname+'/src/groups.js')
})

app.get('/get_groups', (req, res) => {
  get_groups(req, res);
})

app.get('*', (req, res) => {
  res.redirect(301, '/')
})

app.listen(3000, () => {
  console.log("Listening on Port http://localhost:3000");
});

async function getGroups(req, res) {
  if (req.headers.cookie) {
    const hash = req.headers.cookie.split('=')[1];  // assumes login cookie is the only cookie
    console.log('Hash:', hash)
    const email = await db.getCurrentUserEmail(hash)
    if (email) {
      res.sendFile(__dirname+"/src/index.html")
    } else {
      res.clearCookie('usr')
      res.redirect(301,'/')
    }
    
  }
  else {
    res.redirect(301, '/login')
  }
}

async function logout(req, res) {
  console.log('Accessing /logout')
  const bool = await db.logOut(req.headers.cookie.split('=')[1]); // assumes login cookie is the only cookie
  if (bool) {
    res.clearCookie('usr');
    console.log('Logging out...')
    res.sendFile(__dirname+'/src/login.html')
  }
}

async function check_login(req, res) {
  if (req.headers.cookie) {  // assumes only cookie is login cookie
    hash = req.headers.cookie.split('=');
    const bool = await db.loggedIn(hash[1]);
    console.log('Logged IN: ', bool)
    if (bool) {
      res.redirect(301, '/groups')
    } else {
      res.sendFile(__dirname+'/src/login.html');
    }
  } else {
    res.sendFile(__dirname+'/src/login.html');
  }
}

async function get_groups(req, res) {
  const hash = req.headers.cookie.split('=')[1];  // assumes login cookie is the only cookie
  const email = db.getCurrentUserEmail(hash);
  console.log('Email:', email)
  if (email) {
    const grps = await db.seeGroups(email)
    console.log('Groups:', grps)
    if (grps) {
      res.json({groups: grps})
    } else {
      res.json({groups: 'No Groups Found!'})
    }
  }  else {
    res.json({groups: 'Error: No User Logged In'})
  }
  
}

async function login(req, res) {
  const bool = await db.checkForUser(req.body);
  console.log(bool);
  if (bool) { 
    const cookie = make_cookie(req.body['email']);
    res.cookie('usr', cookie);
    db.logIn(cookie, req.body['email']);
    res.redirect(301, '/groups');
  } else 
  {
    console.log("Login Failed")
    res.sendFile(__dirname+"/src/login-err.html");
  }
}

function make_cookie(email) {
  return users.hash_pass(email);
}

// async function login_cookie(req, res) {
//   console.log('Cookies: ', req.headers.cookie)
//   if (!req.headers.cookie) {
    
//   }
// }


async function check_username(req, res){
  if (users.pass_match(req.body['password'], req.body['password_'])){
    const founduser = await db.findUser(req.body);
    console.log(req.body);
    console.log("Found:"+founduser);
    if (!founduser){
      console.log(founduser)
      db.addtoTables(req.body);
      res.redirect(301, '/login');
    } else {
      res.sendFile(__dirname+"/src/registration-usr-tkn.html");
    }
  } else {
    res.sendFile(__dirname+'/src/registration-psswd-match.html');
  }
}