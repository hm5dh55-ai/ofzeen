#!/usr/bin/env bash
set -e
echo "[1/3] Install & build web"
cd web && npm install && npm run build && cd ..
echo "[2/3] Install server deps & init DB"
cd server && npm install && node scripts/init-db.js && cd ..
echo "[3/3] Copy web build to server/public"
mkdir -p server/public
cp -r web/dist/* server/public/
echo "Done. Start locally with: cd server && PORT=8080 node server.js"
