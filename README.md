# Deadlock

Fixing the endless "kahan chalein?" fight when picking food or hangouts.

### The annoyance
- **What it is:** Friends spending 45 minutes saying "kuch bhi chalega", rejecting every suggestion, and starving.
- **Who it annoys:** Anyone trying to eat with roommates, friends, or family.
- **How I know:** Happens to my friend circle 3 times a week. We spend more time deciding than eating.

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




