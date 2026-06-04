// lib/table.js
var db = require("./db");

const pkMapping = {
  cart: ["cart_id"],
  purchase: ["purchase_id"],
  product: ["prod_id"],
  person: ["loginid"],
  board: ["bid"],
  boardtype: ["type_id"],
  code: ["main_id", "sub_id", "start"],
};

function checkMNG(req, res) {
  if (!req.session || !req.session.is_logined || req.session.cls !== "MNG") {
    res.send(
      `<script>alert("관리자 권한이 없습니다."); location.href = "/";</script>`,
    );
    return null;
  }
  return req.session;
}

module.exports = {
  view: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `
      SELECT TABLE_NAME, TABLE_COMMENT 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'webdb2026';
    `;

    db.query(sql1 + sql2, (error, results) => {
      if (error) throw error;
      res.render("mainFrame", {
        who: loginInfo.name,
        login: true,
        cls: loginInfo.cls,
        body: "tableManage.ejs",
        boardtypes: results[0],
        results: results[1],
      });
    });
  },

  tableview: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var tableName = req.params.tableName;

    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `
      SELECT COLUMN_NAME, COLUMN_COMMENT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'webdb2026' AND TABLE_NAME = ?;
    `;
    var sql3 = `SELECT * FROM ??; `;

    db.query(sql1 + sql2 + sql3, [tableName, tableName], (error, results) => {
      if (error) throw error;

      var pKeys = pkMapping[tableName] || [];

      res.render("mainFrame", {
        who: loginInfo.name,
        login: true,
        cls: loginInfo.cls,
        body: "tableView.ejs",
        boardtypes: results[0],
        tableName: tableName,
        columns: results[1],
        rows: results[2],
        pKeys: pKeys,
      });
    });
  },

  create: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var tableName = req.query.tableName;
    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `
      SELECT COLUMN_NAME, COLUMN_COMMENT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'webdb2026' AND TABLE_NAME = ?;
    `;

    db.query(sql1 + sql2, [tableName], (error, results) => {
      if (error) throw error;
      res.render("mainFrame", {
        who: loginInfo.name,
        login: true,
        cls: loginInfo.cls,
        body: "tableC.ejs",
        boardtypes: results[0],
        tableName: tableName,
        columns: results[1],
      });
    });
  },

  create_process: (req, res) => {
    if (!checkMNG(req, res)) return;

    var post = req.body;
    var tableName = post.TABLE_NAME;

    var insertData = { ...post };
    delete insertData.TABLE_NAME;

    db.query(
      `INSERT INTO ?? SET ?`,
      [tableName, insertData],
      (error, result) => {
        if (error) throw error;
        res.redirect(`/table/view/${tableName}`);
      },
    );
  },

  update: (req, res) => {
    var loginInfo = checkMNG(req, res);
    if (!loginInfo) return;

    var tableName = req.params.tableName;
    var id = req.params.id;
    var pKeys = pkMapping[tableName] || [];
    var idValues = id.split("|");

    var sql1 = `SELECT * FROM boardtype; `;
    var sql2 = `
      SELECT COLUMN_NAME, COLUMN_COMMENT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'webdb2026' AND TABLE_NAME = ?;
    `;
    var whereClause = pKeys.map((key) => `\`${key}\` = ?`).join(" AND ");
    var sql3 = `SELECT * FROM ?? WHERE ${whereClause}; `;

    db.query(
      sql1 + sql2 + sql3,
      [tableName, tableName, ...idValues],
      (error, results) => {
        if (error) throw error;
        res.render("mainFrame", {
          who: loginInfo.name,
          login: true,
          cls: loginInfo.cls,
          body: "tableU.ejs",
          boardtypes: results[0],
          tableName: tableName,
          columns: results[1],
          row: results[2][0],
          targetId: id,
        });
      },
    );
  },

  update_process: (req, res) => {
    if (!checkMNG(req, res)) return;

    var post = req.body;
    var tableName = post.TABLE_NAME;
    var id = post.TARGET_ID;
    var pKeys = pkMapping[tableName] || [];
    var idValues = id.split("|");

    var updateData = { ...post };
    delete updateData.TABLE_NAME;
    delete updateData.TARGET_ID;

    pKeys.forEach((key) => delete updateData[key]);

    var whereClause = pKeys.map((key) => `\`${key}\` = ?`).join(" AND ");

    db.query(
      `UPDATE ?? SET ? WHERE ${whereClause}`,
      [tableName, updateData, ...idValues],
      (error, result) => {
        if (error) throw error;
        res.redirect(`/table/view/${tableName}`);
      },
    );
  },

  delete_process: (req, res) => {
    if (!checkMNG(req, res)) return;

    var tableName = req.params.tableName;
    var id = req.params.id;
    var pKeys = pkMapping[tableName] || [];
    var idValues = id.split("|");

    var whereClause = pKeys.map((key) => `\`${key}\` = ?`).join(" AND ");

    db.query(
      `DELETE FROM ?? WHERE ${whereClause}`,
      [tableName, ...idValues],
      (error, result) => {
        if (error) throw error;
        res.redirect(`/table/view/${tableName}`);
      },
    );
  },
};
