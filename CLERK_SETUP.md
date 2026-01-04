# Clerk Authentication Setup

This project uses Clerk for authentication. Follow these steps to set up Clerk:

## 1. Create a Clerk Account

1. Go to [https://dashboard.clerk.com/sign-up](https://dashboard.clerk.com/sign-up)
2. Create a new account or sign in
3. Create a new application

## 2. Get Your API Keys

1. In your Clerk dashboard, go to **API Keys**
2. Copy your **Publishable Key** and **Secret Key**

## 3. Configure Environment Variables

1. Open the `.env.local` file in the root of the project
2. Replace the placeholder values with your actual Clerk keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_key_here
```

## 4. Start the Development Server

```bash
npm run dev
```

## 5. Test Authentication

1. Visit [http://localhost:3000](http://localhost:3000)
2. Click any "Get Started" button
3. You'll be redirected to the sign-in page
4. Create an account or sign in
5. After authentication, you'll be redirected to `/home`

## Authentication Flow

- **Landing Page** (`/`) - Public, no authentication required
- **Sign In** (`/sign-in`) - Clerk sign-in page
- **Sign Up** (`/sign-up`) - Clerk sign-up page
- **Home** (`/home`) - Protected route, requires authentication

## Customization

The Clerk components are styled to match the ML Outliers brand with orange primary colors. You can customize the appearance in:
- `src/app/sign-in/[[...sign-in]]/page.js`
- `src/app/sign-up/[[...sign-up]]/page.js`

## Important Notes

- Never commit `.env.local` to version control (it's already in `.gitignore`)
- Keep your secret key secure
- For production deployment, add the environment variables to your hosting platform (Vercel, Netlify, etc.)
