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
        <div className="recently-played-strip">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="recent-skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem' }}>No recent plays found.</p>
      ) : (
        <div className="recently-played-strip">
          {items.map((item, i) => (
            <a
              key={`${item.track.id}-${i}`}
              className="recent-card"
              href={item.track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                className="recent-card-art"
                src={item.track.album.images[1]?.url ?? item.track.album.images[0]?.url}
                alt={item.track.album.name}
              />
              <div className="recent-card-overlay">
                <div className="recent-card-play">▶</div>
                <div className="recent-card-info">
                  <div className="recent-card-name">{item.track.name}</div>
                  <div className="recent-card-artist">{item.track.artists[0]?.name}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
