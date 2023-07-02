const express = require("express");

const {
  signup,
  login,
  logout,
  current,
} = require("../../ctrls/usersControllers");

const userSignUp = require("../../middlewares/validation/userSignUp");
const userLogin = require("../../middlewares/validation/userLogin");
const authenticationUser = require("../../middlewares/validation/authentification");

const routerUser = express.Router();

routerUser.post("/signup", userSignUp, signup);

routerUser.post("/login", userLogin, login);

routerUser.post("/logout", authenticationUser, logout);

routerUser.get("/current", authenticationUser, current);

module.exports = routerUser;
