import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({
    text: '',
    scheduleTime: ''
  });
  const [authData, setAuthData] = useState(null);

  useEffect(() => {
    // Check for auth data in URL (callback)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const oauthToken = params.get('oauth_token');
      const oauthVerifier = params.get('oauth_verifier');

      if (oauthToken && oauthVerifier) {
        // Store auth data
        setAuthData({ oauthToken, oauthVerifier });
        setIsAuthenticated(true);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // Load scheduled posts
    fetch('/api/schedule')
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  const handleAuth = async () => {
    const callbackUrl = `${window.location.origin}`;
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ callbackUrl }),
    });
    const authLink = await response.json();
    window.location.href = authLink.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authData) return;

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          accessToken: authData.oauthToken,
          accessSecret: authData.oauthVerifier
        }),
      });
      
      const newPost = await response.json();
      setPosts([...posts, newPost]);
      setFormData({ text: '', scheduleTime: '' });
    } catch (error) {
      console.error('Error scheduling post:', error);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>X Post Scheduler</title>
      </Head>

      <header>
        <h1>X Post Scheduler</h1>
        {!isAuthenticated ? (
          <button onClick={handleAuth}>Connect X Account</button>
        ) : (
          <p className="connected">Connected to X</p>
        )}
      </header>

      <main>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="text">Post Text</label>
            <textarea
              id="text"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              maxLength="280"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="scheduleTime">Schedule Time</label>
            <input
              type="datetime-local"
              id="scheduleTime"
              value={formData.scheduleTime}
              onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
              required
            />
          </div>

          <button type="submit" disabled={!isAuthenticated}>
            Schedule Post
          </button>
        </form>

        <div className="posts-list">
          <h2>Scheduled Posts</h2>
          {posts.length === 0 ? (
            <p>No posts scheduled yet</p>
          ) : (
            <ul>
              {posts.map((post) => (
                <li key={post.id}>
                  <p>{post.text}</p>
                  <p>Scheduled for: {new Date(post.scheduleTime).toLocaleString()}</p>
                  <p>Status: {post.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f8fa;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e1e8ed;
        }
        h1 {
          color: #1da1f2;
        }
        button {
          background-color: #1da1f2;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: bold;
        }
        button:hover {
          background-color: #1991db;
        }
        button:disabled {
          background-color: #aab8c2;
          cursor: not-allowed;
        }
        .connected {
          color: #17bf63;
          font-weight: bold;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        textarea, input[type="datetime-local"] {
          width: 100%;
          padding: 10px;
          border: 1px solid #e1e8ed;
          border-radius: 4px;
          font-size: 16px;
        }
        textarea {
          min-height: 100px;
          resize: vertical;
        }
        .posts-list {
          margin-top: 30px;
        }
        .posts-list h2 {
          margin-bottom: 15px;
          color: #1da1f2;
        }
        .posts-list ul {
          list-style: none;
        }
        .posts-list li {
          padding: 15px;
          border: 1px solid #e1e8ed;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        .posts-list p {
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
}