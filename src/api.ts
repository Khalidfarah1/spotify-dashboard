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
