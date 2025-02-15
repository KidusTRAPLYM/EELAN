// modules
const mongoose = require("mongoose");
const express = require("express");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
//const ClairP = require("./models/post-clair");
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

app.get("/home", async (req, res) => {
  try {
    // Use aggregate to sample 100 posts
    const postData = await TraplyP.aggregate([{ $sample: { size: 100 } }]);

    // Convert postData into a Mongoose model instance to enable virtuals
    const hydratedPosts = postData.map((doc) => new TraplyP(doc));

    // Populate userId in the posts
    const populatedPostData = await TraplyP.populate(hydratedPosts, {
      path: "userId",
      select: "name",
    });

    // Debug: log the result to ensure virtuals are present
    console.log(populatedPostData.map((post) => post.timeago));

    // Render the dashboard
    res.render("dashboard", { populatedPostData, PORT });
  } catch (err) {
    console.log(`An error has occurred. ${err}`);
    res.render("error");
  }
});

app.get("/landing", (req, res) => {
  res.redirect("/home");
});
app.get("/dashboard", (req, res) => {
  res.redirect("/home");
});
app.get("/signin", (req, res) => {
  res.render("Signin");
});
app.get("/register", (req, res) => {
  res.redirect("/");
});
app.get("/post", (req, res) => {
  res.render("post");
});

app.get("/profile", async (req, res) => {
  const token = req.cookies.User;
  const decoded = jwt.verify(token, "sec");
  const userId = decoded.id;
  const user = await User.findById(userId);
  // Fetch posts created by this user
  const posts = await TraplyP.find({ userId: userId });
  res.render("profile", { user, posts, PORT });
});
app.get("/work", (req, res) => {
  res.render("work");
});
app.get("/monami", (req, res) => {
  res.render("monami");
});
app.get("/notification", (req, res) => {
  res.render("notification");
});
// Post functions

app.post("/post", async (req, res) => {
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
    res.redirect("/home");
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
    res.redirect("/home");
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
    res.redirect("/home");
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

app.post("/dashboard/:id", async (req, res) => {
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
    res.redirect("/dashboard", { userId, post });
  } catch (err) {
    console.log(`An error has occured: ${err}`);
  }
});
app.post("/dashboard/:id/like", async (req, res) => {
  try {
    const userId = req.cookies.User;
    const postId = req.params.id;
    const post = await TraplyP.findById(postId);
    console.log(postId);
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
    res.redirect("/dashboard");
  } catch (err) {
    console.log(`An error has occured. `);
  }
});
app.post("/dashboard/:id/dislike", async (req, res) => {
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
  res.redirect("/dashboard");
});
app.post("/dashboard/:id/comment", async (req, res) => {
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
