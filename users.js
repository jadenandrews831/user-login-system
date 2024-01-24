var http = require('http');
var fs = require('fs');
var sqlite3 = require('sqlite3');
var crypto = require('crypto')

const psswd_check = /^(?=.{8,64})(?=.*[a-z])(?=.*[A-Z])(?=.*[\d_" "\)\(\*\&\^\%\$\#\@\!])(?=)[\w\d_" "\)\(\*\&\^\%\$\#\@\!]*$/gm  //requires one capital letter, one lowercase letter, and one number
const email_check = /^.+@.+(.com|.net|.gov|.edu)$/gm


function check_pass(pass) {
  test_val = psswd_check.test(pass);
  console.log("Password check: "+test_val);
  return test_val;
}

function check_email(email) {
  test_val = email_check.test(email);
  console.log("Email check: ", email)
  return test_val;
}

function hash_pass(pass){
  var hash = crypto.createHash('sha256');
  data = hash.update(pass, 'utf-8');
  pass_hash= data.digest('hex');
  console.log(pass_hash);
  return pass_hash;
}

function pass_match(pass, pass_){
  return pass == pass_
}

class Users{
  constructor(db_name){
    this.db_name = db_name;
    this.db = new sqlite3.Database(this.db_name, (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log(`Connected to ${this.db_name}`);
    });
    this.createTable();
    this.createLoggedIn();
  }

  createLoggedIn() {
    this.db.exec(`
    CREATE TABLE IF NOT EXISTS logged_in (
      hash text primary key not null
    );
    `, () => {
      console.log('logged in table created')
    });
  }

  logIn(hash) {
    this.db.all(`INSERT INTO logged_in (hash) VALUES (@hash);`
      ,{'@hash': hash}, (err) => {
        if(err) {
          console.log(err)
        } else {
          console.log('Logged in: ', hash)
        }
      });
  }

  logOut(hash) {
    this.db.all(`DELETE FROM logged_in WHERE hash=@hash`, 
    {'@hash': hash}, (err) => {
      if (err){
        console.log(err)
      } else {
        console.log('Logged Out')
      }
    })
  }

  loggedIn(hash) {
    return new Promise(send => {
      this.db.all(`
      SELECT hash FROM logged_in WHERE hash=@hash;
      `, {'@hash': hash}, (err, rows) => {
        if (err) {
          console.log(err)
          send(false)
        } else if (rows.length == 0) {
          console.log('User not logged in', rows, hash);
          send(false)
        } else if (rows.length == 1) {
          rows.forEach(row => {
            console.log(row)
          });
          console.log("User logged in")
          send(true)
        } else {
          console.log('Multiple User Logins')
          send(false)
        }
      });
    })
  }

  createTable() {
    this.db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
        email_address text primary key not null,
        pass_hash text not null,
        firstname text not null,
        lastname text not null
    );
        `, ()  => {
            console.log("table created");
    });

  }

  findUser(usr){
    return new Promise(send => { 
      this.db.all(`
      SELECT email_address FROM Users WHERE email_address=@email;
      `, {'@email': usr['email']}, (err, rows) => {
        if (err) {
          send(false);
        } 
        if (rows.length == 0){
          send(false);
        } else if (rows.length >= 1){
          rows.forEach(row => {
            console.log(row);
          })
          console.log("Found user " + rows[0].email_address + " with matching pass");
          send(true);
        } else {
          send(false);
          console.log("Hmm... something went wrong. Multiple Users Found")
        }

        });
    });
  }

  addtoTables(usr) {
    this.db.all(`INSERT INTO Users (email_address, pass_hash, firstname, lastname) VALUES (@email, @pass, @first, @last);
      `, {'@email':usr['email'], '@pass': hash_pass(usr['password']), '@first': usr['Last Name'], '@last': usr['First Name']}, (err)  => {
          if (err){
            if (err.code == 'SQLITE_CONSTRAINT'){
              console.log("User not added")
              console.error(err)
            }
          } else
          if (this.checkForUser(usr)) {
            console.log(usr)
            console.log("Added new user");
          }
        });
  }

  checkForUser(usr) {
    return new Promise(send => { 
      this.db.all(`
      SELECT email_address, pass_hash FROM Users WHERE email_address=@email AND pass_hash=@pass;
      `, {'@email': usr['email'], '@pass': hash_pass(usr['password'])},(err, rows) => {
        if (err) {
          console.log(err);
          send(false);
        } else
        if (rows.length == 0){
          console.log('No user found: ', usr);
          console.log('Rows: '+rows);
          send(false);
        } else if (rows.length >= 1){
          rows.forEach(row => {
            console.log(row);
          })
          console.log("Found user " + rows[0].email_address + " with matching pass");
          send(true);
        } else {
          send(false);
          console.log("Hmm... something went wrong. Multiple Users Found")
        }

        });
    });
  }
}

class Groups{
  constructor (grp_name, usr){
    this.grp_name = grp_name;
    this.usr = usr;
    console.log("Created Group: "+grp_name);

    this.db = new sqlite3.Database(this.usr.db_name, err => {
      if (err) {
        return console.error(err.message);
      }
      console.log(`Groups connected to ${this.db_name}`);
    })
  }

  addContact() {

  }
}

module.exports.Users = Users;
module.exports.Groups = Groups;
module.exports.check_pass = check_pass;
module.exports.hash_pass = hash_pass;
module.exports.check_email = check_email;
module.exports.pass_match = pass_match;