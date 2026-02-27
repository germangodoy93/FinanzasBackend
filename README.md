# FinanzasCO Backend

This is a minimal Express-based backend to accompany the frontend React demo.

## Getting started

```bash
cd backend
npm install
npm run dev   # or npm start
```

The server will start on port 4000 by default. Data is persisted to `data.db` using SQLite; tables are created automatically on first run.

### Endpoints

- `POST /api/register` – body `{email, pass}`
- `POST /api/login` – body `{email, pass}`
- `GET /api/txns` – list transactions
- `POST /api/txns` – add transaction
- `DELETE /api/txns/:id` – remove transaction
- `GET /api/profile` – get profile data
- `POST /api/profile` – save profile data

Data is stored in a SQLite database (`./data.db`) so it survives restarts. The in-memory storage used in earlier examples has been replaced.

> **Deployment note:**
> When deploying to Linux/Alpine environments (Railway, Heroku, etc.) the
> native `sqlite3` binary must be rebuilt for the target platform. The `postinstall`
> script in `package.json` (which runs `npm rebuild sqlite3 --build-from-source`)
> handles this automatically and avoids runtime errors such as `invalid ELF header`.

You can expand this with a real database or additional REST resources as needed.