/**
 * SkeletonCard.jsx
 * Pulse-animated placeholder shown while meals are generating.
 */
export function MealCardSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-0.5 w-full bg-gray-800" />
      <div className="px-4 pt-3.5 pb-4 space-y-3">
        {/* Label + time */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-700" />
          <div className="h-3 w-20 bg-gray-800 rounded-full" />
          <div className="h-3 w-12 bg-gray-800 rounded-full" />
        </div>
        {/* Meal name */}
        <div className="h-4 w-3/4 bg-gray-800 rounded-full" />
        {/* Protein bar */}
        <div className="h-5 w-full bg-gray-800 rounded-lg" />
        {/* Stats row */}
        <div className="flex gap-3">
          <div className="h-3 w-14 bg-gray-800 rounded-full" />
          <div className="h-3 w-12 bg-gray-800 rounded-full" />
          <div className="h-3 w-12 bg-gray-800 rounded-full" />
        </div>
        {/* Buttons */}
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-gray-800 rounded-xl" />
          <div className="h-8 w-16 bg-gray-800 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function RingSkeleton({ size = 220 }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-violet-950/40 animate-pulse flex items-center justify-center"
    >
      <div className="text-center space-y-1">
        <div className="h-10 w-20 bg-violet-900/60 rounded-full mx-auto" />
        <div className="h-3 w-16 bg-gray-800 rounded-full mx-auto" />
      </div>
    </div>
  )
}
