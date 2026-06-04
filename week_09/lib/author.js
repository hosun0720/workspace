const db = require("./db");
var qs = require("querystring");
var sanitizedHtml = require("sanitize-html");
var cookie = require("cookie");

function authIsOwner(req, res) {
  if (req.session && req.session.is_logined) {
    return true;
  } else {
    return false;
  }
}

function authStatusUI(req, res) {
  var login = '<a href="/login">login</a>';
  if (authIsOwner(req, res)) {
    login = `<a href="/logout_process">logout</a>`;
  }
  return login;
}

module.exports = {
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
        if (error2) {
          throw error2;
        }
        var i = 0;
        var tag = `<table border="1" style "border-collapse: collapse;">`;
        // while (i < authors.length) {
        //   tag += `<option value="${authors[i].id}">${authors[i].name}</option>`;
        //   i++;
        // }
        for (i = 0; i < authors.length; i++) {
          tag += `<tr>
            <td>${authors[i].name}</td><td>${authors[i].profile}</td>
            <td><a href="/author/update/${authors[i].id}">update</a></td>
            <td><a href="/author/delete/${authors[i].id}" onClick = 'if(confirm("정말로 삭제하시겠습니까?")==false){return false}'>delete</a></td>
            </tr>`;
        }
        tag += "</table>";
        var b = `<form action="/author/create_process" method="post">
                        <p><input type="text" name="name" placeholder="name"></p>
                        <p><input type="text" name="profile" placeholder="profile"></p>
                        <p><input type="submit" value ="저자생성"></p>
                    </form>`;
        var context = {
          list: topics,
          title: "WEB author create",
          login: authStatusUI(req, res),
          menu: tag,
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
    var post = req.body;
    sanitizedName = sanitizedHtml(post.name);
    sanitizedProfile = sanitizedHtml(post.profile);
    sanitizedAuthor = sanitizedHtml(post.author);
    db.query(
      `
                INSERT INTO author (name, profile)
                    VALUES(?, ?)`,
      [sanitizedName, sanitizedProfile],
      (error, result) => {
        if (error) {
          throw error;
        }
        res.redirect(`/author`);
        res.end();
      },
    );
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
      db.query(`select * from author where id = ${id}`, (error2, author) => {
        if (error2) {
          throw error2;
        }
        db.query(`select * from author`, (error3, authors) => {
          if (error3) {
            throw error3;
          }
          if (authors.length === 0) {
            res.redirect("/author");
            return;
          }

          var i = 0;
          var tag = `<table border="1" style "border-collapse: collapse;">`;

          for (i = 0; i < authors.length; i++) {
            tag += `<tr>
                <td>${authors[i].name}</td>
                <td>${authors[i].profile}</td>
                <td><a href="/author/update/${authors[i].id}">update</a></td>
                <td><a href="/author/delete/${authors[i].id}" onClick = 'if(confirm("정말로 삭제하시겠습니까?")==false){return false}'>delete</a></td>
                </tr>`;
          }
          tag += "</table>";
          var b = `<form action="/author/update_process" method="post">
                        <input type="hidden" name="id" value="${author[0].id}">
                        <p><input type="text" name="name" placeholder="name" value="${author[0].name}"></p>
                        <p><input type="text" name="profile" placeholder="profile" value="${author[0].profile}"></p>
                        <p><input type="submit" value ="저자수정"></p>
                    </form>`;
          var context = {
            list: topics,
            title: "WEB author update",
            login: authStatusUI(req, res),
            menu: tag,
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
    var post = req.body;
    sanitizedName = sanitizedHtml(post.name);
    sanitizedProfile = sanitizedHtml(post.profile);
    sanitizedAuthor = sanitizedHtml(post.author);
    db.query(
      `update author set name = ?, profile = ? where id = ?`,
      [sanitizedName, sanitizedProfile, post.id],
      (error, result) => {
        if (error) {
          throw error;
        }
        res.writeHead(302, { Location: `/author` });
        res.end();
      },
    );
  },

  delete_process: (req, res) => {
    if (authIsOwner(req, res) === false) {
      res.end(
        `<script type='text/javascript'>alert("Login required ~~~"); setTimeout("location.href='http://localhost:3000/'",1000);</script>`,
      );
      return;
    }
    var id = req.params.pageId;
    db.query(`delete from author where id = ?`, [id], (error, result) => {
      if (error) {
        throw error;
      }
      res.writeHead(302, { Location: `/author` });
      res.end();
    });
  },
};
