# Supabase Setup Guide

## 1. Run Prisma migrations

After configuring `DATABASE_URL` and `DIRECT_URL` in `.env.local`, run:

```bash
npx prisma db push
```

## 2. Apply triggers and RLS policies

In the Supabase Dashboard → SQL Editor, paste and run the contents of:

```
prisma/migrations/0001_triggers/migration.sql
```

This sets up:
- `handle_new_user` trigger (auto-creates profile on sign-up)
- `check_institution_restriction` trigger (enforces 1-team-per-institution)
- Default `app_settings` rows (deadline, fest name)
- Row Level Security (RLS) policies on all tables

## 3. Configure Storage Buckets

In Supabase Dashboard → Storage, create two buckets:

| Bucket Name     | Public | Description              |
|-----------------|--------|--------------------------|
| `event-posters` | ✅ Yes | Event poster images      |
| `profile-photos`| ✅ Yes | Cadet profile photos     |

For each bucket, add a Storage Policy:
- **SELECT (download)**: Allow public access → `true`
- **INSERT (upload)**: Authenticated users only → `auth.role() = 'authenticated'`

## 4. Configure Google OAuth

In Supabase Dashboard → Authentication → Providers → Google:
- Enable Google provider
- Add your `Google Client ID` and `Google Client Secret`
- Add authorized redirect URI: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
- Also add localhost for development: `http://localhost:3000/auth/callback`

## 5. Environment Variables

Fill in `.env.local` with values from Supabase Dashboard → Project Settings → API:
- `NEXT_PUBLIC_SUPABASE_URL` → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon public key
- `SUPABASE_SERVICE_ROLE_KEY` → service_role key (keep secret!)
- `DATABASE_URL` → Transaction Pooler connection string (port 6543)
- `DIRECT_URL` → Direct connection string (port 5432) for migrations
