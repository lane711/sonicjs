interface Env {
  SEEN_POSTS: KVNamespace;
  RESEND_API_KEY: string;
  NOTIFICATION_EMAIL: string;
  KEYWORDS: string;
  SUBREDDITS: string;
}

interface RedditPost {
  title: string;
  url: string;
  subreddit: string;
  author: string;
  score: number;
  numComments: number;
  created: number;
  selftext: string;
}

interface RedditApiResponse {
  data: {
    children: Array<{
      data: {
        id: string;
        title: string;
        permalink: string;
        subreddit: string;
        author: string;
        score: number;
        num_comments: number;
        created_utc: number;
        selftext: string;
      };
    }>;
  };
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log("Starting Reddit monitor...");

    const keywords = env.KEYWORDS.split(",").map((k) => k.trim().toLowerCase());
    const subreddits = env.SUBREDDITS.split(",").map((s) => s.trim());

    const relevantPosts: RedditPost[] = [];

    for (const subreddit of subreddits) {
      try {
        const posts = await fetchSubredditPosts(subreddit);
        const filtered = await filterRelevantPosts(posts, keywords, env);
        relevantPosts.push(...filtered);
      } catch (error) {
        console.error(`Error fetching r/${subreddit}:`, error);
      }
    }

    if (relevantPosts.length > 0) {
      await sendEmailNotification(relevantPosts, env);
      // Mark posts as seen
      for (const post of relevantPosts) {
        await env.SEEN_POSTS.put(post.url, "1", {
          expirationTtl: 60 * 60 * 24 * 30, // 30 days
        });
      }
      console.log(`Found ${relevantPosts.length} new relevant posts`);
    } else {
      console.log("No new relevant posts found");
    }
  },

  // Also allow manual triggering via HTTP
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/__scheduled") {
      // Trigger scheduled handler manually
      await this.scheduled({} as ScheduledController, env, {} as ExecutionContext);
      return new Response("Manual trigger complete. Check logs.", {
        status: 200,
      });
    }

    if (url.pathname === "/test-email") {
      // Send a test email
      const testPosts: RedditPost[] = [
        {
          title: "Test: Looking for headless CMS recommendations",
          url: "https://reddit.com/r/webdev/test",
          subreddit: "webdev",
          author: "testuser",
          score: 10,
          numComments: 5,
          created: Date.now() / 1000,
          selftext: "This is a test post to verify email notifications are working.",
        },
      ];
      await sendEmailNotification(testPosts, env);
      return new Response("Test email sent!", { status: 200 });
    }

    return new Response(
      JSON.stringify({
        name: "SonicJS Reddit Monitor",
        endpoints: {
          "/__scheduled": "Manually trigger the monitor",
          "/test-email": "Send a test email notification",
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  },
};

async function fetchSubredditPosts(subreddit: string): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=50`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "SonicJS-Reddit-Monitor/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status}`);
  }

  const data: RedditApiResponse = await response.json();

  return data.data.children.map((child) => ({
    title: child.data.title,
    url: `https://reddit.com${child.data.permalink}`,
    subreddit: child.data.subreddit,
    author: child.data.author,
    score: child.data.score,
    numComments: child.data.num_comments,
    created: child.data.created_utc,
    selftext: child.data.selftext || "",
  }));
}

async function filterRelevantPosts(
  posts: RedditPost[],
  keywords: string[],
  env: Env
): Promise<RedditPost[]> {
  const relevant: RedditPost[] = [];

  for (const post of posts) {
    // Check if we've already seen this post
    const seen = await env.SEEN_POSTS.get(post.url);
    if (seen) continue;

    // Check if post is less than 24 hours old
    const ageHours = (Date.now() / 1000 - post.created) / 3600;
    if (ageHours > 24) continue;

    // Check if title or body contains any keywords
    const titleLower = post.title.toLowerCase();
    const textLower = post.selftext.toLowerCase();

    const matchesKeyword = keywords.some(
      (keyword) => titleLower.includes(keyword) || textLower.includes(keyword)
    );

    if (matchesKeyword) {
      relevant.push(post);
    }
  }

  return relevant;
}

async function sendEmailNotification(
  posts: RedditPost[],
  env: Env
): Promise<void> {
  const postList = posts
    .map(
      (post) => `
## ${post.title}

- **Subreddit:** r/${post.subreddit}
- **Author:** u/${post.author}
- **Score:** ${post.score} | **Comments:** ${post.numComments}
- **Link:** ${post.url}

${post.selftext ? `**Preview:** ${post.selftext.slice(0, 300)}${post.selftext.length > 300 ? "..." : ""}` : ""}

---`
    )
    .join("\n");

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px; }
    .post { background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #f97316; }
    .post h2 { margin: 0 0 8px 0; font-size: 16px; }
    .post h2 a { color: #1d4ed8; text-decoration: none; }
    .post h2 a:hover { text-decoration: underline; }
    .meta { color: #666; font-size: 13px; margin-bottom: 8px; }
    .preview { color: #444; font-size: 14px; line-height: 1.5; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <h1>🔥 SonicJS Reddit Opportunities</h1>
  <p>Found <strong>${posts.length}</strong> new relevant post${posts.length === 1 ? "" : "s"}:</p>

  ${posts
    .map(
      (post) => `
  <div class="post">
    <h2><a href="${post.url}">${escapeHtml(post.title)}</a></h2>
    <div class="meta">
      r/${post.subreddit} • u/${post.author} • Score: ${post.score} • ${post.numComments} comments
    </div>
    ${post.selftext ? `<div class="preview">${escapeHtml(post.selftext.slice(0, 300))}${post.selftext.length > 300 ? "..." : ""}</div>` : ""}
  </div>`
    )
    .join("")}

  <div class="footer">
    <p>This alert was sent by SonicJS Reddit Monitor</p>
    <p>Keywords monitored: headless CMS, Strapi alternative, Cloudflare Workers CMS, lightweight CMS, Node.js CMS</p>
  </div>
</body>
</html>
`;

  // Send via Resend API
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SonicJS Monitor <alerts@sonicjs.com>",
      to: [env.NOTIFICATION_EMAIL],
      subject: `🔥 ${posts.length} New Reddit Opportunit${posts.length === 1 ? "y" : "ies"} for SonicJS`,
      html: htmlContent,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  console.log("Email notification sent successfully");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
