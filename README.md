# XYAN12 Portfolio

This repository contains Xiaoyu's bilingual portfolio site plus a separate Cloudflare Workers chatbot backend. The frontend stays fully static for GitHub Pages, while the Worker handles all DeepSeek API calls securely with environment variables, validation, and request controls.

## Project Overview

- Static frontend: GitHub Pages-compatible portfolio built with `index.html`, `styles.css`, and `script.js`
- Shared portfolio data: sanitized bilingual project, skill, and experience data in [`src/portfolio-data.js`](/Users/xiaoyu/Documents/Xiaoyu/my-portfolio/src/portfolio-data.js)
- Chatbot UI: floating bottom-right portfolio assistant that calls a backend endpoint and shows visible steps without exposing private reasoning
- Backend: Cloudflare Worker in [`worker/src/index.js`](/Users/xiaoyu/Documents/Xiaoyu/my-portfolio/worker/src/index.js) that talks to DeepSeek using `DEEPSEEK_API_KEY`

## Features

- Bilingual portfolio content in English and Chinese
- Floating responsive chatbot button and compact chat panel
- Portfolio-only assistant responses grounded in sanitized project data
- Visible step log:
  `Understanding the question`, `Searching portfolio data`, `Selecting relevant projects or skills`, `Generating final answer`
- Cloudflare Worker validation, CORS handling, rate limiting, daily quota checks, and simple answer caching
- Optional Turnstile verification support in the backend when `TURNSTILE_SECRET_KEY` is configured
- Lightweight test setup using Node's built-in test runner

## Local Frontend Testing

Run the automated tests:

```bash
npm test
```

Preview the static portfolio locally:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000
```

When the frontend is served from `localhost` or `127.0.0.1`, the chatbot automatically falls back to `http://127.0.0.1:8787/api/chat` if the meta endpoint is still blank.

## Local Cloudflare Worker Testing

Install the local tooling once:

```bash
npm install
```

Create a local secrets file from the example:

```bash
cp .dev.vars.example .dev.vars
```

Set at least `DEEPSEEK_API_KEY` in `.dev.vars`, then start the Worker:

```bash
npm run worker:dev
```

Wrangler will serve the Worker locally, typically at:

```text
http://127.0.0.1:8787/api/chat
```

## Required Environment Variables

Required:

- `DEEPSEEK_API_KEY`: DeepSeek API key used only by the Cloudflare Worker
- `ALLOWED_FRONTEND_ORIGIN`: the deployed GitHub Pages origin allowed by CORS, for example `https://<your-github-username>.github.io`

Useful optional variables:

- `RATE_LIMIT_MAX_PER_MINUTE`: per-IP rate limit, default `5`
- `DAILY_REQUEST_QUOTA`: per-IP daily quota, default `40`
- `MAX_INPUT_CHARS`: user input limit, default `500`
- `MAX_OUTPUT_TOKENS`: DeepSeek output cap, default `280`
- `DEEPSEEK_MODEL`: defaults to `deepseek-chat`
- `TURNSTILE_SECRET_KEY`: enables backend Turnstile verification if you choose to wire a frontend token flow

## How To Deploy Frontend To GitHub Pages

1. Deploy the Worker first and copy its public `/api/chat` URL.
2. Update the `content` value of the `portfolio-chatbot-endpoint` meta tag in [`index.html`](/Users/xiaoyu/Documents/Xiaoyu/my-portfolio/index.html) to your deployed Worker URL.
3. Push the repository to GitHub.
4. In GitHub, open `Settings` -> `Pages`.
5. Set `Source` to `Deploy from a branch`.
6. Choose the `main` branch and the root folder.
7. Save and wait for GitHub Pages to publish.

The frontend remains static and GitHub Pages-compatible because no secret values are embedded in the site.

## How To Deploy Backend To Cloudflare Workers

1. Install dependencies with `npm install`.
2. Authenticate with Cloudflare:

```bash
npx wrangler login
```

3. Add the DeepSeek secret:

```bash
npx wrangler secret put DEEPSEEK_API_KEY
```

4. Set `ALLOWED_FRONTEND_ORIGIN` to your GitHub Pages URL in [`wrangler.toml`](/Users/xiaoyu/Documents/Xiaoyu/my-portfolio/wrangler.toml) or through Cloudflare environment configuration.
5. Optionally add `TURNSTILE_SECRET_KEY` if you want backend Turnstile verification enabled.
6. Deploy:

```bash
npm run worker:deploy
```

## How To Connect Frontend To Backend Endpoint

Use the deployed Worker URL in the `portfolio-chatbot-endpoint` meta tag:

```html
<meta
  name="portfolio-chatbot-endpoint"
  content="https://your-worker-subdomain.workers.dev/api/chat"
/>
```

That URL is safe to expose in the frontend because it is only the public Worker endpoint, not the DeepSeek API key.

## Security Notes

- Never put `DEEPSEEK_API_KEY` or any other secret into frontend code, HTML, or client-side JavaScript.
- GitHub Pages is static hosting only, so all provider requests must go through the Cloudflare Worker.
- The Worker restricts answers to sanitized portfolio data and ignores arbitrary prompt injection fields from the client.
- The Worker applies per-IP rate limiting and per-IP daily quota checks to help control abuse and cost.
- The Worker caps input length and output tokens to reduce prompt abuse and response cost.
- The Worker returns generic failure messages instead of raw provider errors and never echoes secrets back to the client.
- `.dev.vars` is ignored by git via [`.gitignore`](/Users/xiaoyu/Documents/Xiaoyu/my-portfolio/.gitignore).

## Tests Added

- Frontend chatbot tests: [`tests/chatbot-ui.test.js`](/Users/xiaoyu/Documents/Xiaoyu/my-portfolio/tests/chatbot-ui.test.js)
- Worker chatbot tests: [`tests/worker.test.js`](/Users/xiaoyu/Documents/Xiaoyu/my-portfolio/tests/worker.test.js)

The test suite uses Node's built-in test runner, so no browser test framework is required for local verification.
