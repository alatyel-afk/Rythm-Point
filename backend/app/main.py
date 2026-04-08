from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from app.api.routes import router

app = FastAPI(title="Jyotish Daily Protocol API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api", tags=["protocol"])


@app.get("/", response_class=HTMLResponse)
def root() -> str:
    """Браузер на порту API без пути / раньше получал 404 — показываем, где интерфейс."""
    return """<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>API — Джйотиш протокол</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 36rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; color: #1a1a1a; }
    a { color: #0f4c81; }
    code { background: #f0f0ec; padding: 0.1em 0.35em; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Это сервер API (Python)</h1>
  <p>Интерфейс приложения нужно открывать отдельно — обычно это <strong>Next.js</strong> на порту <strong>3000</strong>:</p>
  <p><a href="http://127.0.0.1:3000/">http://127.0.0.1:3000/</a></p>
  <p>Документация API: <a href="/docs">/docs</a> · проверка: <a href="/health">/health</a></p>
  <p><small>Если порт другой — смотрите вывод <code>npm run dev</code> в папке <code>frontend</code>.</small></p>
</body>
</html>"""


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
