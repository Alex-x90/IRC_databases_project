// Get an instance of mysql we can use in the app
var mysql = require('mysql')
var ini = require('node-ini');

var config = ini.parseSync('../../.my.cnf');

console.log(config);

// Create a 'connection pool' using the provided credentials
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : config.host,
    user            : config.user,
    password        : config.password,
    database        : config.database
})

// Export it for use in our application
module.exports.pool = pool;
