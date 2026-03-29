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
