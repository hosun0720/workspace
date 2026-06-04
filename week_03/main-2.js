const express = require("express");
const app = express();

app.set("views", __dirname + "../views");
app.set("view engine", "ejs"); // 뷰 템플릿 엔진은 ejs 사용

app.get("/", (req, res) => {
  var context = { title: "Welcome" };
  res.render("home", context, (err, html) => {
    res.end(html);
  });
});

app.get("/:id", (req, res) => {
  var id = req.params.id;
  var context = { title: id };
  res.render("home", context, (err, html) => {
    res.end(html);
  });
});
app.listen(3000, console.log("web server is waiting your request."));
