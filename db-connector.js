// Get an instance of mysql we can use in the app
var mysql = require('mysql')
var ini = require('node-ini');

var config = ini.parseSync('../../.my.cnf');

// Create a 'connection pool' using the provided credentials
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : config.client.host,
    user            : config.client.user,
    password        : config.client.password,
    database        : config.client.database
})

// Export it for use in our application
module.exports.pool = pool;
