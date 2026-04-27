# XYAN12 Portfolio

A bilingual personal portfolio site built from selected public GitHub repositories.

## File Structure

```text
.
├── assets
│   └── images
│       ├── melbourne-cafe.jpg
│       ├── melbourne-monuments.jpg
│       └── taskmaster-focus.jpg
├── index.html
├── README.md
├── script.js
└── styles.css
```

## Local Preview

Because this is a static site, you can preview it with any simple local server.

Example:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deploy to GitHub Pages

1. Push these files to the `main` branch of the repository.
2. Open the repository on GitHub.
3. Go to `Settings` -> `Pages`.
4. Under `Build and deployment`, set:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`
5. Save the settings and wait for GitHub Pages to publish the site.

The site will then be available at the repository's GitHub Pages URL.

## Notes

- The site defaults to English and supports switching to Chinese with the `EN / 中文` toggle.
- Content is curated from public repository README files and repository structure only.
- Sensitive items such as personal email, keys, tokens, and private details are intentionally excluded.
