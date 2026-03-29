# Spotify Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React + Vite + TypeScript Spotify dashboard that authenticates via OAuth PKCE and shows the user's top tracks, top artists, and recently played history.

**Architecture:** Single-page app with React Router for `/` (login) and `/dashboard` (protected). Auth and API logic live in dedicated modules. All components are presentational, receiving data as props from the Dashboard page.

**Tech Stack:** React 18, Vite, TypeScript, React Router v6, plain CSS, Spotify Web API, Vercel

---

## File Structure

```
spotify-dashboard/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .env.example
├── .gitignore
├── vercel.json
├── src/
│   ├── main.tsx              # Entry point, BrowserRouter + routes
│   ├── index.css             # Global styles, CSS variables, Spotify palette
│   ├── types.ts              # Spotify API response types
│   ├── auth.ts               # PKCE helpers, login, logout, token exchange
│   ├── api.ts                # Spotify API fetch wrappers
│   ├── pages/
│   │   ├── Login.tsx         # Login page with "Connect with Spotify" button
│   │   └── Dashboard.tsx     # Protected dashboard, handles callback + data fetching
│   └── components/
│       ├── Header.tsx        # User avatar, name, logout button
│       ├── TimeRangeToggle.tsx  # 4 weeks / 6 months / all time selector
│       ├── TopTracks.tsx     # Numbered list with album art
│       ├── TopArtists.tsx    # Numbered list with artist photo
│       └── RecentlyPlayed.tsx   # Horizontal scrollable strip
```

---

## Task 1: Scaffold the project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `.env.example`, `.gitignore`, `vercel.json`

- [ ] **Step 1: Scaffold Vite project**

Run in `C:\Users\Khali\repos` (NOT inside spotify-dashboard — Vite will create the folder):
```bash
cd "C:/Users/Khali/repos"
npm create vite@latest spotify-dashboard -- --template react-ts
cd spotify-dashboard
npm install
npm install react-router-dom
npm install -D vitest @vitest/ui
```

- [ ] **Step 2: Replace `vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
})
```

- [ ] **Step 3: Create `.env.example`**

```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_REDIRECT_URI=http://localhost:5173/dashboard
```

- [ ] **Step 4: Create `.env` (not committed)**

Copy `.env.example` to `.env` and fill in your Spotify app credentials. To get these:
1. Go to https://developer.spotify.com/dashboard
2. Create an app
3. Add `http://localhost:5173/dashboard` as a Redirect URI
4. Copy the Client ID

- [ ] **Step 5: Create `vercel.json`** (for SPA routing on Vercel)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 6: Update `.gitignore`** — ensure `.env` is listed (Vite's default includes it, verify it's there)

- [ ] **Step 7: Delete boilerplate**

Delete `src/App.tsx`, `src/App.css`, `src/assets/`, `public/vite.svg`.

- [ ] **Step 8: Replace `index.html` title**

Change `<title>Vite + React + TS</title>` to `<title>Spotify Dashboard</title>`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TS project"
```

---

## Task 2: TypeScript types

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Create `src/types.ts`**

```typescript
export type TimeRange = 'short_term' | 'medium_term' | 'long_term'

export interface SpotifyImage {
  url: string
  width: number | null
  height: number | null
}

export interface SpotifyUser {
  id: string
  display_name: string
  images: SpotifyImage[]
}

export interface SpotifyArtist {
  id: string
  name: string
  images: SpotifyImage[]
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: {
    name: string
    images: SpotifyImage[]
  }
}

export interface SpotifyRecentlyPlayedItem {
  track: SpotifyTrack
  played_at: string
}

export interface TopTracksResponse {
  items: SpotifyTrack[]
}

export interface TopArtistsResponse {
  items: SpotifyArtist[]
}

export interface RecentlyPlayedResponse {
  items: SpotifyRecentlyPlayedItem[]
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types.ts
git commit -m "feat: add Spotify API types"
```

---

## Task 3: Auth module

**Files:**
- Create: `src/auth.ts`
- Create: `src/auth.test.ts`

- [ ] **Step 1: Write failing tests for PKCE helpers**

Create `src/auth.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { generateCodeVerifier, generateCodeChallenge } from './auth'

describe('generateCodeVerifier', () => {
  it('returns a string of length between 43 and 128', () => {
    const verifier = generateCodeVerifier()
    expect(verifier.length).toBeGreaterThanOrEqual(43)
    expect(verifier.length).toBeLessThanOrEqual(128)
  })

  it('only contains URL-safe characters', () => {
    const verifier = generateCodeVerifier()
    expect(verifier).toMatch(/^[A-Za-z0-9\-._~]+$/)
  })
})

describe('generateCodeChallenge', () => {
  it('returns a non-empty base64url string', async () => {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    expect(challenge.length).toBeGreaterThan(0)
    expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/auth.test.ts
```
Expected: FAIL — `auth` module not found

- [ ] **Step 3: Create `src/auth.ts`**

```typescript
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI as string
const SCOPES = 'user-top-read user-read-recently-played user-read-private'
const TOKEN_KEY = 'spotify_access_token'
const VERIFIER_KEY = 'spotify_code_verifier'

export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function redirectToSpotifyLogin(): Promise<void> {
  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  sessionStorage.setItem(VERIFIER_KEY, verifier)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES,
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const verifier = sessionStorage.getItem(VERIFIER_KEY)
  if (!verifier) throw new Error('No code verifier found')

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  })

  if (!response.ok) throw new Error('Token exchange failed')

  const data = await response.json()
  sessionStorage.setItem(TOKEN_KEY, data.access_token)
  sessionStorage.removeItem(VERIFIER_KEY)
  return data.access_token
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(VERIFIER_KEY)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/auth.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/auth.ts src/auth.test.ts
git commit -m "feat: add PKCE auth module with tests"
```

---

## Task 4: API module

**Files:**
- Create: `src/api.ts`

- [ ] **Step 1: Create `src/api.ts`**

```typescript
import type { SpotifyUser, SpotifyTrack, SpotifyArtist, SpotifyRecentlyPlayedItem, TimeRange, TopTracksResponse, TopArtistsResponse, RecentlyPlayedResponse } from './types'
import { clearToken } from './auth'

const BASE = 'https://api.spotify.com/v1'

async function spotifyFetch<T>(endpoint: string, token: string): Promise<T> {
  const response = await fetch(`${BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (response.status === 401) {
    clearToken()
    window.location.href = '/'
    throw new Error('Unauthorized')
  }

  if (!response.ok) throw new Error(`Spotify API error: ${response.status}`)

  return response.json() as Promise<T>
}

export async function getUser(token: string): Promise<SpotifyUser> {
  return spotifyFetch<SpotifyUser>('/me', token)
}

export async function getTopTracks(token: string, timeRange: TimeRange): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<TopTracksResponse>(
    `/me/top/tracks?time_range=${timeRange}&limit=20`,
    token
  )
  return data.items
}

export async function getTopArtists(token: string, timeRange: TimeRange): Promise<SpotifyArtist[]> {
  const data = await spotifyFetch<TopArtistsResponse>(
    `/me/top/artists?time_range=${timeRange}&limit=20`,
    token
  )
  return data.items
}

export async function getRecentlyPlayed(token: string): Promise<SpotifyRecentlyPlayedItem[]> {
  const data = await spotifyFetch<RecentlyPlayedResponse>(
    '/me/player/recently-played?limit=20',
    token
  )
  return data.items
}
```

- [ ] **Step 2: Commit**

```bash
git add src/api.ts
git commit -m "feat: add Spotify API module"
```

---

## Task 5: Global styles

**Files:**
- Modify: `src/index.css`
- Modify: `src/main.tsx` (import)

- [ ] **Step 1: Replace `src/index.css`**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --green: #1db954;
  --green-dark: #158a3e;
  --bg: #121212;
  --bg2: #181818;
  --surface: #282828;
  --border: #333;
  --text: #fff;
  --text-dim: #b3b3b3;
  --text-faint: #535353;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  min-height: 100vh;
}

img { display: block; }

a { color: inherit; text-decoration: none; }

button {
  cursor: pointer;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
}

/* Scrollbar */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--surface); border-radius: 4px; }
```

- [ ] **Step 2: Update `src/main.tsx`** to only import `index.css` (remove any App import)

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 3: Commit**

```bash
git add src/index.css src/main.tsx
git commit -m "feat: add global Spotify styles"
```

---

## Task 6: Login page

**Files:**
- Create: `src/pages/Login.tsx`
- Create: `src/pages/Login.css`

- [ ] **Step 1: Create `src/pages/Login.css`**

```css
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 2rem;
  text-align: center;
  padding: 2rem;
}

.login-logo {
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.login-logo span { color: var(--green); }

.login-title {
  font-size: 1.1rem;
  color: var(--text-dim);
  max-width: 320px;
  line-height: 1.6;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--green);
  color: #000;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.9rem 2rem;
  border-radius: 9999px;
  transition: background 0.2s, transform 0.1s;
}

.login-btn:hover { background: var(--green-dark); transform: scale(1.03); }
.login-btn:active { transform: scale(0.98); }
```

- [ ] **Step 2: Create `src/pages/Login.tsx`**

```typescript
import './Login.css'
import { redirectToSpotifyLogin } from '../auth'

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-logo">
        <span>Spotify</span> Stats
      </div>
      <p className="login-title">
        See your top tracks, top artists, and listening history — all in one place.
      </p>
      <button className="login-btn" onClick={redirectToSpotifyLogin}>
        Connect with Spotify
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/
git commit -m "feat: add login page"
```

---

## Task 7: Header component

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/Header.css`

- [ ] **Step 1: Create `src/components/Header.css`**

```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: var(--bg2);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-brand {
  font-size: 1.2rem;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.header-brand span { color: var(--green); }

.header-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--surface);
}

.header-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-dim);
}

.header-logout {
  font-size: 0.8rem;
  color: var(--text-faint);
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 9999px;
  transition: color 0.2s, border-color 0.2s;
}

.header-logout:hover { color: var(--text); border-color: var(--text-dim); }
```

- [ ] **Step 2: Create `src/components/Header.tsx`**

```typescript
import type { SpotifyUser } from '../types'
import { clearToken } from '../auth'
import { useNavigate } from 'react-router-dom'
import './Header.css'

interface Props {
  user: SpotifyUser
}

export default function Header({ user }: Props) {
  const navigate = useNavigate()
  const avatar = user.images?.[0]?.url

  function handleLogout() {
    clearToken()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-brand"><span>Spotify</span> Stats</div>
      <div className="header-user">
        {avatar && <img className="header-avatar" src={avatar} alt={user.display_name} />}
        <span className="header-name">{user.display_name}</span>
        <button className="header-logout" onClick={handleLogout}>Log out</button>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.tsx src/components/Header.css
git commit -m "feat: add Header component"
```

---

## Task 8: TimeRangeToggle component

**Files:**
- Create: `src/components/TimeRangeToggle.tsx`
- Create: `src/components/TimeRangeToggle.css`

- [ ] **Step 1: Create `src/components/TimeRangeToggle.css`**

```css
.time-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.time-toggle-btn {
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid var(--border);
  color: var(--text-dim);
  transition: all 0.15s;
}

.time-toggle-btn:hover { border-color: var(--text-dim); color: var(--text); }

.time-toggle-btn.active {
  background: var(--green);
  border-color: var(--green);
  color: #000;
}
```

- [ ] **Step 2: Create `src/components/TimeRangeToggle.tsx`**

```typescript
import type { TimeRange } from '../types'
import './TimeRangeToggle.css'

const OPTIONS: { label: string; value: TimeRange }[] = [
  { label: 'Last 4 Weeks', value: 'short_term' },
  { label: 'Last 6 Months', value: 'medium_term' },
  { label: 'All Time', value: 'long_term' },
]

interface Props {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

export default function TimeRangeToggle({ value, onChange }: Props) {
  return (
    <div className="time-toggle">
      {OPTIONS.map(({ label, value: v }) => (
        <button
          key={v}
          className={`time-toggle-btn${value === v ? ' active' : ''}`}
          onClick={() => onChange(v)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TimeRangeToggle.tsx src/components/TimeRangeToggle.css
git commit -m "feat: add TimeRangeToggle component"
```

---

## Task 9: TopTracks component

**Files:**
- Create: `src/components/TopTracks.tsx`
- Create: `src/components/TopTracks.css`

- [ ] **Step 1: Create `src/components/TopTracks.css`**

```css
.top-tracks h2 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-dim); }

.track-list { display: flex; flex-direction: column; gap: 0.5rem; }

.track-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.15s;
}

.track-item:hover { background: var(--surface); }

.track-rank {
  width: 20px;
  text-align: right;
  font-size: 0.8rem;
  color: var(--text-faint);
  flex-shrink: 0;
}

.track-art {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--surface);
}

.track-info { min-width: 0; }

.track-name {
  font-size: 0.88rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 0.78rem;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

- [ ] **Step 2: Create `src/components/TopTracks.tsx`**

```typescript
import type { SpotifyTrack } from '../types'
import './TopTracks.css'

interface Props {
  tracks: SpotifyTrack[]
  loading: boolean
}

export default function TopTracks({ tracks, loading }: Props) {
  return (
    <div className="top-tracks">
      <h2>Top Tracks</h2>
      {loading ? (
        <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>Loading...</p>
      ) : tracks.length === 0 ? (
        <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>No tracks found.</p>
      ) : (
        <div className="track-list">
          {tracks.map((track, i) => (
            <div key={track.id} className="track-item">
              <span className="track-rank">{i + 1}</span>
              <img
                className="track-art"
                src={track.album.images[2]?.url ?? track.album.images[0]?.url}
                alt={track.album.name}
              />
              <div className="track-info">
                <div className="track-name">{track.name}</div>
                <div className="track-artist">{track.artists.map(a => a.name).join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TopTracks.tsx src/components/TopTracks.css
git commit -m "feat: add TopTracks component"
```

---

## Task 10: TopArtists component

**Files:**
- Create: `src/components/TopArtists.tsx`
- Create: `src/components/TopArtists.css`

- [ ] **Step 1: Create `src/components/TopArtists.css`**

```css
.top-artists h2 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-dim); }

.artist-list { display: flex; flex-direction: column; gap: 0.5rem; }

.artist-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background 0.15s;
}

.artist-item:hover { background: var(--surface); }

.artist-rank {
  width: 20px;
  text-align: right;
  font-size: 0.8rem;
  color: var(--text-faint);
  flex-shrink: 0;
}

.artist-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--surface);
}

.artist-name {
  font-size: 0.88rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

- [ ] **Step 2: Create `src/components/TopArtists.tsx`**

```typescript
import type { SpotifyArtist } from '../types'
import './TopArtists.css'

interface Props {
  artists: SpotifyArtist[]
  loading: boolean
}

export default function TopArtists({ artists, loading }: Props) {
  return (
    <div className="top-artists">
      <h2>Top Artists</h2>
      {loading ? (
        <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>Loading...</p>
      ) : artists.length === 0 ? (
        <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>No artists found.</p>
      ) : (
        <div className="artist-list">
          {artists.map((artist, i) => (
            <div key={artist.id} className="artist-item">
              <span className="artist-rank">{i + 1}</span>
              <img
                className="artist-photo"
                src={artist.images[2]?.url ?? artist.images[0]?.url}
                alt={artist.name}
              />
              <div className="artist-name">{artist.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TopArtists.tsx src/components/TopArtists.css
git commit -m "feat: add TopArtists component"
```

---

## Task 11: RecentlyPlayed component

**Files:**
- Create: `src/components/RecentlyPlayed.tsx`
- Create: `src/components/RecentlyPlayed.css`

- [ ] **Step 1: Create `src/components/RecentlyPlayed.css`**

```css
.recently-played { margin-top: 2.5rem; }

.recently-played h2 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.recently-played-strip {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.75rem;
}

.recently-played-strip::-webkit-scrollbar { height: 4px; }

.recent-card {
  position: relative;
  flex-shrink: 0;
  width: 100px;
  cursor: default;
}

.recent-card-art {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  object-fit: cover;
  background: var(--surface);
}

.recent-card-info {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.75);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.recent-card:hover .recent-card-info { opacity: 1; }

.recent-card-name {
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-card-artist {
  font-size: 0.65rem;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

- [ ] **Step 2: Create `src/components/RecentlyPlayed.tsx`**

```typescript
import type { SpotifyRecentlyPlayedItem } from '../types'
import './RecentlyPlayed.css'

interface Props {
  items: SpotifyRecentlyPlayedItem[]
  loading: boolean
}

export default function RecentlyPlayed({ items, loading }: Props) {
  return (
    <div className="recently-played">
      <h2>Recently Played</h2>
      {loading ? (
        <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>Loading...</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>No recent plays found.</p>
      ) : (
        <div className="recently-played-strip">
          {items.map((item, i) => (
            <div key={`${item.track.id}-${i}`} className="recent-card">
              <img
                className="recent-card-art"
                src={item.track.album.images[1]?.url ?? item.track.album.images[0]?.url}
                alt={item.track.album.name}
              />
              <div className="recent-card-info">
                <div className="recent-card-name">{item.track.name}</div>
                <div className="recent-card-artist">{item.track.artists[0]?.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/RecentlyPlayed.tsx src/components/RecentlyPlayed.css
git commit -m "feat: add RecentlyPlayed component"
```

---

## Task 12: Dashboard page

**Files:**
- Create: `src/pages/Dashboard.tsx`
- Create: `src/pages/Dashboard.css`

- [ ] **Step 1: Create `src/pages/Dashboard.css`**

```css
.dashboard { min-height: 100vh; }

.dashboard-body {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.dashboard-error {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-dim);
}

@media (max-width: 700px) {
  .dashboard-columns { grid-template-columns: 1fr; }
  .dashboard-body { padding: 1rem; }
}
```

- [ ] **Step 2: Create `src/pages/Dashboard.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeCodeForToken, getToken } from '../auth'
import { getUser, getTopTracks, getTopArtists, getRecentlyPlayed } from '../api'
import type { SpotifyUser, SpotifyTrack, SpotifyArtist, SpotifyRecentlyPlayedItem, TimeRange } from '../types'
import Header from '../components/Header'
import TimeRangeToggle from '../components/TimeRangeToggle'
import TopTracks from '../components/TopTracks'
import TopArtists from '../components/TopArtists'
import RecentlyPlayed from '../components/RecentlyPlayed'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<SpotifyUser | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('short_term')
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [artists, setArtists] = useState<SpotifyArtist[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<SpotifyRecentlyPlayedItem[]>([])
  const [loadingTracks, setLoadingTracks] = useState(false)
  const [loadingArtists, setLoadingArtists] = useState(false)
  const [loadingRecent, setLoadingRecent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      searchParams.delete('code')
      setSearchParams(searchParams, { replace: true })
      exchangeCodeForToken(code)
        .then(t => setToken(t))
        .catch(() => {
          setError('Failed to connect to Spotify. Please try again.')
          navigate('/')
        })
      return
    }

    const existing = getToken()
    if (!existing) {
      navigate('/')
      return
    }
    setToken(existing)
  }, [])

  // Fetch user profile once token is available
  useEffect(() => {
    if (!token) return
    getUser(token).then(setUser).catch(() => setError('Failed to load profile.'))
  }, [token])

  // Fetch top tracks + artists when token or time range changes
  useEffect(() => {
    if (!token) return
    setLoadingTracks(true)
    setLoadingArtists(true)
    getTopTracks(token, timeRange)
      .then(setTracks)
      .catch(() => setTracks([]))
      .finally(() => setLoadingTracks(false))
    getTopArtists(token, timeRange)
      .then(setArtists)
      .catch(() => setArtists([]))
      .finally(() => setLoadingArtists(false))
  }, [token, timeRange])

  // Fetch recently played once (not time-range dependent)
  useEffect(() => {
    if (!token) return
    setLoadingRecent(true)
    getRecentlyPlayed(token)
      .then(setRecentlyPlayed)
      .catch(() => setRecentlyPlayed([]))
      .finally(() => setLoadingRecent(false))
  }, [token])

  if (error) return <div className="dashboard-error">{error}</div>
  if (!user) return <div className="dashboard-error">Connecting...</div>

  return (
    <div className="dashboard">
      <Header user={user} />
      <div className="dashboard-body">
        <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
        <div className="dashboard-columns">
          <TopTracks tracks={tracks} loading={loadingTracks} />
          <TopArtists artists={artists} loading={loadingArtists} />
        </div>
        <RecentlyPlayed items={recentlyPlayed} loading={loadingRecent} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Dashboard.tsx src/pages/Dashboard.css
git commit -m "feat: add Dashboard page"
```

---

## Task 13: App router + entry point

**Files:**
- Create: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create `src/App.tsx`**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Verify `src/main.tsx`** matches what was set in Task 5 Step 2 (imports App and index.css).

- [ ] **Step 3: Run dev server and verify login page loads**

```bash
npm run dev
```

Open `http://localhost:5173`. Expected: Login page with "Connect with Spotify" button.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: add router and wire up pages"
```

---

## Task 14: End-to-end test + Vercel deploy

**Files:**
- Verify: `vercel.json` exists from Task 1

- [ ] **Step 1: Test the full OAuth flow locally**

1. Make sure `.env` has your `VITE_SPOTIFY_CLIENT_ID` and `VITE_REDIRECT_URI=http://localhost:5173/dashboard`
2. Run `npm run dev`
3. Click "Connect with Spotify"
4. Log in with your Spotify account
5. Verify you land on the dashboard with your real data

- [ ] **Step 2: Build and verify no TypeScript errors**

```bash
npm run build
```
Expected: Build succeeds with no errors in `dist/`

- [ ] **Step 3: Push to GitHub**

```bash
git add -A
git commit -m "chore: final build verification"
git remote add origin https://github.com/Khalidfarah1/<repo-name>.git
git push -u origin main
```

- [ ] **Step 4: Deploy to Vercel**

1. Go to https://vercel.com and import the GitHub repo
2. In Vercel project settings → Environment Variables, add:
   - `VITE_SPOTIFY_CLIENT_ID` = your client ID
   - `VITE_REDIRECT_URI` = `https://your-vercel-url.vercel.app/dashboard`
3. Redeploy
4. In Spotify Developer Dashboard, add the Vercel URL as a Redirect URI

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: ready for deployment"
git push
```
