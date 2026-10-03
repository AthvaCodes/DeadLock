# Deadlock

Fixing the endless "kahan chalein?" fight when picking food or hangouts.

### The annoyance
- **What it is:** Friends spending 45 minutes saying "kuch bhi chalega", rejecting every suggestion, and starving.
- **Who it annoys:** Anyone trying to eat with roommates, friends, or family.
- **How I know:** Happens to my friend circle 3 times a week. We spend more time deciding than eating.

### Your constraint (PRN ending in 1: One thumb on phone)
- **How it changed what I built:**
  - Put every button, swipe card, and drawer in the bottom 45% of the screen so your thumb never has to stretch to the top.
  - Added a left/right thumb switch that flips the main button so lefties don't struggle.
  - Added a clear Leave control and made browser Back return to onboarding instead of trapping you in a round.
  - Built a "Zone Check" button that shows the thumb reach zone right on screen.

### The great part
- Added a Veto button (-3 pts) and real-time unanimous consensus using Server-Sent Events. If two people remotely swipe yes to the same spot, both screens trigger confetti at the exact same second and show a 1-tap Google Maps link.
- Anyone can also tap "+ Add Choice" to throw their own custom food spot into the live deck while swiping.

### The two testers
- **Tester 1 (Friend holding a drink in one hand):** Kept trying to tap the top avatars to see votes. I moved the live scores trigger down into the bottom thumb dock.
- **Tester 2 (Left-handed roommate):** Complained that the green Yes button was too far to the right. I built the left/right thumb switcher.

### AI
- **What I used it for:** Writing the touch swipe drag math and Express SSE boilerplate.
- **What it got wrong:** It used `app.get('*', ...)` which immediately crashed on Express 5 because of `path-to-regexp` v8 syntax. Had to change it to `app.use((req, res) => ...)`.

### Not done
- Live Google Places nearby autocomplete (currently opens a direct Google Maps search link instead of fetching live restaurant coordinates).
- Native vibration on iOS (Apple blocks web vibration, so I used Web Audio synthesizer clicks instead).

### Run it
```bash
npm install
npm start
```
Open `http://localhost:3000`.

Local runs use `data/db.json` by default. To use Supabase locally, copy `.env.example` to `.env`, then fill in `SUPABASE_URL` and `SUPABASE_SECRET_KEY` after setting up the table below.

### Supabase + Render deployment
1. Create a Supabase project. In its SQL Editor, run `data/supabase-schema.sql` once.
2. In Supabase Project Settings → API Keys, copy the project URL and a **Secret key** (`sb_secret_...`). Keep the secret key server-side.
3. Push this repo to GitHub, then in Render choose **New → Blueprint** and connect this repository. Render reads `render.yaml` and asks for `SUPABASE_URL` and `SUPABASE_SECRET_KEY`.
4. Deploy, then open your Render URL and check `/api/health`.

The room and user state is stored in one Supabase JSONB row. Keep this service at one Render instance; live SSE updates currently use in-process connections. Free Render services can sleep while idle, so the first visit after inactivity may take longer.
Existing local data in `data/db.json` is not uploaded automatically; the Supabase database starts empty.

Environment variable names:
- `PORT` (Render provides this automatically)
- `NODE_ENV`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (never commit its value)
