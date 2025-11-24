# My Campus Library - Changelog

## Overview

This document summarizes all changes made to My Campus Library (MCL) since the initial commit.

## Current Version: v0.7.0

MCL follows [Semantic Versioning](https://semver.org/) (SemVer) for version management.

## Version Format

MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes, major feature additions
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

## Version History

### 0.7.0 - Minor Release

**Release Date:** 2025-11-24
**Status:** Development

**Features:**

- Add components separator ui
- Add footer component
- Add Header component
- Add Sidebar component
- Add Vercel Analytics inside layout
- Add mockup `upload` page to test middleware

**fix:**

- Protect /upload route with middleware

**Chores:**

- Run prettier in repo
- Bump version to 0.7.0

**Refractor:**

- Replace default Next.js root layout with custom LayoutContent

**Files Created:**

- `components/ui/separator.tsx`
- `components/Header.tsx`
- `components/Footer.tsx`
- `components/Sidebar.tsx`
- `components/LayoutContent.tsx`
- `app/upload/page.tsx`
- `middleware.ts`

**Files Modified:**

- `layout.tsx`
- `package.json`
- `package-lock.json`
- `CHANGELOG.md`

### 0.6.0 - Minor Release

**Release Date:** 2025-11-24
**Status:** Development

**Features:**

- Add Google and GitHub OAuth Signup handlers
- Add Google and GitHub OAuth login handlers
- Add reusable PasswordInput component

**Chores:**

- Update `global.css` to use site brand colors
- Run prettier in repo
- Bump version to 0.6.0

**Files Created:**

- `components/ui/passwordInput`

**Files Modified:**

- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/global.css`
- `package.json`
- `package-lock.json`
- `CHANGELOG.md`

### 0.5.0 - Minor Release

**Release Date:** 2025-11-23  
**Status:** Development

**Features:**

- Implement user signup page
- Implement email/password and username/password login
- Add OAuth callback route to exchange code for session

**Chores:**

- Add License and Cla Files
- Add --webpack to package.json to use webpack instead of turbopack
- Update `env.exmaple` template
- Run prettier in repo
- Bump version to 0.5.0

**Files Created:**

- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/auth/callback/route.ts`
- `CLA.md`
- `LICENSE`

**Files Modified:**

- `package.json`
- `env.example`
- `package-lock.json`
- `CHANGELOG.md`

### 0.4.0 - Minor Release

**Release Date:** 2025-11-22  
**Status:** Development

**Features:**

- Integrate Supabase authentication and database clients"

**Chores:**

- Run prettier in repo
- Bump version to 0.4.0

**Files Created:**

- `client.ts`
- `server.ts`
- `middleware.ts`

**Files Modified:**

- `package.json`
- `package-lock.json`
- `CHANGELOG.md`

### 0.3.0 - Minor Release

**Release Date:** 2025-11-22  
**Status:** Development

**Features:**

- Add `01_core_tables.sql` database schema migration core tables script

**Chores:**

- Create environmemtal variables template
- Add comment on Envvars in gitignore
- Run prettier in repo
- Bump version to 0.3.0

**Files Created:**

- `env.example`
- `.gitignore`
- `scripts/`
- `scripts/01_core_tables.sql`

**Files Modified:**

- `package.json`
- `package-lock.json`
- `CHANGELOG.md`

### 0.2.0 - Minor Release

**Release Date:** 2025-11-22  
**Status:** Development

**Features:**

- Add shadcn/ui component library

**Chores:**

- Add `--write` to prettier script to overwrite Files
- Run prettier in repo
- Change status and remove type of first version
- Update next.config for dev/prod settings
- Bump version to 0.2.0

**Files Created:**

- `components/ui/*`
- `lib/utils`
- `components.json`

**Files Modified:**

- `package.json`
- `package-lock.json`
- `next.config.ts`
- `CHANGELOG.md`

### 0.1.0 - Minor Release

**Release Date:** 2025-11-22  
**Status:** Initial Development release

**Features:**

- Initialize Next.js 16 with TypeScript and Tailwind CSS
- Add Changelog.md
- Add README.md
- Add `assets` directory
- Add public images
- Initialize Prettier
