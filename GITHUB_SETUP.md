# Pushing to GitHub - Step by Step Guide

This guide will help you create a GitHub repository and push all your files.

## Quick Setup (If you're familiar with Git)

```bash
# Navigate to the repo folder
cd /path/to/repo

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: TripIt emoji calendar worker"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/tripit-emoji-worker.git
git branch -M main
git push -u origin main
```

## Detailed Setup (Step by Step)

### Step 1: Create Repository on GitHub

1. **Go to GitHub**
   - Visit https://github.com
   - Log in to your account

2. **Create new repository**
   - Click the "+" icon in the top right
   - Select "New repository"

3. **Repository settings**
   - **Repository name:** `tripit-emoji-worker` (or your preferred name)
   - **Description:** "Add emojis to TripIt calendar feeds using Cloudflare Workers"
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

4. **Copy the repository URL**
   - You'll see instructions on the next page
   - Copy the HTTPS URL: `https://github.com/YOUR-USERNAME/tripit-emoji-worker.git`

### Step 2: Prepare Your Local Repository

Open a terminal and navigate to the repo folder:

```bash
cd /path/to/tripit-emoji-worker
```

**Important:** Before committing, update the TripIt feed URL in `tripit-emoji-worker.js`:
- Replace the `TRIPIT_FEED_URL` with your actual feed URL
- Or, use a placeholder and add instructions for users to update it

### Step 3: Initialize Git

```bash
# Initialize git repository
git init

# Add all files
git add .

# Check what's being added
git status

# Commit your changes
git commit -m "Initial commit: TripIt emoji calendar worker"
```

### Step 4: Connect to GitHub

```bash
# Add GitHub as remote origin (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/tripit-emoji-worker.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 5: Verify on GitHub

1. Refresh your GitHub repository page
2. You should see all your files:
   - `tripit-emoji-worker.js`
   - `README.md`
   - `LICENSE`
   - `wrangler.toml`
   - `.gitignore`
   - `CONTRIBUTING.md`
   - `.github/workflows/deploy.yml`

## Optional: Set Up Automated Deployment

Want your worker to auto-deploy when you push to GitHub?

### 1. Get Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use the "Edit Cloudflare Workers" template
4. Click "Continue to summary" → "Create Token"
5. **Copy the token** (you won't see it again!)

### 2. Get Cloudflare Account ID

1. Go to https://dash.cloudflare.com/
2. Look in the right sidebar under "Account ID"
3. Copy the Account ID

### 3. Add Secrets to GitHub

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add two secrets:
   - Name: `CLOUDFLARE_API_TOKEN`, Value: (paste your API token)
   - Name: `CLOUDFLARE_ACCOUNT_ID`, Value: (paste your account ID)

### 4. Test Automated Deployment

```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "Test automated deployment"
git push

# Check GitHub Actions tab in your repo to see the deployment
```

Now every time you push to the `main` branch, your worker will automatically deploy!

## Making Future Updates

```bash
# Make your changes to any files

# Stage the changes
git add .

# Commit with a descriptive message
git commit -m "Add train emoji support"

# Push to GitHub
git push
```

## Troubleshooting

### "Permission denied" error
- Make sure you're logged into GitHub
- You might need to set up SSH keys or use a personal access token
- See: https://docs.github.com/en/authentication

### "Repository not found" error
- Double-check the repository URL
- Make sure you have access to the repository
- Verify your GitHub username is correct

### "Nothing to commit" message
- Files haven't changed since last commit
- Make a change to any file and try again

### Large file warnings
- The `.gitignore` file should prevent large files
- If you see warnings, check what files are being added with `git status`

## Privacy Note

**Before pushing to a public repository:**
- Remove or replace your actual TripIt feed URL from `tripit-emoji-worker.js`
- Use a placeholder like `YOUR-TRIPIT-FEED-URL-HERE`
- Add setup instructions in the README for users to add their own URL

**If keeping repository private:**
- Your feed URL stays private
- Only you (and collaborators) can see the code

## Need Help?

- [GitHub Git Guides](https://github.com/git-guides)
- [GitHub Documentation](https://docs.github.com)
- Open an issue in this repository if you have questions!

---

Happy coding! 🚀
