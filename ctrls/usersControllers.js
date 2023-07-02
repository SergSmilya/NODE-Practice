const userModel = require("../db/models/userModel");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const fs = require("fs").promises;
const path = require("path");

const avatarDir = path.join(__dirname, "../public", "avatars");

const { SECRET_KEY } = process.env;

async function signup(req, res, next) {
  try {
    const { email, password, name } = req.body;

    const findEmail = await userModel.findOne({ email });
    if (findEmail) {
      res.status(409).json({ message: "This email inuse" });
      return;
    }

    const avatar = gravatar.url(email);

    const newUser = new userModel({ name, email, password, avatar });

    await newUser.hashPassword(password);

    await newUser.save();

    const payload = { id: newUser._id };

    const token = jwt.sign(payload, SECRET_KEY);

    await userModel.findByIdAndUpdate(newUser._id, { token });

    res.status(201).json({ user: { name, email, avatar }, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "email or password wrong" });
      return;
    }
    const isPasswordTrue = await user.comparePassword(password);
    if (!isPasswordTrue) {
      res.status(401).json({ message: "email or password wrong" });
      return;
    }
    const payload = { id: user._id };
    const token = jwt.sign(payload, SECRET_KEY);
    await userModel.findByIdAndUpdate(user._id, { token });
    res.json({ user: { name: user.name, email, avatar: user.avatar }, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await userModel.findByIdAndUpdate(_id, { token: "" });
    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const current = async (req, res, next) => {
  try {
    const { name, email, avatar } = req.user;

    res.status(200).json({
      name,
      email,
      avatar,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const changeAvatar = async (req, res, next) => {
  try {
    const { path: oldPath, originalname } = req.file;
    const { _id } = req.user;

    const fileName = `${_id}${originalname}`;

    const newPath = path.join(avatarDir, fileName);
    await fs.rename(oldPath, newPath);

    const avatarUrl = path.join("avatars", fileName);

    await userModel.findByIdAndUpdate(_id, { avatar: avatarUrl });
    res.json({ avatar: avatarUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signup, login, logout, current, changeAvatar };
