import type { SpotifyTrack, SpotifyArtist, SpotifyRecentlyPlayedItem } from '../types'
import { useCountUp } from '../hooks/useCountUp'
import './StatsBar.css'

interface Props {
  tracks: SpotifyTrack[]
  artists: SpotifyArtist[]
  recentlyPlayed: SpotifyRecentlyPlayedItem[]
  loading: boolean
}

function topGenre(artists: SpotifyArtist[]): string {
  const counts: Record<string, number> = {}
  for (const artist of artists) {
    for (const genre of (artist.genres ?? [])) {
      counts[genre] = (counts[genre] ?? 0) + 1
    }
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (!sorted.length) return '—'
  return sorted[0][0].replace(/\b\w/g, c => c.toUpperCase())
}

function uniqueArtists(tracks: SpotifyTrack[]): number {
  return new Set(tracks.flatMap(t => t.artists.map(a => a.id))).size
}

interface CountStatProps {
  value: number
  loading: boolean
}

function CountStat({ value, loading }: CountStatProps) {
  const displayed = useCountUp(value, 900, !loading && value > 0)
  if (loading) return <div className="stat-value-skeleton" />
  return <div className="stat-value">{displayed}</div>
}

interface TextStatProps {
  value: string
  loading: boolean
}

function TextStat({ value, loading }: TextStatProps) {
  if (loading) return <div className="stat-value-skeleton" />
  return <div className="stat-value stat-value--text">{value}</div>
}

export default function StatsBar({ tracks, artists, recentlyPlayed, loading }: Props) {
  const artistCount = uniqueArtists(tracks)
  const recentCount = recentlyPlayed.length

  return (
    <div className="stats-bar">
      <div className="stat-card" style={{ animationDelay: '0ms' }}>
        <span className="stat-icon">🎵</span>
        <div className="stat-content">
          <TextStat value={topGenre(artists)} loading={loading} />
          <div className="stat-label">Top Genre</div>
        </div>
      </div>

      <div className="stat-card" style={{ animationDelay: '60ms' }}>
        <span className="stat-icon">🎤</span>
        <div className="stat-content">
          <CountStat value={artistCount} loading={loading} />
          <div className="stat-label">Unique Artists</div>
        </div>
      </div>

      <div className="stat-card" style={{ animationDelay: '120ms' }}>
        <span className="stat-icon">🏆</span>
        <div className="stat-content">
          <TextStat value={tracks[0]?.name ?? '—'} loading={loading} />
          <div className="stat-label">Top Track</div>
        </div>
      </div>

      <div className="stat-card" style={{ animationDelay: '180ms' }}>
        <span className="stat-icon">🕐</span>
        <div className="stat-content">
          <CountStat value={recentCount} loading={loading} />
          <div className="stat-label">Recent Plays</div>
        </div>
      </div>
    </div>
  )
}
