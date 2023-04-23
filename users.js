var http = require('http');
var fs = require('fs');
var sqlite3 = require('sqlite3');
var crypto = require('crypto')

function hash_pass(pass)
{
  var hash = crypto.createHash('sha256');
  data = hash.update(pass, 'utf-8');
  pass_hash= data.digest('hex');
  console.log("pass_hash : " + pass_hash);
  return pass_hash
}

class Users{
  constructor(db_name){
    this.db_name = db_name
    this.db = new sqlite3.Database(this.db_name, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err && err.code == "SQLITE_CANTOPEN") {
          this.db = this.createDatabase();
          return;
          } else if (err) {
              console.log("Getting error " + err);
              exit(1);
      }
    });
  }

  createDatabase() {
    var newdb = new sqlite3.Database(this.db_name, (err) => {
      if (err) {
          console.log("Getting error " + err);
          exit(1);
      }
      this.createTables();
    });

    return newdb
  }

  createTables() {
    this.db.exec(`
    create table users (
        username text primary key not null,
        pass_hash text not null,
        firstname not null,
        lastname text not null,
        email text not null
    );
        `, ()  => {
            this.runQueries();
    });
  }

  addtoTables(usr) {
    this.db.exec(`
    insert into users (username, pass_hash, firstname, lastname, email)
        values (${usr[0]}, ${hash_pass(usr[1])}, ${usr[2]}, ${usr[3]}, ${usr[4]}),
        `, ()  => {
          this.runQueries();
        });
    console.log("Added new user");
  }

  checkForUser(usr) {
    this.db.all(`
    select username, pass_hash from users where username = ${user[0]} AND pass_hash = ${pass_hash(user[1])}
    `, (err, rows) => {
      rows.forEach(row => {
        console.log(row.username + "\t" + row.pass_hash + "\t");
      });
    });
  }


  runQueries() {
    this.db.all(`
    select * from users
    `, (err, rows) => {
      rows.forEach(row => {
        console.log(row.username + "\t" +row.pass_hash + "\t" +row.firstname + "\t" +row.lastname + "\t" +row.email);
      });
    });
  }
}

module.exports.Users = Users