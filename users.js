var http = require('http');
var fs = require('fs');
var sqlite3 = require('sqlite3');
var crypto = require('crypto')

const psswd_check = /^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])[\w\d_\)\(\*\&\^\%\$\#\@\!]*$/gm   //requires one capital letter and o

function check_pass(pass) {
  return psswd_check.test(pass);
}

function hash_pass(pass){
  var hash = crypto.createHash('sha256');
  data = hash.update(pass, 'utf-8');
  pass_hash= data.digest('hex');
  return pass_hash;
}

function pass_match(pass, pass_){
  return pass == pass_
}

class Users{
  constructor(db_name){
    this.db_name
    this.db = new sqlite3.Database(db_name, (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log(`Connected to ${db_name}`);
    });
    this.createTable();
  }

  createTable() {
    this.db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
        username text primary key not null,
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
      SELECT username FROM Users WHERE username=@usr;
      `, {'@usr': usr['username']}, (err, rows) => {
        if (err) {
          send(false);
        } 
        if (rows.length == 0){
          send(false);
        } else if (rows.length >= 1){
          rows.forEach(row => {
            console.log(row);
          })
          console.log("Found user " + rows[0].username + " with matching pass");
          send(true);
        } else {
          send(false);
          console.log("Hmm... something went wrong. Multiple Users Found")
        }

        });
    });
  }

  addtoTables(usr) {
    this.db.all(`INSERT INTO Users (username, pass_hash, firstname, lastname) VALUES (@usr, @pass, @first, @last);
      `, {'@usr':usr['username'], '@pass': hash_pass(usr['password']), '@first': usr['Last Name'], '@last': usr['First Name']}, (err)  => {
          if (err.code == 'SQLITE_CONSTRAINT'){
              console.log("User not added")
              console.error(err)
          }
          if (this.checkForUser(usr)) {
            console.log(usr)
            console.log("Added new user");
          }
        });
  }

  checkForUser(usr) {
    return new Promise(send => { 
      this.db.all(`
      SELECT username, pass_hash FROM Users WHERE username=@usr AND pass_hash=@pass;
      `, {'@usr': usr['username'], '@pass': hash_pass(usr['password'])}, (err, rows) => {
        if (err) {
          send(false);
          console.log(err);
        } 
        if (rows.length == 0){
          send(false);
        } else if (rows.length >= 1){
          rows.forEach(row => {
            console.log(row);
          })
          console.log("Found user " + rows[0].username + " with matching pass");
          send(true);
        } else {
          send(false);
          console.log("Hmm... something went wrong. Multiple Users Found")
        }

        });
    });
  }
}

module.exports.Users = Users
module.exports.check_pass = check_pass
module.exports.pass_match = pass_match