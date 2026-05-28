# Habit Tracker Frontend (React)

## Development

Uses environment variables from `.env`:

- `REACT_APP_API_BASE` / `REACT_APP_BACKEND_URL` for API base
- `REACT_APP_WS_URL` for real-time WS (shown in Settings)
- `REACT_APP_PORT` for dev server port (3000)

### Commands

```bash
npm install
npm start
```

## Notes

The UI works even if backend endpoints differ: it falls back to `localStorage` for habit CRUD and completion logging.
