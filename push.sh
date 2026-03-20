#!/bin/bash
set -e

TOKEN=${1:-$GITHUB_PERSONAL_ACCESS_TOKEN}

if [ -z "$TOKEN" ]; then
  echo "Error: No token found. Either pass as argument or set GITHUB_PERSONAL_ACCESS_TOKEN env var."
  exit 1
fi

BRANCH=$(git branch --show-current)
echo "Branch: $BRANCH"

git remote remove olympayai 2>/dev/null || true
git remote add olympayai "https://olympayai:${TOKEN}@github.com/olympayai/platform.git"

echo "Pushing to olympayai/platform..."
git push olympayai "${BRANCH}:main" --force

git remote remove olympayai
git remote add olympayai "https://github.com/olympayai/platform.git"

echo ""
echo "Done. Code is live at https://github.com/olympayai/platform"
