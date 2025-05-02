import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { text, accessToken, accessSecret } = req.body;
      
      const userClient = new TwitterApi({
        appKey: process.env.X_CLIENT_ID,
        appSecret: process.env.X_CLIENT_SECRET,
        accessToken,
        accessSecret,
      });

      const { data } = await userClient.v2.tweet(text);
      
      res.status(200).json(data);
    } catch (error) {
      console.error('Post error:', error);
      res.status(500).json({ error: 'Failed to post tweet' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}