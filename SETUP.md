# AnyTradesman.com Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd anytradesman
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)

3. Run the database schema:
   - Go to **SQL Editor** in Supabase Dashboard
   - Copy and paste the contents of `supabase/schema.sql`
   - Click **Run**

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (set up later)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Enable Google OAuth (Optional)

1. Go to **Authentication > Providers** in Supabase Dashboard
2. Enable Google provider
3. Create OAuth credentials in Google Cloud Console
4. Add the Client ID and Secret to Supabase

### 5. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Preventing Supabase Pause (Free Tier)

Supabase free tier pauses after 1 week of inactivity. To prevent this:

### Option 1: cron-job.org (Recommended)

1. Go to [cron-job.org](https://cron-job.org) and create a free account
2. Create a new cron job:
   - **URL**: `https://your-app.vercel.app/api/keep-alive`
   - **Execution schedule**: Every day at any time
   - **Request method**: GET

### Option 2: GitHub Actions

Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Supabase Alive

on:
  schedule:
    - cron: '0 0 * * *'  # Runs daily at midnight UTC

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping API
        run: curl -s https://your-app.vercel.app/api/keep-alive
```

---

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

### Environment Variables for Production

Make sure to set all `.env.local` variables in your Vercel project settings, but use production values:

- `NEXT_PUBLIC_APP_URL` should be your production domain
- Use production Stripe keys when ready

---

## Project Structure

```
anytradesman/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   ├── api/               # API routes
│   │   ├── search/            # Search page
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   ├── layout/            # Header, Footer
│   │   ├── ui/                # Reusable UI components
│   │   └── forms/             # Form components
│   ├── lib/
│   │   ├── supabase/          # Supabase client configuration
│   │   └── utils.ts           # Utility functions
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript types
├── supabase/
│   └── schema.sql             # Database schema
└── public/                    # Static assets
```

---

## Key Features Implemented

- [x] User authentication (email/password + Google OAuth)
- [x] User roles (customer, business_owner, admin)
- [x] Business profiles with categories
- [x] Geographic search with PostGIS
- [x] Service request system
- [x] Quote management
- [x] Real-time messaging structure
- [x] Review system
- [x] Subscription tiers structure
- [x] Credential verification structure
- [x] Row Level Security (RLS) policies
- [x] Keep-alive endpoint for free tier

---

## Next Steps

1. **Set up Stripe** for payment processing
2. **Add file upload** for business logos and credentials
3. **Implement real-time notifications** using Supabase Realtime
4. **Add email notifications** using Resend or SendGrid
5. **Build admin dashboard** for platform management
6. **Add more search filters** and sorting options
7. **Implement the messaging UI**
8. **Add review submission forms**

---

## Support

For questions or issues, contact the development team.
