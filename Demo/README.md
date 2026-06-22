# Demo

| File | Description |
|---|---|
| `Demo_Video_Link.txt` | Link to hosted demo video |
| `Demo_Video.mp4` | Local demo recording — add manually after recording |

## How to Run the Live Demo

```bash
# Terminal 1 — Backend
cd Source_Code/backend
npm run dev

# Terminal 2 — Frontend (PowerShell)
cd Attached-Assets/Attached-Assets/artifacts/resolutioniq
$env:PORT="5173"; $env:BASE_PATH="/"; pnpm run dev
```

Open: **http://localhost:5173**
