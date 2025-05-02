import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { callbackUrl } = req.body;
    
    const client = new TwitterApi({
      appKey: process.env.X_CLIENT_ID,
      appSecret: process.env.X_CLIENT_SECRET,
    });

    const authLink = await client.generateAuthLink(callbackUrl, { 
      linkMode: 'authorize',
      scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'] 
    });

    res.status(200).json(authLink);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Failed to generate auth link' });
  }
}