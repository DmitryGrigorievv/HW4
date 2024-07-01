const joi = require("joi");
const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");

const userSchema = joi.object({
  name: joi.string().min(1).required(),
  surname: joi.string().min(1).required(),
  age: joi.number().min(0).required(),
  city: joi.string().min(1),
});

let uniqueID = 3;

const pathFile = path.join(__dirname, "users.json");

app.use(express.json());

const readUsersFromFile = () => JSON.parse(fs.readFileSync(pathFile));

const writeUsersToFile = (users) =>
  fs.writeFileSync(pathFile, JSON.stringify(users, null, 2));

app.get("/users", (req, res) => {
  const users = readUsersFromFile();
  res.send({ users });
});

const findUserById = (users, id) => users.find((user) => user.id === +id);

app.get("/users/:id", (req, res) => {
  const users = readUsersFromFile();
  const user = findUserById(users, req.params.id);
  if (user) {
    res.send({ user });
  } else {
    res
      .status(404)
      .send({ user: null, error: "user not found", status: "error" });
  }
});

app.put("/users/:id", (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ error: error.details, status: "error" });
  }

  const users = readUsersFromFile();
  const userIndex = users.findIndex((user) => user.id === +req.params.id);

  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...value };
    writeUsersToFile(users);
    res.send({ user: users[userIndex] });
  } else {
    res
      .status(404)
      .send({ user: null, error: "user not found", status: "error" });
  }
});

app.post("/users", (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).send({ error: error.details, status: "error" });
  }

  const users = readUsersFromFile();
  const newUser = { id: uniqueID++, ...value };
  users.push(newUser);
  writeUsersToFile(users);
  res.send({ user: newUser });
});

app.delete("/users/:id", (req, res) => {
  const users = readUsersFromFile();
  const userIndex = users.findIndex((user) => user.id === +req.params.id);

  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    writeUsersToFile(users);
    res.send({ status: "ok" });
  } else {
    res
      .status(404)
      .send({ user: null, error: "user not found", status: "error" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
