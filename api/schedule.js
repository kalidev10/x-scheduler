import { TwitterApi } from 'twitter-api-v2';
import { v4 as uuidv4 } from 'uuid';

const scheduledPosts = new Map();

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(Array.from(scheduledPosts.values()));
  }

  if (req.method === 'POST') {
    try {
      const { text, scheduleTime, accessToken, accessSecret } = req.body;
      
      if (!text || !scheduleTime) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const postId = uuidv4();
      scheduledPosts.set(postId, {
        id: postId,
        text,
        scheduleTime,
        scheduledAt: new Date().toISOString(),
        status: 'pending',
        accessToken,
        accessSecret
      });

      return res.status(201).json({ 
        id: postId,
        status: 'pending'
      });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
