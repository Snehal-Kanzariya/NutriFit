/**
 * OfflineBadge.jsx
 * Listens to browser online/offline events and shows a badge when offline.
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff } from 'lucide-react'

export default function OfflineBadge() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline  = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online',  goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online',  goOnline)
    }
  }, [])

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[480px]"
        >
          <div className="flex items-center gap-2 justify-center bg-amber-900/95 border-b border-amber-700 py-2 px-4 text-amber-200 text-xs font-semibold">
            <WifiOff size={13} />
            Offline mode — meal data still available
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
