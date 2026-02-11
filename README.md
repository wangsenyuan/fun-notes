# fun-notes

This repository now includes a simple GitHub Pages site (static) that acts as a personal notes app which remembers notes in your browser.

Usage
 - Open the site locally by opening [docs/index.html](docs/index.html) in a browser.
 - The app stores notes in `localStorage` so they persist in your browser.

Deploy to GitHub Pages
 - Commit and push the repo to GitHub.
 - In your repository Settings -> Pages, set Source to `main` (or `master`) and the `docs/` folder, then save.
 - The site will be available at `https://<your-username>.github.io/<repo>/` after a minute.

Quick commands
```bash
git add docs README.md
git commit -m "Add GitHub Pages notes app"
git push origin main
```

Notes & next steps
 - Notes are stored locally in your browser; to sync across devices, connect a remote backend (ask me if you want that).
 - You can export/import notes as JSON using the UI.
