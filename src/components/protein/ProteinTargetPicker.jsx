/**
 * ProteinTargetPicker.jsx
 * Reusable protein target input — used in Onboarding Step 3 and MorningCheckin.
 * Slider (30–200g) + 3 preset buttons + manual input.
 */
import { useState } from 'react'

const PRESETS = [
  { label: 'Light',   value: 40,  sub: '40g' },
  { label: 'Regular', value: 80,  sub: '80g' },
  { label: 'Beast',   value: 150, sub: '150g' },
]

/**
 * @param {{ value: number, onChange: (v:number)=>void, recommended?: number }} props
 */
export default function ProteinTargetPicker({ value, onChange, recommended }) {
  const [inputMode, setInputMode] = useState(false)
  const [raw, setRaw] = useState(String(value))

  function clamp(v) {
    return Math.min(200, Math.max(30, v))
  }

  function handleSlider(e) {
    const v = clamp(Number(e.target.value))
    setRaw(String(v))
    onChange(v)
  }

  function handlePreset(v) {
    setRaw(String(v))
    onChange(v)
    setInputMode(false)
  }

  function handleManualBlur() {
    const v = clamp(Number(raw) || value)
    setRaw(String(v))
    onChange(v)
    setInputMode(false)
  }

  const pct = ((value - 30) / (200 - 30)) * 100

  return (
    <div className="space-y-4">
      {/* Big value display */}
      <div className="flex items-end justify-center gap-2">
        {inputMode ? (
          <input
            autoFocus
            type="number"
            min={30}
            max={200}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onBlur={handleManualBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleManualBlur()}
            className="w-28 text-center text-5xl font-black text-violet-400 bg-transparent border-b-2 border-violet-500 focus:outline-none"
          />
        ) : (
          <button
            onClick={() => { setInputMode(true); setRaw(String(value)) }}
            className="text-5xl font-black text-violet-400 tabular-nums leading-none"
          >
            {value}
          </button>
        )}
        <span className="text-2xl font-semibold text-gray-400 mb-1">g</span>
      </div>

      {recommended && (
        <p className="text-center text-xs text-gray-500">
          Recommended for your profile:{' '}
          <button
            className="text-violet-400 font-medium underline underline-offset-2"
            onClick={() => handlePreset(recommended)}
          >
            {recommended}g
          </button>
        </p>
      )}

      {/* Slider */}
      <div className="relative px-1">
        <style>{`
          .protein-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 22px; height: 22px;
            border-radius: 50%;
            background: #8b5cf6;
            cursor: pointer;
            box-shadow: 0 0 0 3px rgba(139,92,246,0.25);
          }
          .protein-slider::-moz-range-thumb {
            width: 22px; height: 22px;
            border-radius: 50%;
            background: #8b5cf6;
            cursor: pointer;
            border: none;
          }
          .protein-slider::-webkit-slider-runnable-track {
            height: 6px; border-radius: 3px;
            background: linear-gradient(
              to right,
              #8b5cf6 0%, #8b5cf6 ${pct}%,
              #1f1b2e ${pct}%, #1f1b2e 100%
            );
          }
          .protein-slider::-moz-range-track {
            height: 6px; border-radius: 3px;
            background: #1f1b2e;
          }
          .protein-slider::-moz-range-progress {
            background: #8b5cf6; height: 6px; border-radius: 3px;
          }
        `}</style>
        <input
          type="range"
          min={30}
          max={200}
          step={1}
          value={value}
          onChange={handleSlider}
          className="protein-slider w-full appearance-none bg-transparent cursor-pointer focus:outline-none"
        />
        <div className="flex justify-between text-[11px] text-gray-600 mt-1 px-0.5">
          <span>30g</span>
          <span>200g</span>
        </div>
      </div>

      {/* Preset buttons */}
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((p) => {
          const active = value === p.value
          return (
            <button
              key={p.label}
              onClick={() => handlePreset(p.value)}
              className={`py-2 rounded-xl text-sm font-semibold transition-all border ${
                active
                  ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-violet-600 hover:text-violet-300'
              }`}
            >
              <div>{p.label}</div>
              <div className={`text-[11px] font-normal ${active ? 'text-violet-200' : 'text-gray-500'}`}>{p.sub}</div>
            </button>
          )
        })}
      </div>

      <p className="text-center text-xs text-gray-600">
        Tap the number to type a custom value
      </p>
    </div>
  )
}
