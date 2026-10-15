# Bible Type

A calm, responsive Bible-verse typing website inspired by the focused practice experience of Monkeytype. Built with HTML, CSS, and native JavaScript modules. No dependencies, API keys, account, or build step.

## Run locally

Requires Node.js 18 or newer. In the VS Code terminal:

```sh
npm run dev
```

Open http://localhost:5173. To use another port: `PORT=3000 npm run dev`.

```sh
npm test
```

## Features

- 21 curated World English Bible Classic verses from Psalms, Proverbs, John, and 1 Corinthians.
- Single-verse and 30/60/120-second practice; timed mode continues through verses.
- Per-character feedback, live WPM and accuracy, elapsed/remaining time, and results.
- Searchable verse library and book filter.
- Dark/light theme and the last 100 results saved in localStorage on this browser.
- Responsive layout, mobile keyboard input, keyboard navigation, reduced-motion support.
- Escape restarts; Alt+Enter selects the next verse. Paste/drop is disabled during practice.

A session starts with the first entered character. Verse practice ends when all positions are filled (errors are allowed and reported). WPM is currently correct characters divided by five, divided by elapsed minutes. Accuracy measures correct insertion attempts / all insertion attempts; fixing an error does not erase the original mistake. The timer continues while the tab is in the background or a dialog is open. Switching modes, books, or verses resets the current session.

## Content and attribution

Scripture is from the public-domain World English Bible Classic: https://ebible.org/eng-web/ . The source chapters are Psalms 23, Proverbs 1, John 1, and 1 Corinthians 1. Verse references link to the source chapter. Line breaks are collapsed and curly apostrophes normalized for ordinary keyboards. This is a curated library, not the complete Bible. Add passages in `verses.js` and their source chapter mapping in `app.js` as needed.

## Project layout

- `index.html` — page structure and dialogs
- `style.css` — responsive themes and typography
- `app.js` — session behavior, library, preferences, history
- `engine.js` — scoring helpers
- `verses.js` — curated Scripture
- `engine.test.js` — scoring and content checks
- `server.js` — dependency-free local development server

## Version control and hosting

The project uses Git. Review changes with `git status` and `git diff`, then save them with `git add .` and `git commit`. No remote repository or public deployment is configured. To deploy on static hosting, publish `index.html`, `style.css`, `app.js`, `engine.js`, and `verses.js` together; no build command is needed. The included server binds only to localhost and is for local development.
