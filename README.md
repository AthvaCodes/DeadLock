# ⚡ DEADLOCK — The 1-Thumb Group Indecision Killer

> **MLSC VIT PUNE — Web Development Challenge: "Fix One Annoying Thing"**  
> **Constraint Assigned (PRN ending in 1):** *One thumb. Fully usable with one thumb on a phone.*

---

## 😤 The Annoyance
- **What it is:** The agonizing 45-minute group decision deadlock:
  - *"Bhai kahan chalein?"*
  - *"Kuch bhi chalega."*
  - *"Pizza khayein?"*
  - *"Nahi kal khaya tha."*
  - *"Biryani?"*
  - *"Too heavy."*
  - *"Tu hi bata na!"*
  - *"Maine to bola kuch bhi chalega..."*
- **Who it annoys:** Friend circles, roommates, college squads, families, and office lunch groups.
- **How we know:** We experience this 3 to 4 times every single week. Everyone gets hungrier, blood sugar drops, tempers flare, and 45 minutes of prime evening time is wasted standing on a street corner or scrolling WhatsApp before anyone orders or moves.

---

## 👍 Your Constraint: One Thumb on a Phone
- **How it changed what we built:**
  - Modern smartphones (6.1" to 6.8") are ergonomically hostile to one-handed use. Traditional apps put back buttons, search bars, and profile icons at the top—forcing users to stretch their thumbs or use two hands.
  - For **Constraint #1**, we engineered a **Strict Two-Tier Ergonomic Architecture**:
    - **Top 55% (View Zone):** Visual-only layer (cards, avatars, consensus meter, room code). Zero buttons or essential touch targets exist here.
    - **Bottom 45% (Natural Thumb Zone):** 100% of interactive controls (swipe deck, giant 64px thumb action buttons, handedness switch, drawer handles, mode tabs) reside within the natural sweep arc of the thumb.
  - **Tactile Card Swipes:** Real touch/pointer drag physics with dynamic angle rotation and stamp opacity (`I'M DOWN! 👍`, `HARD VETO 🚫`, `MEH 🤷`).
  - **Left/Right Thumb Handedness Mode (`👉 / 👈`):** An instant ergonomic switch that flips the primary positive button to the left or right edge, matching whether you are holding your phone with your left or right hand.
  - **Zone Check Overlay (`📐 Zone Check`):** A built-in diagnostic overlay that renders the natural thumb reach boundary vs. the stretch zone directly on screen for judges and testers to verify.
  - **Dual Display (Phone & Laptop):** While phones get the ultra-ergonomic 1-thumb swipe deck, opening the app on a laptop transforms it into a **Living Room Command Center** with live consensus matrix, real-time vote bars, QR/invite link, and desktop keyboard shortcuts (`[←]` Veto, `[↑]` Meh, `[→]` Yes, `[Space]` Reveal).

---

## 🎯 The Great Part
- **Which part we picked and why:**
  - The **Asymmetric Veto & Real-Time Consensus Engine** paired with **Server-Sent Events (SSE)**.
  - Normal polls fail because a 3-1 majority vote can still drag one person who hates that restaurant into a miserable evening. 
  - In Deadlock, a **Veto (-3 pts)** immediately flags an option as contentious, while **Unanimous Approval** triggers an automatic server lock-in: celebratory confetti bursts, Web Audio fanfare plays, and an instant 1-thumb button directs everyone straight to Google Maps / Zomato directions!

---

## 👥 The Two Testers
1. **Tester 1 (Tested on mobile while walking with a snack in the other hand):**
   - *Where they got stuck:* When they swiped through all cards, they wanted to inspect what their friends had voted for, but they reflexively tried tapping the participant avatars at the very top of the screen (which was awkward to reach one-handed).
   - *What was changed:* Added an always-reachable **"📊 Live Scores"** trigger inside the bottom utility dock, and made the bottom drawer swipeable with a single thumb drag.
2. **Tester 2 (Left-handed user on a 6.7-inch display):**
   - *Where they got stuck:* Reaching across the wide screen to hit the green "I'm Down!" button with their left thumb felt strained.
   - *What was changed:* Built the **Left/Right Thumb Handedness Toggle** that immediately mirrors the action button layout, placing the primary action right under the left thumb's natural pivot point.

---

## 🤖 AI Usage & Fix
- **What AI was used for:** Fast scaffolding of the Express server routing, initial card rotation math for touch pointer events, and curating category preset decks (Food, Cafes, Night Out, Watch Party).
- **One thing it got wrong that had to be fixed:**
  - AI generated the standard Express 4 wildcard catch-all route `app.get('*', (req, res) => ...)` for SPA serving.
  - However, the project installed modern **Express 5.2.1** (with `path-to-regexp` v8), which strictly disallows bare `*` wildcard routes and crashed the server on startup (`PathError: Missing parameter name at index 1: *`).
  - We fixed it by migrating the catch-all handler to Express 5 middleware syntax: `app.use((req, res) => res.sendFile(...))`.

---

## 🚧 Not Done (Current Limitations)
- **Live Nearby GPS Autocomplete:** Currently opens Google Maps queries for the winning venue; does not query dynamic live Google Places API results in real time.
- **Native iOS Haptics:** Supported on Android via `navigator.vibrate`, but iOS Safari blocks the Web Vibration API; we implemented custom procedural Web Audio sound ticks as a universal tactile fallback.

---

## 💻 Run It Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### Steps
```bash
# 1. Clone the repository
git clone <your-repo-url>
cd deadlock-app

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

Visit **`http://localhost:3000`** in your browser.
*(Tip: On Chrome/Brave/Edge DevTools, press `Ctrl+Shift+M` to test in mobile device mode with one thumb, or share the room link across two browser windows to watch live consensus!)*

### Environment Variables
- `PORT` (Optional: port number, defaults to 3000)
- `NODE_ENV` (Optional: `development` / `production`)

---

## 🛠 Tech Stack
- **Backend:** Node.js, Express 5, Server-Sent Events (SSE) for zero-latency multi-device sync.
- **Storage:** File-persisted ACID JSON database (`data/store.js` & `data/db.json`).
- **Frontend:** Vanilla HTML5 / Modern CSS, Touch & Pointer Drag Physics Engine, Web Audio API sound synthesizer.
- **Ergonomics:** Natural Thumb Zone architecture, Handedness switcher, Diagnostic Reach Overlay.
