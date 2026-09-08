# HR Portal — Frontend

Web UI for the HR Portal: a dashboard for employees, attendance, leave, payroll, recruitment, performance, and organization management. Built with Next.js 16, React 19, Redux Toolkit, Tailwind CSS 4, and shadcn/ui.

Pairs with the [HR Portal Backend](https://github.com/Abaidullah9/HR-Portal-Backend) (Express + MongoDB REST API).

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **State:** Redux Toolkit with typed async thunks
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **API:** Typed fetch client with `ApiResponse<T>` envelope matching the backend
- **Testing:** Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 20+
- The [backend](https://github.com/Abaidullah9/HR-Portal-Backend) running on `http://localhost:5000`

### Setup

```bash
npm install
```

Create a `.env.local` file in the project root (optional in dev — see `.env.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

> If omitted, the client defaults to `http://localhost:5000/api/v1`.

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | Backend base URL (default `http://localhost:5000/api/v1`) |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build (with full type checking) |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Run Vitest in watch mode |

## Authentication

Auth is **cookie-based**: on login the backend sets an httpOnly `accessToken` cookie, and every API request is sent with `credentials: 'include'` — no token is stored in `localStorage`.

- `login` → POST `/users/login` (cookie set by backend)
- `signup` → POST `/users/register`
- `logout` → POST `/users/logout` (cookie cleared)
- On app mount, `ProtectedWrapper` calls `/users/me` to restore the session

CORS must allow the frontend origin with credentials on the backend (already configured via its `FRONTEND_URL` env var).

## App Pages

| Route | Description |
|---|---|
| `/login` | Sign in |
| `/signup` | Create an account |
| `/` | Dashboard |
| `/employees` | Employee directory + add employee |
| `/attendance` | Attendance records |
| `/leaves` | Leave requests |
| `/payroll` | Payroll management |
| `/recruitment` | Job postings, candidates, interviews |
| `/performance` | Appraisals by role (HR / manager / employee views) |
| `/organization` | Departments, teams, organization settings |
| `/reports` | Reports |
| `/settings` | Settings |

## Project Structure

```
app/                 # Next.js App Router pages
components/
├── ui/              # shadcn/ui primitives
├── layout/          # Sidebar, header, protected wrapper
├── employees/       # Feature components
├── performance/     # HR / manager / employee views
├── common/          # Shared data table, stat cards, badges
└── announcements/
lib/
├── api/client.ts    # Typed fetch client (ApiResponse<T>, credentials: include)
├── redux/
│   ├── store.ts     # Redux store
│   └── slices/      # One slice per domain, async thunks call the API
└── utils.ts
types/               # Domain types per module
test/                # Vitest setup
```

## Testing

```bash
npm test
```

Covers Redux auth slice (reducers + async thunks) and shared utilities. Run the backend alongside integration tests for end-to-end verification.
