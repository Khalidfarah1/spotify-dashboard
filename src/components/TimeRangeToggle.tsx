import type { TimeRange } from '../types'
import './TimeRangeToggle.css'

const OPTIONS: { label: string; value: TimeRange }[] = [
  { label: 'Last 4 Weeks', value: 'short_term' },
  { label: 'Last 6 Months', value: 'medium_term' },
  { label: 'All Time', value: 'long_term' },
]

interface Props {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

export default function TimeRangeToggle({ value, onChange }: Props) {
  return (
    <div className="time-toggle">
      {OPTIONS.map(({ label, value: v }) => (
        <button
          key={v}
          className={`time-toggle-btn${value === v ? ' active' : ''}`}
          onClick={() => onChange(v)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
