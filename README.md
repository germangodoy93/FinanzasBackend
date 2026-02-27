# FinanzasCO Backend

# FinanzasCO Backend

This is a minimal Express-based backend to accompany the frontend React demo.

## Getting started

```bash
cd backend
npm install
npm run dev   # or npm start
```

The server will start on port 4000 by default. Data is persisted to `data.db` using SQLite via **better-sqlite3**; tables are created automatically on first run.

### Endpoints

- `POST /api/register` – body `{email, pass}`
- `POST /api/login` – body `{email, pass}`
- `GET /api/txns` – list transactions
- `POST /api/txns` – add transaction
- `DELETE /api/txns/:id` – remove transaction
- `GET /api/profile` – get profile data
- `POST /api/profile` – save profile data

Data is stored in a SQLite database (`./data.db`) so it survives restarts.

> **Why better-sqlite3?**  
> `better-sqlite3` provides native prebuilt binaries for Linux/Alpine, eliminating the
> "invalid ELF header" errors that occur when deploying `sqlite3` to containerized
> environments like Railway, Heroku, or Docker. The synchronous API is also simpler
> and faster for small-to-medium applications.

You can expand this with a real database or additional REST resources as needed.