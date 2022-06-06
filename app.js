// current user hardcode for example purposes
const currentUser = 4;
/*
    SETUP
*/
// Express
var express = require('express');           // We are using the express library for the web server
var app     = express();                    // We need to instantiate an express object to interact with the server in our code
PORT        = parseInt(process.argv[2]);    // Get port from command line arg
// Handlebars
const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', engine({extname: ".hbs"}));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.
// setup static files
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Database
var db = require('./database/db-connector')

// SHA256 for encoding passwords
var shajs = require('sha.js')

/*
    ROUTES
*/
app.get('/', function(req, res){
  res.render('index');
});

// shows list of all friends
app.get('/friends', function(req, res){
  let query = `select * from (select userID1 as userID, roomID from friends where userID2 = ${currentUser}
  union
  select userID2 as userID, roomID from friends where userID1 = ${currentUser}) friends
  inner join users on users.id = friends.userID;`

  db.pool.query(query, function(error, rows, fields){
    res.render('friends', {data: rows});
  })
});

// shows friends who match search query
app.post('/friends', function(req, res){
  let data = req.body;

  db.pool.query(`select * from (select userID1 as userID, roomID from friends where userID2 = ${currentUser}
    union
    select userID2 as userID, roomID from friends where userID1 = ${currentUser}) friends
    inner join users on users.id = friends.userID and username like ?;`, [`%${data['username']}%`]
    ,function(error, rows, fields){
      res.render('friends', {data: rows});
    })
});

// show all rooms that aren't private messages
app.get('/rooms', function(req, res){
  let query = `select id, name, DATE_FORMAT(creationDate,'%m-%d-%y') as creationDate from rooms where name <> "Private message" order by id asc;`

  db.pool.query(query, function(error, rows, fields){
    res.render('rooms', {data: rows});
  })
});

// search rooms by name
app.post('/rooms', function(req, res){
  let data = req.body;

  db.pool.query(
    `select id, name, DATE_FORMAT(creationDate,'%m-%d-%y') as creationDate from rooms where name like ? and name <> "Private message" order by id asc;`, [`%${data['room_name']}%`],
    function(error, rows, fields){
      res.render('rooms', {data: rows});
  })
});

app.get('/newfriends', function(req, res){
  res.render('newfriends');
});

// search friends either by name, or by specific ID
app.post('/newfriends', function(req, res){
  let data = req.body;

  // if id exists, search by it. Otherwise search by username (which if blank, lists all users to add)
  if(data.hasOwnProperty("id") && data.id.length){
    db.pool.query(
      `select id, username from users where users.id = ? order by username asc;`, [data['id']],
      function(error, rows, fields){
        res.render('newfriends', {data: rows});
    })
  }else{
    db.pool.query(
      `select id, username from users where username like ? order by username asc;`, [`%${data['username']}%`],
      function(error, rows, fields){
        res.render('newfriends', {data: rows});
    })
  }
});

// add a new friend
app.post('/add_friend', function(req, res){
  let data = req.body;

  // create new private message room and create new friend relationship
  db.pool.query(
    `insert into rooms (name, creationDate) values ("Private message", now());
    insert into friends (userID1, userID2, roomID) values (?, ?, LAST_INSERT_ID());`, [Math.min(data['id'], currentUser), Math.max(data['id'], currentUser)],
    function(error, rows, fields){
      res.redirect('/friends');
  })
});

// remove a friend. also removes private message room as well as messages in the room
app.post('/remove_friend', function(req, res){
  let data = req.body;

  db.pool.query(
    `delete from rooms where id = (select roomID from friends where userID1 = ? and userID2 = ?);`, [Math.min(data['userID'], currentUser), Math.max(data['userID'], currentUser)],
    function(error, rows, fields){
      res.redirect('/friends');
  })
});

app.get('/newrooms', function(req, res){
  res.render('newrooms');
});

// show current user information
app.get('/users', function(req, res){
  let query = `select id, username, email from users where id = ${currentUser};`

  db.pool.query(query, function(error, rows, fields){
    res.render('users', {data: rows});
  })
});

// update username
app.post('/change_username', function(req, res){
  let data = req.body;

  db.pool.query(
    `update users set username = ? where id = ?;`, [data['username'], data['userID']],
    function(error, rows, fields){
      res.redirect('/users');
  })
});

// update email
app.post('/change_email', function(req, res){
  let data = req.body;

  db.pool.query(
    `update users set email = ? where id = ?;`, [data['email'], data['userID']],
    function(error, rows, fields){
      res.redirect('/users');
  })
});

app.get('/newaccount', function(req, res){
  res.render('newaccount');
});

// create a new user
app.post('/create_new_user', function(req, res){
  let data = req.body;

  // only create new user if account name, password, and email were entered.
  if(!req.body.account_name.length || !req.body.password.length || !req.body.email.length){
    res.sendStatus(400);
  }else{
    db.pool.query(
      `insert into users (username, email, password) values (?, ?, ?);`,[data['account_name'], data['email'], shajs('sha256').update(data['password']).digest('hex')],
      function(error, rows, fields){
      res.redirect("/users");
    })
  }
});

// create a new room
app.post('/create_new_room', function(req, res){
  let data = req.body;

  // only create room if a name was entered
  if(!req.body.room_name.length){
    res.sendStatus(400);
  }else{
    db.pool.query(
      `insert into rooms (name, creationDate) values (?, now());`,[data['room_name']]
      ,function(error, rows, fields){
      res.redirect("/rooms");
    })
  }
});

// show messages in a specific room
app.get('/room/:id', function(req, res){
  var id = req.params.id;

  db.pool.query(
    `select name from rooms where id = ?;
    select * from(select message, userID, timestamp, roomID from messages where roomID = ?) temp
    inner join users on users.id = temp.userID
    order by timestamp asc;`, [id,id]
    ,function(error, rows, fields){
      res.render("room", {data: rows});

  })
});

// create new message in room
app.post('/room', function(req, res){
  let data = req.body;

  db.pool.query(
    `insert into messages (message, userID, roomID, timestamp) values (?, ?, ?, now()); `, [data['message'], currentUser, data['roomID']]
     ,function(error, rows, fields){
      // we couldn't find a more elegant way to hand the roomID inside the anonymous function besides a new query
      db.pool.query(`select roomID from messages where id = ?;`,[rows.insertId], function(error, rows, fields){
        res.redirect("/room/" + rows[0]['roomID']);
      })
    })
});

app.get('*', function (req, res) {
  res.status(404).render('404', {
    page: req.url
  });
});

/*
LISTENER
*/
app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
  console.log('Express started on http://flip2.engr.oregonstate.edu:' + PORT + ' ; press Ctrl-C to terminate.')
});
