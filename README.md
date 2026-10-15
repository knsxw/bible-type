# Bible Type — NIV

A Bible-verse typing site with a 66-book library, chapter/verse browsing, single-verse and timed practice, live speed and accuracy, dark/light themes, and local score history.

## Connect NIV

NIV text is fetched on demand from API.Bible. No NIV corpus is bundled, and no other translation is substituted. Without credentials, the book/chapter browser works and typing displays a setup message.

1. Create or use an account at https://api.bible/ and enable an English New International Version edition for this application. Access and permitted uses depend on your provider agreement. Check that your intended typing-practice use is covered.
2. Copy `.env.example` to `.env` in this project.
3. In VS Code, enter your `API_BIBLE_KEY` and `NIV_BIBLE_ID` into `.env`. Copy the exact edition ID from your API.Bible dashboard. Do not paste your key into chat or into browser code.
4. Run `npm run dev` and open http://localhost:5173. Restart the server after changing `.env`.

Node.js 18+ is required. No package installation or build step is needed. Run `npm test` for automated checks.

The server checks that the configured Bible identifies itself as English NIV, fetches its book and chapter catalog, and requires all 66 canonical books. Verse IDs are fetched from the provider so omitted/combined verses follow that edition rather than an assumed numbering scheme. Random practice selects a book, chapter, then an available verse; it is not uniformly weighted across every verse in the Bible.

## Practice

Choose a book filter or browse Verse library → book → chapter → verse. Single-verse practice finishes when every character position is filled, with errors included in the result. Timed practice offers 30/60/120 seconds and advances to another verse. Time spent loading the next verse is excluded. If a transition fails, the session stops without saving an incomplete score; use Next verse to start again.

Escape restarts, Alt+Enter chooses a new verse. Pasting and dropping text into practice is disabled. WPM uses currently correct characters / 5 / elapsed minutes. Accuracy counts all insertion attempts, including corrected mistakes. Whitespace and typographic punctuation are normalized for keyboard entry; words are not rewritten.

Scores (up to 100) and theme preference are saved in browser localStorage. Existing WEB results retain their translation label. Scripture text is not saved to disk or localStorage. API responses use `Cache-Control: no-store`. API.Bible's required fair-use tracker is loaded when Scripture with tracking metadata is displayed; score history is not sent to that tracker. Copyright information returned by the provider is displayed below the passage.

## Files

- `index.html`, `style.css`, `app.js`: responsive UI and practice logic
- `books.js`: 66-book catalog (metadata only)
- `source.js`: browser data access and provider view reporting
- `bible-api.js`: private server-side API.Bible adapter
- `server.js`: localhost server and restricted endpoints
- `engine.js`: scoring helpers
- `*.test.js`: scoring, canon, and mocked provider tests
- `.env.example`: configuration template; `.env` is ignored by Git

## Verification and deployment

Automated API tests use synthetic fixtures, not NIV text. Live authenticated retrieval cannot be verified until credentials with NIV access are configured. The app must run with its Node server; it is no longer a static-only site. The development server binds to localhost. Before public hosting, use a production backend with appropriate rate limits and the provider license for your audience/use.

Provider documentation: https://docs.api.bible/ . NIV permissions: https://www.biblica.com/permissions/ . Git is initialized locally; no remote or deployment is configured.
