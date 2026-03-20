#!/bin/bash
set -e

TOKEN=${1:-$GITHUB_PERSONAL_ACCESS_TOKEN}

if [ -z "$TOKEN" ]; then
  echo "Error: No token found. Either pass as argument or set GITHUB_PERSONAL_ACCESS_TOKEN env var."
  exit 1
fi

echo "Step 1: Removing internal files from git tracking..."
git rm --cached .replit .replitignore replit.md 2>/dev/null || true
git rm --cached -r \
  artifacts/api-server/.replit-artifact \
  artifacts/mockup-sandbox/.replit-artifact \
  artifacts/olympay/.replit-artifact \
  2>/dev/null || true
git rm --cached "FINANCIAL PLATFORM" 2>/dev/null || true

echo "Step 2: Staging updated files..."
git add .gitignore ARCHITECTURE.md 2>/dev/null || true

echo "Step 3: Committing cleanup..."
git config user.email "deploy@olympay.tech" 2>/dev/null || true
git config user.name "Olympay" 2>/dev/null || true
git commit -m "chore: remove internal config files, add ARCHITECTURE.md" 2>/dev/null || echo "Nothing new to commit, continuing..."

BRANCH=$(git branch --show-current)
echo "Branch: $BRANCH"

echo "Step 4: Setting up remote..."
git remote remove olympayai 2>/dev/null || true
git remote add olympayai "https://olympayai:${TOKEN}@github.com/olympayai/platform.git"

echo "Step 5: Pushing to olympayai/platform..."
git push olympayai "${BRANCH}:main" --force

git remote remove olympayai
git remote add olympayai "https://github.com/olympayai/platform.git"

echo ""
echo "Done. Repo is clean at https://github.com/olympayai/platform"
