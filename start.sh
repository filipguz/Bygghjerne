#!/bin/bash
set -e

cd /app/backend
uvicorn main:app --host 127.0.0.1 --port 8000 &

cd /app/frontend
exec npm start -- -p ${PORT:-3000}
