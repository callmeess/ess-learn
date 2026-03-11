#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_PROJECT="$ROOT_DIR/backend/EssLearn.Api/EssLearn.Api.csproj"
FRONTEND_DIR="$ROOT_DIR/frontend"
API_URL="http://localhost:5000"
FRONTEND_PORT="5173"
FRONTEND_CONTAINER_NAME="esslearn-frontend-dev"
FRONTEND_NODE_IMAGE="node:22-alpine"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but was not found in PATH."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "docker compose (or docker-compose) is required but was not found."
  exit 1
fi

if ! command -v dotnet >/dev/null 2>&1; then
  echo "dotnet is required but was not found in PATH."
  exit 1
fi

FRONTEND_MODE="local"
if command -v npm >/dev/null 2>&1; then
  FRONTEND_PM="npm"
  FRONTEND_RUN_CMD=(npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT")
  FRONTEND_INSTALL_HINT="npm install"
elif command -v pnpm >/dev/null 2>&1; then
  FRONTEND_PM="pnpm"
  FRONTEND_RUN_CMD=(pnpm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT")
  FRONTEND_INSTALL_HINT="pnpm install"
elif command -v yarn >/dev/null 2>&1; then
  FRONTEND_PM="yarn"
  FRONTEND_RUN_CMD=(yarn dev --host 0.0.0.0 --port "$FRONTEND_PORT")
  FRONTEND_INSTALL_HINT="yarn install"
else
  FRONTEND_MODE="docker"
  echo "No local npm/pnpm/yarn found. Frontend will run in Docker ($FRONTEND_NODE_IMAGE)."
fi

if [[ "$FRONTEND_MODE" == "local" && ! -d "$FRONTEND_DIR/node_modules" ]]; then
  echo "frontend dependencies are missing. Run '$FRONTEND_INSTALL_HINT' in $FRONTEND_DIR first."
  exit 1
fi

if [[ -z "${YOUTUBE_API_KEY:-}" ]]; then
  echo "YOUTUBE_API_KEY is not set. Import endpoints may fail without it."
fi

cleanup() {
  local exit_code=$?

  if [[ -n "${FRONTEND_PID:-}" ]] && kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi

  docker rm -f "$FRONTEND_CONTAINER_NAME" >/dev/null 2>&1 || true

  if [[ -n "${API_PID:-}" ]] && kill -0 "$API_PID" >/dev/null 2>&1; then
    kill "$API_PID" >/dev/null 2>&1 || true
  fi

  wait >/dev/null 2>&1 || true

  echo "Stopping Docker dependencies (db, redis)..."
  "${COMPOSE_CMD[@]}" -f "$ROOT_DIR/docker-compose.yml" stop db redis >/dev/null 2>&1 || true

  exit "$exit_code"
}
trap cleanup EXIT INT TERM

echo "Starting Docker dependencies (db, redis)..."
"${COMPOSE_CMD[@]}" -f "$ROOT_DIR/docker-compose.yml" up -d db redis

echo "Starting API from source on $API_URL ..."
ASPNETCORE_ENVIRONMENT=Development ASPNETCORE_URLS="$API_URL" \
  dotnet watch run --project "$API_PROJECT" --no-launch-profile &
API_PID=$!

echo "Starting frontend from source on http://localhost:$FRONTEND_PORT ..."
(
  if [[ "$FRONTEND_MODE" == "local" ]]; then
    cd "$FRONTEND_DIR"
    echo "Using package manager: $FRONTEND_PM"
    VITE_API_URL="$API_URL" "${FRONTEND_RUN_CMD[@]}"
  else
    docker run --rm --name "$FRONTEND_CONTAINER_NAME" \
      --add-host=host.docker.internal:host-gateway \
      -p "$FRONTEND_PORT:$FRONTEND_PORT" \
      -e VITE_API_URL="http://host.docker.internal:5000" \
      -v "$FRONTEND_DIR:/app" \
      -v esslearn_frontend_node_modules:/app/node_modules \
      -w /app \
      "$FRONTEND_NODE_IMAGE" \
      sh -lc "if [ ! -d node_modules/.bin ]; then npm install; fi; npm run dev -- --host 0.0.0.0 --port $FRONTEND_PORT"
  fi
) &
FRONTEND_PID=$!

echo "All services started. Press Ctrl+C to stop local processes and Docker dependencies."
wait "$API_PID" "$FRONTEND_PID"
