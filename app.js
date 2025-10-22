const express = require("express");
const path = require("path");
const app = express();

// Serve static files from the React build
app.use(express.static(path.join(__dirname, "build")));

// Handle all GET requests and send back React's index.html
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Set the port (Render sets process.env.PORT automatically)
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
