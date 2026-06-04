const db = require("./db");
var qs = require("querystring");

module.exports = {
  home: (req, res) => {
    db.query("SELECT * FROM appslist", (error, appslists) => {
      if (error) {
        throw error;
      }
      var m = '<a href="/create"><button>create</button></a>';
      var b = "";
      if (appslists.length === 0) {
        b = "<p>등록된 앱이 없습니다.</p>";
      }
      var context = { list: appslists, menu: m, body: b };
      req.app.render("home", context, (err, html) => {
        res.end(html);
      });
    });
  },

  create: (req, res) => {
    db.query("select * from appslist", (error, appslists) => {
      if (error) {
        throw error;
      }
      var m = "";
      var b = `<form action="/create_process" method="post">
                        <p><input type="text" name="name" placeholder="name"></p>
                        <p><input type="text" name="class" placeholder="class"></p>
                        <p><input type="date" name="installdate"></p>
                        <p><textarea name="description" placeholder="description"></textarea></p>
                        <p><input type="submit" value="제출"></p>
                    </form>`;
      var context = {
        list: appslists,
        menu: m,
        body: b,
      };
      res.render("home", context, (err, html) => {
        res.end(html);
      });
    });
  },

  create_process: (req, res) => {
    var body = "";
    req.on("data", (data) => {
      body = body + data;
    });
    req.on("end", () => {
      var post = qs.parse(body);
      db.query(
        `INSERT INTO appslist (name, class, installdate, descript) VALUES(?, ?, ?, ?)`,
        [post.name, post.class, post.installdate, post.description],
        (error, result) => {
          if (error) {
            throw error;
          }
          res.writeHead(302, { Location: `/` });
          res.end();
        },
      );
    });
  },

  update: (req, res) => {
    var id = req.params.pageId;
    db.query("select * from appslist", (error, appslists) => {
      if (error) {
        throw error;
      }
      db.query(
        `select id, name, class, DATE_FORMAT(installdate, '%Y-%m-%d') AS installdate, descript FROM appslist WHERE id = ${id}`,
        (error2, appslist) => {
          if (error2) {
            throw error2;
          }
          if (appslist.length === 0) {
            res.writeHead(302, { Location: `/` });
            res.end();
            return;
          }
          var m = "";
          var b = `<form action="/update_process" method="post">
                            <input type="hidden" name="id" value="${appslist[0].id}">
                            <p><input type="text" name="name" placeholder="name" value="${appslist[0].name}"></p>
                            <p><input type="text" name="class" placeholder="class" value="${appslist[0].class}"></p>
                            <p><input type="date" name="installdate" value="${appslist[0].installdate}"></p>
                            <p><textarea name="description" placeholder="description">${appslist[0].descript}</textarea></p>
                            <p><input type="submit" value="제출"></p>
                        </form>`;
          var context = { list: appslists, menu: m, body: b };
          res.render("home", context, (err, html) => {
            res.end(html);
          });
        },
      );
    });
  },

  update_process: (req, res) => {
    var body = "";
    req.on("data", (data) => {
      body += data;
    });
    req.on("end", () => {
      var post = qs.parse(body);
      db.query(
        `update appslist set name = ?, class = ?, installdate = ?, descript = ? where id = ?`,
        [post.name, post.class, post.installdate, post.description, post.id],
        (error, result) => {
          if (error) {
            throw error;
          }
          res.writeHead(302, { Location: `/` });
          res.end();
        },
      );
    });
  },

  delete_process: (req, res) => {
    var id = req.params.pageId;
    db.query(`delete from appslist where id = ?`, [id], (error, result) => {
      if (error) {
        throw error;
      }
      res.writeHead(302, { Location: `/` });
      res.end();
    });
  },
};
