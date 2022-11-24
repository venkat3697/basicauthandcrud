const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "test.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Database Connected and Server Running");
    });
  } catch (error) {
    console.log(`DBERROR: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.post("/register", async (req, res) => {
  const userDetails = req.body;
  const { username, password } = userDetails;
  const getUserQuery = `SELECT * FROM users where user_name = '${username}';`;
  const getUser = await db.get(getUserQuery);
  if (getUser === undefined) {
    const createUserQuery = `INSERT INTO users(user_name,password)VALUES('${username}','${password}');`;
    await db.run(createUserQuery);
    res.send("User Created");
  } else {
    res.send("User already exists");
  }
});
app.get("/users", async (req, res) => {
  const getAllusersQuery = `SELECT * FROM users;`;
  const usersData = await db.all(getAllusersQuery);
  res.send(usersData);
});

app.put("/update", async (req, res) => {
  const userDetails = req.body;
  const { username, newPassword } = userDetails;
  const getUserQuery = `SELECT * FROM users where user_name = '${username}';`;
  const getUser = await db.get(getUserQuery);
  if (getUser !== undefined) {
    const updateUserQuery = `UPDATE users SET password='${newPassword}' WHERE user_name='${username}';`;
    await db.run(updateUserQuery);
    res.send("Password Updated");
  } else {
    res.send("User Not Available to Update");
  }
});

app.get("/login", async (req, res) => {
  const userDetails = req.body;
  const { username, password } = userDetails;
  const getUserQuery = `SELECT * FROM users where user_name = '${username}';`;
  const getUser = await db.get(getUserQuery);
  const checkPassword = password === getUser.password;
  if (checkPassword) {
    res.send("Login Success");
  } else {
    res.send("Password Not Correct");
  }
});

app.delete("/delete", async (req, res) => {
  const userDetails = req.body;
  const { username } = userDetails;
  const getUserQuery = `SELECT * FROM users where user_name = '${username}';`;
  const getUser = await db.get(getUserQuery);
  if (getUser !== undefined) {
    const deleteUserQuery = `DELETE FROM users WHERE user_name='${username}';`;
    await db.run(deleteUserQuery);
    res.send("User Deleted Succesfully");
  } else {
    res.send("User Not Found");
  }
});
