var http = require("http");
var urlm = require("url");
var app = http.createServer(function (req, res) {
  // 요청, 응답 모두 객체 형태, 콜백 함수의 파라미터로 객체 표현
  var _url = req.url;
  var queryData = urlm.parse(_url, true).query;
  console.log(queryData);
  console.log(queryData.id);
  console.log(queryData.name);
  var title = queryData.id;
  if (_url == "/") {
    title = "Welcome";
  }
  if (_url == "/favicon.ico") {
    return res.writeHead(404);
  }
  //   if (queryData == 'HTML') {title = 'HTML'}
  //   else if (queryData == 'CSS') {title = 'CSS'}
  //   else if (queryData == 'JS') {title = 'JS'}
  res.writeHead(200);
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
  res.end(template);
});
app.listen(3000);
