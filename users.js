var http = require('http');
var fs = require('fs');
var sqlite3 = require('sqlite3');
var crypto = require('crypto')

function hash_pass(pass)
{
  var hash = crypto.createHash('sha256');
  data = hash.update(pass, 'utf-8');
  pass_hash= data.digest('hex');
  return new String(pass_hash)
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
    create table users (
        username text primary key not null,
        pass_hash text not null,
        firstname text not null,
        lastname text not null
    );
        `, ()  => {
            this.runQueries();
    });

  }

  addtoTables(usr) {
    this.db.exec(`
    INSERT INTO users (username, pass_hash, firstname, lastname) VALUES ('${usr['username']}', '${hash_pass(usr['password'])}', '${usr['First Name']}', '${usr['Last Name']}');
        `, (err, rows)  => {
          if (err){
            console.log("User not added")
            return console.error(err)
          }
          console.log(`rows: {rows}`)
          this.checkForUser(usr);
          console.log("Added new user");
        });
  }

  checkForUser(usr) {
    return new Promise(send => {
      this.db.all(`
      SELECT username, pass_hash FROM users WHERE username='${usr['username']}' AND pass_hash='${hash_pass(usr['password'])}';
      `, [], (err, rows) => {
        if (err) {
          send(false);
          console.log(err);
          exit();
        } 
        if (rows.length == 0){
          send(false);
        } else if (rows.length == 1){
          send(true);
          console.log("Found user " + row.username + " with matching pass");
        } else {
          send(false);
          console.log("Hmm... something went wrong. Multiple Users Found")
        }

        });
    });
  }
}

module.exports.Users = Users