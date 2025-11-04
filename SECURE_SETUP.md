# 🔐 Secure Setup Guide - Keeping Your TripIt URL Private

This guide shows you how to deploy your worker WITHOUT exposing your private TripIt feed URL in your code.

## Why This Matters

Your TripIt feed URL contains a private key. If you:
- Push code to a **public** GitHub repository
- Share your code with others
- Want to follow security best practices

You should use Cloudflare's environment variables/secrets instead of hardcoding the URL.

## 🎯 Three Methods (Choose One)

### Method 1: Cloudflare Dashboard + Secrets (Easiest, Most Secure)

This is the recommended approach for public repositories.

#### Step 1: Update Your Worker Code

Replace the `TRIPIT_FEED_URL` line in `tripit-emoji-worker.js`:

**OLD CODE:**
```javascript
const TRIPIT_FEED_URL = 'YOUR-TRIPIT-FEED-URL-HERE';
```

**NEW CODE:**
```javascript
const TRIPIT_FEED_URL = env.TRIPIT_FEED_URL;
```

And update the `fetch` function signature:

**OLD CODE:**
```javascript
export default {
  async fetch(request, env, ctx) {
```

**NEW CODE:**
```javascript
export default {
  async fetch(request, env, ctx) {
    // env.TRIPIT_FEED_URL is now available here
```

#### Step 2: Deploy to Cloudflare

1. Go to https://dash.cloudflare.com
2. Click "Workers & Pages" → "Create Application" → "Create Worker"
3. Name it `tripit-emoji`
4. Click "Deploy"
5. Click "Edit Code"
6. Paste your updated code
7. Click "Save and Deploy"

#### Step 3: Add Your Secret URL

1. In your worker page, click "Settings"
2. Click "Variables and Secrets"
3. Under "Environment Variables", click "Add variable"
4. Set:
   - **Variable name:** `TRIPIT_FEED_URL`
   - **Value:** `https://www.tripit.com/feed/ical/private/F96956AA-891DC53920F781407FF685FEA4E947C0/tripit.ics`
   - **Type:** Choose "Encrypt" for extra security (recommended)
5. Click "Deploy"

#### Step 4: Verify It Works

Visit your worker URL in a browser - you should see the ICS calendar data with emojis!

✅ **Benefits:**
- Your URL is NOT in your code
- Safe to push to public GitHub
- Easy to update the URL later
- Encrypted in Cloudflare's dashboard

---

### Method 2: Wrangler CLI + Secrets (For Command Line Users)

If you prefer deploying via command line, use Wrangler secrets.

#### Step 1: Update Your Worker Code

Same as Method 1 - use `env.TRIPIT_FEED_URL` instead of a hardcoded URL.

#### Step 2: Set the Secret

```bash
# Navigate to your project directory
cd tripit-emoji-worker

# Set the secret (you'll be prompted to paste the value)
wrangler secret put TRIPIT_FEED_URL
```

When prompted, paste your TripIt URL:
```
https://www.tripit.com/feed/ical/private/F96956AA-891DC53920F781407FF685FEA4E947C0/tripit.ics
```

#### Step 3: Deploy

```bash
wrangler deploy
```

✅ **Benefits:**
- Secrets are encrypted
- Not stored in your code or Git
- Professional approach

---

### Method 3: .dev.vars for Local Development (Local Testing Only)

Use this for local testing. **DO NOT commit this file to Git!**

#### Step 1: Create .dev.vars File

In your project root, create a file named `.dev.vars`:

```bash
TRIPIT_FEED_URL=https://www.tripit.com/feed/ical/private/F96956AA-891DC53920F781407FF685FEA4E947C0/tripit.ics
```

#### Step 2: Update .gitignore

Make sure `.dev.vars` is in your `.gitignore` (it already is!):

```
.dev.vars
```

#### Step 3: Update Your Code

Same as Method 1 - use `env.TRIPIT_FEED_URL`.

#### Step 4: Test Locally

```bash
wrangler dev
```

Your local worker will use the URL from `.dev.vars`.

#### Step 5: Deploy with Method 1 or 2

For production, use Method 1 (Dashboard) or Method 2 (CLI secrets).

⚠️ **Important:** `.dev.vars` is ONLY for local development. Never commit it to Git!

---

## 🔄 Updated Worker Code

Here's the complete updated `tripit-emoji-worker.js` using environment variables:

```javascript
/**
 * Cloudflare Worker to add emojis to TripIt calendar events
 * 
 * This worker fetches a TripIt ICS feed, identifies event types,
 * and prepends appropriate emojis to event summaries.
 * 
 * Required environment variable:
 * - TRIPIT_FEED_URL: Your private TripIt ICS feed URL
 */

// Emoji mappings
const EMOJIS = {
  FLIGHT: '✈️',
  HOTEL: '🛎️',
  CAR_RENTAL: '🚘',
  PARKING: '🚙'
};

/**
 * Determines the event type based on summary and description
 */
function getEventType(summary, description) {
  const summaryLower = summary.toLowerCase();
  const descriptionLower = description.toLowerCase();
  
  // Check for parking first (most specific)
  if (summaryLower.includes('parking') || descriptionLower.includes('[parking]')) {
    return 'PARKING';
  }
  
  // Check for car rental
  if (summaryLower.includes('rental car') || 
      summaryLower.includes('pick up rental') || 
      summaryLower.includes('drop off rental') ||
      descriptionLower.includes('[car rental]')) {
    return 'CAR_RENTAL';
  }
  
  // Check for hotel/lodging
  if (summaryLower.includes('check-in:') || 
      summaryLower.includes('check-out:') ||
      descriptionLower.includes('[lodging]')) {
    return 'HOTEL';
  }
  
  // Check for flights - look for flight patterns
  if (descriptionLower.includes('[flight]') || 
      /\b[A-Z]{2,3}\d{2,4}\b/.test(summary) || // Flight numbers like DL738
      (summaryLower.includes(' to ') && /\b[A-Z]{3}\b/.test(summary))) { // Airport codes
    return 'FLIGHT';
  }
  
  return null;
}

/**
 * Adds emoji to the beginning of a SUMMARY line
 */
function addEmojiToSummary(line, emoji) {
  const match = line.match(/^SUMMARY:(.*)$/);
  if (match) {
    const originalSummary = match[1];
    if (!originalSummary.startsWith(emoji)) {
      return `SUMMARY:${emoji} ${originalSummary}`;
    }
  }
  return line;
}

/**
 * Processes the ICS content and adds emojis
 */
function processICS(icsContent) {
  const lines = icsContent.split(/\r?\n/);
  const processedLines = [];
  
  let inEvent = false;
  let currentSummary = null;
  let currentDescription = '';
  let eventType = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentSummary = null;
      currentDescription = '';
      eventType = null;
      processedLines.push(line);
      continue;
    }
    
    if (line === 'END:VEVENT') {
      inEvent = false;
      processedLines.push(line);
      continue;
    }
    
    if (inEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentSummary = line;
      }
      
      if (line.startsWith('DESCRIPTION:')) {
        currentDescription = line.substring(12);
      } else if (currentDescription && line.startsWith(' ')) {
        currentDescription += line.substring(1);
      }
      
      if (line.startsWith('SUMMARY:')) {
        continue;
      }
      
      if (currentSummary && (line.startsWith('LOCATION:') || line.startsWith('UID:') || line.startsWith('DTSTART'))) {
        const summaryText = currentSummary.substring(8);
        eventType = getEventType(summaryText, currentDescription);
        
        if (eventType && EMOJIS[eventType]) {
          processedLines.push(addEmojiToSummary(currentSummary, EMOJIS[eventType]));
        } else {
          processedLines.push(currentSummary);
        }
        
        currentSummary = null;
      }
    }
    
    processedLines.push(line);
  }
  
  return processedLines.join('\r\n');
}

/**
 * Main worker handler
 */
export default {
  async fetch(request, env, ctx) {
    try {
      // Get TripIt feed URL from environment variable
      const TRIPIT_FEED_URL = env.TRIPIT_FEED_URL;
      
      if (!TRIPIT_FEED_URL) {
        return new Response('Error: TRIPIT_FEED_URL environment variable not set. Please add it in the Cloudflare dashboard under Settings > Variables and Secrets.', {
          status: 500,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Fetch the original TripIt ICS feed
      const response = await fetch(TRIPIT_FEED_URL);
      
      if (!response.ok) {
        return new Response(`Failed to fetch TripIt feed: ${response.status}`, {
          status: 502,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      const icsContent = await response.text();
      
      // Process the ICS content to add emojis
      const modifiedICS = processICS(icsContent);
      
      // Return the modified ICS feed
      return new Response(modifiedICS, {
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Cache-Control': 'public, max-age=900', // Cache for 15 minutes
          'Access-Control-Allow-Origin': '*'
        }
      });
      
    } catch (error) {
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};
```

## 🔍 Key Changes Explained

1. **Removed hardcoded URL:**
   ```javascript
   // OLD: const TRIPIT_FEED_URL = 'https://...';
   // NEW: const TRIPIT_FEED_URL = env.TRIPIT_FEED_URL;
   ```

2. **Added validation:**
   ```javascript
   if (!TRIPIT_FEED_URL) {
     return new Response('Error: TRIPIT_FEED_URL not set...', {...});
   }
   ```

3. **Now reads from environment:**
   - Cloudflare dashboard: Settings > Variables and Secrets
   - Or Wrangler: `wrangler secret put TRIPIT_FEED_URL`

## 📋 Comparison: Which Method?

| Method | Best For | Pros | Cons |
|--------|----------|------|------|
| **Dashboard Secrets** | Most users, public repos | Easy, secure, no CLI needed | Need to use dashboard |
| **Wrangler Secrets** | CLI users, automation | Professional, scriptable | Requires Wrangler install |
| **.dev.vars** | Local testing only | Quick for development | NOT for production |

## ✅ Recommended Setup

1. **For Development:**
   - Use `.dev.vars` file (keep it local, don't commit)
   - Test with `wrangler dev`

2. **For Production:**
   - Use Dashboard Secrets (Method 1) - easiest
   - OR Wrangler Secrets (Method 2) - more professional

3. **For GitHub:**
   - Use the environment variable version of the code
   - Safe to push to public repository
   - Add setup instructions in README

## 🚀 Quick Start with Secure Method

1. **Update your code** to use `env.TRIPIT_FEED_URL`
2. **Deploy to Cloudflare** (dashboard or CLI)
3. **Add the secret** via dashboard or `wrangler secret put`
4. **Test** by visiting your worker URL
5. **Push to GitHub** - your URL stays private! ✅

## 🆘 Troubleshooting

**"TRIPIT_FEED_URL environment variable not set" error:**
- Make sure you added the variable in Cloudflare dashboard
- Or ran `wrangler secret put TRIPIT_FEED_URL`
- Click "Deploy" after adding variables in the dashboard

**Local testing not working:**
- Create `.dev.vars` file with your URL
- Make sure it's in the same directory as `wrangler.toml`
- Verify `.dev.vars` is in `.gitignore`

**Variable not updating:**
- After changing variables in dashboard, click "Deploy"
- For Wrangler secrets, run `wrangler deploy` again

---

**Bottom Line:** Use environment variables/secrets for production, and your private URL stays completely separate from your code. Safe to share, safe to open source! 🔒✅
