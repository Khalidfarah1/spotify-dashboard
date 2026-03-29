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
