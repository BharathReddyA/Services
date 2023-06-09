const express = require("express");
const path = require("path");
const mysql = require("mysql");
const session = require("express-session");

const app = express();
const port = 3000;

const crypto = require("crypto");
const secretKey = crypto.randomBytes(32).toString("hex");

// ...

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));

// ...

const connection = mysql.createConnection({
  host: "service-db.cwbicy2pepxf.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "admin123",
  database: "servicedb",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});

app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.json());

app.get('/home-page', (req,res) => {
  res.render('home');
});

app.get("/signin", (req, res) => {
  res.sendFile(__dirname + "/signin.html");
});

app.post("/signin", (req, res) => {
  const name = req.body.name;
  const username = req.body.username;
  const phone = req.body.phone;
  const password = req.body.password;

  const query = `INSERT INTO users (name, username, phone, password) VALUES (?, ?, ?, ?)`;

  connection.query(query, [name, username, phone, password], (err, results) => {
    if (err) throw err;
    console.log("User registered successfully!");
    res.redirect("/login");
  });
});

// ...


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  res.render('welcome', { user: req.user || null });
});

app.post('/welcome', (req, res) => {
  const workType = req.body['work-type'];
  const query = 'SELECT * FROM workers WHERE work_type = ?';

  connection.query(query, [workType], (err, results) => {
    if (err) throw err;
    const worker = results[0];
    res.render('welcome', { worker:worker });
  });
});

// ...


app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;

  connection.query(query, [username, password], (err, results) => {
    if (err) throw err;
    if (results.length === 1) {
      req.session.loggedIn = true;
      req.session.username = username;
      res.redirect("/welcome");
    } else {
      res.send("Invalid username or password");
    }
  });
});

// ...

// app.get('/welcome', (req, res) => {
//   if (req.session.loggedIn) {
//     const username = req.session.username;
//     const query = `SELECT * FROM users WHERE username = ?`;

//     connection.query(query, [username], (err, results) => {
//       if (err) throw err;
//       const user = results[0];
//       res.sendFile(__dirname + '/welcome.html?name=' + user.name + '&username=' + user.username + '&phone=' + user.phone);
//     });
//   } else {
//     res.redirect('/login');
//   }
// });

// app.get('/welcome', (req, res) => {
//   const name = req.query.name;
//   const username = req.query.username;
//   const phone = req.query.phone;

//   res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
// });

// ...
app.get("/welcome", (req, res) => {
  if (req.session.loggedIn) {
    const username = req.session.username;
    const query = `SELECT * FROM users WHERE username = ?`;

    connection.query(query, [username], (err, results) => {
      if (err) throw err;
      const user = results[0];
      res.render("welcome", { user:user });
    });
  } else {
    res.redirect("/login")
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
