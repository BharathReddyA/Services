const express = require('express');
const mysql = require('mysql');
const session = require('express-session');

const app = express();
const port = 3000;

const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');

const connection = mysql.createConnection({
  host: 'service-db.cwbicy2pepxf.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'admin123',
  database: 'servicedb',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
});

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/signin', (req, res) => {
  res.sendFile(__dirname + '/signin.html');
});

app.post('/signin', (req, res) => {
  const name = req.body.name;
  const username = req.body.username;
  const phone = req.body.phone;
  const password = req.body.password;

  const query = `INSERT INTO users (name, username, phone, password) VALUES (?, ?, ?, ?)`;

  connection.query(query, [name, username, phone, password], (err, results) => {
    if (err) throw err;
    console.log('User registered successfully!');
    res.redirect('/login');
  });
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = `SELECT * FROM users WHERE username = ? AND password = ?`;

  connection.query(query, [username, password], (err, results) => {
    if (err) throw err;
    if (results.length === 1) {
      req.session.loggedIn = true;
      req.session.username = username;
      res.redirect('/welcome');
    } else {
      res.send('Invalid username or password');
    }
  });
});

app.get('/welcome', (req, res) => {
  if (req.session.loggedIn) {
    const username = req.session.username;
    const query = `SELECT * FROM users WHERE username = ?`;

    connection.query(query, [username], (err, results) => {
      if (err) throw err;
      const user = results[0];
      res.send(`
        <html>
          <head>
            <title>Welcome</title>
            <style>
              .card {
                background-color: #f0f0f0;
                border-radius: 5px;
                padding: 20px;
                margin: 20px;
                display: inline-block;
              }
            </style>
          </head>
          <body>
            <h1>Welcome, ${user.name}!</h1>
            <div class="card">
              <h3>User Information</h3>
              <p><strong>Name:</strong> ${user.name}</p>
              <p><strong>Username:</strong> ${user.username}</p>
              <p><strong>Phone:</strong> ${user.phone}</p>
            </div>
          </body>
        </html>
      `);
    });
  } else {
    res.redirect('/login');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
