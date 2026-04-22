const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection (socket fix)
const db = mysql.createConnection({
  socketPath: "/tmp/mysql.sock",
  user: "appuser",
  password: "1234",
  database: "loan_system",
});

db.connect((err) => {
  if (err) {
    console.log("DB Error:", err);
    return;
  }
  console.log("MySQL Connected ✅");
});

// ✅ CENTERED LOGIN PAGE
app.get("/", (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Login</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          font-family: Arial;
          background: #f4f4f4;
        }
        .login-box {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,0,0,0.2);
          text-align: center;
        }
        input {
          display: block;
          margin: 10px auto;
          padding: 10px;
          width: 200px;
        }
        button {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          cursor: pointer;
        }
        button:hover {
          background: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="login-box">
        <h2>Loan System Login</h2>
        <form method="POST" action="/login">
          <input name="username" placeholder="Username" required />
          <input name="password" type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// LOGIN LOGIC + DASHBOARD
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username=? AND password=?",
    [username, password],
    (err, result) => {
      if (err) {
        res.send("Database Error ❌");
        return;
      }

      if (result.length > 0) {
        db.query("SELECT * FROM loans", (err, loans) => {
          let table = `
            <html>
            <head>
              <style>
                body {
                  font-family: Arial;
                  background: #f4f4f4;
                  text-align: center;
                }
                table {
                  margin: auto;
                  border-collapse: collapse;
                  width: 60%;
                  background: white;
                }
                th, td {
                  padding: 10px;
                  border: 1px solid #ddd;
                }
                th {
                  background: #007bff;
                  color: white;
                }
              </style>
            </head>
            <body>
              <h2>Loan Dashboard</h2>
              <table>
                <tr>
                  <th>Name</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                </tr>
          `;

          loans.forEach((l) => {
            table += `
              <tr>
                <td>${l.customer_name}</td>
                <td>${l.total_amount}</td>
                <td>${l.paid_amount}</td>
                <td>${l.remaining_amount}</td>
              </tr>
            `;
          });

          table += `
              </table>
            </body>
            </html>
          `;

          res.send(table);
        });
      } else {
        res.send("Login Failed ❌");
      }
    },
  );
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
