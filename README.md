# Succession - E-commerce Platform

Full-stack e-commerce platform built with Next.js 16, Prisma, and Cloudflare Pages.

## Tech Stack

- Next.js 16.1.4 (App Router)
- TypeScript
- Prisma 7.3 + Neon Postgres
- Tailwind CSS 4
- Razorpay Payment Gateway
- Cloudflare Pages

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:push
npm run dev
```

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run cf:deploy    # Deploy to Cloudflare
```

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - Neon Postgres connection string
- `JWT_SECRET` - 32+ character secret
- `ADMIN_SECRET_KEY` - Admin login key
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM`

## Deployment

```bash
npm run cf:deploy
```

Set environment variables in Cloudflare Dashboard before deploying.
