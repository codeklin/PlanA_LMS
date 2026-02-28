#!/bin/bash

# PlanA LMS Setup Script
# This script helps you set up your PlanA LMS development environment

set -e

echo "🚀 PlanA LMS Setup"
echo "=================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed${NC}"
    echo "Install pnpm: npm install -g pnpm"
    echo "Or visit: https://pnpm.io/installation"
    exit 1
fi

echo -e "${GREEN}✅ pnpm $(pnpm --version) found${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
pnpm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ .env.local created from template${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipping .env.local creation${NC}"
    fi
else
    cp .env.example .env.local
    echo -e "${GREEN}✅ .env.local created from template${NC}"
fi
echo ""

# Prompt for Supabase credentials
echo -e "${BLUE}🔑 Supabase Configuration${NC}"
echo "You need to set up your Supabase project first."
echo "Visit: https://supabase.com"
echo ""

read -p "Do you have your Supabase credentials ready? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    read -p "Enter your Supabase URL: " SUPABASE_URL
    read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY
    read -p "Enter your Supabase Service Role Key: " SUPABASE_SERVICE_KEY
    
    # Update .env.local
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|" .env.local
        sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env.local
        sed -i '' "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY|" .env.local
    else
        # Linux
        sed -i "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|" .env.local
        sed -i "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env.local
        sed -i "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY|" .env.local
    fi
    
    echo -e "${GREEN}✅ Supabase credentials saved to .env.local${NC}"
else
    echo -e "${YELLOW}⚠️  Please update .env.local with your Supabase credentials manually${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. ${BLUE}Set up Supabase database${NC}"
echo "   - Open Supabase SQL Editor"
echo "   - Copy and run: supabase-migration.sql"
echo ""
echo "2. ${BLUE}Create storage buckets${NC}"
echo "   - course-materials (public)"
echo "   - submissions (private)"
echo "   - profiles (public)"
echo "   - certificates (public)"
echo ""
echo "3. ${BLUE}Start development server${NC}"
echo "   pnpm dev"
echo ""
echo "4. ${BLUE}Open your browser${NC}"
echo "   http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Getting started"
echo "   - SUPABASE_SETUP.md - Database setup"
echo "   - PLANA_MIGRATION_CHECKLIST.md - Full checklist"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
