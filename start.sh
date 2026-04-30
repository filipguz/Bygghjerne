#!/bin/bash
set -e

cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8000 &

cd /app/frontend
exec npm start -- -p ${PORT:-3000}
