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
    this.createGroupsTable();
    this.createContactsTable();
    this.createGtoCTable();
  }

  addGtoC(gandc) {
    this.db.all(`
    INSERT INTO groups_to_contacts (g_id, c_id) VALUES (@gid, @cid);
    `, {'@gid': gandc['gid'], '@cid': gandc['cid']}, (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log('g to c added')
      }
    })
  }

  createGtoCTable() {
    this.db.exec(`
    CREATE TABLE IF NOT EXISTS groups_to_contacts (
      g_id text not null,
      c_id text primary key,
      FOREIGN KEY(g_id) REFERENCES groups(g_id),
      FOREIGN KEY(c_id) REFERENCES contacts(id)
    )
    `, () => {
      console.log('g_to_c table created')
    })
  }

  addContact(contact) {
    this.db.all(`
    INSERT INTO contacts (f_name, l_name, email, id, u_email) VALUES (@fname, @lname, @email, @id, @uemail);
    `, {'@fname': contact['fname'], '@lname': contact['lname'], '@email': contact['email'], '@id': contact['id'], '@uemail': contact['uemail']}, (err) => {
      if (err) {
        console.log('CONTACT ERROR >>>', err)
      } else {
        console.log('Contact Added');
      }
    })
  }

  createContactID() {
    return new Promise(send => {
      const id = Math.floor(Math.random() * (99999 - 10000)) + 10000;
      console.log('ID:', id);

      this.db.all(`
        SELECT * FROM contacts WHERE id=@id
      `, {'@id': id}, (err, rows) => {
        if (err) {
          console.log('Error: ', err)
          send(null)
        } else if (rows.length == 0) {
          send(id);
        } else if (rows.length >= 1) {
          console.log('ID TAKEN');
          send(this.createGroupID());
        } else {
          console.log('Hmmm... something went wrong');
          send(null);
        }
      })
    })
  }

  createContactsTable() {
    this.db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      f_name text not null,
      l_name text not null,
      email text not null,
      id text primary key not null,
      u_email not null,
      FOREIGN KEY(u_email) REFERENCES Users(email_address)
    )
    `, () => {
      console.log('contacts table created.')
    })
  }

  createGroupID() {
    return new Promise(send => {
      const id = Math.floor(Math.random() * (99999 - 10000)) + 10000;
      console.log('ID:', id);

      this.db.all(`
        SELECT * FROM groups WHERE g_id=@id
      `, {'@id': id}, (err, rows) => {
        if (err) {
          console.log('Error: ', err)
          send(null)
        } else if (rows.length == 0) {
          send(id);
        } else if (rows.length >= 1) {
          console.log('ID TAKEN');
          send(this.createGroupID());
        } else {
          console.log('Hmmm... something went wrong');
          send(null);
        }
      })
    })
  }

  createGroupsTable() {
    this.db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      g_id text primary key not null,
      g_name text not null,
      u_email text not null,
      FOREIGN KEY(u_email) REFERENCES Users(email_address)
    )
    `, () => {
      console.log('groups table created.')
    })
  }

  addGroup(grp) {
    this.db.all(`
    INSERT INTO groups (g_id, g_name, u_email) VALUES (@id, @name, @email);
    `, {'@id': grp['id'], '@name': grp['name'], '@email': grp['email']}, (err) => {
      if (err) {
        console.log('GROUP ERROR >>>',err)
        console.log('Group:',grp)
      } else {
        console.log('Group Added');
      }
    })
  }

  seeGroups(email) {
    return new Promise(send => {
      this.db.all(`
      SELECT * FROM groups WHERE u_email=@email;
      `, {'@email': email}, (err, rows) => {
        if (err) {
          console.log(err)
          console.log('Email:', email)
          send(null)
        } else if (rows.length == 0) {
          console.log('Email:', email)
          console.log('No Groups Found')
          send(null)
        } else if (rows.length >= 1) {
          rows.forEach(row => {
            console.log(row)
          });
          send(rows)
        } else {
          console.log('Hmm... something went wrong');
          send(null);
        }
      })
    })
  }

  createLoggedIn() {
    this.db.exec(`
    CREATE TABLE IF NOT EXISTS logged_in (
      hash text primary key not null,
      email text not null,
      FOREIGN KEY(email) REFERENCES Users(email_address)
    );
    `, () => {
      console.log('logged in table created')
    });
  }

  logIn(hash, email) {
    this.db.all(`INSERT INTO logged_in (hash, email) VALUES (@hash, @email);`
      ,{'@hash': hash, '@email': email}, (err) => {
        if(err) {
          console.log(err)
        } else {
          console.log('Logged in: ', hash)
        }
      });
  }

  logOut(hash) {
    return new Promise(send => {
      this.db.all(`DELETE FROM logged_in WHERE hash=@hash`, 
      {'@hash': hash}, (err) => {
        if (err){
          console.log('Error:', err)
          send(false)
        } else {
          console.log('Logged Out')
          send(true)
        }
      })
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

  getCurrentUserEmail(hash){
    return new Promise(send => {
      this.db.all(`
      SELECT email FROM logged_in where hash=@hash;
      `, {'@hash': hash}, (err, rows) => {
        if (err) {
          console.log(err)
          send(null);
        } else if (rows.length == 0) {
          console.log('No User Found');
          send(null)
        } else if (rows.length == 1) {
          console.log('User Found');
          console.log(rows[0].email);
          send(rows[0].email);
        } else {
          console.log('Hmmm... something went wrong. Multiple Users found');
          send(null);
        }
      })
    })
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



module.exports.Users = Users;
module.exports.check_pass = check_pass;
module.exports.hash_pass = hash_pass;
module.exports.check_email = check_email;
module.exports.pass_match = pass_match;