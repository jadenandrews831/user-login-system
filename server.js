const express = require("express");
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniquePrefix+'-'+file.originalname);
  }
})
// const fs = require('fs');
const bodyParser = require('body-parser');
var users = require('./users.js'); 

const app = express();
const upload = multer({ storage })
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

app.get("/login", (req, res) => {
  res.redirect(301, '/');
});

app.get("/groups", (req, res) => {
  getGroups(req, res);
});

app.get("/style.css", (req, res) => {
  res.sendFile(__dirname+'/src/style.css');
});

app.get('/groups.js', (req, res) => {
  res.sendFile(__dirname+'/src/groups.js');
});

app.get('/group.js', (req, res) => {
  res.sendFile(__dirname+'/src/group.js');
});

app.get('/get_groups', (req, res) => {
  get_groups(req, res);
});

app.get("/add_group", (req, res) => {
  res.sendFile(__dirname+'/src/add_group.html');
});

app.get('/groups.css', (req, res) => {
  res.sendFile(__dirname+'/src/groups.css');
});

app.get('/contacts', (req, res) => {
  getContacts(req, res)
})

app.get('/grp_contacts', (req, res) => {
  get_contacts(req, res)
})

app.get("/group", (req, res) => {
  const gid = req.query.id;
  res.sendFile(__dirname+'/src/group.html')
});

app.get('*', (req, res) => {
  console.log(`Webpage not found`);
  res.redirect(301, '/');
});



app.post("/registration", (req, res) => {
  if (!users.check_pass(req.body['password'])
  ){
    console.log('Password: '+req.body['password']);
    console.log(users.check_pass(req.body['password']));
    res.sendFile(__dirname+"/src/registration-chg-pass.html");
  } else {
    check_username(req, res);
  }
});

app.post("/add_group", upload.single('contact_list'),(req, res) => {
  add_group(req, res);
});

app.post("/send_email", (req, res) => {
  const email = req.body.email
  const gid = req.body.id
  console.log('Email Received: >>>', email)
  const next = {url: 'http://localhost:3000/'}
  console.log('Next: ', next);
  res.json({next});
  send_email(email, gid);
})

app.listen(3000, () => {
  console.log("Listening on Port http://localhost:3000");
});

async function send_email(email, gid) {
  console.log('Sending email...');
  console.log(`Email >>> \n${email}\n>>>\nGID: ${gid}`)
}

async function get_contacts(req, res) {
  const gid = req.query.id;

  let contacts = await db.getContacts(gid);
  let c = []

  for (i = 0; i < contacts.length; i++){
    c.push(contacts[i])
  }

  const resp = {data: c}

  console.log('Contact Data:', JSON.stringify(resp))
  res.json(resp)
}

async function getContacts(req, res) {
  const gid = req.query.id;

  let contacts = await db.getContacts(gid);
  let c = []

  for (i = 0; i < Math.min(3, contacts.length); i++){
    c.push(contacts[i])
  }

  const resp = {data: c}

  console.log('Contact Data:', JSON.stringify(resp))
  res.json(resp)
}

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

async function add_group(req, res) {
  console.log('Uploading File...');
  console.log(req.file);
  console.log('Group Name:', req.body.Name);


  // Group Created
  const name = req.body.Name;
  const id = await db.createGroupID();
  const hash = req.headers.cookie.split('=')[1];  // assumes login cookie is the only cookie
  const email = await db.getCurrentUserEmail(hash);
  const grp = {'id': id, 'name': name, 'email': email}
  console.log('Group: ', grp)
  db.addGroup(grp)

  // Contacts Created
  const file = require('./uploads/'+req.file.filename);
  for (let i = 0; i < Object.keys(file).length; i++) {
    let contact = {'fname': file[`${i}`].f_name, 'lname': file[`${i}`].l_name, 'email': file[`${i}`].email, 'id': await db.createContactID(), 'uemail': email}
    console.log(`Contact ${i}: ${JSON.stringify(contact)}`)
    db.addContact(contact);

    let gandc = {'gid': id, 'cid': contact.id}
    db.addGtoC(gandc)
  }

  res.redirect(301, '/groups')
}

async function logout(req, res) {
  console.log('Accessing /logout')
  const bool = await db.logOut(req.headers.cookie.split('=')[1]); // assumes login cookie is the only cookie
  if (bool) {
    res.clearCookie('usr');
    res.redirect(301, '/')
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
  const email = await db.getCurrentUserEmail(hash);
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