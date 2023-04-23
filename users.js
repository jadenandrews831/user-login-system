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

function Users(db_name){

  let db= new sqlite3.Database(`./${db_name}.db`, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
        createDatabase();
        return;
        } else if (err) {
            console.log("Getting error " + err);
            exit(1);
    }
    runQueries(db);
  });

  function createDatabase(newdb) {
      var newdb = new sqlite3.Database(db_name, (err) => {
          if (err) {
              console.log("Getting error " + err);
              exit(1);
          }
          createTables(db_name);
      });

      return newdb
  }

  function createTables(newdb) {
      newdb.exec(`
      create table users (
          username text primary key not null,
          pass_hash text not null,
          firstname not null,
          lastname text not null,
          email text not null
      );
          `, ()  => {
              runQueries(newdb);
      });
  }

  function addtoTables(newdb, usr) {
    newdb.exec(`
    insert into users (username, pass_hash, firstname, lastname, email)
        values (${usr[0]}, ${hash_pass(usr[1])}, ${usr[2]}, ${usr[3]}, ${usr[4]}),
        `, ()  => {
          runQueries(newdb);
        });
    return newdb
  }

  function checkForUser(db, usr) {
    db.all(`
    select username, pass_hash from users where username = ${user[0]} AND pass_hash = ${pass_hash(user[1])}
    `, (err, rows) => {
      rows.forEach(row => {
        console.log(row.username + "\t" + row.pass_hash + "\t");
      })
    })
  }


  function runQueries(db) {
      db.all(`select * from users`, "That's all folks", (err, rows) => {
          rows.forEach(row => {
              console.log(row.username + "\t" +row.pass_hash + "\t" +row.firstname + "\t" +row.lastname + "\t" +row.email);
          });
      });
  }
}