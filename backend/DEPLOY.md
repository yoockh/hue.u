# Deploying the hue.u backend to Heroku

Step-by-step guide to deploy the Express backend (`backend/`) to Heroku.

> **Monorepo note:** this repository holds both `frontend/` and `backend/`. The
> Node app, its `package.json`, and the `Procfile` live in `backend/`, **not** at
> the repository root. Heroku's Node buildpack expects them at the root of what it
> receives, so we push the `backend/` subdirectory as the app root using
> `git subtree` (see step 6). An alternative monorepo-buildpack approach is noted
> at the end.

---

## Prerequisites

- A [Heroku account](https://signup.heroku.com/).
- Git, with your work committed on a branch (or `main`).

## 1. Install the Heroku CLI

- **macOS (Homebrew):** `brew tap heroku/brew && brew install heroku`
- **Linux (snap):** `sudo snap install heroku --classic`
- **Windows / other:** see https://devcenter.heroku.com/articles/heroku-cli

Verify the install:

```bash
heroku --version
```

## 2. Log in

```bash
heroku login
```

This opens a browser to authenticate. On a headless machine use `heroku login -i`
for an interactive terminal login.

## 3. Create the Heroku app

From the repository root:

```bash
heroku create hue-u-backend
```

Pick your own unique name (Heroku app names are global) or omit it to get a
random one. This adds a `heroku` git remote pointing at the new app.

## 4. Set the environment variables

**IMPORTANT — this is the most common beginner mistake:** Heroku does **not**
read your local `.env` file. `.env` is git-ignored and never leaves your machine.
Every variable the server needs must be set explicitly on Heroku, either in the
dashboard (**Settings → Config Vars**) or with `heroku config:set` as shown below.

The full list (from `backend/.env.example`):

| Variable | Required | Notes |
|---|---|---|
| `PORT` | **No — do not set** | Heroku assigns the port dynamically and injects it. `server.js` already reads `process.env.PORT`. Setting it yourself will break the dyno. |
| `PERFECTCORP_API_KEY` | **Yes** | PerfectCorp / YouCam V2 API key. Get one at https://yce.makeupar.com/api-console/en/api-keys/ |
| `PERFECTCORP_BASE_URL` | No | Defaults to `https://yce-api-01.makeupar.com`. Only set to override. |
| `FIREBASE_PROJECT_ID` | **Yes** | From the Firebase service-account JSON. |
| `FIREBASE_CLIENT_EMAIL` | **Yes** | From the Firebase service-account JSON. |
| `FIREBASE_PRIVATE_KEY` | **Yes** | From the service-account JSON. See the newline note below. |

Set the required ones:

```bash
heroku config:set PERFECTCORP_API_KEY="your_api_key_here"
heroku config:set FIREBASE_PROJECT_ID="your_firebase_project_id"
heroku config:set FIREBASE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
```

### Setting `FIREBASE_PRIVATE_KEY` (multi-line key)

The private key is a multi-line PEM. Store it exactly as in `.env.example`: on a
single line, quoted, with the newlines written as literal `\n`. `src/config/env.js`
converts the `\n` sequences back into real newlines at startup.

```bash
heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...your...key...\n-----END PRIVATE KEY-----\n"
```

> If your shell mangles the quoting, set this one via the dashboard instead
> (**Settings → Config Vars → Reveal Config Vars**), pasting the same
> single-line, `\n`-escaped value.

Confirm everything is set:

```bash
heroku config
```

> **Coming soon:** once the Cloudinary integration is merged, three more required
> vars will appear in `.env.example` — `CLOUDINARY_CLOUD_NAME`,
> `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — and must be set here the same way
> (find them at https://console.cloudinary.com/app/settings/api-keys).

## 5. Verify Heroku-readiness (already configured)

These are already in place in `backend/` — listed so you know what Heroku relies on:

- **`Procfile`** — `web: node server.js` (tells Heroku how to start the web dyno).
- **`package.json` → `engines.node`** — pins the Node.js runtime (`24.x`).
- **`package.json` → `scripts.start`** — `node server.js` (fallback start command).
- **Dynamic port** — `server.js` binds `process.env.PORT`; no hardcoded port.

## 6. Deploy (push the `backend/` subdirectory)

Because the app lives in `backend/`, push just that subtree as the app root:

```bash
git subtree push --prefix backend heroku main
```

- Run this from the repository root.
- It deploys the current committed state of `backend/` — commit first.
- If Heroku's default branch is `main`, the target is `main` as shown. (Older
  apps may use `master`.)

If a push is rejected as non-fast-forward (e.g. after a rebase), force it with:

```bash
git push heroku `git subtree split --prefix backend HEAD`:refs/heads/main --force
```

Ensure at least one web dyno is running:

```bash
heroku ps:scale web=1
```

Open the app:

```bash
heroku open
```

Health check: `https://<your-app>.herokuapp.com/health` should return
`{"status":"ok"}`. API docs are at `/api-docs`.

## 7. Check logs when something breaks

```bash
heroku logs --tail
```

This streams live logs. Common startup failures:

- **`Missing required environment variable(s): ...`** — a config var from step 4 is
  missing or empty. Set it and the dyno will restart.
- **App crashed / `R10 Boot timeout`** — the process didn't bind `process.env.PORT`
  in time. Confirm you didn't set `PORT` yourself in step 4.
- **`H14 No web processes running`** — run `heroku ps:scale web=1`.

Restart the app manually if needed:

```bash
heroku restart
```

---

## Alternative: monorepo buildpack (deploy without `git subtree`)

If you prefer plain `git push heroku main` from the repo root, use the community
monorepo buildpack so Heroku treats `backend/` as the app root:

```bash
heroku buildpacks:add -i 1 https://github.com/lstoll/heroku-buildpack-monorepo
heroku buildpacks:add heroku/nodejs
heroku config:set PROJECT_PATH=backend
git push heroku main
```

Pick **one** approach (subtree *or* monorepo buildpack), not both.
