# BhaktiSetu Website

Next.js website for BhaktiSetu using the same Firebase project as the mobile app.

## What is included

- Public puja catalogue and booking request form
- Firebase Auth team login
- Owner dashboard with full bookings table
- Operations/priest dashboard with only name + gotra Ops View
- Website booking requests save to `bookings`
- Forward-safe records save to `bookingOpsShares` with only `devoteeName` and `gotra`

## Firebase

This website uses project `bhaktisetu-e0e1a` and Firestore database id `default`.

Create `.env.local` from `.env.example` and paste the Firebase Web App ID from Firebase Console:

```bash
cp .env.example .env.local
```

## Local development

```bash
npm install
npm run dev
```

## Roles

Set role in `users/{uid}`:

- `owner`: full dashboard access
- `operations`, `ops`, `priest`, `pandit`, `team`: Ops View only
- no role: no dashboard access

## Payment status

Razorpay live payment is intentionally not enabled yet. Website currently stores booking requests only until bank/account onboarding is ready.

## Deployment

Recommended path: connect this repository to Vercel, set the `NEXT_PUBLIC_FIREBASE_*` environment variables, deploy `main`, and connect the custom domain after DNS is ready.
