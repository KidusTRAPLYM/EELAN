// modules
const mongoose = require("mongoose");
const express = require("express");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
//const ClairP = require("./models/post-clair");
const comment = require("./models/comment.js");
const Post = require("./models/post-traply");
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
    const postData = await Post.aggregate([{ $sample: { size: 100 } }]);
    const hydratedPosts = postData.map((doc) => new Post(doc));
    const populatedPostData = await Post.populate(hydratedPosts, {
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
  const posts = await Post.find({ userId: userId });
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
  const posts = await Post.find({ userId: userId });
  const populatedPosts = await Post.populate(posts, {
    path: "likedBy",
    select: "name",
  });
  const notifications = populatedPosts.map((post) => {
    const likedUserNames = post.likedBy.map((user) => user.name);
    return {
      postTitle: post.message,
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
app.get("/search", (req, res) => {
  res.render("search");
});
// Post functions

app.post("/post", async (req, res) => {
  const { message } = req.body;
  try {
    const token = req.cookies.User;
    const decoded = jwt.verify(token, "sec");
    const userId = decoded.id;
    const newPost = new Post({
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
    const post = await Post.findById(postId);
    res.redirect("/dashboard", { userId, post });
  } catch (err) {
    console.log(`An error has occured: ${err}`);
  }
});
app.post("/dashboard/:id/like", async (req, res) => {
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
    res.redirect("/dashboard");
  } catch (err) {
    console.log(`An error has occured. `);
  }
});
app.post("/dashboard/:id/dislike", async (req, res) => {
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
app.post("/monami", async (req, res) => {
  try {
    const { message } = req.body;
    const greetings = [
      // Formal & Polite
      "Hello",
      "Good morning",
      "Good afternoon",
      "Good evening",
      "Greetings",
      "How do you do?",
      // Casual & Friendly
      "Hi",
      "Hey",
      "What’s up?",
      "How’s it going?",
      "How are you?",
      "Howdy",
      "Yo",
      "Hiya",
      // Slang & Playful
      "What’s good?",
      "‘Ello",
      "Hey there",
      "Oi",
      "Wassup?",
      "Heya",
      "Yo yo yo",
      // Over Text or Online
      "Heyyy",
      "Hiya",
      "Sup",
      "Hola",
      "👋",
    ];

    const farewells = [
      "Goodbye",
      "Farewell",
      "Take care",
      "Have a great day/night",
      "It was nice meeting you",
      "Until next time",
      "I wish you well",
      "Bye",
      "Bye-bye",
      "See you later",
      "See ya",
      "Later",
      "Catch you later",
      "Take it easy",
      "Have a good one",
      "Peace out",
      "Later, alligator",
      "Toodles",
      "Adios",
      "Smell ya later",
      "Cheerio",
      "GTG",
      "TTYL",
      "BRB",
      "Cya",
      "👋",
    ];

    const words = {
      cussingWords: [
        "arse",
        "arsehead",
        "arsehole",
        "ass",
        "ass hole",
        "asshole",
        "bastard",
        "bitch",
        "bloody",
        "bollocks",
        "brotherfucker",
        "bugger",
        "bullshit",
        "child-fucker",
        "Christ on a bike",
        "Christ on a cracker",
        "cock",
        "cocksucker",
        "crap",
        "cunt",
        "dammit",
        "damn",
        "damned",
        "damn it",
        "dick",
        "dick-head",
        "dickhead",
        "dumb ass",
        "dumb-ass",
        "dumbass",
        "dyke",
        "fag",
        "faggot",
        "father-fucker",
        "fatherfucker",
        "fuck",
        "fucked",
        "fucker",
        "fucking",
        "god dammit",
        "goddammit",
        "God damn",
        "god damn",
        "goddamn",
        "Goddamn",
        "goddamned",
        "goddamnit",
        "godsdamn",
        "hell",
        "holy shit",
        "horseshit",
        "in shit",
        "jackarse",
        "jack-ass",
        "jackass",
        "Jesus Christ",
        "Jesus fuck",
        "Jesus Harold Christ",
        "Jesus H. Christ",
        "Jesus, Mary and Joseph",
        "Jesus wept",
        "kike",
        "mental",
        "mother fucker",
        "mother-fucker",
        "motherfucker",
        "nigga",
        "nigra",
        "pigfucker",
        "piss",
        "prick",
        "pussy",
        "shit",
        "shit ass",
        "shite",
        "sibling fucker",
        "sisterfuck",
        "sisterfucker",
        "slut",
        "son of a bitch",
        "son of a whore",
        "spastic",
        "sweet Jesus",
        "tranny",
        "twat",
        "wanker",
      ],
      happiness: [
        "happy",
        "joy",
        "joyful",
        "cheerful",
        "excited",
        "fun",
        "great",
        "awesome",
        "fantastic",
        "amazing",
        "wonderful",
        "nice",
      ],
      love: [
        "love",
        "like",
        "admire",
        "appreciate",
        "kind",
        "caring",
        "affectionate",
        "sweet",
        "beautiful",
        "handsome",
        "adorable",
      ],
      success: [
        "strong",
        "powerful",
        "confident",
        "determined",
        "winner",
        "champion",
        "brilliant",
        "successful",
        "proud",
        "motivated",
      ],
      peace: [
        "relaxed",
        "calm",
        "peaceful",
        "satisfied",
        "content",
        "relieved",
        "grateful",
        "thankful",
        "safe",
        "secure",
      ],
      anger: [
        "hate",
        "mad",
        "angry",
        "furious",
        "annoyed",
        "irritated",
        "frustrated",
        "stupid",
        "idiot",
        "pathetic",
        "horrible",
      ],
      sadness: [
        "sad",
        "crying",
        "depressed",
        "heartbroken",
        "disappointed",
        "miserable",
        "lonely",
        "abandoned",
        "ignored",
        "empty",
      ],
      fear: [
        "scared",
        "afraid",
        "worried",
        "nervous",
        "anxious",
        "panic",
        "shaky",
        "terrified",
        "insecure",
        "uncertain",
      ],
      failure: [
        "loser",
        "failure",
        "worthless",
        "broken",
        "weak",
        "tired",
        "exhausted",
        "drained",
        "useless",
        "pointless",
      ],
      anxiety: [
        "overthinking",
        "nervous",
        "panicking",
        "restless",
        "insomnia",
        "doubtful",
        "heartbeat",
        "racing",
        "paranoid",
      ],
      depression: [
        "empty",
        "numb",
        "nothing matters",
        "meaningless",
        "hopeless",
        "crying",
        "isolated",
        "suicidal",
      ],
      stress: [
        "overwhelmed",
        "burnout",
        "can't handle",
        "pressure",
        "breaking down",
        "drowning",
        "fed up",
      ],
      insults: [
        "idiot",
        "dumb",
        "stupid",
        "ugly",
        "useless",
        "failure",
        "pathetic",
        "annoying",
        "disgusting",
        "horrible",
        "coward",
        "insulted",
        "insult",
      ],
    };

    let response = "This is response";
    const normalizedMessage = message.trim().toLowerCase(); // Normalize the message

    if (normalizedMessage === "") {
      response = "Type something please.";
    } else if (
      farewells.some((greet) => normalizedMessage.includes(greet.toLowerCase()))
    ) {
      response = "Alright, take care. I hope I will see you soon.";
    } else if (
      words.happiness.some((word) => normalizedMessage.includes(word))
    ) {
      response =
        "Time flies, so just stay happy. No matter the situation you're in, choose happiness. Other feelings will wage wars against you—fear, doubt, sadness—but don’t give them power. The past is gone, the future is uncertain, but this moment? It’s yours. Smile, move forward, and own it. Because at the end of the day, happiness isn’t about having a perfect life—it’s about making the best of what you have.";
    } else if (words.love.some((word) => normalizedMessage.includes(word))) {
      response =
        "Love isn’t just a feeling—it’s a choice, a commitment, a fire that needs to be fed. It’s not about perfect people, but about imperfect souls choosing each other every day. Love will test you, break you, heal you, and shape you. It’s not always easy, but the right love is worth every moment. So cherish the ones who truly care, let go of those who don’t, and never beg for love—real love finds its way.";
    } else if (words.success.some((word) => normalizedMessage.includes(word))) {
      response =
        "Success isn’t luck—it’s discipline, sacrifice, and resilience. It’s waking up when you’re tired, pushing forward when you feel like giving up, and staying focused when distractions call your name. The road won’t be easy. You’ll fail, struggle, and question yourself. But remember, every setback is a lesson, every challenge is a test. Keep moving, keep learning, keep grinding. Because in the end, success belongs to those who refuse to stop.";
    } else if (words.peace.some((word) => normalizedMessage.includes(word))) {
      response =
        "Peace isn’t found in the absence of chaos—it’s built within, even when the world is falling apart. It’s knowing that not everything deserves your reaction, that silence can be more powerful than words. True peace comes when you stop chasing what’s not meant for you, when you let go of what you can’t control, and when you choose to protect your energy. Breathe, slow down, and embrace the stillness. Because in the end, peace isn’t given—it’s created.";
    } else if (words.anger.some((word) => normalizedMessage.includes(word))) {
      response =
        "Anger is a fire—it can either burn everything around you or fuel you to build something greater. But if you let it control you, it will consume you. Breathe before you react, think before you speak. Not everything deserves your rage, and not everyone is worth your energy. Strength isn’t in how loud you shout, but in how well you control the storm inside. Master your anger, or it will master you.";
    } else if (words.sadness.some((word) => normalizedMessage.includes(word))) {
      response =
        "Sadness is heavy, but you don’t have to carry it alone. Let it out, cry if you need to, but don’t let it drown you. Pain is temporary, and even the darkest nights end with sunrise. Keep moving forward, even if it’s slow—because every step away from sadness is a step toward healing.";
    } else if (words.fear.some((word) => normalizedMessage.includes(word))) {
      response =
        "Fear is a liar. It whispers doubts, creates walls, and keeps you from realizing your true strength. But fear only wins if you stop moving. Face it, challenge it, and prove it wrong. Because courage isn’t the absence of fear—it’s acting in spite of it.";
    } else if (words.failure.some((word) => normalizedMessage.includes(word))) {
      response =
        "Failure isn’t the end—it’s the beginning of something better. Every great success story is built on lessons from failure. Learn, adapt, and keep pushing forward. The only real failure is giving up. Keep going, because your comeback will be stronger than your setback.";
    } else if (words.anxiety.some((word) => normalizedMessage.includes(word))) {
      response =
        "Anxiety is loud—it makes you overthink, doubt yourself, and fear things that haven’t even happened. But you are stronger than your thoughts. Breathe, slow down, and focus on now. The future will come, but right now, you are here. And right now, you are okay.";
    } else if (
      words.depression.some((word) => normalizedMessage.includes(word))
    ) {
      response =
        "Depression tells you that nothing matters, that no one understands—but that’s not true. You are not alone, and this feeling is not permanent. Small steps, small victories, even just getting through the day—it all matters. Reach out, hold on, and remember: even in darkness, light still exists.";
    } else if (words.stress.some((word) => normalizedMessage.includes(word))) {
      response =
        "Stress will drain you if you let it. Not everything is urgent, not everything is worth your mental peace. Take a break, step back, and breathe. Your mind needs rest just as much as your body does. Handle things one at a time, and remember—you’ve overcome worse.";
    } else if (words.insults.some((word) => normalizedMessage.includes(word))) {
      response =
        "Words can cut deep, but only if you let them. People will throw insults, judge you, and try to break you—but their words don’t define you. Strength isn’t in fighting back; it’s in knowing your worth and refusing to be dragged down. Let their hate be noise, not truth. Rise above, prove them wrong, and walk away with your head high. The best revenge? Success and silence.";
    } else if (
      greetings.some((greet) => normalizedMessage.includes(greet.toLowerCase()))
    ) {
      response = "Hey there! Anything bothering you? Please talk to me.";
    } else if (
      words.cussingWords.some((word) => normalizedMessage.includes(word))
    ) {
      response =
        "I sense some frustration. If something’s on your mind, feel free to share. Let’s keep the conversation respectful.";
    } else {
      response =
        "Yeah..." || "Sorry I didn't catch that!" || "Sure..." || "Huh";
    }

    console.log(response);
    res.render("monamianswer", { response });
  } catch (err) {
    console.log(`An error has occurred. ${err}`);
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
