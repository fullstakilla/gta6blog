#!/bin/bash
# Откат gta6-nextjs на конкретный образ из GHCR.
# Живёт на VPS: /opt/gta6/rollback.sh. Эта копия — reference в репо.
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <tag>"
  echo "  <tag> — GHCR image tag (например 'latest' или 'sha-1337675')"
  echo ""
  echo "Актуальный образ:"
  docker inspect gta6-nextjs --format '  {{.Config.Image}}' 2>/dev/null || echo "  (nextjs не запущен)"
  echo ""
  echo "Список доступных тегов:"
  echo "  https://github.com/fullstakilla/gta6blog/pkgs/container/gta6blog"
  exit 1
fi

TAG=$1
cd /opt/gta6

echo "→ Pulling ghcr.io/fullstakilla/gta6blog:$TAG..."
docker pull ghcr.io/fullstakilla/gta6blog:$TAG

echo "→ Обновление .env: NEXTJS_TAG=$TAG"
if grep -q '^NEXTJS_TAG=' .env; then
  sed -i "s|^NEXTJS_TAG=.*|NEXTJS_TAG=$TAG|" .env
else
  echo "NEXTJS_TAG=$TAG" >> .env
fi
chmod 600 .env

echo "→ Пересоздание контейнера nextjs..."
docker compose up -d nextjs

sleep 5
echo "==="
docker ps --filter name=gta6-nextjs --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
echo ""
if [ "$TAG" == "latest" ]; then
  echo "✓ Auto-updates включены (Watchtower будет обновлять по мере пуша в main)"
else
  echo "⚠ Auto-updates ВЫКЛЮЧЕНЫ (pinned на $TAG). Для возврата: $0 latest"
fi
