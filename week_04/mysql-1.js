var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "webdb2026",
});

connection.connect();
connection.query("select * from topic;", (error, results, fields) => {
  console.log(results[1].descript);
  console.log(fields);
});

connection.end();
