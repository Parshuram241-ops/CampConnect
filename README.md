# CampConnect

CampConnect is a React/Vite frontend with an Express API and MongoDB database.

## Deploy

### 1. MongoDB Atlas

Create a MongoDB Atlas cluster and database user, configure network access for Render, and copy the database connection string. Replace its username/password placeholders and use it as `MONGO_URI`. Do not commit credentials.

### 2. Backend on Render

Create a Render Web Service from this repository using the included `render.yaml` Blueprint. If configuring it manually, set the root directory to `server`, build command to `npm install`, start command to `npm start`, and health check path to `/api/health`.

Set these Render environment variables for the initial deploy:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long, unique random secret |
| `SESSION_SECRET` | Different long, unique random secret |

After Render creates the service, copy its public origin for the `BACKEND_URL` value. After the Vercel deployment is created, set `CLIENT_URL` to its frontend origin in Render. Add additional Vercel preview/custom-domain origins as a comma-separated `CLIENT_URLS` value if needed. Render will restart the API when its environment variables change.

### 3. Frontend on Vercel

Import the repository into Vercel with the repository root as the project root. Vercel detects Vite; use `npm run build` and `dist` if prompted.

Add this Vercel environment variable for Production (and Preview if needed):

| Variable | Value |
| --- | --- |
| `VITE_API_URL` | `https://<your-render-service>.onrender.com/api` |

The included `vercel.json` sends frontend routes to `index.html`, so React Router routes work on refresh.

If Google sign-in is enabled, set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Render after setting `CLIENT_URL` and `BACKEND_URL`. Add `BACKEND_URL/api/auth/google/callback` as an authorized redirect URI in Google Cloud Console. If your email OTP flow is enabled, configure `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASSWORD` in Render.

### Local development

Copy `server/.env.example` to `server/.env` and set your MongoDB URI and secrets. The frontend defaults to `http://localhost:5000/api`; set `VITE_API_URL` in a root `.env.local` only if you need to override it. Run `npm run dev:all`.
