# Spotify Dashboard — Design Spec

**Date:** 2026-03-29
**Project:** `spotify-dashboard`
**Location:** `C:\Users\Khali\repos\spotify-dashboard`

---

## Overview

A personal Spotify stats dashboard that lets a user log in with their Spotify account and view their top tracks, top artists, and recently played history. Built as a portfolio project to showcase API integration, OAuth, and React skills.

---

## Stack

- **Framework:** React + Vite + TypeScript
- **Styling:** Plain CSS (Spotify dark palette — `#1db954` green, `#121212` background)
- **Auth:** Spotify OAuth 2.0 PKCE flow (no backend, runs entirely in the browser)
- **Deployment:** Vercel

---

## Pages

### `/` — Login
- Dark background with Spotify green accents
- Single "Connect with Spotify" button
- Initiates OAuth PKCE flow, redirects to Spotify auth

### `/dashboard` — Dashboard
- Redirects to `/` if no valid access token
- Handles OAuth callback (parses `code` from URL, exchanges for token)

---

## Dashboard Layout

### Time Range Toggle
- Three options at the top: `Last 4 Weeks` / `Last 6 Months` / `All Time`
- Selecting a range re-fetches and re-renders all three data sections
- Active option highlighted in Spotify green

### Two-Column Section
**Left — Top Tracks (limit: 20)**
- Album art thumbnail, track name, artist name
- Numbered list (1–20)

**Right — Top Artists (limit: 20)**
- Artist photo, artist name
- Numbered list (1–20)

### Recently Played Strip
- Horizontal scrollable row of album art cards (limit: 20)
- Track name + artist name shown on hover

### Header
- Spotify logo / app name
- User display name + avatar (from `GET /me`)
- Logout button — clears token and redirects to `/`

---

## Data — Spotify Web API Endpoints

| Endpoint | Usage |
|---|---|
| `GET /me` | User display name and avatar |
| `GET /me/top/tracks?time_range=&limit=20` | Top tracks per time range |
| `GET /me/top/artists?time_range=&limit=20` | Top artists per time range |
| `GET /me/player/recently-played?limit=20` | Recently played tracks |

**OAuth scopes required:**
- `user-top-read`
- `user-read-recently-played`

---

## Auth Flow (PKCE)

1. User clicks "Connect with Spotify"
2. App generates code verifier + challenge, stores verifier in `sessionStorage`
3. Redirect to `https://accounts.spotify.com/authorize` with PKCE params
4. Spotify redirects back to `/dashboard?code=...`
5. App exchanges code for access token via `POST /api/token`
6. Token stored in `sessionStorage`, used for all API calls
7. Logout clears `sessionStorage` and redirects to `/`

---

## Error Handling

- If token exchange fails → redirect to `/` with error message
- If API call returns 401 → clear token, redirect to `/`
- Loading states shown while fetching data
- Empty states if no data returned

---

## Out of Scope

- Refresh tokens / persistent sessions (token expires after 1 hour, user re-logs in)
- Playlist management
- Music playback controls
- Mobile-specific optimisation (responsive but not mobile-first)
