#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
EMAIL="${EMAIL:-me@example.com}"
PASS="${PASS:-StrongPass!123}"

say() { printf "\n==== %s ====\n" "$*"; }
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

say "[1] login"
LOGIN_JSON=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
echo "login response: $LOGIN_JSON"
TOKEN=$(printf '%s' "$LOGIN_JSON" | sed -nE 's/.*"token":"([^"]+)".*/\1/p')
[[ -n "${TOKEN:-}" ]] || { echo "!! failed to extract token"; exit 1; }
echo "TOKEN(short): ${TOKEN:0:20}..."

say "[2] GET /api/me (expect 200)"
ME_CODE=$(code -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/me")
echo "HTTP $ME_CODE"; [[ "$ME_CODE" == "200" ]] || { echo "!! /api/me not 200"; exit 1; }

say "[3] GET /api/expenses (expect 200)"
EXP_CODE=$(code -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/expenses")
echo "HTTP $EXP_CODE"; [[ "$EXP_CODE" == "200" ]] || { echo "!! /api/expenses not 200"; exit 1; }

say "[4] GET /api/expenses/ping (expect 404)"
PING_CODE=$(code -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/expenses/ping")
echo "HTTP $PING_CODE"; [[ "$PING_CODE" == "404" ]] || { echo "!! /api/expenses/ping not 404"; exit 1; }

say "[5] GET /api/expenses without token (expect 401/403)"
NOAUTH_CODE=$(code "$BASE_URL/api/expenses")
echo "HTTP $NOAUTH_CODE"
case "$NOAUTH_CODE" in
  401|403) : ;;
  *) echo "!! /api/expenses without token expected 401/403 but got $NOAUTH_CODE"; exit 1 ;;
esac

echo -e "\n✅ smoke tests passed."

