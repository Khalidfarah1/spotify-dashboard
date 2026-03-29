import type { SpotifyArtist } from '../types'
import './GenreChart.css'

interface Props {
  artists: SpotifyArtist[]
  loading: boolean
}

function getTopGenres(artists: SpotifyArtist[], limit = 8): { genre: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const artist of artists) {
    for (const genre of artist.genres) {
      counts[genre] = (counts[genre] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genre, count]) => ({ genre: genre.replace(/\b\w/g, c => c.toUpperCase()), count }))
}

export default function GenreChart({ artists, loading }: Props) {
  const genres = getTopGenres(artists)
  const max = genres[0]?.count ?? 1

  return (
    <div className="genre-chart">
      <h2>Top Genres</h2>
      {loading ? (
        <div className="genre-list">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="genre-skeleton" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      ) : genres.length === 0 ? (
        <p className="genre-empty">No genre data available.</p>
      ) : (
        <div className="genre-list">
          {genres.map(({ genre, count }, i) => (
            <div key={genre} className="genre-row" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="genre-name">{genre}</div>
              <div className="genre-bar-track">
                <div
                  className="genre-bar-fill"
                  style={{ width: `${(count / max) * 100}%`, transitionDelay: `${i * 50}ms` }}
                />
              </div>
              <div className="genre-count">{count}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
