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

app.get('/friends', function(req, res){
  let query = `select userID1 as userID, roomID from friends where userID2 = 4
  union
  select userID2 as userID, roomID from friends where userID1 = 4;`

  db.pool.query(query, function(error, rows, fields){
    res.render('friends', {data: rows});
  })
});


app.get('/rooms', function(req, res){
  let query = "select id, name, DATE_FORMAT(creationDate,'%m-%d-%y') as creationDate from rooms order by id asc;"

  db.pool.query(query, function(error, rows, fields){
    res.render('rooms', {data: rows});
  })
});


app.get('/newfriends', function(req, res){
  res.render('newfriends');
});

app.get('/newrooms', function(req, res){
  res.render('newrooms');
});

app.get('/users', function(req, res){
  let query = "select id, username, email from users where id = 4;"

  db.pool.query(query, function(error, rows, fields){
    res.render('users', {data: rows});
  })
});

app.get('/newaccount', function(req, res){
  res.render('newaccount');
});

app.post('/create_new_user', function(req, res){
  let data = req.body;

  if(!req.body.account_name.length || !req.body.password.length || !req.body.email.length){
    res.sendStatus(400);
  }else{
    db.pool.query(
      `insert into users (username, email, password) values (?, ?, ?);`,[data['account_name'], data['email'], shajs('sha256').update(data['password']).digest('hex')]
      ,function(error, rows, fields){
      res.redirect("/users");
    })
  }
});

app.post('/create_new_room', function(req, res){
  let data = req.body;

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

app.get('*', function (req, res) {
  res.status(404).render('404', {
    page: req.url
  });
});

/*
LISTENER
*/
app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
  console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});
