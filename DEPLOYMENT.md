# Image Store - Deployment Guide

This guide covers deploying your Image Store application to various platforms including Vercel, Hostinger, GitHub, and others.

## 🚀 Quick Start

### Prerequisites
- A Supabase project with API credentials
- Git and GitHub account
- Node.js 18+ installed locally

### Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Click **Settings** → **API**
4. Copy these values:
   - **Project URL** (format: `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### Setup Supabase Database

Run these SQL scripts in your Supabase SQL Editor (Settings → SQL Editor → New Query):

1. `scripts/01-init-schema.sql` - Create tables and RLS policies
2. `scripts/02-add-username.sql` - Add username support
3. `scripts/03-create-storage-bucket.sql` - Create images storage bucket
4. `scripts/04-fix-username-login.sql` - Add username login function
5. `scripts/05-ensure-username-function.sql` - Ensure login function exists
6. `scripts/06-add-short-urls.sql` - Add short URL support
7. `scripts/07-add-security-fields.sql` - Add security tracking fields

## 📋 Environment Variables

Your app requires these 2 environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Never commit these to Git. Always set them in your hosting platform's dashboard.

## 🔧 Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/image-store.git
cd image-store

# Install dependencies
npm install

# Create .env.local file (NOT committed to Git)
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EOF

# Run development server
npm run dev

# Visit http://localhost:3000
```

## 🌐 Deploy to Vercel (Recommended)

**Best for**: Easy, zero-config deployments with excellent Next.js support

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New" → "Project"
4. Select your GitHub repository
5. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your anon key
6. Click "Deploy"
7. Done! Your app is live

## 🌍 Deploy to Hostinger

**Best for**: Shared/VPS hosting with cPanel

1. **Prepare GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **In Hostinger Dashboard**:
   - Go to Hosting → Your Domain
   - Click "Manage" → "Advanced" → "Node.js"
   - Set Node.js version to **18.x or higher**

3. **Connect Git**:
   - Go to "Git" section
   - Click "Connect Repository"
   - Select your GitHub repository
   - Choose main/master branch

4. **Set Environment Variables**:
   - Click "Environment Variables"
   - Add:
     - Key: `NEXT_PUBLIC_SUPABASE_URL`, Value: `https://xxxxx.supabase.co`
     - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, Value: `your_anon_key`

5. **Configure Application**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Port**: `3000`

6. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (5-10 minutes)

## 💻 Deploy to DigitalOcean

**Best for**: VPS with full control

1. Create a droplet with Node.js (Ubuntu 22.04 recommended)
2. SSH into your server
3. Clone your repository:
   ```bash
   git clone https://github.com/yourusername/image-store.git
   cd image-store
   ```

4. Install dependencies:
   ```bash
   npm install
   npm run build
   ```

5. Set environment variables:
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   export NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

6. Install PM2 (process manager):
   ```bash
   npm install -g pm2
   pm2 start npm --name "image-store" -- start
   pm2 startup
   pm2 save
   ```

7. Setup Nginx reverse proxy and SSL with Let's Encrypt

## 🚢 Deploy to Render

**Best for**: Simple PaaS with free tier

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Add your Supabase credentials
6. Click "Deploy"

## 🐳 Deploy with Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t image-store .
docker run -e NEXT_PUBLIC_SUPABASE_URL=... -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... -p 3000:3000 image-store
```

## 🔍 Troubleshooting

### "Internal Server Error" on deployment

**Cause**: Missing environment variables

**Fix**:
1. Go to your hosting platform dashboard
2. Add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy the application

### "Cannot connect to database"

**Cause**: Incorrect Supabase credentials

**Fix**:
1. Verify your Supabase URL format: `https://xxxxx.supabase.co` (check for typos)
2. Verify your anon key starts with `eyJ`
3. Check that your Supabase project is active
4. Run the SQL migration scripts in Supabase

### "Images not uploading"

**Cause**: Storage bucket not created

**Fix**:
1. Go to Supabase → Storage
2. Click "New Bucket"
3. Name: `images`
4. Set to **Public**
5. Run `scripts/03-create-storage-bucket.sql`

### "Cannot login with username"

**Cause**: SQL function not created

**Fix**: Run `scripts/04-fix-username-login.sql` in Supabase SQL Editor

### "Build fails with TypeScript errors"

**Cause**: Type checking errors in build

**Fix**:
```bash
# Build locally first to catch errors
npm run build

# Check error messages
# Fix TypeScript issues
git push
```

## 📊 Performance Optimization

Your app includes:
- ✅ Image optimization (AVIF, WebP)
- ✅ Caching headers (3600s max-age)
- ✅ Database query optimization
- ✅ Auto-logout after 10 minutes
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options)

## 🔒 Security Checklist

Before going to production:

- [ ] Environment variables set in hosting platform (NOT in code)
- [ ] Supabase Row Level Security (RLS) enabled on all tables
- [ ] Storage bucket set to public read-only
- [ ] HTTPS/SSL certificate enabled
- [ ] Database backups enabled
- [ ] `.env.local` in `.gitignore`
- [ ] No API keys or secrets committed to Git

## 📞 Getting Help

**For Supabase issues:**
- Visit [supabase.com/support](https://supabase.com/support)
- Check [Discord community](https://discord.supabase.com)

**For Next.js issues:**
- Check [nextjs.org/docs](https://nextjs.org/docs)
- Visit [GitHub discussions](https://github.com/vercel/next.js/discussions)

**For this app:**
- Check browser console (F12) for error messages
- Look for `[v0]` prefix in error logs
- Check your hosting platform's logs

## 📝 Deployment Checklist

```
Before deploying:
- [ ] All SQL migrations run in Supabase
- [ ] Environment variables collected
- [ ] `.env.local` created locally (NOT committed)
- [ ] App builds successfully: npm run build
- [ ] App starts locally: npm start
- [ ] Database connection works in production

During deployment:
- [ ] Environment variables set in hosting platform
- [ ] Build completes without errors
- [ ] App starts without errors
- [ ] Can login and access dashboard
- [ ] Can upload images
- [ ] Can delete images

After deployment:
- [ ] Visit your domain and test all features
- [ ] Check browser console for errors
- [ ] Check hosting platform logs
- [ ] Test login with email and username
- [ ] Test image upload and deletion
