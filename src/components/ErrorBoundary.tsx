import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: string | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: unknown) {
    return { error: String(error) }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', color: '#f0f0f0', fontFamily: 'monospace', background: '#0e0e0e', minHeight: '100vh' }}>
          <h2 style={{ color: '#1db954', marginBottom: '1rem' }}>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#ff6b6b', fontSize: '0.85rem' }}>{this.state.error}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
