const express = require("express");
var session = require("express-session");
var MySqlStore = require("express-mysql-session")(session);
var db = require("./lib/db");

var options = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "webdb2026",
};
var sessionStore = new MySqlStore(options);
const app = express();
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  }),
);
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use((req, res, next) => {
  db.query("SELECT * FROM code", (err1, codeResults) => {
    if (err1) {
      req.app.locals.categoryList = [];
    } else {
      req.app.locals.categoryList = codeResults;
    }

    db.query("SELECT * FROM boardtype", (err2, boardResults) => {
      if (err2) {
        req.app.locals.boardtypes = [];
      } else {
        req.app.locals.boardtypes = boardResults;
      }

      next();
    });
  });
});

var rootRouter = require("./router/rootRouter");
var authRouter = require("./router/authRouter");
var codeRouter = require("./router/codeRouter");
var personRouter = require("./router/personRouter");
var productRouter = require("./router/productRouter");
var boardRouter = require("./router/boardRouter");
var purchaseRouter = require("./router/purchaseRouter");
var tableRouter = require("./router/tableRouter");
var analRouter = require("./router/analRouter");

app.use("/", rootRouter);
app.use("/auth", authRouter);
app.use("/code", codeRouter);
app.use("/person", personRouter);
app.use("/product", productRouter);
app.use("/board", boardRouter);
app.use("/purchase", purchaseRouter);
app.use("/table", tableRouter);
app.use("/anal", analRouter);

app.get("/favicon.ico", (req, res) => res.writeHead(404));
app.listen(3000, () => console.log("Example app listening on port 3000"));
