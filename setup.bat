@echo off
REM PlanA LMS Setup Script for Windows
REM This script helps you set up your PlanA LMS development environment

echo.
echo ========================================
echo    PlanA LMS Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js found
node --version

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] pnpm is not installed
    echo Install pnpm: npm install -g pnpm
    echo Or visit: https://pnpm.io/installation
    pause
    exit /b 1
)

echo [OK] pnpm found
pnpm --version
echo.

REM Install dependencies
echo Installing dependencies...
call pnpm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed
echo.

REM Check if .env.local exists
if exist .env.local (
    echo [WARNING] .env.local already exists
    set /p OVERWRITE="Do you want to overwrite it? (y/N): "
    if /i "%OVERWRITE%"=="y" (
        copy /y .env.example .env.local >nul
        echo [OK] .env.local created from template
    ) else (
        echo [SKIP] Keeping existing .env.local
    )
) else (
    copy .env.example .env.local >nul
    echo [OK] .env.local created from template
)
echo.

REM Prompt for Supabase credentials
echo ========================================
echo    Supabase Configuration
echo ========================================
echo.
echo You need to set up your Supabase project first.
echo Visit: https://supabase.com
echo.

set /p SETUP_SUPABASE="Do you have your Supabase credentials ready? (y/N): "
if /i "%SETUP_SUPABASE%"=="y" (
    echo.
    set /p SUPABASE_URL="Enter your Supabase URL: "
    set /p SUPABASE_ANON_KEY="Enter your Supabase Anon Key: "
    set /p SUPABASE_SERVICE_KEY="Enter your Supabase Service Role Key: "
    
    REM Update .env.local (basic replacement)
    echo NEXT_PUBLIC_SUPABASE_URL=%SUPABASE_URL%> .env.temp
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY%>> .env.temp
    echo SUPABASE_SERVICE_ROLE_KEY=%SUPABASE_SERVICE_KEY%>> .env.temp
    
    REM Append other variables from example
    findstr /v "SUPABASE" .env.example >> .env.temp
    move /y .env.temp .env.local >nul
    
    echo [OK] Supabase credentials saved to .env.local
) else (
    echo [WARNING] Please update .env.local with your Supabase credentials manually
)
echo.

REM Summary
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Set up Supabase database
echo    - Open Supabase SQL Editor
echo    - Copy and run: supabase-migration.sql
echo.
echo 2. Create storage buckets
echo    - course-materials (public)
echo    - submissions (private)
echo    - profiles (public)
echo    - certificates (public)
echo.
echo 3. Start development server
echo    pnpm dev
echo.
echo 4. Open your browser
echo    http://localhost:3000
echo.
echo Documentation:
echo    - README.md - Getting started
echo    - SUPABASE_SETUP.md - Database setup
echo    - PLANA_MIGRATION_CHECKLIST.md - Full checklist
echo.
echo Happy coding! 🚀
echo.
pause
