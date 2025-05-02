import { TwitterApi } from 'twitter-api-v2';
import { v4 as uuidv4 } from 'uuid';

// In-memory store (replace with database in production)
const scheduledPosts = new Map();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { text, scheduleTime, accessToken, accessSecret } = req.body;
      
      if (!text || !scheduleTime) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const postId = uuidv4();
      const scheduledAt = new Date().toISOString();
      
      scheduledPosts.set(postId, {
        id: postId,
        text,
        scheduleTime,
        scheduledAt,
        status: 'pending',
        accessToken,
        accessSecret
      });

      res.status(201).json({ 
        id: postId,
        scheduledAt,
        status: 'pending'
      });

    } catch (error) {
      console.error('Schedule error:', error);
      res.status(500).json({ error: 'Failed to schedule post' });
    }
  } else if (req.method === 'GET') {
    res.status(200).json(Array.from(scheduledPosts.values()));
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}