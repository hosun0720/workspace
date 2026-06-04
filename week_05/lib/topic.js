const db = require("./db");
var qs = require("querystring");
var sanitizeHtml = require("sanitize-html");

module.exports = {
  home: (req, res) => {
    db.query("SELECT * FROM topic", (error, topics) => {
      if (error) {
        throw error;
      }

      var m = '<a href="/create">create</a>';
      var b = "<h2>Welcome</h2><p>Node.js Start Page</p>";

      // 추가: 테이블이 비어 있을 때 안내문 출력
      if (topics.length === 0) {
        b =
          "<h2>Welcome</h2><p>등록된 글이 없습니다. create를 눌러 새 글을 작성하세요.</p>";
      }

      var context = { list: topics, title: "WEB home", menu: m, body: b };

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

      db.query(`select * from topic where id = ${id}`, (error2, topic) => {
        if (error2) {
          throw error2;
        }

        // 추가: 해당 id의 글이 없을 때
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
        var b = `<h2>${topic[0].title}</h2><p>${topic[0].descript}</p>`;

        var context = { list: topics, title: "WEB page", menu: m, body: b };

        res.app.render("home", context, (err, html) => {
          res.end(html);
        });
      });
    });
  },

  create: (req, res) => {
    db.query("select * from topic", (error, topics) => {
      if (error) {
        throw error;
      }
      var b = `<form action="/create_process" method="post">
                        <p><input type="text" name="title" placeholder="title"></p>
                        <p><textarea name="description" placeholder="description"></textarea></p>
                        <p><input type="submit"></p>
                    </form>`;
      var context = {
        list: topics,
        title: "WEB create",
        menu: '<a href="/create">create</a>',
        body: b,
      };

      res.render("home", context, (err, html) => {
        res.end(html);
      }); //render 종료
    }); //첫번째 query 종료
  },

  create_process: (req, res) => {
    var body = "";
    req.on("data", (data) => {
      body = body + data;
    });
    req.on("end", () => {
      var post = qs.parse(body);
      sanitizedTitle = sanitizeHtml(post.title);
      sanitizeDescription = sanitizeHtml(post.description);
      db.query(
        `
                INSERT INTO topic (title, descript, created)
                    VALUES(?, ?, NOW())`,
        [sanitizedTitle, sanitizeDescription],
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
    // 수정 화면을 보여주는 역할
    var id = req.params.pageId;
    db.query("select * from topic", (error, topics) => {
      if (error) {
        throw error;
      }
      db.query(`select * from topic where id = ${id}`, (error2, topic) => {
        if (error2) {
          throw error2;
        }

        // 추가: 수정할 글이 없으면 홈으로 이동
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
                            <p><input type="submit"></p>
                        </form>`;

        var context = { list: topics, title: "WEB update", menu: m, body: b };

        res.render("home", context, (err, html) => {
          res.end(html);
        }); //render 종료
      }); //두번째 query 종료
    }); //첫번째 query 종료
  },

  update_process: (req, res) => {
    // 수정된 내용을 실제 DB에 반영하는 역할
    var body = "";
    req.on("data", (data) => {
      body += data;
    });

    req.on("end", () => {
      var post = qs.parse(body);
      sanitizedTitle = sanitizeHtml(post.title);
      sanitizeDescription = sanitizeHtml(post.description);
      db.query(
        `update topic set title = ?, descript = ? where id = ?`,
        [sanitizedTitle, sanitizeDescription, post.id],
        (error, result) => {
          if (error) {
            throw error;
          }
          res.writeHead(302, { Location: `/page/${post.id}` }); // redirection
          res.end();
        },
      ); //첫번째 query 종료
    });
  },

  delete_process: (req, res) => {
    var id = req.params.pageId;

    db.query(`delete from topic where id = ?`, [id], (error, result) => {
      if (error) {
        throw error;
      }
      res.writeHead(302, { Location: `/` }); // redirection
      res.end();
    }); //첫번째 query 종료
  },
};
