# Deadlock

## The Annoyance
Friends often spend more time deciding where to eat or hang out than actually going there. Everyone says “kuch bhi chalega” but rejects every suggestion. This happens regularly in my friend group.

## The Constraint
**One Thumb:** The app had to be fully usable with one hand. I designed it with thumb-friendly buttons, swipe actions, and left/right hand modes.

## The Great Part
**Swipe Voting:** Users can quickly swipe through options and vote instead of spending time arguing or typing.

## The Two Testers
- **Tester 1:** Was confused about some controls → I made the actions clearer.
- **Tester 2:** Had difficulty reaching some controls → I moved important controls lower and added hand modes.

## AI
I used AI for UI ideas, swipe logic, and debugging. One generated swipe implementation conflicted with my existing UI state, so I modified it manually.

## Not Done
- Google Places autocomplete is not implemented yet.
- Some Maps functionality is still basic.

## Run It

```bash
git clone https://github.com/AthvaCodes/DeadLock.git
cd DeadLock
npm install
npm start
```

##Environment Variables
```
PORT=
NODE_ENV=
SUPABASE_URL=
SUPABASE_SECRET_KEY=
