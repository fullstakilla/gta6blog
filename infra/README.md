# infra/

Reference-копии VPS-конфигов. **Синхронизируются вручную** — единственный источник правды: файлы на VPS в `/opt/gta6/`.

- **`docker-compose.yml`** — стек Postgres/MinIO/Nextjs/Watchtower/Caddy с log-rotation и pinnable NEXTJS_TAG
- **`rollback.sh`** — быстрый откат `gta6-nextjs` на конкретный SHA-тег из GHCR

Как устроено и как поддерживается: [../.claude/skills/infrastructure/SKILL.md](../.claude/skills/infrastructure/SKILL.md).
