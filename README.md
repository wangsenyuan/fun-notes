# fun-notes

Notes on tech, Java, algorithms, and more — hosted on GitHub Pages.

## Add a note

Create a markdown file in `docs/_notes/` with front matter:

```markdown
---
title: Your Note Title
tags: java, algorithm, tech
date: 2025-02-11
---

Your content here...
```

## Run locally

```bash
cd docs
bundle install
bundle exec jekyll serve
```

Open http://localhost:4000/fun-notes/

## Deploy to GitHub Pages

1. Push to GitHub
2. Settings → Pages → Source: `main` branch, `/docs` folder
3. Site: https://wangsenyuan.github.io/fun-notes/
