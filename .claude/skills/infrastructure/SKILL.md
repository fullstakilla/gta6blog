---
name: infrastructure
description: Прод-инфраструктура GTA6·БЛОГ — что где крутится (всё на своём VPS в Docker), схема сети, credentials, backup/restore, disaster recovery, troubleshooting, CI/CD flow. Триггерь при любом вопросе про деплой, прод-БД, MinIO, upload картинок, домены, DNS, TLS, бэкапы, восстановление после падений, миграции в проде, docker-compose, GitHub Actions build/push.
---

# Инфраструктура GTA6·БЛОГ

**Self-hosted стек:** всё крутится в Docker Compose на своём VPS. Никакой зависимости от Vercel/облаков. Ранее использовалась Vercel (см. ADR-011/013/014, все SUPERSEDED в ADR-016).

## Топология

```
┌────────────────────────────────────────────────────────┐
│           КЛИЕНТ (браузер, любой оператор в РФ)        │
│           https://gta6blog.ru                          │
│           DNS: gta6blog.ru → 5.180.172.132             │
└─────────────────────┬──────────────────────────────────┘
                      │ HTTPS (TLS 1.3, HTTP/3)
                      ▼
┌────────────────────────────────────────────────────────────────────┐
│  VPS (Ubuntu 24.04, 2 vCPU, 1.8 GB, IP: 5.180.172.132, Хельсинки)  │
│                                                                     │
│  Docker Compose stack (/opt/gta6/docker-compose.yml)               │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ gta6-caddy (:80, :443) — reverse proxy                     │   │
│  │  • TLS termination (Let's Encrypt, A+ рейтинг)             │   │
│  │  • HTTP → HTTPS auto-redirect                              │   │
│  │  • www.gta6blog.ru → 308 → gta6blog.ru                     │   │
│  │  • HTTP/3 + QUIC + Post-Quantum Crypto                     │   │
│  │  Роутинг:                                                   │   │
│  │   gta6blog.ru        → nextjs:3000                         │   │
│  │   gta6media...       → minio:9000                          │   │
│  └────────┬──────────────────────────┬────────────────────────┘   │
│           │                          │                              │
│           ▼                          ▼                              │
│  ┌────────────────────────┐    ┌───────────────────────┐           │
│  │ gta6-nextjs :3000       │    │ gta6-minio :9000       │           │
│  │ Next.js 16 (standalone) │    │ S3-совместимое         │           │
│  │ Docker: ghcr.io/...    │    │ bucket: gta6-uploads   │           │
│  │  gta6blog:latest       │    │ (anonymous download)   │           │
│  │                        │    │                        │           │
│  │  Читает Postgres       │    │ Хранит обложки статей  │           │
│  │  через Docker network  │    │ и картинки галереи     │           │
│  └────────┬───────────────┘    └────────────────────────┘           │
│           │                                                          │
│           ▼                                                          │
│  ┌──────────────────────────────────────────────────────┐           │
│  │ gta6-postgres :5432 (внутри), :5433 (наружу)         │           │
│  │ Postgres 16, SSL (self-signed), scram-sha-256         │           │
│  │ БД: gta6_blog, user: gta6                            │           │
│  └──────────────────────────────────────────────────────┘           │
│                                                                     │
│  gta6-watchtower — раз в 5 мин пуляет ghcr.io/.../gta6blog:latest  │
│                    и рестартит gta6-nextjs при новом образе        │
│                                                                     │
│  UFW firewall: 22, 80, 443, 5433                                    │
│  Cron: /opt/gta6/backup.sh @ 03:00 daily → pg_dump                 │
└────────────────────────────────────────────────────────────────────┘
```

**Всё в Docker, всё на одной машине.** Один VPS = один SPOF, но простая и быстрая эксплуатация.

**Обратный маршрут (Vercel):** больше нет. Все компоненты локально, без внешних зависимостей кроме DNS.

## Домены

| Хост | Назначение | Провайдер | DNS указывает на | TLS |
|---|---|---|---|---|
| `gta6blog.ru` | Основной публичный домен | reg.ru | 5.180.172.132 (VPS) | Caddy + Let's Encrypt (A+) |
| `www.gta6blog.ru` | 308 redirect → apex | reg.ru | 5.180.172.132 (VPS) | Caddy + Let's Encrypt |
| `gta6media.duckdns.org` | MinIO S3-endpoint | DuckDNS (free) | 5.180.172.132 (VPS) | Caddy + Let's Encrypt |

**DNS-записи на reg.ru для `gta6blog.ru`:**

```
A       @       5.180.172.132
A       www     5.180.172.132
```

---

## CI/CD flow

```
Разработчик
    │
    │ git push main
    ▼
GitHub Actions (.github/workflows/)
    │
    ├─ ci.yml            — lint + build (валидация PR)
    │
    └─ docker.yml        — билдит Docker образ:
                            npm ci → prisma generate → next build → docker build
                            → push в ghcr.io/fullstakilla/gta6blog:latest + sha-<hash>
    │
    ▼
GHCR (GitHub Container Registry)
    │
    │ private image, доступ по PAT (docker login на VPS)
    ▼
Watchtower на VPS (раз в 5 минут)
    │
    │ docker pull ghcr.io/fullstakilla/gta6blog:latest
    │ Если новый образ → docker compose up -d nextjs (zero-downtime rolling)
    ▼
gta6-nextjs (обновился без вмешательства)
```

**Время от git push до прода:** ~4-6 минут:
- CI билд Docker образа: 2-3 мин (с кэшем ~1 мин)
- Watchtower polling delay: до 5 мин (интервал по умолчанию)

---

## Environment variables

Все env хранятся в **`/opt/gta6/.env`** (chmod 600), передаются в контейнеры через `docker-compose.yml`:

| Var | Пример | Где используется |
|---|---|---|
| `POSTGRES_PASSWORD` | 48 hex | Postgres init + nextjs DATABASE_URL |
| `MINIO_ROOT_USER` | `gta6admin` | MinIO root (для admin через `mc`) |
| `MINIO_ROOT_PASSWORD` | 40 hex | MinIO root |
| `IRON_SESSION_SECRET` | 32+ chars base64 | Encrypt session cookies (nextjs) |
| `IP_HASH_SALT` | 32 hex | `sha256(ip + salt)` — 152-ФЗ/GDPR compliance |
| `S3_ACCESS_KEY` | 20 hex | App-user MinIO (limited policy) |
| `S3_SECRET_KEY` | 40 hex | App-user MinIO |

`NEXT_PUBLIC_SITE_URL`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET` — заданы прямо в docker-compose.yml как строки (не секреты).

---

## VPS · директория `/opt/gta6/`

```
/opt/gta6/
├── .env                    # секреты (chmod 600, gitignored на VPS)
├── docker-compose.yml      # postgres + minio + nextjs + watchtower + caddy
├── Caddyfile               # reverse-proxy routing
├── backup.sh               # daily pg_dump
├── pg-data/                # Postgres volume
├── pg-ssl/                 # self-signed SSL cert (chown 999:999)
├── minio-data/             # MinIO объекты
├── caddy-data/             # Let's Encrypt certs, state
├── caddy-config/           # Caddy runtime config
└── backups/                # gta6_YYYYMMDD-HHMMSS.dump + backup.log
```

### Postgres 16 в Docker

- Порт: **`127.0.0.1:5433`** — bind только к loopback VPS, снаружи недоступен
- SSL: self-signed, у клиентов `sslmode=require&uselibpqcompat=true`
- Auth: `scram-sha-256`
- Docker-имя: `gta6-postgres`
- **nextjs подключается по internal Docker-сети:** `postgresql://gta6:PASS@postgres:5432/gta6_blog?...`
- **Внешний доступ (для миграций Prisma с локальной машины) — только через SSH-туннель:**
  ```bash
  # Терминал 1 — держим туннель открытым:
  ssh -L 5433:localhost:5433 root@5.180.172.132 -N

  # Терминал 2 — миграция как на localhost:
  DATABASE_URL='postgresql://gta6:PASS@localhost:5433/gta6_blog?sslmode=require&uselibpqcompat=true' npx prisma migrate deploy
  ```
- **Почему loopback, а не открытый порт + fail2ban:** пароль защищает, но открытый 5433 = поверхность атаки для брутфорса (боты сканят рунет по типовым портам, забивают CPU и логи). Loopback полностью убирает атаку.

### Next.js в Docker

- Docker image: `ghcr.io/fullstakilla/gta6blog:latest`
- Build: multi-stage Dockerfile в `frontend/Dockerfile` (deps → builder → runner)
- Порт: **3000** (только внутри Docker network, наружу через Caddy)
- Standalone Next.js — минимальный runtime, ~360 MB image
- Non-root user (uid 1001)
- Healthcheck: `wget http://localhost:3000/` каждые 30 сек
- Метки: `com.centurylinklabs.watchtower.enable=true` — позволяет Watchtower обновлять

### MinIO S3

- Bucket: **`gta6-uploads`** (anonymous download policy)
- App user с policy `gta6-uploads-rw` (RW только на bucket)
- Root user `gta6admin` — для admin через `mc`
- Наружу закрыт (доступ только через Caddy)

**Полезные команды:**
```bash
docker exec gta6-minio mc ls local/gta6-uploads/
docker exec gta6-minio mc du local/gta6-uploads/
docker exec gta6-minio mc admin info local
```

**Console** через SSH-туннель:
```bash
ssh -L 9001:localhost:9001 root@5.180.172.132
# затем http://localhost:9001 (gta6admin / из /opt/gta6/.env)
```

### Caddy

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

    reverse_proxy nextjs:3000
}
```

**Ключевые моменты:**
- Проксирование к `nextjs:3000` — по имени Docker-сервиса (внутренний DNS Compose)
- Никакого `header_up Host` или `tls_server_name` не нужно — nextjs работает прозрачно
- www → apex 308 — SEO-хорошая практика
- HTTP/3 + QUIC — автомат
- Cert Let's Encrypt — при первом HTTPS-запросе через HTTP-01 или TLS-ALPN-01

**Reload:**
```bash
docker exec gta6-caddy caddy reload --config /etc/caddy/Caddyfile
```

**Логи:**
```bash
docker logs gta6-caddy 2>&1 | tail -50
```

### Watchtower

- Image: **`nickfedor/watchtower:latest`** (активный форк, `containrrr/watchtower` заброшен в 2024, у него API 1.25 несовместимый с новыми Docker daemon)
- Poll interval: **5 минут**
- `--cleanup` — удаляет старые образы после апдейта
- `--label-enable` — обновляет только контейнеры с `com.centurylinklabs.watchtower.enable=true`
- Читает `/root/.docker/config.json` для GHCR-авторизации (mounted read-only)
- Логи: `docker logs gta6-watchtower`

**Форсировать проверку немедленно** (не ждать 5 мин):
```bash
docker compose pull nextjs && docker compose up -d nextjs
```

### Log rotation

Все сервисы используют `json-file` driver с `max-size: 10m, max-file: 3` — не более 30 MB логов на контейнер. Задано через YAML-anchor `&default-logging` в `docker-compose.yml`. Без этого Docker логи растут бесконечно (по умолчанию без лимита) и могут забить диск.

### Docker cleanup cron

```
0 4 * * 0  docker system prune -f --filter until=168h >> /var/log/docker-prune.log 2>&1
```

Раз в неделю (воскресенье 4:00) удаляются образы/контейнеры/сети старше 7 дней. **Volumes НЕ трогает** — данные Postgres/MinIO в безопасности. Логи в `/var/log/docker-prune.log`.

### Rollback nextjs на предыдущую версию

`docker-compose.yml` использует `image: ghcr.io/fullstakilla/gta6blog:${NEXTJS_TAG:-latest}` — можно pinить конкретный SHA-тег через env.

```bash
/opt/gta6/rollback.sh sha-1337675   # откат на конкретный коммит
/opt/gta6/rollback.sh latest        # вернуть auto-updates через Watchtower
```

Скрипт пуляет образ, обновляет `NEXTJS_TAG` в `/opt/gta6/.env`, пересоздаёт `gta6-nextjs`. Когда `NEXTJS_TAG≠latest` — Watchtower **не** трогает контейнер (тег не совпадает). Список доступных тегов: https://github.com/fullstakilla/gta6blog/pkgs/container/gta6blog

### Firewall (UFW)

```
Status: active
22/tcp      ALLOW   Anywhere      # SSH
80/tcp      ALLOW   Anywhere      # Caddy HTTP (для Let's Encrypt challenge)
443/tcp     ALLOW   Anywhere      # Caddy HTTPS
```

Postgres 5433 **закрыт снаружи** — Docker привязывает его к `127.0.0.1:5433`. Доступ только через SSH-туннель (см. секцию Postgres выше).

### Backup

Cron: `0 3 * * * /opt/gta6/backup.sh`

Что делает:
1. `docker exec gta6-postgres pg_dump -U gta6 -d gta6_blog -F c > backups/gta6_STAMP.dump`
2. Ротация: оставляет последние 30 файлов

Лог: `/opt/gta6/backups/backup.log`.

**Что НЕ бэкапится:** MinIO-данные. Планируется P1: rclone-синк `/opt/gta6/minio-data/` во внешнее хранилище.

**Restore:**
```bash
docker exec -i gta6-postgres pg_restore -U gta6 -d gta6_blog --clean --if-exists < backups/gta6_YYYYMMDD-HHMMSS.dump
```

---

## Прод-миграции Prisma

С локальной машины (через удалённый DATABASE_URL):

```bash
cd frontend
DATABASE_URL='postgresql://gta6:PASS@5.180.172.132:5433/gta6_blog?sslmode=require&uselibpqcompat=true' npx prisma migrate deploy
```

**НЕ использовать `prisma migrate dev`** в проде — создаёт новые миграции, ломает историю. `deploy` только применяет.

**Стратегия деплоя новой миграции:**
1. Локально `prisma migrate dev --name X` → создаётся миграция + применена локально
2. Коммит + push → GitHub Actions билдит новый Docker образ
3. **В отдельном терминале открыть SSH-туннель к Postgres:** `ssh -L 5433:localhost:5433 root@5.180.172.132 -N`
4. **Применить миграцию через туннель:** `DATABASE_URL='postgresql://gta6:PASS@localhost:5433/gta6_blog?sslmode=require&uselibpqcompat=true' npx prisma migrate deploy`
5. Watchtower через ~5 мин подхватит новый образ и рестартит nextjs

**Для безопасности:** делать миграции **backward-compatible** (adding columns, not dropping). Тогда порядок деплой→миграция не критичен.

---

## Troubleshooting

### GitHub Actions Docker build упал

- Смотреть логи в `Actions` → workflow-run → «Build & push Docker image»
- Обычно: opinionated npm-warning про allow-scripts (уже фикшено) или ошибки в `next build`
- Локально проверить: `cd frontend && npm run build`

### Watchtower не обновляет nextjs

- `docker logs gta6-watchtower` — увидим последнюю проверку и почему не пуляет
- Проверить что образ в GHCR обновился: `docker pull ghcr.io/fullstakilla/gta6blog:latest`
- Проверить label на контейнере: `docker inspect gta6-nextjs | grep watchtower`
- **Forced обновление:** `cd /opt/gta6 && docker compose pull nextjs && docker compose up -d nextjs`

### nextjs не отвечает / 502 от Caddy

- `docker ps` — `gta6-nextjs` должен быть `Up ... (healthy)`
- Если `unhealthy` или падает: `docker logs gta6-nextjs 2>&1 | tail -50`
- Обычные причины:
  - Ошибка в env-переменных (missing IRON_SESSION_SECRET и т.п.)
  - Postgres недоступен (проверить `docker ps` gta6-postgres)
  - OOM — VPS 1.8GB тесно, `docker stats` покажет
- Быстрый рестарт: `docker compose restart nextjs`

### Postgres: too many connections

- В DATABASE_URL уменьшить `connection_limit=10` до `5`
- В Postgres `max_connections=200` уже поднято через `command:` в compose
- Долгосрочно: PgBouncer перед Postgres

### MinIO 400 или 403 при upload

- Проверить env `S3_ACCESS_KEY` / `S3_SECRET_KEY` в контейнере: `docker exec gta6-nextjs env | grep S3`
- Проверить bucket существует: `docker exec gta6-minio mc ls local/`
- Проверить policy: `docker exec gta6-minio mc admin user info local $KEY`

### Картинка не открывается снаружи

- Bucket с `anonymous download`: `docker exec gta6-minio mc anonymous list local/gta6-uploads`
- Прямой URL: `https://gta6media.duckdns.org/gta6-uploads/YYYY-MM/hash.png`

### Caddy не может получить cert

- UFW разрешает 80/tcp (Let's Encrypt HTTP-01 challenge)
- `docker logs gta6-caddy` — искать `challenge failed` / `certificate obtained`
- DNS должен глобально резолвить: `dig +short gta6blog.ru @8.8.8.8` = 5.180.172.132
- После правок DNS в reg.ru — подождать 15 мин + `docker restart gta6-caddy`

### У клиента в РФ ERR_SSL_VERSION_OR_CIPHER_MISMATCH или ERR_TIMED_OUT

- Локальный DNS-кэш держит старый IP. Fix: `sudo networksetup -setdnsservers "Wi-Fi" 1.1.1.1 8.8.8.8` + `killall -HUP mDNSResponder`
- В браузере — chrome://net-internals/#dns → Clear host cache
- Проверить с телефона по 4G, из другой сети

---

## Оперативные ссылки

- **Prod URL:** https://gta6blog.ru
- **Admin:** https://gta6blog.ru/admin (`admin@gta6blog.ru` / `dev` — сменить через seed при появлении реальных админов)
- **GitHub:** https://github.com/fullstakilla/gta6blog
- **GHCR image:** https://github.com/fullstakilla/gta6blog/pkgs/container/gta6blog
- **MinIO endpoint (S3 API):** https://gta6media.duckdns.org
- **DuckDNS panel:** https://www.duckdns.org/
- **Reg.ru DNS панель:** https://www.reg.ru/user/ → gta6blog.ru → DNS
- **SSL Labs check:** https://www.ssllabs.com/ssltest/analyze.html?d=gta6blog.ru
- **Работоспособность из разных стран:** https://check-host.net/check-http?host=gta6blog.ru

## Cross-references

- Архитектурные решения → [decisions](../decisions/SKILL.md) (ADR-011..016)
- Схема БД → [data-model](../data-model/SKILL.md)
- Server Actions / API → [api-contract](../api-contract/SKILL.md)
- Роадмап → [../../ROADMAP.md](../../ROADMAP.md)
