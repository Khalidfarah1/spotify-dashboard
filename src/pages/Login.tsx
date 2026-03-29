import './Login.css'
import { redirectToSpotifyLogin } from '../auth'

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-logo">
        <span>Spotify</span> Stats
      </div>
      <p className="login-title">
        See your top tracks, top artists, and listening history — all in one place.
      </p>
      <button className="login-btn" onClick={redirectToSpotifyLogin}>
        Connect with Spotify
      </button>
      <p className="login-credit">Built by Khalid Farah</p>
    </div>
  )
}
