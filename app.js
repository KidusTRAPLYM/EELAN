// modules
const mongoose = require("mongoose");
const express = require("express");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
//const ClairP = require("./models/post-clair");
const comment = require("./models/comment.js");
const TraplyP = require("./models/post-traply");
const app = express();
const PORT = 9999;
require("dotenv").config();

// 2. MongoDB connection URL from .env
const URL = process.env.MONGO_URI;

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
    const postData = await TraplyP.aggregate([{ $sample: { size: 100 } }]);
    const hydratedPosts = postData.map((doc) => new TraplyP(doc));
    const populatedPostData = await TraplyP.populate(hydratedPosts, {
      path: "userId",
      select: "name",
    });
    console.log(populatedPostData.map((post) => post.timeago));
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
app.get("/notification", async (req, res) => {
  const token = req.cookies.User;
  const decoded = jwt.verify(token, "sec");
  const userId = decoded.id;
  const user = await User.findById(userId);
  const posts = await TraplyP.find({ userId: userId });
  const populatedPosts = await TraplyP.populate(posts, {
    path: "likedBy", // Populate likedBy field
    select: "name", // Select only the name field
  });
  const notifications = populatedPosts.map((post) => {
    const likedUserNames = post.likedBy.map((user) => user.name);
    return {
      postTitle: post.message, // or any other field representing the post's title/message
      likedBy: likedUserNames,
    };
  });

  res.render("notification", {
    user,
    posts: populatedPosts,
    notifications,
    PORT,
  });
});
app.get("/comment/:postId", async (req, res) => {
  const postId = req.params.postId;
  const token = req.cookies.User;
  const decoded = jwt.verify(token, "sec");
  const userId = decoded.id;
  const comments = await comment.find({ postId }).populate("userId", "name");
  console.log(postId);
  console.log(userId);
  console.log(comments);
  res.render("comments", { comments, userId, postId });
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
app.post("/dashboard/:postId/comment", async (req, res) => {
  const postId = req.params.postId;
  const { message } = req.body; // Extract the comment message
  const token = req.cookies.User;

  if (!token) {
    return res.redirect("/login"); // Redirect if not authenticated
  }

  const decoded = jwt.verify(token, "sec");
  const userId = decoded.id;

  // Create a new comment and save it to the database
  const newComment = new comment({
    postId: postId,
    userId: userId,
    message: message,
  });

  try {
    await newComment.save();
    console.log("New comment saved:", newComment);
    res.redirect(`/home`); // Redirect back to the comment page
  } catch (error) {
    console.error("Error saving comment:", error);
    res.status(500).send("Failed to save comment");
  }
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
