import { TwitterApi } from 'twitter-api-v2';

// This would be replaced with a database in production
const scheduledPosts = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify this is coming from your cron job
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const now = new Date();
    const postsToSend = Array.from(scheduledPosts.values())
      .filter(post => new Date(post.scheduleTime) <= now && post.status === 'pending');

    for (const post of postsToSend) {
      try {
        const userClient = new TwitterApi({
          appKey: process.env.X_CLIENT_ID,
          appSecret: process.env.X_CLIENT_SECRET,
          accessToken: post.accessToken,
          accessSecret: post.accessSecret,
        });

        await userClient.v2.tweet(post.text);
        post.status = 'posted';
        scheduledPosts.set(post.id, post);
      } catch (error) {
        console.error(`Failed to post ${post.id}:`, error);
        post.status = 'failed';
        scheduledPosts.set(post.id, post);
      }
    }

    res.status(200).json({ processed: postsToSend.length });
  } catch (error) {
    console.error('Cron error:', error);
    res.status(500).json({ error: 'Failed to process scheduled posts' });
  }
}