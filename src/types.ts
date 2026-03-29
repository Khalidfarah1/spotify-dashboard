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
  genres: string[]
  external_urls: { spotify: string }
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtist[]
  duration_ms: number
  external_urls: { spotify: string }
  album: {
    name: string
    images: SpotifyImage[]
  }
}

export interface SpotifyRecentlyPlayedItem {
  track: SpotifyTrack
  played_at: string
}

export interface AudioFeatures {
  id: string
  energy: number
  danceability: number
  valence: number
  acousticness: number
  instrumentalness: number
}

export interface AudioFeaturesResponse {
  audio_features: AudioFeatures[]
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
