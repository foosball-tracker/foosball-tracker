# Product: Foosball Tracker

## Register

Product. Design serves the task.

## Users

Foosball players and enthusiasts tracking casual matches, scores, and team rosters. Typically in a social setting: a game room, office break area, or bar. Phone in hand, glancing between the table and the screen. Ambient lighting varies from bright to dim.

## Purpose

Track foosball matches in real time: start a game, record goals, see elapsed time, view goal history, manage players and teams. Secondary use: browse player and team records outside of active play.

## Brand Personality

Functional, playful, direct. The app is a scoreboard with memory, not a social network. No gamification theatre, no achievement badges, no "level up" copy. The personality lives in the score display (large, bold numerals) and the team colour indicators, not in decorative elements.

## Voice

Clear, task-oriented. Button labels say what will happen: "Start Game", "Reset Game", "Create Player", "Delete". Error messages name the problem. No marketing language, no motivational copy.

## Anti-References

- Gamification cliches (XP bars, streak counters, achievement unlocks).
- SaaS dashboard aesthetics applied to a game tracker.
- Neon or arcade-themed "retro game" styling.
- Purple gradients, glassmorphism, glass cards.
- Heavy custom illustrations or mascot characters.

## Design Principles

1. **The table is the primary interface.** The app is a companion, not the main event. Get in, record the goal, get out.
2. **Semantic colours only.** Every colour is a DaisyUI token that adapts to both themes. No hard-coded hex values in component code.
3. **Consistency over surprise.** The same button shape, the same card structure, the same form vocabulary on every screen.
4. **Both themes are first-class.** Every UI change must work in winter (light) and dim (dark).

## Accessibility Needs

- Touch targets must be large enough for one-handed use while standing.
- Score numerals must be legible at a glance from arm's length.
- Theme switch must respect `prefers-color-scheme` by default.
