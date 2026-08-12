# Hue.U Backend — Manual API Testing Guide

Ready-to-run `curl` commands for every endpoint. For a click-in-browser
alternative, use the Swagger UI at **http://localhost:5000/api-docs** (see
[README](README.md) → API Endpoints).

---

## 0. Prerequisites

```bash
cd backend
npm install
cp .env.example .env        # then edit .env
npm run dev                 # starts on http://localhost:5000
```

**Environment.** The server validates env on boot (`src/config/env.js`):

| Variable | Needed to... |
|----------|--------------|
| `PERFECTCORP_API_KEY` | **Boot the server at all.** Any non-empty value lets it start. `/health` and `/api/products` work without a *valid* key. A **real YouCam V2 API key** is required for `analyze-skin` and `try-on` to actually reach PerfectCorp. |
| `PERFECTCORP_BASE_URL` | Optional. Defaults to `https://yce-api-01.makeupar.com`. |
| `PORT` | Optional. Defaults to `5000`. |

Auth is **server → PerfectCorp** only. Our own endpoints need **no** auth header
from the caller, so every curl below works as-is.

**Sample images (you supply these).** The repo ships no sample photos. Before
testing the upload endpoints, drop your own into `backend/` (these names are
used by the commands below; they're git-ignored):

| File | Used by | Should be |
|------|---------|-----------|
| `sample-face.jpg` | `analyze-skin` | A clear, front-facing face photo, good lighting |
| `sample-body.jpg` | `try-on` (`src_image`) | A full-body photo, upright, facing camera |
| `sample-garment.jpg` | `try-on` (`ref_image`) | A garment/clothing product image (optional — you can use a URL instead) |

```bash
# Set once per shell so the commands are copy-paste-able:
export BASE=http://localhost:5000
```

---

## 1. `GET /health` — liveness check

No params. Use this first to confirm the server is up.

```bash
curl -s $BASE/health
```

Expected:
```json
{"status":"ok"}
```

---

## 2. `GET /api/products` — product catalog

| Param | In | Required | Notes |
|-------|----|:--------:|-------|
| `season` | query | optional | One of `spring \| summer \| autumn \| winter`. Omit → returns all 16 products. Invalid value → `400`. |

```bash
# All products
curl -s "$BASE/api/products"

# Filtered by season
curl -s "$BASE/api/products?season=winter"

# Invalid season -> 400 error shape
curl -s "$BASE/api/products?season=banana"
```

Success response:
```json
{
  "status": "success",
  "data": [
    { "id": 13, "name": "Royal Blue Blazer", "season": "winter",
      "color_name": "Royal Blue", "color_hex": "#4169E1", "price": 89.0,
      "currency": "USD", "garment_category": "upper_body",
      "image_url": "https://cdn.hue-u.example/products/royal-blue-blazer.jpg" }
  ]
}
```

> Works without a valid PerfectCorp key — reads local `products.json`.

---

## 3. `POST /api/analyze-skin` — skin-tone → season analysis ⭐ most critical

`multipart/form-data`.

| Field | In | Required | Notes |
|-------|----|:--------:|-------|
| `image` | form-data (file) | **required** | The face photo. Field name **must** be `image`. Images only, ≤ 10 MB. |

```bash
curl -s -X POST $BASE/api/analyze-skin \
  -F "image=@sample-face.jpg;type=image/jpeg"
```

Success response (shape to verify against PerfectCorp — see note):
```json
{
  "status": "success",
  "data": {
    "analysis": {
      "skin_color": "#E0AC69",
      "hair_color": "#3B2A1A",
      "eye_color": "#5A4632",
      "src_file_id": "…",
      "dst_id": "…"
    },
    "classification": { "undertone": "warm", "contrast": "high", "season": "spring" },
    "recommendations": {
      "palette": [ { "name": "Coral", "hex": "#FF7F50" } ],
      "explanation": "Your warm, golden undertones and high contrast … place you in the Spring palette …"
    }
  }
}
```

Common errors:
```bash
# Missing file -> 400 { "message": "A face photo is required." }
curl -s -X POST $BASE/api/analyze-skin
```

> ⚠️ **This is the endpoint to test first.** It's the only one whose PerfectCorp
> **response shape is unverified**: the backend expects `results.color.{skin_color,
> hair_color, eye_color}`. If the live API nests colors differently, you'll get
> `500 "Skin color analysis results not found in response."` — capture the raw
> response and compare. Needs a valid V2 key.

---

## 4. `POST /api/try-on` — virtual try-on (VTO)

`multipart/form-data`. You must provide **a source** and **a reference**:

| Field | In | Required | Notes |
|-------|----|:--------:|-------|
| `src_image` | form-data (file) | one of these | The model/body photo. |
| `src_file_id` | form-data (text) | one of these | Reuse a file id from a previous task (e.g. `src_file_id`/`dst_id` from `analyze-skin`) instead of re-uploading. |
| `ref_image` | form-data (file) | one of these | The garment reference image. |
| `ref_file_id` | form-data (text) | one of these | Reuse an already-uploaded garment file id. |
| `ref_image_url` | form-data (text) | one of these | Public URL of the garment image. |
| `garment_category` | form-data (text) | optional | `full_body` (default) \| `upper_body` \| `lower_body`. |

```bash
# A) Upload body photo + garment image file
curl -s -X POST $BASE/api/try-on \
  -F "src_image=@sample-body.jpg;type=image/jpeg" \
  -F "ref_image=@sample-garment.jpg;type=image/jpeg" \
  -F "garment_category=upper_body"

# B) Upload body photo + garment by URL
curl -s -X POST $BASE/api/try-on \
  -F "src_image=@sample-body.jpg;type=image/jpeg" \
  -F "ref_image_url=https://example.com/some-shirt.jpg" \
  -F "garment_category=upper_body"

# C) Chain from a prior analyze-skin result (no body re-upload)
curl -s -X POST $BASE/api/try-on \
  -F "src_file_id=PASTE_src_file_id_OR_dst_id_FROM_ANALYZE_SKIN" \
  -F "ref_image_url=https://example.com/some-shirt.jpg" \
  -F "garment_category=upper_body"
```

Success response:
```json
{
  "status": "success",
  "data": { "url": "https://…/result.jpg", "dst_id": "…", "src_file_id": "…" }
}
```

Validation errors (`400`):
```bash
# No source at all -> "Your model/body photo (src_image) or a src_file_id is required."
curl -s -X POST $BASE/api/try-on -F "ref_image_url=https://example.com/shirt.jpg"

# No reference at all -> "A clothing reference (ref_image, ref_file_id, or ref_image_url) is required."
curl -s -X POST $BASE/api/try-on -F "src_image=@sample-body.jpg"
```

> ⚠️ The catalog's `image_url`s are placeholders (`cdn.hue-u.example/...`), so use a
> **real** garment image URL/file when testing `ref_image_url` / `ref_image`.

---

## Quick reference

| Method | Path | Auth needed | Body |
|--------|------|-------------|------|
| GET | `/health` | none | — |
| GET | `/api/products` | none | `?season=` (optional) |
| POST | `/api/analyze-skin` | valid V2 key | `image` file |
| POST | `/api/try-on` | valid V2 key | `src_image`/`src_file_id` + `ref_image`/`ref_file_id`/`ref_image_url` + `garment_category?` |

Tip: pipe any JSON response through `| jq` for readable output.
