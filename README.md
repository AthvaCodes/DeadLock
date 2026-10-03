# Deadlock

### Stop saying “kuch bhi chalega.” Start deciding.

Deadlock is a real-time group decision-making app that helps friends quickly decide where to eat or hang out.

## Features

- Swipe-based voting
- Real-time multiplayer rooms
- **Yes / No / Veto (-3 pts)**
- Unanimous consensus detection
- Confetti when everyone agrees
- Add custom choices
- One-tap Google Maps navigation
- Thumb-friendly mobile UI
- Left/right hand mode
- Clear Leave and Back navigation
- Zone Check for thumb reach

## Tech Stack

- HTML, CSS, JavaScript
- Node.js + Express
- Server-Sent Events (SSE)
- Supabase
- Google Maps

## UX Focus

The UI was designed around real user testing:

- Important controls stay in the bottom 45% for easier thumb reach.
- Live scores were moved down for one-handed users.
- Left/right controls were added for left-handed users.

## AI Usage

AI was used for:

- Swipe/drag interaction logic
- Express SSE boilerplate


## Current Limitations

- Live Google Places autocomplete is not implemented yet.
- Google Maps currently opens through a direct search link.
- iOS native vibration is unavailable, so Web Audio clicks are used instead.

