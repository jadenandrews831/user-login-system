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

  function createDatabase(newdb) {
      var newdb = new sqlite3.Database(db_name, (err) => {
          if (err) {
              console.log("Getting error " + err);
              exit(1);
          }
          createTables(newdb);
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


  function runQueries(db) {
      db.all(`select * from users`, "That's all folks", (err, rows) => {
          rows.forEach(row => {
              console.log(row.username + "\t" +row.pass_hash + "\t" +row.firstname + "\t" +row.lastname + "\t" +row.email);
          });
      });
  }
}

var server = http.createServer(function (req, res) {

  if (req.url == '/')
  {
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.createReadStream("./src/signin.html", "UTF-8").pipe(res);
  }

  if (req.url == './src/signup.html')
  {
    if (req.method == 'POST')
    {
      var body = "";
      req.on("data", function (chunk) {
          body += chunk;
      });

      req.on("end", function(){
        res.writeHead(200, { "Content-Type": "text/html" });
        console.log(body) //FIXME: add body to the database here
        fs.createReadStream("./src/signin.html", "UTF-8").pipe(res);
      });
    }

    if (req.method == 'GET')
    {
      res.writeHead(200, { "Content-Type": "text/html" });
      fs.createReadStream("./src/signup.html", "UTF-8").pipe(res);
    }
  }


  if (req.url == './src/signin.html') {
      if (req.method == "GET")
      {
        res.writeHead(200, { "Content-Type": "text/html" });
        fs.createReadStream("./src/signin.html", "UTF-8").pipe(res);
      }
      if (req.method == "POST")
      {
        var body = "";
        req.on("data", function (chunk) {
            body += chunk;
        });

        req.on("end", function(){
          res.writeHead(200, { "Content-Type": "text/html" });
          console.log(body) //FIXME: check database for username and match given password hash with stored pass_hash
          fs.createReadStream("./src/index.html", "UTF-8").pipe(res);
        });
      }
  } 


}).listen(3000);

