const express = require("express");
const exphbs = require("express-handlebars");
const url = require("url");
const bodyParser = require("body-parser");

const multer = require("multer");
const upload = multer({ dest: "tmp_uploads/" });
const fs = require("fs");

const session = require("express-session");
const moment = require("moment-timezone");
const mysql = require("mysql");
const sha1 = require("sha1");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "DB02"
});
db.connect();

const app = express();

app.engine(
  "hbs",
  exphbs({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: {
      list: require("./helpers/list")
    }
  })
);

app.set("view engine", "hbs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: "dfhklsdfskl",
    cookie: {
      maxAge: 1800000
    }
  })
);

// 自訂 middleware
app.use((req, res, next) => {
  res.locals.renderData = {
    loginUser: req.session.loginUser
  };
  next();
});

// -------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.render("home");
  // const sales = require('./data/sales.json');
  //
  // res.type('text/plain');
  // console.log(sales);
  // res.send(JSON.stringify(sales));
});
app.get("/menu", (req, res) => {
    res.render("menu");
  });
  app.get("/news", (req, res) => {
    res.render("news");
  });
  app.get("/address", (req, res) => {
    res.render("address");
  });


app.get("/sales", (req, res) => {
  const sales = require("./data/sales.json");
  

  data.sales = sales;
  data.myclass = "table-danger";

  res.render("sales", data);
});

app.get("/sales2", (req, res) => {
  const data = res.locals.renderData;
  const sales = require("./data/sales.json");

  data.sales = sales;
  data.myclass = "table-danger";

  res.render("sales2", data);
});

app.get("/abc", (req, res) => {
  res.send("<h2>ABC</h2>");
});

app.post("/form01.html", (req, res) => {
  res.send("Hello post");
});

app.get("/try-querystring", (req, res) => {
  const urlParts = url.parse(req.url, true);
  console.log(urlParts);
  urlParts.myQuery = JSON.parse(JSON.stringify(urlParts.query));
  res.render("try_querystring", { urlParts: urlParts });
});

app.get("/try-post-form", (req, res) => {
  res.render("try_post_form");
});
app.post("/try-post-form", (req, res) => {
  //res.json(req.body);
  res.render("try_post_form", req.body);
});

app.post("/try-post2", (req, res) => {
  //res.json(req.body);
  req.body.ttt = "你好";
  res.json(req.body);
});

app.get("/try-upload", (req, res) => {
  res.render("try_upload");
});
app.post("/try-upload", upload.single("avatar"), (req, res) => {
  console.log(req.file);

  if (req.file && req.file.originalname) {
    // 限定圖檔
    if (/\.(jpg|jpeg|png)$/i.test(req.file.originalname)) {
      fs.createReadStream(req.file.path).pipe(
        fs.createWriteStream("./public/img/" + req.file.originalname)
      );
    }
  }

  res.render("try_upload", {
    result: true,
    name: req.body.name,
    avatar: "/img/" + req.file.originalname
  });
});

app.get("/try-params/:action?/:id?", (req, res) => {
  res.json(req.params);
});
app.get("/try-params2/*/*?", (req, res) => {
  res.json(req.params);
});

app.get(/^\/hi\/?/, (req, res) => {
  res.send(req.url);
});
app.get(/^\/09\d{2}\-?\d{3}\-?\d{3}$/, (req, res) => {
  let str = req.url.slice(1);
  str = str.split("-").join("");
  res.send("mobile: " + str);
});

const admin1 = require("./my_routers/admin1");
admin1(app);

app.use(require("./my_routers/admin2"));
app.use("/admin3", require("./my_routers/admin3"));

app.get("/try-session", (req, res) => {
  req.session.views = req.session.views || 0;
  req.session.views++;
  res.send(req.session.views.toString());
});

app.get("/login", (req, res) => {
  const data = res.locals.renderData;

  if (req.session.flashMsg) {
    data.flashMsg = req.session.flashMsg;
    delete req.session.flashMsg;
  }

  res.render("login", data);
});
app.post("/login", (req, res) => {
  console.log(req.body.user)
  db.query(
    "SELECT * FROM `admins` WHERE `admin_id`=? AND `password`=SHA1(?)",
    [req.body.user, req.body.password],
    (error, results, fields) => {
      console.log(results); // debug
      if (!results.length) {
        req.session.flashMsg = {
          type: "danger",
          msg: "帳號或密碼錯誤"
        };
      } else {
        req.session.loginUser = req.body.user;
        req.session.flashMsg = {
          type: "success",
          msg: "登入成功"
        };
      }
      res.redirect("/cart"); // 跳轉頁面
    }
  );
});

app.get("/logout", (req, res) => {
  delete req.session.loginUser;
  res.redirect("/login");
});

app.get("/try-moment", (req, res) => {
  res.type = "text/plain";

  const myFormat = "YYYY-MM-DD HH:mm:ss";

  const mo1 = moment(req.session.cookie.expires);
  const mo2 = moment();

  res.write(mo1.format(myFormat) + "\n");
  res.write(mo2.format(myFormat) + "\n");

  res.write(mo1.tz("Europe/London").format(myFormat) + "\n");
  res.write(mo2.tz("Europe/London").format(myFormat) + "\n");
  res.end("");
});

app.get("/sales3", (req, res) => {
  db.query(
    "SELECT * FROM `sales` ORDER BY sid DESC",
    (error, results, fields) => {
      results.forEach(function(el) {
        el.birth = moment(el.birthday).format("YYYY-MM-DD");
      });
      res.render("sales3", {
        sales: results
      });
    }
  );
});

app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", (req, res) => {
  const data = res.locals.renderData;
  const val = {
    admin_id: req.body.admin_id,
    password: sha1(req.body.pwd),
    addr: req.body.addr
  };
  data.addForm = val; // 將表單資料再丟回表單


  if (!req.body.admin_id || !req.body.pwd || !req.body.addr) {
    data.msg = {
      type: "danger",
      info: "每一欄皆為必填欄位"
    };
    res.render("add", data);
    return;
  }

  db.query(
    "SELECT 1 FROM `admins` WHERE `admin_id`=?",
    [req.body.admin_id],
    (error, results, fields) => {
      if (results.length) {
        data.msg = {
          type: "danger",
          info: "帳號 已經被使用了"
        };
        res.render("add", data);
        return;
      }

      const sql = "INSERT INTO `admins` SET ?";
      db.query(sql, val, (error, results, fields) => {
        if (error) {
          console.log(error);
          res.send(error.sqlMessage);
          return;
        }

        if (results.affectedRows === 1) {
          data.msg = {
            type: "success",
            info: "資料新增成功"
          };
          res.render("add", data);
        }
      });
    }
  );
});

app.get("/sales3/remove/:sid", (req, res) => {
  db.query(
    "DELETE FROM `sales` WHERE `sid`=?",
    [req.params.sid],
    (error, results, fields) => {
      res.redirect("/sales3");
    }
  );
});

app.get("/sales3/remove2/:sid", (req, res) => {
  db.query(
    "DELETE FROM `sales` WHERE `sid`=?",
    [req.params.sid],
    (error, results, fields) => {
      res.json({
        success: true,
        affectedRows: results.affectedRows
      });
    }
  );
});

app.get("/sales3/edit/:sid", (req, res) => {
  db.query(
    "SELECT * FROM `sales` WHERE `sid`=?",
    [req.params.sid],
    (error, results, fields) => {
      if (!results.length) {
        res.status(404);
        res.send("No data!");
      } else {
        results[0].birthday = moment(results[0].birthday).format("YYYY-MM-DD");
        res.render("sales3_edit", {
          item: results[0]
        });
      }
    }
  );
});

app.post("/sales3/edit/:sid", (req, res) => {
  let my_result = {
    success: false,
    affectedRows: 0,
    info: "每一欄皆為必填欄位"
  };
  const val = {
    sales_id: req.body.sales_id,
    name: req.body.name,
    birthday: req.body.birthday
  };

  if (!req.body.sales_id || !req.body.name || !req.body.birthday) {
    res.json(my_result);
    return;
  }

  db.query(
    "SELECT 1 FROM `sales` WHERE `sales_id`=? AND sid<>?",
    [req.body.sales_id, req.params.sid],
    (error, results, fields) => {
      if (results.length) {
        my_result["info"] = "員工編號重複";
        res.json(my_result);
        return;
      }

      const sql = "UPDATE `sales` SET ? WHERE sid=?";
      db.query(sql, [val, req.params.sid], (error, results, fields) => {
        if (error) {
          // console.log(error);
          // res.send(error.sqlMessage);
          // return;
        }

        if (results.changedRows === 1) {
          my_result = {
            success: true,
            affectedRows: 1,
            info: "修改成功"
          };
          res.json(my_result);
        } else {
          my_result["info"] = "資料沒有變更";
          res.json(my_result);
        }
      });
    }
  );
});

app.get("/sales4/login", (req, res) => {
  res.send("hello /sales4/login");
});
app.use("", require("./my_routers/sales4"));


app.use((req, res) => {
  res.type("text/plain");
  res.status(404);
  res.send("Page not found.....");
});

app.listen(3000, () => {
  console.log("server start...");
});
