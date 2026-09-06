---
name: infrastructure
description: Прод-инфраструктура GTA6·БЛОГ — где что крутится (Vercel + VPS), схема сети, credentials, backup/restore, disaster recovery, troubleshooting. Триггерь при любом вопросе про деплой, prod-БД, MinIO, upload картинок, домены, DNS, TLS, бэкапы, восстановление после падений, миграции в проде, ENV-переменные Vercel.
---

# Инфраструктура GTA6·БЛОГ

**Гибридная схема:** веб-приложение на Vercel (serverless), данные и медиа на своём VPS.

## Топология

```
┌─────────────────────────────────────────────────────────────────┐
│  Vercel (Hobby, region: fra1 Frankfurt)                        │
│  ├─ Next.js 16 app из репы fullstakilla/gta6blog               │
│  ├─ Автодеплой на push в main                                  │
│  ├─ Прод-URL: https://gta6blog.vercel.app                      │
│  └─ Env-vars: DATABASE_URL, IRON_SESSION_SECRET, IP_HASH_SALT,│
│              NEXT_PUBLIC_SITE_URL, S3_*                        │
└──────────────────────────┬─────────────────────────────────────┘
                           │
              HTTPS (TLS) │ через открытый интернет
                           │
┌──────────────────────────▼─────────────────────────────────────┐
│  VPS (Ubuntu 24.04, 2 vCPU, 1.8 GB RAM, 58 GB, IP: 5.180.172.132)
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Docker Compose stack (/opt/gta6/)                        │  │
│  │                                                          │  │
│  │  ┌─────────────┐   ┌──────────────┐   ┌───────────────┐│  │
│  │  │  Postgres   │   │  MinIO       │   │  Caddy         ││  │
│  │  │  16         │   │  S3-compat   │◄──│  reverse proxy ││  │
│  │  │  :5433      │   │  :9000       │   │  :80, :443     ││  │
│  │  │  (SSL)      │   │  (private)   │   │  Let's Encrypt ││  │
│  │  └─────────────┘   └──────────────┘   └───────┬────────┘│  │
│  │                                                │          │  │
│  └────────────────────────────────────────────────┼──────────┘  │
│                                                   │             │
│  UFW firewall: allow 22, 80, 443, 5433            │             │
│  Cron: /opt/gta6/backup.sh @ 03:00 daily          │             │
└───────────────────────────────────────────────────┼─────────────┘
                                                    │
              https://gta6media.duckdns.org         │
              → DNS: DuckDNS → 5.180.172.132       │
```

## Домены

| Хост | Назначение | Провайдер | TLS |
|---|---|---|---|
| `gta6blog.vercel.app` | Публичный сайт + админка | Vercel | автоматически |
| `gta6media.duckdns.org` | MinIO (S3-endpoint для картинок) | DuckDNS (free) | Caddy + Let's Encrypt |
| `trainlogweb.duckdns.org` | (наследие) — не используется в GTA6 | DuckDNS | — |

Домен `gta6blog.ru` — планируется купить и переключить в Vercel Settings → Domains + там же обновить `NEXT_PUBLIC_SITE_URL`.

## Vercel

### Настройки проекта

- **Root Directory:** `frontend/` (важно — репа монорепно-подобная)
- **Framework:** Next.js (auto-detect)
- **Function Region:** `fra1` (Frankfurt) — минимизирует латентность до VPS
- **Build Command:** `npm run build` — внутри `prisma generate && next build`
- **Node Version:** 22

### Environment Variables

Пять секретных (**Sensitive**, скрываются в UI, недоступны в build-логах):

| Var | Пример | Комментарий |
|---|---|---|
| `DATABASE_URL` | `postgresql://gta6:PASS@5.180.172.132:5433/gta6_blog?sslmode=require&uselibpqcompat=true&connection_limit=5` | `uselibpqcompat=true` обязателен — иначе Prisma pg-adapter требует `verify-full` при self-signed |
| `IRON_SESSION_SECRET` | 32+ chars, base64 | Ротация инвалидит все сессии |
| `IP_HASH_SALT` | 16+ chars, hex | Для sha256(ip+salt) — 152-ФЗ/GDPR |
| `S3_ACCESS_KEY` | 20 chars hex | App-user MinIO |
| `S3_SECRET_KEY` | 40 chars hex | App-user MinIO |

Три обычных (**Config / Plaintext**):

| Var | Значение |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://gta6blog.vercel.app` (или прод-домен) |
| `S3_ENDPOINT` | `https://gta6media.duckdns.org` |
| `S3_REGION` | `us-east-1` (MinIO использует как формальный tag) |
| `S3_BUCKET` | `gta6-uploads` |

⚠️ **NEXT_PUBLIC_SITE_URL** — обязательно **Config**, не Sensitive. Vercel блокирует секреты с префиксом `NEXT_PUBLIC_*` (значение всё равно попадает в клиентский бандл).

### Deploy

Автоматически на push в `main`. Vercel Hobby-план имеет **важный нюанс:**

**Commit author должен быть привязан к твоему GitHub-аккаунту.** Иначе:
> The deployment was blocked because the commit author did not have contributing access to the project

Мой рабочий email — `121338834+fullstakilla@users.noreply.github.com` (GitHub noreply). Настройка локального git:
```bash
git config --global user.email "121338834+fullstakilla@users.noreply.github.com"
git config --global user.name "fullstakilla"
```

⚠️ **НЕ добавлять `Co-Authored-By:` trailer в commit-сообщения** — Vercel Hobby блокирует любой коммит с co-author'ом, не являющимся project-owner'ом.

---

## VPS

### Доступ

```bash
ssh root@5.180.172.132
```

Пароль SSH сохранён у пользователя. Расширить доступ через `authorized_keys` в проде.

### Директория

Всё в `/opt/gta6/`:

```
/opt/gta6/
├── .env                    # POSTGRES_PASSWORD, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD (chmod 600)
├── docker-compose.yml      # postgres + minio + caddy
├── Caddyfile               # reverse-proxy config
├── backup.sh               # cron скрипт
├── pg-data/                # Postgres volume (bind mount)
├── pg-ssl/
│   ├── server.crt          # self-signed для SSL Postgres
│   └── server.key          # chown 999:999, chmod 600
├── minio-data/             # MinIO volume
├── caddy-data/             # Caddy: сохраняет Let's Encrypt certs
├── caddy-config/
└── backups/                # gta6_YYYYMMDD-HHMMSS.dump + backup.log
```

### Postgres 16 в Docker

- Порт наружу: **5433** (внутри контейнера 5432)
- SSL: self-signed, `sslmode=require&uselibpqcompat=true` в clientстроке
- Auth: `scram-sha-256`
- User: `gta6`, БД: `gta6_blog`, пароль в `.env` (48 hex chars)
- Config: `max_connections=200`, `shared_buffers=256MB`, `log_min_duration_statement=1000`

**Подключение снаружи:**
```bash
psql "sslmode=require host=5.180.172.132 port=5433 user=gta6 dbname=gta6_blog"
# пароль — из /opt/gta6/.env
```

### MinIO — S3-совместимое хранилище

- Bucket: **`gta6-uploads`** (anonymous download policy — картинки публичные)
- App user с policy `gta6-uploads-rw` (RW только на этот bucket)
- Root user `gta6admin` — для admin-операций через `mc`

**Полезные команды MinIO:**
```bash
# alias уже настроен
docker exec gta6-minio mc ls local/gta6-uploads/
docker exec gta6-minio mc du local/gta6-uploads/
docker exec gta6-minio mc rm --recursive --force local/gta6-uploads/2026-09/
docker exec gta6-minio mc admin info local
```

**MinIO console** доступ через SSH-туннель:
```bash
ssh -L 9001:localhost:9001 root@5.180.172.132
# затем http://localhost:9001 (gta6admin / см. /opt/gta6/.env)
```

### Caddy reverse proxy

`Caddyfile` — 5 строк:
```
gta6media.duckdns.org {
    reverse_proxy minio:9000 {
        header_up Host {host}          # обязательно для SIGv4
        header_up X-Forwarded-Proto {scheme}
    }
    request_body { max_size 10MB }
}
```

- Автоматически получает и обновляет Let's Encrypt cert
- Сертификаты сохраняются в volume `./caddy-data/` — при рестарте не выпускаются заново

### Firewall (UFW)

```
Status: active
22/tcp      ALLOW   Anywhere      # SSH
80/tcp      ALLOW   Anywhere      # Caddy HTTP (для Let's Encrypt challenge)
443/tcp     ALLOW   Anywhere      # Caddy HTTPS
5433/tcp    ALLOW   Anywhere      # Postgres (⚠️ открыт всем — пароль защищает)
```

**Postgres открыт всему миру** — на Hobby-плане Vercel нет static outbound IP, поэтому whitelist невозможен. Защита:
- 48-char пароль sha256-подписан
- Обязательный TLS
- (планируется) fail2ban на неудачные попытки

### Backup

Cron: `0 3 * * * /opt/gta6/backup.sh`

Что делает:
1. `docker exec gta6-postgres pg_dump -U gta6 -d gta6_blog -F c > backups/gta6_STAMP.dump` (custom format)
2. Ротация: оставляет последние 30 файлов

Лог: `/opt/gta6/backups/backup.log`.

**Что НЕ бэкапится:** MinIO-данные. При потере VPS теряются все загруженные обложки.
Стратегия P1: rclone-синк `/opt/gta6/minio-data/` на внешнее хранилище (Backblaze B2, S3 Glacier).

### Restore

```bash
# на VPS
cd /opt/gta6
docker exec -i gta6-postgres pg_restore -U gta6 -d gta6_blog --clean --if-exists < backups/gta6_YYYYMMDD-HHMMSS.dump
```

---

## Прод-миграции Prisma

Из локальной машины (через удалённый DATABASE_URL):

```bash
cd frontend
DATABASE_URL='<prod-url>' npx prisma migrate deploy
```

**НЕ использовать `prisma migrate dev`** в проде — она создаёт новые миграции и может сломать историю. `deploy` только применяет уже созданные.

**Стратегия деплоя новой миграции:**
1. Локально `prisma migrate dev --name X` → миграция создана + применена локально
2. Коммит + push
3. Vercel деплой запускается **параллельно** — если код нового коммита использует новые колонки, а миграция ещё не применена в проде → 500-ошибки на кратком окне
4. Из локальной машины сразу `DATABASE_URL='<prod>' npx prisma migrate deploy`

Для безопасности: делать миграции **backward-compatible** (добавление колонок с default, отдельный релиз для удаления). Тогда порядок деплой→миграция не критичен.

---

## Troubleshooting

### Vercel не деплоит: "commit author did not have contributing access"

Проверить `git log --format='%an %ae'` — email автора должен быть привязан к GitHub-аккаунту `fullstakilla`.
Fix: коммитить от `121338834+fullstakilla@users.noreply.github.com`.

### Prisma в Vercel не подключается: "self-signed certificate"

Проверить `DATABASE_URL` — там должен быть `&uselibpqcompat=true`.

### Postgres: too many connections

Vercel serverless создаёт новые инстансы под нагрузкой, каждый со своим пулом.
- В `DATABASE_URL` увеличить `connection_limit=5` до `connection_limit=3`
- Или в Postgres `max_connections=200` уже поднято

**Долгосрочно:** PgBouncer перед Postgres (порт 6432 → маппится к 5432 контейнера).

### MinIO 400 или 403 при upload

- Проверить `S3_ACCESS_KEY` / `S3_SECRET_KEY` в Vercel env
- Проверить bucket существует: `docker exec gta6-minio mc ls local/`
- Проверить policy у app-user: `docker exec gta6-minio mc admin user info local $KEY`

### Картинка не открывается снаружи

- Убедиться, что bucket с `anonymous download`: `docker exec gta6-minio mc anonymous list local/gta6-uploads`
- Прямой URL: `https://gta6media.duckdns.org/gta6-uploads/YYYY-MM/hash.png`

### Caddy не может получить cert

- Проверить UFW открывает 80/tcp (Let's Encrypt HTTP-01 challenge)
- `docker logs gta6-caddy` — искать `challenge failed` / `certificate obtained`
- DNS должен резолвить: `dig +short gta6media.duckdns.org` = 5.180.172.132

---

## Оперативные ссылки

- **Vercel Dashboard:** https://vercel.com/fullstakilla/gta6blog
- **GitHub:** https://github.com/fullstakilla/gta6blog
- **Prod URL:** https://gta6blog.vercel.app
- **Admin:** https://gta6blog.vercel.app/admin (`admin@gta6blog.ru` / см. `/opt/gta6/.env`)
- **MinIO endpoint:** https://gta6media.duckdns.org
- **DuckDNS panel:** https://www.duckdns.org/ (управление IP поддоменов)

## Cross-references

- Архитектурные решения → [decisions](../decisions/SKILL.md) (ADR-011+)
- Схема БД → [data-model](../data-model/SKILL.md)
- Server Actions / API → [api-contract](../api-contract/SKILL.md)
- Роадмап → [../../ROADMAP.md](../../ROADMAP.md)
