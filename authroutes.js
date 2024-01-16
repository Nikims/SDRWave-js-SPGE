let User = require("./models/User");
const bcrypt = require("bcrypt");

module.exports = function(router){
router.post("/signup", async (req, res) => {
    try {
      const { username, password, repeatPassword } = req.body;
      console.log(req.body);
      if (password.length < 5) {
        return res.status(400).json({
          error: `We don't collect sensitive data, but still, ${password.length} characters?`,
        });
      }
      if (password != repeatPassword) {
        return res.status(400).json({ error: "Passwords must match :P" });
      }
      if (!username || !password) {
        return res.status(400).json({ error: "All fields are required." });
      }
  
      const existingUser = await User.findOne({ where: { username } });
  
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "Email or username is already in use." });
      }
  
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const newUser = await User.create({
        username,
        hashedPassword,
      });
      req.session.userId = newUser.id;
      console.log(req.session.userId);
      return res.json({ message: "Signup successful", user: newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  router.post("/signin", async (req, res) => {
    try {
      const { username, password } = req.body;
  
      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Both email and password are required." });
      }
  
      const existingUser = await User.findOne({ where: { username } });
  
      if (!existingUser) {
        return res.status(401).json({ error: "No record of user found." });
      }
      console.log(existingUser);
      console.log(password, existingUser.hashedPassword);
  
      const passwordMatch = await bcrypt.compare(
        password,
        existingUser.hashedPassword
      );
  
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
      }
      req.session.userId = existingUser.id;
      return res.json({ message: "Sign-in successful", user: existingUser });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  router.post("/logout", (req, res) => {
    req.session.destroy();
  
    res.redirect(303, "/register");
  });
  router.get("/login", (req, res) => {
    res.render("loginView", { newUser: 0 });
  });
  router.get("/register", (req, res) => {
    res.render("loginView", { newUser: 1 });
  });
}