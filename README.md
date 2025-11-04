# TripIt Calendar Emoji Enhancer

A Cloudflare Worker that adds visual emojis to your TripIt calendar feed, making it easier to distinguish between flights, hotels, car rentals, and parking at a glance.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Cloudflare Workers](https://img.shields.io/badge/cloudflare-workers-orange.svg)

## ✨ Features

- ✈️ **Flights** - Automatically identified and marked with airplane emoji
- 🛎️ **Hotels** - Check-ins and check-outs marked with bell emoji
- 🚘 **Car Rentals** - Pickup and drop-off events marked with car emoji
- 🚙 **Parking** - Airport parking events marked with parking emoji
- 🔄 **Real-time** - Updates propagate within 15 minutes
- 💰 **Free** - Runs on Cloudflare's generous free tier
- 🌍 **Global** - Edge caching for fast response times worldwide

## 📋 Before & After

**Before:**
```
DL738 JFK to LAX
Check-in: Burton House, Tribute Portfolio Hotel
Pick Up Rental Car: National Car Rental
```

**After:**
```
✈️ DL738 JFK to LAX
🛎️ Check-in: Burton House, Tribute Portfolio Hotel
🚘 Pick Up Rental Car: National Car Rental
```

## 🚀 Quick Start

### Prerequisites

- A Cloudflare account (free tier works perfectly)
- Your TripIt private calendar feed URL

### Deployment Options

#### Option 1: Deploy via Cloudflare Dashboard (Easiest)

1. **Sign up for Cloudflare**
   - Go to https://dash.cloudflare.com/sign-up
   - Create a free account

2. **Create a Worker**
   - Click "Workers & Pages" → "Create Application" → "Create Worker"
   - Name it `tripit-emoji` (or your preferred name)
   - Click "Deploy"

3. **Add the code**
   - Click "Edit Code"
   - Delete the default code
   - Copy the contents of `tripit-emoji-worker.js`
   - Paste into the editor
   - **Important:** Update the `TRIPIT_FEED_URL` with your private TripIt feed URL
   - Click "Save and Deploy"

4. **Get your URL**
   - Your worker URL: `https://tripit-emoji.YOUR-SUBDOMAIN.workers.dev`
   - Use this URL in your calendar app

#### Option 2: Deploy via Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Clone this repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/tripit-emoji-worker.git
   cd tripit-emoji-worker
   ```

3. **Update the TripIt feed URL**
   - Edit `tripit-emoji-worker.js`
   - Replace `TRIPIT_FEED_URL` with your private TripIt feed URL

4. **Login and deploy**
   ```bash
   wrangler login
   wrangler deploy
   ```

5. **Get your URL**
   - Wrangler will output your worker URL after deployment

### Finding Your TripIt Feed URL

1. Log into TripIt.com
2. Go to Account Settings → Calendar Feeds
3. Copy your private iCal feed URL (format: `https://www.tripit.com/feed/ical/private/[YOUR-KEY]/tripit.ics`)

## 📱 Using Your New Calendar Feed

Once deployed, add your worker URL to your calendar app:

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

```
┌─────────────┐
│ Calendar    │
│ App         │
└──────┬──────┘
       │ Request feed
       ↓
┌─────────────────────────┐
│ Cloudflare Worker       │
│ (Your deployment)       │
│                         │
│ 1. Fetch TripIt feed   │
│ 2. Parse ICS format    │
│ 3. Identify event types│
│ 4. Add emojis          │
│ 5. Return modified ICS │
└──────┬──────────────────┘
       │ Fetch original
       ↓
┌─────────────┐
│ TripIt      │
│ ICS Feed    │
└─────────────┘
```

1. Your calendar app requests the feed from your Cloudflare Worker
2. The worker fetches your TripIt ICS feed
3. It parses the events and identifies types based on keywords
4. It prepends appropriate emojis to event summaries
5. It returns the modified ICS feed with a 15-minute cache
6. Your calendar app displays the emoji-enhanced events

## 🔒 Privacy & Security

- Your TripIt feed URL is embedded in the worker code
- Calendar data passes through Cloudflare's edge network but is **not stored**
- The worker processes data in-memory only
- Results are cached at the edge for 15 minutes for performance
- Treat your Worker URL with the same privacy as your TripIt feed URL

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

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

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

Potential future enhancements:
- [ ] Environment variable for TripIt feed URL
- [ ] Support for multiple TripIt accounts
- [ ] Custom domain support
- [ ] More event type detection (trains, restaurants, meetings)
- [ ] Configuration UI
- [ ] Webhook notifications for trip updates

---

Made with ❤️ for easier travel planning
