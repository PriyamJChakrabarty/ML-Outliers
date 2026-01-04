# Vercel Deployment Guide for ML-Outliers

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Prerequisites
- GitHub account
- Git installed on your computer
- Your ML-Outliers project ready

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Click **Sign Up**
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your GitHub

### Step 2: Push Code to GitHub

```bash
# Make sure you're in the project directory
cd C:\Users\Priyam\Documents\Temp\Projects\Latest\ML-Outliers

# Initialize git if not already done
git init

# Add all files
git add .

# Commit your changes
git commit -m "Ready for Vercel deployment"

# Create repository on GitHub, then add remote
git remote add origin https://github.com/YOUR_USERNAME/ML-Outliers.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Import to Vercel

1. Login to https://vercel.com/dashboard
2. Click **Add New...** → **Project**
3. Click **Import Git Repository**
4. Select your **ML-Outliers** repository
5. Click **Import**

### Step 4: Configure Settings

Vercel auto-detects Next.js settings:

**Framework:** Next.js ✓
**Build Command:** `npm run build` ✓
**Output Directory:** `.next` ✓
**Install Command:** `npm install` ✓
**Root Directory:** `./` ✓

**Environment Variables:** None required for this project

### Step 5: Deploy

1. Click **Deploy** button
2. Wait 2-5 minutes for build
3. Success! 🎉

Your site is live at: `https://your-project-name.vercel.app`

---

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Enter your email and verify via the link sent.

### Step 3: Deploy

```bash
# Navigate to project directory
cd C:\Users\Priyam\Documents\Temp\Projects\Latest\ML-Outliers

# Deploy to Vercel
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → ml-outliers (or your choice)
- **Directory?** → `./`
- **Override settings?** → No

### Step 4: Deploy to Production

```bash
vercel --prod
```

---

## Post-Deployment Steps

### 1. Get Your Live URL
After deployment, Vercel provides:
- **Preview URL:** `https://ml-outliers-abc123.vercel.app`
- **Production URL:** `https://ml-outliers.vercel.app`

### 2. Custom Domain (Optional)

To add a custom domain:

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Domains**
3. Click **Add**
4. Enter your domain (e.g., `mloutliers.com`)
5. Follow DNS configuration instructions

### 3. Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push

# Vercel auto-deploys! 🚀
```

**Branch Deployments:**
- `main` branch → Production
- Other branches → Preview deployments

---

## Environment Variables (If Needed Later)

If you add environment variables in the future:

1. Go to **Settings** → **Environment Variables**
2. Add variables:
   - **Name:** `NEXT_PUBLIC_API_KEY`
   - **Value:** `your-key-here`
   - **Environment:** Production, Preview, Development
3. Click **Save**
4. Redeploy: **Deployments** → **⋯** → **Redeploy**

---

## Monitoring Your Deployment

### View Build Logs
1. Go to **Deployments** tab
2. Click on any deployment
3. View **Build Logs** to debug issues

### Analytics (Optional)
1. Enable **Analytics** in project settings
2. Track page views, performance, and Web Vitals

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure `npm run build` works locally
- Verify all dependencies in `package.json`

### Module Not Found Error
- Clear Vercel cache: Settings → **Clear Build Cache**
- Redeploy

### Images Not Loading
- Ensure images are in `/public` directory
- Use correct paths: `/assets/image.png` not `./assets/image.png`

### API Routes Not Working
- Verify API routes are in `/src/app/api` directory
- Check serverless function logs in Vercel

---

## Performance Optimization

### 1. Image Optimization
Vercel automatically optimizes images with Next.js Image component.

### 2. Caching
Static pages are automatically cached on Vercel's Edge Network.

### 3. Build Time
- Your build takes ~5-10 seconds
- Deploy time: 2-5 minutes total

---

## Deployment Checklist

- [x] Code pushed to GitHub
- [x] Vercel account created
- [x] Project imported to Vercel
- [x] Build successful (no errors)
- [x] Site accessible via Vercel URL
- [ ] Custom domain added (optional)
- [ ] Analytics enabled (optional)

---

## Next Steps After Deployment

1. **Share Your Link:** `https://your-project.vercel.app`
2. **Test All Features:** Navigate through all pages
3. **Check Mobile:** Responsive design works
4. **Monitor Performance:** Use Vercel Analytics
5. **Set Up Alerts:** Get notified of deployment failures

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Community:** https://vercel.com/discord

---

## Quick Commands Reference

```bash
# Login to Vercel
vercel login

# Deploy preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List all deployments
vercel ls

# Pull environment variables
vercel env pull
```

---

**Your ML-Outliers project is production-ready! 🎉**

Deploy URL: Will be available after deployment
