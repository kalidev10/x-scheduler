import { TwitterApi } from 'twitter-api-v2';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    return res.status(200).json(authLink);
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Failed to generate auth link' });
  }
}
