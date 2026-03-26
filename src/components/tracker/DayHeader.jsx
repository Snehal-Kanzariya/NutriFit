/**
 * DayHeader.jsx
 * Shows full date, live IST clock (updates every minute), and greeting.
 */
import { useState, useEffect } from 'react'
import { useProfileStore } from '../../stores/useProfileStore'

function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Good night'
}

export default function DayHeader() {
  const name = useProfileStore((s) => s.name)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const dateStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(now)

  const timeStr = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(now).toUpperCase()

  return (
    <div className="px-4 md:px-6 pt-4 pb-1">
      <p className="text-xs md:text-sm text-gray-500 font-medium tracking-wide">
        {dateStr} · {timeStr} IST
      </p>
      <h2 className="text-xl md:text-2xl font-bold text-white mt-0.5">
        {getGreeting(now.getHours())}{name ? `, ${name}` : ''} 👋
      </h2>
    </div>
  )
}
