# TripIt Calendar Emoji Enhancer ✈️🛎️🚘

A Cloudflare Worker that adds visual emojis to your TripIt calendar feed, making it easier to distinguish between flights, hotels, car rentals, trains, and parking at a glance.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Cloudflare Workers](https://img.shields.io/badge/cloudflare-workers-orange.svg)

## Table of Contents

- [Features](#-features)
- [Before & After](#-before--after)
- [Quick Start](#-quick-start)
- [Setup Instructions](#-setup-instructions)
- [Using Your Calendar Feed](#-using-your-calendar-feed)
- [Customization](#-customization)
- [Security & Privacy](#-security--privacy)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- ✈️ **Flights** - Special formatting: "EWR→ATL • DL2353"
- 🚆 **Trains** - Amtrak and rail travel marked with train emoji
- 🛎️ **Hotels** - Check-ins and check-outs marked with bell emoji
- 🚘 **Car Rentals** - Pickup and drop-off events marked with car emoji
- 🚙 **Parking** - Airport parking events marked with parking emoji
- 🔒 **Secure** - Optional token-based URL protection
- 🔄 **Real-time** - Updates propagate within 15 minutes
- 💰 **Free** - Runs on Cloudflare's generous free tier (100k requests/day)
- 🌍 **Global** - Edge caching for fast response times worldwide

## 📋 Before & After

**Before:**

```text
DL2353 EWR to ATL
Amtrak - New York, NY to Boston, MA
Check-in: Hilton Garden Inn
Pick Up Rental Car: National
```

**After:**

```text
✈️ EWR→ATL • DL2353
🚆 Amtrak - New York, NY to Boston, MA
🛎️ Check-in: Hilton Garden Inn
🚘 Pick Up Rental Car: National
```

## 🚀 Quick Start

### What You Need

- A Cloudflare account (free tier works great - [sign up here](https://dash.cloudflare.com/sign-up))
- Your TripIt private calendar feed URL ([get it from TripIt](https://www.tripit.com) → Account Settings → Calendar Feeds)
- 10 minutes

## 📦 Setup Instructions

This worker uses Cloudflare environment variables to keep your private TripIt URL and security token separate from your code. Choose your preferred deployment method below.

### Option A: Cloudflare Dashboard (Easiest)

**Step 1: Create the Worker**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) (sign up for free if needed)
2. Click "Workers & Pages" → "Create Application" → "Create Worker"
3. Name it `tripit-emoji` and click "Deploy"
4. Click "Edit Code"
5. Delete the default code
6. Copy the contents of `tripit-emoji-worker.js` from this repo
7. Paste into the editor and click "Save and Deploy"

**Step 2: Add Environment Variables**

1. Click "Settings" tab
2. Click "Variables and Secrets"
3. Add `TRIPIT_FEED_URL`:
   - Click "Add variable"
   - Name: `TRIPIT_FEED_URL`
   - Value: Your TripIt ICS feed URL (get from [TripIt.com](https://www.tripit.com) → Account Settings → Calendar Feeds)
   - Check "Encrypt" (recommended)
   - Click "Deploy"
4. Add `SECRET_TOKEN` (recommended for security):
   - Click "Add variable" again
   - Name: `SECRET_TOKEN`
   - Value: Create a random string (e.g., `openssl rand -hex 8`)
   - Check "Encrypt" (recommended)
   - Click "Deploy"

**Step 3: Get Your URL**

Your calendar URL: `https://tripit-emoji.YOUR-SUBDOMAIN.workers.dev?token=YOUR-SECRET-TOKEN`

✅ **Done!** Your secrets are stored securely in Cloudflare, not in your code.

### Option B: Wrangler CLI (For Developers)

**Step 1: Install and Setup**

```bash
# Install Wrangler
npm install -g wrangler

# Clone this repository
git clone https://github.com/aaronfreimark/tripit-emoji.git
cd tripit-emoji

# Login to Cloudflare
wrangler login
```

**Step 2: Configure Environment Variables**

For local development:

```bash
# Copy the example file
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your values (gitignored - safe!)
# Add your TRIPIT_FEED_URL and SECRET_TOKEN
```

For production deployment:

```bash
# Set your TripIt URL as an encrypted secret
wrangler secret put TRIPIT_FEED_URL
# Paste your TripIt ICS feed URL when prompted

# Set your security token
wrangler secret put SECRET_TOKEN
# Enter a random string when prompted (e.g., a7f9d2e4c8b1)
```

**Step 3: Deploy**

```bash
# Test locally first (optional)
wrangler dev

# Deploy to production
wrangler deploy
```

Your calendar URL: `https://tripit-emoji.YOUR-SUBDOMAIN.workers.dev?token=YOUR-SECRET-TOKEN`

✅ **Your secrets are encrypted and never stored in your code!**

## 📱 Using Your Calendar Feed

Once deployed, subscribe to your worker URL in your calendar app:

### Apple Calendar (macOS/iOS)
1. File → New Calendar Subscription (Mac) or Settings → Accounts → Add Account (iOS)
2. Paste your Cloudflare Worker URL
3. Set refresh interval to 15 minutes

### Google Calendar
1. Settings → Add calendar → From URL
2. Paste your Cloudflare Worker URL
3. Note: Google caches feeds for several hours

### Outlook/Office 365
1. Add calendar → From Internet
2. Paste your Cloudflare Worker URL

## 🎨 Customization

### Change Emojis

Edit the `EMOJIS` object in `tripit-emoji-worker.js`:

```javascript
const EMOJIS = {
  FLIGHT: '✈️',      // Change to your preferred flight emoji
  HOTEL: '🛎️',       // Change to your preferred hotel emoji
  CAR_RENTAL: '🚘',  // Change to your preferred car emoji
  PARKING: '🚙'      // Change to your preferred parking emoji
};
```

### Add New Event Types

Want to add emojis for trains, restaurants, or other events? Extend the `getEventType()` function:

```javascript
const EMOJIS = {
  FLIGHT: '✈️',
  HOTEL: '🛎️',
  CAR_RENTAL: '🚘',
  PARKING: '🚙',
  TRAIN: '🚂',        // New!
  RESTAURANT: '🍽️'   // New!
};

function getEventType(summary, description) {
  const summaryLower = summary.toLowerCase();
  const descriptionLower = description.toLowerCase();
  
  // Add train detection
  if (summaryLower.includes('amtrak') || 
      summaryLower.includes('train') ||
      descriptionLower.includes('[rail]')) {
    return 'TRAIN';
  }
  
  // Add restaurant detection
  if (summaryLower.includes('dinner') || 
      summaryLower.includes('restaurant')) {
    return 'RESTAURANT';
  }
  
  // ... existing code ...
}
```

## 🏗️ How It Works

```text
┌─────────────┐
│ Calendar    │
│ App         │  1. Request with ?token=SECRET
└──────┬──────┘
       │
       ↓
┌──────────────────────────┐
│ Cloudflare Worker        │
│                          │
│ 1. Verify token          │
│ 2. Fetch from TripIt     │
│ 3. Parse ICS             │
│ 4. Add emojis            │
│ 5. Return modified ICS   │
└──────┬───────────────────┘
       │
       ↓
┌─────────────┐
│ TripIt      │
│ Private URL │  (stored securely in env vars)
└─────────────┘
```

**The Flow:**

1. Calendar app requests feed with token: `https://your-worker.dev?token=SECRET`
2. Worker validates token against `SECRET_TOKEN` environment variable
3. Worker fetches your private TripIt feed using `TRIPIT_FEED_URL` environment variable
4. Worker parses ICS format and identifies event types
5. Worker adds emojis (flights get special formatting: "EWR→ATL • DL2353")
6. Worker returns modified ICS with 15-minute cache header
7. Calendar app displays emoji-enhanced events

## 🔒 Security & Privacy

### How It Works

This worker uses **Cloudflare environment variables** to keep your private data secure:

- ✅ **Secrets stored securely** - Your TripIt URL and token are encrypted in Cloudflare
- ✅ **Safe for GitHub** - No private data in your code or Git history
- ✅ **URL protection** - Optional `SECRET_TOKEN` prevents unauthorized access
- ✅ **Easy updates** - Change secrets without modifying code

### Required Environment Variables

**`TRIPIT_FEED_URL`** (required)
- Your private TripIt ICS feed URL
- Get from: TripIt.com → Account Settings → Calendar Feeds
- Stored encrypted in Cloudflare

**`SECRET_TOKEN`** (strongly recommended)
- A random string to protect your worker URL
- Without it, anyone with your worker URL can access your calendar
- With it, requests need `?token=YOUR-SECRET-TOKEN` in the URL
- Generate with: `openssl rand -hex 8`

### URL Security

Without token (not recommended):

```text
https://tripit-emoji.YOUR-NAME.workers.dev
```

With token (recommended):

```text
https://tripit-emoji.YOUR-NAME.workers.dev?token=a7f9d2e4c8b1
```

If the token doesn't match or is missing when `SECRET_TOKEN` is set, the worker returns `401 Unauthorized`.

### Data Privacy

- Calendar data passes through Cloudflare's edge network but is **never stored**
- Processing happens in-memory only
- Results are cached for 15 minutes for performance
- Your TripIt URL never appears in your code

### Best Practices

1. ✅ **Always use `SECRET_TOKEN`** - Prevents unauthorized access
2. ✅ **Use "Encrypt" option** - When adding variables in Cloudflare dashboard
3. ✅ **Generate random tokens** - Use `openssl rand -hex 8` or similar
4. ✅ **Never commit `.dev.vars`** - It's already in `.gitignore`
5. ✅ **Keep URL + token private** - Treat like a password
6. ✅ **Rotate periodically** - Change tokens if you suspect exposure
7. ✅ **Regenerate if exposed** - Both TripIt URL (in TripIt settings) and token

## 📊 Monitoring

In the Cloudflare dashboard:
- Navigate to Workers & Pages → Your Worker → Metrics
- View request count, errors, and response times
- Check the Analytics tab for detailed insights

## 💰 Cost

**Cloudflare Workers Free Tier:**
- 100,000 requests per day
- 10ms CPU time per request
- **More than enough for personal calendar use** (typically <100 requests/day)

## 🐛 Troubleshooting

### Events not showing emojis
- Verify the worker deployed successfully
- Check worker logs in Cloudflare dashboard
- Confirm your calendar app is using the Worker URL (not the original TripIt URL)
- Force refresh your calendar

### Calendar not updating
- Calendar apps cache ICS feeds - wait 15-30 minutes
- Check worker metrics to confirm requests are coming through
- Force refresh your calendar subscription

### Worker errors
- Review logs in Cloudflare dashboard
- Verify your TripIt feed URL is accessible
- Check that you saved the latest code version

## 🤝 Contributing

Contributions are welcome! Here's how to contribute:

### Reporting Bugs

Open an issue with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (calendar app, etc.)

### Suggesting Features

Open an issue describing:

- The feature you'd like
- Why it would be useful
- How it might work

### Contributing Code

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-emoji-type`)
3. Make your changes
4. Test locally with `wrangler dev`
5. Commit with clear messages (`git commit -m 'Add restaurant emoji support'`)
6. Push and open a Pull Request

### Adding New Event Types

To add a new emoji type:

1. Add to the `EMOJIS` object
2. Add detection logic to `getEventType()`
3. Test thoroughly
4. Update documentation

Example:

```javascript
// In EMOJIS object
RESTAURANT: '🍽️'

// In getEventType()
if (summaryLower.includes('dinner') || summaryLower.includes('restaurant')) {
  return 'RESTAURANT';
}
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- TripIt for providing calendar feed functionality
- Cloudflare for the Workers platform
- The iCalendar (RFC 5545) specification

## 📧 Support

If you encounter issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review existing [GitHub Issues](https://github.com/YOUR-USERNAME/tripit-emoji-worker/issues)
3. Open a new issue with details about your problem

## 🗺️ Roadmap

- [x] Environment variables for secure configuration
- [x] Security token for URL protection
- [x] Train/rail event detection
- [x] Special flight formatting (EWR→ATL • DL2353)
- [ ] Support for multiple TripIt accounts
- [ ] Restaurant/dining event detection
- [ ] Meeting/conference event detection
- [ ] Custom domain support
- [ ] Configuration UI
- [ ] Webhook notifications for trip updates

---

Made with ❤️ for easier travel planning
