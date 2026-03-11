/**
 * ErrorBoundary.jsx
 * Catches runtime errors anywhere in the tree.
 * Shows a friendly recovery UI instead of a blank white screen.
 */
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-6 text-center gap-4">
        <span className="text-5xl">⚠️</span>
        <h1 className="text-white font-bold text-xl">Something went wrong</h1>
        <p className="text-gray-500 text-sm max-w-xs">
          NutriFit hit an unexpected error. Your data is safe — tap below to reload.
        </p>
        {this.state.error?.message && (
          <p className="text-xs text-gray-700 font-mono bg-gray-900 px-3 py-2 rounded-xl max-w-xs break-all">
            {this.state.error.message}
          </p>
        )}
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-2xl transition-colors"
        >
          Reload App
        </button>
      </div>
    )
  }
}
