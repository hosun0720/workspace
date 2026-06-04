const express = require("express");
const app = express();
var urlm = require("url");

app.get("/", (req, res) => {
  //첫 파라미터 url 다음 파라미터 콜백함수
  var _url = req.url;
  title = "Welcome";
  var queryData = urlm.parse(_url, true).query;
  console.log(queryData.id);
  var title = queryData.id;
  var template = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <title>WEB1 ~ ${title}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        </head>
        <body>
            <h1><a href="/">WEB</a></h1>
            <ol>
                <li><a href="/?id=HTML">HTML</a>
                <li><a href="/?id=CSS">CSS</a>
                <li><a href="/?id=JS">JS</a>
            </ol>
            <h2>${title}</h2>
            <p>comment</p>
        </body>
    </html>
    `;
  res.send(template);
});
app.get("/favicon.ico", (req, res) => {
  res.writeHead(404);
});
app.listen(3000, () => console.log("Web Server is waiting your request"));

// 세멘틱 해보기
