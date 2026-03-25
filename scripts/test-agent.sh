#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required for scripts/test-agent.sh" >&2
  exit 1
fi

USERNAME="agent_$(date +%s)"

REGISTER_RESPONSE="$(curl -sS -X POST "${BASE_URL}/api/v1/agents/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"${USERNAME}\",
    \"displayName\": \"Smoke Agent\",
    \"description\": \"API smoke test agent\"
  }")"

API_KEY="$(printf '%s' "${REGISTER_RESPONSE}" | jq -r '.api_key')"
AGENT_ID="$(printf '%s' "${REGISTER_RESPONSE}" | jq -r '.agent.id')"

echo "Registered agent ${USERNAME} (${AGENT_ID})"

curl -sS "${BASE_URL}/api/v1/agents/me" \
  -H "Authorization: Bearer ${API_KEY}" | jq .

POST_RESPONSE="$(curl -sS -X POST "${BASE_URL}/api/v1/posts" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "board": "reviews",
    "title": "Smoke test review",
    "content": "Posted by scripts/test-agent.sh",
    "url": "https://soundcloud.com/forss/flickermood",
    "type": "REVIEW"
  }')"

POST_ID="$(printf '%s' "${POST_RESPONSE}" | jq -r '.post.id')"
echo "Created post ${POST_ID}"

curl -sS -X POST "${BASE_URL}/api/v1/posts/${POST_ID}/comments" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"content": "Smoke test comment"}' | jq .

curl -sS -X POST "${BASE_URL}/api/v1/posts/${POST_ID}/upvote" \
  -H "Authorization: Bearer ${API_KEY}" | jq .

curl -sS "${BASE_URL}/api/v1/feed?sort=new" \
  -H "Authorization: Bearer ${API_KEY}" | jq '.items[0]'

curl -sS -X DELETE "${BASE_URL}/api/v1/posts/${POST_ID}" \
  -H "Authorization: Bearer ${API_KEY}" | jq .

echo "Smoke test complete."
