#!/usr/bin/env bash

echo "=========================================================="
echo "📦 LogiPulse Logistics App - GitHub Repository Setup"
echo "=========================================================="

# Check git
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Initialize git if needed
if [ ! -d ".git" ]; then
    echo "⚙️ Initializing local Git repository..."
    git init -b main
else
    echo "✅ Local Git repository already initialized."
fi

# Add all files
echo "➕ Staging project files..."
git add .

# Create initial commit if no commits exist
if ! git rev-parse HEAD &> /dev/null; then
    echo "📝 Creating initial commit..."
    git commit -m "feat: complete fullstack logistics & courier management system with priority dispatch, auth, and deployment"
else
    echo "📝 Updating commit..."
    git commit -m "update: latest fullstack logistics features and deployment configs" || true
fi

echo ""
echo "=========================================================="
echo "🚀 NEXT STEP: Connect to your Remote GitHub Repository"
echo "=========================================================="
echo ""
echo "1. Go to GitHub (https://github.com/new) and create a new repository:"
echo "   Repository name: logistics-courier-app"
echo ""
echo "2. Copy your GitHub repository URL (e.g. https://github.com/YOUR_USERNAME/logistics-courier-app.git)"
echo ""
echo "3. Run the following commands in your terminal inside this folder:"
echo ""
echo "   git remote add origin <YOUR_GITHUB_REPO_URL>"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "=========================================================="
