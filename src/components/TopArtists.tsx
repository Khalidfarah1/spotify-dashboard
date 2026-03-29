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
