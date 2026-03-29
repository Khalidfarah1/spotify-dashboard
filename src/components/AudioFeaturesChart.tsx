import type { AudioFeatures } from '../types'
import './AudioFeaturesChart.css'

interface Props {
  features: AudioFeatures[]
  loading: boolean
}

const METRICS = [
  { key: 'energy',           label: 'Energy',           color: '#f97316' },
  { key: 'danceability',     label: 'Danceability',     color: '#a855f7' },
  { key: 'valence',          label: 'Happiness',        color: '#eab308' },
  { key: 'acousticness',     label: 'Acousticness',     color: '#22d3ee' },
  { key: 'instrumentalness', label: 'Instrumental',     color: '#1db954' },
] as const

function avg(features: AudioFeatures[], key: keyof AudioFeatures): number {
  if (!features.length) return 0
  return features.reduce((sum, f) => sum + (f[key] as number), 0) / features.length
}

export default function AudioFeaturesChart({ features, loading }: Props) {
  return (
    <div className="audio-features">
      <h2>Audio Profile</h2>
      <p className="audio-features-sub">Average across your top 10 tracks</p>
      {loading ? (
        <div className="af-list">
          {METRICS.map((_, i) => (
            <div key={i} className="af-skeleton" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      ) : features.length === 0 ? (
        <p className="af-empty">No audio data available.</p>
      ) : (
        <div className="af-list">
          {METRICS.map(({ key, label, color }, i) => {
            const value = avg(features, key)
            return (
              <div key={key} className="af-row" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="af-label">{label}</div>
                <div className="af-bar-track">
                  <div
                    className="af-bar-fill"
                    style={{
                      width: `${value * 100}%`,
                      background: color,
                      transitionDelay: `${i * 60}ms`,
                    }}
                  />
                </div>
                <div className="af-value">{Math.round(value * 100)}%</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
