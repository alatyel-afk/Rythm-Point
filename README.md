# Джйотиш · контроль питания

Веб-приложение ежедневного протокола питания с расчётом лунного дня, титхи, транзитной накшатры и матрицы обедов (Next.js + локальный движок правил). Опционально — Python-бэкенд через прокси.

## Быстрый старт (только фронтенд)

Требуется **Node.js 18+**.

```bash
cd frontend
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) — редирект на «Сегодня».

Продакшен-сборка:

```bash
npm run build
npm run start
```

Сервер слушает **порт 3000** (скрипты зафиксированы в `package.json`, чтобы не путаться с переменной `PORT` в окружении).

## Переменные окружения

В `frontend/.env.local` (не коммитится):

- `NEXT_PROXY_API` — если задан (например `http://127.0.0.1:8000`), запросы к `/api/*` сначала пробуют этот бэкенд; при ошибке используется встроенный mock-движок.

## Python-бэкенд (опционально)

```bash
cd backend
# создайте venv и установите зависимости по pyproject/requirements проекта
```

Запускайте API и при необходимости укажите `NEXT_PROXY_API` для фронтенда.

## Тесты

```bash
cd frontend
npm test
```

## Публикация на GitHub

1. Создайте пустой репозиторий на GitHub.
2. В корне проекта:

```bash
git init
git add .
git commit -m "Initial commit: Jyotish nutrition protocol app"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

Не коммитьте `.env.local` и `node_modules/` — они уже в `.gitignore`.
