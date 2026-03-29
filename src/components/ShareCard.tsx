import { useRef } from 'react'
import type { SpotifyTrack, SpotifyArtist, TimeRange } from '../types'
import './ShareCard.css'

interface Props {
  tracks: SpotifyTrack[]
  artists: SpotifyArtist[]
  timeRange: TimeRange
  onClose: () => void
}

const TIME_LABELS: Record<TimeRange, string> = {
  short_term: 'Last 4 Weeks',
  medium_term: 'Last 6 Months',
  long_term: 'All Time',
}

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32', '#6b7280', '#6b7280']

export default function ShareCard({ tracks, artists, timeRange, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    draw(canvas)
    const link = document.createElement('a')
    link.download = 'my-top-5-spotify.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  function draw(canvas: HTMLCanvasElement) {
    const W = 600
    const H = 800
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!

    // Background
    ctx.fillStyle = '#0e0e0e'
    ctx.fillRect(0, 0, W, H)

    // Green radial glow
    const grd = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 500)
    grd.addColorStop(0, 'rgba(29,185,84,0.15)')
    grd.addColorStop(1, 'rgba(29,185,84,0)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, W, H)

    // Header
    ctx.fillStyle = '#1db954'
    ctx.font = '900 32px Outfit, Arial'
    ctx.fillText('Spotify', 40, 60)
    ctx.fillStyle = '#f0f0f0'
    ctx.font = '900 32px Outfit, Arial'
    ctx.fillText(' Stats', 40 + ctx.measureText('Spotify').width, 60)

    ctx.fillStyle = '#4a4a4a'
    ctx.font = '500 14px Inter, Arial'
    ctx.fillText(TIME_LABELS[timeRange].toUpperCase(), 40, 86)

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, 104)
    ctx.lineTo(W - 40, 104)
    ctx.stroke()

    // --- Top Tracks ---
    ctx.fillStyle = '#4a4a4a'
    ctx.font = '700 11px Inter, Arial'
    ctx.letterSpacing = '2px'
    ctx.fillText('TOP TRACKS', 40, 132)

    const top5 = tracks.slice(0, 5)
    top5.forEach((track, i) => {
      const y = 155 + i * 58

      // Rank pill background
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      roundRect(ctx, 40, y, W - 80, 48, 10)
      ctx.fill()

      // Left color bar
      ctx.fillStyle = RANK_COLORS[i]
      roundRect(ctx, 40, y, 3, 48, 2)
      ctx.fill()

      // Rank number
      ctx.fillStyle = RANK_COLORS[i]
      ctx.font = '900 18px Outfit, Arial'
      ctx.fillText(`#${i + 1}`, 54, y + 30)

      // Track name
      ctx.fillStyle = '#f0f0f0'
      ctx.font = '700 15px Inter, Arial'
      const name = truncate(track.name, 32)
      ctx.fillText(name, 100, y + 20)

      // Artist name
      ctx.fillStyle = '#a0a0a0'
      ctx.font = '400 12px Inter, Arial'
      ctx.fillText(track.artists.map(a => a.name).join(', '), 100, y + 38)
    })

    // --- Top Artists ---
    const artistsY = 160 + 5 * 58 + 16

    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, artistsY - 8)
    ctx.lineTo(W - 40, artistsY - 8)
    ctx.stroke()

    ctx.fillStyle = '#4a4a4a'
    ctx.font = '700 11px Inter, Arial'
    ctx.fillText('TOP ARTISTS', 40, artistsY + 12)

    const top5a = artists.slice(0, 5)
    top5a.forEach((artist, i) => {
      const y = artistsY + 34 + i * 48

      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      roundRect(ctx, 40, y, W - 80, 38, 10)
      ctx.fill()

      ctx.fillStyle = RANK_COLORS[i]
      roundRect(ctx, 40, y, 3, 38, 2)
      ctx.fill()

      ctx.fillStyle = RANK_COLORS[i]
      ctx.font = '900 15px Outfit, Arial'
      ctx.fillText(`#${i + 1}`, 54, y + 24)

      ctx.fillStyle = '#f0f0f0'
      ctx.font = '600 14px Inter, Arial'
      ctx.fillText(truncate(artist.name, 36), 100, y + 24)
    })

    // Footer
    ctx.fillStyle = '#4a4a4a'
    ctx.font = '400 11px Inter, Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Built by Khalid Farah · spotify-dashboard-tau.vercel.app', W / 2, H - 20)
    ctx.textAlign = 'left'
  }

  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>Share Your Top 5</h2>
          <button className="share-close" onClick={onClose}>✕</button>
        </div>

        <div className="share-preview">
          <div className="share-card-preview">
            <div className="share-card-title">
              <span className="green">Spotify</span> Stats
            </div>
            <div className="share-card-period">{TIME_LABELS[timeRange]}</div>
            <div className="share-section-label">Top Tracks</div>
            {tracks.slice(0, 5).map((track, i) => (
              <div key={track.id} className="share-row">
                <span className="share-rank" style={{ color: RANK_COLORS[i] }}>#{i + 1}</span>
                <div>
                  <div className="share-row-name">{track.name}</div>
                  <div className="share-row-sub">{track.artists.map(a => a.name).join(', ')}</div>
                </div>
              </div>
            ))}
            <div className="share-section-label" style={{ marginTop: '1rem' }}>Top Artists</div>
            {artists.slice(0, 5).map((artist, i) => (
              <div key={artist.id} className="share-row">
                <span className="share-rank" style={{ color: RANK_COLORS[i] }}>#{i + 1}</span>
                <div className="share-row-name">{artist.name}</div>
              </div>
            ))}
            <div className="share-card-footer">Built by Khalid Farah</div>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <button className="share-download-btn" onClick={download}>
          Download Image ↓
        </button>
      </div>
    </div>
  )
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}
