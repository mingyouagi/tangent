import { useState, useEffect, useCallback } from 'react'

interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 1,
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    if (!isNaN(newValue)) {
      setLocalValue(newValue)
      onChange(newValue)
    }
  }

  const adjustValue = useCallback((delta: number) => {
    const newValue = Math.min(max, Math.max(min, localValue + delta))
    setLocalValue(newValue)
    onChange(newValue)
  }, [localValue, min, max, onChange])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        adjustValue(e.shiftKey ? 10 : 1)
        break
      case 'ArrowDown':
        e.preventDefault()
        adjustValue(e.shiftKey ? -10 : -1)
        break
    }
  }

  return (
    <div style={styles.container}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={localValue}
        onChange={handleSliderChange}
        onKeyDown={handleKeyDown}
        style={styles.slider}
      />
      <input
        type="number"
        value={localValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        style={styles.input}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
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
  input: {
    width: '50px',
    padding: '4px 6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(0, 255, 159, 0.2)',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '11px',
    textAlign: 'right',
    fontFamily: 'inherit',
  },
}
