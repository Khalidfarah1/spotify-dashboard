import type { SpotifyUser } from '../types'
import { clearToken } from '../auth'
import { useNavigate } from 'react-router-dom'
import './Header.css'

interface Props {
  user: SpotifyUser
}

export default function Header({ user }: Props) {
  const navigate = useNavigate()
  const avatar = user.images?.[0]?.url

  function handleLogout() {
    clearToken()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-brand"><span>Spotify</span> Stats</div>
      <div className="header-user">
        {avatar && <img className="header-avatar" src={avatar} alt={user.display_name} />}
        <span className="header-name">{user.display_name}</span>
        <button className="header-logout" onClick={handleLogout}>Log out</button>
      </div>
    </header>
  )
}
