#!/usr/bin/env bash
set -euo pipefail
IMAGE="reops-proxy"
PORT=8080

echo "== docker build =="
docker build --pull -t "$IMAGE" .

echo "== docker run =="
docker run --rm -d -p "$PORT:$PORT" --name "$IMAGE" "$IMAGE"
sleep 3

echo "== curl =="
curl -sI "localhost:$PORT" || true

echo "== container logs =="
docker logs "$IMAGE" || true
docker stop "$IMAGE" >/dev/null

echo "== grype scan =="
grype "$IMAGE" -o table
