const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/submit", (req, res) => {
  const { name, email } = req.body;

  // Read existing JSON file
  const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));

  // Add new submission
  data.push({ name, email, submittedAt: new Date() });

  // Write back to JSON file
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));

  res.json({ message: "Submitted successfully!" });
});

app.listen(5000, () => console.log("Server running on port 5000"));
