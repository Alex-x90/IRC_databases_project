/*
    SETUP
*/
// Express
var express = require('express');   // We are using the express library for the web server
var app     = express();            // We need to instantiate an express object to interact with the server in our code
PORT        = 65423;                 // Set a port number at the top so it's easy to change in the future
// Handlebars
const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', engine({extname: ".hbs"}));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.

// Database
var db = require('./database/db-connector')

/*
    ROUTES
*/
app.get('/', function(req, res){
  res.render('index');                    // Note the call to render() and not send(). Using render() ensures the templating engine
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
  let query = "select id, name, DATE_FORMAT(creationDate,'%m-%d-%y') as date from rooms order by id asc;"

  db.pool.query(query, function(error, rows, fields){
    res.render('rooms', {data: rows});
  })
});

/*
LISTENER
*/
app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
  console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});
