const jwt = require("jsonwebtoken");
const userModel = require("../../db/models/userModel");

const { SECRET_KEY } = process.env;

const authenticationUser = async (req, res, next) => {
  try {
    const { authorization = "" } = req.headers;
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
      console.log("🚀 ~ bearer:", bearer);
      res.status(401).json({ message: "Not authorized" });

      return;
    }
    const { id } = jwt.verify(token, SECRET_KEY);
    const user = await userModel.findById(id);

    if (!user || !user.token) {
      console.log("🚀 ~ user.token:", user.token);
      console.log("🚀 ~ user:", user);

      res.status(401).json({ message: "Not authorized" });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = authenticationUser;
