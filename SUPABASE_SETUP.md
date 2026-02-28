# Supabase Setup Guide – Memory Mirror

This guide walks you through creating a Supabase project, running the database
migrations, and wiring Supabase authentication into the Memory Mirror app.

---

## 1. Create a Supabase Project

1. Go to <https://supabase.com> and sign in (or create a free account).
2. Click **New project**, choose an organisation, give the project a name and
   set a strong database password.
3. Once the project is provisioned, open **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

---

## 2. Environment Variables

Copy `.env.example` to `.env.local` at the repository root and fill in the
Supabase values:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Never commit `.env.local`** – it is listed in `.gitignore`.

---

## 3. Database Schema

Run the migration script against your Supabase project.

### Option A – Supabase CLI (recommended)

```bash
# Install the CLI if needed
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Push all pending migrations
supabase db push
```

### Option B – SQL Editor

1. Open the Supabase dashboard and navigate to **SQL Editor**.
2. Paste the contents of `supabase/migrations/001_init.sql` and click **Run**.

---

## 4. Database Schema Overview

| Table | Purpose |
|---|---|
| `public.users` | User profile data, extends `auth.users` |
| `public.journal_entries` | Personal journal entries with mood & tags |
| `public.memory_sessions` | AI memory-companion session records |
| `public.subscription_status` | Plan type and Stripe billing metadata |

### Entity-relationship summary

```
auth.users (Supabase managed)
  │
  ├── public.users          (1:1)
  ├── public.journal_entries  (1:N)
  ├── public.memory_sessions  (1:N)
  └── public.subscription_status (1:1)
```

All tables use **Row Level Security (RLS)** so that each authenticated user can
only access their own rows.

---

## 5. Authentication Flow

```
User fills in email/password form
        │
        ▼
authService.signUp / signIn
        │
        ▼
Supabase returns { user, session }
        │
        ▼
authService.syncUserProfile upserts public.users
        │
        ▼
useAuth hook exposes { user, session } to React tree
```

### Enabling email confirmation (optional but recommended for production)

In the Supabase dashboard go to **Authentication → Settings** and enable
**Enable email confirmations**.  Users will then need to verify their address
before they can sign in.

---

## 6. API Integration Examples

### Sign up

```js
import { useAuth } from "@/hooks/useAuth";

const { signUp, error } = useAuth();

const handleSubmit = async (email, password, fullName) => {
  const { error } = await signUp(email, password, fullName);
  if (error) console.error(error);
};
```

### Sign in

```js
import { useAuth } from "@/hooks/useAuth";

const { signIn, user } = useAuth();

const handleLogin = async (email, password) => {
  await signIn(email, password);
  // user is now populated in the hook
};
```

### Sign out

```js
import { useAuth } from "@/hooks/useAuth";

const { signOut } = useAuth();

await signOut();
```

### Password reset

```js
import { useAuth } from "@/hooks/useAuth";

const { resetPassword } = useAuth();

await resetPassword("user@example.com");
// Supabase sends a password-reset email
```

### Querying user data

```js
import { supabase } from "@/config/supabase";

const { data: entries } = await supabase
  .from("journal_entries")
  .select("*")
  .order("created_at", { ascending: false });
```

### Inserting a journal entry

```js
import { supabase } from "@/config/supabase";

const { data, error } = await supabase.from("journal_entries").insert({
  title: "My first entry",
  content: "Today was a good day.",
  mood: "happy",
  tags: ["family", "outdoors"],
});
```

---

## 7. File Reference

| File | Purpose |
|---|---|
| `src/config/supabase.js` | Initialises the Supabase client from env vars |
| `src/services/authService.js` | Low-level auth helpers (sign-up, sign-in, etc.) |
| `src/hooks/useAuth.js` | React hook – exposes auth state to components |
| `supabase/migrations/001_init.sql` | Full database schema with RLS policies |
| `.env.example` | Template for required environment variables |
