// modules
const mongoose = require("mongoose");
const express = require("express");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const ClairP = require("./models/post-clair");
const TraplyP = require("./models/post-traply");
const app = express();
const PORT = 4447;
const URL =
  "mongodb+srv://Traply_user:traply_ninja_1234@traply.lnv0ipt.mongodb.net/Elan?retryWrites=true&w=majority&appName=Traply";
const cookieParser = require("cookie-parser");
const cors = require("cors");
// middleware

app.use(cors());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// mongodb connection
async function connectMongodb() {
  try {
    mongoose.connect(URL);
    console.log("Mongodb connection has successfully been set");
  } catch (err) {
    console.log(
      `An error has occcured while connecting to the database ${err}`
    );
  }
}
connectMongodb();
// create token
const maxAge = 3 * 24 * 60 * 60 * 100;
const createToken = (id) => {
  return jwt.sign({ id }, "sec", { expiresIn: maxAge });
};
//routing
// Get route functions
app.get("/", (req, res) => {
  res.render("register");
});
app.get("/traply", (req, res) => {
  res.render("Traply");
});
app.get("/clair", (req, res) => {
  res.render("Clair");
});
app.get("/signin", (req, res) => {
  res.render("Signin");
});
app.get("/register", (req, res) => {
  res.redirect("/");
});
app.get("/post/traply", (req, res) => {
  res.render("post-traply");
});
app.get("/post/clair", (req, res) => {
  res.render("post-clair");
});
app.get("/dashboard/clair", async (req, res) => {
  try {
    const postData = await ClairP.aggregate([{ $sample: { size: 5 } }]);
    const populatedPostData = await ClairP.populate(postData, {
      path: "userId",
      select: "name",
    });

    console.log(postData);
    res.json(populatedPostData);
  } catch (err) {
    console.log(`An error has occurred. ${err}`);
    res.status(500).json({ error: "Error fetching data" });
  }
});
app.get("/dashboard/traply", async (req, res) => {
  try {
    const postData = await TraplyP.find();
    console.log(postData);
    res.render("dashboard-traply", { postData, PORT });
  } catch (err) {
    console.log(`An error has occurred. ${err}`);
    res.render("error");
  }
});
app.get("/profile/traply", async (req, res) => {
  const token = req.cookies.User;
  const decoded = jwt.verify(token, "sec");
  const userId = decoded.id;
  const user = await User.findById(userId);
  res.render("profile-traply", { user });
});
app.get("/profile/clair", async (req, res) => {
  const token = req.cookies.User;
  const decoded = jwt.verify(token, "sec");
  const userId = decoded.id;
  const user = await User.findById(userId);
  res.render("profile-clair", { user });
});
// Post functions
app.post("/post/clair", async (req, res) => {
  const { message } = req.body;

  try {
    const token = req.cookies.User;
    const decoded = jwt.verify(token, "sec");
    const userId = decoded.id;
    const newPost = new ClairP({
      message,
      userId,
    });
    await newPost.save();

    res.redirect("/dashboard/clair");
  } catch (err) {
    console.log(`An error has occured:${err}`);
    res.render("error");
  }
});
app.post("/post/Traply", async (req, res) => {
  const { message } = req.body;
  try {
    const token = req.cookies.User;
    const decoded = jwt.verify(token, "sec");
    const userId = decoded.id;
    const newPost = new TraplyP({
      message,
      userId,
    });
    await newPost.save();
    res.render("dashboard-traply");
  } catch (err) {
    console.log("An error has occured. ");
    res.render("error");
  }
});
app.post("/signin", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.login(email);
    const token = createToken(user._id);
    console.log(user);
    res.cookie("User", token, {
      maxAge: maxAge,
      httpOnly: true,
      secure: false,
    });
    res.render("Success");
  } catch (err) {
    let errorMessage = "An error has occured";
    res.render("signinerr", { errorMessage });
    console.log(err);
  }
});
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({ name, email, password });
    const token = createToken(user._id);
    res.cookie("User", token, {
      maxAge: maxAge,
      httpOnly: true,
      secure: false,
    });
    res.render("success");
  } catch (err) {
    let errorMessage = "An error has occurred.";
    if (err.code === 11000) {
      errorMessage = "The email is taken. ";
    }
    console.log(`An error has occurred. ${err}`);
    res.render("registererr", { errorMessage });
    console.log(errorMessage);
  }
});
app.post("/dashboard/clair/:id", async (req, res) => {
  const userId = req.cookies.User;
  if (!userId) {
    console.log("UserId is not found");
  }
  try {
    const postId = req.params.id;
    const postFetch = await ClairP.findById(postId);
    if (!postId) {
      console.log("PostId is not found");
    }

    res.redirect("/dashboard/clair", { PORT, postFetch, userId });
  } catch (err) {
    console.log(`An error has occured`);
    res.render("error");
  }
});
app.post("/dashboard/clair/:id/like", async (req, res) => {
  const postId = req.params.id;
  const userId = req.cookies.User;
  const post = await ClairP.findById(postId);
  if (post.likedBy.includes(userId)) {
    post.likedBy = post.likedBy.filter((id) => id !== userId);
    post.like--;
  } else {
    if (post.dislikedBy.includes(userId)) {
      post.dislikedBy = post.dislikedBy.filter((id) => id !== userId);
      post.dislike--;
    }
    post.likedBy.push(userId);
    post.like++;
  }
  await post.save();
  res.redirect("/dashboard/clair");
});
app.post("/dashboard/clair/:id/dislike", async (req, res) => {
  const userId = req.cookies.User;
  const postId = req.params.id;
  const post = await ClairP.findById(postId);
  if (post.dislikedBy.includes(userId)) {
    post.dislikedBy = post.dislikedBy.filter((id) => id !== userId);
    post.dislike--;
  } else {
    if (post.likedBy.includes(userId)) {
      post.likedBy = post.likedBy.filter((id) => id !== userId);
    }
    post.dislikedBy.push(userId);
    post.dislike++;
  }
  await post.save();
  res.redirect("/dashboard/clair");
});
app.post("/dashboard/traply/:id", async (req, res) => {
  const userId = req.cookies.User;
  if (!userId) {
    console.log("User not found");
  }
  try {
    const postId = req.params.id;
    if (!postId) {
      console.log("The post is not found");
    }
    const post = await TraplyP.findById(postId);
    res.redirect("/dashboard/traply", { userId, post });
  } catch (err) {
    console.log(`An error has occured: ${err}`);
  }
});
app.post("/dashboard/traply/:id/like", async (req, res) => {
  const userId = req.cookies.User;
  const postId = req.params.id;
  const post = await TraplyP.findById(postId);
  if (post.likedBy.includes(userId)) {
    post.likedBy = post.likedBy.filter((id) => id !== userId);
    post.like--;
  } else {
    if (post.dislikedBy.includes(userId)) {
      post.dislikedBy = post.dislikedBy.filter((id) => id !== userId);
      post.dislike--;
    }
    post.likedBy.push(userId);
    post.like++;
  }
  await post.save();
  res.redirect("/dashboard/traply");
});
app.post("/dashboard/traply/:id/dislike", async (req, res) => {
  const userId = req.cookies.User;
  const postId = req.params.id;
  const post = await TraplyP.findById(postId);
  if (post.dislikedBy.includes(userId)) {
    post.dislikedBy = post.dislikedBy.filter((id) => id !== userId);
    post.dislike--;
  } else {
    if (post.likedBy.includes(userId)) {
      post.likedBy = post.likedBy.filter((id) => id !== userId);
      post.like--;
    }
    post.dislikedBy.push(userId);
    post.dislike++;
  }
  await post.save();
  res.redirect("/dashboard/traply");
});
app.post("/dashboard/traply/:id/comment", async (req, res) => {
  const postId = req.params.id;
  const post = await TraplyP.findByIdAndUpdate(postId, {
    $push: { comment: { text } },
  });
  await post.save();
  res.redirect("/dashabord/traply");
});
app.post("/signout", async (req, res) => {
  try {
    res.clearCookie("User");
    res.redirect("/");
  } catch (err) {
    console.log(`An error has occurred. ${err}`);
  }
});
app.use((req, res) => {
  res.render("error");
});
app.listen(PORT, () => {
  console.log(`PORT IS RUNNING ON PORT ${PORT}`);
});
