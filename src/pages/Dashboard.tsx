import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeCodeForToken, getToken } from '../auth'
import { getUser, getTopTracks, getTopArtists, getRecentlyPlayed } from '../api'
import type { SpotifyUser, SpotifyTrack, SpotifyArtist, SpotifyRecentlyPlayedItem, TimeRange } from '../types'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import TimeRangeToggle from '../components/TimeRangeToggle'
import TopTracks from '../components/TopTracks'
import TopArtists from '../components/TopArtists'
import RecentlyPlayed from '../components/RecentlyPlayed'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<SpotifyUser | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('short_term')
  const [tracks, setTracks] = useState<SpotifyTrack[]>([])
  const [artists, setArtists] = useState<SpotifyArtist[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<SpotifyRecentlyPlayedItem[]>([])
  const [loadingTracks, setLoadingTracks] = useState(false)
  const [loadingArtists, setLoadingArtists] = useState(false)
  const [loadingRecent, setLoadingRecent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      searchParams.delete('code')
      setSearchParams(searchParams, { replace: true })
      exchangeCodeForToken(code)
        .then(t => setToken(t))
        .catch(() => {
          setError('Failed to connect to Spotify. Please try again.')
          navigate('/')
        })
      return
    }

    const existing = getToken()
    if (!existing) {
      navigate('/')
      return
    }
    setToken(existing)
  }, [])

  // Fetch user profile once token is available
  useEffect(() => {
    if (!token) return
    getUser(token).then(setUser).catch(() => setError('Failed to load profile.'))
  }, [token])

  // Fetch top tracks + artists when token or time range changes
  useEffect(() => {
    if (!token) return
    setLoadingTracks(true)
    setLoadingArtists(true)
    getTopTracks(token, timeRange)
      .then(setTracks)
      .catch(() => setTracks([]))
      .finally(() => setLoadingTracks(false))
    getTopArtists(token, timeRange)
      .then(setArtists)
      .catch(() => setArtists([]))
      .finally(() => setLoadingArtists(false))
  }, [token, timeRange])

  // Fetch recently played once (not time-range dependent)
  useEffect(() => {
    if (!token) return
    setLoadingRecent(true)
    getRecentlyPlayed(token)
      .then(setRecentlyPlayed)
      .catch(() => setRecentlyPlayed([]))
      .finally(() => setLoadingRecent(false))
  }, [token])

  if (error) return <div className="dashboard-error">{error}</div>
  if (!user) return <div className="dashboard-error">Connecting...</div>

  return (
    <div className="dashboard">
      <Header user={user} />
      <div className="dashboard-body">
        <div className="dashboard-top-bar">
          <TimeRangeToggle value={timeRange} onChange={setTimeRange} />
          <Link to="/top5" className="top5-link">View Top 5 ↗</Link>
        </div>
        <div className="dashboard-columns">
          <TopTracks tracks={tracks} loading={loadingTracks} />
          <TopArtists artists={artists} loading={loadingArtists} />
        </div>
        <RecentlyPlayed items={recentlyPlayed} loading={loadingRecent} />
      </div>
      <footer className="dashboard-footer">Built by Khalid Farah</footer>
    </div>
  )
}
