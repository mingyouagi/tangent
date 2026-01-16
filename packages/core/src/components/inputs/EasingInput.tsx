import { useState } from 'react'

interface EasingInputProps {
  value: string
  onChange: (value: string) => void
}

const PRESET_EASINGS = [
  { name: 'linear', value: 'linear' },
  { name: 'ease', value: 'ease' },
  { name: 'ease-in', value: 'ease-in' },
  { name: 'ease-out', value: 'ease-out' },
  { name: 'ease-in-out', value: 'ease-in-out' },
  { name: 'spring', value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
  { name: 'bounce', value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
]

const BEZIER_REGEX = /cubic-bezier\(\s*([\d.]+)\s*,\s*([-\d.]+)\s*,\s*([\d.]+)\s*,\s*([-\d.]+)\s*\)/

function parseBezier(value: string): [number, number, number, number] | null {
  const match = value.match(BEZIER_REGEX)
  if (match) {
    return [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]), parseFloat(match[4])]
  }
  // Map named easings to bezier
  const namedMap: Record<string, [number, number, number, number]> = {
    'linear': [0, 0, 1, 1],
    'ease': [0.25, 0.1, 0.25, 1],
    'ease-in': [0.42, 0, 1, 1],
    'ease-out': [0, 0, 0.58, 1],
    'ease-in-out': [0.42, 0, 0.58, 1],
  }
  return namedMap[value] || null
}

function bezierToString(p: [number, number, number, number]): string {
  return `cubic-bezier(${p[0]}, ${p[1]}, ${p[2]}, ${p[3]})`
}

export function EasingInput({ value, onChange }: EasingInputProps) {
  const [showEditor, setShowEditor] = useState(false)
  const bezier = parseBezier(value) || [0.25, 0.1, 0.25, 1]

  const handlePresetClick = (preset: string) => {
    onChange(preset)
    setShowEditor(false)
  }

  const handleBezierChange = (index: number, newValue: number) => {
    const newBezier: [number, number, number, number] = [...bezier]
    newBezier[index] = Math.round(newValue * 100) / 100
    onChange(bezierToString(newBezier))
  }

  const getPreviewPath = () => {
    const [x1, y1, x2, y2] = bezier
    const width = 60
    const height = 40
    const padding = 4
    
    const startX = padding
    const startY = height - padding
    const endX = width - padding
    const endY = padding
    
    const cp1x = startX + (endX - startX) * x1
    const cp1y = startY - (startY - endY) * y1
    const cp2x = startX + (endX - startX) * x2
    const cp2y = startY - (startY - endY) * y2
    
    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`
  }

  return (
    <div style={styles.container}>
      <button style={styles.previewButton} onClick={() => setShowEditor(!showEditor)}>
        <svg width="60" height="40" style={styles.previewSvg}>
          <path d={getPreviewPath()} stroke="#00ff9f" strokeWidth="2" fill="none" />
          <circle cx="4" cy="36" r="2" fill="#00ff9f" />
          <circle cx="56" cy="4" r="2" fill="#00ff9f" />
        </svg>
      </button>
      
      {showEditor && (
        <div style={styles.dropdown}>
          <div style={styles.presets}>
            {PRESET_EASINGS.map(preset => (
              <button
                key={preset.name}
                style={{
                  ...styles.presetButton,
                  backgroundColor: value === preset.value ? 'rgba(0, 255, 159, 0.2)' : 'transparent',
                }}
                onClick={() => handlePresetClick(preset.value)}
              >
                {preset.name}
              </button>
            ))}
          </div>
          
          <div style={styles.sliders}>
            <div style={styles.sliderRow}>
              <span style={styles.sliderLabel}>x1</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={bezier[0]}
                onChange={(e) => handleBezierChange(0, parseFloat(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.sliderValue}>{bezier[0]}</span>
            </div>
            <div style={styles.sliderRow}>
              <span style={styles.sliderLabel}>y1</span>
              <input
                type="range"
                min="-0.5"
                max="1.5"
                step="0.01"
                value={bezier[1]}
                onChange={(e) => handleBezierChange(1, parseFloat(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.sliderValue}>{bezier[1]}</span>
            </div>
            <div style={styles.sliderRow}>
              <span style={styles.sliderLabel}>x2</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={bezier[2]}
                onChange={(e) => handleBezierChange(2, parseFloat(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.sliderValue}>{bezier[2]}</span>
            </div>
            <div style={styles.sliderRow}>
              <span style={styles.sliderLabel}>y2</span>
              <input
                type="range"
                min="-0.5"
                max="1.5"
                step="0.01"
                value={bezier[3]}
                onChange={(e) => handleBezierChange(3, parseFloat(e.target.value))}
                style={styles.slider}
              />
              <span style={styles.sliderValue}>{bezier[3]}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    flex: 1,
  },
  previewButton: {
    width: '100%',
    padding: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(0, 255, 159, 0.2)',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
  },
  previewSvg: {
    display: 'block',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    padding: '8px',
    backgroundColor: 'rgba(20, 20, 28, 0.98)',
    border: '1px solid rgba(0, 255, 159, 0.3)',
    borderRadius: '8px',
    zIndex: 10,
  },
  presets: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(0, 255, 159, 0.1)',
  },
  presetButton: {
    padding: '4px 8px',
    fontSize: '10px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(0, 255, 159, 0.2)',
    borderRadius: '4px',
    color: '#ccc',
    cursor: 'pointer',
  },
  sliders: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sliderLabel: {
    width: '20px',
    fontSize: '10px',
    color: '#888',
  },
  slider: {
    flex: 1,
    height: '4px',
    appearance: 'none',
    background: 'linear-gradient(90deg, #00ff9f, #00d4ff)',
    borderRadius: '2px',
    cursor: 'pointer',
    accentColor: '#00ff9f',
  },
  sliderValue: {
    width: '36px',
    fontSize: '10px',
    color: '#888',
    textAlign: 'right',
  },
}
