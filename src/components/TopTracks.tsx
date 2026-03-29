import { useState } from 'react'
import type { SpotifyTrack } from '../types'
import './TopTracks.css'

interface Props {
  tracks: SpotifyTrack[]
  loading: boolean
}

function formatDuration(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function TopTracks({ tracks, loading }: Props) {
  const [query, setQuery] = useState('')
  const filtered = query.trim()
    ? tracks.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.artists.some(a => a.name.toLowerCase().includes(query.toLowerCase()))
      )
    : tracks

  return (
    <div className="top-tracks">
      <div className="top-tracks-header">
        <h2>Top Tracks</h2>
        {!loading && (
          <input
            className="track-search"
            type="text"
            placeholder="Filter..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        )}
      </div>
      {loading ? (
        <div className="track-list">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="track-skeleton" />
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>No tracks found.</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>No tracks match.</p>
      ) : (
        <div className="track-list">
          {filtered.map((track, i) => (
            <a
              key={track.id}
              className="track-item"
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <span className="track-rank">{i + 1}</span>
              <div className="track-art-wrap">
                <img
                  className="track-art"
                  src={track.album.images[2]?.url ?? track.album.images[0]?.url}
                  alt={track.album.name}
                />
                <div className="track-play-btn">▶</div>
              </div>
              <div className="track-info">
                <div className="track-name">{track.name}</div>
                <div className="track-artist">{track.artists.map(a => a.name).join(', ')}</div>
              </div>
              <div className="track-duration">{formatDuration(track.duration_ms)}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
