# Vercel Deployment Guide

## Overview

This guide walks you through deploying the Stellar Vault Ops application to Vercel.

## Prerequisites

- Vercel account (free tier at https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- Environment variables ready

## Deployment Steps

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Authenticate**

   ```bash
   vercel login
   ```

   This opens a browser window to authenticate with Vercel.

3. **Deploy**

   ```bash
   vercel
   ```

   Follow the prompts:
   - Link to existing project or create new? Choose "new"
   - Project name: `stellar-vault-ops` (or your preference)
   - Framework: Select "Vite"
   - Root directory: `./` (default)
   - Build command: `npm run build` (auto-detected)
   - Output directory: `dist` (auto-detected)

4. **Set Environment Variables**

   ```bash
   vercel env add VITE_TOKEN_CONTRACT_ID
   vercel env add VITE_VAULT_CONTRACT_ID
   vercel env add VITE_VAULT_ADMIN_ADDRESS
   vercel env add VITE_STELLAR_RPC_URL
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option 2: Using Vercel Web Dashboard

1. **Push code to Git**

   ```bash
   git add .
   git commit -m "ready for vercel deployment"
   git push origin main
   ```

2. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"
   - Import your Git repository
   - Vercel auto-detects the Vite configuration

3. **Configure Environment Variables**
   - Project Settings → Environment Variables
   - Add the following:
     - `VITE_TOKEN_CONTRACT_ID`: `CDH5G42NMW7LARIUBBCUUWLA6WJ2Q373QFPQ3YCGRB72JUAVRBIRDEJP`
     - `VITE_VAULT_CONTRACT_ID`: `CB24WFEK4J2XFZL6VSNKTBTCZSQSBOGTCGJ7BFNA4QTG3RY3BHKPMBPL`
     - `VITE_VAULT_ADMIN_ADDRESS`: `GDL4DWHM3JL7YNPIXC3JWB7EJ7DBO6PZERQFBQN6MU2IRXX3AMTBP55G`
     - `VITE_STELLAR_RPC_URL`: `https://soroban-testnet.stellar.org`

4. **Deploy**
   - Click "Deploy"
   - Vercel automatically builds and deploys

## Environment Variables

The app uses the following environment variables (Vite requires `VITE_` prefix):

| Variable                          | Value                                 |
| --------------------------------- | ------------------------------------- |
| `VITE_TOKEN_CONTRACT_ID`          | Token contract address on Stellar     |
| `VITE_VAULT_CONTRACT_ID`          | Vault contract address on Stellar     |
| `VITE_VAULT_ADMIN_ADDRESS`        | Admin wallet address (reference only) |
| `VITE_STELLAR_RPC_URL`            | Stellar Soroban RPC endpoint          |
| `VITE_STELLAR_NETWORK_PASSPHRASE` | `Test SDF Network ; September 2015`   |

## Vercel Configuration

The `vercel.json` file includes:

- ✅ Optimized build command and output directory
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- ✅ Cache-Control headers for assets
- ✅ SPA rewrites (routes to index.html)
- ✅ Environment variable definitions

## Post-Deployment Checklist

- [ ] Visit your Vercel deployment URL
- [ ] Test wallet connection (Freighter)
- [ ] Test deposit transaction
- [ ] Test distribute transaction
- [ ] Verify activity feed updates
- [ ] Check mobile responsiveness
- [ ] Test navbar menu on mobile
- [ ] Verify all links work

## Performance & Optimization

- **Build Time**: ~2.4 seconds (typical)
- **Final Bundle**: 372KB (gzipped)
- **Modules**: 2108
- **CSS**: 6.39KB (gzipped)
- **JS**: 372.07KB (gzipped)

### Production Optimizations Enabled

- ✅ Minification
- ✅ Tree-shaking
- ✅ Code splitting ready
- ✅ CSS optimization
- ✅ Image optimization (Vercel)

## Important Notes

1. **VITE Prefix Required**: All client-side environment variables must have `VITE_` prefix
2. **No Secrets Exposed**: Server-side secrets are not needed for this SPA
3. **Vercel Analytics**: Automatically available on Pro+ plans
4. **Web Vitals**: Monitor at https://vercel.com/analytics
5. **Custom Domain**: Add via Project Settings → Domains

## Troubleshooting

### Build Fails

- Check logs: `vercel logs --prod`
- Verify TypeScript: `npm run build` locally
- Check ESLint: `npm run lint`

### Environment Variables Not Applied

- Redeploy after adding env vars: `vercel --prod`
- Verify variable names in Project Settings

### Mobile Menu Not Working

- Verify Framer Motion animation libraries loaded
- Check browser console for errors
- Test in incognito mode

### Slow Performance

- Run Lighthouse at https://web.dev
- Check gzip compression enabled
- Verify CDN cache status

## Rollback Previous Deployment

In Vercel Dashboard:

- Go to Deployments
- Find the previous working deployment
- Click "Promote to Production"

## Custom Domain Setup

1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration steps
4. Usually propagates within 24 hours

---

**Need Help?**

- Vercel Docs: https://vercel.com/docs
- GitHub Issues: Create an issue in your repo
- Status: https://www.vercelstatus.com
