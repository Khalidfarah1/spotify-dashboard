import type { SpotifyTrack, SpotifyArtist, SpotifyRecentlyPlayedItem } from '../types'
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
    for (const genre of artist.genres) {
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

export default function StatsBar({ tracks, artists, recentlyPlayed, loading }: Props) {
  const stats = [
    {
      label: 'Top Genre',
      value: topGenre(artists),
      icon: '🎵',
    },
    {
      label: 'Unique Artists',
      value: uniqueArtists(tracks).toString(),
      icon: '🎤',
    },
    {
      label: 'Top Track',
      value: tracks[0]?.name ?? '—',
      icon: '🏆',
    },
    {
      label: 'Recent Plays',
      value: recentlyPlayed.length ? `${recentlyPlayed.length} tracks` : '—',
      icon: '🕐',
    },
  ]

  return (
    <div className="stats-bar">
      {stats.map(stat => (
        <div key={stat.label} className={`stat-card${loading ? ' stat-card--loading' : ''}`}>
          <span className="stat-icon">{stat.icon}</span>
          <div className="stat-content">
            <div className="stat-value">{loading ? '' : stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
