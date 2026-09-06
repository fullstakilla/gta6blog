---
name: infrastructure
description: Прод-инфраструктура GTA6·БЛОГ — где что крутится (Vercel + VPS), схема сети, credentials, backup/restore, disaster recovery, troubleshooting. Триггерь при любом вопросе про деплой, prod-БД, MinIO, upload картинок, домены, DNS, TLS, бэкапы, восстановление после падений, миграции в проде, ENV-переменные Vercel.
---

# Инфраструктура GTA6·БЛОГ

**Гибридная схема:** веб-приложение на Vercel (serverless), данные и медиа на своём VPS. Клиентский трафик идёт через Caddy-прокси на VPS (обход блокировки Vercel-IP в РФ).

## Топология

```
┌────────────────────────────────────────────────────────┐
│           КЛИЕНТ (браузер)                             │
│           https://gta6blog.ru                          │
│           DNS: gta6blog.ru → 5.180.172.132             │
└─────────────────────┬──────────────────────────────────┘
                      │ HTTPS
                      ▼
┌────────────────────────────────────────────────────────┐
│  VPS (Ubuntu 24.04, 2 vCPU, 1.8 GB, IP: 5.180.172.132) │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │ Caddy (reverse proxy) :80, :443                │   │
│  │  - TLS termination (Let's Encrypt, A+ рейтинг) │   │
│  │  - HTTP → HTTPS auto-redirect                  │   │
│  │  - www.gta6blog.ru → 308 → gta6blog.ru         │   │
│  │  - HTTP/3 + QUIC + Post-Quantum Crypto         │   │
│  │                                                 │   │
│  │  gta6blog.ru      → proxy → gta6blog.vercel.app│   │
│  │  gta6media...     → proxy → minio:9000          │   │
│  └───────┬──────────────────────────┬─────────────┘   │
│          │                          │                  │
│          │                          ▼                  │
│          │                ┌─────────────────┐          │
│          │                │  MinIO :9000    │          │
│          │                │  S3-compatible  │          │
│          │                │  bucket:        │          │
│          │                │  gta6-uploads   │          │
│          │                └─────────────────┘          │
│          │                                             │
│          │  ┌─────────────────────────────────────┐   │
│          │  │  Postgres 16 :5433                  │   │
│          │  │  SSL, scram-sha-256, port открыт    │   │
│          │  │  вовне для Vercel-функций           │   │
│          │  └───────────────┬─────────────────────┘   │
│          │                  │                          │
│  UFW firewall: 22, 80, 443, 5433                       │
│  Cron: pg_dump 03:00 daily → /opt/gta6/backups/        │
└──────────┼──────────────────┼──────────────────────────┘
           │                  │
           │ HTTPS (SNI+Host  │ TCP + TLS (Prisma pg-adapter)
           │  = .vercel.app)  │
           ▼                  ▼
┌────────────────────────────────────────────────────────┐
│  Vercel (Hobby, region: fra1 Frankfurt)                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Next.js 16 app                                  │   │
│  │  ├─ RSC + Server Actions + Route Handlers        │   │
│  │  ├─ Auto-deploy on push to main                  │   │
│  │  ├─ Vercel URL: https://gta6blog.vercel.app      │   │
│  │  └─ Читает Postgres на VPS через открытый интернет│  │
│  │      (DATABASE_URL с sslmode=require)             │  │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

**Ключевой момент:** клиенты **не ходят напрямую на Vercel**. Все запросы проходят через VPS-прокси. Это обход РКН-фильтров Vercel-диапазонов (см. ADR-014).

**Обратный маршрут (Vercel → БД):** Vercel-функции ходят напрямую к Postgres на VPS через открытый интернет. Никакого прокси между Next.js runtime и Postgres нет.

## Домены

| Хост | Назначение | Провайдер | DNS указывает на | TLS |
|---|---|---|---|---|
| `gta6blog.ru` | Основной публичный домен | reg.ru | 5.180.172.132 (VPS) | Caddy + Let's Encrypt (A+) |
| `www.gta6blog.ru` | 308 redirect → apex | reg.ru | 5.180.172.132 (VPS) | Caddy + Let's Encrypt |
| `gta6blog.vercel.app` | Vercel origin (для Caddy proxy) | Vercel | Vercel edge | Vercel auto |
| `gta6media.duckdns.org` | MinIO S3-endpoint | DuckDNS (free) | 5.180.172.132 (VPS) | Caddy + Let's Encrypt |

**DNS-записи на reg.ru для `gta6blog.ru`:**

```
A       @       5.180.172.132
A       www     5.180.172.132
```

**НЕ указывать на Vercel IP** — тогда клиенты в РФ будут получать ERR_SSL_VERSION_OR_CIPHER_MISMATCH из-за DPI-фильтров провайдеров.

### Vercel Domains — важный нюанс

В Vercel Dashboard → Settings → Domains нужно **держать только `gta6blog.vercel.app`**. Домен `gta6blog.ru` **не должен быть привязан к проекту в Vercel Domains** — иначе Vercel будет ожидать что DNS указывает на его IP, а он указывает на нас → возникает конфликт (Vercel то ругается «Invalid Configuration», то серверит 403).

Caddy подменяет заголовок `Host: gta6blog.vercel.app` при проксировании — Vercel маршрутизирует по своему домену как обычно, клиент видит `gta6blog.ru` в URL благодаря `NEXT_PUBLIC_SITE_URL`.

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
| `NEXT_PUBLIC_SITE_URL` | `https://gta6blog.ru` |
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

Полный `/opt/gta6/Caddyfile`:

```
gta6media.duckdns.org {
    reverse_proxy minio:9000 {
        header_up Host {host}          # обязательно для SIGv4
    }
    request_body { max_size 10MB }
}

gta6blog.ru, www.gta6blog.ru {
    @www host www.gta6blog.ru
    redir @www https://gta6blog.ru{uri} 308

    reverse_proxy https://gta6blog.vercel.app {
        header_up Host gta6blog.vercel.app    # Vercel мапит по своему домену
        header_up X-Forwarded-Host {host}     # оригинальный host для приложения
        transport http {
            tls_server_name gta6blog.vercel.app  # SNI для Vercel edge
        }
    }
}
```

**Ключевые моменты:**
- **Один Caddyfile — два независимых блока** (MinIO и сайт).
- **Host rewrite для Vercel** — критично. Если оставить `Host: gta6blog.ru` и не привязать домен в Vercel Domains, Vercel вернёт 403 «Forbidden».
- **www → apex 308** — SEO-хорошая практика (склеивает вес поисковых сигналов на один домен).
- **TLS Server Name** — при исходящем TLS в Vercel обязательно `gta6blog.vercel.app` (Vercel маршрутизирует по SNI).
- **HTTP/3 + QUIC** — включаются автоматически, дают быструю загрузку.
- **Cert Let's Encrypt** — выпускается автоматически при первом HTTPS-запросе через HTTP-01 или TLS-ALPN-01 challenge. Обновление за 30 дней до истечения.

**Reload после правок:**
```bash
docker exec gta6-caddy caddy reload --config /etc/caddy/Caddyfile
```

**Логи:**
```bash
docker logs gta6-caddy 2>&1 | tail -50
```

Файлы сертификатов и state — в volume `./caddy-data/` (пережил рестарт контейнера).

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
- DNS должен глобально резолвить в наш VPS: `dig +short gta6blog.ru @8.8.8.8` = 5.180.172.132
- Если ошибка «tls: no application protocol» — значит LE резолвит домен ещё в старый IP (Vercel). Подождать 10-15 мин + `docker restart gta6-caddy`
- Если ошибка «404 на /.well-known/acme-challenge» — тот же кэш DNS у LE
- Caddy может переключиться на **staging** (`acme-staging-v02`) после нескольких неудач prod. Restart контейнера сбрасывает выбор CA — снова пробует production

### Клиент видит 403 Forbidden от gta6blog.ru

Причина: Caddy отправил `Host: gta6blog.ru` на Vercel, но домен НЕ привязан в Vercel Domains → Vercel не знает какой проект серверить.

Фикс:
- Либо привязать `gta6blog.ru` в Vercel Domains (будет Invalid Configuration warning, но серверить будет)
- **Либо переписать Host на `gta6blog.vercel.app` в Caddyfile** (рекомендую — чище):
  ```
  header_up Host gta6blog.vercel.app
  ```

### У клиента в РФ ERR_SSL_VERSION_OR_CIPHER_MISMATCH

Обычно значит одно из:
1. Локальный DNS-кэш держит старый Vercel IP. Fix: сменить DNS на 1.1.1.1 через `networksetup -setdnsservers "Wi-Fi" 1.1.1.1 8.8.8.8` + `killall -HUP mDNSResponder`
2. Провайдер режет по DPI — это уже блокировка Vercel-диапазонов, ради этого мы и поставили proxy. Значит DNS ещё не прописал наш VPS.

### У клиента ERR_TIMED_OUT

TCP-подключение до нашего VPS не устанавливается. Причины:
1. VPS упал — проверить `docker ps` на VPS
2. Провайдер клиента заблокировал наш IP (редко)
3. Firewall на VPS — проверить `ufw status`, порт 443/tcp должен быть ALLOW

---

## Оперативные ссылки

- **Prod URL:** https://gta6blog.ru
- **Admin:** https://gta6blog.ru/admin (`admin@gta6blog.ru` / см. `/opt/gta6/.env`)
- **Vercel Dashboard:** https://vercel.com/fullstakilla/gta6blog
- **GitHub:** https://github.com/fullstakilla/gta6blog
- **MinIO endpoint (S3 API):** https://gta6media.duckdns.org
- **DuckDNS panel:** https://www.duckdns.org/ (управление IP поддоменов)
- **Reg.ru DNS панель:** https://www.reg.ru/user/ → gta6blog.ru → DNS
- **SSL Labs check:** https://www.ssllabs.com/ssltest/analyze.html?d=gta6blog.ru
- **Работоспособность из разных стран:** https://check-host.net/check-http?host=gta6blog.ru

## Cross-references

- Архитектурные решения → [decisions](../decisions/SKILL.md) (ADR-011+)
- Схема БД → [data-model](../data-model/SKILL.md)
- Server Actions / API → [api-contract](../api-contract/SKILL.md)
- Роадмап → [../../ROADMAP.md](../../ROADMAP.md)
