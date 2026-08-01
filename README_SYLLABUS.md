# SkillMatch — Full Syllabus Coverage

Same product, same flow as the original SkillMatch: a user registers, uploads
a resume, scrapes company job pages, gets matched against postings, and uses
a dashboard + interview prep. This version adds a real data-science layer and
a second Node.js microservice so the project actually demonstrates every
topic below.

## Project Layout

```
SkillMatch/
├── backend/            Django REST API (unchanged flow) + NEW analytics app
│   └── app/
│       ├── auth/           Django Models & Users, JWT auth
│       ├── resume/         Resume CRUD, AI matching (Gemini)
│       ├── company/        REST APIs & Backend Services
│       ├── scraper/        Web Scraping, APIs & Data Ingestion (Playwright)
│       └── analytics/      NEW — Pandas/EDA, Visualization, ML, Deep Learning
├── node-service/       NEW — Node.js + Express + Mongoose microservice
│   ├── server.js           Node core modules & server creation
│   ├── middleware/auth.js  Express state management (JWT shared with Django)
│   ├── controllers/        Express fundamentals + advanced concepts
│   ├── models/              Mongoose schemas
│   └── routes/
└── frontend/            React (unchanged) + Analytics.jsx + Reviews.jsx pages
```

## Admin Panel

A separate, role-gated admin section was added on top of the syllabus features:

- `POST /auth/admin-login` — login endpoint that only succeeds for `role: "admin"` users.
- `frontend/src/pages/admin/` — `/admin/login`, `/admin/dashboard` (companies/jobs + delete + stats), `/admin/users` (promote/demote/delete), `/admin/reviews` (moderation, backed by the Node service).
- `backend/app/auth/permissions.py` — `IsAdmin` DRF permission, applied to all admin-only endpoints.
- `backend/app/auth/management/commands/make_admin.py` — one-time bootstrap: `python manage.py make_admin <email>`.
- Admin stats (`GET /companies/admin/stats`) and review stats (`GET /api/reviews/admin/stats`) both use MongoDB aggregation (`$group`, `$sum`, `$avg`, `$sort`) rather than plain counts, reinforcing the "MongoDB — Queries and Operators" topic.
- `node-service/middleware/adminAuth.js` shows cross-service role checking: the Node service reads the `role` field straight off the shared `users` collection (owned by Django/PyMongo) via a raw Mongoose `.collection()` query, since it doesn't have its own User model.

## Syllabus → Code Map

### Python
| Topic | File(s) |
|---|---|
| Data Analysis with Pandas & EDA | `backend/app/analytics/data_pipeline.py` |
| Data Visualization with Python | `backend/app/analytics/visualization.py` |
| Introduction to Machine Learning | `backend/app/analytics/regression_model.py`, `classification_model.py` |
| Regression – Model Training & Evaluation | `backend/app/analytics/regression_model.py` |
| Classification – Model Training & Evaluation | `backend/app/analytics/classification_model.py` |
| Introduction to Deep Learning | `backend/app/analytics/deep_learning_model.py` |
| Web Scraping, APIs & Data Ingestion | `backend/app/scraper/scraper_service.py` |
| Django Framework | `backend/app/config/`, all `app.*.apps` |
| Django Models and Users | `backend/app/auth/` |
| REST APIs & Backend Services | `backend/app/*/views.py`, `serializers.py`, `urls.py` |

### FSD
| Topic | File(s) |
|---|---|
| JSON | Every DRF response / axios call across both backends |
| Node.js – Intro & Core Modules | `node-service/utils/logger.js` (fs, path, os), `node-service/server.js` (http) |
| Node.js Modules & Server Creation | `node-service/server.js` |
| Express Fundamentals | `node-service/routes/`, `controllers/` |
| Express State Management & API | `node-service/middleware/auth.js` |
| Express – Advanced Concepts | `node-service/server.js` (central error handler), aggregation pipeline in `reviewController.js` |
| React Fundamentals & Core Concepts | `frontend/src/pages/*.jsx` |
| React Hooks & API Integration | `frontend/src/pages/Analytics.jsx`, `Reviews.jsx` (`useQuery`/`useMutation`) |
| MongoDB – Queries & Operators | `node-service/controllers/reviewController.js` (`$regex`, `$gte`, `$group`, `$avg`) |
| Mongoose & MERN Integration | `node-service/models/`, `node-service/config/db.js` |

## Running it

**Django backend** (unchanged, plus the new `analytics` app):
```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
```

**Node microservice** (new):
```bash
cd node-service
npm install
cp .env.example .env   # point MONGODB_URI at the same Mongo instance as Django
npm start              # runs on http://localhost:5001
```

**Frontend** (unchanged, plus 2 new pages):
```bash
cd frontend
npm install
npm run dev
```

Add to `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
VITE_NODE_API_URL=http://localhost:5001/api
```

## Notes

- The Node service and Django service share one JWT secret so a single
  login works across both APIs. **The variable name differs per service** —
  set the same secret value for `SECRET_KEY` in `backend/.env` and
  `JWT_SECRET_KEY` in `node-service/.env`. If the values don't match, tokens
  issued by Django will be rejected by the Node service (and vice versa)
  with no obvious error beyond a 401.
- The analytics app trains its models in-memory on a bundled synthetic
  `jobs_dataset.csv` (`backend/app/analytics/data/`) so predictions work out
  of the box; swap in real scraped job data from MongoDB once you have
  enough volume.
- A real MongoDB server isn't bundled — point `MONGODB_URI` at your own
  local Mongo instance or Atlas cluster in both `backend/.env` and
  `node-service/.env`.
- `google-generativeai` (used in `backend/app/resume/ai_service.py` and
  `backend/app/scraper/scraper_service.py`) has reached end-of-life
  upstream. It still runs, but Google recommends migrating to the
  `google-genai` package. Installing it alongside `tensorflow-cpu` can also
  trigger a protobuf version conflict warning from pip (both work at
  runtime today, but pin `protobuf` explicitly if you hit issues).
