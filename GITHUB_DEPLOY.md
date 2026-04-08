# 🚀 GitHub and Render Deployment Guide

This file contains step-by-step instructions for uploading your project to GitHub and deploying to Render.com.

---

## ✅ Pre-Deployment Checklist

Your project has been cleaned up and is ready for deployment! Here's what was prepared:

### Files Added:
- ✅ `.gitignore` - Updated to exclude database files, node_modules, .env, uploads
- ✅ `.node-version` - Specifies Node.js 18.18.0 for Render
- ✅ `.prettierrc` - Code formatting configuration
- ✅ `.prettierignore` - Files to exclude from formatting
- ✅ `LICENSE` - MIT License
- ✅ `CHANGELOG.md` - Version history tracking
- ✅ `CONTRIBUTING.md` - Contribution guidelines
- ✅ `SECURITY.md` - Security policy and vulnerability reporting
- ✅ `README.md` - Comprehensive project documentation

### Files Already Present:
- ✅ `render.yaml` - Render deployment configuration
- ✅ `build.sh` - Build script for Render
- ✅ `.env.example` - Environment variable template
- ✅ `DEPLOYMENT.md` - Detailed deployment instructions
- ✅ `SETUP.md` - Local setup guide
- ✅ `FEATURES.md` - Feature list

### Files to Keep Local (Already in .gitignore):
- ❌ `.env` - Contains your actual secrets
- ❌ `prisma/dev.db` - Local development database
- ❌ `node_modules/` - npm packages
- ❌ `.next/` - Build output
- ❌ `public/uploads/` - User uploaded files

---

## 📤 Step 1: Push to GitHub

### 1.1 Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Name your repository (e.g., `white-hole-solutions`)
4. Choose visibility (Public or Private)
5. **DO NOT** initialize with README, .gitignore, or license ✅ (we already have these!)
6. Click **"Create repository"**

### 1.2 Initialize Git (If Not Already Done)

Open terminal in your project folder:

```bash
cd "X:\WHS\Apps and Development\WHS_SITE"
git init
```

### 1.3 Update Remote URLs in package.json (IMPORTANT!)

Open `package.json` and replace:
- `"url": "https://github.com/yourusername/white-hole-solutions.git"`

With your actual GitHub username/organization.

### 1.4 Commit and Push

```bash
# Check what will be committed
git status

# Add all files (respects .gitignore)
git add .

# Create first commit
git commit -m "Initial commit: White Hole Solutions v1.0.0"

# Add your GitHub remote (replace with your actual URL)
git remote add origin https://github.com/yourusername/white-hole-solutions.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 1.5 Verify Upload

Visit your GitHub repository and confirm all files are present (except those in .gitignore).

---

## 🌐 Step 2: Deploy to Render

### Option A: Quick Deploy with Blueprint (Recommended)

1. **Push to GitHub first** (complete Step 1 above)

2. **Deploy via Blueprint**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub account if not already connected
   - Select your repository: `white-hole-solutions`
   - Render will detect `render.yaml` automatically
   - Click **"Apply"**

3. **Set Required Environment Variables**:
   
   Render will create the service but you need to set:
   
   - `NEXT_PUBLIC_APP_URL`: Your app URL (will be shown after creation, e.g., `https://white-hole-solutions.onrender.com`)
   - `REVOLUT_API_KEY`: Your Revolut API key (or leave as placeholder)
   
   Other variables are auto-generated:
   - `JWT_SECRET`: Auto-generated secure value
   - `ADMIN_PASSWORD`: Auto-generated (check Render dashboard to retrieve)

4. **Trigger Deployment**:
   - Render will automatically:
     - Create persistent disk (1GB for SQLite)
     - Run `build.sh` script
     - Run database migrations
     - Seed initial data
     - Build Next.js app
   - Wait 5-10 minutes for first deployment

5. **Access Your Site**:
   - URL: `https://your-app-name.onrender.com`
   - Admin login: 
     - Email: `admin@whiteholesolutions.com` (or your custom email from env)
     - Password: Check Render dashboard → Environment → `ADMIN_PASSWORD`

### Option B: Manual Setup

If you prefer manual control:

1. **Create Web Service**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **"New +"** → **"Web Service"**
   - Connect GitHub repository
   - Configure:
     - **Name**: `white-hole-solutions`
     - **Environment**: Node
     - **Branch**: `main`
     - **Build Command**: `chmod +x build.sh && ./build.sh && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free/Starter/Professional (choose based on needs)

2. **Add Persistent Disk** (CRITICAL!):
   - In service settings → **"Disks"**
   - Click **"Add Disk"**
   - **Name**: `sqlite-data`
   - **Mount Path**: `/app/disk`
   - **Size**: 1 GB minimum
   - Click **"Create Disk"**

3. **Set Environment Variables**:
   
   Go to **"Environment"** tab and add:
   
   ```
   DATABASE_URL=file:/app/disk/production.db
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
   JWT_SECRET=<generate-with-openssl-rand-base64-32>
   REVOLUT_API_KEY=your-actual-key-or-placeholder
   REVOLUT_API_URL=https://sandbox-b2b.revolut.com/api/1.0
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=YourSecurePassword123!
   ```

4. **Deploy!**
   - Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Monitor logs for any issues
   - First deployment takes 5-10 minutes

---

## 🔐 Step 3: Post-Deployment Security

### 3.1 Retrieve Generated Passwords

If using auto-generated passwords:
1. Go to Render Dashboard → Your Service → **"Environment"**
2. Find `ADMIN_PASSWORD` and copy the value
3. Save it securely (password manager recommended)

### 3.2 First Login

1. Visit your deployed site
2. Click **"Client Login"**
3. Enter:
   - Email: Value from `ADMIN_EMAIL`
   - Password: Value from `ADMIN_PASSWORD`

### 3.3 Change Admin Password

⚠️ **IMPORTANT**: Change the default/generated password!

1. Log in to admin panel
2. Navigate to **"Settings"** or **"Profile"** (if implemented)
3. Change password to something secure and memorable

### 3.4 Configure Business Settings

1. Go to **Admin Panel** → **"Settings"**
2. Update:
   - Business name
   - Contact information
   - ABN/ACN (if applicable)
   - Address
   - Tax rate (default 10% for Australia)
   - Payment terms

---

## 📱 Step 4: Verify Everything Works

### Test Public Website:
- ✅ Home page loads
- ✅ Hero banner displays
- ✅ Portfolio shows (if you've added albums)
- ✅ Contact form works (submit test inquiry)

### Test Admin Panel:
- ✅ Can log in
- ✅ Can create album
- ✅ Can upload media
- ✅ Can create customer
- ✅ Can create invoice
- ✅ Can view analytics

### Test Customer Portal:
- ✅ Customer can log in (if created)
- ✅ Private albums visible
- ✅ Can download media
- ✅ Invoices appear

---

## 🔄 Step 5: Continuous Deployment

Now that you're set up, any push to GitHub will auto-deploy to Render!

### Making Updates:

```bash
# Make your changes locally
# Test locally with: npm run dev

# Commit changes
git add .
git commit -m "Describe your changes"

# Push to GitHub
git push origin main

# Render automatically deploys!
```

### Monitor Deployments:
- Go to Render Dashboard
- Click on your service
- View **"Events"** tab for deployment status
- Check **"Logs"** for any errors

---

## 💾 Step 6: Backup Strategy

### Automatic Backups:
Render's persistent disk is reliable, but you should still backup regularly.

### Manual Backup:

1. **SSH into Render** (requires paid plan) or use Render Shell:
   ```bash
   # In Render Shell
   cp /app/disk/production.db /tmp/backup-$(date +%Y%m%d).db
   ```

2. **Download via API** (future implementation recommended)

3. **Regular Schedule**:
   - Daily: For active production systems
   - Weekly: For low-traffic sites
   - Before major updates: Always!

---

## 🐛 Troubleshooting

### Build Fails

**Check logs:**
- Render Dashboard → Your Service → "Logs"

**Common issues:**
- Missing environment variables
- `build.sh` permissions (should be `chmod +x`)
- npm install failures (try clearing build cache)

### Database Issues

**"Cannot find database":**
- Ensure persistent disk is mounted at `/app/disk`
- Check `DATABASE_URL` is `file:/app/disk/production.db`

**Migration fails:**
- May need to manually run: `npx prisma migrate deploy`
- Check if disk has sufficient space

### Can't Login

**Forgot password:**
- Check Render Environment variables for `ADMIN_PASSWORD`
- Or update via Render Shell

**"Unauthorized" errors:**
- Clear browser cookies
- Check `JWT_SECRET` is set
- Verify you're not in incognito mode

---

## 📞 Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/white-hole-solutions/issues)
- **Documentation**: Check README.md, DEPLOYMENT.md, FEATURES.md
- **Render Support**: [Render Help Center](https://render.com/docs)

---

## 🎉 You're Live!

Congratulations! Your White Hole Solutions platform is now:
- ✅ Version controlled on GitHub
- ✅ Deployed on Render with SSL
- ✅ Accessible worldwide
- ✅ Auto-deploying on every push
- ✅ Ready for customers!

**Next Steps:**
1. Create your first public album
2. Upload showcase media
3. Share your site URL
4. Start getting inquiries!

---

**Built with ❤️ for the media production community**
