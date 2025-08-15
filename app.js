// modules

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const User = require("./models/user");
const jwt = require("jsonwebtoken");
require("dns").setServers(["8.8.8.8"]);

const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);
//const ClairP = require("./models/post-clair");
const axios = require("axios");
const dotenv = require("dotenv");
const feedback = require("./models/feedback.js");

const { OAuth2Client } = require("google-auth-library");

dotenv.config();
const comment = require("./models/comment.js");
const Post = require("./models/post-traply");
const journals = require("./models/journal.js");

const PORT = 9999;
require("dotenv").config();

// 2. MongoDB connection URL from .env
const URL = process.env.MONGO_URI;

const cookieParser = require("cookie-parser");
const cors = require("cors");
const journal = require("./models/journal.js");

// middleware

app.use(cors());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/robots.txt", express.static("robots.txt"));

// mongodb connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
connectDB();
console.log(process.env.MONGO_URI);
// create token
const maxAge = 3 * 24 * 60 * 60 * 100;
const createToken = (id) => {
  return jwt.sign({ id }, "sec", { expiresIn: maxAge });
};
//routing
// Get route functions

app.get("/", async (req, res) => {
  res.render("more");
});
app.get("/landing", async (req, res) => {
  const token = req.cookies.User;
  if (!token) {
    return res.redirect("/signin"); // Redirect if not authenticated
  }
  const decoded = jwt.verify(token, "sec");
  const userId = decoded.id;
  const user = await User.findById(userId);
  res.render("landing", { user });
});

app.get("/feed", async (req, res) => {
  let messages = "The message field is empty";
  try {
    const postData = await Post.aggregate([{ $sample: { size: 100 } }]);
    const hydratedPosts = postData.map((doc) => new Post(doc));
    const populatedPostData = await Post.populate(hydratedPosts, {
      path: "userId",
      select: "name",
    });
    console.log(populatedPostData.map((post) => post.timeago));
    res.render("feed", { populatedPostData, PORT, messages });
  } catch (err) {
    console.log(`An error has occurred. ${err}`);
    res.render("error");
  }
});
app.get("/about", (req, res) => {
  res.render("about");
});
app.get("/dashboard", (req, res) => {
  res.redirect("/landing");
});
app.get("/home", (req, res) => {
  res.redirect("/landing");
});
app.get("/matchup", (req, res) => {
  res.render("matchup");
});
app.get("/dashboard/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    console.log(post);
    res.render("post-single", { post, PORT });
  } catch (err) {
    res.render("error");
    console.log(`An error has occured!: ${err}`);
  }
});
app.get("/signin", (req, res) => {
  res.render("Signin");
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/signup", (req, res) => {
  res.redirect("/register");
});
app.get("/post", (req, res) => {
  res.render("post");
});
app.get("/terms-of-use", (req, res) => {
  res.render("policy");
});
app.get("/journal", async (req, res) => {
  let messages = "The message field is empty";
  const token = req.cookies.User;
  if (!token) {
    return res.redirect("/signin");
  }
  const decoded = jwt.verify(token, "sec");
  const userId = decoded.id;
  const fetchJournal = await journal
    .find({ userId })
    .sort({ date: -1 })
    .limit(3);
  res.render("journal", { messages, fetchJournal });
});
// Adjust path accordingly

app.get("/search", async (req, res) => {
  let messages = "The message field is empty";
  const query = req.query.q;

  if (!query) {
    return res.render("search", { results: [], query: "" });
  }

  try {
    const results = await Post.find({
      $text: { $search: query },
    });

    res.render("search", { results, query, messages });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/profile", async (req, res) => {
  let messages = "The message field is empty";
  const token = req.cookies.User;
  if (!token) {
    return res.redirect("/signin"); // Redirect if not authenticated
  }
  const decoded = jwt.verify(token, "sec");
  const userId = decoded.id;
  const postId = req.params.postId;
  const user = await User.findById(userId);
  // Fetch posts created by this user
  const posts = await Post.find({ userId: userId }).sort({ createdAt: -1 });
  const fetchJournal = await journal.find({ userId }).sort({ date: -1 });
  const comments = await comment
    .find({ userId })
    .populate("userId", "name")
    .sort({ createdAt: -1 });
  res.render("profile", {
    user,
    posts,
    PORT,
    messages,
    postId,
    fetchJournal,
    comments,
  });
});
app.get("/comment/:postId", async (req, res) => {
  const postId = req.params.postId;
  const posts = await Post.findById(postId).populate("userId", "name");

  // const token = req.cookies.User;
  // if (!token) {
  //   return res.redirect("/signin");
  // }
  // const decoded = jwt.verify(token, "sec");
  // const userId = decoded.id;
  const comments = await comment.find({ postId }).populate("userId", "name");
  console.log(postId);
  // console.log(userId);
  console.log(comments);
  res.render("comments", { postId, posts, comments });
});
app.get("/admin", async (req, res) => {
  let feedbacks = await feedback.find();
  res.render("admin", { feedbacks });
});
app.get("/monami", (req, res) => {
  res.render("monamipure", {
    response: null,
    error: null,
    userMessage: null,
    chatHistory: "There is no chat history for now!",
  });
});

app.get("*", (req, res, next) => {
  // Check if the request is coming from the subdomain monami.ciphree.com
  if (req.hostname === "monami.ciphree.com") {
    return res.render("monamipure", {
      response: null,
      error: null,
      userMessage: null,
      chatHistory: "There is no chat history for now!",
    });
  }
  next(); // Continue to other routes for non-subdomain requests
});

const WIKI_API_URL = "https://en.wikipedia.org/w/api.php";
async function searchWikipedia(query) {
  try {
    const searchResponse = await axios.get(WIKI_API_URL, {
      params: {
        action: "query",
        format: "json",
        list: "search",
        srsearch: query,
      },
    });

    const pageTitle = searchResponse.data.query.search[0].title;

    const pageResponse = await axios.get(WIKI_API_URL, {
      params: {
        action: "query",
        format: "json",
        prop: "extracts",
        exintro: true,
        explaintext: true,
        titles: pageTitle,
      },
    });

    const pages = pageResponse.data.query.pages;
    const page = pages[Object.keys(pages)[0]];

    let text = page.extract || "No information found.";

    // Extract only the first paragraph
    const firstParagraph = text.split("\n")[0]; // split by line breaks

    return firstParagraph;
  } catch (err) {
    console.error(err);
    return "An error has occured! Please try again";
  }
}

const chatHistory = []; // this stays in memory

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  // Get Wikipedia answer
  const response = await searchWikipedia(userMessage);

  // Store in memory
  chatHistory.push({ user: userMessage, bot: response });

  res.render("monami", {
    chatHistory,
  });
});
app.post("/clear", (req, res) => {
  chatHistory = []; // reset chat history
  res.redirect("/monami"); // reload page with empty chat
});
io.on("connection", (socket) => {
  // When user sets username & tag, join the tag room
  socket.on("setUser", ({ username, tag }) => {
    socket.username = username;
    socket.tag = tag;

    const roomName = `resonance-${tag}`;
    const room = io.sockets.adapter.rooms.get(roomName);
    const numUsers = room ? room.size : 0;

    if (numUsers >= 2) {
      socket.emit("roomFull", "The room is full for this tag");
      socket.disconnect();
      return;
    }

    socket.join(roomName);
    io.to(roomName).emit(
      "message",
      `${username} joined the room for tag: ${tag}`
    );
  });

  socket.on("message", (text) => {
    const roomName = `resonance-${socket.tag}`;
    io.to(roomName).emit("message", {
      username: socket.username,
      text,
    });
  });

  socket.on("typing", () => {
    const roomName = `resonance-${socket.tag}`;
    socket.to(roomName).emit("typing", `${socket.username} is typing...`);
  });

  socket.on("stopTyping", () => {
    const roomName = `resonance-${socket.tag}`;
    socket.to(roomName).emit("stopTyping");
  });

  socket.on("disconnect", () => {
    if (socket.username && socket.tag) {
      const roomName = `resonance-${socket.tag}`;
      io.to(roomName).emit("message", `${socket.username} left the chat`);
    }
  });
});
app.post("/feedback", async (req, res) => {
  const { message } = req.body;
  try {
    const newFeedback = new feedback({ message });
    await newFeedback.save();
    console.log("Feedback saved successfully");
    res.render("morewithoutform");
  } catch (err) {
    console.log("Error saving feedback:", err);
    res.render("error");
  }
});
app.post("/journal", (req, res) => {
  const { message, name, date } = req.body;
  try {
    const token = req.cookies.User;
    if (!token) {
      return res.redirect("/signin");
    }
    const decoded = jwt.verify(token, "sec");
    const userId = decoded.id;
    const newJournal = new journal({
      message,
      name,
      date,
      userId,
    });
    newJournal.save();
    res.redirect("/home");
  } catch (err) {
    console.log(`An error has occured , ${err}`);
    res.redirect("/error");
  }
});
app.post("/post", async (req, res) => {
  const { message, type } = req.body;
  try {
    const token = req.cookies.User;
    if (!token) {
      return res.redirect("/signin"); // Redirect if not authenticated
    }
    const decoded = jwt.verify(token, "sec");
    const userId = decoded.id;
    const newPost = new Post({
      message,
      userId,
      type,
    });
    await newPost.save();
    res.redirect("/home");
  } catch (err) {
    console.log("An error has occured. ");
    res.render("error");
  }
});
app.post("/signin", async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.login(password, name);
    const token = createToken(user._id);
    console.log(user);
    res.cookie("User", token, {
      maxAge: maxAge,
      httpOnly: true,
      secure: false,
    });
    res.redirect("/home");
  } catch (err) {
    let errorMessage = "The password or the name was incorrect.";
    res.render("signinerr", { errorMessage });
    console.log(err);
  }
});
app.post("/register", async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.create({ name, password });
    const token = createToken(user._id);
    res.cookie("User", token, {
      maxAge: maxAge,
      httpOnly: true,
      secure: false,
    });
    res.redirect("/home");
  } catch (err) {
    let errorMessage = "The name is taken";
    if (err.code === 11000) {
      errorMessage = "The name is taken ";
    }
    console.log(`An error has occurred. ${err}`);
    res.render("registererr", { errorMessage });
    console.log(errorMessage);
  }
});

// POST route to add a comment — login required
app.post("/comments/:postId/comment", async (req, res) => {
  const postId = req.params.postId;
  const { message } = req.body;
  const token = req.cookies.User;
  if (!token) return res.redirect("/signin");

  try {
    const decoded = jwt.verify(token, "sec");
    const userId = decoded.id;

    const newComment = new comment({
      postId,
      userId,
      message,
    });
    await newComment.save();
    console.log("New comment saved:", newComment);
    res.redirect(`/comments/${postId}`); // redirect back to comments page
  } catch (error) {
    console.error("Error saving comment:", error);
    res.status(500).send("Failed to save comment");
  }
});

// GET route to view comments — NO login required (allow indexing)
app.get("/comments/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const token = req.cookies.User;

    // Decode token if present, to detect login
    let userLoggedIn = false;
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, "sec");
        userLoggedIn = true;
        userId = decoded.id;
      } catch {
        userLoggedIn = false;
      }
    }

    const post = await Post.findById(postId).populate("userId", "name");
    if (!post) return res.redirect("/error");

    const comments = await comment.find({ postId }).populate("userId", "name");

    // Render with info about login status
    res.render("comments", { postId, post, comments, userLoggedIn });
  } catch (err) {
    console.error(err);
    res.render("error");
  }
});

app.post("/comments/:id/like", async (req, res) => {
  try {
    const userId = req.cookies.User;
    const postId = req.params.id;
    const post = await Post.findById(postId);
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
    res.redirect(`/comments/${postId}`);
  } catch (err) {
    console.log(`An error has occured. `);
  }
});
app.post("/comments/:id/dislike", async (req, res) => {
  const userId = req.cookies.User;
  const postId = req.params.id;
  const post = await Post.findById(postId);
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
  res.redirect(`/comments/${postId}`);
});
app.post("/comments/:postId/comment", async (req, res) => {
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
    res.redirect("/comments/:id"); // Redirect back to the comment page
  } catch (error) {
    console.error("Error saving comment:", error);
    res.status(500).send("Failed to save comment");
  }
});
app.post("/search", async (req, res) => {
  const query = req.body.search;
  if (!query || query.trim() === "") {
    console.log("An error has occurred during the search");
    return res.render("error");
  }
  const queryTrim = query.trim();
  const criteria = { message: { $regex: queryTrim, $options: "i" } };
  try {
    const results = await Post.find(criteria);
    res.render("searchResults", { results, query: queryTrim, PORT });
  } catch (error) {
    console.error("Search error:", error);
    res.render("error");
  }
});

app.post("/signout", (req, res) => {
  res.clearCookie("User"); // if you’re using cookies
  return res.redirect("/signin");
});
const CLIENT_ID =
  "600799383994-cjf72o81blr1qc34nsgg4hru01m1jbsb.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

app.post("/api/auth/google", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log(payload);

    // TODO: Find or create user in your DB

    res.json({ success: true, user: payload });
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});
app.use((req, res) => {
  res.render("error");
});
http.listen(PORT, "0.0.0.0", () => {
  console.log(`PORT IS RUNNING ON PORT ${PORT}`);
});
