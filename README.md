# SNACKPACK

Full-stack scaffold with:
- Ionic + Angular frontend in `frontend`
- Node.js LoopBack 4 backend in `backend`

## Prerequisites
- Node.js 20+ (22+ recommended for latest Capacitor tooling)
- npm 10+

## Install

```bash
npm run install:all
```

## Run apps

Frontend:

```bash
npm run dev:frontend
```

Backend:

```bash
npm run dev:backend
```

## Build

```bash
npm run build
```

Or individually:

```bash
npm run build:frontend
npm run build:backend
```

## Notes
- Frontend Capacitor initialization was skipped by Ionic CLI due Node.js version constraints in this environment.
- You can still run and build the web app normally.
- To use latest Capacitor native tooling, use Node.js 22+ and run:

```bash
cd frontend
npx cap init frontend io.ionic.starter --web-dir www
```
