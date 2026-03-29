import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../auth'
import { getTopTracks, getTopArtists } from '../api'
import type { SpotifyTrack, SpotifyArtist, TimeRange } from '../types'
import './Top5.css'

const TIME_LABELS: Record<TimeRange, string> = {
  short_term: 'Last 4 Weeks',
  medium_term: 'Last 6 Months',
  long_term: 'All Time',
}

export default function Top5() {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState<TimeRange>('short_term')
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [artists, setArtists] = useState<SpotifyArtist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) { navigate('/'); return }

    setLoading(true)
    Promise.all([
      getTopTracks(token, timeRange),
      getTopArtists(token, timeRange),
    ]).then(([t, a]) => {
      setTracks(t.slice(0, 5))
      setArtists(a.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [timeRange])

  const RANKS = ['#1', '#2', '#3', '#4', '#5']
  const RANK_CLASSES = ['rank-1', 'rank-2', 'rank-3', 'rank-4', 'rank-5']

  return (
    <div className="top5-page">
      <div className="top5-header">
        <button className="top5-back" onClick={() => navigate('/dashboard')}>← Back</button>
        <h1 className="top5-title">Your Top 5</h1>
        <div className="top5-toggle">
          {(Object.entries(TIME_LABELS) as [TimeRange, string][]).map(([val, label]) => (
            <button
              key={val}
              className={`top5-toggle-btn${timeRange === val ? ' active' : ''}`}
              onClick={() => setTimeRange(val)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="top5-body">
        {/* Tracks */}
        <section className="top5-section">
          <h2 className="top5-section-title">Top Tracks</h2>
          <div className="top5-list">
            {loading
              ? RANKS.map((_, i) => <div key={i} className="top5-skeleton" />)
              : tracks.map((track, i) => (
                <a
                  key={track.id}
                  className={`top5-card ${RANK_CLASSES[i]}`}
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="top5-rank">{RANKS[i]}</span>
                  <img className="top5-img" src={track.album.images[1]?.url ?? track.album.images[0]?.url} alt={track.album.name} />
                  <div className="top5-info">
                    <div className="top5-name">{track.name}</div>
                    <div className="top5-sub">{track.artists.map(a => a.name).join(', ')}</div>
                  </div>
                  <div className="top5-arrow">↗</div>
                </a>
              ))
            }
          </div>
        </section>

        {/* Artists */}
        <section className="top5-section">
          <h2 className="top5-section-title">Top Artists</h2>
          <div className="top5-list">
            {loading
              ? RANKS.map((_, i) => <div key={i} className="top5-skeleton" />)
              : artists.map((artist, i) => (
                <a
                  key={artist.id}
                  className={`top5-card ${RANK_CLASSES[i]}`}
                  href={artist.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="top5-rank">{RANKS[i]}</span>
                  <img className="top5-img top5-img--circle" src={artist.images[1]?.url ?? artist.images[0]?.url} alt={artist.name} />
                  <div className="top5-info">
                    <div className="top5-name">{artist.name}</div>
                  </div>
                  <div className="top5-arrow">↗</div>
                </a>
              ))
            }
          </div>
        </section>
      </div>
    </div>
  )
}
