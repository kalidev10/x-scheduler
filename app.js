require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { TwitterApi } = require('twitter-api-v2');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Twitter client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// Routes
app.post('/api/schedule-post', async (req, res) => {
  try {
    const { text, scheduleTime } = req.body;
    
    // For simplicity, we'll just post immediately in this example
    // In a real app, you'd use a scheduler like node-schedule
    const tweet = await twitterClient.v2.tweet(text);
    
    res.json({
      success: true,
      message: 'Post scheduled successfully',
      tweetId: tweet.data.id,
      scheduledTime: scheduleTime
    });
  } catch (error) {
    console.error('Error posting to X:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to schedule post'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});