# 🚀 Getting Started - Secure Environment Variables Version

Welcome! This is the **secure version** of the TripIt emoji calendar worker. It uses Cloudflare environment variables to keep your private TripIt URL separate from your code.

## 🔐 Why This Version?

✅ **Safe for public GitHub** - Your TripIt URL never goes in the code
✅ **Encrypted** - Cloudflare stores it securely  
✅ **Professional** - Industry best practice
✅ **Easy to update** - Change URL without touching code
✅ **Share freely** - Safe to open source your repo

## 📁 What You Have

```
tripit-emoji-worker/
├── 📄 SECURE_SETUP.md         ⭐ DETAILED security guide - read this!
├── 📖 README.md                Complete documentation
├── 🚀 GITHUB_SETUP.md          Step-by-step GitHub guide
├── 💻 tripit-emoji-worker.js   Main worker code (uses env variables)
├── 📋 .dev.vars.example        Template for local development
├── ⚙️  wrangler.toml            Cloudflare config
└── ... (other docs and config files)
```

## 🎯 Quick Start (Choose Your Path)

### Option A: Deploy via Dashboard (Easiest) ⭐

1. **Go to Cloudflare**
   - Visit https://dash.cloudflare.com
   - Sign up or log in (free tier is perfect)

2. **Create Worker**
   - Workers & Pages → Create Application → Create Worker
   - Name it `tripit-emoji`
   - Click Deploy

3. **Add Code**
   - Click "Edit Code"
   - Delete default code
   - Copy ALL code from `tripit-emoji-worker.js`
   - Paste and click "Save and Deploy"

4. **Add Your TripIt URL (THE SECURE PART!)**
   - Click "Settings" tab
   - Click "Variables and Secrets"
   - Click "Add variable"
   - Name: `TRIPIT_FEED_URL`
   - Value: Your TripIt URL (get from TripIt.com → Account Settings → Calendar Feeds)
   - Check "Encrypt" (recommended)
   - Click "Deploy"

5. **Add Security Token (RECOMMENDED!)**
   - Still in "Variables and Secrets"
   - Click "Add variable" again
   - Name: `SECRET_TOKEN`
   - Value: A random string you create (e.g., `a7f9d2e4c8b1`)
   - Check "Encrypt" (recommended)
   - Click "Deploy"

6. **Test It**
   - Visit your worker URL with token: `https://tripit-emoji.YOUR-NAME.workers.dev?token=YOUR-SECRET-TOKEN`
   - Should see ICS calendar data
   - Check for emojis in SUMMARY lines

7. **Use in Calendar**
   - Add your worker URL + token to your calendar app
   - Format: `https://tripit-emoji.YOUR-NAME.workers.dev?token=YOUR-SECRET-TOKEN`
   - Replace `YOUR-SECRET-TOKEN` with the value you set

### Option B: Deploy via Wrangler CLI (More Control)

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login**
   ```bash
   wrangler login
   ```

3. **Set Your Secrets**
   ```bash
   cd tripit-emoji-worker
   
   # Set TripIt URL
   wrangler secret put TRIPIT_FEED_URL
   # When prompted, paste your TripIt URL
   
   # Set security token (recommended)
   wrangler secret put SECRET_TOKEN
   # When prompted, enter a random string (e.g., a7f9d2e4c8b1)
   ```

4. **Deploy**
   ```bash
   wrangler deploy
   ```

5. **Use the URL**
   - Wrangler shows your worker URL
   - Add `?token=YOUR-SECRET-TOKEN` to the URL
   - Add complete URL to your calendar app

## 🧪 Local Testing (Optional)

Want to test locally first?

1. **Create .dev.vars**
   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. **Edit .dev.vars**
   - Add your actual TripIt URL
   - This file is gitignored (safe!)

3. **Run locally**
   ```bash
   wrangler dev
   ```

4. **Test**
   - Visit `http://localhost:8787`
   - Should show your calendar with emojis

⚠️ **Never commit .dev.vars to Git!** (It's in .gitignore for your safety)

## 📚 Next Steps

### For Deployment Details
→ Read **README.md** for comprehensive documentation

### For Security Deep Dive
→ Read **SECURE_SETUP.md** for detailed security explanations

### To Push to GitHub
→ Read **GITHUB_SETUP.md** for step-by-step Git instructions

## 🔐 Security Overview

**How it works:**
1. Your TripIt URL is stored as a Cloudflare environment variable
2. The worker code reads from `env.TRIPIT_FEED_URL`
3. Your URL is NEVER in your code or Git history
4. Safe to share your code publicly

**Where your URL lives:**
- ✅ Cloudflare dashboard (encrypted)
- ✅ Wrangler secrets (encrypted)
- ✅ .dev.vars (local only, gitignored)
- ❌ NOT in tripit-emoji-worker.js
- ❌ NOT in Git repository
- ❌ NOT in GitHub

## ✨ What You'll Get

Once deployed, calendar events will have emojis:

- ✈️ **Flights:** "DL738 JFK to LAX"
- 🛎️ **Hotels:** "Check-in: Burton House"
- 🚘 **Car Rentals:** "Pick Up Rental Car: National"
- 🚙 **Parking:** "Drop Off Parking: JFK Airport"

## 🆘 Troubleshooting

**"TRIPIT_FEED_URL environment variable not set" error:**
- You forgot to add the environment variable
- Go to Settings → Variables and Secrets
- Add `TRIPIT_FEED_URL` with your TripIt URL
- Click "Deploy"

**"Unauthorized" error:**
- You set `SECRET_TOKEN` but didn't include `?token=...` in the URL
- Make sure the token in the URL matches the one you set
- Format: `https://your-worker.workers.dev?token=YOUR-SECRET-TOKEN`

**Can't find Settings tab:**
- Make sure you're viewing your deployed worker
- Should see tabs: Quick Edit, Logs, Settings, Triggers, etc.

**Variable not working:**
- After adding variable, you MUST click "Deploy"
- Wait 30 seconds for deployment
- Try accessing your worker URL again

**Local testing not working:**
- Make sure you created `.dev.vars` (copy from `.dev.vars.example`)
- Make sure your TripIt URL and SECRET_TOKEN are in `.dev.vars`
- Run `wrangler dev` from the project directory

## 🎉 You're Almost There!

1. Choose Option A (Dashboard) or Option B (Wrangler)
2. Follow the steps above
3. Test in your browser
4. Add to your calendar app
5. Enjoy emoji-enhanced travel planning!

## 💡 Pro Tips

- **Use a SECRET_TOKEN** to add obscurity and prevent URL discovery
- **Keep both URL and token private** - treat them like passwords
- **Bookmark your full URL with token** for easy access
- **Set calendar refresh to 15 minutes** for optimal updates
- **Read SECURE_SETUP.md** for advanced security options

## 📞 Need Help?

- **Deployment issues?** → Check README.md
- **Security questions?** → Read SECURE_SETUP.md  
- **GitHub questions?** → See GITHUB_SETUP.md
- **General help?** → All docs are in this folder!

---

Ready? Pick Option A or B above and let's get started! 🚀✈️🛎️🚘🚙
