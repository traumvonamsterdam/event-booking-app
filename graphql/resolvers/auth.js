const bcrypt = require("bcrypt");

const User = require("../../models/user");
const jwt = require("jsonwebtoken");

module.exports = {
  createUser: async args => {
    const { email, password } = args.userInput;
    try {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error("User already exists.");
      }
      const hashedPassword = bcrypt.hash(password, 12);
      const newUser = new User({
        email,
        password: hashedPassword
      });
      savedUser = await newUser.save();
      return { ...savedUser._doc, password: null, _id: savedUser.id };
    } catch (err) {
      throw err;
    }
  },
  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User does not exist.");
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error("Incorrect password.");
    }
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      "somesupersecretkey",
      { expiresIn: "1h" }
    );
    return { userId: user.id, token, tokenExpiration: 1 };
  }
};
