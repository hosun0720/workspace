const express = require("express");
var session = require("express-session");
var MySqlStore = require("express-mysql-session")(session);

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

var rootRouter = require("./router/rootRouter");
var authRouter = require("./router/authRouter");
var codeRouter = require("./router/codeRouter");
var personRouter = require("./router/personRouter");
var productRouter = require("./router/productRouter");

app.use(express.static("public"));

app.use("/", rootRouter);
app.use("/auth", authRouter);
app.use("/code", codeRouter);
app.use("/person", personRouter);
app.use("/product", productRouter);

app.get("/favicon.ico", (req, res) => res.writeHead(404));
app.listen(3000, () => console.log("Example app listening on port 3000"));
