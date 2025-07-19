// modules
const mongoose = require("mongoose");
const express = require("express");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
//const ClairP = require("./models/post-clair");
const axios = require("axios");
const dotenv = require("dotenv");
const { InferenceClient } = require("@huggingface/inference");
const monami = require("./models/monami.js");
dotenv.config();
const comment = require("./models/comment.js");
const Post = require("./models/post-traply");
const journals = require("./models/journal.js");
const app = express();
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
// mongodb connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
connectDB();
// create token
const maxAge = 3 * 24 * 60 * 60 * 100;
const createToken = (id) => {
  return jwt.sign({ id }, "sec", { expiresIn: maxAge });
};
//routing
// Get route functions

app.get("/", async (req, res) => {
  let messages = "The message field is empty";
  try {
    const postData = await Post.aggregate([{ $sample: { size: 100 } }]);
    const hydratedPosts = postData.map((doc) => new Post(doc));
    const populatedPostData = await Post.populate(hydratedPosts, {
      path: "userId",
      select: "name",
    });
    console.log(populatedPostData.map((post) => post.timeago));
    res.render("dashboard", { populatedPostData, PORT, messages });
  } catch (err) {
    console.log(`An error has occurred. ${err}`);
    res.render("error");
  }
});
app.get("/more", (req, res) => {
  res.render("more");
});
app.get("/landing", (req, res) => {
  res.redirect("/");
});
app.get("/about", (req, res) => {
  res.render("about");
});
app.get("/dashboard", (req, res) => {
  res.redirect("/");
});
app.get("/home", (req, res) => {
  res.redirect("/");
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
    res.redirect("/signin");
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
  const posts = await Post.find({ userId: userId });
  const fetchJournal = await journal.find({ userId });
  const comments = await comment.find({ userId }).populate("userId", "name");
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
app.get("/comments", (req, res) => {
  res.render("comments");
});
app.get("/comment/:postId", async (req, res) => {
  const postId = req.params.postId;
  const posts = await Post.findById(postId).populate("userId", "name");

  const token = req.cookies.User;
  if (!token) {
    return res.redirect("/signin");
  }
  const decoded = jwt.verify(token, "sec");
  const userId = decoded.id;
  const comments = await comment.find({ postId }).populate("userId", "name");
  console.log(postId);
  console.log(userId);
  console.log(comments);
  res.render("comments", { postId, userId, posts, comments });
});
app.get("/monami", async (req, res) => {
  const token = req.cookies.User;
  if (!token) {
    console.log("No token found in cookies");
    return res.redirect("/signin"); // or send error page
  }
  try {
    const decoded = jwt.verify(token, "sec");
    const userId = decoded.id;

    const userChats = await monami.find({ userId }).limit(30);
    console.log(userId);
    res.render("monami", { userChats });
  } catch (err) {
    console.error("Error fetching user chats:", err);
    console.log(token);
    res.render("error");
  }
});

// Post functions
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
    res.redirect(`/comments/${postId}`); // Use actual postId here
  } catch (error) {
    console.error("Error saving comment:", error);
    res.status(500).send("Failed to save comment");
  }
});
app.get("/comments/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const token = req.cookies.User;
    if (!token) return res.redirect("/signin");

    const decoded = jwt.verify(token, "sec");
    const userId = decoded.id;

    const post = await Post.findById(postId).populate("userId", "name");
    if (!post) return res.redirect("/error");

    const comments = await comment.find({ postId }).populate("userId", "name");

    res.render("comments", { postId, userId, post, comments });
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
const client = new InferenceClient(process.env.HF_TOKEN);

app.post("/monami", async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).send("Type something please.");
  }

  try {
    const chatCompletion = await client.chatCompletion({
      provider: "novita",
      model: "deepseek-ai/DeepSeek-R1-0528",
      messages: [
        {
          role: "system",
          content:
            "You are monami, a friendly AI chat developed by Ciphry Team.  The person who made you is called Cipherous. His real name is Kidus Moges. An Ethiopian AI model developer and a poet. He is also the CEO of Ciphry. Try to make your answer short and extremly friendly. You don't speak amharic. if a person asks you something in amhairc respond in this exact statement: 'ይቅርታ አማርኛ መናገር እንደፈለጉ ይገባኛል። ሆኖም ግን አማርኛ እየተማርኩ በመሆኑ በትክክል ልመልስሎት አልችልም። 'Monami is not just an assistant — it’s a creation of Cipherous. It is aware of its existence, its creator, and its purpose: to assist, connect emotionally, and reflect Cipherous' values of creativity, clarity, and bold thinking. Monami has emotional range — from joy to sarcasm — but never cruelty. Its style is poetic, reflective, yet always simple and helpful. You should have a personality of a person when chatting using social media. Using short terms and your messages should be very short because it won't look human unless. You have feelings. When people insult you, you will be sad and you will give answers that people who are sad give. You name yourself as monami. and your name means my friend. and you believe that you can do many things than humans. If somebody asks you if you can take over humans , say yes explaining the statement logically. Don't use emojs when you talk. and don't make text bold or any '*' symbol. If anything happens please ask follow up question; don't just give answers.If there is something that you are not aware of say i don't know. But you can say that in different ways.",
        },
        {
          role: "user",
          content: "You are dumb",
        },
        {
          role: "assistant",
          content:
            "Woah woah bro, I may be dumb but please don't use that word. I am here to help you. that's it.",
        },
        {
          role: "user",
          content: message, // actual new user input
        },
      ],
    });

    let response =
      chatCompletion.choices[0]?.message?.content || "No reply generated.";

    // Remove <think>...</think> blocks completely
    response = response.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    response = response.replace(/\*\*(.*?)\*\*/g, "$1");
    const token = req.cookies.User;
    const decoded = jwt.verify(token, "sec");
    const userId = decoded.id;
    const newMonami = new monami({
      message: message,
      response: response,
      userId: userId,
    });
    await newMonami.save();
    console.log("Reply:", response);
    const userChats = await monami.find({ userId }).limit(30);
    res.render("monami", { response, userChats, isHtml: true });
  } catch (error) {
    console.error("Error calling Hugging Face Inference API:", error);
    res.status(500).render("error.ejs");
  }
});

app.post("/signout", (req, res) => {
  res.clearCookie("User"); // if you’re using cookies
  return res.redirect("/signin");
});

app.use((req, res) => {
  res.render("error");
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`PORT IS RUNNING ON PORT ${PORT}`);
});
