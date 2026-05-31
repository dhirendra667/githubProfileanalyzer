# GitHub Profile Analyzer

A full-stack application that analyzes GitHub user profiles using the GitHub Public API and stores rich insights in a MySQL database.

## Tech Stack

**Backend:** Node.js, Express.js, MySQL (mysql2), Axios  
**Frontend:** React 18, Vite, Redux Toolkit, Tailwind CSS, React Router v6, react-hot-toast

---

## Features

- **Analyze any GitHub username** — fetches public profile + all repos in one shot
- **Derived Insights stored in MySQL:**
  - Public repo count, followers, following, public gists
  - Total stars and forks across all repos
  - Top 5 programming languages (by repo count)
  - Most starred repository + its star count
  - Account age in days
  - Hireable flag, site admin flag
  - Location, company, blog, email, Twitter username
- **Upsert logic** — re-analyzing a profile updates the existing record
- **Pagination** on the profiles list endpoint
- **Compare profiles** side-by-side (bonus endpoint)
- **Aggregate stats** across all stored profiles (bonus endpoint)
- **Delete profile** from database
- Frontend UI with dark theme (acid green accents, Syne + DM Sans + DM Mono fonts)

---

## Project Structure

```
github-analyzer/
├── server/                     # Express.js backend
│   ├── configs/
│   │   └── dbConn.js           # MySQL connection pool + table init
│   ├── controllers/
│   │   └── github.controller.js
│   ├── middlewares/
│   │   ├── asyncHandler.middleware.js
│   │   └── error.middleware.js
│   ├── routes/
│   │   └── github.routes.js
│   ├── utils/
│   │   ├── AppError.js
│   │   └── githubService.js    # GitHub API calls + insight derivation
│   ├── app.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── client/                     # React frontend
    ├── src/
    │   ├── config/axiosInstance.js
    │   ├── redux/
    │   │   ├── store.js
    │   │   └── slices/githubSlice.js
    │   ├── pages/
    │   │   ├── Home.jsx          # Analyze form + result card
    │   │   ├── ProfileList.jsx   # All stored profiles + stats
    │   │   └── ProfileDetail.jsx # Full profile detail
    │   ├── layouts/Layout.jsx
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## Setup

### 1. MySQL Database

```sql
CREATE DATABASE github_analyzer;
```

The table `github_profiles` is created automatically on server start.

### 2. Backend

```bash
cd server
cp .env.example .env
# Fill in your MySQL credentials in .env
npm install
npm run dev
```

Backend runs at `http://localhost:5000`

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API Reference

### Analyze a profile
```
POST /api/v1/github/analyze/:username
```
Fetches GitHub data, derives insights, upserts to MySQL. Returns the full profile object.

### Get all stored profiles
```
GET /api/v1/github/profiles?page=1&limit=10
```
Returns paginated list of all analyzed profiles with summary fields.

### Get single profile
```
GET /api/v1/github/profiles/:username
```
Returns full stored profile data for a given username.

### Delete a profile
```
DELETE /api/v1/github/profiles/:username
```

### Compare profiles (bonus)
```
GET /api/v1/github/compare?users=torvalds,gaearon
```
Compare two or more stored profiles side by side.

### Aggregate stats (bonus)
```
GET /api/v1/github/stats
```
Returns summary stats, top profiles by followers, top profiles by stars.

---

## GitHub Token (Optional but Recommended)

Without a token, GitHub API allows 60 requests/hour. With a token, it's 5000/hour.

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate a token (no scopes needed for public data)
3. Set `GITHUB_TOKEN=your_token` in `server/.env`

---

## .env Reference

```env
PORT=5000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=github_analyzer
DB_PORT=3306

GITHUB_TOKEN=optional_but_recommended
NODE_ENV=development
```
