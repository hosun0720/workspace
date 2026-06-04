const db = require("./db");
var qs = require("querystring");
var sanitizedHtml = require("sanitize-html");
var cookie = require("cookie");

function authIsOwner(req, res) {
  var isOwner = false;
  var cookies = {};
  if (req.headers.cookie) {
    cookies = cookie.parse(req.headers.cookie);
  }
  if (
    cookies.email === "db@korea.com" &&
    cookies.password === "123456" &&
    cookies.nickname === "webdb"
  ) {
    isOwner = true;
  }
  return isOwner;
}

function authStatusUI(req, res) {
  var login = '<a href="/login">login</a>';
  if (authIsOwner(req, res)) {
    login = `<a href="/logout_process">logout</a>`;
  }
  return login;
}

module.exports = {
  home: (req, res) => {
    db.query("SELECT * FROM topic", (error, topics) => {
      if (error) {
        throw error;
      }

      var login = "";
      var m = '<a href="/create">create</a>';
      var b = "<h2>Welcome</h2><p>Node.js Start Page</p>";

      if (topics.length === 0) {
        b =
          "<h2>Welcome</h2><p>등록된 글이 없습니다. create를 눌러 새 글을 작성하세요.</p>";
      }

      var context = {
        list: topics,
        login: authStatusUI(req, res),
        title: "WEB home",
        menu: m,
        body: b,
      };

      req.app.render("home", context, (err, html) => {
        res.end(html);
      });
    });
  },

  page: (req, res) => {
    var id = req.params.pageId;
    db.query("SELECT * FROM topic", (error, topics) => {
      if (error) {
        throw error;
      }

      db.query(
        `select * from topic left join author on topic.author_id = author.id where topic.id = ${id}`,
        (error2, topic) => {
          //alias 쓰는게 더 안전
          if (error2) {
            throw error2;
          }

          if (topic.length === 0) {
            var m = '<a href="/create">create</a>';
            var b = "<h2>자료 없음</h2><p>해당 글이 존재하지 않습니다.</p>";

            var context = { list: topics, menu: m, body: b };

            res.app.render("home", context, (err, html) => {
              res.end(html);
            });
            return;
          }

          var m = `<a href="/create">create</a>&nbsp;&nbsp;<a href="/update/${id}">update</a>&nbsp;&nbsp;<a href="/delete/${id}" onclick='if(confirm("정말로 삭제하시겠습니까?")==false){return false}'>delete</a>`;
          var b = `<h2>${topic[0].title}</h2><p>${topic[0].descript}</p><p><b>by ${topic[0].name}</b></p>`;

          var context = {
            list: topics,
            login: authStatusUI(req, res),
            title: "WEB page",
            menu: m,
            body: b,
          };

          res.app.render("home", context, (err, html) => {
            res.end(html);
          });
        },
      );
    });
  },

  create: (req, res) => {
    if (authIsOwner(req, res) === false) {
      res.end(
        `<script type='text/javascript'>alert("Login required ~~~"); setTimeout("location.href='http://localhost:3000/'",1000);</script>`,
      );
      return;
    }
    db.query("select * from topic", (error, topics) => {
      if (error) {
        throw error;
      }
      db.query(`select * from author`, (error2, authors) => {
        var i = 0;
        var tag = "";
        while (i < authors.length) {
          tag += `<option value="${authors[i].id}">${authors[i].name}</option>`;
          i++;
        }
        var b = `<form action="/create_process" method="post">
                        <p><input type="text" name="title" placeholder="title"></p>
                        <p><textarea name="description" placeholder="description"></textarea></p>
                        <p><select name="author">${tag}</option></select></p>
                        <p><input type="submit"></p>
                    </form>`;
        //<option value=“1”>egoing</option><option value=“2”>duru
        var context = {
          list: topics,
          title: "WEB create",
          login: authStatusUI(req, res),
          menu: '<a href="/create">create</a>',
          body: b,
        };

        res.render("home", context, (err, html) => {
          res.end(html);
        });
      });
    });
  },

  create_process: (req, res) => {
    if (authIsOwner(req, res) === false) {
      res.end(
        `<script type='text/javascript'>alert("Login required ~~~"); setTimeout("location.href='http://localhost:3000/'",1000);</script>`,
      );
      return;
    }
    var body = "";
    req.on("data", (data) => {
      body = body + data;
    });
    req.on("end", () => {
      var post = qs.parse(body);
      sanitizedTitle = sanitizedHtml(post.title);
      sanitizedDescription = sanitizedHtml(post.description);
      sanitizedAuthor = sanitizedHtml(post.author);
      db.query(
        `
                INSERT INTO topic (title, descript, created, author_id)
                    VALUES(?, ?, NOW(), ?)`,
        [sanitizedTitle, sanitizedDescription, sanitizedAuthor],
        (error, result) => {
          if (error) {
            throw error;
          }
          res.writeHead(302, { Location: `/page/${result.insertId}` });
          res.end();
        },
      );
    });
  },

  update: (req, res) => {
    if (authIsOwner(req, res) === false) {
      res.end(
        `<script type='text/javascript'>alert("Login required ~~~"); setTimeout("location.href='http://localhost:3000/'",1000);</script>`,
      );
      return;
    }
    var id = req.params.pageId;
    db.query("select * from topic", (error, topics) => {
      if (error) {
        throw error;
      }
      db.query(`select * from topic where id = ${id}`, (error2, topic) => {
        if (error2) {
          throw error2;
        }
        db.query(`select * from author`, (error3, authors) => {
          if (error3) {
            throw error3;
          }
          var i = 0;
          var tag = "";
          while (i < authors.length) {
            var selected = "";
            if (authors[i].id === topic[0].author_id) {
              selected == "selected";
            }
            tag += `<option value="${authors[i].id}"${selected}>${authors[i].name}</option>`;
            i++;
          }
          if (topic.length === 0) {
            res.writeHead(302, { Location: `/` });
            res.end();
            return;
          }

          var m = `<a href="/create">create</a>&nbsp;&nbsp;
                          <a href="/update/${topic[0].id}">update</a>&nbsp;&nbsp;<a href="#">delete</a>`;
          var b = `<form action="/update_process" method="post">
                              <input type="hidden" name="id" value="${topic[0].id}">
                              <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                              <p><textarea name="description" placeholder="description">${topic[0].descript}</textarea></p>
                              <p><select name="author">${tag}</option></select></p>
                              <p><input type="submit"></p>
                          </form>`;

          var context = {
            list: topics,
            title: "WEB update",
            login: authStatusUI(req, res),
            menu: m,
            body: b,
          };
          res.render("home", context, (err, html) => {
            res.end(html);
          });
        });
      });
    });
  },

  update_process: (req, res) => {
    if (authIsOwner(req, res) === false) {
      res.end(
        `<script type='text/javascript'>alert("Login required ~~~"); setTimeout("location.href='http://localhost:3000/'",1000);</script>`,
      );
      return;
    }
    var body = "";
    req.on("data", (data) => {
      body += data;
    });

    req.on("end", () => {
      var post = qs.parse(body);
      sanitizedTitle = sanitizedHtml(post.title);
      sanitizedDescription = sanitizedHtml(post.description);
      sanitizedAuthor = sanitizedHtml(post.author);
      db.query(
        `update topic set title = ?, descript = ?, author_id = ? where id = ?`,
        [sanitizedTitle, sanitizedDescription, sanitizedAuthor, post.id],
        (error, result) => {
          if (error) {
            throw error;
          }
          res.writeHead(302, { Location: `/page/${post.id}` });
          res.end();
        },
      );
    });
  },

  delete_process: (req, res) => {
    if (authIsOwner(req, res) === false) {
      res.end(
        `<script type='text/javascript'>alert("Login required ~~~"); setTimeout("location.href='http://localhost:3000/'",1000);</script>`,
      );
      return;
    }

    var id = req.params.pageId;

    db.query(`delete from topic where id = ?`, [id], (error, result) => {
      if (error) {
        throw error;
      }
      res.writeHead(302, { Location: `/` });
      res.end();
    });
  },

  login: (req, res) => {
    db.query("SELECT * FROM topic", (error, topics) => {
      if (error) {
        throw error;
      }

      var login = '<a href="/login">login</a>';
      var m = '<a href="/create">create</a>';
      var b = `<form action="/login_process" method="post">
                                <p><input type="text" name="email" placeholder="email"></p>
                                <p><input type="text" name="password" placeholder="password"></p>
                                <p><input type="submit"></p>
                            </form>`;

      var context = {
        list: topics,
        login: login,
        title: "Login ID/PW 생성",
        menu: m,
        body: b,
      };

      res.app.render("home", context, (err, html) => {
        res.end(html);
      });
    });
  },

  login_process: (req, res) => {
    var body = "";
    req.on("data", (data) => {
      body = body + data;
    });
    req.on("end", () => {
      var post = qs.parse(body);
      if (post.email === "db@korea.com" && post.password === "123456") {
        res.writeHead(302, {
          "Set-Cookie": [
            `email=${post.email}`,
            `password=${post.password}`,
            `nickname=webdb`,
          ],
          Location: "/",
        });
        res.end();
      } else {
        res.end("Who are you?");
      }
    });
  },

  logout_process: (req, res) => {
    res.writeHead(302, {
      "Set-Cookie": [
        `email=; Max-Age=0`,
        `password=; Max-Age=0`,
        `nickname=; Max-Age=0`,
      ],
      Location: "/",
    });
    res.end();
  },
};
