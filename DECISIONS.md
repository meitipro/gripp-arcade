# Decisions

1. **Local-first.** The plan wants Discord, Postgres and Redis. None can run without the owner's keys, so the first deploy works with zero configuration and stores member state on the device. Server pieces (run tokens, verification, Servo, boards, card image, cron) are real and ready for a database behind them.
2. **Level formula.** The plan states XP(L) = floor(60 x L^1.55) but its example table (e.g. level 50 = 518,747) does not match it. The formula is implemented; the table is not.
3. **Verification.** Range and time-floor checks run for every ranked game. Full deterministic server replay is designed (every game logs its moves from a seed) but only Servo has server authority today.
4. **Shortened sessions.** Some games run shorter than the plan (Pick & Place 60 s, Command Line 45 s, Region Rally 30 s, Pixel Wall cooldown 10 s) so a first-time visit is quick. Thresholds were scaled to match.
5. **Content.** Intent Check uses written scenarios, not video. Whitepaper Duel, Region Rally, Blind Operator and Claw Club faces use bots or samples until a realtime layer exists.
6. **Servo is the only game that calls the network**, by design, to keep the answer off the client.
