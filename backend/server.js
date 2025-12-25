const express = require("express");
const app = express();
const PORT = 3000;

// OpenAI configuration
const openaiClient = require("./config/openai");

const contentRoutes = require("./routes/contentRoutes");

app.use(express.json());
app.use("/api/content", contentRoutes);

app.get("/", (req, res) => {
  res.send("AI Content Generator Backend is Running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
